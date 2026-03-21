import type { SandInput, SandResult } from './types';
import type { MaterialQuantity } from '../types';
import { SAND_PRODUCTS } from '../data/masonry-products';
import { packsNeeded } from './primitives';

export function calculateSand(input: SandInput): SandResult {
    const { sandKg, productId } = input;

    const product = SAND_PRODUCTS.find(p => p.id === productId);
    if (!product) {
        throw new Error(
            `Unknown sand product ID: "${productId}". Check SAND_PRODUCTS catalogue.`
        );
    }

    const bags = packsNeeded(sandKg, product.packSizeKg);

    const materials: MaterialQuantity[] = [
        {
            material: product.name,
            quantity: sandKg,
            unit: 'kg',
            packSize: product.packSizeKg,
            packsNeeded: bags,
        },
    ];

    return {
        sandKg,
        bagsNeeded: bags,
        packSizeKg: product.packSizeKg,
        productName: product.name,
        materials,
    };
}
