/**
 * @file src/calculators/v2/masonry.ts
 *
 * Brick & block wall estimator — v2 rebuild of the v1 flagship.
 *
 * Merchant rules of thumb used:
 *   - facing bricks: 60/m² half-brick skin, 120/m² one-brick solid wall
 *   - 100 mm blocks: 10/m²
 *   - one bulk bag of sand + 10 bags cement lays ~1000 bricks or ~400 blocks
 */

import type { BillOfMaterials } from './types';
import { fmtM2, units } from './types';

export type WallConstruction = 'half-brick' | 'one-brick' | 'block' | 'cavity';

export interface MasonryInput {
    lengthM: number;
    heightM: number;
    construction: WallConstruction;
    includeDpc: boolean;
    includeCopings: boolean;
}

interface ConstructionSpec {
    label: string;
    bricksPerM2: number;
    blocksPerM2: number;
    /** Wall ties per m² (cavity work only). */
    tiesPerM2: number;
}

const CONSTRUCTIONS: Record<WallConstruction, ConstructionSpec> = {
    'half-brick': { label: 'Half-brick skin (102 mm)', bricksPerM2: 60, blocksPerM2: 0, tiesPerM2: 0 },
    'one-brick': { label: 'One-brick solid (215 mm)', bricksPerM2: 120, blocksPerM2: 0, tiesPerM2: 0 },
    block: { label: '100 mm block wall', bricksPerM2: 0, blocksPerM2: 10, tiesPerM2: 0 },
    cavity: { label: 'Cavity: brick + block', bricksPerM2: 60, blocksPerM2: 10, tiesPerM2: 2.5 },
};

export interface MasonryPlan {
    areaM2: number;
    spec: ConstructionSpec;
    bricks: number;
    blocks: number;
    ties: number;
    sandKg: number;
    cementBags: number;
}

export function planMasonry(input: MasonryInput): MasonryPlan {
    const spec = CONSTRUCTIONS[input.construction];
    const area = input.lengthM * input.heightM;
    const bricks = units(area * spec.bricksPerM2 * 1.05);
    const blocks = units(area * spec.blocksPerM2 * 1.05);
    // Mortar: per bulk bag sand (850 kg) + 10 cement → ~1000 bricks / ~400 blocks.
    const sandKg = bricks * 0.85 + blocks * 2.1;
    const cementBags = bricks * 0.01 + blocks * 0.025;
    return {
        areaM2: area,
        spec,
        bricks,
        blocks,
        ties: units(area * spec.tiesPerM2),
        sandKg,
        cementBags,
    };
}

export function calculateMasonry(input: MasonryInput): BillOfMaterials {
    const plan = planMasonry(input);

    return {
        facts: [
            { label: 'Wall face', value: fmtM2(plan.areaM2) },
            { label: 'Construction', value: plan.spec.label },
            ...(plan.bricks ? [{ label: 'Bricks', value: `${plan.bricks}` }] : []),
            ...(plan.blocks ? [{ label: 'Blocks', value: `${plan.blocks}` }] : []),
        ],
        sections: [
            {
                title: 'Masonry',
                lines: [
                    ...(plan.bricks
                        ? [
                              {
                                  id: 'bricks',
                                  name: 'Facing brick, 65 mm (e.g. Wienerberger range)',
                                  detail: 'inc. 5% cuts & breakages — check pack quantities',
                                  qty: plan.bricks,
                                  unit: 'bricks',
                              },
                          ]
                        : []),
                    ...(plan.blocks
                        ? [
                              {
                                  id: 'blocks',
                                  name: '7.3 N dense concrete block, 100 mm',
                                  detail: '440 × 215 mm — inc. 5% cuts',
                                  qty: plan.blocks,
                                  unit: 'blocks',
                              },
                          ]
                        : []),
                    ...(plan.ties
                        ? [
                              {
                                  id: 'ties',
                                  name: 'Stainless cavity wall ties, type 2',
                                  detail: '2.5/m² — 900 × 450 mm staggered centres',
                                  qty: plan.ties,
                                  unit: 'ties',
                              },
                          ]
                        : []),
                ],
            },
            {
                title: 'Mortar',
                lines: [
                    {
                        id: 'sand',
                        name: 'Hanson building sand',
                        detail: 'bulk bag (~850 kg)',
                        qty: units(plan.sandKg / 850),
                        unit: 'bulk bags',
                    },
                    {
                        id: 'cement',
                        name: 'Blue Circle Mastercrete cement',
                        detail: '25 kg bag — 1:5 with plasticiser',
                        qty: units(plan.cementBags),
                        unit: 'bags',
                    },
                    {
                        id: 'plasticiser',
                        name: 'Everbuild mortar plasticiser',
                        detail: '5 L bottle',
                        qty: units(plan.cementBags / 20) || 1,
                        unit: 'bottles',
                    },
                ],
            },
            {
                title: 'Damp & detailing',
                lines: [
                    ...(input.includeDpc
                        ? [
                              {
                                  id: 'dpc',
                                  name: 'Hyload-style DPC roll, 112 mm',
                                  detail: '20 m roll at 150 mm above ground',
                                  qty: units(input.lengthM / 20),
                                  unit: 'rolls',
                              },
                          ]
                        : []),
                    ...(input.includeCopings
                        ? [
                              {
                                  id: 'copings',
                                  name: 'Once-weathered concrete coping, 600 mm',
                                  detail: 'caps the wall against rain',
                                  qty: units(input.lengthM / 0.6),
                                  unit: 'copings',
                              },
                          ]
                        : []),
                ],
            },
        ],
        tools: [
            'Brick trowel, pointing trowel and a jointer (bucket handle finish)',
            'String line, pins and corner blocks — courses run to the line, not the eye',
            'Spirit levels: 1.2 m for the wall, boat level for individual bricks',
            'Cement mixer (hire) past ~250 bricks a day of mortar',
            'Bolster, lump hammer and a brick gauge / storey rod',
            'Spot boards, shovel and a sheet to cover work against rain and frost',
        ],
        notes: [
            'Gauge: 4 brick courses = 300 mm including joints — set a storey rod before you start.',
            'No laying below 3 °C and falling; cover fresh work against rain and frost.',
            'Walls over 6 m long need movement joints; freestanding walls over ~1.2 m may need piers — check.',
        ],
    };
}
