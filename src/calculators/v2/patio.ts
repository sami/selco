/**
 * @file src/calculators/v2/patio.ts
 *
 * Patio & paving estimator.
 *
 * Standard build-up for a domestic patio on a full mortar bed:
 *   - 100 mm compacted MOT Type 1 sub-base
 *   - 30 mm sand/cement mortar bed (5:1)
 *   - slabs at the chosen format, 10 mm joints
 *   - brush-in jointing compound
 */

import type { BillOfMaterials, BomLine } from './types';
import { fmtM2, units } from './types';

export interface SlabFormat {
    id: string;
    label: string;
    wMm: number;
    hMm: number;
    price: number;
}

export const SLAB_FORMATS: SlabFormat[] = [
    { id: '450', label: '450 × 450 mm', wMm: 450, hMm: 450, price: 4.8 },
    { id: '600', label: '600 × 600 mm', wMm: 600, hMm: 600, price: 9.5 },
    { id: '900x600', label: '900 × 600 mm', wMm: 900, hMm: 600, price: 14.5 },
];

export interface PatioInput {
    widthM: number;
    lengthM: number;
    slabId: string;
    /** Cutting waste percentage (5–10 typical). */
    wastePct: number;
    includeSubBase: boolean;
    includeEdging: boolean;
}

const JOINT_MM = 10;
const MORTAR_BED_M = 0.03;
const SUBBASE_M = 0.1;

export interface PatioPlan {
    areaM2: number;
    slab: SlabFormat;
    /** Slabs per row / column at module size (slab + joint). */
    cols: number;
    rows: number;
    slabs: number;
}

export function planPatio(input: PatioInput): PatioPlan {
    const slab = SLAB_FORMATS.find((s) => s.id === input.slabId) ?? SLAB_FORMATS[1];
    const moduleW = (slab.wMm + JOINT_MM) / 1000;
    const moduleH = (slab.hMm + JOINT_MM) / 1000;
    const cols = Math.max(1, Math.ceil(input.widthM / moduleW));
    const rows = Math.max(1, Math.ceil(input.lengthM / moduleH));
    const areaM2 = input.widthM * input.lengthM;
    const slabs = units(cols * rows * (1 + input.wastePct / 100));
    return { areaM2, slab, cols, rows, slabs };
}

export function calculatePatio(input: PatioInput): BillOfMaterials {
    const plan = planPatio(input);
    const a = plan.areaM2;

    // Mortar bed: 30 mm over the area at ~2.1 t/m³ wet → split 5:1 by volume.
    const mortarVolM3 = a * MORTAR_BED_M;
    const sandT = mortarVolM3 * 1.7; // sharp sand tonnage incl. bulking
    const cementBags = units((mortarVolM3 / 5) * 1400 / 25); // ~1400 kg/m³ cement

    const lines: BomLine[] = [
        {
            id: 'slabs',
            name: `Paving slab, ${plan.slab.label}`,
            detail: `${plan.cols} × ${plan.rows} grid + ${input.wastePct}% cuts`,
            qty: plan.slabs,
            unit: 'slabs',
            unitPrice: plan.slab.price,
        },
        {
            id: 'sharp-sand',
            name: 'Sharp sand',
            detail: 'bulk bag (~850 kg) — 30 mm bed',
            qty: units((sandT * 1000) / 850),
            unit: 'bulk bags',
            unitPrice: 48.0,
        },
        {
            id: 'cement',
            name: 'Cement',
            detail: '25 kg bag — 5:1 bed mix',
            qty: cementBags,
            unit: 'bags',
            unitPrice: 5.8,
        },
        {
            id: 'jointing',
            name: 'Brush-in jointing compound',
            detail: '15 kg tub — covers ~12 m²',
            qty: units(a / 12),
            unit: 'tubs',
            unitPrice: 22.0,
        },
        {
            id: 'primer',
            name: 'Slurry primer',
            detail: '5 kg — bonds slab to bed',
            qty: units(a / 15),
            unit: 'tubs',
            unitPrice: 18.0,
        },
    ];

    if (input.includeSubBase) {
        lines.splice(1, 0, {
            id: 'mot',
            name: 'MOT Type 1 sub-base',
            detail: 'bulk bag (~850 kg) — 100 mm compacted',
            qty: units((a * SUBBASE_M * 2200) / 850),
            unit: 'bulk bags',
            unitPrice: 52.0,
        });
    }

    if (input.includeEdging) {
        const perimeterM = 2 * (input.widthM + input.lengthM);
        lines.push({
            id: 'edging',
            name: 'Concrete edging stone',
            detail: '915 × 150 × 50 mm',
            qty: units(perimeterM / 0.915),
            unit: 'stones',
            unitPrice: 3.8,
        });
    }

    return {
        facts: [
            { label: 'Patio area', value: fmtM2(a) },
            { label: 'Slab format', value: plan.slab.label },
            { label: 'Grid', value: `${plan.cols} × ${plan.rows} slabs` },
            { label: 'Total slabs', value: `${plan.slabs} inc. waste` },
        ],
        sections: [{ title: 'Paving', lines }],
        notes: [
            'Build-up: 100 mm compacted MOT Type 1, 30 mm full mortar bed (5:1), 10 mm joints.',
            'Fall of 1:80 away from the house assumed — adjust dig depth accordingly.',
            'Excavation roughly 175 mm below finished level; allow for muck-away.',
        ],
    };
}
