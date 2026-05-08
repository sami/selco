import { describe, it, expect } from 'vitest';
import { calculateDeckingSubstructure } from '../decking-substructure';

// Joist formula:
//   joistsNeeded        = floor(deckSpanM / (joistSpacingMm / 1000)) + 1
//   joistLengthM        = deckDepthM
//   totalJoistLengthM   = joistsNeeded × joistLengthM × (1 + wastage / 100)
//   joistStockPieces    = for each joist, ceil(joistLengthMm / joistStockLengthMm)
//                         → total = joistsNeeded × piecesPerJoist
//
// Deck block formula:
//   supportsPerJoist = floor(joistLengthMm / supportSpacingMm) + 1
//   totalBlocks      = joistsNeeded × supportsPerJoist

describe('calculateDeckingSubstructure — joist and deck block calculations', () => {

    it('TC1: 4×3m deck, 400mm spacing, 3600mm stock joists, 1200mm supports, with blocks, 10% waste', () => {
        // Joists run across 4m span:
        //   joistsNeeded     = floor(4 / 0.4) + 1 = 10 + 1 = 11
        //   joistLengthM     = 3.0 m
        //   totalJoistLengthM = 11 × 3.0 × 1.10 = 36.3 m
        //   piecesPerJoist   = ceil(3000 / 3600) = 1
        //   stockPieces      = ceil(11 × 1.10) = ceil(12.1) = 13
        //
        // Deck blocks:
        //   supportsPerJoist = floor(3000 / 1200) + 1 = 2 + 1 = 3
        //   totalBlocks      = 11 × 3 = 33
        const result = calculateDeckingSubstructure({
            deckSpanM: 4, deckDepthM: 3, joistSpacingMm: 400,
            joistStockLengthMm: 3600, supportSpacingMm: 1200,
            includeDeckBlocks: true, wastage: 10,
        });
        expect(result.joistsNeeded).toBe(11);
        expect(result.joistLengthM).toBe(3);
        expect(result.totalJoistLengthM).toBeCloseTo(36.3, 1);
        expect(result.joistStockPiecesNeeded).toBe(13);
        expect(result.deckBlocksNeeded).toBe(33);
        expect(result.supportsPerJoist).toBe(3);
        expect(result.materials.length).toBeGreaterThanOrEqual(1);
    });

    it('TC2: 5×4m deck, 450mm spacing, 4800mm stock, no blocks, 10% waste', () => {
        // joistsNeeded  = floor(5 / 0.45) + 1 = 11 + 1 = 12
        // joistLengthM  = 4.0 m
        // piecesPerJoist = ceil(4000 / 4800) = 1
        // stockPieces    = ceil(12 × 1.10) = ceil(13.2) = 14
        // deckBlocks = 0  (not included)
        const result = calculateDeckingSubstructure({
            deckSpanM: 5, deckDepthM: 4, joistSpacingMm: 450,
            joistStockLengthMm: 4800, supportSpacingMm: 1200,
            includeDeckBlocks: false, wastage: 10,
        });
        expect(result.joistsNeeded).toBe(12);
        expect(result.joistStockPiecesNeeded).toBe(14);
        expect(result.deckBlocksNeeded).toBe(0);
    });

    it('TC3: joist length exceeds stock length → multiple pieces per joist', () => {
        // 3×5m deck, joists run 5m, stock is 2400mm
        // joistsNeeded   = floor(3 / 0.4) + 1 = 7 + 1 = 8
        // piecesPerJoist = ceil(5000 / 2400) = ceil(2.083) = 3
        // stockPieces    = ceil(8 × 3 × 1.10) = ceil(26.4) = 27
        const result = calculateDeckingSubstructure({
            deckSpanM: 3, deckDepthM: 5, joistSpacingMm: 400,
            joistStockLengthMm: 2400, supportSpacingMm: 1200,
            includeDeckBlocks: true, wastage: 10,
        });
        expect(result.joistsNeeded).toBe(8);
        expect(result.joistStockPiecesNeeded).toBe(27);
        // supportsPerJoist = floor(5000 / 1200) + 1 = 4 + 1 = 5
        expect(result.supportsPerJoist).toBe(5);
        expect(result.deckBlocksNeeded).toBe(40); // 8 × 5
    });

    it('TC4: throws on zero deck span', () => {
        expect(() => calculateDeckingSubstructure({
            deckSpanM: 0, deckDepthM: 3, joistSpacingMm: 400,
            joistStockLengthMm: 3600, supportSpacingMm: 1200,
            includeDeckBlocks: true, wastage: 10,
        })).toThrow();
    });

    it('TC5: joist material line in materials array', () => {
        const result = calculateDeckingSubstructure({
            deckSpanM: 4, deckDepthM: 3, joistSpacingMm: 400,
            joistStockLengthMm: 3600, supportSpacingMm: 1200,
            includeDeckBlocks: true, wastage: 10,
        });
        const joistMat = result.materials.find(m => m.material === 'Joist timber');
        expect(joistMat).toBeDefined();
        expect(joistMat!.quantity).toBe(13);
        expect(joistMat!.unit).toBe('lengths');

        const blockMat = result.materials.find(m => m.material === 'Deck blocks');
        expect(blockMat).toBeDefined();
        expect(blockMat!.quantity).toBe(33);
    });
});
