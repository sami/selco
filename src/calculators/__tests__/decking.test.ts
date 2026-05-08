import { describe, it, expect } from 'vitest';
import { calculateDecking } from '../decking';
import type { DeckingInput } from '../decking';

// Formula: effectiveBoardWidthM = (boardWidthMm + gapMm) / 1000
//          boardCoverageM2      = effectiveBoardWidthM × (boardLengthMm / 1000)
//          rawBoards            = areaM2 / boardCoverageM2
//          withWaste            = rawBoards × (1 + wastage / 100)
//          boardsNeeded         = ceil(withWaste)
//          packsNeeded          = ceil(boardsNeeded / packSize)

describe('calculateDecking — board quantity calculations', () => {

    it('TC1: 12m², 135mm composite board, 3600mm length, 5mm gap, 10% waste, pack=1 → 27 boards', () => {
        // effectiveBoardWidthM = (135 + 5) / 1000 = 0.140 m
        // boardCoverageM2     = 0.140 × 3.600 = 0.504 m²
        // rawBoards           = 12 / 0.504 = 23.809...
        // withWaste           = 23.809 × 1.10 = 26.190...
        // boardsNeeded        = ceil(26.190) = 27
        const result = calculateDecking({
            areaM2: 12, boardWidthMm: 135, boardLengthMm: 3600,
            gapMm: 5, wastage: 10, packSize: 1,
        });
        expect(result.boardsNeeded).toBe(27);
        expect(result.packsNeeded).toBe(27);
        expect(result.boardCoverageM2).toBeCloseTo(0.504, 3);
        expect(result.netAreaM2).toBe(12);
        expect(result.grossAreaM2).toBeCloseTo(13.2, 1);
        expect(result.wastagePercent).toBe(10);
        expect(result.materials).toHaveLength(1);
        expect(result.materials[0].material).toBe('Decking boards');
    });

    it('TC2: 20m², 120mm treated softwood, 4800mm length, 6mm gap, 10% waste, pack=1 → 35 boards', () => {
        // effectiveBoardWidthM = (120 + 6) / 1000 = 0.126 m
        // boardCoverageM2     = 0.126 × 4.800 = 0.6048 m²
        // rawBoards           = 20 / 0.6048 = 33.068...
        // withWaste           = 33.068 × 1.10 = 36.375...
        // boardsNeeded        = ceil(36.375) = 37
        const result = calculateDecking({
            areaM2: 20, boardWidthMm: 120, boardLengthMm: 4800,
            gapMm: 6, wastage: 10, packSize: 1,
        });
        expect(result.boardsNeeded).toBe(37);
        expect(result.packsNeeded).toBe(37);
        expect(result.boardCoverageM2).toBeCloseTo(0.6048, 3);
    });

    it('TC3: 9m², 150mm board, 3600mm length, 8mm gap, 10% waste, pack=5 → 4 packs (18 boards)', () => {
        // effectiveBoardWidthM = (150 + 8) / 1000 = 0.158 m
        // boardCoverageM2     = 0.158 × 3.600 = 0.5688 m²
        // rawBoards           = 9 / 0.5688 = 15.821...
        // withWaste           = 15.821 × 1.10 = 17.404...
        // boardsNeeded        = ceil(17.404) = 18
        // packsNeeded         = ceil(18 / 5) = 4
        const result = calculateDecking({
            areaM2: 9, boardWidthMm: 150, boardLengthMm: 3600,
            gapMm: 8, wastage: 10, packSize: 5,
        });
        expect(result.boardsNeeded).toBe(18);
        expect(result.packsNeeded).toBe(4);
    });

    it('TC4: 6m², 100mm easi board, 3600mm length, 5mm gap, 15% waste, pack=1 → 19 boards', () => {
        // effectiveBoardWidthM = (100 + 5) / 1000 = 0.105 m
        // boardCoverageM2     = 0.105 × 3.600 = 0.378 m²
        // rawBoards           = 6 / 0.378 = 15.873...
        // withWaste           = 15.873 × 1.15 = 18.254...
        // boardsNeeded        = ceil(18.254) = 19
        const result = calculateDecking({
            areaM2: 6, boardWidthMm: 100, boardLengthMm: 3600,
            gapMm: 5, wastage: 15, packSize: 1,
        });
        expect(result.boardsNeeded).toBe(19);
        expect(result.wastagePercent).toBe(15);
    });

    it('TC5: 25m², 135mm composite, 4800mm length, 5mm gap, 0% waste, pack=1 → 38 boards', () => {
        // effectiveBoardWidthM = (135 + 5) / 1000 = 0.140 m
        // boardCoverageM2     = 0.140 × 4.800 = 0.672 m²
        // rawBoards           = 25 / 0.672 = 37.202...
        // withWaste           = 37.202 × 1.00 = 37.202...
        // boardsNeeded        = ceil(37.202) = 38
        const result = calculateDecking({
            areaM2: 25, boardWidthMm: 135, boardLengthMm: 4800,
            gapMm: 5, wastage: 0, packSize: 1,
        });
        expect(result.boardsNeeded).toBe(38);
    });

    it('TC6: zero area throws', () => {
        expect(() => calculateDecking({
            areaM2: 0, boardWidthMm: 135, boardLengthMm: 3600,
            gapMm: 5, wastage: 10, packSize: 1,
        })).toThrow();
    });

    it('TC7: negative board width throws', () => {
        expect(() => calculateDecking({
            areaM2: 10, boardWidthMm: -100, boardLengthMm: 3600,
            gapMm: 5, wastage: 10, packSize: 1,
        })).toThrow();
    });

    it('TC8: effectiveBoardWidthM is correctly computed in result', () => {
        const result = calculateDecking({
            areaM2: 10, boardWidthMm: 135, boardLengthMm: 3600,
            gapMm: 5, wastage: 10, packSize: 1,
        });
        expect(result.effectiveBoardWidthM).toBeCloseTo(0.14, 3);
    });
});
