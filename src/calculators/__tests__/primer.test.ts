import { describe, it, expect } from 'vitest';
import { calculatePrimer } from '../primer';
import type { PrimerInput } from '../types';

// Products in PRIMER_PRODUCTS (src/data/tiling-products.ts):
//   mapei-primer-g:               coverageM2PerKg=5,  no diluted rate, primaryPackSize=5kg
//   dunlop-multi-purpose-primer:  coverageM2PerKg=10, diluted=20, primaryPackSize=1kg
//   dunlop-universal-bonding-agent: coverageM2PerKg=12, diluted=3, primaryPackSize=5kg

describe('calculatePrimer — spec test cases', () => {

    it('TC1: Mapei Primer G, 5m², 1 coat → 1kg needed, 1×5kg pack', () => {
        // kgNeeded = (5 / 5) × 1 = 1; packs = ceil(1/5) = 1
        const r = calculatePrimer({ areaM2: 5, productId: 'mapei-primer-g' });
        expect(r.kgNeeded).toBeCloseTo(1, 5);
        expect(r.packsNeeded).toBe(1);
        expect(r.coverageRateUsed).toBe(5);
        expect(r.productName).toBe('Primer G');
        expect(r.materials).toHaveLength(1);
        expect(r.materials[0].unit).toBe('kg');
    });

    it('TC2: Mapei Primer G, 25m², 1 coat → 5kg needed, 1×5kg pack (exact)', () => {
        // kgNeeded = (25 / 5) × 1 = 5; packs = ceil(5/5) = 1
        const r = calculatePrimer({ areaM2: 25, productId: 'mapei-primer-g' });
        expect(r.kgNeeded).toBeCloseTo(5, 5);
        expect(r.packsNeeded).toBe(1);
    });

    it('TC3: Mapei Primer G, 30m², 1 coat → 6kg needed, 2×5kg packs', () => {
        // kgNeeded = (30 / 5) × 1 = 6; packs = ceil(6/5) = 2
        const r = calculatePrimer({ areaM2: 30, productId: 'mapei-primer-g' });
        expect(r.kgNeeded).toBeCloseTo(6, 5);
        expect(r.packsNeeded).toBe(2);
    });

    it('TC4: Dunlop Multi-Purpose Primer, 20m², neat → 2kg, 2×1kg packs', () => {
        // kgNeeded = (20 / 10) × 1 = 2; packs = ceil(2/1) = 2
        const r = calculatePrimer({ areaM2: 20, productId: 'dunlop-multi-purpose-primer' });
        expect(r.kgNeeded).toBeCloseTo(2, 5);
        expect(r.packsNeeded).toBe(2);
        expect(r.coverageRateUsed).toBe(10);
        expect(r.productName).toBe('Multi-Purpose Primer');
    });

    it('TC5: Dunlop Multi-Purpose Primer, 20m², diluted → 1kg, 1 pack', () => {
        // dilutedCoverageM2PerKg=20; kgNeeded = (20 / 20) = 1; packs = 1
        const r = calculatePrimer({ areaM2: 20, productId: 'dunlop-multi-purpose-primer', diluted: true });
        expect(r.kgNeeded).toBeCloseTo(1, 5);
        expect(r.packsNeeded).toBe(1);
        expect(r.coverageRateUsed).toBe(20);
    });

    it('TC6: 2 coats doubles consumption', () => {
        const r1 = calculatePrimer({ areaM2: 10, productId: 'mapei-primer-g', coats: 1 });
        const r2 = calculatePrimer({ areaM2: 10, productId: 'mapei-primer-g', coats: 2 });
        expect(r2.kgNeeded).toBeCloseTo(r1.kgNeeded * 2, 5);
    });

    it('TC7: default coats=1 gives same result as explicit coats=1', () => {
        const rDefault  = calculatePrimer({ areaM2: 10, productId: 'mapei-primer-g' });
        const rExplicit = calculatePrimer({ areaM2: 10, productId: 'mapei-primer-g', coats: 1 });
        expect(rDefault.kgNeeded).toBeCloseTo(rExplicit.kgNeeded, 5);
    });

    it('TC8: materials[0].material contains brand', () => {
        const r = calculatePrimer({ areaM2: 10, productId: 'mapei-primer-g' });
        expect(r.materials[0].material).toContain('Mapei');
    });

    it('TC9: Dunlop Universal Bonding Agent, 12m² neat → 1kg, 1×5kg pack', () => {
        // kgNeeded = (12 / 12) × 1 = 1; packs = ceil(1/5) = 1
        const r = calculatePrimer({ areaM2: 12, productId: 'dunlop-universal-bonding-agent' });
        expect(r.kgNeeded).toBeCloseTo(1, 5);
        expect(r.packsNeeded).toBe(1);
        expect(r.coverageRateUsed).toBe(12);
    });

    it('TC10: Dunlop Universal Bonding Agent, diluted (slurry) → 3 m²/kg rate', () => {
        // dilutedCoverageM2PerKg=3; kgNeeded = (12 / 3) = 4; packs = ceil(4/5) = 1
        const r = calculatePrimer({ areaM2: 12, productId: 'dunlop-universal-bonding-agent', diluted: true });
        expect(r.coverageRateUsed).toBe(3);
        expect(r.kgNeeded).toBeCloseTo(4, 5);
        expect(r.packsNeeded).toBe(1);
    });
});

describe('calculatePrimer — validation', () => {
    const base: PrimerInput = { areaM2: 10, productId: 'mapei-primer-g' };

    it('throws for unknown productId', () => {
        expect(() => calculatePrimer({ ...base, productId: 'does-not-exist' })).toThrow();
    });

    it('throws for zero area', () => {
        expect(() => calculatePrimer({ ...base, areaM2: 0 })).toThrow('Area must be greater than zero.');
    });

    it('throws for negative area', () => {
        expect(() => calculatePrimer({ ...base, areaM2: -5 })).toThrow();
    });

    it('throws for zero coats', () => {
        expect(() => calculatePrimer({ ...base, coats: 0 })).toThrow('Number of coats must be greater than zero.');
    });
});
