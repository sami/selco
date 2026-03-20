import type { GroutInput, GroutResult } from './types';
import type { MaterialQuantity } from '../types';
import { packsNeeded } from './primitives';
import { GROUT_PRODUCTS } from '../data/tiling-products';

/** Common joint widths for dropdown presets. */
export const COMMON_JOINT_WIDTHS = [
    { value: 2,  label: '2 mm — Rectified tiles' },
    { value: 3,  label: '3 mm — Standard wall tiles' },
    { value: 5,  label: '5 mm — Standard floor tiles' },
    { value: 10, label: '10 mm — Rustic/handmade tiles' },
];

/**
 * Calculate grout quantity using product-ID lookup and the BS 5385 / Mapei TDS formula.
 *
 * **Formula:**
 *   kg/m² = (tileLengthMm + tileWidthMm) / (tileLengthMm × tileWidthMm)
 *           × jointWidthMm × tileDepthMm × product.densityFactor
 *
 * `densityFactor` is in g/cm³ (= kg/dm³), consistent with the formula's mm-based inputs.
 * Source: Mapei Ultracolor Plus TDS (factor 1.6); Dunlop GX-500 TDS (factor 1.7).
 *
 * **Warnings (calculation still proceeds):**
 * - Joint width exceeds product `maxJointMm`
 * - Joint width below product `minJointMm`
 * - `walls-only` restriction + floor/exterior context
 *
 * @throws If `productId` not found, area ≤ 0, tile dimensions ≤ 0, or joint width ≤ 0.
 *
 * @example
 * calculateGrout({ areaM2: 12, tileLengthMm: 300, tileWidthMm: 300,
 *   tileDepthMm: 10, jointWidthMm: 3, productId: 'mapei-ultracolor-plus' })
 * // → { groutKg: 3.84, bagsNeeded: 1, coverageRateKgPerM2: 0.32, warnings: [] }
 */
export function calculateGrout(input: GroutInput): GroutResult {
    const { areaM2, tileLengthMm, tileWidthMm, tileDepthMm, jointWidthMm, productId, applicationContext } = input;

    const product = GROUT_PRODUCTS.find(p => p.id === productId);
    if (!product) {
        throw new Error(`Unknown grout product ID: "${productId}". Check GROUT_PRODUCTS catalogue.`);
    }
    if (areaM2 <= 0) throw new Error('Area must be greater than zero.');
    if (tileLengthMm <= 0 || tileWidthMm <= 0) throw new Error('Tile dimensions must be greater than zero.');
    if (tileDepthMm <= 0) throw new Error('Tile depth must be greater than zero.');
    if (jointWidthMm <= 0) throw new Error('Joint width must be greater than zero.');

    const warnings: string[] = [];
    const isFloor = applicationContext === 'floor-dry'
        || applicationContext === 'floor-wet'
        || applicationContext === 'exterior';

    // Joint width checks
    if (jointWidthMm > product.maxJointMm) {
        warnings.push(
            `Joint width ${jointWidthMm}mm exceeds the maximum ${product.maxJointMm}mm ` +
            `for ${product.name}. Consider ${product.id === 'mapei-flexible-wall-floor-grout'
                ? 'Mapei Ultracolor Plus (up to 20mm)' : 'a wider-joint grout'}.`
        );
    }
    if (jointWidthMm < product.minJointMm) {
        warnings.push(
            `Joint width ${jointWidthMm}mm is below the minimum ${product.minJointMm}mm for ${product.name}.`
        );
    }

    // Restriction checks
    if (isFloor && product.restrictions?.includes('walls-only')) {
        warnings.push(
            `${product.name} (${product.brand}) is for wall applications only. ` +
            `Use a floor-rated grout for this application.`
        );
    }

    // BS 5385 / Mapei TDS formula
    const coverageRateKgPerM2 =
        ((tileLengthMm + tileWidthMm) / (tileLengthMm * tileWidthMm))
        * jointWidthMm
        * tileDepthMm
        * product.densityFactor;

    const groutKg = areaM2 * coverageRateKgPerM2;
    const bags = packsNeeded(groutKg, product.primaryBagSizeKg);

    const materials: MaterialQuantity[] = [{
        material: `${product.brand} ${product.name}`,
        quantity: groutKg,
        unit: 'kg',
        packSize: product.primaryBagSizeKg,
        packsNeeded: bags,
    }];

    return { groutKg, bagsNeeded: bags, coverageRateKgPerM2, productName: product.name, materials, warnings };
}
