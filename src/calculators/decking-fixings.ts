/**
 * @file src/calculators/decking-fixings.ts
 *
 * Layer 1 calculator — Decking fixings (screws or hidden clips).
 *
 * **Face-fix screws formula:**
 * 1. joistCrossingsPerBoard = floor(boardLengthMm / joistSpacingMm) + 1
 * 2. screwsPerBoard         = joistCrossingsPerBoard × 2
 * 3. totalScrews            = boardsNeeded × screwsPerBoard
 * 4. withWaste              = totalScrews × (1 + wastage / 100)
 * 5. screwsNeeded           = ceil(withWaste)
 * 6. packsNeeded            = ceil(screwsNeeded / packSize)
 *
 * **Hidden clips formula:**
 * 1. joistCrossingsPerBoard = floor(boardLengthMm / joistSpacingMm) + 1
 * 2. clipsPerBoard          = joistCrossingsPerBoard
 * 3. totalClips             = boardsNeeded × clipsPerBoard
 * 4. withWaste              = totalClips × (1 + wastage / 100)
 * 5. clipsNeeded            = ceil(withWaste)
 * 6. packsNeeded            = ceil(clipsNeeded / packSize)
 *
 * Pure function — no DOM, no React, no side effects.
 */

import type { MaterialQuantity } from '../types';
import type { DeckingFixingMethod } from './decking';

// ---------------------------------------------------------------------------
// Input / output interfaces
// ---------------------------------------------------------------------------

/** Input for the decking fixings calculator. */
export interface DeckingFixingsInput {
    /** Number of decking boards (from calculateDecking). */
    boardsNeeded: number;
    /** Board length in mm. */
    boardLengthMm: number;
    /** Joist spacing centre-to-centre in mm. */
    joistSpacingMm: number;
    /** Fixing method. */
    fixingMethod: DeckingFixingMethod;
    /** Fixings per pack (e.g. 200 screws, 100 clips). */
    packSize: number;
    /** Wastage percentage (0–20). 10% is typical. */
    wastage: number;
}

/** Result from the decking fixings calculator. */
export interface DeckingFixingsResult {
    /** Total fixings needed (screws or clips), including wastage, rounded up. */
    fixingsNeeded: number;
    /** Number of packs to purchase, rounded up. */
    packsNeeded: number;
    /** Fixings per board (before wastage). */
    fixingsPerBoard: number;
    /** Joist crossings per board. */
    joistCrossingsPerBoard: number;
    /** Fixing method used. */
    fixingMethod: DeckingFixingMethod;
    /** Bill of materials. */
    materials: MaterialQuantity[];
}

// ---------------------------------------------------------------------------
// Calculator function
// ---------------------------------------------------------------------------

/**
 * Calculate decking fixings quantities.
 *
 * @throws If boardsNeeded is zero or negative.
 * @throws If joistSpacingMm is zero or negative.
 */
export function calculateDeckingFixings(input: DeckingFixingsInput): DeckingFixingsResult {
    const { boardsNeeded, boardLengthMm, joistSpacingMm, fixingMethod, packSize, wastage } = input;

    // --- Validation ---
    if (boardsNeeded <= 0) throw new Error('boardsNeeded must be greater than zero.');
    if (joistSpacingMm <= 0) throw new Error('Joist spacing must be greater than zero.');

    // --- Core calculation ---
    const joistCrossingsPerBoard = Math.floor(boardLengthMm / joistSpacingMm) + 1;
    const fixingsPerBoard = fixingMethod === 'face-fix-screws'
        ? joistCrossingsPerBoard * 2
        : joistCrossingsPerBoard;

    const totalFixings = boardsNeeded * fixingsPerBoard;
    const withWaste = totalFixings * (1 + wastage / 100);
    const fixingsNeeded = Math.ceil(withWaste);
    const packs = Math.ceil(fixingsNeeded / packSize);

    const materialName = fixingMethod === 'face-fix-screws'
        ? 'Decking screws'
        : 'Hidden fixing clips';

    const materials: MaterialQuantity[] = [{
        material: materialName,
        quantity: fixingsNeeded,
        unit: fixingMethod === 'face-fix-screws' ? 'screws' : 'clips',
        packSize,
        packsNeeded: packs,
    }];

    return {
        fixingsNeeded,
        packsNeeded: packs,
        fixingsPerBoard,
        joistCrossingsPerBoard,
        fixingMethod,
        materials,
    };
}
