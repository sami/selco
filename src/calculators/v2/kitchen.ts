/**
 * @file src/calculators/v2/kitchen.ts
 *
 * Kitchen layout planner, concept engine.
 *
 * Takes a layout shape (galley / L-shape / U-shape) and wall lengths, packs
 * standard-width carcasses along each run, then counts worktops, plinths and
 * trims. The fill algorithm mirrors how a fitter sets a kitchen out: corner
 * units claim their 900 mm first, the sink base and appliances take fixed
 * slots, and the remaining run is filled with the widest base units that fit,
 * finishing with a filler strip.
 *
 * Standard dimensions assumed (typical UK rigid carcass range):
 *   base/wall unit widths 300/400/500/600/800/1000 mm, corner base 900 mm,
 *   worktop in 3 m lengths, plinth in 2.4 m lengths.
 */

import type { BillOfMaterials, BomLine } from './types';
import { units } from './types';

export type KitchenShape = 'galley' | 'l-shape' | 'u-shape';

export type DoorStyle = 'handled' | 'handleless';

export interface KitchenInput {
    shape: KitchenShape;
    /** Rapide+ ranges: handled doors include handles; handleless ranges
     *  take a rail/fascia trim along the unit run instead. */
    doorStyle: DoorStyle;
    /** Cornice over and pelmet under the wall units. */
    includeCornice: boolean;
    /** Wall run lengths in metres. Galley uses A; L uses A+B; U uses A+B+C. */
    wallAM: number;
    wallBM: number;
    wallCM: number;
    /** Fixed-width slots that consume run but aren't cabinets. */
    appliances: {
        cooker: boolean; // 600 mm gap
        dishwasher: boolean; // 600 mm integrated
        washingMachine: boolean; // 600 mm integrated
        fridgeFreezer: boolean; // 600 mm tall, no worktop over
    };
    /** Add matching wall (upper) units over the base runs. */
    includeWallUnits: boolean;
}

/** One placed item on a wall run, for the SVG plan view. */
export interface PlacedUnit {
    /** Which wall run the unit sits on. */
    wall: 'A' | 'B' | 'C';
    /** Distance from the start of that wall, mm. */
    offsetMm: number;
    widthMm: number;
    kind:
        | 'corner'
        | 'base'
        | 'sink'
        | 'cooker'
        | 'dishwasher'
        | 'washing-machine'
        | 'fridge'
        | 'filler';
    label: string;
}

export interface KitchenPlan {
    placed: PlacedUnit[];
    /** Active wall lengths in mm, in layout order. */
    walls: Array<{ id: 'A' | 'B' | 'C'; lengthMm: number }>;
    baseUnitCount: number;
    wallUnitCount: number;
    /** Total worktop run in mm (excludes fridge slot). */
    worktopMm: number;
}

const BASE_WIDTHS_MM = [1000, 800, 600, 500, 400, 300];
const CORNER_MM = 935; // Gower Rapide+ L-corner unit
const SLOT_MM = 600;
const DEPTH_MM = 600;

/** Pack one wall run with fixed slots then best-fit base units. */
function packWall(
    wall: 'A' | 'B' | 'C',
    lengthMm: number,
    startOffsetMm: number,
    fixedSlots: PlacedUnit['kind'][],
): PlacedUnit[] {
    const placed: PlacedUnit[] = [];
    let cursor = startOffsetMm;
    let remaining = lengthMm - startOffsetMm;

    const labels: Record<string, string> = {
        sink: 'Sink base 600',
        cooker: 'Cooker 600',
        dishwasher: 'D/W 600',
        'washing-machine': 'W/M 600',
        fridge: 'Fridge 600',
    };

    for (const kind of fixedSlots) {
        const w = SLOT_MM; // sink base and appliance slots are all 600 mm
        if (remaining < w) break;
        placed.push({ wall, offsetMm: cursor, widthMm: w, kind, label: labels[kind] });
        cursor += w;
        remaining -= w;
    }

    // Fill with widest base units that fit.
    while (remaining >= BASE_WIDTHS_MM[BASE_WIDTHS_MM.length - 1]) {
        const w = BASE_WIDTHS_MM.find((bw) => bw <= remaining)!;
        placed.push({
            wall,
            offsetMm: cursor,
            widthMm: w,
            kind: 'base',
            label: `Base ${w}`,
        });
        cursor += w;
        remaining -= w;
    }

    if (remaining > 5) {
        placed.push({
            wall,
            offsetMm: cursor,
            widthMm: remaining,
            kind: 'filler',
            label: 'Filler',
        });
    }
    return placed;
}

export function planKitchen(input: KitchenInput): KitchenPlan {
    const wallDefs: Array<{ id: 'A' | 'B' | 'C'; lengthMm: number }> = [
        { id: 'A' as const, lengthMm: Math.round(input.wallAM * 1000) },
        ...(input.shape !== 'galley'
            ? [{ id: 'B' as const, lengthMm: Math.round(input.wallBM * 1000) }]
            : []),
        ...(input.shape === 'u-shape'
            ? [{ id: 'C' as const, lengthMm: Math.round(input.wallCM * 1000) }]
            : []),
    ];

    // Corners claim 900 mm at the *start* of each wall after the first.
    // The previous wall's run already extends into the corner's other leg.
    const placed: PlacedUnit[] = [];
    const slots: PlacedUnit['kind'][] = ['sink'];
    if (input.appliances.cooker) slots.push('cooker');
    if (input.appliances.dishwasher) slots.push('dishwasher');
    if (input.appliances.washingMachine) slots.push('washing-machine');
    if (input.appliances.fridgeFreezer) slots.push('fridge');

    wallDefs.forEach((w, i) => {
        let start = 0;
        if (i > 0) {
            placed.push({
                wall: w.id,
                offsetMm: 0,
                widthMm: CORNER_MM,
                kind: 'corner',
                label: 'Corner 935',
            });
            start = CORNER_MM;
        }
        // A wall that turns into another stops 600 mm short: the next
        // wall's corner unit occupies that depth of the corner.
        const effectiveLength =
            w.lengthMm - (i < wallDefs.length - 1 ? DEPTH_MM : 0);
        // Spread the fixed slots across walls: wall i takes every
        // (wallCount)th slot starting at i, so the sink lands on wall A.
        const wallSlots = slots.filter((_, si) => si % wallDefs.length === i);
        placed.push(...packWall(w.id, effectiveLength, start, wallSlots));
    });

    const baseUnitCount = placed.filter(
        (p) => p.kind === 'base' || p.kind === 'sink' || p.kind === 'corner',
    ).length;

    const worktopMm = placed
        .filter((p) => p.kind !== 'fridge')
        .reduce((sum, p) => sum + p.widthMm, 0);

    // Wall units roughly mirror the base run, minus cooker (extractor) and
    // fridge (tall) slots, approximated as 70 % of base run at 600 mm each.
    const wallUnitCount = input.includeWallUnits
        ? Math.round((worktopMm * 0.7) / SLOT_MM)
        : 0;

    return { placed, walls: wallDefs, baseUnitCount, wallUnitCount, worktopMm };
}

export function calculateKitchen(input: KitchenInput): BillOfMaterials {
    const plan = planKitchen(input);

    const baseUnits = plan.placed.filter((p) => p.kind === 'base');
    const corners = plan.placed.filter((p) => p.kind === 'corner');
    const totalRunMm = plan.walls.reduce((s, w) => s + w.lengthMm, 0);

    const styleNote =
        input.doorStyle === 'handleless' ? 'handleless range' : 'handles included';
    const cabinetLines: BomLine[] = [
        ...(corners.length
            ? [
                  {
                      id: 'corner',
                      name: 'Rapide+ L-corner base unit, 935 mm',
                      detail: `16 mm MFC carcase, legs included, ${styleNote}`,
                      qty: corners.length,
                      unit: 'units',
                  },
              ]
            : []),
        {
            id: 'sink-base',
            name: 'Rapide+ sink base unit, 600 mm',
            detail: `legs included, ${styleNote}`,
            qty: 1,
            unit: 'units',
        },
        ...BASE_WIDTHS_MM.filter((w) =>
            baseUnits.some((u) => u.widthMm === w),
        ).map((w) => ({
            id: `base-${w}`,
            name: `Rapide+ base unit, ${w} mm`,
            detail: `legs included, ${styleNote}`,
            qty: baseUnits.filter((u) => u.widthMm === w).length,
            unit: 'units',
        })),
        ...(plan.wallUnitCount
            ? [
                  {
                      id: 'wall-units',
                      name: 'Rapide+ wall unit, 600 mm',
                      detail: styleNote,
                      qty: plan.wallUnitCount,
                      unit: 'units',
                  },
              ]
            : []),
        {
            id: 'base-end-panels',
            name: 'Base unit end panel',
            detail: 'one per exposed run end',
            qty: 2,
            unit: 'panels',
        },
        ...(plan.wallUnitCount
            ? [
                  {
                      id: 'wall-end-panels',
                      name: 'Wall unit end panel',
                      detail: 'one per exposed run end',
                      qty: 2,
                      unit: 'panels',
                  },
              ]
            : []),
    ];

    const worktopM = plan.worktopMm / 1000;
    const worktopLengths = units(plan.worktopMm / 3000);
    const finishLines: BomLine[] = [
        {
            id: 'worktop',
            name: 'Laminate worktop',
            detail: '3 m × 600 mm × 38 mm',
            qty: worktopLengths,
            unit: 'lengths',
        },
        {
            id: 'plinth',
            name: 'Plinth board',
            detail: '2.4 m × 150 mm',
            qty: units(plan.worktopMm / 2400),
            unit: 'lengths',
        },
        {
            id: 'worktop-bolts',
            name: 'Worktop connecting bolts',
            detail: 'pack of 3, one pack per joint',
            qty: Math.max(0, worktopLengths - 1),
            unit: 'packs',
        },
        ...(input.doorStyle === 'handleless'
            ? [
                  {
                      id: 'rail',
                      name: 'Handleless rail / fascia trim',
                      detail: 'runs along the top of the base doors',
                      qty: units(plan.worktopMm / 2400),
                      unit: 'lengths',
                  },
              ]
            : []),
        ...(input.includeCornice && plan.wallUnitCount
            ? [
                  {
                      id: 'cornice',
                      name: 'Cornice, 3 m',
                      detail: 'tops the wall units',
                      qty: units((plan.wallUnitCount * 600 * 1.2) / 3000),
                      unit: 'lengths',
                  },
                  {
                      id: 'pelmet',
                      name: 'Pelmet / light rail, 3 m',
                      detail: 'under the wall units, hides strip lights',
                      qty: units((plan.wallUnitCount * 600 * 1.2) / 3000),
                      unit: 'lengths',
                  },
              ]
            : []),
    ];

    return {
        facts: [
            { label: 'Total run', value: `${(totalRunMm / 1000).toFixed(1)} m` },
            { label: 'Base units', value: `${plan.baseUnitCount}` },
            ...(plan.wallUnitCount
                ? [{ label: 'Wall units', value: `${plan.wallUnitCount}` }]
                : []),
            { label: 'Worktop run', value: `${worktopM.toFixed(1)} m` },
        ],
        sections: [
            { title: 'Cabinets', lines: cabinetLines },
            { title: 'Worktops & finishing', lines: finishLines },
        ],
        tools: [
            'Cordless drill driver + hole saw set for pipework and waste cut-outs',
            'Worktop jig and 12.7 mm router cutter for mason mitre joints',
            'Spirit level, stud detector and laser level for the wall unit line',
            'Colour-matched worktop sealant and silicone for sink and upstands',
            'Unit connector bolts, 40 mm woodscrews and wall-unit brackets',
            'PTFE tape and flexible tap connectors for the plumbing reconnect',
        ],
        notes: [
            ...plan.walls.map((w) => {
                const unitsOnWall = plan.placed
                    .filter((p) => p.wall === w.id)
                    .map((p) => p.label)
                    .join(', ');
                return `Wall ${w.id} (${(w.lengthMm / 1000).toFixed(1)} m): ${unitsOnWall}.`;
            }),
            'Rapide+ units arrive flat-packed with legs and (on handled ranges) handles in the box. Plinths, panels and trims are separate, which is why they are on the list.',
            input.doorStyle === 'handleless'
                ? 'Handleless ranges use a rail trim instead of handles, so the doors stay clean-faced.'
                : 'Pick your door range in branch: Verona, Paris, Capri or Lisbon.',
            'Appliances themselves are not included. Wall unit count is taken at 70% of the base run.',
        ],
    };
}
