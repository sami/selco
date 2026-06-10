/**
 * @file src/calculators/v2/board-cutting.ts
 *
 * Board cutting optimiser — plans how to cut a list of required parts out
 * of standard sheets using guillotine-friendly shelf packing (first-fit
 * decreasing height), modelled on SELCO's in-store cutting service.
 *
 * In-store service (vertical panel saw, straight cuts only):
 *   - cuttable: hardboard, chipboard, OSB, MDF, kitchen worktops, plywood,
 *     sundeala, door blanks, pegboard, T&G flooring — bought in store
 *   - NOT cuttable: plasterboard, doors, fence panels, thick structural timber
 *   - blade kerf: 3 mm, allowed between every part in the plan
 *   - min workpiece: 500 × 230 mm (with support fitted) / 500 × 400 without
 *   - max workpiece: 3100 × 1644 mm, max depth 60 mm
 *
 * Smaller parts still appear in the plan — they're flagged to be cut
 * oversize in store and trimmed at home.
 */

import type { BillOfMaterials } from './types';
import { units } from './types';

/** SELCO in-store vertical panel saw limits. */
export const PANEL_SAW = {
    kerfMm: 3,
    minLMm: 500,
    minHFittedMm: 230,
    minHMm: 400,
    maxLMm: 3100,
    maxHMm: 1644,
    maxDepthMm: 60,
} as const;

export interface SheetFormat {
    id: string;
    label: string;
    productName: string;
    wMm: number;
    hMm: number;
    thicknessMm: number;
    /** Eligible for the in-store panel saw service. */
    sawEligible: boolean;
    /**
     * Cross-cuts to length only — no rips along the length (postformed
     * worktops: a lengthways rip would remove the bullnose edge and is
     * not offered in store). Every part consumes the full sheet width.
     */
    crossCutOnly?: boolean;
}

export const SHEET_FORMATS: SheetFormat[] = [
    { id: 'plywood', label: 'Plywood 2440 × 1220 × 18', productName: 'Hardwood-faced plywood, 18 mm', wMm: 1220, hMm: 2440, thicknessMm: 18, sawEligible: true },
    { id: 'mdf', label: 'MDF 2440 × 1220 × 18', productName: 'MDF board, 18 mm', wMm: 1220, hMm: 2440, thicknessMm: 18, sawEligible: true },
    { id: 'osb', label: 'OSB3 2440 × 1220 × 18', productName: 'OSB3 board, 18 mm', wMm: 1220, hMm: 2440, thicknessMm: 18, sawEligible: true },
    { id: 'chipboard', label: 'Chipboard 2440 × 1220 × 18', productName: 'Furniture-grade chipboard, 18 mm', wMm: 1220, hMm: 2440, thicknessMm: 18, sawEligible: true },
    { id: 'hardboard', label: 'Hardboard 2440 × 1220 × 3', productName: 'Standard hardboard, 3 mm', wMm: 1220, hMm: 2440, thicknessMm: 3, sawEligible: true },
    { id: 'worktop', label: 'Worktop 3000 × 600 × 38 (cross-cuts only)', productName: 'Laminate kitchen worktop, 38 mm', wMm: 600, hMm: 3000, thicknessMm: 38, sawEligible: true, crossCutOnly: true },
    { id: 'plasterboard', label: 'Plasterboard 2400 × 1200 × 12.5', productName: 'Gyproc WallBoard, 12.5 mm', wMm: 1200, hMm: 2400, thicknessMm: 12.5, sawEligible: false },
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
    /** Below the in-store saw minimum — cut oversize, trim at home. */
    belowMin: boolean;
    /** Narrower than the full width on a cross-cut-only sheet — the
     *  lengthways trim happens at home, not in store. */
    needsRip: boolean;
    /** "800×600" style label for the preview. */
    label: string;
}

export interface SheetLayout {
    parts: PlacedPart[];
    shelfCount: number;
    /** Used area as a fraction of the sheet. */
    utilisation: number;
}

export interface CuttingPlan {
    sheet: SheetFormat;
    kerfMm: number;
    layouts: SheetLayout[];
    placedCount: number;
    /** Approximate straight saw passes: one rip per shelf + one per part. */
    sawCuts: number;
    /** Placed parts below the 500 × 230 mm in-store minimum. */
    belowMinCount: number;
    /** Parts needing a lengthways trim at home (cross-cut-only sheets). */
    needsRipCount: number;
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

function isBelowSawMin(wMm: number, hMm: number): boolean {
    const long = Math.max(wMm, hMm);
    const short = Math.min(wMm, hMm);
    return long < PANEL_SAW.minLMm || short < PANEL_SAW.minHFittedMm;
}

/**
 * Cross-cut-only packing (worktops): a 1D cutting-stock problem. Every
 * part takes the full sheet width; lengths pack first-fit decreasing into
 * sticks with a kerf between cuts. Parts narrower than the sheet are
 * placed full-width and flagged for a lengthways trim at home.
 */
function planCrossCut(input: CuttingInput, sheet: SheetFormat, kerf: number): CuttingPlan {
    const instances: Array<{ lengthMm: number; crossMm: number; src: RequiredPart }> = [];
    const unplaceable: RequiredPart[] = [];
    for (const p of input.parts) {
        if (p.wMm <= 0 || p.hMm <= 0 || p.qty <= 0) continue;
        const crossMm = Math.min(p.wMm, p.hMm);
        const lengthMm = Math.max(p.wMm, p.hMm);
        if (crossMm > sheet.wMm || lengthMm > sheet.hMm) {
            unplaceable.push(p);
            continue;
        }
        for (let i = 0; i < Math.min(p.qty, MAX_INSTANCES); i++) {
            instances.push({ lengthMm, crossMm, src: p });
        }
    }
    instances.sort((a, b) => b.lengthMm - a.lengthMm);

    const sticks: Array<{ usedLMm: number; parts: PlacedPart[] }> = [];
    for (const inst of instances.slice(0, MAX_INSTANCES)) {
        const needsRip = inst.crossMm < sheet.wMm - 1;
        const belowMin = inst.lengthMm < PANEL_SAW.minHFittedMm;
        const place = (stick: { usedLMm: number; parts: PlacedPart[] }) => {
            const y = stick.usedLMm + (stick.usedLMm > 0 ? kerf : 0);
            stick.parts.push({
                xMm: 0,
                yMm: y,
                wMm: inst.crossMm,
                hMm: inst.lengthMm,
                rotated: false,
                belowMin,
                needsRip,
                label: `${inst.src.wMm}×${inst.src.hMm}`,
            });
            stick.usedLMm = y + inst.lengthMm;
        };
        const fit = sticks.find(
            (s) => s.usedLMm + (s.usedLMm > 0 ? kerf : 0) + inst.lengthMm <= sheet.hMm,
        );
        if (fit) place(fit);
        else {
            const stick = { usedLMm: 0, parts: [] as PlacedPart[] };
            place(stick);
            sticks.push(stick);
        }
    }

    const sheetArea = sheet.wMm * sheet.hMm;
    const layouts: SheetLayout[] = sticks.map((s) => ({
        parts: s.parts,
        shelfCount: s.parts.length,
        utilisation: s.parts.reduce((sum, p) => sum + p.wMm * p.hMm, 0) / sheetArea,
    }));
    const usedArea = layouts.reduce((sum, l) => sum + l.utilisation * sheetArea, 0);
    const totalArea = layouts.length * sheetArea;

    return {
        sheet,
        kerfMm: kerf,
        layouts,
        placedCount: layouts.reduce((sum, l) => sum + l.parts.length, 0),
        sawCuts: layouts.reduce((sum, l) => sum + l.parts.length, 0),
        belowMinCount: layouts.reduce(
            (sum, l) => sum + l.parts.filter((p) => p.belowMin).length,
            0,
        ),
        needsRipCount: layouts.reduce(
            (sum, l) => sum + l.parts.filter((p) => p.needsRip).length,
            0,
        ),
        unplaceable,
        utilisation: totalArea > 0 ? usedArea / totalArea : 0,
        wasteM2: (totalArea - usedArea) / 1e6,
    };
}

export function planCutting(input: CuttingInput): CuttingPlan {
    const sheet = SHEET_FORMATS.find((s) => s.id === input.sheetId) ?? SHEET_FORMATS[0];
    // Plasterboard is score-and-snap at home: no blade, no kerf.
    const kerf = sheet.sawEligible ? PANEL_SAW.kerfMm : 0;

    if (sheet.crossCutOnly) return planCrossCut(input, sheet, kerf);

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
        const belowMin = isBelowSawMin(inst.w, inst.h);
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
                belowMin,
                needsRip: false,
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
                            belowMin,
                            needsRip: false,
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
                    { xMm: 0, yMm: 0, wMm: o.w, hMm: o.h, rotated: o.rotated, belowMin, needsRip: false, label: `${inst.w}×${inst.h}` },
                ],
            };
            sheets.push(s);
        }
    }

    const sheetArea = sheet.wMm * sheet.hMm;
    const layouts: SheetLayout[] = sheets.map((s) => ({
        parts: s.parts,
        shelfCount: s.shelves.length,
        utilisation: s.parts.reduce((sum, p) => sum + p.wMm * p.hMm, 0) / sheetArea,
    }));
    const usedArea = layouts.reduce((sum, l) => sum + l.utilisation * sheetArea, 0);
    const totalArea = layouts.length * sheetArea;

    return {
        sheet,
        kerfMm: kerf,
        layouts,
        placedCount: layouts.reduce((sum, l) => sum + l.parts.length, 0),
        sawCuts: layouts.reduce((sum, l) => sum + l.shelfCount + l.parts.length, 0),
        belowMinCount: layouts.reduce(
            (sum, l) => sum + l.parts.filter((p) => p.belowMin).length,
            0,
        ),
        needsRipCount: 0,
        unplaceable,
        utilisation: totalArea > 0 ? usedArea / totalArea : 0,
        wasteM2: (totalArea - usedArea) / 1e6,
    };
}

export function calculateCutting(input: CuttingInput): BillOfMaterials {
    const plan = planCutting(input);
    const inStore = plan.sheet.sawEligible;

    return {
        facts: [
            { label: 'Parts to cut', value: `${plan.placedCount}` },
            { label: 'Sheets needed', value: `${plan.layouts.length}` },
            {
                label: inStore ? 'Saw cuts' : 'Cutting',
                value: inStore ? `≈ ${plan.sawCuts} straight passes` : 'Score & snap at home',
            },
            { label: 'Material used', value: `${Math.round(plan.utilisation * 100)}%` },
        ],
        sections: [
            {
                title: 'Sheets',
                lines: [
                    {
                        id: 'sheets',
                        name: plan.sheet.productName,
                        detail: `${plan.sheet.wMm} × ${plan.sheet.hMm} × ${plan.sheet.thicknessMm} mm — cutting plan opposite`,
                        qty: units(plan.layouts.length),
                        unit: 'sheets',
                    },
                ],
            },
        ],
        tools: inStore
            ? [
                  'Bring this plan to the counter — sheets bought in store are cut on our vertical panel saw',
                  'Masking tape and a marker to label each part as it comes off the saw',
                  plan.belowMinCount > 0
                      ? 'Fine-tooth handsaw or track saw for trimming the flagged small parts at home'
                      : 'Fine sandpaper or a block plane to ease any cut edges',
                  'Tape measure — check the first cut against your list before the rest run',
                  'A van or roof bars sized for your longest part, not the original sheet',
                  'Offcut pile kept flat — the optimiser already counted them as spare',
              ]
            : [
                  'Sharp utility knife and a straight edge — score the face, snap, cut the back paper',
                  'Drywall rasp to clean up snapped edges',
                  'Tape measure, pencil and a marking square',
                  'Pad saw for cut-outs',
                  'Masking tape to label each part as it comes off the sheet',
                  'Offcut pile kept flat — the optimiser already counted them as spare',
              ],
        notes: [
            inStore
                ? `In-store cutting service: straight cuts on the vertical panel saw with a ${PANEL_SAW.kerfMm} mm blade kerf — allowed for in this plan.`
                : 'Plasterboard is not cut in store — this plan is score-and-snap at home (no kerf needed).',
            ...(plan.sheet.crossCutOnly
                ? [
                      'Worktops are cross-cut to length only — we cannot rip along the length (the postformed front edge would be lost). Every piece comes off at the full 600 mm width.',
                  ]
                : []),
            ...(plan.needsRipCount > 0
                ? [
                      `⚠ ${plan.needsRipCount} piece${plan.needsRipCount === 1 ? ' is' : 's are'} narrower than the full width — cut to length in store, then rip to width at home with a track saw and a fine blade (mask the cut line to stop laminate chipping).`,
                  ]
                : []),
            inStore
                ? `Saw limits: ${PANEL_SAW.minLMm} × ${PANEL_SAW.minHFittedMm} mm minimum workpiece (${PANEL_SAW.minLMm} × ${PANEL_SAW.minHMm} mm without the support fitted), ${PANEL_SAW.maxLMm} × ${PANEL_SAW.maxHMm} mm maximum, ${PANEL_SAW.maxDepthMm} mm maximum depth.`
                : 'We cut hardboard, chipboard, OSB, MDF, worktops, plywood, sundeala, door blanks, pegboard and T&G flooring — not plasterboard, doors, fence panels or structural timber.',
            ...(plan.belowMinCount > 0 && inStore
                ? [
                      `⚠ ${plan.belowMinCount} part${plan.belowMinCount === 1 ? '' : 's'} (marked ⚠ in the plan) below the ${PANEL_SAW.minLMm} × ${PANEL_SAW.minHFittedMm} mm saw minimum — have them cut oversize in store and trim at home.`,
                  ]
                : []),
            ...(plan.sheet.crossCutOnly
                ? []
                : [
                      input.allowRotation
                          ? 'Parts may be rotated 90° — turn rotation off if grain or face pattern direction matters.'
                          : 'Rotation is off — parts keep their orientation for grain or face direction.',
                  ]),
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
