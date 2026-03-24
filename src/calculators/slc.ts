import type { SLCInput, SLCResult } from './types';
import { SLC_DENSITY_KG_PER_L } from './types';
import { packsNeeded } from './primitives';

/**
 * Calculate self-levelling compound (SLC) needed to prepare a floor.
 *
 * Uses the fixed density of standard SLC products (1.5 kg/litre).
 * The volume formula is exact: 1 m² × 1 mm depth = 1 litre, so
 * no per-product coverage rate is required.
 *
 * **Formula:**
 *   volumeLitres = areaM2 × depthMm          (exact — 1 m² × 1 mm = 1 L)
 *   kgNeeded     = volumeLitres × 1.5
 *   coverageAtDepthM2PerBag = bagSizeKg / (1.5 × depthMm)
 *
 * Source: Mapei Ultraplan TDS; Dunlop Level IT TDS — both 1.5 kg/L.
 *
 * @param input - Area, pour depth, and optional bag size (default 25 kg).
 * @returns kg needed, bags needed, volume in litres, and coverage per bag.
 * @throws If area or depth is zero or negative.
 *
 * @example
 * calculateSLC({ areaM2: 10, depthMm: 10 })
 * // → { kgNeeded: 150, bagsNeeded: 6, volumeLitres: 100, coverageAtDepthM2PerBag: 1.667 }
 */
export function calculateSLC(input: SLCInput): SLCResult {
    const { areaM2, depthMm, bagSizeKg = 25 } = input;

    if (areaM2 <= 0) throw new Error('Area must be greater than zero.');
    if (depthMm <= 0) throw new Error('Depth must be greater than zero.');
    if (bagSizeKg <= 0) throw new Error('Bag size must be greater than zero.');

    const volumeLitres = areaM2 * depthMm;                      // 1 m² × 1 mm = 1 litre
    const kgNeeded = volumeLitres * SLC_DENSITY_KG_PER_L;       // 1.5 kg/L
    const bags = packsNeeded(kgNeeded, bagSizeKg);
    const coverageAtDepthM2PerBag = bagSizeKg / (SLC_DENSITY_KG_PER_L * depthMm);

    return { kgNeeded, bagsNeeded: bags, volumeLitres, coverageAtDepthM2PerBag };
}
