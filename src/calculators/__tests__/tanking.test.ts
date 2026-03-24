import { describe, it, expect } from 'vitest';
import { calculateTanking } from '../tanking';
import type { TankingInput } from '../types';

// Formula: kitsNeeded = ceil(areaM2 / product.coverageM2PerKit)
// Mapei Mapegum WPS: coverageM2PerKit = 4
// Dunlop Shower Kit:  coverageM2PerKit = 3.5

describe('calculateTanking — spec test cases', () => {

    it('TC1: Mapei Mapegum WPS, 8m² → 2 kits', () => {
        // ceil(8 / 4) = 2
        const r = calculateTanking({ areaM2: 8, productId: 'mapei-mapegum-wps' });
        expect(r.kitsNeeded).toBe(2);
        expect(r.coveragePerKit).toBe(4);
        expect(r.productName).toBe('Mapegum WPS Kit');
        expect(r.materials).toHaveLength(1);
    });

    it('TC2: Mapei Mapegum WPS, 4m² (exact) → 1 kit', () => {
        // ceil(4 / 4) = 1
        const r = calculateTanking({ areaM2: 4, productId: 'mapei-mapegum-wps' });
        expect(r.kitsNeeded).toBe(1);
    });

    it('TC3: Mapei Mapegum WPS, 5m² → 2 kits (rounds up)', () => {
        // ceil(5 / 4) = ceil(1.25) = 2
        const r = calculateTanking({ areaM2: 5, productId: 'mapei-mapegum-wps' });
        expect(r.kitsNeeded).toBe(2);
    });

    it('TC4: Dunlop Shower Waterproofing Kit, 7m² → 2 kits', () => {
        // ceil(7 / 3.5) = 2
        const r = calculateTanking({ areaM2: 7, productId: 'dunlop-shower-waterproofing-kit' });
        expect(r.kitsNeeded).toBe(2);
        expect(r.coveragePerKit).toBe(3.5);
        expect(r.productName).toBe('Shower Waterproofing Kit');
    });

    it('TC5: Dunlop, 3.5m² (exact) → 1 kit', () => {
        // ceil(3.5 / 3.5) = 1
        const r = calculateTanking({ areaM2: 3.5, productId: 'dunlop-shower-waterproofing-kit' });
        expect(r.kitsNeeded).toBe(1);
    });

    it('TC6: notes propagated from product', () => {
        const r = calculateTanking({ areaM2: 4, productId: 'mapei-mapegum-wps' });
        expect(r.notes.length).toBeGreaterThan(0);
        expect(r.notes[0]).toContain('coat');
    });

    it('TC7: materials array has correct unit and brand', () => {
        const r = calculateTanking({ areaM2: 4, productId: 'mapei-mapegum-wps' });
        expect(r.materials[0].unit).toBe('kits');
        expect(r.materials[0].material).toContain('Mapei');
    });
});

describe('calculateTanking — validation', () => {
    const base: TankingInput = { areaM2: 10, productId: 'mapei-mapegum-wps' };

    it('throws for unknown productId', () => {
        expect(() => calculateTanking({ ...base, productId: 'does-not-exist' })).toThrow();
    });

    it('throws for zero area', () => {
        expect(() => calculateTanking({ ...base, areaM2: 0 })).toThrow('Area must be greater than zero.');
    });

    it('throws for negative area', () => {
        expect(() => calculateTanking({ ...base, areaM2: -5 })).toThrow();
    });
});
