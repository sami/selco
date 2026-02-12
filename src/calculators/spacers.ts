import type { SpacersInput, SpacersResult } from './types';

/** Common spacer sizes for dropdown presets. */
export const SPACER_SIZES = [
    { value: 1, label: '1 mm' },
    { value: 1.5, label: '1.5 mm' },
    { value: 2, label: '2 mm' },
    { value: 3, label: '3 mm' },
    { value: 4, label: '4 mm' },
    { value: 5, label: '5 mm' },
];

/**
 * Calculate the number of tile spacers needed for a project.
 *
 * Cross layout uses 4 spacers per tile, T-junction uses 3.
 *
 * @param input - Area, tile dimensions, layout pattern, and wastage.
 * @returns Spacers needed and pack counts (100 and 250).
 * @throws If area or tile dimensions are zero or negative.
 */
export function calculateSpacers(input: SpacersInput): SpacersResult {
    const { areaM2, tileWidthMm, tileHeightMm, layout, wastage } = input;

    if (areaM2 <= 0) {
        throw new Error('Area must be greater than zero.');
    }
    if (tileWidthMm <= 0 || tileHeightMm <= 0) {
        throw new Error('Tile dimensions must be greater than zero.');
    }
    if (wastage < 0 || wastage > 100) {
        throw new Error('Wastage must be between 0 and 100.');
    }

    const tileSizeM2 = (tileWidthMm / 1000) * (tileHeightMm / 1000);
    const tiles = Math.ceil(areaM2 / tileSizeM2);

    const spacersPerTile = layout === 'cross' ? 4 : 3;
    const spacersNeeded = Math.ceil(tiles * spacersPerTile * (1 + wastage / 100));

    const packs100 = Math.ceil(spacersNeeded / 100);
    const packs250 = Math.ceil(spacersNeeded / 250);

    return { spacersNeeded, packs100, packs250 };
}
