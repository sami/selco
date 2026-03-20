import type { BackerBoardInput, BackerBoardResult } from './types';
import type { MaterialQuantity } from '../types';
import { packsNeeded } from './primitives';
import { BACKER_BOARD_PRODUCTS } from '../data/tiling-products';

/**
 * Calculate the number of tile backer boards (and packs) needed for a project.
 *
 * **Formula:**
 *   boardsNeeded = ceil(areaM2 × (1 + wastePercent/100) / boardAreaM2)
 *   packsNeeded  = ceil(boardsNeeded / product.boardsPerPack)   [Flexel only]
 *
 * Products sold individually (HardieBacker, Jackoboard) do not return packsNeeded.
 * Flexel ECOMAX is sold in packs of 6 — packsNeeded is always returned for these.
 *
 * Source: Selco product listings verified 18 March 2026.
 *
 * @throws If `productId` not found or `areaM2 ≤ 0`.
 *
 * @example
 * calculateBackerBoard({ areaM2: 12, productId: 'hardiebacker-6mm', wastePercent: 10 })
 * // → { boardsNeeded: 14, boardAreaM2: 0.96, productName: 'HardieBacker 6mm', warnings: [] }
 */
export function calculateBackerBoard(input: BackerBoardInput): BackerBoardResult {
    const { areaM2, productId, wastePercent = 10 } = input;

    const product = BACKER_BOARD_PRODUCTS.find(p => p.id === productId);
    if (!product) {
        throw new Error(`Unknown backer board product ID: "${productId}". Check BACKER_BOARD_PRODUCTS catalogue.`);
    }
    if (areaM2 <= 0) throw new Error('Area must be greater than zero.');

    const warnings: string[] = [...(product.notes ?? [])];
    const boardAreaM2 = (product.boardLengthMm / 1000) * (product.boardWidthMm / 1000);
    const areaWithWaste = areaM2 * (1 + wastePercent / 100);
    const boards = packsNeeded(areaWithWaste, boardAreaM2);  // ceil(area / boardArea)

    const packs = product.boardsPerPack !== undefined
        ? packsNeeded(boards, product.boardsPerPack)
        : undefined;

    const materials: MaterialQuantity[] = [{
        material: `${product.brand} ${product.name}`,
        quantity: boards,
        unit: 'boards',
        packSize: product.boardsPerPack ?? 1,
        packsNeeded: packs ?? boards,
    }];

    return {
        boardsNeeded: boards,
        packsNeeded: packs,
        boardAreaM2,
        productName: product.name,
        materials,
        warnings,
    };
}
