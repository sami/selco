/**
 * @file src/calculators/primitives.ts
 *
 * Shared pure utility functions used by multiple Layer 1 calculators.
 *
 * Rules:
 *   - No DOM, no React imports, no side effects.
 *   - Every function is independently testable in `__tests__/primitives.test.ts`.
 *   - All inputs and outputs are plain numbers (SI units unless noted).
 */

// ---------------------------------------------------------------------------
// Rounding
// ---------------------------------------------------------------------------

/**
 * Ceiling-round `value` to a given number of decimal places.
 *
 * Unlike `Math.round`, this always rounds *up* (away from zero for positive
 * numbers). Useful for quantities where under-ordering is never acceptable.
 *
 * @param value    - The number to round up.
 * @param decimals - Number of decimal places to preserve (default: 2).
 * @returns The ceiling-rounded value.
 *
 * @example
 * roundUp(1.234)    // → 1.24
 * roundUp(1.23)     // → 1.23  (already exact)
 * roundUp(1.1, 0)   // → 2
 */
export function roundUp(value: number, decimals = 2): number {
    const factor = 10 ** decimals;
    return Math.ceil(value * factor) / factor;
}

/**
 * Ceiling-round `value` to the nearest whole number.
 *
 * Equivalent to `Math.ceil(value)`. Named explicitly so call-sites
 * express *intent* rather than exposing the Math API directly.
 *
 * @param value - The number to round up to an integer.
 * @returns The smallest integer ≥ `value`.
 *
 * @example
 * ceilToWhole(1.1)  // → 2
 * ceilToWhole(3)    // → 3
 */
export function ceilToWhole(value: number): number {
    return Math.ceil(value);
}

// ---------------------------------------------------------------------------
// Wastage
// ---------------------------------------------------------------------------

/**
 * Multiply `quantity` by `(1 + wastePercent / 100)` to add a wastage
 * allowance.
 *
 * @param quantity    - The base quantity before wastage.
 * @param wastePercent - Wastage to add, expressed as a percentage (e.g. `10`
 *                      for 10 %).
 * @returns The quantity including wastage.
 *
 * @example
 * applyWaste(100, 10)  // → 110
 * applyWaste(200, 15)  // → 230
 * applyWaste(100, 0)   // → 100
 */
export function applyWaste(quantity: number, wastePercent: number): number {
    // parseFloat + toPrecision(12) eliminates IEEE 754 floating-point noise
    // (e.g. 100 × 1.1 → 110.00000000000001) while preserving all meaningful
    // precision for construction quantities (mm-to-m working needs ~6 sig figs).
    const raw = quantity * (1 + wastePercent / 100);
    return parseFloat(raw.toPrecision(12));
}

// ---------------------------------------------------------------------------
// Pack calculations
// ---------------------------------------------------------------------------

/**
 * Calculate the number of packs needed to fulfil `quantity` units, where
 * each pack contains `packSize` units. Always rounds up (you cannot buy a
 * fraction of a pack).
 *
 * @param quantity - Total quantity required.
 * @param packSize - Number of units per pack.
 * @returns The ceiling-rounded number of packs.
 *
 * @example
 * packsNeeded(9, 3)    // → 3  (exact)
 * packsNeeded(10, 3)   // → 4  (ceil(10/3))
 * packsNeeded(0, 3)    // → 0
 */
export function packsNeeded(quantity: number, packSize: number): number {
    return Math.ceil(quantity / packSize);
}

// ---------------------------------------------------------------------------
// Geometry — area and volume
// ---------------------------------------------------------------------------

/**
 * Calculate the area of a rectangle given two sides in metres.
 *
 * @param lengthM - Length of the rectangle in metres.
 * @param widthM  - Width of the rectangle in metres.
 * @returns Area in square metres (m²).
 *
 * @example
 * areaMSquared(4, 3)    // → 12
 * areaMSquared(1.5, 2)  // → 3
 */
export function areaMSquared(lengthM: number, widthM: number): number {
    return lengthM * widthM;
}

/**
 * Calculate the volume of a rectangular slab.
 *
 * The length and width are given in metres; the depth is given in millimetres
 * and converted internally. This matches the common construction pattern of
 * specifying plan dimensions in metres but depth (screed, adhesive bed,
 * concrete slab) in millimetres.
 *
 * @param lengthM - Length in metres.
 * @param widthM  - Width in metres.
 * @param depthMm - Depth in millimetres.
 * @returns Volume in cubic metres (m³).
 *
 * @example
 * volumeMCubed(4, 3, 100)  // → 1.2  (4 × 3 × 0.1)
 * volumeMCubed(5, 5, 75)   // → 1.875
 */
export function volumeMCubed(
    lengthM: number,
    widthM: number,
    depthMm: number,
): number {
    return lengthM * widthM * mmToM(depthMm);
}

// ---------------------------------------------------------------------------
// Unit conversion — length
// ---------------------------------------------------------------------------

/**
 * Convert millimetres to metres.
 *
 * @param mm - Value in millimetres.
 * @returns Value in metres.
 *
 * @example
 * mmToM(1000)  // → 1
 * mmToM(300)   // → 0.3
 */
export function mmToM(mm: number): number {
    return mm / 1000;
}

/**
 * Convert metres to millimetres.
 *
 * @param m - Value in metres.
 * @returns Value in millimetres.
 *
 * @example
 * mToMm(1)    // → 1000
 * mToMm(2.5)  // → 2500
 */
export function mToMm(m: number): number {
    return m * 1000;
}
