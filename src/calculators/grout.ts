import type { GroutInput, GroutResult } from './types';

/** Common joint widths for dropdown presets. */
export const COMMON_JOINT_WIDTHS = [
    { value: 2, label: '2 mm — Rectified tiles' },
    { value: 3, label: '3 mm — Standard wall tiles' },
    { value: 5, label: '5 mm — Standard floor tiles' },
    { value: 10, label: '10 mm — Rustic/handmade tiles' },
];

/**
 * Calculate the amount of grout needed for a tiling project.
 *
 * Uses the industry-standard formula:
 *   kgPerM2 = ((tileWidth + tileHeight) / (tileWidth * tileHeight)) * jointWidth * tileDepth * 1.6
 *
 * Where 1.6 is the grout density constant (kg/L).
 *
 * @param input - Tile dimensions, joint size, area, and wastage.
 * @returns Kg needed, bag counts (5 kg and 2.5 kg), and kg per m² rate.
 * @throws If any dimension is zero or negative.
 */
export function calculateGrout(input: GroutInput): GroutResult {
    const { area, tileWidth, tileHeight, jointWidth, tileDepth, wastage } = input;

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
    const bags5kg = Math.ceil(kgNeeded / 5);
    const bags2_5kg = Math.ceil(kgNeeded / 2.5);

    return { kgNeeded, bags5kg, bags2_5kg, kgPerM2 };
}
