/**
 * @file src/calculators/v2/masonry.ts
 *
 * Brick & block wall estimator, mapped to Selco's stocked range.
 *
 * Wall types use the trade wording:
 *   - half-brick wall (102 mm): single skin in stretcher bond
 *   - one-brick wall (215 mm): solid wall, two skins bonded together
 *   - 100 mm block wall: internal, garden or inner-leaf work
 *   - cavity wall: facing brick outer leaf + 100 mm block inner leaf,
 *     tied at 2.5 ties/m²
 *
 * Bricks: facing (65 mm) or Class B engineering. Blocks: dense 7N or
 * Thermalite Hi-Strength 7.3N aircrete. Openings drive prestressed
 * concrete or steel cavity lintels with 150 mm bearings, plus cavity
 * trays on cavity work. Below-DPC courses can switch to engineering
 * brick, air bricks ventilate suspended floors, padstones go under any
 * steel beam bearings, and copings cap freestanding garden walls.
 */

import type { BillOfMaterials, BomLine, BomSection } from './types';
import { fmtM2, units } from './types';

export type WallConstruction = 'half-brick' | 'one-brick' | 'block' | 'cavity';
export type BrickType = 'facing' | 'engineering';
export type BlockType = 'dense' | 'thermalite';
export type OpeningSize = '900' | '1200' | '1800';

export interface MasonryInput {
    lengthM: number;
    heightM: number;
    construction: WallConstruction;
    brickType: BrickType;
    blockType: BlockType;
    /** Door/window openings in the wall. */
    openings: number;
    openingWidthMm: number;
    /** Steel beams bearing on the wall (2 padstones each). */
    beams: number;
    /** Two courses of Class B engineering brick below DPC + DPC roll. */
    dpcCourses: boolean;
    /** Air bricks at the base for suspended floor ventilation. */
    airBricks: boolean;
    /** Copings for a freestanding garden wall. */
    includeCopings: boolean;
}

interface ConstructionSpec {
    label: string;
    bricksPerM2: number;
    blocksPerM2: number;
    tiesPerM2: number;
}

export const CONSTRUCTIONS: Record<WallConstruction, ConstructionSpec> = {
    'half-brick': { label: 'Half-brick wall (102 mm)', bricksPerM2: 60, blocksPerM2: 0, tiesPerM2: 0 },
    'one-brick': { label: 'One-brick wall (215 mm)', bricksPerM2: 120, blocksPerM2: 0, tiesPerM2: 0 },
    block: { label: '100 mm block wall', bricksPerM2: 0, blocksPerM2: 10, tiesPerM2: 0 },
    cavity: { label: 'Cavity wall (brick + block)', bricksPerM2: 60, blocksPerM2: 10, tiesPerM2: 2.5 },
};

/** Supreme prestressed lintel stocked lengths, mm. */
const LINTEL_LENGTHS = [600, 900, 1050, 1200, 1350, 1500, 1800, 2100, 2400, 2700, 3000];

export interface MasonryPlan {
    areaM2: number;
    /** Face area after opening deductions. */
    netAreaM2: number;
    spec: ConstructionSpec;
    bricks: number;
    engineeringBricks: number;
    blocks: number;
    ties: number;
    sandKg: number;
    cementBags: number;
    lintelLengthMm: number;
    airBrickCount: number;
}

export function planMasonry(input: MasonryInput): MasonryPlan {
    const spec = CONSTRUCTIONS[input.construction];
    const area = input.lengthM * input.heightM;
    const openings = Math.round(input.openings);
    // Standard head heights: take each opening as width x 1.2 m of face.
    const openingArea = openings * (input.openingWidthMm / 1000) * Math.min(1.2, input.heightM * 0.6);
    const netArea = Math.max(0, area - openingArea);

    let bricks = units(netArea * spec.bricksPerM2 * 1.05);
    let engineeringBricks = 0;
    if (input.dpcCourses && spec.bricksPerM2 > 0) {
        // Two courses below DPC: ~13.3 bricks per metre per course per skin.
        const skins = input.construction === 'one-brick' ? 2 : 1;
        engineeringBricks = units(input.lengthM * 13.4 * 2 * skins);
    }
    if (input.brickType === 'engineering') {
        engineeringBricks += bricks;
        bricks = 0;
    }

    const blocks = units(netArea * spec.blocksPerM2 * 1.05);
    const totalBrickish = bricks + engineeringBricks;
    const sandKg = totalBrickish * 0.85 + blocks * 2.1;
    const cementBags = totalBrickish * 0.01 + blocks * 0.025;

    // Lintel: stocked length >= opening + 2 x 150 mm bearing.
    const neededMm = input.openingWidthMm + 300;
    const lintelLengthMm = LINTEL_LENGTHS.find((l) => l >= neededMm) ?? 3000;

    return {
        areaM2: area,
        netAreaM2: netArea,
        spec,
        bricks,
        engineeringBricks,
        blocks,
        ties: units(netArea * spec.tiesPerM2),
        sandKg,
        cementBags,
        lintelLengthMm,
        airBrickCount: input.airBricks ? Math.max(2, Math.ceil(input.lengthM / 1.5)) : 0,
    };
}

export function calculateMasonry(input: MasonryInput): BillOfMaterials {
    const plan = planMasonry(input);
    const cavity = input.construction === 'cavity';
    const openings = Math.round(input.openings);
    const beams = Math.round(input.beams);

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
                      detail: input.dpcCourses && input.brickType === 'facing'
                          ? 'two courses below DPC, dense and frost-proof'
                          : 'dense, low absorption, high strength',
                      qty: plan.engineeringBricks,
                      unit: 'bricks',
                  },
              ]
            : []),
        ...(plan.blocks > 0
            ? [
                  input.blockType === 'thermalite'
                      ? {
                            id: 'blocks',
                            name: '100 mm Thermalite Hi-Strength block, 7.3 N',
                            detail: '440 × 215 mm aircrete, light, insulating, easy to cut',
                            qty: plan.blocks,
                            unit: 'blocks',
                        }
                      : {
                            id: 'blocks',
                            name: 'Dense concrete block 7N, 100 mm solid',
                            detail: '440 × 215 mm, load-bearing and garden work',
                            qty: plan.blocks,
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
    ];

    const mortarLines: BomLine[] = [
        {
            id: 'sand',
            name: 'Building Sand',
            detail: 'Large Bag (~800 kg)',
            qty: units(plan.sandKg / 800),
            unit: 'Large Bags',
        },
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
        openingLines.push(
            cavity
                ? {
                      id: 'lintels',
                      name: `Steel cavity lintel L1/S100, ${plan.lintelLengthMm} mm`,
                      detail: `one per opening, 150 mm bearing each end`,
                      qty: openings,
                      unit: 'lintels',
                  }
                : {
                      id: 'lintels',
                      name: `Supreme prestressed concrete lintel, 100 mm × ${plan.lintelLengthMm} mm`,
                      detail: `one per opening, 150 mm bearing each end`,
                      qty: input.construction === 'one-brick' ? openings * 2 : openings,
                      unit: 'lintels',
                  },
        );
        if (cavity) {
            openingLines.push({
                id: 'cavity-trays',
                name: 'Type E cavity tray + weep vents',
                detail: 'over every opening in a cavity wall',
                qty: openings,
                unit: 'sets',
            });
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
                      qty: units(input.lengthM / 20) * (input.construction === 'cavity' || input.construction === 'one-brick' ? 2 : 1),
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
                      name: 'Supreme once weathered coping stone',
                      detail: '600 mm, caps the wall against rain',
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
            { label: 'Construction', value: plan.spec.label },
            ...(plan.bricks + plan.engineeringBricks > 0
                ? [{ label: 'Bricks', value: `${plan.bricks + plan.engineeringBricks}` }]
                : []),
            ...(plan.blocks > 0 ? [{ label: 'Blocks', value: `${plan.blocks}` }] : []),
        ],
        sections,
        tools: [
            'Brick trowel, pointing trowel and a jointer for the bucket-handle finish',
            'String line, pins and corner blocks. Courses run to the line, not the eye',
            'Spirit levels: 1.2 m for the wall, boat level for single bricks',
            'Cement mixer (hire) past about 250 bricks a day',
            'Bolster, lump hammer and a brick gauge or storey rod',
            'Spot boards, a shovel and a sheet to cover fresh work from rain and frost',
        ],
        notes: [
            'Gauge: 4 brick courses = 300 mm including joints. Set a storey rod before you start.',
            cavity
                ? 'Cavity walls are Building Regs territory: insulation, trays, weeps and ties all get inspected. This list is your starting point, not your sign-off.'
                : 'Freestanding walls over about 1.2 m, or any wall holding ground back, need proper design. Ask before you build.',
            'No laying below 3 °C and falling. Cover fresh work against rain and frost.',
            'Walls over 6 m long need a movement joint.',
        ],
    };
}
