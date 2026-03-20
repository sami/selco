import { describe, it, expect } from 'vitest';
import { calculateBackerBoard } from '../backer-board';
import type { BackerBoardInput } from '../types';

// Formula: boardsNeeded = ceil(areaM2 × (1 + wastePercent/100) / boardAreaM2)
// packsNeeded = ceil(boardsNeeded / boardsPerPack)  — Flexel only (boardsPerPack=6)
// Default wastePercent = 10

describe('calculateBackerBoard — spec test cases', () => {

    it('TC1: HardieBacker 6mm, 12m², 10% waste → 14 boards (sold individually)', () => {
        // areaWithWaste = 12 × 1.1 = 13.2
        // boardArea = 1.2 × 0.8 = 0.96 m²
        // boards = ceil(13.2 / 0.96) = ceil(13.75) = 14
        const r = calculateBackerBoard({ areaM2: 12, productId: 'hardiebacker-6mm', wastePercent: 10 });
        expect(r.boardsNeeded).toBe(14);
        expect(r.boardAreaM2).toBeCloseTo(0.96, 4);
        expect(r.productName).toBe('HardieBacker 6mm');
        expect(r.packsNeeded).toBeUndefined();
        expect(r.warnings).toHaveLength(0);
        expect(r.materials).toHaveLength(1);
    });

    it('TC2: Jackoboard Plano 6mm, 12m², 10% waste → 19 boards', () => {
        // boardArea = 1.2 × 0.6 = 0.72 m²
        // boards = ceil(13.2 / 0.72) = ceil(18.33) = 19
        const r = calculateBackerBoard({ areaM2: 12, productId: 'jackoboard-plano-6mm', wastePercent: 10 });
        expect(r.boardsNeeded).toBe(19);
        expect(r.boardAreaM2).toBeCloseTo(0.72, 4);
        expect(r.packsNeeded).toBeUndefined();
    });

    it('TC3: Flexel ECOMAX 6mm, 12m², 10% waste → 19 boards → 4 packs', () => {
        // boards = ceil(13.2 / 0.72) = 19
        // packs = ceil(19 / 6) = ceil(3.167) = 4
        const r = calculateBackerBoard({ areaM2: 12, productId: 'flexel-ecomax-6mm', wastePercent: 10 });
        expect(r.boardsNeeded).toBe(19);
        expect(r.packsNeeded).toBe(4);
    });

    it('TC4: HardieBacker 12mm, 4m², 5% waste → 5 boards', () => {
        // areaWithWaste = 4 × 1.05 = 4.2
        // boards = ceil(4.2 / 0.96) = ceil(4.375) = 5
        const r = calculateBackerBoard({ areaM2: 4, productId: 'hardiebacker-12mm', wastePercent: 5 });
        expect(r.boardsNeeded).toBe(5);
    });

    it('default wastePercent = 10 when omitted', () => {
        const explicit = calculateBackerBoard({ areaM2: 12, productId: 'hardiebacker-6mm', wastePercent: 10 });
        const defaulted = calculateBackerBoard({ areaM2: 12, productId: 'hardiebacker-6mm' });
        expect(defaulted.boardsNeeded).toBe(explicit.boardsNeeded);
    });

    it('Flexel warnings include "Do NOT mechanically fix"', () => {
        const r = calculateBackerBoard({ areaM2: 5, productId: 'flexel-ecomax-6mm' });
        expect(r.warnings.length).toBeGreaterThan(0);
        expect(r.warnings[0].toLowerCase()).toContain('fix');
    });
});

describe('calculateBackerBoard — validation', () => {
    const base: BackerBoardInput = { areaM2: 10, productId: 'hardiebacker-6mm' };

    it('throws for unknown productId', () => {
        expect(() => calculateBackerBoard({ ...base, productId: 'does-not-exist' })).toThrow();
    });

    it('throws for zero area', () => {
        expect(() => calculateBackerBoard({ ...base, areaM2: 0 })).toThrow();
    });

    it('throws for negative area', () => {
        expect(() => calculateBackerBoard({ ...base, areaM2: -1 })).toThrow();
    });
});
