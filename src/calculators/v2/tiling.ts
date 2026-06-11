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
    { id: 'metro', label: 'Metro 200×100', wMm: 200, hMm: 100 },
    { id: '250x500', label: 'Wall 500×250', wMm: 500, hMm: 250 },
    { id: '300x600', label: '600×300', wMm: 600, hMm: 300 },
    { id: '600x600', label: '600×600', wMm: 600, hMm: 600 },
];

export interface TilingInput {
    widthM: number;
    heightM: number;
    tileId: string;
    surface: 'wall' | 'floor';
    /** Cutting waste percentage — 10 straight, 15 diagonal/brick-bond. */
    wastePct: number;
    includeTrim: boolean;
    /** Wet-zone tanking behind showers and baths. */
    tanking: boolean;
    /** Cement backer board instead of tiling straight onto the wall/floor. */
    backerBoard: boolean;
    /** Self-levelling compound first (floors). */
    levelling: boolean;
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
            ...(input.backerBoard || input.tanking || input.levelling
                ? [
                      {
                          title: 'Getting the surface right',
                          lines: [
                              ...(input.levelling && !wall
                                  ? [
                                        {
                                            id: 'slc',
                                            name: 'Dunlop LX-40 levelling compound',
                                            detail: '20 kg bag, roughly 4 m² at 3 mm',
                                            qty: units(a / 4),
                                            unit: 'bags',
                                        },
                                    ]
                                  : []),
                              ...(input.backerBoard
                                  ? [
                                        {
                                            id: 'backer',
                                            name: 'Hardie Backer tile backerboard, 12 mm',
                                            detail: '1200 × 800 mm (0.96 m²)',
                                            qty: units(Math.min(a, 8) / 0.96),
                                            unit: 'boards',
                                        },
                                    ]
                                  : []),
                              ...(input.tanking
                                  ? [
                                        {
                                            id: 'tanking',
                                            name: 'Tile Rite waterproof wall matting',
                                            detail: 'covers 5 m², the shower zone plus 300 mm beyond',
                                            qty: units(Math.min(a, 10) / 5),
                                            unit: 'kits',
                                        },
                                        {
                                            id: 'corners',
                                            name: 'Tile Rite pre-formed fabric corners',
                                            detail: 'internal corners of the wet zone',
                                            qty: 4,
                                            unit: 'corners',
                                        },
                                    ]
                                  : []),
                          ],
                      },
                  ]
                : []),
            {
                title: 'Tiles & fixing',
                lines: [
                    {
                        id: 'tiles',
                        name: wall
                            ? `Ceramic wall tile, ${plan.tile.label} mm (e.g. Carrara, Metro ranges)`
                            : `Porcelain floor tile, ${plan.tile.label} mm (e.g. Highbury, Regency ranges)`,
                        detail: `${plan.cols} × ${plan.rows} grid + ${input.wastePct}% cuts`,
                        qty: plan.tiles,
                        unit: 'tiles',
                    },
                    {
                        id: 'adhesive',
                        name: wall
                            ? 'Dunlop CX-24 Essential tile adhesive, white'
                            : 'Dunlop CX-03 fast set adhesive, grey',
                        detail: `20 kg bag, about ${adhesiveM2PerBag} m² at a ${wall ? 6 : 10} mm bed`,
                        qty: units(a / adhesiveM2PerBag),
                        unit: 'bags',
                    },
                    {
                        id: 'grout',
                        name: 'Dunlop GX-500 flexible floor & wall grout',
                        detail: `10 kg bag, ${plan.jointMm} mm joints on this format`,
                        qty: units(groutKg / 10),
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
                        name: 'Dunlop multi-purpose primer',
                        detail: '1 kg, seals porous surfaces before the adhesive',
                        qty: units(a / 40),
                        unit: 'bottles',
                    },
                    ...(input.includeTrim
                        ? [
                              {
                                  id: 'trim',
                                  name: 'Tile trim, 2.44 m (chrome or PVC)',
                                  detail: 'external edges, match your tile depth',
                                  qty: units((input.widthM + input.heightM * 2) / 2.44),
                                  unit: 'lengths',
                              },
                          ]
                        : []),
                    {
                        id: 'silicone',
                        name: 'Mould-resistant sanitary silicone',
                        detail: 'every internal corner and junction, never grout them',
                        qty: units(a / 10) + 1,
                        unit: 'cartridges',
                    },
                ],
            },
        ],
        tools: [
            'Manual tile cutter bigger than your tile diagonal, plus a tile saw for cut-outs',
            `Notched trowel (${wall ? '6' : '10'} mm) and a grout float`,
            'Tile levelling clips for formats over 300 mm',
            'Laser level. Set out from a level batten, never the floor or bath edge',
            'Mixing paddle, two buckets and plenty of clean sponges',
            'Grout profiling tool and masking tape for the silicone',
        ],
        notes: [
            'Works for any room: bathroom, kitchen splashback, hallway floor. Tick the tanking option for shower zones.',
            'Centre the layout so the cuts at both ends match. Never start with a full tile tight in a corner.',
            input.tanking
                ? 'Tank the shower enclosure plus 300 mm beyond it. Plasterboard holds ~32 kg/m² of tile, cement board ~50 kg/m².'
                : `${plan.jointMm} mm joints assumed for ${wall ? 'walls' : 'floors'}.`,
            'Buy all your tiles in one go and check the batch numbers match.',
        ],
    };
}
