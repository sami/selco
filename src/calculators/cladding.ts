/**
 * @file src/calculators/cladding.ts
 *
 * Layer 1 calculator — Cladding.
 *
 * @todo NOT YET IMPLEMENTED — placeholder only.
 *
 * Intended to calculate material quantities for exterior or interior cladding
 * projects. Expected inputs: wall area (or dimensions), board width and
 * exposure width, batten size, fixing type, wastage percentage.
 *
 * When implemented this module must remain a pure function with no DOM,
 * no React imports, and no side effects. All logic must be testable in
 * isolation via `cladding.test.ts`.
 */

// ---------------------------------------------------------------------------
// Input / output interfaces
// ---------------------------------------------------------------------------

/** Input for the cladding calculator. */
export interface CladdingInput {
    /** Total wall area to clad in m². Must be greater than zero. */
    areaM2: number;
    /** Overall width of each board in mm (e.g. 150 for a 150 mm feather-edge). */
    boardWidthMm: number;
    /**
     * Exposed (visible) face width in mm.
     * For shiplap/feather-edge this is less than boardWidthMm due to overlap.
     */
    exposedWidthMm: number;
    /** Length of each board in mm (e.g. 4800 for a 4.8 m board). */
    boardLengthMm: number;
    /**
     * Batten spacing centre-to-centre in mm.
     * Battens run horizontally and support the cladding boards.
     */
    battenSpacingMm: number;
    /** Wastage percentage to add (0–20). 10 % is typical. */
    wastage: number;
}

/** Result from the cladding calculator. */
export interface CladdingResult {
    /** Number of cladding boards needed, including wastage, rounded up. */
    boardsNeeded: number;
    /** Coverage per board in m² (exposed width × board length). */
    boardCoverageM2: number;
    /** Linear metres of horizontal battens needed. */
    battenLinearM: number;
}

// ---------------------------------------------------------------------------
// Calculator function
// ---------------------------------------------------------------------------

/**
 * Calculate cladding material quantities.
 *
 * @todo NOT YET IMPLEMENTED.
 * @throws Always — this is a placeholder stub until the cladding calculator
 *         is built. See the TODO at the top of this file.
 */
export function calculateCladding(_input: CladdingInput): CladdingResult {
    throw new Error(
        'calculateCladding is not yet implemented. ' +
        'See TODO in src/calculators/cladding.ts',
    );
}
