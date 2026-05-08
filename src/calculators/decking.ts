/**
 * @file src/calculators/decking.ts
 *
 * Layer 1 calculator — Decking boards.
 *
 * Calculates the number of decking boards needed to cover a given area,
 * accounting for the gap between boards and wastage.
 *
 * **Formula:**
 * 1. effectiveBoardWidthM = (boardWidthMm + gapMm) / 1000
 * 2. boardCoverageM2      = effectiveBoardWidthM × (boardLengthMm / 1000)
 * 3. rawBoards            = areaM2 / boardCoverageM2
 * 4. withWaste            = rawBoards × (1 + wastage / 100)
 * 5. boardsNeeded         = ceil(withWaste)
 * 6. packsNeeded          = ceil(boardsNeeded / packSize)
 *
 * This module must remain a pure function with no DOM, no React imports,
 * and no side effects. All logic must be testable in isolation via
 * `decking.test.ts`.
 */

import type { MaterialQuantity } from '../types';
import { packsNeeded as calcPacks } from './primitives';

// ---------------------------------------------------------------------------
// Types — board type
// ---------------------------------------------------------------------------

/** Decking board material type. */
export type DeckingBoardType = 'composite' | 'treated-softwood' | 'hardwood';

/** Fixing method for decking boards. */
export type DeckingFixingMethod = 'face-fix-screws' | 'hidden-clips';

// ---------------------------------------------------------------------------
// Input / output interfaces
// ---------------------------------------------------------------------------

/** Input for the decking board calculator. */
export interface DeckingInput {
    /** Total deck area in m². Must be greater than zero. */
    areaM2: number;
    /** Width of each decking board in mm (e.g. 135 for composite, 120 for timber). */
    boardWidthMm: number;
    /** Length of each decking board in mm (e.g. 3600 for a 3.6 m board). */
    boardLengthMm: number;
    /** Gap between boards in mm (typically 5–8 mm for drainage). */
    gapMm: number;
    /** Wastage percentage to add (0–20). 10 % is typical for straight runs. */
    wastage: number;
    /** Number of boards per pack (pass 1 if sold individually). */
    packSize: number;
}

/** Result from the decking board calculator. */
export interface DeckingResult {
    /** Number of decking boards needed, including wastage, rounded up. */
    boardsNeeded: number;
    /** Number of packs to purchase, rounded up. */
    packsNeeded: number;
    /** Area covered per board in m² (effective width × length). */
    boardCoverageM2: number;
    /** Effective board width including gap, in metres. */
    effectiveBoardWidthM: number;
    /** Total deck area before wastage. */
    netAreaM2: number;
    /** Total deck area after wastage. */
    grossAreaM2: number;
    /** Wastage percentage applied. */
    wastagePercent: number;
    /** Bill of materials. */
    materials: MaterialQuantity[];
}

// ---------------------------------------------------------------------------
// Calculator function
// ---------------------------------------------------------------------------

/**
 * Calculate decking board quantities.
 *
 * @throws If areaM2 is zero or negative.
 * @throws If boardWidthMm or boardLengthMm is zero or negative.
 * @throws If gapMm is negative.
 * @throws If wastage is negative.
 */
export function calculateDecking(input: DeckingInput): DeckingResult {
    const { areaM2, boardWidthMm, boardLengthMm, gapMm, wastage, packSize } = input;

    // --- Validation ---
    if (areaM2 <= 0) throw new Error('Deck area must be greater than zero.');
    if (boardWidthMm <= 0) throw new Error('Board width must be greater than zero.');
    if (boardLengthMm <= 0) throw new Error('Board length must be greater than zero.');
    if (gapMm < 0) throw new Error('Gap between boards cannot be negative.');
    if (wastage < 0) throw new Error('Wastage cannot be negative.');

    // --- Core calculation ---
    const effectiveBoardWidthM = (boardWidthMm + gapMm) / 1000;
    const boardLengthM = boardLengthMm / 1000;
    const boardCoverageM2 = effectiveBoardWidthM * boardLengthM;

    const rawBoards = areaM2 / boardCoverageM2;
    const withWaste = rawBoards * (1 + wastage / 100);
    const boardsNeeded = Math.ceil(withWaste);
    const packs = calcPacks(boardsNeeded, packSize);

    const grossAreaM2 = parseFloat((areaM2 * (1 + wastage / 100)).toPrecision(12));

    const materials: MaterialQuantity[] = [{
        material: 'Decking boards',
        quantity: boardsNeeded,
        unit: 'boards',
        packSize,
        packsNeeded: packs,
    }];

    return {
        boardsNeeded,
        packsNeeded: packs,
        boardCoverageM2: parseFloat(boardCoverageM2.toPrecision(12)),
        effectiveBoardWidthM: parseFloat(effectiveBoardWidthM.toPrecision(12)),
        netAreaM2: areaM2,
        grossAreaM2,
        wastagePercent: wastage,
        materials,
    };
}
