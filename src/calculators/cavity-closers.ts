import type { CavityCloserInput, CavityCloserResult } from './types';
import type { MaterialQuantity } from '../types';
import { CAVITY_CLOSER_PRODUCTS } from '../data/masonry-products';
import { packsNeeded } from './primitives';

export function calculateCavityCloser(input: CavityCloserInput): CavityCloserResult {
    const { openingWidthMm, openingHeightMm, productId } = input;

    const product = CAVITY_CLOSER_PRODUCTS.find(p => p.id === productId);
    if (!product) {
        throw new Error(
            `Unknown cavity closer product ID: "${productId}". Check CAVITY_CLOSER_PRODUCTS catalogue.`
        );
    }

    const perimeterM = 2 * ((openingWidthMm + openingHeightMm) / 1000);
    const closersNeeded = packsNeeded(perimeterM, product.lengthM);

    const materials: MaterialQuantity[] = [
        { material: product.name, quantity: closersNeeded, unit: 'each' },
    ];

    return { closersNeeded, perimeterM, productName: product.name, materials };
}
