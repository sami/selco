import type { BlocksInput, BlocksResult } from './types';
import type { MaterialQuantity } from '../types';
import { BLOCK_PRODUCTS } from '../data/masonry-products';
import { applyWaste } from './primitives';

const DEFAULT_WASTAGE = 5;

export function calculateBlocks(input: BlocksInput): BlocksResult {
    const { areaM2, productId, wastagePercent = DEFAULT_WASTAGE } = input;

    const product = BLOCK_PRODUCTS.find(p => p.id === productId);
    if (!product) {
        throw new Error(
            `Unknown block product ID: "${productId}". Check BLOCK_PRODUCTS catalogue.`
        );
    }

    const blocksNeeded = Math.ceil(applyWaste(areaM2 * product.blocksPerM2, wastagePercent));

    const materials: MaterialQuantity[] = [
        {
            material: `${product.brand} ${product.name}`,
            quantity: blocksNeeded,
            unit: 'blocks',
        },
    ];

    return {
        blocksNeeded,
        blocksPerM2: product.blocksPerM2,
        productName: product.name,
        materials,
        warnings: [],
    };
}
