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
 *   - cavity wall: facing brick outer leaf + block inner leaf, tied at
 *     2.5 ties/m², with full-fill cavity batts as standard
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
export type BlockType = 'dense' | 'thermalite';
export type LintelType = 'concrete' | 'steel';
export type CopingStyle = 'once' | 'twice';

export interface MasonryInput {
    lengthM: number;
    heightM: number;
    construction: WallConstruction;
    brickType: BrickType;
    blockType: BlockType;
    /** Dense: 100 or 140. Thermalite: 100, or 215 party wall. */
    blockThicknessMm: number;
    /** Door/window openings in the wall, all at this width. */
    openings: number;
    openingWidthMm: number;
    lintelType: LintelType;
    /** Steel beams bearing on the wall (2 padstones each). */
    beams: number;
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

export interface MasonryPlan {
    areaM2: number;
    netAreaM2: number;
    spec: ConstructionSpec;
    bricks: number;
    engineeringBricks: number;
    blocks: number;
    /** Dense blocks below DPC when the wall above is Thermalite. */
    denseDpcBlocks: number;
    ties: number;
    sandKg: number;
    cementBags: number;
    lintelLengthMm: number;
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
    const openings = Math.round(input.openings);
    const openingArea = openings * (input.openingWidthMm / 1000) * Math.min(1.2, input.heightM * 0.6);
    const netArea = Math.max(0, area - openingArea);

    let bricks = units(netArea * spec.bricksPerM2 * 1.05);
    let engineeringBricks = 0;
    const hasBlocks = spec.blocksPerM2 > 0;
    const thermalite = input.blockType === 'thermalite' && hasBlocks;

    if (input.dpcCourses && spec.bricksPerM2 > 0) {
        // Two courses below DPC, ~13.4 bricks per metre per course per skin.
        const brickSkins = input.construction === 'one-brick' ? 2 : 1;
        engineeringBricks = units(input.lengthM * 13.4 * 2 * brickSkins);
    }
    if (input.brickType === 'engineering') {
        engineeringBricks += bricks;
        bricks = 0;
    }

    const blocks = units(netArea * spec.blocksPerM2 * 1.05);
    // Aircrete stays out of the ground: one course of dense block below
    // DPC under a Thermalite leaf (440 mm long blocks).
    const denseDpcBlocks =
        input.dpcCourses && thermalite ? units(input.lengthM / 0.44) : 0;

    // Mortar: bricks at ~0.85 kg sand each; blocks scale with thickness
    // (the 2.1 kg base rate is for a 100 mm block).
    const blockSandFactor = input.blockThicknessMm / 100;
    const totalBrickish = bricks + engineeringBricks;
    const sandKg = totalBrickish * 0.85 + (blocks + denseDpcBlocks) * 2.1 * blockSandFactor;
    const cementBags = totalBrickish * 0.01 + (blocks + denseDpcBlocks) * 0.025 * blockSandFactor;

    const neededMm = input.openingWidthMm + 300;
    const lintelLengthMm = LINTEL_LENGTHS.find((l) => l >= neededMm) ?? 3000;

    // Cavity trays interlock in ~450 mm units over each lintel; weep vents
    // at max 450 mm centres, never fewer than two per opening.
    const cavity = input.construction === 'cavity';
    const traysPerOpening = Math.ceil(lintelLengthMm / 450);
    const weepsPerOpening = Math.max(2, Math.ceil(input.openingWidthMm / 450));

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
        denseDpcBlocks,
        ties: units(netArea * spec.tiesPerM2),
        sandKg,
        cementBags,
        lintelLengthMm,
        cavityTrays: cavity ? traysPerOpening * openings : 0,
        weepVents: cavity ? weepsPerOpening * openings : 0,
        starterKits,
        airBrickCount: input.airBricks ? Math.max(2, Math.ceil(input.lengthM / 1.5)) : 0,
    };
}

export function calculateMasonry(input: MasonryInput): BillOfMaterials {
    const plan = planMasonry(input);
    const cavity = input.construction === 'cavity';
    const openings = Math.round(input.openings);
    const beams = Math.round(input.beams);
    const hasBlocks = plan.blocks > 0;
    const thermalite = input.blockType === 'thermalite';
    const t = input.blockThicknessMm;

    const blockLine: BomLine | null = hasBlocks
        ? thermalite
            ? {
                  id: 'blocks',
                  name: t >= 215 ? 'Thermalite Party Wall block, 215 mm' : '100 mm Thermalite Hi-Strength block, 7.3 N',
                  detail: t >= 215 ? '440 × 215 mm aircrete, sound-tested for separating walls' : '440 × 215 mm aircrete, light, insulating, easy to cut',
                  qty: plan.blocks,
                  unit: 'blocks',
              }
            : {
                  id: 'blocks',
                  name: `Concrete Block Dense 7N, ${t} mm solid`,
                  detail: '440 × 215 mm, load-bearing and below-ground work',
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
        ...(blockLine ? [blockLine] : []),
        ...(plan.denseDpcBlocks > 0
            ? [
                  {
                      id: 'dpc-blocks',
                      name: `Concrete Block Dense 7N, ${Math.min(t, 140)} mm solid`,
                      detail: 'one course below DPC, aircrete stays out of the wet',
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
                      name: 'Full-fill cavity wall batt, 100 mm',
                      detail: 'pack covers ~6.5 m², built in as the wall rises',
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
        openingLines.push(
            input.lintelType === 'steel'
                ? cavity
                    ? {
                          id: 'lintels',
                          name: `Steel cavity lintel L1/S100, ${plan.lintelLengthMm} mm`,
                          detail: 'one per opening, 150 mm bearing each end',
                          qty: openings,
                          unit: 'lintels',
                      }
                    : {
                          id: 'lintels',
                          name: `Single leaf steel lintel, ${plan.lintelLengthMm} mm`,
                          detail: 'one per opening per leaf, 150 mm bearing each end',
                          qty: input.construction === 'one-brick' ? openings * 2 : openings,
                          unit: 'lintels',
                      }
                : {
                      id: 'lintels',
                      name: `Supreme prestressed concrete lintel, ${input.construction === 'one-brick' ? 215 : lintelWidth} mm × ${plan.lintelLengthMm} mm`,
                      detail: cavity
                          ? 'one per leaf per opening, 150 mm bearing each end'
                          : 'one per opening, 150 mm bearing each end',
                      qty: cavity ? openings * 2 : openings,
                      unit: 'lintels',
                  },
        );
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
        openingLines.push({
            id: 'padstones',
            name: 'Supreme concrete padstone, 215 × 140 × 102 mm',
            detail: 'two per beam, spreads the point load',
            qty: beams * 2,
            unit: 'padstones',
        });
    }

    const dampLines: BomLine[] = [
        ...(input.dpcCourses
            ? [
                  {
                      id: 'dpc',
                      name: 'DPC roll, 112 mm × 20 m',
                      detail: 'bedded 150 mm above ground level',
                      qty: units(input.lengthM / 20) * (cavity || input.construction === 'one-brick' ? 2 : 1),
                      unit: 'rolls',
                  },
              ]
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
                ? ['Thermalite cuts with a hand saw and takes fixings well, but keep it above the DPC. Dense block handles the wet ground below.']
                : []),
            ...(plan.starterKits > 0
                ? ['Wall starter kits screw to the existing wall plumb, then every course hooks a tie in. Far cleaner than toothing out.']
                : []),
            'No laying below 3 °C and falling. Cover fresh work against rain and frost.',
            'Walls over 6 m long need a movement joint.',
        ],
    };
}
