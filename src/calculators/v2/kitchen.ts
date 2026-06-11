/**
 * @file src/calculators/v2/kitchen.ts
 *
 * Kitchen layout planner, mapped to Selco's self-assembly ranges
 * (Verona, Paris, Capri, Lisbon share the same carcass sizes).
 *
 * Real range rules baked in:
 *   - base and wall units come in 300/400/500/600/1000 mm
 *   - two corner choices: the 935 mm L-shape corner base (sold as two
 *     packs, order both) or the 1000 mm corner base; wall runs turn on a
 *     635 mm corner wall unit
 *   - cornice and pelmet are the same 2.7 m profile, one product does
 *     both jobs
 *   - integrated appliances need an appliance fascia door each; exposed
 *     run ends need clad panels (base, wall and tall)
 *   - the larder cabinet brings its own fitting pack and hinge pack
 *
 * Design rules the packer enforces and the plan reports:
 *   - the work triangle (sink, cooker, fridge): each leg ideally 1.2 to
 *     2.7 m, total between 4.0 and 7.9 m
 *   - the sink never sits hard against the cooker: a 600 mm unit goes
 *     between them when they share a wall
 *   - the dishwasher lands beside the sink (shared plumbing, less mess)
 *   - tall units (fridge housing, larder) sit at the open end of the
 *     first wall, by the door, with a landing counter beside them
 */

import type { BillOfMaterials, BomLine } from './types';
import { units } from './types';

export type KitchenShape = 'galley' | 'l-shape' | 'u-shape';
export type DoorStyle = 'handled' | 'handleless';
export type CornerUnitType = 'l935' | 'c1000';
export type FridgeType = 'none' | 'freestanding' | 'integrated';
export type DrawerChoice = 'none' | 'd500' | 'd600' | 'd800';

export interface KitchenInput {
    shape: KitchenShape;
    doorStyle: DoorStyle;
    wallAM: number;
    wallBM: number;
    wallCM: number;
    cornerType: CornerUnitType;
    /** Built-under oven housing unit, otherwise a freestanding cooker gap. */
    ovenHousing: boolean;
    dishwasher: boolean;
    washingMachine: boolean;
    fridge: FridgeType;
    larder: boolean;
    /** Drawer stack beside the cooker: 500 four-drawer, 600 or 800 three-drawer. */
    drawers: DrawerChoice;
    /** 300 mm wine rack unit. */
    wineRack: boolean;
    /** 300 mm pull-out base unit, lives by the cooking zone. */
    pullOut: boolean;
    includeWallUnits: boolean;
    includeCornice: boolean;
}

export type UnitKind =
    | 'corner'
    | 'base'
    | 'sink'
    | 'cooker'
    | 'dishwasher'
    | 'washing-machine'
    | 'fridge'
    | 'larder'
    | 'drawers'
    | 'wine'
    | 'pullout'
    | 'filler';

export interface PlacedUnit {
    wall: 'A' | 'B' | 'C';
    offsetMm: number;
    widthMm: number;
    kind: UnitKind;
    /** Tall units break the worktop run. */
    tall: boolean;
    label: string;
}

export interface TriangleLeg {
    from: string;
    to: string;
    lengthM: number;
}

export interface WorkTriangle {
    legs: TriangleLeg[];
    totalM: number;
    /** Within the classic 4.0 to 7.9 m total with no leg under 1.2 m. */
    ok: boolean;
    verdict: string;
}

export interface KitchenPlan {
    placed: PlacedUnit[];
    walls: Array<{ id: 'A' | 'B' | 'C'; lengthMm: number }>;
    baseUnitCount: number;
    wallUnitCount: number;
    wallCornerCount: number;
    worktopMm: number;
    /** Wall-unit run for cornice + pelmet, mm. */
    wallRunMm: number;
    triangle: WorkTriangle | null;
    warnings: string[];
}

const BASE_WIDTHS_MM = [1000, 600, 500, 400, 300];
const SLOT_MM = 600;
const DEPTH_MM = 600;
const CORNER_MM: Record<CornerUnitType, number> = { l935: 935, c1000: 1000 };
/** Minimum worktop between the sink and the hob. */
const SINK_COOKER_GAP_MM = 600;

const LABELS: Record<string, string> = {
    sink: 'Sink 600',
    cooker: 'Cooker 600',
    dishwasher: 'D/W 600',
    'washing-machine': 'W/M 600',
    fridge: 'Fridge 600',
    larder: 'Larder 600',
    wine: 'Wine 300',
    pullout: 'Pull-out 300',
};

const DRAWER_WIDTH_MM: Record<DrawerChoice, number> = { none: 0, d500: 500, d600: 600, d800: 800 };

/** 2D centre of a unit along its wall, mm (A top, B right, C bottom). */
function centreOf(u: PlacedUnit, wallAMm: number, wallBMm: number): { x: number; y: number } {
    const c = u.offsetMm + u.widthMm / 2;
    if (u.wall === 'A') return { x: c, y: 0 };
    if (u.wall === 'B') return { x: wallAMm, y: c };
    return { x: wallAMm - c, y: wallBMm };
}

export function planKitchen(input: KitchenInput): KitchenPlan {
    const cornerMm = CORNER_MM[input.cornerType];
    const wallDefs: Array<{ id: 'A' | 'B' | 'C'; lengthMm: number }> = [
        { id: 'A' as const, lengthMm: Math.round(input.wallAM * 1000) },
        ...(input.shape !== 'galley' ? [{ id: 'B' as const, lengthMm: Math.round(input.wallBM * 1000) }] : []),
        ...(input.shape === 'u-shape' ? [{ id: 'C' as const, lengthMm: Math.round(input.wallCM * 1000) }] : []),
    ];

    // ---- slot assignment, rules first ----
    // Wall A: sink, dishwasher beside it, washing machine after that.
    // Cooker: wall B when there is one, otherwise wall A with a 600 unit
    // forced between it and the sink. Talls: end of the last wall.
    type Slot = { kind: UnitKind; w: number };
    const slotsByWall: Record<'A' | 'B' | 'C', Slot[]> = { A: [], B: [], C: [] };
    // Talls open wall A (by the door), then the wet run: sink, dishwasher.
    if (input.fridge !== 'none') slotsByWall.A.push({ kind: 'fridge', w: SLOT_MM });
    if (input.larder) slotsByWall.A.push({ kind: 'larder', w: SLOT_MM });
    slotsByWall.A.push({ kind: 'sink', w: SLOT_MM });
    if (input.dishwasher) slotsByWall.A.push({ kind: 'dishwasher', w: SLOT_MM });
    if (input.washingMachine) slotsByWall.A.push({ kind: 'washing-machine', w: SLOT_MM });
    const cookerWall: 'A' | 'B' = wallDefs.length > 1 ? 'B' : 'A';
    slotsByWall[cookerWall].push({ kind: 'cooker', w: SLOT_MM });
    // The cooking zone: drawers (pans) and the pull-out (oils) flank the
    // cooker; the wine rack takes any 300 slot at the end of the run.
    if (input.drawers !== 'none')
        slotsByWall[cookerWall].push({ kind: 'drawers', w: DRAWER_WIDTH_MM[input.drawers] });
    if (input.pullOut) slotsByWall[cookerWall].push({ kind: 'pullout', w: 300 });
    if (input.wineRack)
        slotsByWall[wallDefs[wallDefs.length - 1].id].push({ kind: 'wine', w: 300 });

    const placed: PlacedUnit[] = [];
    const warnings: string[] = [];

    wallDefs.forEach((w, i) => {
        let cursor = 0;
        if (i > 0) {
            placed.push({
                wall: w.id,
                offsetMm: 0,
                widthMm: cornerMm,
                kind: 'corner',
                tall: false,
                label: `Corner ${cornerMm}`,
            });
            cursor = cornerMm;
        }
        // A wall that turns into the next stops a carcass-depth short.
        const effective = w.lengthMm - (i < wallDefs.length - 1 ? DEPTH_MM : 0);
        let remaining = effective - cursor;

        const queue = [...slotsByWall[w.id]];
        let placedSinceSink = -1; // mm of run placed since the sink went in
        let lastWasTall = false;
        for (const { kind, w: slotW } of queue) {
            // Rule: a landing counter between a tall unit and the sink.
            if (kind === 'sink' && lastWasTall && remaining >= SLOT_MM * 2) {
                placed.push({ wall: w.id, offsetMm: cursor, widthMm: SLOT_MM, kind: 'base', tall: false, label: 'Base 600' });
                cursor += SLOT_MM;
                remaining -= SLOT_MM;
            }
            // Rule: a 600 unit between sink and cooker on a shared wall.
            if (kind === 'cooker' && placedSinceSink >= 0 && placedSinceSink < SINK_COOKER_GAP_MM) {
                if (remaining >= SLOT_MM * 2) {
                    placed.push({ wall: w.id, offsetMm: cursor, widthMm: SLOT_MM, kind: 'base', tall: false, label: 'Base 600' });
                    cursor += SLOT_MM;
                    remaining -= SLOT_MM;
                    placedSinceSink += SLOT_MM;
                } else {
                    warnings.push('Not enough run to keep 600 mm of worktop between the sink and the cooker. Stretch the wall or move the cooker.');
                }
            }
            if (remaining < slotW) {
                warnings.push(`No room left on wall ${w.id} for the ${kind.replace('-', ' ')}. It needs another ${slotW} mm.`);
                continue;
            }
            const isTall = kind === 'larder' || (kind === 'fridge' && input.fridge === 'integrated');
            placed.push({
                wall: w.id,
                offsetMm: cursor,
                widthMm: slotW,
                kind,
                tall: isTall || kind === 'fridge',
                label: kind === 'drawers' ? `Drawers ${slotW}` : LABELS[kind],
            });
            cursor += slotW;
            remaining -= slotW;
            lastWasTall = kind === 'fridge' || kind === 'larder';
            if (kind === 'sink') placedSinceSink = 0;
            else if (placedSinceSink >= 0) placedSinceSink += slotW;
        }

        // Fill with the widest stocked base units.
        while (remaining >= BASE_WIDTHS_MM[BASE_WIDTHS_MM.length - 1]) {
            const bw = BASE_WIDTHS_MM.find((x) => x <= remaining)!;
            placed.push({ wall: w.id, offsetMm: cursor, widthMm: bw, kind: 'base', tall: false, label: `Base ${bw}` });
            cursor += bw;
            remaining -= bw;
            if (placedSinceSink >= 0) placedSinceSink += bw;
        }
        if (remaining > 5) {
            placed.push({ wall: w.id, offsetMm: cursor, widthMm: remaining, kind: 'filler', tall: false, label: 'Filler' });
            cursor += remaining;
        }
    });

    // ---- work triangle ----
    const wallAMm = wallDefs[0].lengthMm;
    const wallBMm = wallDefs.find((w) => w.id === 'B')?.lengthMm ?? DEPTH_MM;
    const find = (k: UnitKind) => placed.find((p) => p.kind === k);
    const sink = find('sink');
    const cooker = find('cooker');
    const fridge = find('fridge');
    let triangle: WorkTriangle | null = null;
    if (sink && cooker && fridge) {
        const pts = [
            { name: 'sink', ...centreOf(sink, wallAMm, wallBMm) },
            { name: 'cooker', ...centreOf(cooker, wallAMm, wallBMm) },
            { name: 'fridge', ...centreOf(fridge, wallAMm, wallBMm) },
        ];
        const legs: TriangleLeg[] = pts.map((p, i) => {
            const q = pts[(i + 1) % 3];
            return {
                from: p.name,
                to: q.name,
                lengthM: Math.hypot(p.x - q.x, p.y - q.y) / 1000,
            };
        });
        const totalM = legs.reduce((s, l) => s + l.lengthM, 0);
        const shortLeg = legs.some((l) => l.lengthM < 1.2);
        const ok = totalM >= 4 && totalM <= 7.9 && !shortLeg;
        triangle = {
            legs,
            totalM,
            ok,
            verdict: ok
                ? 'Spot on. Everything within reach without the walkways crossing.'
                : totalM < 4
                  ? 'Tight. Fine for one cook, elbows at risk for two.'
                  : totalM > 7.9
                    ? 'Spread out. You will feel the extra steps on a Sunday roast.'
                    : 'One leg is under 1.2 m, give the appliances a touch more room.',
        };
    }

    // Fridge hard against the cooker is bad for both.
    if (cooker && fridge && cooker.wall === fridge.wall) {
        const adjacent =
            Math.abs(cooker.offsetMm + cooker.widthMm - fridge.offsetMm) < 5 ||
            Math.abs(fridge.offsetMm + fridge.widthMm - cooker.offsetMm) < 5;
        if (adjacent) {
            warnings.push('The fridge has ended up beside the cooker. Heat and cold storage make poor neighbours, slot a unit between them.');
        }
    }

    const baseUnitCount = placed.filter((p) => ['base', 'sink', 'corner', 'drawers', 'wine', 'pullout'].includes(p.kind)).length;
    const worktopMm = placed.filter((p) => !p.tall && p.kind !== 'fridge').reduce((s, p) => s + p.widthMm, 0);
    const wallCornerCount = input.includeWallUnits ? wallDefs.length - 1 : 0;
    const wallRunMm = input.includeWallUnits ? Math.round(worktopMm * 0.7) : 0;
    const wallUnitCount = input.includeWallUnits ? Math.round(wallRunMm / SLOT_MM) : 0;

    return {
        placed,
        walls: wallDefs,
        baseUnitCount,
        wallUnitCount,
        wallCornerCount,
        worktopMm,
        wallRunMm,
        triangle,
        warnings,
    };
}

export function calculateKitchen(input: KitchenInput): BillOfMaterials {
    const plan = planKitchen(input);
    const baseUnits = plan.placed.filter((p) => p.kind === 'base');
    const corners = plan.placed.filter((p) => p.kind === 'corner');
    const totalRunMm = plan.walls.reduce((s, w) => s + w.lengthMm, 0);
    const handleless = input.doorStyle === 'handleless';
    const fasciaDoors = (input.dishwasher ? 1 : 0) + (input.washingMachine ? 1 : 0);
    const tallClads = (input.larder ? 1 : 0) + (input.fridge === 'integrated' ? 1 : 0);

    const cabinetLines: BomLine[] = [
        ...(corners.length
            ? [
                  input.cornerType === 'l935'
                      ? {
                            id: 'corner',
                            name: '935 mm corner base unit, L-shape',
                            detail: 'sold as two packs, order both',
                            qty: corners.length,
                            unit: 'units (2 packs each)',
                        }
                      : {
                            id: 'corner',
                            name: '1000 mm corner base unit',
                            detail: 'blanks the corner with a single door',
                            qty: corners.length,
                            unit: 'units',
                        },
              ]
            : []),
        {
            id: 'sink-base',
            name: '600 mm sink base unit',
            qty: 1,
            unit: 'units',
        },
        ...BASE_WIDTHS_MM.filter((w) => baseUnits.some((u) => u.widthMm === w)).map((w) => ({
            id: `base-${w}`,
            name: `${w} mm base unit`,
            qty: baseUnits.filter((u) => u.widthMm === w).length,
            unit: 'units',
        })),
        ...(input.ovenHousing
            ? [{ id: 'oven-housing', name: '600 mm built-under oven housing unit', qty: 1, unit: 'units' }]
            : []),
        ...(input.drawers !== 'none'
            ? [
                  input.drawers === 'd500'
                      ? { id: 'drawers', name: '500 mm four drawer unit', detail: 'pan storage beside the cooker', qty: 1, unit: 'units' }
                      : input.drawers === 'd600'
                        ? { id: 'drawers', name: '600 mm three drawer unit', detail: 'pan storage beside the cooker', qty: 1, unit: 'units' }
                        : { id: 'drawers', name: '800 mm three drawer unit', detail: 'sold as two packs, order both', qty: 1, unit: 'units (2 packs)' },
              ]
            : []),
        ...(input.wineRack
            ? [{ id: 'wine', name: '300 mm wine rack unit', qty: 1, unit: 'units' }]
            : []),
        ...(input.pullOut
            ? [{ id: 'pullout', name: '300 mm pull-out base unit', detail: 'oils and spices by the cooking zone', qty: 1, unit: 'units' }]
            : []),
        ...(input.larder
            ? [
                  { id: 'larder', name: '600 mm larder & appliance cabinet', qty: 1, unit: 'units' },
                  { id: 'larder-fittings', name: 'Larder unit fitting pack', qty: 1, unit: 'packs' },
                  { id: 'larder-hinges', name: 'Larder unit hinges, pack of 5', qty: 1, unit: 'packs' },
              ]
            : []),
        ...(input.fridge === 'integrated'
            ? [{ id: 'fridge-housing', name: '600 mm built-in 50/50 fridge freezer housing', qty: 1, unit: 'units' }]
            : []),
        ...(plan.wallUnitCount
            ? [{ id: 'wall-units', name: '600 mm wall unit', qty: plan.wallUnitCount, unit: 'units' }]
            : []),
        ...(plan.wallCornerCount
            ? [{ id: 'wall-corner', name: '635 mm corner wall unit', qty: plan.wallCornerCount, unit: 'units' }]
            : []),
    ];

    const panelLines: BomLine[] = [
        ...(fasciaDoors
            ? [
                  {
                      id: 'fascia-doors',
                      name: 'Appliance fascia door, 600 mm',
                      detail: 'one per integrated appliance, matches the range',
                      qty: fasciaDoors,
                      unit: 'doors',
                  },
              ]
            : []),
        { id: 'base-clads', name: 'Base unit clad panel', detail: 'one per exposed run end', qty: 2, unit: 'panels' },
        ...(plan.wallUnitCount
            ? [{ id: 'wall-clads', name: 'Wall unit clad panel', detail: 'one per exposed run end', qty: 2, unit: 'panels' }]
            : []),
        ...(tallClads
            ? [{ id: 'tall-clads', name: 'Tall clad panel', detail: 'finishes the larder / fridge housing side', qty: tallClads, unit: 'panels' }]
            : []),
    ];

    const worktopLengths = units(plan.worktopMm / 3000);
    const finishLines: BomLine[] = [
        {
            id: 'worktop',
            name: 'Laminate worktop, 3 m × 600 mm × 38 mm',
            qty: worktopLengths,
            unit: 'lengths',
        },
        {
            id: 'worktop-bolts',
            name: 'Worktop connecting bolts',
            detail: 'pack of 3, one pack per joint',
            qty: Math.max(0, worktopLengths - 1),
            unit: 'packs',
        },
        {
            id: 'plinth',
            name: 'Plinth, 2700 mm',
            detail: 'clips below the base units',
            qty: units(plan.worktopMm / 2700),
            unit: 'lengths',
        },
        ...(input.includeCornice && plan.wallUnitCount
            ? [
                  {
                      id: 'cornice-pelmet',
                      name: 'Cornice & pelmet profile, 2.7 m',
                      detail: 'the same profile runs over and under the wall units',
                      qty: units((plan.wallRunMm * 2 * 1.1) / 2700),
                      unit: 'lengths',
                  },
              ]
            : []),
    ];

    const triangleNotes = plan.triangle
        ? [
              `Work triangle: ${plan.triangle.legs
                  .map((l) => `${l.from} to ${l.to} ${l.lengthM.toFixed(1)} m`)
                  .join(', ')}. Total ${plan.triangle.totalM.toFixed(1)} m. ${plan.triangle.verdict}`,
          ]
        : ['No work triangle to check without a fridge in the plan.'];

    return {
        facts: [
            { label: 'Total run', value: `${(totalRunMm / 1000).toFixed(1)} m` },
            { label: 'Base units', value: `${plan.baseUnitCount}` },
            ...(plan.wallUnitCount ? [{ label: 'Wall units', value: `${plan.wallUnitCount + plan.wallCornerCount}` }] : []),
            {
                label: 'Work triangle',
                value: plan.triangle ? `${plan.triangle.totalM.toFixed(1)} m ${plan.triangle.ok ? '✓' : '⚠'}` : 'n/a',
            },
        ],
        sections: [
            { title: 'Cabinets', lines: cabinetLines },
            { title: 'Doors & panels', lines: panelLines },
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
            ...triangleNotes,
            ...plan.warnings,
            ...plan.walls.map((w) => {
                const onWall = plan.placed.filter((p) => p.wall === w.id).map((p) => p.label).join(', ');
                return `Wall ${w.id} (${(w.lengthMm / 1000).toFixed(1)} m): ${onWall}.`;
            }),
            'All the self-assembly ranges share these carcass sizes, so pick Verona, Paris, Capri or Lisbon in branch without redoing the sums.',
            handleless
                ? 'Handleless ranges use a J-profile door, nothing extra to fit.'
                : 'Handled ranges include the handles in the box.',
            'Units arrive flat-packed with legs included. Plinths, panels and trims are separate, which is why they are on the list.',
        ],
    };
}
