import type { AdhesiveInput, AdhesiveResult } from './types';

/**
 * Determine the adhesive coverage rate based on largest tile edge.
 *
 * - ≤ 200 mm → 2.0 kg/m²
 * - ≤ 400 mm → 3.5 kg/m²
 * - ≤ 600 mm → 5.0 kg/m²
 * - > 600 mm → 5.5 kg/m²
 */
function getCoverageRate(tileSize: number): number {
    if (tileSize <= 200) return 2.0;
    if (tileSize <= 400) return 3.5;
    if (tileSize <= 600) return 5.0;
    return 5.5;
}

/**
 * Calculate the amount of adhesive needed for a tiling project.
 *
 * @param input - Area, tile size, wastage percentage, and bag size.
 * @returns Kg needed, bags needed, and the coverage rate used.
 * @throws If area or tile size is zero or negative.
 */
export function calculateAdhesive(input: AdhesiveInput): AdhesiveResult {
    const { area, tileSize, wastage, bagSize } = input;

    if (area <= 0) {
        throw new Error('Area must be greater than zero.');
    }
    if (tileSize <= 0) {
        throw new Error('Tile size must be greater than zero.');
    }

    const coverageRate = getCoverageRate(tileSize);
    const kgNeeded = area * coverageRate * (1 + wastage / 100);
    const bagsNeeded = Math.ceil(kgNeeded / bagSize);

    return { kgNeeded, bagsNeeded, coverageRate };
}
