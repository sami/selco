import type { BricksInput, BricksResult } from './types';
import type { MaterialQuantity } from '../types';
import { BRICK_PRODUCTS } from '../data/masonry-products';
import { packsNeeded, applyWaste } from './primitives';

const DEFAULT_WASTAGE = 10;

export function calculateBricks(input: BricksInput): BricksResult {
    const {
        areaM2,
        productId,
        wastagePercent = DEFAULT_WASTAGE,
        bondPattern = 'stretcher',
    } = input;

    const product = BRICK_PRODUCTS.find(p => p.id === productId);
    if (!product) {
        throw new Error(
            `Unknown brick product ID: "${productId}". Check BRICK_PRODUCTS catalogue.`
        );
    }

    const warnings: string[] = [];

    if (bondPattern === 'flemish' || bondPattern === 'english') {
        const label = bondPattern.charAt(0).toUpperCase() + bondPattern.slice(1);
        warnings.push(
            `${label} bond increases mortar consumption slightly due to additional cut bricks at reveals.`
        );
    }

    const bricksNeeded = Math.ceil(applyWaste(areaM2 * product.bricksPerM2, wastagePercent));
    const packs = packsNeeded(bricksNeeded, product.packSize);

    const materials: MaterialQuantity[] = [
        {
            material: `${product.brand} ${product.name}`,
            quantity: bricksNeeded,
            unit: 'bricks',
            packSize: product.packSize,
            packsNeeded: packs,
        },
    ];

    return {
        bricksNeeded,
        packsNeeded: packs,
        bricksPerM2: product.bricksPerM2,
        productName: product.name,
        materials,
        warnings,
    };
}
