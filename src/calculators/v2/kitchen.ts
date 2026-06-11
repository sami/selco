/**
 * @file src/calculators/v2/kitchen.ts
 *
 * Kitchen layout engine, mapped to Selco's self-assembly ranges
 * (Verona, Paris, Capri, Lisbon share the same carcass sizes).
 *
 * This works like a basic kitchen design app: the rules engine deals a
 * sensible starting layout, then the customer rearranges it, moving
 * units along the run, across walls, adding from the palette, removing
 * what they don't want. The engine prices whatever they end up with and
 * keeps scoring it against the design rules instead of blocking them.
 *
 * Range facts baked in:
 *   - base and wall units in 300/400/500/600/1000 mm; wine rack and
 *     pull-out at 150 mm; drawer packs at 500/600/800 (the 800 comes as
 *     two packs)
 *   - the sink zone follows what's underneath it: at least 500 mm of
 *     base under the bowl (waste and trap), the rest base units or a
 *     dishwasher / washing machine, never an appliance under a 1000 unit
 *   - corners: 935 L-shape (two packs) or 1000 corner; 635 corner wall
 *     unit where wall runs turn
 *   - cornice and pelmet are one 2745 mm profile
 *   - larder and integrated fridge housings take a fascia/door pack and
 *     an end panel on every side that isn't against a wall or another
 *     tall unit
 *
 * Design rules, reported not enforced:
 *   - work triangle (sink, cooker, fridge): legs 1.2 m up, total 4.0 to
 *     7.9 m
 *   - 600 mm of worktop between sink and cooker (a dishwasher counts,
 *     the worktop runs over it)
 *   - fridge and cooker make poor neighbours
 */

import type { BillOfMaterials, BomLine } from './types';
import { units } from './types';
import {
    CARCASS,
    CORNER,
    DRAWER_FRONTS,
    END_PANELS,
    TALL_UNITS,
    BUILT_UNDER_OVEN,
    fmtSize,
    fmtSplit,
} from './kitchen-dimensions';

export type KitchenShape = 'galley' | 'l-shape' | 'u-shape';
export type DoorStyle = 'handled' | 'handleless';
export type CornerUnitType = 'l935' | 'c1000';
export type FridgeType = 'freestanding' | 'integrated';
export type SinkUnder =
    | 'base1000'
    | 'twin500'
    | 'b500b600'
    | 'twin600'
    | 'dw500'
    | 'dw600'
    | 'wm500'
    | 'wm600';

/**
 * What lives under the sink zone. House rule: the bowl always sits over
 * a base of at least 500 mm (the waste and trap live there); an
 * appliance can take the rest of the zone, never the bowl side. The
 * zone's width follows the combination.
 */
export const SINK_COMBOS: Array<{
    id: SinkUnder;
    label: string;
    widthMm: number;
    appliance: 'dw' | 'wm' | null;
    bases: number[];
}> = [
    { id: 'base1000', label: '1000 mm base unit (no appliance fits under)', widthMm: 1000, appliance: null, bases: [1000] },
    { id: 'twin500', label: '2 × 500 mm bases', widthMm: 1000, appliance: null, bases: [500, 500] },
    { id: 'b500b600', label: '500 + 600 mm bases', widthMm: 1100, appliance: null, bases: [500, 600] },
    { id: 'twin600', label: '2 × 600 mm bases', widthMm: 1200, appliance: null, bases: [600, 600] },
    { id: 'dw500', label: '500 mm base + dishwasher under', widthMm: 1100, appliance: 'dw', bases: [500] },
    { id: 'dw600', label: '600 mm base + dishwasher under', widthMm: 1200, appliance: 'dw', bases: [600] },
    { id: 'wm500', label: '500 mm base + washing machine under', widthMm: 1100, appliance: 'wm', bases: [500] },
    { id: 'wm600', label: '600 mm base + washing machine under', widthMm: 1200, appliance: 'wm', bases: [600] },
];

export function sinkCombo(id: SinkUnder) {
    return SINK_COMBOS.find((c) => c.id === id) ?? SINK_COMBOS[0];
}
export type WallId = 'A' | 'B' | 'C';

export type UnitKind =
    | 'base'
    | 'drawers'
    | 'wine'
    | 'pullout'
    | 'sink'
    | 'cooker'
    | 'dishwasher'
    | 'washing-machine'
    | 'fridge'
    | 'larder'
    | 'corner'
    | 'filler';

/** A unit the customer has placed (corners and fillers are engine-added). */
export interface LayoutItem {
    id: string;
    kind: UnitKind;
    widthMm: number;
}

/** The palette of addable units. */
export const PALETTE: Array<{ kind: UnitKind; widthMm: number; label: string }> = [
    { kind: 'base', widthMm: 300, label: 'Base 300' },
    { kind: 'base', widthMm: 400, label: 'Base 400' },
    { kind: 'base', widthMm: 500, label: 'Base 500' },
    { kind: 'base', widthMm: 600, label: 'Base 600' },
    { kind: 'base', widthMm: 1000, label: 'Base 1000' },
    { kind: 'drawers', widthMm: 500, label: 'Drawers 500 (4-drawer)' },
    { kind: 'drawers', widthMm: 600, label: 'Drawers 600 (3-drawer)' },
    { kind: 'drawers', widthMm: 800, label: 'Drawers 800 (3-drawer, 2 packs)' },
    { kind: 'wine', widthMm: 150, label: 'Wine rack 150' },
    { kind: 'pullout', widthMm: 150, label: 'Pull-out 150' },
    { kind: 'sink', widthMm: 1000, label: 'Sink zone (width follows your under-sink choice)' },
    { kind: 'cooker', widthMm: 600, label: 'Cooker / oven 600' },
    { kind: 'dishwasher', widthMm: 600, label: 'Dishwasher 600' },
    { kind: 'washing-machine', widthMm: 600, label: 'Washing machine 600' },
    { kind: 'fridge', widthMm: 600, label: 'Fridge freezer 600' },
    { kind: 'larder', widthMm: 600, label: 'Larder 600' },
];

export interface KitchenInput {
    shape: KitchenShape;
    doorStyle: DoorStyle;
    wallAM: number;
    wallBM: number;
    wallCM: number;
    cornerType: CornerUnitType;
    sinkUnder: SinkUnder;
    fridgeType: FridgeType;
    /** Built-under oven housing unit behind the cooker slot. */
    ovenHousing: boolean;
    includeWallUnits: boolean;
    includeCornice: boolean;
    layout: Record<WallId, LayoutItem[]>;
}

export interface PlacedUnit {
    itemId: string | null;
    wall: WallId;
    offsetMm: number;
    widthMm: number;
    kind: UnitKind;
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
    ok: boolean;
    verdict: string;
}

export interface KitchenPlan {
    placed: PlacedUnit[];
    walls: Array<{ id: WallId; lengthMm: number }>;
    /** Spare run per wall after the layout, mm (negative = overflowing). */
    spareByWall: Record<WallId, number>;
    baseUnitCount: number;
    wallUnitCount: number;
    wallCornerCount: number;
    worktopMm: number;
    wallRunMm: number;
    tallEndPanels: number;
    triangle: WorkTriangle | null;
    warnings: string[];
}

const SLOT_MM = 600;
const DEPTH_MM = 600;
const CORNER_MM: Record<CornerUnitType, number> = { l935: 935, c1000: 1000 };

const LABELS: Partial<Record<UnitKind, string>> = {
    sink: 'Sink 1000',
    cooker: 'Cooker 600',
    dishwasher: 'D/W 600',
    'washing-machine': 'W/M 600',
    fridge: 'Fridge 600',
    larder: 'Larder 600',
    wine: 'Wine 150',
    pullout: 'Pull-out 150',
};

let seedCounter = 1;
function item(kind: UnitKind, widthMm: number): LayoutItem {
    return { id: `u${seedCounter++}`, kind, widthMm };
}

/** Active walls for a shape, in order. */
export function wallsFor(input: KitchenInput): Array<{ id: WallId; lengthMm: number }> {
    return [
        { id: 'A' as const, lengthMm: Math.round(input.wallAM * 1000) },
        ...(input.shape !== 'galley' ? [{ id: 'B' as const, lengthMm: Math.round(input.wallBM * 1000) }] : []),
        ...(input.shape === 'u-shape' ? [{ id: 'C' as const, lengthMm: Math.round(input.wallCM * 1000) }] : []),
    ];
}

/**
 * Deal a sensible starting layout using the design rules: fridge by the
 * door with a landing counter, the 1000 sink zone with the dishwasher
 * built into it, cooker on the second wall flanked by drawers and a
 * landing unit. The customer rearranges from here.
 */
export function defaultLayout(input: KitchenInput): Record<WallId, LayoutItem[]> {
    const layout: Record<WallId, LayoutItem[]> = { A: [], B: [], C: [] };
    layout.A.push(item('fridge', 600));
    layout.A.push(item('base', 600));
    layout.A.push(item('sink', 1000));
    const multiWall = input.shape !== 'galley';
    const cookerWall: WallId = multiWall ? 'B' : 'A';
    if (!multiWall) layout.A.push(item('base', 600));
    layout[cookerWall].push(item('cooker', 600));
    layout[cookerWall].push(item('drawers', 500));
    return layout;
}

export function planKitchen(input: KitchenInput): KitchenPlan {
    const wallDefs = wallsFor(input);
    const cornerMm = CORNER_MM[input.cornerType];
    const placed: PlacedUnit[] = [];
    const warnings: string[] = [];
    const spareByWall: Record<WallId, number> = { A: 0, B: 0, C: 0 };

    wallDefs.forEach((w, i) => {
        let cursor = 0;
        if (i > 0) {
            placed.push({
                itemId: null,
                wall: w.id,
                offsetMm: 0,
                widthMm: cornerMm,
                kind: 'corner',
                tall: false,
                label: `Corner ${cornerMm}`,
            });
            cursor = cornerMm;
        }
        const effective = w.lengthMm - (i < wallDefs.length - 1 ? DEPTH_MM : 0);
        for (const it of input.layout[w.id] ?? []) {
            // The sink zone's width follows the under-sink combination,
            // whatever width the item was added at.
            const widthMm = it.kind === 'sink' ? sinkCombo(input.sinkUnder).widthMm : it.widthMm;
            placed.push({
                itemId: it.id,
                wall: w.id,
                offsetMm: cursor,
                widthMm,
                kind: it.kind,
                tall: it.kind === 'larder' || it.kind === 'fridge',
                label:
                    it.kind === 'base'
                        ? `Base ${it.widthMm}`
                        : it.kind === 'drawers'
                          ? `Drawers ${it.widthMm}`
                          : it.kind === 'sink'
                            ? `Sink ${widthMm}`
                            : LABELS[it.kind] ?? it.kind,
            });
            cursor += widthMm;
        }
        const spare = effective - cursor;
        spareByWall[w.id] = spare;
        if (spare < 0) {
            warnings.push(
                `Wall ${w.id} is ${Math.abs(spare)} mm over. Remove a unit, slim one down, or stretch the wall.`,
            );
        } else if (spare > 5) {
            placed.push({
                itemId: null,
                wall: w.id,
                offsetMm: cursor,
                widthMm: spare,
                kind: 'filler',
                tall: false,
                label: spare >= 150 ? `Spare ${spare}` : 'Filler',
            });
        }
    });

    // ---- geometry helpers ----
    const wallAMm = wallDefs[0].lengthMm;
    const wallBMm = wallDefs.find((x) => x.id === 'B')?.lengthMm ?? DEPTH_MM;
    const centreOf = (u: PlacedUnit) => {
        const c = u.offsetMm + u.widthMm / 2;
        if (u.wall === 'A') return { x: c, y: 0 };
        if (u.wall === 'B') return { x: wallAMm, y: c };
        return { x: wallAMm - c, y: wallBMm };
    };

    // ---- work triangle ----
    const find = (k: UnitKind) => placed.find((p) => p.kind === k);
    const sink = find('sink');
    const cooker = find('cooker');
    const fridge = find('fridge');
    let triangle: WorkTriangle | null = null;
    if (sink && cooker && fridge) {
        const pts = [
            { name: 'sink', ...centreOf(sink) },
            { name: 'cooker', ...centreOf(cooker) },
            { name: 'fridge', ...centreOf(fridge) },
        ];
        const legs: TriangleLeg[] = pts.map((p, i) => {
            const q = pts[(i + 1) % 3];
            return { from: p.name, to: q.name, lengthM: Math.hypot(p.x - q.x, p.y - q.y) / 1000 };
        });
        const totalM = legs.reduce((s, l) => s + l.lengthM, 0);
        const ok = totalM >= 4 && totalM <= 7.9 && !legs.some((l) => l.lengthM < 1.2);
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
    } else {
        const missing = [!sink && 'a sink', !cooker && 'a cooker', !fridge && 'a fridge'].filter(Boolean);
        warnings.push(`No work triangle to check without ${missing.join(', ')} in the layout.`);
    }

    // ---- adjacency rules (warn, don't block) ----
    const onSameWallGap = (a: PlacedUnit, b: PlacedUnit) => {
        if (a.wall !== b.wall) return null;
        return a.offsetMm < b.offsetMm ? b.offsetMm - (a.offsetMm + a.widthMm) : a.offsetMm - (b.offsetMm + b.widthMm);
    };
    if (sink && cooker) {
        const gap = onSameWallGap(sink, cooker);
        // A dishwasher between them counts: the worktop runs over it.
        if (gap !== null && gap < SLOT_MM && sinkCombo(input.sinkUnder).appliance === null) {
            const between = placed.some(
                (p) =>
                    p.wall === sink.wall &&
                    p.kind === 'dishwasher' &&
                    p.offsetMm >= Math.min(sink.offsetMm, cooker.offsetMm) &&
                    p.offsetMm < Math.max(sink.offsetMm, cooker.offsetMm),
            );
            if (!between && gap < SLOT_MM) {
                warnings.push('Keep 600 mm of worktop between the sink and the cooker. Slide a unit between them.');
            }
        }
    }
    if (cooker && fridge) {
        const gap = onSameWallGap(cooker, fridge);
        if (gap !== null && gap < 5) {
            warnings.push('The fridge is hard against the cooker. Heat and cold storage make poor neighbours.');
        }
    }

    // ---- tall end panels: every tall side not covered by a wall or
    // another tall unit takes a panel ----
    let tallEndPanels = 0;
    for (const w of wallDefs) {
        const row = placed.filter((p) => p.wall === w.id);
        row.sort((a, b) => a.offsetMm - b.offsetMm);
        row.forEach((p, idx) => {
            if (!p.tall) return;
            const isHousing = p.kind === 'larder' || input.fridgeType === 'integrated';
            if (!isHousing) return; // a freestanding fridge gap has no carcass to clad
            const left = row[idx - 1];
            const right = row[idx + 1];
            // Left side: covered at the very start of wall A (room corner),
            // by a corner unit, or by another tall.
            const leftCovered = (!left && w.id === 'A') || (left && (left.tall || left.kind === 'corner'));
            // Right side: covered by another tall, or by the turn into the
            // next wall (no gap after it on a continuing wall).
            const continues = w.id !== wallDefs[wallDefs.length - 1].id;
            const rightCovered = (right && right.tall) || (!right && continues);
            if (!leftCovered) tallEndPanels += 1;
            if (!rightCovered) tallEndPanels += 1;
        });
    }

    const sinkZones = placed.filter((p) => p.kind === 'sink').length;
    if (sinkZones > 1) {
        warnings.push('More than one sink zone in the layout. Priced as asked, but check it is what you meant.');
    }

    const worktopMm = placed.filter((p) => !p.tall).reduce((s, p) => s + p.widthMm, 0);
    const baseUnitCount = placed.filter((p) =>
        ['base', 'sink', 'corner', 'drawers', 'wine', 'pullout'].includes(p.kind),
    ).length;
    const wallCornerCount = input.includeWallUnits ? wallDefs.length - 1 : 0;
    const wallRunMm = input.includeWallUnits ? Math.round(worktopMm * 0.7) : 0;
    const wallUnitCount = input.includeWallUnits ? Math.round(wallRunMm / SLOT_MM) : 0;

    return {
        placed,
        walls: wallDefs,
        spareByWall,
        baseUnitCount,
        wallUnitCount,
        wallCornerCount,
        worktopMm,
        wallRunMm,
        tallEndPanels,
        triangle,
        warnings,
    };
}

export function calculateKitchen(input: KitchenInput): BillOfMaterials {
    const plan = planKitchen(input);
    const all = Object.values(input.layout).flat();
    const count = (kind: UnitKind, w?: number) =>
        all.filter((x) => x.kind === kind && (w === undefined || x.widthMm === w)).length;
    const totalRunMm = plan.walls.reduce((s, w) => s + w.lengthMm, 0);
    const corners = plan.placed.filter((p) => p.kind === 'corner').length;
    const handleless = input.doorStyle === 'handleless';
    const sinkCount = count('sink');
    const larders = count('larder');
    const fridges = count('fridge');

    // Integrated appliances behind fascia doors: placed D/W and W/M, plus
    // whichever lives under the sink.
    const fasciaDoors =
        count('dishwasher') +
        count('washing-machine') +
        (sinkCount > 0 && sinkCombo(input.sinkUnder).appliance !== null ? sinkCount : 0);

    const cabinetLines: BomLine[] = [
        ...(corners
            ? [
                  input.cornerType === 'l935'
                      ? { id: 'corner', name: '935 mm corner base unit, L-shape', detail: `${CORNER.l935.footprintMm} × ${CORNER.l935.footprintMm} mm footprint, ${fmtSplit(CORNER.l935.fasciaSplit)} fascia; sold as two packs, order both. ${CORNER.l935.note[0].toUpperCase()}${CORNER.l935.note.slice(1)}.`, qty: corners, unit: 'units (2 packs each)' }
                      : { id: 'corner', name: '1000 mm corner base unit', detail: `${CORNER.c1000.doorFaceMm} mm door face + ${CORNER.c1000.blankingPanelMm} mm blanking panel; blanks the corner with a single door`, qty: corners, unit: 'units' },
              ]
            : []),
        // The sink zone's under-units.
        ...(sinkCount > 0
            ? (() => {
                  const combo = sinkCombo(input.sinkUnder);
                  const baseCounts = new Map<number, number>();
                  for (const b of combo.bases) baseCounts.set(b, (baseCounts.get(b) ?? 0) + 1);
                  return [
                      ...[...baseCounts.entries()].map(([w, n]) => ({
                          id: `sink-base-${w}`,
                          name: `${w} mm base unit (under the sink)`,
                          detail: 'the bowl sits over a base of at least 500 mm, waste and trap live there',
                          qty: n * sinkCount,
                          unit: 'units',
                      })),
                      ...(combo.appliance
                          ? [
                                {
                                    id: 'sink-appliance',
                                    name: combo.appliance === 'dw' ? 'Dishwasher space under the sink, 600 mm' : 'Washing machine space under the sink, 600 mm',
                                    detail: 'beside the bowl, plumbing shared with the sink waste',
                                    qty: sinkCount,
                                    unit: 'spaces',
                                },
                            ]
                          : []),
                  ];
              })()
            : []),
        ...[300, 400, 500, 600, 1000]
            .filter((w) => count('base', w) > 0)
            .map((w) => ({
                id: `base-${w}`,
                name: `${w} mm base unit`,
                detail: `${CARCASS.base.doorFrontMm} mm door over a ${CARCASS.base.plinthMm} mm plinth, ${CARCASS.base.toWorktopMm} mm to the worktop, ${CARCASS.base.depthMm} mm deep`,
                qty: count('base', w),
                unit: 'units',
            })),
        ...[500, 600, 800]
            .filter((w) => count('drawers', w) > 0)
            .map((w) =>
                w === 800
                    ? { id: 'drawers-800', name: '800 mm three drawer unit', detail: `fronts ${fmtSplit(DRAWER_FRONTS[800])}; sold as two packs, order both`, qty: count('drawers', 800), unit: 'units (2 packs)' }
                    : { id: `drawers-${w}`, name: w === 500 ? '500 mm four drawer unit' : '600 mm three drawer unit', detail: `fronts ${fmtSplit(DRAWER_FRONTS[w])}`, qty: count('drawers', w), unit: 'units' },
            ),
        ...(count('wine') ? [{ id: 'wine', name: '150 mm wine rack unit', qty: count('wine'), unit: 'units' }] : []),
        ...(count('pullout') ? [{ id: 'pullout', name: '150 mm pull-out base unit', qty: count('pullout'), unit: 'units' }] : []),
        ...(count('cooker') && input.ovenHousing
            ? [
                  { id: 'oven-housing', name: '600 mm built-under oven housing unit', detail: `${BUILT_UNDER_OVEN.topDrawerMm} mm drawer over the oven aperture`, qty: count('cooker'), unit: 'units' },
                  { id: 'oven-doors', name: 'Oven housing fascia door pack', detail: 'top and bottom doors around the oven aperture', qty: count('cooker'), unit: 'packs' },
              ]
            : []),
        ...(larders
            ? [
                  { id: 'larder', name: '600 mm larder & appliance cabinet', detail: `${TALL_UNITS.larder600.widthMm} mm wide, ${CARCASS.tall.overallMm} mm tall (${CARCASS.tall.fasciaMm} mm fascia + ${CARCASS.tall.plinthMm} mm plinth), ${CARCASS.tall.depthMm} mm deep; doors ${fmtSplit(TALL_UNITS.larder600.doorsMm)}`, qty: larders, unit: 'units' },
                  { id: 'larder-doors', name: 'Larder fascia door pack', detail: 'a tall and a top door, sizes differ by unit, the pack matches yours', qty: larders, unit: 'packs' },
                  { id: 'larder-fittings', name: 'Larder unit fitting pack', qty: larders, unit: 'packs' },
                  { id: 'larder-hinges', name: 'Larder unit hinges, pack of 5', qty: larders, unit: 'packs' },
              ]
            : []),
        ...(fridges && input.fridgeType === 'integrated'
            ? [
                  { id: 'fridge-housing', name: '600 mm built-in 50/50 fridge freezer housing', detail: `fascia split ${fmtSplit(TALL_UNITS.fridge5050.splitMm)} (50:50); 70:30 housings split ${fmtSplit(TALL_UNITS.fridge7030.splitMm)}`, qty: fridges, unit: 'units' },
                  { id: 'fridge-doors', name: 'Fridge housing fascia door pair (50/50 split)', detail: '70/30 housings take a different pair, match yours in branch', qty: fridges, unit: 'pairs' },
              ]
            : []),
        ...(plan.wallUnitCount ? [{ id: 'wall-units', name: '600 mm wall unit', detail: `${CARCASS.wall.heightMm} mm high, ${CARCASS.wall.depthMm} mm deep`, qty: plan.wallUnitCount, unit: 'units' }] : []),
        ...(plan.wallCornerCount ? [{ id: 'wall-corner', name: '635 mm corner wall unit', detail: `${CORNER.wall635.footprintMm} × ${CORNER.wall635.footprintMm} mm; the conventional 600 corner wall unit is ${fmtSplit(CORNER.wall600.fasciaSplit)} fascia with a ${CORNER.wall600.returnMm} mm return`, qty: plan.wallCornerCount, unit: 'units' }] : []),
    ];

    const panelLines: BomLine[] = [
        ...(fasciaDoors
            ? [{ id: 'fascia-doors', name: 'Appliance fascia door, 600 mm', detail: 'one per integrated appliance, matches the range', qty: fasciaDoors, unit: 'doors' }]
            : []),
        { id: 'base-clads', name: 'Base unit clad panel', detail: `${fmtSize(END_PANELS.base)}, 18 mm plant-on decor; one per exposed run end`, qty: 2, unit: 'panels' },
        ...(plan.wallUnitCount
            ? [{ id: 'wall-clads', name: 'Wall unit clad panel', detail: `${fmtSize(END_PANELS.wall)}, 18 mm plant-on decor; one per exposed run end`, qty: 2, unit: 'panels' }]
            : []),
        ...(plan.tallEndPanels
            ? [
                  {
                      id: 'tall-clads',
                      name: 'Tall clad panel',
                      detail: `${fmtSize(END_PANELS.tall)}, 18 mm plant-on decor; every tall side not against a wall or another tall unit`,
                      qty: plan.tallEndPanels,
                      unit: 'panels',
                  },
              ]
            : []),
    ];

    const worktopLengths = units(plan.worktopMm / 3000);
    const finishLines: BomLine[] = [
        { id: 'worktop', name: 'Laminate worktop, 3 m × 600 mm × 38 mm', qty: worktopLengths, unit: 'lengths' },
        { id: 'worktop-bolts', name: 'Worktop connecting bolts', detail: 'pack of 3, one pack per joint', qty: Math.max(0, worktopLengths - 1), unit: 'packs' },
        { id: 'plinth', name: 'Plinth, 2700 mm', detail: 'clips below the base units', qty: units(plan.worktopMm / 2700), unit: 'lengths' },
        ...(input.includeCornice && plan.wallUnitCount
            ? [
                  {
                      id: 'cornice-pelmet',
                      name: 'Cornice & pelmet profile, 2745 mm',
                      detail: 'the same profile runs over and under the wall units',
                      qty: units((plan.wallRunMm * 2 * 1.1) / 2745),
                      unit: 'lengths',
                  },
              ]
            : []),
    ];

    const triangleNotes = plan.triangle
        ? [
              `Work triangle: ${plan.triangle.legs.map((l) => `${l.from} to ${l.to} ${l.lengthM.toFixed(1)} m`).join(', ')}. Total ${plan.triangle.totalM.toFixed(1)} m. ${plan.triangle.verdict}`,
          ]
        : [];

    return {
        facts: [
            { label: 'Total run', value: `${(totalRunMm / 1000).toFixed(1)} m` },
            { label: 'Base units', value: `${plan.baseUnitCount}` },
            ...(plan.wallUnitCount ? [{ label: 'Wall units', value: `${plan.wallUnitCount + plan.wallCornerCount}` }] : []),
            { label: 'Work triangle', value: plan.triangle ? `${plan.triangle.totalM.toFixed(1)} m ${plan.triangle.ok ? '✓' : '⚠'}` : 'n/a' },
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
            handleless ? 'Handleless ranges use a J-profile door, nothing extra to fit.' : 'Handled ranges include the handles in the box.',
            'Units arrive flat-packed with legs included. Plinths, panels and trims are separate, which is why they are on the list.',
        ],
    };
}
