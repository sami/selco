import type { CementInput, CementResult } from './types';
import type { MaterialQuantity } from '../types';
import { CEMENT_PRODUCTS } from '../data/masonry-products';
import { packsNeeded } from './primitives';

export function calculateCement(input: CementInput): CementResult {
    const { cementKg, productId } = input;

    const product = CEMENT_PRODUCTS.find(p => p.id === productId);
    if (!product) {
        throw new Error(
            `Unknown cement product ID: "${productId}". Check CEMENT_PRODUCTS catalogue.`
        );
    }

    const bags = packsNeeded(cementKg, product.bagSizeKg);

    const materials: MaterialQuantity[] = [
        {
            material: `${product.brand} ${product.name}`,
            quantity: cementKg,
            unit: 'kg',
            packSize: product.bagSizeKg,
            packsNeeded: bags,
        },
    ];

    return {
        cementKg,
        bagsNeeded: bags,
        bagSizeKg: product.bagSizeKg,
        productName: product.name,
        materials,
    };
}
