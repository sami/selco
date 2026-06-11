/**
 * @file src/calculators/v2/masonry.ts
 *
 * Brick & block wall estimator, mapped to Selco's stocked range.
 *
 * Wall types use the trade wording:
 *   - half-brick wall (102 mm): single skin in stretcher bond
 *   - one-brick wall (215 mm): solid wall, two skins bonded together
 *   - block wall: dense 7N (100 or 140 mm) or Thermalite (100 mm, or
 *     215 mm party wall)
 *   - cavity wall: two leaves chosen independently. Outer in facing
 *     brick, or dense block when the wall is getting rendered. Inner
 *     usually Thermalite for the insulation, dense where strength rules.
 *     Tied at 2.5 ties/m² with full-fill cavity batts as standard
 *
 * The details that catch people out are all here: wall starter kits when
 * the new wall tees into an existing one, dense blocks below DPC when the
 * wall above is Thermalite (aircrete stays out of the wet), lintels in
 * steel or concrete at stocked lengths, cavity trays and weep vents
 * counted individually, and copings once or twice weathered as preferred.
 */

import type { BillOfMaterials, BomLine, BomSection } from './types';
import { aggregateLines, fmtM2, units } from './types';

export type WallConstruction = 'half-brick' | 'one-brick' | 'block' | 'cavity';
export type BrickType = 'facing' | 'engineering';
export type BlockType = 'dense' | 'thermalite' | 'mixed';
export type OuterLeaf = 'brick' | 'block';
export type LintelType = 'concrete' | 'steel';
export type CopingStyle = 'once' | 'twice';

export interface MasonryInput {
    lengthM: number;
    heightM: number;
    construction: WallConstruction;
    /** Cavity walls: facing brick outer, or dense block ready for render. */
    outerLeaf: OuterLeaf;
    /** Render-ready outer leaf thickness: 100 or 140 mm dense block. */
    outerBlockThicknessMm: number;
    brickType: BrickType;
    /** Inner leaf (cavity) or the wall itself. 'mixed' lays dense below
     *  DPC and Thermalite above, the common single-skin recipe. */
    blockType: BlockType;
    /** Cavity width, mm (50/75/100/150). Drives the L1/S lintel code and
     *  the full-fill batt thickness. */
    cavityWidthMm: number;
    /** Dense: 100 or 140. Thermalite: 100, or 215 party wall. */
    blockThicknessMm: number;
    /** Door/window openings in the wall, each its own width. */
    openings: Array<{ id: string; widthMm: number }>;
    lintelType: LintelType;
    /** Steel beams bearing on the wall (2 padstones each). */
    beams: number;
    /** Stocked padstone, numbered the way the counter knows them. */
    padstoneId: string;
    /** Ends that tee into an existing wall (wall starter kits). */
    joinsExisting: number;
    /** Below-DPC courses in engineering brick / dense block + DPC roll. */
    dpcCourses: boolean;
    /** Full-fill cavity batts between the leaves (cavity walls). */
    cavityInsulation: boolean;
    /** Air bricks at the base for suspended floor ventilation. */
    airBricks: boolean;
    includeCopings: boolean;
    copingStyle: CopingStyle;
}

interface ConstructionSpec {
    label: string;
    bricksPerM2: number;
    blocksPerM2: number;
    tiesPerM2: number;
    /** Masonry leaves at a junction (wall starters per join). */
    leaves: number;
}

export const CONSTRUCTIONS: Record<WallConstruction, ConstructionSpec> = {
    'half-brick': { label: 'Half-brick wall (102 mm)', bricksPerM2: 60, blocksPerM2: 0, tiesPerM2: 0, leaves: 1 },
    'one-brick': { label: 'One-brick wall (215 mm)', bricksPerM2: 120, blocksPerM2: 0, tiesPerM2: 0, leaves: 1 },
    block: { label: 'Block wall', bricksPerM2: 0, blocksPerM2: 10, tiesPerM2: 0, leaves: 1 },
    cavity: { label: 'Cavity wall (brick + block)', bricksPerM2: 60, blocksPerM2: 10, tiesPerM2: 2.5, leaves: 2 },
};

/** Supreme prestressed lintel stocked lengths, mm. */
const LINTEL_LENGTHS = [600, 900, 1050, 1200, 1350, 1500, 1800, 2100, 2400, 2700, 3000];

/** Stocked Supreme padstones, numbered in Selco's own catalogue order. */
export const PADSTONES: Array<{ id: string; label: string }> = [
    { id: '01', label: '215 × 140 × 102 mm' },
    { id: '02', label: '215 × 140 × 215 mm' },
    { id: '03', label: '215 × 215 × 102 mm' },
    { id: '04', label: '300 × 140 × 102 mm' },
    { id: '05', label: '440 × 140 × 102 mm' },
    { id: '06', label: '440 × 140 × 215 mm' },
    { id: '07', label: '440 × 215 × 102 mm' },
];

/** DPC widths stocked in 30 m rolls; pick the first that covers the leaf. */
const DPC_WIDTHS = [100, 112.5, 150, 225, 300, 450, 600];
function dpcWidthFor(leafMm: number): number {
    return DPC_WIDTHS.find((w) => w >= leafMm) ?? 600;
}

export interface MasonryPlan {
    areaM2: number;
    netAreaM2: number;
    spec: ConstructionSpec;
    bricks: number;
    engineeringBricks: number;
    blocks: number;
    /** Dense outer leaf when the cavity wall is getting rendered. */
    outerBlocks: number;
    /** Dense blocks below DPC when the wall above is Thermalite. */
    denseDpcBlocks: number;
    ties: number;
    sandKg: number;
    cementBags: number;
    /** Per stocked lintel length, how many lintels (single leaf count). */
    lintelCounts: Array<{ lengthMm: number; count: number }>;
    /** Per opening (in input order): its stocked lintel length. */
    openingLintels: number[];
    /** Cavity trays and weep vents, counted individually. */
    cavityTrays: number;
    weepVents: number;
    /** Wall starter kits across all junctions. */
    starterKits: number;
    airBrickCount: number;
}

export function planMasonry(input: MasonryInput): MasonryPlan {
    const spec = CONSTRUCTIONS[input.construction];
    const area = input.lengthM * input.heightM;
    const openings = input.openings.filter((o) => o.widthMm > 0);
    const headM = Math.min(1.2, input.heightM * 0.6);
    const openingArea = openings.reduce((sum, o) => sum + (o.widthMm / 1000) * headM, 0);
    const netArea = Math.max(0, area - openingArea);

    const cavityWall = input.construction === 'cavity';
    const blockOuter = cavityWall && input.outerLeaf === 'block';
    // Brick rate: zero when the cavity outer leaf is render-ready block.
    const brickRate = blockOuter ? 0 : spec.bricksPerM2;
    let bricks = units(netArea * brickRate * 1.05);
    let engineeringBricks = 0;
    const hasBlocks = spec.blocksPerM2 > 0;
    // 'mixed' walls are Thermalite above the DPC with dense laid below it.
    const thermalite = (input.blockType === 'thermalite' || input.blockType === 'mixed') && hasBlocks;

    if (input.dpcCourses && brickRate > 0) {
        // Two courses below DPC, ~13.4 bricks per metre per course per skin.
        const brickSkins = input.construction === 'one-brick' ? 2 : 1;
        engineeringBricks = units(input.lengthM * 13.4 * 2 * brickSkins);
    }
    if (input.brickType === 'engineering' && brickRate > 0) {
        engineeringBricks += bricks;
        bricks = 0;
    }

    // Inner leaf (or the block wall itself), plus a dense outer leaf when
    // the cavity wall is getting rendered.
    const blocks = units(netArea * spec.blocksPerM2 * 1.05);
    const outerBlocks = blockOuter ? units(netArea * 10 * 1.05) : 0;
    // Aircrete stays out of the ground: one course of dense block below
    // DPC under a Thermalite leaf (440 mm long blocks).
    const denseDpcBlocks =
        thermalite && (input.dpcCourses || input.blockType === 'mixed')
            ? units(input.lengthM / 0.44)
            : 0;

    // Mortar: bricks at ~0.85 kg sand each; blocks scale with thickness
    // (the 2.1 kg base rate is for a 100 mm block).
    const blockSandFactor = input.blockThicknessMm / 100;
    const totalBrickish = bricks + engineeringBricks;
    const outerFactor = input.outerBlockThicknessMm / 100;
    const denseBlockKg = outerBlocks * 2.1 * outerFactor + denseDpcBlocks * 2.1;
    const sandKg = totalBrickish * 0.85 + blocks * 2.1 * blockSandFactor + denseBlockKg;
    const cementBags = totalBrickish * 0.01 + blocks * 0.025 * blockSandFactor + outerBlocks * 0.025 * outerFactor + denseDpcBlocks * 0.025;

    // Every opening gets its own stocked lintel length (+300 mm bearings),
    // its own cavity trays (~450 mm interlocking units) and weep vents
    // (max 450 mm apart, never fewer than two).
    const cavity = input.construction === 'cavity';
    const openingLintels = openings.map(
        (o) => LINTEL_LENGTHS.find((l) => l >= o.widthMm + 300) ?? 3000,
    );
    const lintelCounts = [...new Set(openingLintels)]
        .sort((a, b) => a - b)
        .map((lengthMm) => ({
            lengthMm,
            count: openingLintels.filter((l) => l === lengthMm).length,
        }));
    const totalTrays = openingLintels.reduce((sum, l) => sum + Math.ceil(l / 450), 0);
    const totalWeeps = openings.reduce((sum, o) => sum + Math.max(2, Math.ceil(o.widthMm / 450)), 0);

    // Wall starters: one kit per leaf per junction, per 2.4 m of height.
    const starterKits =
        Math.round(input.joinsExisting) * spec.leaves * Math.max(1, Math.ceil(input.heightM / 2.4));

    return {
        areaM2: area,
        netAreaM2: netArea,
        spec,
        bricks,
        engineeringBricks,
        blocks,
        outerBlocks,
        denseDpcBlocks,
        ties: units(netArea * spec.tiesPerM2),
        sandKg,
        cementBags,
        lintelCounts,
        openingLintels,
        cavityTrays: cavity ? totalTrays : 0,
        weepVents: cavity ? totalWeeps : 0,
        starterKits,
        airBrickCount: input.airBricks ? Math.max(2, Math.ceil(input.lengthM / 1.5)) : 0,
    };
}

export function calculateMasonry(input: MasonryInput): BillOfMaterials {
    const plan = planMasonry(input);
    const cavity = input.construction === 'cavity';
    const openings = input.openings.filter((o) => o.widthMm > 0).length;
    const beams = Math.round(input.beams);
    const hasBlocks = plan.blocks > 0;
    const thermalite = input.blockType === 'thermalite' || input.blockType === 'mixed';
    const t = input.blockThicknessMm;

    const innerLabel = cavity ? ' (inner leaf)' : '';
    const blockLine: BomLine | null = hasBlocks
        ? thermalite
            ? {
                  id: 'blocks',
                  name: t >= 215 ? 'Thermalite Party Wall block, 215 mm' : '100 mm Thermalite Hi-Strength block, 7.3 N',
                  detail: (t >= 215 ? '440 × 215 mm aircrete, sound-tested for separating walls' : '440 × 215 mm aircrete, the insulating inner leaf') + innerLabel,
                  qty: plan.blocks,
                  unit: 'blocks',
              }
            : {
                  id: 'blocks',
                  name: `Concrete Block Dense 7N, ${t} mm solid`,
                  detail: '440 × 215 mm, load-bearing and below-ground work' + innerLabel,
                  qty: plan.blocks,
                  unit: 'blocks',
              }
        : null;

    const masonryLines: BomLine[] = [
        ...(plan.bricks > 0
            ? [
                  {
                      id: 'bricks',
                      name: '65 mm facing brick (e.g. Tuscan Red, Harvest Buff Multi)',
                      detail: 'inc. 5% cuts and breakages, pick the face in branch',
                      qty: plan.bricks,
                      unit: 'bricks',
                  },
              ]
            : []),
        ...(plan.engineeringBricks > 0
            ? [
                  {
                      id: 'eng-bricks',
                      name: '65 mm Class B engineering brick',
                      detail:
                          input.dpcCourses && input.brickType === 'facing'
                              ? 'two courses below DPC, dense and frost-proof'
                              : 'dense, low absorption, high strength',
                      qty: plan.engineeringBricks,
                      unit: 'bricks',
                  },
              ]
            : []),
        ...(plan.outerBlocks > 0
            ? [
                  {
                      id: 'outer-blocks',
                      name: `Concrete Block Dense 7N, ${input.outerBlockThicknessMm} mm solid (outer leaf)`,
                      detail: '440 × 215 mm, the render-ready outer skin',
                      qty: plan.outerBlocks,
                      unit: 'blocks',
                  },
              ]
            : []),
        ...(blockLine ? [blockLine] : []),
        ...(plan.denseDpcBlocks > 0
            ? [
                  {
                      id: 'dpc-blocks',
                      name: `Concrete Block Dense 7N, ${Math.min(t, 140)} mm solid`,
                      detail: input.blockType === 'mixed'
                          ? 'the dense base courses, aircrete stays out of the wet'
                          : 'one course below DPC, aircrete stays out of the wet',
                      qty: plan.denseDpcBlocks,
                      unit: 'blocks',
                  },
              ]
            : []),
        ...(plan.ties > 0
            ? [
                  {
                      id: 'ties',
                      name: 'Stainless cavity wall ties, type 2',
                      detail: '2.5/m² at 900 × 450 mm staggered centres',
                      qty: plan.ties,
                      unit: 'ties',
                  },
              ]
            : []),
        ...(cavity && input.cavityInsulation
            ? [
                  {
                      id: 'cavity-batts',
                      name: `Full-fill cavity wall batt, ${input.cavityWidthMm} mm`,
                      detail: 'sized to the cavity, built in as the wall rises',
                      qty: units(plan.netAreaM2 / 6.5),
                      unit: 'packs',
                  },
                  {
                      id: 'retaining-discs',
                      name: 'Insulation retaining discs',
                      detail: 'one clips onto every wall tie',
                      qty: plan.ties,
                      unit: 'discs',
                  },
              ]
            : []),
        ...(plan.starterKits > 0
            ? [
                  {
                      id: 'wall-starters',
                      name: 'Stainless wall starter kit, 2.4 m',
                      detail: 'ties the new wall into the existing one, kit per leaf with ties and fixings',
                      qty: plan.starterKits,
                      unit: 'kits',
                  },
              ]
            : []),
    ];

    const mortarLines: BomLine[] = [
        ...aggregateLines('sand', 'Building Sand', plan.sandKg),
        {
            id: 'cement',
            name: 'Rugby Premium Cement',
            detail: '25 kg bag, 1:5 with plasticiser',
            qty: units(plan.cementBags),
            unit: 'bags',
        },
        {
            id: 'plasticiser',
            name: 'Sealomix mortar plasticiser',
            detail: '5 L bottle',
            qty: units(plan.cementBags / 20) || 1,
            unit: 'bottles',
        },
    ];

    const openingLines: BomLine[] = [];
    if (openings > 0) {
        const lintelWidth = Math.min(t || 100, 140);
        for (const lc of plan.lintelCounts) {
            openingLines.push(
                input.lintelType === 'steel'
                    ? cavity
                        ? {
                              id: `lintels-${lc.lengthMm}`,
                              name: `Steel cavity lintel L1/S ${input.cavityWidthMm}, ${lc.lengthMm} mm`,
                              detail: `the code matches your ${input.cavityWidthMm} mm cavity, 150 mm bearing each end`,
                              qty: lc.count,
                              unit: 'lintels',
                          }
                        : input.construction === 'one-brick'
                          ? {
                                id: `lintels-${lc.lengthMm}`,
                                name: `L9 solid wall steel lintel, ${lc.lengthMm} mm`,
                                detail: 'one per opening, 150 mm bearing each end',
                                qty: lc.count,
                                unit: 'lintels',
                            }
                          : {
                                id: `lintels-${lc.lengthMm}`,
                                name: `L10 single leaf steel lintel, ${lc.lengthMm} mm`,
                                detail: 'internal single leaf lintels also stocked, 150 mm bearing each end',
                                qty: lc.count,
                                unit: 'lintels',
                            }
                    : {
                          id: `lintels-${lc.lengthMm}`,
                          name: `Supreme prestressed concrete lintel, ${input.construction === 'one-brick' ? 215 : lintelWidth} mm × ${lc.lengthMm} mm`,
                          detail: cavity
                              ? 'one per leaf per opening, 150 mm bearing each end'
                              : 'one per opening, 150 mm bearing each end',
                          qty: cavity ? lc.count * 2 : lc.count,
                          unit: 'lintels',
                      },
            );
        }
        if (plan.cavityTrays > 0) {
            openingLines.push(
                {
                    id: 'cavity-trays',
                    name: 'Type E cavity tray',
                    detail: 'interlocking units over every opening',
                    qty: plan.cavityTrays,
                    unit: 'trays',
                },
                {
                    id: 'weep-vents',
                    name: 'Weep vents',
                    detail: 'max 450 mm apart, never fewer than two per opening',
                    qty: plan.weepVents,
                    unit: 'vents',
                },
            );
        }
    }
    if (beams > 0) {
        const pad = PADSTONES.find((x) => x.id === input.padstoneId) ?? PADSTONES[0];
        openingLines.push({
            id: 'padstones',
            name: `Concrete padstone ${pad.id}, ${pad.label}`,
            detail: 'two per beam, spreads the point load. Your engineer sizes these',
            qty: beams * 2,
            unit: 'padstones',
        });
    }

    const dampLines: BomLine[] = [
        ...(input.dpcCourses || input.blockType === 'mixed'
            ? (() => {
                  // One DPC run per leaf, width picked for that leaf.
                  const leaves: number[] = cavity
                      ? [plan.outerBlocks > 0 ? input.outerBlockThicknessMm : 102, t]
                      : input.construction === 'one-brick'
                        ? [215]
                        : input.construction === 'block'
                          ? [t]
                          : [102];
                  const byWidth = new Map<number, number>();
                  for (const leaf of leaves) {
                      const w = dpcWidthFor(leaf);
                      byWidth.set(w, (byWidth.get(w) ?? 0) + units(input.lengthM / 30));
                  }
                  return [...byWidth.entries()].map(([w, qty]) => ({
                      id: `dpc-${w}`,
                      name: `DPC roll, ${w} mm × 30 m`,
                      detail: 'bedded 150 mm above ground level',
                      qty,
                      unit: 'rolls',
                  }));
              })()
            : []),
        ...(plan.airBrickCount > 0
            ? [
                  {
                      id: 'air-bricks',
                      name: 'Red air brick, 215 × 65 mm',
                      detail: cavity ? 'with cranked telescopic vent through the cavity' : 'one per 1.5 m at the base',
                      qty: plan.airBrickCount,
                      unit: 'air bricks',
                  },
                  ...(cavity
                      ? [
                            {
                                id: 'telescopic',
                                name: 'Cranked telescopic air vent',
                                detail: 'carries airflow through the cavity',
                                qty: plan.airBrickCount,
                                unit: 'vents',
                            },
                        ]
                      : []),
              ]
            : []),
        ...(input.includeCopings
            ? [
                  {
                      id: 'copings',
                      name: `Supreme ${input.copingStyle === 'twice' ? 'twice' : 'once'} weathered coping stone`,
                      detail:
                          input.copingStyle === 'twice'
                              ? '600 mm, sheds rain both ways, the freestanding wall choice'
                              : '600 mm, sheds rain one way, suits walls against a building',
                      qty: units(input.lengthM / 0.6),
                      unit: 'copings',
                  },
              ]
            : []),
    ];

    const sections: BomSection[] = [
        { title: 'Masonry', lines: masonryLines },
        { title: 'Mortar', lines: mortarLines },
        ...(openingLines.length ? [{ title: 'Openings & bearings', lines: openingLines }] : []),
        ...(dampLines.length ? [{ title: 'Damp, ventilation & capping', lines: dampLines }] : []),
    ];

    return {
        facts: [
            { label: 'Wall face', value: fmtM2(plan.netAreaM2) + (openings ? ' net' : '') },
            {
                label: 'Construction',
                value:
                    input.construction === 'block'
                        ? `${t} mm ${thermalite ? 'Thermalite' : 'dense'} block wall`
                        : cavity
                          ? `Cavity wall (${plan.outerBlocks > 0 ? 'block' : 'brick'} + ${thermalite ? 'Thermalite' : 'block'})`
                          : plan.spec.label,
            },
            ...(plan.bricks + plan.engineeringBricks > 0
                ? [{ label: 'Bricks', value: `${plan.bricks + plan.engineeringBricks}` }]
                : []),
            ...(plan.blocks > 0 ? [{ label: 'Blocks', value: `${plan.blocks + plan.denseDpcBlocks}` }] : []),
        ],
        sections,
        tools: [
            'Brick trowel, pointing trowel and a jointer for the bucket-handle finish',
            'String line, pins and corner blocks. Courses run to the line, not the eye',
            'Spirit levels: 1.2 m for the wall, boat level for single bricks',
            'Powered cement mixer (hire) past about 250 bricks a day',
            'Bolster, lump hammer and a brick gauge or storey rod',
            'Spot boards, a shovel and a sheet to cover fresh work from rain and frost',
        ],
        notes: [
            'Gauge: 4 brick courses = 300 mm including joints. Set a storey rod before you start.',
            cavity
                ? 'Cavity walls are Building Regs territory: insulation, trays, weeps and ties all get inspected. This list is your starting point, not your sign-off.'
                : 'Freestanding walls over about 1.2 m, or any wall holding ground back, need proper design. Ask before you build.',
            ...(thermalite && hasBlocks
                ? ['Thermalite is the usual inner leaf, it does the insulating. Keep it above the DPC, dense block handles the wet ground below.']
                : []),
            ...(plan.outerBlocks > 0
                ? ['A block outer leaf wants a render system over it. The rendering calculator will count the sand, cement and beads for you.']
                : []),
            ...(plan.starterKits > 0
                ? ['Wall starter kits screw to the existing wall plumb, then every course hooks a tie in. Far cleaner than toothing out.']
                : []),
            'No laying below 3 °C and falling. Cover fresh work against rain and frost.',
            'Walls over 6 m long need a movement joint.',
        ],
    };
}
