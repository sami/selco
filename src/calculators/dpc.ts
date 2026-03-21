import type { DPCInput, DPCCalcResult } from './types';
import type { MaterialQuantity } from '../types';
import { DPC_PRODUCTS } from '../data/masonry-products';
import { packsNeeded } from './primitives';

/**
 * Recommend the narrowest DPC product whose width covers the given leaf width.
 * Standard 102.5mm brick leaf → 112mm DPC (next width up from 100mm).
 */
export function recommendDPCProductId(leafWidthMm: number): string {
    const match = [...DPC_PRODUCTS]
        .sort((a, b) => a.widthMm - b.widthMm)
        .find(p => p.widthMm >= leafWidthMm);

    if (!match) {
        throw new Error(
            `No DPC product wide enough for ${leafWidthMm}mm leaf. ` +
            `Widest available: ${Math.max(...DPC_PRODUCTS.map(p => p.widthMm))}mm.`
        );
    }

    return match.id;
}

export function calculateDPC(input: DPCInput): DPCCalcResult {
    const { wallLengthM, productId } = input;

    const product = DPC_PRODUCTS.find(p => p.id === productId);
    if (!product) {
        throw new Error(
            `Unknown DPC product ID: "${productId}". Check DPC_PRODUCTS catalogue.`
        );
    }

    const rolls = packsNeeded(wallLengthM, product.rollLengthM);

    const materials: MaterialQuantity[] = [
        {
            material: product.name,
            quantity: wallLengthM,
            unit: 'm',
            packSize: product.rollLengthM,
            packsNeeded: rolls,
        },
    ];

    return {
        rollsNeeded: rolls,
        rollLengthM: product.rollLengthM,
        widthMm: product.widthMm,
        productName: product.name,
        materials,
    };
}
