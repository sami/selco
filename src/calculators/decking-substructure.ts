/**
 * @file src/calculators/decking-substructure.ts
 *
 * Layer 1 calculator — Decking substructure (joists and deck blocks).
 *
 * **Joist formula:**
 * 1. joistsNeeded = floor(deckSpanM / (joistSpacingMm / 1000)) + 1
 * 2. joistLengthM = deckDepthM  (joists run perpendicular to boards)
 * 3. totalJoistLengthM = joistsNeeded × joistLengthM
 *
 * **Deck block formula:**
 * 1. supportsPerJoist = floor(joistLengthMm / supportSpacingMm) + 1
 * 2. totalBlocks      = joistsNeeded × supportsPerJoist
 *
 * Pure function — no DOM, no React, no side effects.
 */

import type { MaterialQuantity } from '../types';

// ---------------------------------------------------------------------------
// Input / output interfaces
// ---------------------------------------------------------------------------

/** Input for the decking substructure calculator. */
export interface DeckingSubstructureInput {
    /** Deck span in metres — the dimension ACROSS which joists run. */
    deckSpanM: number;
    /** Deck depth in metres — the dimension ALONG which joists run (joist length). */
    deckDepthM: number;
    /** Joist spacing centre-to-centre in mm. */
    joistSpacingMm: number;
    /** Joist length available from supplier in mm (e.g. 2400, 3600, 4800). */
    joistStockLengthMm: number;
    /** Support/block spacing in mm. Typically 1200 mm for ground-level. */
    supportSpacingMm: number;
    /** Whether to include deck blocks. */
    includeDeckBlocks: boolean;
    /** Wastage percentage for joists. */
    wastage: number;
}

/** Result from the decking substructure calculator. */
export interface DeckingSubstructureResult {
    /** Number of joist positions across the deck span. */
    joistsNeeded: number;
    /** Length of each joist in metres. */
    joistLengthM: number;
    /** Total linear metres of joist timber. */
    totalJoistLengthM: number;
    /** Number of stock-length joists to purchase (accounting for cutting). */
    joistStockPiecesNeeded: number;
    /** Deck blocks needed (0 if not included). */
    deckBlocksNeeded: number;
    /** Support positions per joist. */
    supportsPerJoist: number;
    /** Bill of materials. */
    materials: MaterialQuantity[];
}

// ---------------------------------------------------------------------------
// Calculator function
// ---------------------------------------------------------------------------

/**
 * Calculate decking substructure quantities.
 *
 * @throws If deckSpanM or deckDepthM is zero or negative.
 * @throws If joistSpacingMm is zero or negative.
 */
export function calculateDeckingSubstructure(input: DeckingSubstructureInput): DeckingSubstructureResult {
    const {
        deckSpanM, deckDepthM, joistSpacingMm, joistStockLengthMm,
        supportSpacingMm, includeDeckBlocks, wastage,
    } = input;

    // --- Validation ---
    if (deckSpanM <= 0) throw new Error('Deck span must be greater than zero.');
    if (deckDepthM <= 0) throw new Error('Deck depth must be greater than zero.');
    if (joistSpacingMm <= 0) throw new Error('Joist spacing must be greater than zero.');

    // --- Joist calculation ---
    const joistsNeeded = Math.floor(deckSpanM / (joistSpacingMm / 1000)) + 1;
    const joistLengthM = deckDepthM;
    const joistLengthMm = joistLengthM * 1000;
    const totalJoistLengthM = parseFloat(
        (joistsNeeded * joistLengthM * (1 + wastage / 100)).toPrecision(12),
    );

    // How many stock-length pieces per joist?
    const piecesPerJoist = Math.ceil(joistLengthMm / joistStockLengthMm);
    const rawStockPieces = joistsNeeded * piecesPerJoist;
    const joistStockPiecesNeeded = Math.ceil(rawStockPieces * (1 + wastage / 100));

    // --- Deck block calculation ---
    const supportsPerJoist = Math.floor(joistLengthMm / supportSpacingMm) + 1;
    const deckBlocksNeeded = includeDeckBlocks ? joistsNeeded * supportsPerJoist : 0;

    // --- Bill of materials ---
    const materials: MaterialQuantity[] = [
        {
            material: 'Joist timber',
            quantity: joistStockPiecesNeeded,
            unit: 'lengths',
        },
    ];

    if (includeDeckBlocks) {
        materials.push({
            material: 'Deck blocks',
            quantity: deckBlocksNeeded,
            unit: 'blocks',
        });
    }

    return {
        joistsNeeded,
        joistLengthM,
        totalJoistLengthM,
        joistStockPiecesNeeded,
        deckBlocksNeeded,
        supportsPerJoist,
        materials,
    };
}
