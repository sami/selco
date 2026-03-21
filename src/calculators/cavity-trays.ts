import type { CavityTrayInput, CavityTrayResult } from './types';
import type { MaterialQuantity } from '../types';
import { CAVITY_TRAY_PRODUCTS } from '../data/masonry-products';

export function calculateCavityTray(input: CavityTrayInput): CavityTrayResult {
    const { productId, quantity } = input;

    const product = CAVITY_TRAY_PRODUCTS.find(p => p.id === productId);
    if (!product) {
        throw new Error(
            `Unknown cavity tray product ID: "${productId}". Check CAVITY_TRAY_PRODUCTS catalogue.`
        );
    }

    const materials: MaterialQuantity[] = [
        { material: product.name, quantity, unit: 'each' },
    ];

    return { traysNeeded: quantity, productName: product.name, materials };
}
