/**
 * @file src/calculators/v2/board-cutting.ts
 *
 * Board cutting optimiser — plans how to cut a list of required parts out
 * of standard sheets using guillotine-friendly shelf packing (first-fit
 * decreasing height): parts sort largest-first, each sheet fills up as
 * horizontal shelves, and every layout can be cut with straight
 * edge-to-edge passes.
 *
 * The saw kerf (blade width) is added around every part so the plan
 * survives contact with a real saw.
 */

import type { BillOfMaterials } from './types';
import { units } from './types';

export interface SheetFormat {
    id: string;
    label: string;
    productName: string;
    wMm: number;
    hMm: number;
    /** Default kerf: 0 for score-and-snap boards, 3 mm for sawn sheets. */
    defaultKerfMm: number;
}

export const SHEET_FORMATS: SheetFormat[] = [
    {
        id: 'plasterboard',
        label: 'Plasterboard',
        productName: 'Gyproc WallBoard, 12.5 mm',
        wMm: 1200,
        hMm: 2400,
        defaultKerfMm: 0,
    },
    {
        id: 'plywood',
        label: 'Plywood',
        productName: 'Hardwood-faced plywood, 18 mm',
        wMm: 1220,
        hMm: 2440,
        defaultKerfMm: 3,
    },
    {
        id: 'osb',
        label: 'OSB3',
        productName: 'OSB3 board, 18 mm',
        wMm: 1220,
        hMm: 2440,
        defaultKerfMm: 3,
    },
    {
        id: 'mdf',
        label: 'MDF',
        productName: 'MDF board, 18 mm',
        wMm: 1220,
        hMm: 2440,
        defaultKerfMm: 3,
    },
];

export interface RequiredPart {
    id: string;
    wMm: number;
    hMm: number;
    qty: number;
}

export interface CuttingInput {
    sheetId: string;
    parts: RequiredPart[];
    /** Parts may rotate 90° (turn off when grain/face direction matters). */
    allowRotation: boolean;
}

export interface PlacedPart {
    xMm: number;
    yMm: number;
    wMm: number;
    hMm: number;
    rotated: boolean;
    /** "800×600" style label for the preview. */
    label: string;
}

export interface SheetLayout {
    parts: PlacedPart[];
    /** Used area as a fraction of the sheet. */
    utilisation: number;
}

export interface CuttingPlan {
    sheet: SheetFormat;
    kerfMm: number;
    layouts: SheetLayout[];
    placedCount: number;
    /** Parts too big for the sheet in any orientation. */
    unplaceable: RequiredPart[];
    /** Overall utilisation across all sheets. */
    utilisation: number;
    wasteM2: number;
}

interface Shelf {
    yMm: number;
    heightMm: number;
    usedWMm: number;
}

interface WorkingSheet {
    shelves: Shelf[];
    nextShelfY: number;
    parts: PlacedPart[];
}

const MAX_INSTANCES = 300;

export function planCutting(input: CuttingInput): CuttingPlan {
    const sheet = SHEET_FORMATS.find((s) => s.id === input.sheetId) ?? SHEET_FORMATS[0];
    const kerf = sheet.defaultKerfMm;

    // Expand quantities into individual instances, largest first (FFDH).
    const instances: Array<{ w: number; h: number; src: RequiredPart }> = [];
    const unplaceable: RequiredPart[] = [];
    for (const p of input.parts) {
        if (p.wMm <= 0 || p.hMm <= 0 || p.qty <= 0) continue;
        const fitsAsIs = p.wMm <= sheet.wMm && p.hMm <= sheet.hMm;
        const fitsRotated = input.allowRotation && p.hMm <= sheet.wMm && p.wMm <= sheet.hMm;
        if (!fitsAsIs && !fitsRotated) {
            unplaceable.push(p);
            continue;
        }
        for (let i = 0; i < Math.min(p.qty, MAX_INSTANCES); i++) {
            instances.push({ w: p.wMm, h: p.hMm, src: p });
        }
    }
    instances.sort(
        (a, b) => Math.max(b.w, b.h) - Math.max(a.w, a.h) || b.w * b.h - a.w * a.h,
    );

    const sheets: WorkingSheet[] = [];

    /** Try to place (w, h) on an existing shelf; returns best-fit slot. */
    const placeOnShelf = (w: number, h: number): { s: WorkingSheet; shelf: Shelf; waste: number } | null => {
        let best: { s: WorkingSheet; shelf: Shelf; waste: number } | null = null;
        for (const s of sheets) {
            for (const shelf of s.shelves) {
                const xNeeded = shelf.usedWMm + (shelf.usedWMm > 0 ? kerf : 0) + w;
                if (h <= shelf.heightMm && xNeeded <= sheet.wMm) {
                    const waste = shelf.heightMm - h;
                    if (!best || waste < best.waste) best = { s, shelf, waste };
                }
            }
        }
        return best;
    };

    for (const inst of instances.slice(0, MAX_INSTANCES)) {
        const orientations: Array<{ w: number; h: number; rotated: boolean }> = [
            { w: inst.w, h: inst.h, rotated: false },
        ];
        if (input.allowRotation && inst.w !== inst.h) {
            orientations.push({ w: inst.h, h: inst.w, rotated: true });
        }

        // 1. Best fit on any existing shelf, across both orientations.
        let placed = false;
        let bestShelf: { o: (typeof orientations)[0]; slot: NonNullable<ReturnType<typeof placeOnShelf>> } | null = null;
        for (const o of orientations) {
            const slot = placeOnShelf(o.w, o.h);
            if (slot && (!bestShelf || slot.waste < bestShelf.slot.waste)) {
                bestShelf = { o, slot };
            }
        }
        if (bestShelf) {
            const { o, slot } = bestShelf;
            const x = slot.shelf.usedWMm + (slot.shelf.usedWMm > 0 ? kerf : 0);
            slot.s.parts.push({
                xMm: x,
                yMm: slot.shelf.yMm,
                wMm: o.w,
                hMm: o.h,
                rotated: o.rotated,
                label: `${inst.w}×${inst.h}`,
            });
            slot.shelf.usedWMm = x + o.w;
            placed = true;
        }

        // 2. Open a new shelf on an existing sheet — flattest orientation first.
        if (!placed) {
            const byHeight = [...orientations].sort((a, b) => a.h - b.h);
            for (const s of sheets) {
                for (const o of byHeight) {
                    const y = s.nextShelfY + (s.shelves.length > 0 ? kerf : 0);
                    if (o.w <= sheet.wMm && y + o.h <= sheet.hMm) {
                        const shelf: Shelf = { yMm: y, heightMm: o.h, usedWMm: o.w };
                        s.shelves.push(shelf);
                        s.nextShelfY = y + o.h;
                        s.parts.push({
                            xMm: 0,
                            yMm: y,
                            wMm: o.w,
                            hMm: o.h,
                            rotated: o.rotated,
                            label: `${inst.w}×${inst.h}`,
                        });
                        placed = true;
                        break;
                    }
                }
                if (placed) break;
            }
        }

        // 3. Start a new sheet.
        if (!placed) {
            const byHeight = [...orientations].sort((a, b) => a.h - b.h);
            const o = byHeight.find((c) => c.w <= sheet.wMm && c.h <= sheet.hMm)!;
            const s: WorkingSheet = {
                shelves: [{ yMm: 0, heightMm: o.h, usedWMm: o.w }],
                nextShelfY: o.h,
                parts: [
                    { xMm: 0, yMm: 0, wMm: o.w, hMm: o.h, rotated: o.rotated, label: `${inst.w}×${inst.h}` },
                ],
            };
            sheets.push(s);
        }
    }

    const sheetArea = sheet.wMm * sheet.hMm;
    const layouts: SheetLayout[] = sheets.map((s) => ({
        parts: s.parts,
        utilisation: s.parts.reduce((sum, p) => sum + p.wMm * p.hMm, 0) / sheetArea,
    }));
    const usedArea = layouts.reduce((sum, l) => sum + l.utilisation * sheetArea, 0);
    const totalArea = layouts.length * sheetArea;

    return {
        sheet,
        kerfMm: kerf,
        layouts,
        placedCount: layouts.reduce((sum, l) => sum + l.parts.length, 0),
        unplaceable,
        utilisation: totalArea > 0 ? usedArea / totalArea : 0,
        wasteM2: (totalArea - usedArea) / 1e6,
    };
}

export function calculateCutting(input: CuttingInput): BillOfMaterials {
    const plan = planCutting(input);
    const isPb = plan.sheet.id === 'plasterboard';

    return {
        facts: [
            { label: 'Parts to cut', value: `${plan.placedCount}` },
            { label: 'Sheets needed', value: `${plan.layouts.length}` },
            { label: 'Material used', value: `${Math.round(plan.utilisation * 100)}%` },
            { label: 'Off-cut waste', value: `${plan.wasteM2.toFixed(2)} m²` },
        ],
        sections: [
            {
                title: 'Sheets',
                lines: [
                    {
                        id: 'sheets',
                        name: plan.sheet.productName,
                        detail: `${plan.sheet.wMm} × ${plan.sheet.hMm} mm — cutting plan opposite`,
                        qty: units(plan.layouts.length),
                        unit: 'sheets',
                    },
                ],
            },
        ],
        tools: [
            isPb
                ? 'Sharp utility knife and a straight edge — score the face, snap, cut the back paper'
                : 'Circular saw or track saw with a guide rail — fine-tooth blade for clean faces',
            isPb ? 'Drywall rasp to clean up snapped edges' : 'Sawhorses or a cutting table with sacrificial battens',
            'Tape measure, pencil and a marking square',
            isPb ? 'Pad saw for cut-outs' : 'Clamps for the guide rail, and dust extraction or an FFP2 mask',
            'Masking tape to label each part as it comes off the sheet',
            'Offcut pile kept flat — the optimiser already counted them as spare',
        ],
        notes: [
            `Layouts are guillotine-friendly shelf cuts — every line runs straight across, the way a panel saw (or a track saw) actually cuts.`,
            plan.kerfMm > 0
                ? `A ${plan.kerfMm} mm saw kerf is allowed between every part.`
                : 'Score-and-snap board: no kerf allowance needed.',
            input.allowRotation
                ? 'Parts may be rotated 90° — turn rotation off if grain or face pattern direction matters.'
                : 'Rotation is off — parts keep their orientation for grain or face direction.',
            ...(plan.unplaceable.length
                ? [
                      `⚠ ${plan.unplaceable.length} part size${plan.unplaceable.length === 1 ? '' : 's'} (${plan.unplaceable
                          .map((p) => `${p.wMm}×${p.hMm}`)
                          .join(', ')}) won't fit this sheet in any orientation.`,
                  ]
                : []),
        ],
    };
}
