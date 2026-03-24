import type { TankingInput, TankingResult } from './types';
import type { MaterialQuantity } from '../types';
import { packsNeeded } from './primitives';
import { TANKING_PRODUCTS } from '../data/tiling-products';

/**
 * Calculate tanking / waterproof membrane kits needed for a wet area.
 *
 * Uses product-ID lookup against {@link TANKING_PRODUCTS}. Each product
 * specifies its `coverageM2PerKit` — the floor/wall area a single kit covers
 * (already accounting for the multi-coat application in the manufacturer spec).
 *
 * **Formula:**
 *   kitsNeeded = ceil(areaM2 / product.coverageM2PerKit)
 *
 * Source: Selco product listings verified 18 March 2026.
 *
 * @throws If `productId` not found or `areaM2 ≤ 0`.
 *
 * @example
 * calculateTanking({ areaM2: 8, productId: 'mapei-mapegum-wps' })
 * // → { kitsNeeded: 2, coveragePerKit: 4, productName: 'Mapegum WPS Kit' }
 */
export function calculateTanking(input: TankingInput): TankingResult {
    const { areaM2, productId } = input;

    const product = TANKING_PRODUCTS.find(p => p.id === productId);
    if (!product) {
        throw new Error(`Unknown tanking product ID: "${productId}". Check TANKING_PRODUCTS catalogue.`);
    }
    if (areaM2 <= 0) throw new Error('Area must be greater than zero.');

    const kitsNeeded = packsNeeded(areaM2, product.coverageM2PerKit);

    const materials: MaterialQuantity[] = [{
        material: `${product.brand} ${product.name}`,
        quantity: kitsNeeded,
        unit: 'kits',
        packSize: 1,
        packsNeeded: kitsNeeded,
    }];

    return {
        kitsNeeded,
        coveragePerKit: product.coverageM2PerKit,
        productName: product.name,
        materials,
        notes: product.notes,
    };
}
