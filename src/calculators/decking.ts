/**
 * @file src/calculators/decking.ts
 *
 * Layer 1 calculator — Decking.
 *
 * @todo NOT YET IMPLEMENTED — placeholder only.
 *
 * Intended to calculate material quantities for timber decking projects.
 * Expected inputs: deck area (or dimensions), board width and thickness,
 * joist spacing, post centres, wastage percentage.
 *
 * When implemented this module must remain a pure function with no DOM,
 * no React imports, and no side effects. All logic must be testable in
 * isolation via `decking.test.ts`.
 */

// ---------------------------------------------------------------------------
// Input / output interfaces
// ---------------------------------------------------------------------------

/** Input for the decking calculator. */
export interface DeckingInput {
    /** Total deck area in m². Must be greater than zero. */
    areaM2: number;
    /** Width of each decking board in mm (e.g. 125 for a 125 mm deck board). */
    boardWidthMm: number;
    /** Length of each decking board in mm (e.g. 3600 for a 3.6 m board). */
    boardLengthMm: number;
    /** Gap between boards in mm (typically 5–8 mm for drainage). */
    gapMm: number;
    /** Joist spacing centre-to-centre in mm (typically 400–600 mm). */
    joistSpacingMm: number;
    /** Wastage percentage to add (0–20). 10 % is typical. */
    wastage: number;
}

/** Result from the decking calculator. */
export interface DeckingResult {
    /** Number of decking boards needed, including wastage, rounded up. */
    boardsNeeded: number;
    /** Area covered per board in m² (board width × board length). */
    boardAreaM2: number;
    /**
     * Approximate number of joists needed.
     * Assumes joists run the shorter dimension of the deck.
     */
    joistsNeeded: number;
}

// ---------------------------------------------------------------------------
// Calculator function
// ---------------------------------------------------------------------------

/**
 * Calculate decking material quantities.
 *
 * @todo NOT YET IMPLEMENTED.
 * @throws Always — this is a placeholder stub until the decking calculator
 *         is built. See the TODO at the top of this file.
 */
export function calculateDecking(_input: DeckingInput): DeckingResult {
    throw new Error(
        'calculateDecking is not yet implemented. ' +
        'See TODO in src/calculators/decking.ts',
    );
}
