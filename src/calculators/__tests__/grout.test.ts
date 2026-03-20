import { describe, it, expect } from 'vitest';
import { calculateGrout } from '../grout';
import type { GroutInput } from '../types';

// Formula: kg/m² = (a + b) / (a × b) × s × d × ρ
// Where a=tileLengthMm, b=tileWidthMm, s=jointWidthMm, d=tileDepthMm, ρ=product.densityFactor
//
// Note: Spec cross-reference values (e.g. "0.3 kg/m²", "0.7 kg/m²") are rounded to 1dp.
// Actual formula values with ρ=1.6: TC1=0.32, TC2=0.672, TC3=0.384, TC4=1.28.
// TC5 with ρ=1.7: 0.1700 (exact match).
// TC4 bag count: spec says 2 bags, formula gives 3 (same arithmetic error pattern as tile calc).
// All expected values below are formula-derived.

describe('calculateGrout — spec test cases', () => {

    it('TC1: Ultracolor Plus, 300×300×10mm, 3mm joint, 12m² → 3.84kg, 1×5kg bag', () => {
        // kgPerM2 = (600/90000) × 3 × 10 × 1.6 = 0.32
        // groutKg = 12 × 0.32 = 3.84 → ceil(3.84/5) = 1 bag
        const r = calculateGrout({
            areaM2: 12, tileLengthMm: 300, tileWidthMm: 300,
            tileDepthMm: 10, jointWidthMm: 3,
            productId: 'mapei-ultracolor-plus',
        });
        expect(r.groutKg).toBeCloseTo(3.84, 2);
        expect(r.bagsNeeded).toBe(1);
        expect(r.coverageRateKgPerM2).toBeCloseTo(0.32, 2);
        expect(r.productName).toBe('Ultracolor Plus');
        expect(r.warnings).toHaveLength(0);
        expect(r.materials).toHaveLength(1);
    });

    it('TC2: Ultracolor Plus, 100×100×7mm, 3mm joint, 12m² → 8.064kg, 2×5kg bags', () => {
        // kgPerM2 = (200/10000) × 3 × 7 × 1.6 = 0.672
        // groutKg = 12 × 0.672 = 8.064 → ceil(8.064/5) = 2 bags
        const r = calculateGrout({
            areaM2: 12, tileLengthMm: 100, tileWidthMm: 100,
            tileDepthMm: 7, jointWidthMm: 3,
            productId: 'mapei-ultracolor-plus',
        });
        expect(r.groutKg).toBeCloseTo(8.064, 3);
        expect(r.bagsNeeded).toBe(2);
        expect(r.coverageRateKgPerM2).toBeCloseTo(0.672, 3);
    });

    it('TC3: Flexible Grout, 150×150×6mm, 3mm joint, 10m² → 3.84kg, 2×2.5kg bags', () => {
        // kgPerM2 = (300/22500) × 3 × 6 × 1.6 = 0.384
        // groutKg = 10 × 0.384 = 3.84 → ceil(3.84/2.5) = 2 bags
        const r = calculateGrout({
            areaM2: 10, tileLengthMm: 150, tileWidthMm: 150,
            tileDepthMm: 6, jointWidthMm: 3,
            productId: 'mapei-flexible-wall-floor-grout',
        });
        expect(r.groutKg).toBeCloseTo(3.84, 2);
        expect(r.bagsNeeded).toBe(2);
        expect(r.coverageRateKgPerM2).toBeCloseTo(0.384, 3);
    });

    it('TC4: Flexible Grout, 20×20×4mm mosaic, 2mm joint, 5m² → 6.4kg, 3×2.5kg bags', () => {
        // kgPerM2 = (40/400) × 2 × 4 × 1.6 = 1.28 (spec says 0.64 — arithmetic error)
        // groutKg = 5 × 1.28 = 6.4 → ceil(6.4/2.5) = 3 bags (spec says 2 — spec error)
        const r = calculateGrout({
            areaM2: 5, tileLengthMm: 20, tileWidthMm: 20,
            tileDepthMm: 4, jointWidthMm: 2,
            productId: 'mapei-flexible-wall-floor-grout',
        });
        expect(r.groutKg).toBeCloseTo(6.4, 1);
        expect(r.bagsNeeded).toBe(3);
        expect(r.coverageRateKgPerM2).toBeCloseTo(1.28, 2);
    });

    it('TC5: Dunlop GX-500, 600×600×10mm, 3mm joint, 20m² → 0.17 kg/m², 3.4kg, 1 bag', () => {
        // kgPerM2 = (1200/360000) × 3 × 10 × 1.7 = 0.17 (exact match to spec)
        // groutKg = 20 × 0.17 = 3.4 → ceil(3.4/3.5) = 1 bag
        const r = calculateGrout({
            areaM2: 20, tileLengthMm: 600, tileWidthMm: 600,
            tileDepthMm: 10, jointWidthMm: 3,
            productId: 'dunlop-gx500',
        });
        expect(r.coverageRateKgPerM2).toBeCloseTo(0.17, 2);
        expect(r.groutKg).toBeCloseTo(3.4, 1);
        expect(r.bagsNeeded).toBe(1);
        expect(r.warnings).toHaveLength(0);
    });

    it('TC6: Flexible Grout, 8mm joint (max 6mm) → warning, still computes', () => {
        const r = calculateGrout({
            areaM2: 10, tileLengthMm: 300, tileWidthMm: 300,
            tileDepthMm: 10, jointWidthMm: 8,
            productId: 'mapei-flexible-wall-floor-grout',
        });
        expect(r.warnings.length).toBeGreaterThan(0);
        expect(r.warnings[0]).toMatch(/6/); // mentions the max joint width
        expect(r.groutKg).toBeGreaterThan(0); // still computes
    });

    it('TC7: zero area → throws', () => {
        expect(() => calculateGrout({
            areaM2: 0, tileLengthMm: 300, tileWidthMm: 300,
            tileDepthMm: 10, jointWidthMm: 3,
            productId: 'mapei-ultracolor-plus',
        })).toThrow();
    });

    it('TC8: Wall Tile Grout on floor context → walls-only warning', () => {
        const r = calculateGrout({
            areaM2: 10, tileLengthMm: 150, tileWidthMm: 150,
            tileDepthMm: 6, jointWidthMm: 3,
            productId: 'dunlop-wall-tile-grout',
            applicationContext: 'floor-dry',
        });
        expect(r.warnings.length).toBeGreaterThan(0);
        expect(r.warnings[0].toLowerCase()).toContain('wall');
    });
});

describe('calculateGrout — validation', () => {
    const base: GroutInput = {
        areaM2: 10, tileLengthMm: 300, tileWidthMm: 300,
        tileDepthMm: 10, jointWidthMm: 3,
        productId: 'mapei-ultracolor-plus',
    };

    it('throws for unknown productId', () => {
        expect(() => calculateGrout({ ...base, productId: 'does-not-exist' })).toThrow();
    });

    it('throws for zero tile dimensions', () => {
        expect(() => calculateGrout({ ...base, tileLengthMm: 0 })).toThrow();
    });

    it('throws for zero joint width', () => {
        expect(() => calculateGrout({ ...base, jointWidthMm: 0 })).toThrow();
    });

    it('GX-500 warns for joint below 2mm minimum', () => {
        const r = calculateGrout({ ...base, productId: 'dunlop-gx500', jointWidthMm: 1 });
        expect(r.warnings.length).toBeGreaterThan(0);
        expect(r.warnings[0]).toMatch(/2/); // mentions minimum joint
    });
});
