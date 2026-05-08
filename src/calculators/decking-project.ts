/**
 * @file src/calculators/decking-project.ts
 *
 * Layer 1 orchestrator — Decking project.
 *
 * Chains the board, fixings, and substructure calculators to produce a
 * combined bill of materials for a complete decking project.
 *
 * Pure function — no DOM, no React, no side effects.
 */

import type { MaterialQuantity } from '../types';
import type { DeckingFixingMethod } from './decking';
import { calculateDecking } from './decking';
import { calculateDeckingFixings } from './decking-fixings';
import { calculateDeckingSubstructure } from './decking-substructure';

// ---------------------------------------------------------------------------
// Input / output interfaces
// ---------------------------------------------------------------------------

/** Input for the complete decking project calculator. */
export interface DeckingProjectInput {
    /** Deck length in metres. */
    deckLengthM: number;
    /** Deck width in metres. */
    deckWidthM: number;
    /** Board width in mm. */
    boardWidthMm: number;
    /** Board length in mm. */
    boardLengthMm: number;
    /** Gap between boards in mm. */
    gapMm: number;
    /** Board wastage percentage. */
    boardWastage: number;
    /** Boards per pack (1 if individual). */
    boardPackSize: number;
    /** Joist spacing centre-to-centre in mm. */
    joistSpacingMm: number;
    /** Joist stock length in mm. */
    joistStockLengthMm: number;
    /** Support/block spacing in mm. */
    supportSpacingMm: number;
    /** Whether to include deck blocks. */
    includeDeckBlocks: boolean;
    /** Joist wastage percentage. */
    joistWastage: number;
    /** Fixing method. */
    fixingMethod: DeckingFixingMethod;
    /** Fixings per pack. */
    fixingPackSize: number;
    /** Fixings wastage percentage. */
    fixingWastage: number;
}

/** Result from the complete decking project calculator. */
export interface DeckingProjectResult {
    /** Deck area in m². */
    deckAreaM2: number;
    /** Number of decking boards needed. */
    boardsNeeded: number;
    /** Number of board packs needed. */
    boardPacksNeeded: number;
    /** Number of fixings needed. */
    fixingsNeeded: number;
    /** Number of fixing packs needed. */
    fixingPacksNeeded: number;
    /** Number of joist stock pieces needed. */
    joistsNeeded: number;
    /** Number of deck blocks needed. */
    deckBlocksNeeded: number;
    /** Combined bill of materials from all sub-calculators. */
    materials: MaterialQuantity[];
    /** Non-fatal warnings. */
    warnings: string[];
}

// ---------------------------------------------------------------------------
// Calculator function
// ---------------------------------------------------------------------------

/**
 * Calculate a complete decking project.
 */
export function calculateDeckingProject(input: DeckingProjectInput): DeckingProjectResult {
    const {
        deckLengthM, deckWidthM,
        boardWidthMm, boardLengthMm, gapMm, boardWastage, boardPackSize,
        joistSpacingMm, joistStockLengthMm, supportSpacingMm,
        includeDeckBlocks, joistWastage,
        fixingMethod, fixingPackSize, fixingWastage,
    } = input;

    // --- Validation ---
    if (deckLengthM <= 0) throw new Error('Deck length must be greater than zero.');
    if (deckWidthM <= 0) throw new Error('Deck width must be greater than zero.');

    const deckAreaM2 = deckLengthM * deckWidthM;
    const warnings: string[] = [];

    // --- 1. Board calculation ---
    const boardResult = calculateDecking({
        areaM2: deckAreaM2,
        boardWidthMm, boardLengthMm, gapMm,
        wastage: boardWastage,
        packSize: boardPackSize,
    });

    // --- 2. Fixings calculation ---
    const fixingsResult = calculateDeckingFixings({
        boardsNeeded: boardResult.boardsNeeded,
        boardLengthMm, joistSpacingMm,
        fixingMethod, packSize: fixingPackSize,
        wastage: fixingWastage,
    });

    // --- 3. Substructure calculation ---
    // Boards typically run along the LONGER dimension, joists across the SHORTER.
    // deckSpanM = the dimension joists span across (deck length)
    // deckDepthM = the dimension joists run along (deck width = joist length)
    const subResult = calculateDeckingSubstructure({
        deckSpanM: deckLengthM,
        deckDepthM: deckWidthM,
        joistSpacingMm, joistStockLengthMm,
        supportSpacingMm, includeDeckBlocks,
        wastage: joistWastage,
    });

    // --- Merge materials ---
    const materials: MaterialQuantity[] = [
        ...boardResult.materials,
        ...fixingsResult.materials,
        ...subResult.materials,
    ];

    return {
        deckAreaM2,
        boardsNeeded: boardResult.boardsNeeded,
        boardPacksNeeded: boardResult.packsNeeded,
        fixingsNeeded: fixingsResult.fixingsNeeded,
        fixingPacksNeeded: fixingsResult.packsNeeded,
        joistsNeeded: subResult.joistStockPiecesNeeded,
        deckBlocksNeeded: subResult.deckBlocksNeeded,
        materials,
        warnings,
    };
}
