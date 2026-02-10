import type { GroutInput, GroutResult } from './types';

/**
 * Calculate the amount of grout needed for a tiling project.
 *
 * Uses the industry-standard formula:
 *   kgPerM2 = ((tileWidth + tileHeight) / (tileWidth * tileHeight)) * jointWidth * tileDepth * 1.6
 *
 * Where 1.6 is the grout density constant (kg/L).
 *
 * @param input - Tile dimensions, joint size, area, wastage, and bag size.
 * @returns Kg needed, bags needed, and kg per m² rate.
 * @throws If any dimension is zero or negative.
 */
export function calculateGrout(input: GroutInput): GroutResult {
    const { area, tileWidth, tileHeight, jointWidth, tileDepth, wastage, bagSize } = input;

    if (area <= 0) {
        throw new Error('Area must be greater than zero.');
    }
    if (tileWidth <= 0 || tileHeight <= 0) {
        throw new Error('Tile dimensions must be greater than zero.');
    }
    if (jointWidth <= 0 || tileDepth <= 0) {
        throw new Error('Joint width and tile depth must be greater than zero.');
    }

    const kgPerM2 =
        ((tileWidth + tileHeight) / (tileWidth * tileHeight)) *
        jointWidth *
        tileDepth *
        1.6;

    const kgNeeded = area * kgPerM2 * (1 + wastage / 100);
    const bagsNeeded = Math.ceil(kgNeeded / bagSize);

    return { kgNeeded, bagsNeeded, kgPerM2 };
}
