import { getBoardDimensions } from './board-presets';
import { applyWaste, packsNeeded } from './primitives';
import type { BoardCoverageInput, BoardCoverageResult, MaterialQuantity } from './types';

// Re-export so existing consumers (CoverageCalculator.tsx, index.ts) keep working.
export { BOARD_PRESETS } from './board-presets';

/**
 * Calculate how many boards or sheets are needed to cover a given area.
 *
 * Supply either a `presetId` (one of the common UK board sizes from
 * BOARD_PRESETS) or custom dimensions via `customLengthMm` / `customWidthMm`.
 * Wastage defaults to 10 % if omitted. Zero area returns zero boards.
 *
 * @throws If `presetId` is supplied but not found in BOARD_PRESETS.
 * @throws If `areaM2` is negative.
 */
export function calculateBoardCoverage(input: BoardCoverageInput): BoardCoverageResult {
    const { areaM2, wastagePercent = 10 } = input;

    if (areaM2 < 0) throw new Error('Area must be non-negative.');

    // Resolve dimensions early so an invalid presetId throws even for zero area.
    const dims = getBoardDimensions(input);

    if (areaM2 === 0) {
        const materials: MaterialQuantity[] = [{ material: dims.label, quantity: 0, unit: 'boards' }];
        return {
            boardsNeeded: 0,
            boardLabel: dims.label,
            boardLengthMm: dims.lengthMm,
            boardWidthMm: dims.widthMm,
            coveragePerBoardM2: dims.coverageM2,
            grossAreaM2: 0,
            netAreaM2: 0,
            wastagePercent,
            materials,
        };
    }

    const grossAreaM2 = applyWaste(areaM2, wastagePercent);
    const boardsNeeded = packsNeeded(grossAreaM2, dims.coverageM2);
    const materials: MaterialQuantity[] = [{ material: dims.label, quantity: boardsNeeded, unit: 'boards' }];

    return {
        boardsNeeded,
        boardLabel: dims.label,
        boardLengthMm: dims.lengthMm,
        boardWidthMm: dims.widthMm,
        coveragePerBoardM2: dims.coverageM2,
        grossAreaM2,
        netAreaM2: areaM2,
        wastagePercent,
        materials,
    };
}
