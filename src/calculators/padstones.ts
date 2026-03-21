import type { PadstoneInput, PadstoneResult } from './types';
import type { MaterialQuantity } from '../types';
import { PADSTONE_PRODUCTS } from '../data/masonry-products';

export function calculatePadstone(input: PadstoneInput): PadstoneResult {
    const { productId, quantity } = input;

    const product = PADSTONE_PRODUCTS.find(p => p.id === productId);
    if (!product) {
        throw new Error(
            `Unknown padstone product ID: "${productId}". Check PADSTONE_PRODUCTS catalogue.`
        );
    }

    const materials: MaterialQuantity[] = [
        { material: product.name, quantity, unit: 'each' },
    ];

    return { padstonesNeeded: quantity, productName: product.name, materials };
}
