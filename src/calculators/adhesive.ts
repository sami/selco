import type {
    AdhesiveInput, AdhesiveResult,
    AdhesiveBedDepthInput, AdhesiveBedDepthResult,
} from './types';
import type { MaterialQuantity } from '../types';
import { applyWaste, packsNeeded } from './primitives';
import { ADHESIVE_PRODUCTS } from '../data/tiling-products';

/**
 * Calculate adhesive quantity using product-ID lookup and context-aware coverage rates.
 *
 * **Coverage rate selection (manufacturer TDS, selcobw.com — 18 March 2026):**
 * 1. `bedDepthMm` + `product.perMmBedDepthKg` → `rate = perMmBedDepthKg × bedDepthMm`
 * 2. Floor/exterior context OR large tile (any dim > 300mm) → floor-dry or floor-wet rate
 * 3. Default: look up exact `applicationContext` rate from `product.coverageRates`
 *
 * **Warnings (calculation still proceeds):**
 * - `walls-only` restriction + floor/exterior context
 * - `internal-walls-only` restriction + floor/exterior context
 * - Tile size exceeds `product.maxTileMm`
 *
 * @param input - Area, tile size, product ID, application context, optional bed depth.
 * @returns Adhesive kg, bags needed, coverage rate used, product name, materials, warnings.
 * @throws If `productId` is not found in the ADHESIVE_PRODUCTS catalogue.
 *
 * @example
 * calculateAdhesive({ areaM2: 12, tileLengthMm: 300, tileWidthMm: 300,
 *   productId: 'mapei-adesilex-p9', applicationContext: 'wall-dry' })
 * // → { adhesiveKg: 30, bagsNeeded: 2, coverageRateUsed: 2.5, warnings: [] }
 */
export function calculateAdhesive(input: AdhesiveInput): AdhesiveResult {
    const { areaM2, tileLengthMm, tileWidthMm, productId, applicationContext, bedDepthMm } = input;

    const product = ADHESIVE_PRODUCTS.find(p => p.id === productId);
    if (!product) {
        throw new Error(`Unknown adhesive product ID: "${productId}". Check ADHESIVE_PRODUCTS catalogue.`);
    }

    const warnings: string[] = [];
    const isFloor = applicationContext === 'floor-dry'
        || applicationContext === 'floor-wet'
        || applicationContext === 'exterior';
    const isLargeTile = Math.max(tileLengthMm, tileWidthMm) > 300;

    // --- Restriction warnings ---
    if (isFloor && product.restrictions?.includes('walls-only')) {
        warnings.push(
            `${product.name} (${product.brand}) is for walls only. ` +
            `Consider a floor-rated adhesive.`
        );
    }
    if (isFloor && product.restrictions?.includes('internal-walls-only')) {
        warnings.push(
            `${product.name} (${product.brand}) is for internal walls only. ` +
            `Use a floor-rated adhesive for this application.`
        );
    }

    // --- Max tile warning ---
    if (product.maxTileMm !== undefined) {
        const maxDim = Math.max(tileLengthMm, tileWidthMm);
        if (maxDim > product.maxTileMm) {
            warnings.push(
                `Tile size ${tileLengthMm}×${tileWidthMm}mm exceeds the maximum ` +
                `${product.maxTileMm}×${product.maxTileMm}mm for ${product.name}.`
            );
        }
    }

    // --- Coverage rate selection ---
    let coverageRateUsed: number;

    if (bedDepthMm !== undefined && product.perMmBedDepthKg !== undefined) {
        // Bed-depth scaling method (e.g. Keraflex Maxi S1)
        coverageRateUsed = product.perMmBedDepthKg * bedDepthMm;
    } else if (isFloor || isLargeTile) {
        // Floor context or large-format tile → use heavier floor rate
        const ctx = (applicationContext === 'exterior' || applicationContext === 'floor-wet')
            ? 'floor-wet'
            : 'floor-dry';
        coverageRateUsed = product.coverageRates[ctx];
    } else {
        // Standard wall application
        coverageRateUsed = product.coverageRates[applicationContext]
            ?? product.coverageRates['wall-dry'];
    }

    const adhesiveKg = areaM2 * coverageRateUsed;
    const bags = packsNeeded(adhesiveKg, product.bagSizeKg);

    const materials: MaterialQuantity[] = [{
        material: `${product.brand} ${product.name}`,
        quantity: adhesiveKg,
        unit: 'kg',
        packSize: product.bagSizeKg,
        packsNeeded: bags,
    }];

    return {
        adhesiveKg,
        bagsNeeded: bags,
        coverageRateUsed,
        productName: product.name,
        materials,
        warnings,
    };
}

/**
 * Calculate adhesive using the bed-depth scaling model (product-agnostic, wizard-style).
 *
 * Formula: `scaledCoverage = baseCoverageKgPerM2 × (bedDepthMm / 3)`
 * The base rate is the manufacturer's stated coverage at a 3 mm bed depth.
 * Doubling the bed depth doubles the adhesive consumption linearly.
 * Source: Mapei Keraflex Maxi S1 TDS (1.2 kg/m²/mm); used as a generic model.
 *
 * @example
 * calculateAdhesiveByBedDepth({ areaM2: 10, bedDepthMm: 6,
 *   baseCoverageKgPerM2: 2, bagSizeKg: 20, wastage: 10 })
 * // → { scaledCoverageKgPerM2: 4, kgNeeded: 40, kgWithWastage: 44, bagsNeeded: 3 }
 */
export function calculateAdhesiveByBedDepth(input: AdhesiveBedDepthInput): AdhesiveBedDepthResult {
    const { areaM2, bedDepthMm, baseCoverageKgPerM2, bagSizeKg, wastage } = input;

    if (areaM2 <= 0) throw new Error('Area must be greater than zero.');
    if (bedDepthMm <= 0) throw new Error('Bed depth must be greater than zero.');
    if (baseCoverageKgPerM2 <= 0) throw new Error('Base coverage rate must be greater than zero.');
    if (bagSizeKg <= 0) throw new Error('Bag size must be greater than zero.');
    if (wastage < 0 || wastage > 100) throw new Error('Wastage must be between 0 and 100.');

    const scaledCoverageKgPerM2 = baseCoverageKgPerM2 * (bedDepthMm / 3);
    const kgNeeded = areaM2 * scaledCoverageKgPerM2;
    const kgWithWastage = applyWaste(kgNeeded, wastage);
    const bagsNeeded = packsNeeded(kgWithWastage, bagSizeKg);

    return { scaledCoverageKgPerM2, kgNeeded, kgWithWastage, bagsNeeded };
}
