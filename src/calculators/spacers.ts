import type { SpacersInput, SpacersResult } from './types';

/**
 * Calculate the number of spacers needed for a tiling project.
 *
 * - Grid pattern: 4 spacers per tile
 * - Brick/offset pattern: 3 spacers per tile
 *
 * @param input - Number of tiles, layout pattern, and wastage percentage.
 * @returns Spacers needed and spacers-per-tile rate.
 * @throws If tile count is zero or negative.
 */
export function calculateSpacers(input: SpacersInput): SpacersResult {
    const { numberOfTiles, pattern, wastage } = input;

    if (numberOfTiles <= 0) {
        throw new Error('Number of tiles must be greater than zero.');
    }

    const spacersPerTile = pattern === 'brick' ? 3 : 4;
    const raw = numberOfTiles * spacersPerTile;
    const spacersNeeded = Math.ceil(raw * (1 + wastage / 100));

    return { spacersNeeded, spacersPerTile };
}
