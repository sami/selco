/**
 * @file src/calculators/constants.ts
 *
 * Shared constants used by multiple Layer 1 calculators.
 *
 * Rules:
 *   - Values are physical constants or SELCO-derived defaults.
 *   - No DOM, no React imports, no side effects.
 *   - Import specific named exports — do not import the whole module.
 */

import type { WastagePreset } from '../types';

// ---------------------------------------------------------------------------
// Wastage presets — recommended allowances per laying pattern
// ---------------------------------------------------------------------------

/**
 * Recommended wastage percentages for common laying patterns.
 *
 * Straight (grid) layouts have the least offcut waste. Diagonal and
 * herringbone patterns generate significantly more waste due to angled cuts
 * at room perimeters.
 *
 * These values are used as the default `wastage` input when the user
 * selects a pattern but does not override the percentage manually.
 *
 * Sources: RIBA Good Practice Guide (2019); British Ceramic Tile (2021).
 */
export const WASTAGE: WastagePreset = {
    straight:    10,   //  10 % — minimal perimeter cuts
    'brick-bond': 12,  //  12 % — half-offset cuts on two edges
    diagonal:    15,   //  15 % — 45° cuts on all four perimeter edges
    herringbone: 15,   //  15 % — complex V-cuts throughout
} as const;

// ---------------------------------------------------------------------------
// Material densities — kg per cubic metre (kg/m³)
// ---------------------------------------------------------------------------

/**
 * Bulk densities for common construction materials used in volume-to-weight
 * calculations.
 *
 * All values are in **kilograms per cubic metre (kg/m³)** and represent
 * typical loose or compacted densities for estimation purposes. Actual
 * delivered densities may vary by supplier and moisture content.
 *
 * Used by the SLC, screed, concrete, and mortar calculators.
 *
 * Sources: BS EN 1008 (mixing water for concrete); BRE Digest 276 (2012).
 */
export const DENSITY = {
    /** Reinforced or unreinforced in-situ concrete. */
    concrete:  2400,  // kg/m³

    /**
     * Hardcore / compacted granular fill (crushed brick, stone).
     * Range 1 500–2 000 kg/m³; 1 700 is a conservative midpoint.
     */
    hardcore:  1700,  // kg/m³

    /**
     * Sharp (concreting) sand or building sand, loose bulk density.
     * Range 1 400–1 800 kg/m³; 1 600 is typical.
     */
    sand:      1600,  // kg/m³

    /**
     * 10–20 mm gravel or shingle, loose bulk density.
     * Range 1 500–1 900 kg/m³; 1 700 is typical.
     */
    gravel:    1700,  // kg/m³

    /**
     * Ballast (combined coarse aggregate + sand), loose bulk density.
     * Typical bagged product for concrete mixes.
     */
    ballast:   1750,  // kg/m³

    /**
     * Cement-based tile grout (powder), bulk density for volume→weight.
     * Range 1 500–1 800 kg/m³; 1 700 is a conservative midpoint.
     */
    grout:     1700,  // kg/m³
} as const;
