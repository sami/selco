import type { WallTiesInput, WallTiesCalcResult } from './types';
import type { MaterialQuantity } from '../types';
import { WALL_TIE_PRODUCTS } from '../data/masonry-products';
import { packsNeeded } from './primitives';

/** BS EN 1243: standard tie density for cavity walls. */
const TIES_PER_M2 = 2.5;

// Sorted by descending minCavityMm so boundary values (e.g. 75mm) resolve
// to the upper range (75–100mm tie) rather than the lower (50–75mm tie).
const PRODUCTS_BY_MIN_DESC = [...WALL_TIE_PRODUCTS].sort(
    (a, b) => b.minCavityMm - a.minCavityMm,
);

export function calculateWallTies(input: WallTiesInput): WallTiesCalcResult {
    const { areaM2, cavityWidthMm, packSize } = input;

    // Search from highest minCavityMm first so shared boundaries (e.g. 75mm)
    // resolve to the higher-range product, matching BS EN 1243 guidance.
    const product = PRODUCTS_BY_MIN_DESC.find(
        p => cavityWidthMm >= p.minCavityMm && cavityWidthMm <= p.maxCavityMm
    );

    if (!product) {
        throw new Error(
            `No wall tie product found for cavity width ${cavityWidthMm}mm. ` +
            `Supported range: 50–150mm.`
        );
    }

    const selectedPackSize = packSize ?? product.primaryPackSize;
    const tiesNeeded = Math.ceil(areaM2 * TIES_PER_M2);
    const packs = packsNeeded(tiesNeeded, selectedPackSize);

    const materials: MaterialQuantity[] = [
        {
            material: product.name,
            quantity: tiesNeeded,
            unit: 'each',
            packSize: selectedPackSize,
            packsNeeded: packs,
        },
    ];

    return {
        tiesNeeded,
        packsNeeded: packs,
        packSize: selectedPackSize,
        tieLengthMm: product.tieLengthMm,
        productId: product.id,
        productName: product.name,
        materials,
        warnings: [],
    };
}
