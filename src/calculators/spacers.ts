import type { SpacersInput, SpacersResult } from './types';
import type { LayingPattern, MaterialQuantity } from '../types';
import { packsNeeded } from './primitives';

/** Common spacer sizes stocked at Selco (18 March 2026). */
export const SPACER_SIZES = [
    { value: 1, label: '1 mm' },
    { value: 2, label: '2 mm' },
    { value: 3, label: '3 mm' },
    { value: 5, label: '5 mm' },
];

/**
 * Spacers per tile by laying pattern.
 *
 * Straight/brick-bond: 3 per tile (3 exposed joint intersections on average for wall runs).
 * Diagonal/herringbone: 4 per tile (more exposed corners due to angled cuts).
 *
 * Source: British Ceramic Tile Trade Guide (2021); confirmed by SELCO installation data.
 */
export const SPACERS_PER_TILE_BY_PATTERN: Record<LayingPattern, number> = {
    'straight': 3,
    'brick-bond': 3,
    'diagonal': 4,
    'herringbone': 4,
};

/**
 * Calculate tile spacer quantity from a known tile count.
 *
 * Takes `tilesNeeded` directly from the tile calculator output (post-wastage count).
 * The spacer count drives the pack calculation against the chosen `packSize`.
 *
 * @param input - Tile count, spacer size, laying pattern, pack size.
 * @returns Spacers needed, packs needed, spacers-per-tile used, materials array.
 * @throws If tilesNeeded ≤ 0 or packSize ≤ 0.
 *
 * @example
 * calculateSpacers({ tilesNeeded: 134, spacerSizeMm: 3,
 *   layingPattern: 'straight', packSize: 250 })
 * // → { spacersNeeded: 402, packsNeeded: 2, spacersPerTile: 3 }
 */
export function calculateSpacers(input: SpacersInput): SpacersResult {
    const { tilesNeeded, spacerSizeMm, layingPattern, packSize } = input;

    if (tilesNeeded <= 0) throw new Error('Tile count must be greater than zero.');
    if (packSize <= 0)    throw new Error('Pack size must be greater than zero.');

    const spacersPerTile = SPACERS_PER_TILE_BY_PATTERN[layingPattern];
    const spacersNeeded = tilesNeeded * spacersPerTile;
    const packs = packsNeeded(spacersNeeded, packSize);

    const materials: MaterialQuantity[] = [{
        material: `${spacerSizeMm} mm tile spacers`,
        quantity: spacersNeeded,
        unit: 'spacers',
        packSize,
        packsNeeded: packs,
    }];

    return { spacersNeeded, packsNeeded: packs, spacersPerTile, materials };
}
