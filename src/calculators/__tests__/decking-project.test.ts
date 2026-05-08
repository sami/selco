import { describe, it, expect } from 'vitest';
import { calculateDeckingProject } from '../decking-project';

// The project orchestrator chains:
//   1. calculateDecking() — board quantities
//   2. calculateDeckingFixings() — screws or clips
//   3. calculateDeckingSubstructure() — joists and deck blocks
//
// This test verifies the integration — that the orchestrator
// correctly passes outputs between sub-calculators and merges materials.

describe('calculateDeckingProject — full project orchestration', () => {

    it('TC1: 4×3m deck, 135mm composite boards, 3600mm, 5mm gap, 400mm joists, face-fix', () => {
        // Area = 4 × 3 = 12 m²
        //
        // Boards (from decking.ts):
        //   effectiveWidth = (135+5)/1000 = 0.14 m
        //   coverage = 0.14 × 3.6 = 0.504 m²
        //   raw = 12 / 0.504 = 23.81 → × 1.10 = 26.19 → 27 boards
        //   packs = 27 / 1 = 27
        //
        // Fixings (from decking-fixings.ts):
        //   crossings = floor(3600/400)+1 = 10
        //   screws/board = 10 × 2 = 20
        //   total = 27 × 20 × 1.10 = 594 → 3 packs of 200
        //
        // Substructure (from decking-substructure.ts):
        //   joists = floor(4/0.4)+1 = 11
        //   pieces/joist = ceil(3000/3600) = 1
        //   stockPieces = ceil(11 × 1.10) = 13
        //   supports/joist = floor(3000/1200)+1 = 3
        //   blocks = 11 × 3 = 33
        const result = calculateDeckingProject({
            deckLengthM: 4, deckWidthM: 3,
            boardWidthMm: 135, boardLengthMm: 3600, gapMm: 5,
            boardWastage: 10, boardPackSize: 1,
            joistSpacingMm: 400, joistStockLengthMm: 3600,
            supportSpacingMm: 1200, includeDeckBlocks: true, joistWastage: 10,
            fixingMethod: 'face-fix-screws', fixingPackSize: 200, fixingWastage: 10,
        });

        expect(result.deckAreaM2).toBe(12);
        expect(result.boardsNeeded).toBe(27);
        expect(result.boardPacksNeeded).toBe(27);
        expect(result.fixingsNeeded).toBe(594);
        expect(result.fixingPacksNeeded).toBe(3);
        expect(result.joistsNeeded).toBe(13);
        expect(result.deckBlocksNeeded).toBe(33);

        // Materials should have 4 entries: boards, screws, joists, blocks
        expect(result.materials).toHaveLength(4);
        expect(result.materials.map(m => m.material)).toEqual([
            'Decking boards', 'Decking screws', 'Joist timber', 'Deck blocks',
        ]);
    });

    it('TC2: hidden clips, no deck blocks — materials should have 3 entries', () => {
        const result = calculateDeckingProject({
            deckLengthM: 3, deckWidthM: 3,
            boardWidthMm: 135, boardLengthMm: 3600, gapMm: 5,
            boardWastage: 10, boardPackSize: 1,
            joistSpacingMm: 400, joistStockLengthMm: 3600,
            supportSpacingMm: 1200, includeDeckBlocks: false, joistWastage: 10,
            fixingMethod: 'hidden-clips', fixingPackSize: 100, fixingWastage: 10,
        });

        // 3 materials: boards, clips, joists (no blocks)
        expect(result.materials).toHaveLength(3);
        expect(result.materials.map(m => m.material)).toEqual([
            'Decking boards', 'Hidden fixing clips', 'Joist timber',
        ]);
        expect(result.deckBlocksNeeded).toBe(0);
    });

    it('TC3: throws on zero dimensions', () => {
        expect(() => calculateDeckingProject({
            deckLengthM: 0, deckWidthM: 3,
            boardWidthMm: 135, boardLengthMm: 3600, gapMm: 5,
            boardWastage: 10, boardPackSize: 1,
            joistSpacingMm: 400, joistStockLengthMm: 3600,
            supportSpacingMm: 1200, includeDeckBlocks: true, joistWastage: 10,
            fixingMethod: 'face-fix-screws', fixingPackSize: 200, fixingWastage: 10,
        })).toThrow();
    });
});
