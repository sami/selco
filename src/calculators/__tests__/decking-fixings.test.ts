import { describe, it, expect } from 'vitest';
import { calculateDeckingFixings } from '../decking-fixings';

// Face-fix formula:
//   joistCrossings = floor(boardLengthMm / joistSpacingMm) + 1
//   screwsPerBoard = joistCrossings × 2
//   totalScrews    = boardsNeeded × screwsPerBoard × (1 + wastage/100)
//
// Hidden clips formula:
//   clipsPerBoard  = joistCrossings  (1 per crossing)
//   totalClips     = boardsNeeded × clipsPerBoard × (1 + wastage/100)

describe('calculateDeckingFixings — fixings quantity calculations', () => {

    it('TC1: 27 boards, 3600mm length, 400mm joist spacing, face-fix, pack=200, 10% waste → 594 screws', () => {
        // joistCrossings = floor(3600 / 400) + 1 = 9 + 1 = 10
        // screwsPerBoard = 10 × 2 = 20
        // totalScrews    = 27 × 20 = 540
        // withWaste      = 540 × 1.10 = 594
        // screwsNeeded   = ceil(594) = 594
        // packsNeeded    = ceil(594 / 200) = 3
        const result = calculateDeckingFixings({
            boardsNeeded: 27, boardLengthMm: 3600, joistSpacingMm: 400,
            fixingMethod: 'face-fix-screws', packSize: 200, wastage: 10,
        });
        expect(result.fixingsNeeded).toBe(594);
        expect(result.packsNeeded).toBe(3);
        expect(result.fixingsPerBoard).toBe(20);
        expect(result.joistCrossingsPerBoard).toBe(10);
        expect(result.fixingMethod).toBe('face-fix-screws');
        expect(result.materials).toHaveLength(1);
        expect(result.materials[0].material).toBe('Decking screws');
    });

    it('TC2: 27 boards, 3600mm, 400mm spacing, hidden-clips, pack=100, 10% waste → 297 clips', () => {
        // joistCrossings = 10
        // clipsPerBoard  = 10  (1 per crossing)
        // totalClips     = 27 × 10 = 270
        // withWaste      = 270 × 1.10 = 297
        // clipsNeeded    = ceil(297) = 297
        // packsNeeded    = ceil(297 / 100) = 3
        const result = calculateDeckingFixings({
            boardsNeeded: 27, boardLengthMm: 3600, joistSpacingMm: 400,
            fixingMethod: 'hidden-clips', packSize: 100, wastage: 10,
        });
        expect(result.fixingsNeeded).toBe(297);
        expect(result.packsNeeded).toBe(3);
        expect(result.fixingsPerBoard).toBe(10);
        expect(result.materials[0].material).toBe('Hidden fixing clips');
    });

    it('TC3: 37 boards, 4800mm, 450mm spacing, face-fix, pack=600, 10% waste → 898 screws', () => {
        // joistCrossings = floor(4800 / 450) + 1 = 10 + 1 = 11
        // screwsPerBoard = 11 × 2 = 22
        // totalScrews    = 37 × 22 = 814
        // withWaste      = 814 × 1.10 = 895.4
        // screwsNeeded   = ceil(895.4) = 896
        // packsNeeded    = ceil(896 / 600) = 2
        const result = calculateDeckingFixings({
            boardsNeeded: 37, boardLengthMm: 4800, joistSpacingMm: 450,
            fixingMethod: 'face-fix-screws', packSize: 600, wastage: 10,
        });
        expect(result.fixingsNeeded).toBe(896);
        expect(result.packsNeeded).toBe(2);
        expect(result.joistCrossingsPerBoard).toBe(11);
    });

    it('TC4: 0% wastage — no rounding artefacts', () => {
        // 10 boards × 10 crossings × 2 = 200 screws exactly
        const result = calculateDeckingFixings({
            boardsNeeded: 10, boardLengthMm: 3600, joistSpacingMm: 400,
            fixingMethod: 'face-fix-screws', packSize: 200, wastage: 0,
        });
        expect(result.fixingsNeeded).toBe(200);
        expect(result.packsNeeded).toBe(1);
    });

    it('TC5: throws on zero joist spacing', () => {
        expect(() => calculateDeckingFixings({
            boardsNeeded: 10, boardLengthMm: 3600, joistSpacingMm: 0,
            fixingMethod: 'face-fix-screws', packSize: 200, wastage: 10,
        })).toThrow();
    });
});
