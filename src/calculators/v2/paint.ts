/**
 * @file src/calculators/v2/paint.ts
 *
 * Paint & decorating estimator.
 *
 * Walls and ceiling are measured from room dimensions; standard openings
 * (doors ~1.6 m², windows ~1.4 m²) are deducted from the wall area. Paint
 * coverage is taken at 12 m² per litre per coat for emulsion on a sealed
 * surface, with tins recommended as a 5 L / 2.5 L mix that minimises
 * leftover paint.
 */

import type { BillOfMaterials, BomLine } from './types';
import { fmtM2, units } from './types';

export interface PaintInput {
    lengthM: number;
    widthM: number;
    heightM: number;
    doors: number;
    windows: number;
    coats: number;
    paintWalls: boolean;
    paintCeiling: boolean;
    /** Glossing for door frames / skirting. */
    paintWoodwork: boolean;
    /** Bare plaster needs a mist coat and drinks more paint. */
    barePlaster: boolean;
}

export interface PaintAreas {
    wallM2: number;
    ceilingM2: number;
    deductionsM2: number;
    /** Litres needed per surface, after coats multiplier. */
    wallLitres: number;
    ceilingLitres: number;
}

const DOOR_M2 = 1.6;
const WINDOW_M2 = 1.4;
const COVERAGE_M2_PER_L = 12;
/** Bare plaster soaks up roughly 20 % more paint, plus the mist coat. */
const BARE_PLASTER_FACTOR = 1.2;

export function paintAreas(input: PaintInput): PaintAreas {
    const perimeter = 2 * (input.lengthM + input.widthM);
    const grossWall = perimeter * input.heightM;
    const deductions = input.doors * DOOR_M2 + input.windows * WINDOW_M2;
    const wallM2 = Math.max(0, grossWall - deductions);
    const ceilingM2 = input.lengthM * input.widthM;
    const soak = input.barePlaster ? BARE_PLASTER_FACTOR : 1;

    return {
        wallM2,
        ceilingM2,
        deductionsM2: deductions,
        wallLitres: input.paintWalls
            ? ((wallM2 * input.coats) / COVERAGE_M2_PER_L) * soak
            : 0,
        ceilingLitres: input.paintCeiling
            ? ((ceilingM2 * input.coats) / COVERAGE_M2_PER_L) * soak
            : 0,
    };
}

/** Pick the cheapest 5 L / 2.5 L tin combination covering `litres`. */
export function tinsFor(litres: number): { five: number; twoFive: number } {
    if (litres <= 0) return { five: 0, twoFive: 0 };
    const five = Math.floor(litres / 5);
    const rem = litres - five * 5;
    if (rem === 0) return { five, twoFive: 0 };
    // Remainder: one 2.5 L tin if it fits, otherwise round up to another 5 L
    // (two 2.5 L tins cost more than one 5 L).
    return rem <= 2.5 ? { five, twoFive: 1 } : { five: five + 1, twoFive: 0 };
}

export function calculatePaint(input: PaintInput): BillOfMaterials {
    const areas = paintAreas(input);

    const lines: BomLine[] = [];

    if (input.paintWalls) {
        const tins = tinsFor(areas.wallLitres);
        if (tins.five)
            lines.push({
                id: 'wall-5l',
                name: 'Leyland Trade Vinyl Matt — walls',
                detail: '5 L tin, 12 m²/L per coat',
                qty: tins.five,
                unit: 'tins',
            });
        if (tins.twoFive)
            lines.push({
                id: 'wall-2.5l',
                name: 'Leyland Trade Vinyl Matt — walls',
                detail: '2.5 L tin',
                qty: tins.twoFive,
                unit: 'tins',
            });
    }

    if (input.paintCeiling) {
        const tins = tinsFor(areas.ceilingLitres);
        if (tins.five)
            lines.push({
                id: 'ceiling-5l',
                name: 'Leyland Trade Contract Matt — ceiling white',
                detail: '5 L tin',
                qty: tins.five,
                unit: 'tins',
            });
        if (tins.twoFive)
            lines.push({
                id: 'ceiling-2.5l',
                name: 'Leyland Trade Contract Matt — ceiling white',
                detail: '2.5 L tin',
                qty: tins.twoFive,
                unit: 'tins',
            });
    }

    if (input.paintWoodwork) {
        // Rough rule: 0.75 L of gloss + undercoat covers a door + frame +
        // skirting share, so a small room needs one tin of each.
        const woodLitres = input.doors * 0.5 + 0.25;
        lines.push(
            {
                id: 'undercoat',
                name: 'Dulux Trade Undercoat',
                detail: '750 ml tin',
                qty: units(woodLitres / 0.75),
                unit: 'tins',
            },
            {
                id: 'gloss',
                name: 'Dulux Trade Gloss / Satinwood',
                detail: '750 ml tin',
                qty: units(woodLitres / 0.75),
                unit: 'tins',
            },
        );
    }

    const sundries: BomLine[] = [
        {
            id: 'roller',
            name: 'Harris Trade roller & tray set',
            detail: '9" medium pile + 2 sleeves',
            qty: 1,
            unit: 'sets',
        },
        {
            id: 'brushes',
            name: 'Harris Trade brush set',
            detail: '1" / 2" / 3" cutting-in',
            qty: 1,
            unit: 'sets',
        },
        {
            id: 'tape',
            name: 'Low-tack masking tape',
            detail: '38 mm × 50 m',
            qty: 1,
            unit: 'rolls',
        },
        {
            id: 'sheets',
            name: 'Cotton twill dust sheets',
            detail: 'cotton twill 12\' × 9\'',
            qty: 2,
            unit: 'sheets',
        },
    ];

    const totalLitres = areas.wallLitres + areas.ceilingLitres;

    return {
        facts: [
            { label: 'Wall area', value: fmtM2(areas.wallM2) },
            { label: 'Ceiling area', value: fmtM2(areas.ceilingM2) },
            { label: 'Openings deducted', value: fmtM2(areas.deductionsM2) },
            { label: 'Paint needed', value: `${totalLitres.toFixed(1)} L (${input.coats} coats)` },
        ],
        sections: [
            { title: 'Paint', lines },
            { title: 'Sundries', lines: sundries },
        ],
        tools: [
            'Filler and filling knife — Toupret or Easi-Fill for cracks and dents',
            'Fine surface sandpaper (120/180 grit) and sanding block',
            'Caulk gun + Everbuild decorators caulk for gaps at skirting and frames',
            'Sugar soap for washing down previously painted surfaces',
            'Step ladder and roller extension pole for ceilings',
            'Rags and a paint kettle for cutting in',
        ],
        notes: [
            `Coverage taken at ${COVERAGE_M2_PER_L} m² per litre per coat.`,
            input.barePlaster
                ? 'Bare plaster: allow a watered-down mist coat first — usage upped by 20%.'
                : 'Assumes previously painted, sound surfaces.',
            'Standard openings deducted: doors 1.6 m², windows 1.4 m².',
        ],
    };
}
