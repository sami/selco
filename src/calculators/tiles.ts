import type { TileInput, TileResult } from './types';

/** Common UK tile sizes for dropdown presets. */
export const COMMON_TILE_SIZES = [
    { width: 300, height: 300, label: '300 × 300 mm' },
    { width: 600, height: 300, label: '600 × 300 mm' },
    { width: 200, height: 100, label: '200 × 100 mm (metro)' },
    { width: 600, height: 600, label: '600 × 600 mm' },
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
