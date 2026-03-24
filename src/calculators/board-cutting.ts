/**
 * @file src/calculators/board-cutting.ts
 *
 * Layer 1 calculator — Board Cutting Optimiser.
 *
 * @todo NOT YET IMPLEMENTED — placeholder only.
 *
 * Intended to solve the 2D cutting stock problem: given a set of required
 * part sizes, minimise the number of full sheets consumed. This is
 * materially more complex than the other calculators and will require a
 * bin-packing or guillotine-cutting algorithm.
 *
 * Candidate approaches:
 *   - First Fit Decreasing (FFD) heuristic — simple, good enough for most
 *     trade use cases.
 *   - Guillotine cutting — models realistic saw cuts where every cut goes
 *     edge-to-edge; more accurate for plywood/MDF.
 *
 * Expected inputs: standard sheet size (e.g. 2440 × 1220 mm), list of
 * required parts with width × height, grain direction constraint (optional),
 * kerf width (saw blade thickness, typically 3–4 mm).
 *
 * When implemented this module must remain a pure function with no DOM,
 * no React imports, and no side effects. All logic must be testable in
 * isolation via `board-cutting.test.ts`.
 */

// ---------------------------------------------------------------------------
// Input / output interfaces
// ---------------------------------------------------------------------------

/** A single rectangular part to be cut from a sheet. */
export interface CutPart {
    /** Width of the part in mm. */
    widthMm: number;
    /** Height of the part in mm. */
    heightMm: number;
    /** How many of this part are needed. Defaults to 1. */
    quantity?: number;
    /** Optional label shown in the cut plan (e.g. "Side panel"). */
    label?: string;
}

/** Input for the board cutting optimiser. */
export interface BoardCuttingInput {
    /** Width of the standard sheet in mm (e.g. 1220 for 8×4). */
    sheetWidthMm: number;
    /** Height of the standard sheet in mm (e.g. 2440 for 8×4). */
    sheetHeightMm: number;
    /**
     * Saw blade kerf in mm — material lost with each cut.
     * Typically 3 mm for circular saws, 2 mm for track saws.
     */
    kerfMm: number;
    /**
     * Parts to cut from the sheets. The optimiser will try to fit all
     * parts using the fewest sheets possible.
     */
    parts: CutPart[];
}

/** A placed part within a sheet (for cut plan visualisation). */
export interface PlacedPart extends CutPart {
    /** X offset from the top-left corner of the sheet in mm. */
    xMm: number;
    /** Y offset from the top-left corner of the sheet in mm. */
    yMm: number;
    /** True if this part was rotated 90° to fit. */
    rotated: boolean;
}

/** A single sheet with its placed parts. */
export interface CutSheet {
    /** 1-based sheet number. */
    sheetNumber: number;
    /** Parts placed on this sheet, with their positions. */
    parts: PlacedPart[];
    /** Waste area in mm² (sheet area minus sum of placed part areas). */
    wasteAreaMm2: number;
}

/** Result from the board cutting optimiser. */
export interface BoardCuttingResult {
    /** Total number of sheets needed. */
    sheetsNeeded: number;
    /** Per-sheet cut plans (one entry per sheet). */
    sheets: CutSheet[];
    /** Overall material utilisation percentage (0–100). */
    utilisationPct: number;
    /** Total waste area across all sheets in m². */
    totalWasteM2: number;
}

// ---------------------------------------------------------------------------
// Calculator function
// ---------------------------------------------------------------------------

/**
 * Optimise board cuts to minimise sheet consumption.
 *
 * @todo NOT YET IMPLEMENTED.
 * @throws Always — this is a placeholder stub until the board cutting
 *         optimiser is built. See the TODO at the top of this file.
 */
export function calculateBoardCutting(_input: BoardCuttingInput): BoardCuttingResult {
    throw new Error(
        'calculateBoardCutting is not yet implemented. ' +
        'See TODO in src/calculators/board-cutting.ts',
    );
}
