/**
 * @file src/calculators/v2/tiling.ts
 *
 * Tiling estimator — v2 rebuild of the v1 flagship.
 *
 * Plans the tile grid for the area (like a setter would chalk it out),
 * then quantifies adhesive, grout, spacers, trim and silicone. Grout usage
 * scales with tile format: small tiles mean more joint per m².
 */

import type { BillOfMaterials } from './types';
import { fmtM2, units } from './types';

export interface TileFormat {
    id: string;
    label: string;
    wMm: number;
    hMm: number;
}

export const TILE_FORMATS: TileFormat[] = [
    { id: 'metro', label: '200 × 100 metro', wMm: 200, hMm: 100 },
    { id: '300x600', label: '600 × 300', wMm: 600, hMm: 300 },
    { id: '600x600', label: '600 × 600', wMm: 600, hMm: 600 },
];

export interface TilingInput {
    widthM: number;
    heightM: number;
    tileId: string;
    surface: 'wall' | 'floor';
    /** Cutting waste percentage — 10 straight, 15 diagonal/brick-bond. */
    wastePct: number;
    includeTrim: boolean;
}

export interface TilingPlan {
    areaM2: number;
    tile: TileFormat;
    cols: number;
    rows: number;
    tiles: number;
    jointMm: number;
    /** Linear metres of grout joint across the whole area. */
    jointLm: number;
}

export function planTiling(input: TilingInput): TilingPlan {
    const tile = TILE_FORMATS.find((t) => t.id === input.tileId) ?? TILE_FORMATS[1];
    const jointMm = input.surface === 'wall' ? 2 : 3;
    const moduleW = (tile.wMm + jointMm) / 1000;
    const moduleH = (tile.hMm + jointMm) / 1000;
    const cols = Math.max(1, Math.ceil(input.widthM / moduleW));
    const rows = Math.max(1, Math.ceil(input.heightM / moduleH));
    const areaM2 = input.widthM * input.heightM;
    // Joint length ≈ area × (1/tileW + 1/tileH) in metres.
    const jointLm = areaM2 * (1000 / tile.wMm + 1000 / tile.hMm);
    return {
        areaM2,
        tile,
        cols,
        rows,
        tiles: units(cols * rows * (1 + input.wastePct / 100)),
        jointMm,
        jointLm,
    };
}

export function calculateTiling(input: TilingInput): BillOfMaterials {
    const plan = planTiling(input);
    const a = plan.areaM2;
    const wall = input.surface === 'wall';

    // Adhesive: 20 kg powder ≈ 4 m² at 6 mm solid bed (walls) / 10 mm (floors ≈ 2.7 m²).
    const adhesiveM2PerBag = wall ? 4 : 2.7;
    // Grout: kg ≈ joint lm × joint width × tile depth × 1.8 density (approx).
    const tileDepthMm = wall ? 8 : 10;
    const groutKg = plan.jointLm * (plan.jointMm / 1000) * tileDepthMm * 1.8;

    return {
        facts: [
            { label: 'Tiled area', value: fmtM2(a) },
            { label: 'Tile', value: plan.tile.label },
            { label: 'Grid', value: `${plan.cols} × ${plan.rows} tiles` },
            { label: 'Total tiles', value: `${plan.tiles} inc. ${input.wastePct}% cuts` },
        ],
        sections: [
            {
                title: 'Tiles & fixing',
                lines: [
                    {
                        id: 'tiles',
                        name: `Ceramic ${wall ? 'wall' : 'porcelain floor'} tile, ${plan.tile.label} mm`,
                        detail: `${plan.cols} × ${plan.rows} grid + ${input.wastePct}% cuts`,
                        qty: plan.tiles,
                        unit: 'tiles',
                    },
                    {
                        id: 'adhesive',
                        name: wall
                            ? 'BAL white wall tile adhesive (powder)'
                            : 'Mapei rapid-set flexible floor adhesive',
                        detail: `20 kg bag ≈ ${adhesiveM2PerBag} m² at a ${wall ? 6 : 10} mm bed`,
                        qty: units(a / adhesiveM2PerBag),
                        unit: 'bags',
                    },
                    {
                        id: 'grout',
                        name: 'Mapei Ultracolor Plus grout',
                        detail: `5 kg bag — ${plan.jointMm} mm joints on this format`,
                        qty: units(groutKg / 5),
                        unit: 'bags',
                    },
                    {
                        id: 'spacers',
                        name: `Tile spacers, ${plan.jointMm} mm`,
                        detail: 'bag of 500',
                        qty: units((plan.cols * plan.rows * 4) / 500),
                        unit: 'bags',
                    },
                ],
            },
            {
                title: 'Prep & finishing',
                lines: [
                    {
                        id: 'primer',
                        name: 'BAL APD acrylic primer',
                        detail: 'porous backgrounds before adhesive',
                        qty: units(a / 40),
                        unit: 'bottles',
                    },
                    ...(input.includeTrim
                        ? [
                              {
                                  id: 'trim',
                                  name: 'Tile trim (chrome / PVC), 2.44 m',
                                  detail: 'external edges — match tile depth',
                                  qty: units((input.widthM + input.heightM * 2) / 2.44),
                                  unit: 'lengths',
                              },
                          ]
                        : []),
                    {
                        id: 'silicone',
                        name: 'Everbuild Forever White sanitary silicone',
                        detail: 'internal corners and junctions — never grout them',
                        qty: units(a / 10) + 1,
                        unit: 'cartridges',
                    },
                ],
            },
        ],
        tools: [
            'Manual tile cutter sized over your tile diagonal — plus a tile saw for cut-outs',
            `Notched trowel (${wall ? '6' : '10'} mm) and a grout float`,
            'Tile levelling clip system for formats over 300 mm',
            'Laser level — set out from a level datum batten, never the floor or bath edge',
            'Mixing paddle, two buckets and plenty of clean sponges',
            'Grout profiling tool and masking tape for the silicone day',
        ],
        notes: [
            'Centre the layout so cuts at opposite ends match — never start with a full tile tight in a corner.',
            `${plan.jointMm} mm joints assumed (${wall ? 'walls' : 'floors'}); rectified porcelain can go tighter.`,
            'Order all tiles at once and check batch/shade numbers match.',
        ],
    };
}
