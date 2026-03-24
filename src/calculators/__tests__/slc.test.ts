import { describe, it, expect } from 'vitest';
import { calculateSLC } from '../slc';
import type { SLCInput } from '../types';

// Formula: volumeLitres = areaM2 × depthMm  (1 m² × 1 mm = 1 litre — exact)
//          kgNeeded     = volumeLitres × 1.5
//          bagsNeeded   = ceil(kgNeeded / bagSizeKg)
//          coverageAtDepthM2PerBag = bagSizeKg / (1.5 × depthMm)
//
// Default bag size: 25 kg (Mapei Ultraplan / Dunlop Level IT standard bag)

describe('calculateSLC — spec test cases', () => {

    it('TC1: 10m² at 10mm depth, 25kg bags → 100L, 150kg, 6 bags', () => {
        // volume = 10 × 10 = 100 L; kg = 100 × 1.5 = 150; bags = ceil(150/25) = 6
        const r = calculateSLC({ areaM2: 10, depthMm: 10 });
        expect(r.volumeLitres).toBeCloseTo(100, 5);
        expect(r.kgNeeded).toBeCloseTo(150, 5);
        expect(r.bagsNeeded).toBe(6);
    });

    it('TC2: 20m² at 5mm depth, 25kg bags → 100L, 150kg, 6 bags', () => {
        // volume = 20 × 5 = 100 L; kg = 150; bags = 6 — same result as TC1
        const r = calculateSLC({ areaM2: 20, depthMm: 5 });
        expect(r.volumeLitres).toBeCloseTo(100, 5);
        expect(r.kgNeeded).toBeCloseTo(150, 5);
        expect(r.bagsNeeded).toBe(6);
    });

    it('TC3: 5m² at 3mm depth, 20kg bags → 15L, 22.5kg, 2 bags', () => {
        // volume = 5 × 3 = 15 L; kg = 15 × 1.5 = 22.5; bags = ceil(22.5/20) = 2
        const r = calculateSLC({ areaM2: 5, depthMm: 3, bagSizeKg: 20 });
        expect(r.volumeLitres).toBeCloseTo(15, 5);
        expect(r.kgNeeded).toBeCloseTo(22.5, 5);
        expect(r.bagsNeeded).toBe(2);
    });

    it('TC4: exact bag (40m² at 1mm, 60kg bags) → 60kg, 1 bag', () => {
        // volume = 40 × 1 = 40 L; kg = 40 × 1.5 = 60; bags = ceil(60/60) = 1
        const r = calculateSLC({ areaM2: 40, depthMm: 1, bagSizeKg: 60 });
        expect(r.kgNeeded).toBeCloseTo(60, 5);
        expect(r.bagsNeeded).toBe(1);
    });

    it('TC5: coverageAtDepthM2PerBag = bagSizeKg / (1.5 × depthMm)', () => {
        // 25kg bag at 10mm: 25 / (1.5 × 10) = 1.6667 m²/bag
        const r = calculateSLC({ areaM2: 10, depthMm: 10 });
        expect(r.coverageAtDepthM2PerBag).toBeCloseTo(1.6667, 3);
    });

    it('TC6: coverageAtDepthM2PerBag scales with depth', () => {
        // 25kg bag at 5mm: 25 / (1.5 × 5) = 3.333 m²/bag (twice TC5)
        const r = calculateSLC({ areaM2: 10, depthMm: 5 });
        expect(r.coverageAtDepthM2PerBag).toBeCloseTo(3.333, 2);
    });

    it('TC7: default bagSizeKg is 25', () => {
        const r = calculateSLC({ areaM2: 10, depthMm: 10 });
        // If bagSize were not 25, bagsNeeded would differ
        expect(r.bagsNeeded).toBe(6);   // confirms 25kg default used: ceil(150/25)=6
    });

    it('TC8: custom bagSize=20 gives more bags than default 25', () => {
        const defaultBags = calculateSLC({ areaM2: 10, depthMm: 10 }).bagsNeeded;
        const smallBags   = calculateSLC({ areaM2: 10, depthMm: 10, bagSizeKg: 20 }).bagsNeeded;
        expect(smallBags).toBeGreaterThan(defaultBags);   // ceil(150/20)=8 > 6
        expect(smallBags).toBe(8);
    });
});

describe('calculateSLC — validation', () => {
    const base: SLCInput = { areaM2: 10, depthMm: 5 };

    it('throws for zero area', () => {
        expect(() => calculateSLC({ ...base, areaM2: 0 })).toThrow('Area must be greater than zero.');
    });

    it('throws for negative area', () => {
        expect(() => calculateSLC({ ...base, areaM2: -1 })).toThrow();
    });

    it('throws for zero depth', () => {
        expect(() => calculateSLC({ ...base, depthMm: 0 })).toThrow('Depth must be greater than zero.');
    });

    it('throws for negative depth', () => {
        expect(() => calculateSLC({ ...base, depthMm: -3 })).toThrow();
    });

    it('throws for zero bag size', () => {
        expect(() => calculateSLC({ ...base, bagSizeKg: 0 })).toThrow('Bag size must be greater than zero.');
    });
});
