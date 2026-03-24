import type { PrimerInput, PrimerResult } from './types';
import type { MaterialQuantity } from '../types';
import { packsNeeded } from './primitives';
import { PRIMER_PRODUCTS } from '../data/tiling-products';

/**
 * Calculate primer quantity using product-ID lookup.
 *
 * Each product specifies its `coverageM2PerKg` (and optionally a diluted rate).
 * Multiple coats multiply consumption linearly.
 *
 * **Formula:**
 *   coverageRateUsed = diluted ? product.dilutedCoverageM2PerKg : product.coverageM2PerKg
 *   kgNeeded         = (areaM2 / coverageRateUsed) × coats
 *   packsNeeded      = ceil(kgNeeded / product.primaryPackSizeKg)
 *
 * Source: Selco product listings verified 18 March 2026.
 *
 * @throws If `productId` not found or `areaM2 ≤ 0`.
 *
 * @example
 * calculatePrimer({ areaM2: 10, productId: 'mapei-primer-g' })
 * // → { kgNeeded: 2, packsNeeded: 1, coverageRateUsed: 5, productName: 'Primer G' }
 */
export function calculatePrimer(input: PrimerInput): PrimerResult {
    const { areaM2, productId, coats = 1, diluted = false } = input;

    const product = PRIMER_PRODUCTS.find(p => p.id === productId);
    if (!product) {
        throw new Error(`Unknown primer product ID: "${productId}". Check PRIMER_PRODUCTS catalogue.`);
    }
    if (areaM2 <= 0) throw new Error('Area must be greater than zero.');
    if (coats <= 0)  throw new Error('Number of coats must be greater than zero.');

    const coverageRateUsed = (diluted && product.dilutedCoverageM2PerKg !== undefined)
        ? product.dilutedCoverageM2PerKg
        : product.coverageM2PerKg;

    const kgNeeded = (areaM2 / coverageRateUsed) * coats;
    const packs = packsNeeded(kgNeeded, product.primaryPackSizeKg);

    const materials: MaterialQuantity[] = [{
        material: `${product.brand} ${product.name}`,
        quantity: kgNeeded,
        unit: 'kg',
        packSize: product.primaryPackSizeKg,
        packsNeeded: packs,
    }];

    return { kgNeeded, packsNeeded: packs, coverageRateUsed, productName: product.name, materials };
}
