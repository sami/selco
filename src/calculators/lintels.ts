import type { LintelInput, LintelCalcResult } from './types';
import type { MaterialQuantity } from '../types';
import { CONCRETE_LINTEL_PRODUCTS, STEEL_LINTEL_PRODUCTS } from '../data/masonry-products';

export function calculateLintel(input: LintelInput): LintelCalcResult {
    const { openingWidthMm, productId } = input;

    const concreteProduct = CONCRETE_LINTEL_PRODUCTS.find(p => p.id === productId);
    if (concreteProduct) {
        const requiredLengthMm = openingWidthMm + 2 * concreteProduct.minBearingMm;
        const sorted = [...concreteProduct.availableLengthsMm].sort((a, b) => a - b);
        const lintelLengthMm = sorted.find(l => l >= requiredLengthMm);
        if (lintelLengthMm === undefined) {
            throw new Error(`No concrete lintel long enough for ${openingWidthMm}mm opening with product "${productId}".`);
        }
        const materials: MaterialQuantity[] = [
            { material: concreteProduct.name, quantity: 1, unit: 'each' },
        ];
        return { lintelLengthMm, productName: concreteProduct.name, materials };
    }

    const steelProduct = STEEL_LINTEL_PRODUCTS.find(p => p.id === productId);
    if (steelProduct) {
        const lintelLengthMm = openingWidthMm + 2 * steelProduct.minBearingMm;
        const materials: MaterialQuantity[] = [
            { material: `${steelProduct.brand} ${steelProduct.name}`, quantity: 1, unit: 'each' },
        ];
        return { lintelLengthMm, productName: steelProduct.name, materials };
    }

    throw new Error(
        `Unknown lintel product ID: "${productId}". Check CONCRETE_LINTEL_PRODUCTS and STEEL_LINTEL_PRODUCTS catalogues.`
    );
}
