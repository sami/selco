import type { TileInput, TileResult } from './types';

/** Common UK tile sizes for dropdown presets. */
export const COMMON_TILE_SIZES = [
    // Small Wall & Metro Tiles
    { width: 150, height: 75, label: '150 × 75 mm (metro)' },
    { width: 200, height: 100, label: '200 × 100 mm (metro)' },
    { width: 300, height: 100, label: '300 × 100 mm (large metro)' },
    { width: 150, height: 150, label: '150 × 150 mm' },
    { width: 200, height: 200, label: '200 × 200 mm' },

    // Standard Wall & Floor Tiles
    { width: 250, height: 400, label: '250 × 400 mm' },
    { width: 250, height: 500, label: '250 × 500 mm' },
    { width: 300, height: 300, label: '300 × 300 mm' },
    { width: 330, height: 330, label: '330 × 330 mm' },
    { width: 450, height: 450, label: '450 × 450 mm' },
    { width: 600, height: 300, label: '600 × 300 mm' },

    // Wood-Effect Planks
    { width: 600, height: 150, label: '600 × 150 mm (plank)' },
    { width: 900, height: 150, label: '900 × 150 mm (plank)' },
    { width: 1200, height: 200, label: '1200 × 200 mm (plank)' },

    // Large Format & Outdoor Paving
    { width: 600, height: 600, label: '600 × 600 mm' },
    { width: 900, height: 600, label: '900 × 600 mm' },
    { width: 1200, height: 600, label: '1200 × 600 mm' },
];

/**
 * Calculate the number of tiles needed for a given area.
 *
 * @param input - Room and tile dimensions with wastage percentage.
 * @returns Tile count, coverage area, wastage amount, and optional packs.
 * @throws If any dimension is zero or negative.
 */
export function calculateTiles(input: TileInput): TileResult {
    const { areaWidth, areaHeight, tileWidth, tileHeight, wastage, packSize } = input;

    if (areaWidth <= 0 || areaHeight <= 0) {
        throw new Error('Area dimensions must be greater than zero.');
    }
    if (tileWidth <= 0 || tileHeight <= 0) {
        throw new Error('Tile dimensions must be greater than zero.');
    }
    if (wastage < 0 || wastage > 100) {
        throw new Error('Wastage must be between 0 and 100.');
    }

    const coverageArea = areaWidth * areaHeight;
    const tileSizeM2 = (tileWidth / 1000) * (tileHeight / 1000);
    const rawTiles = coverageArea / tileSizeM2;

    const wastageMultiplier = 1 + wastage / 100;

    // Round to 10 decimal places before ceiling to avoid IEEE 754 artefacts
    // e.g. 6 / 0.18 * 1.05 = 35.00000000000001 → should ceil to 35, not 36
    const safeCeil = (n: number) => Math.ceil(Math.round(n * 1e10) / 1e10);

    const tilesNeeded = safeCeil(rawTiles * wastageMultiplier);
    const wastageAmount = safeCeil(rawTiles * (wastage / 100));

    const result: TileResult = { tilesNeeded, coverageArea, wastageAmount };

    if (packSize && packSize > 0) {
        result.packsNeeded = Math.ceil(tilesNeeded / packSize);
    }

    return result;
}
