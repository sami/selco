import { describe, it, expect } from 'vitest';
import { calculateAdhesive, calculateAdhesiveByBedDepth } from '../adhesive';
import type { AdhesiveBedDepthInput } from '../types';

// ---------------------------------------------------------------------------
// calculateAdhesive — product-ID lookup + context-aware coverage rates
// ---------------------------------------------------------------------------

describe('calculateAdhesive — spec test cases', () => {

    it('TC1: Adesilex P9, 12m², 300×300mm, wall-dry → 30kg, 2×20kg bags', () => {
        // wall context + tile ≤ 300mm → wall-dry rate: 2.5 kg/m²
        // kg = 12 × 2.5 = 30, bags = ceil(30/20) = 2
        const r = calculateAdhesive({
            areaM2: 12, tileLengthMm: 300, tileWidthMm: 300,
            productId: 'mapei-adesilex-p9', applicationContext: 'wall-dry',
        });
        expect(r.adhesiveKg).toBeCloseTo(30);
        expect(r.bagsNeeded).toBe(2);
        expect(r.coverageRateUsed).toBe(2.5);
        expect(r.productName).toBe('Adesilex P9');
        expect(r.warnings).toHaveLength(0);
        expect(r.materials).toHaveLength(1);
    });

    it('TC2: Adesilex P9, 12m², 600×600mm, floor-wet → 48kg, 3 bags', () => {
        // large tile (600 > 300) + floor-wet → floor-wet rate: 4 kg/m²
        // kg = 12 × 4 = 48, bags = ceil(48/20) = 3
        const r = calculateAdhesive({
            areaM2: 12, tileLengthMm: 600, tileWidthMm: 600,
            productId: 'mapei-adesilex-p9', applicationContext: 'floor-wet',
        });
        expect(r.adhesiveKg).toBeCloseTo(48);
        expect(r.bagsNeeded).toBe(3);
        expect(r.coverageRateUsed).toBe(4);
        expect(r.warnings).toHaveLength(0);
    });

    it('TC3: CX-24, 20m², 300×300mm, floor-dry → 70kg, 4 bags', () => {
        // floor context → floor-dry rate: 3.5 kg/m²
        // kg = 20 × 3.5 = 70, bags = ceil(70/20) = 4
        const r = calculateAdhesive({
            areaM2: 20, tileLengthMm: 300, tileWidthMm: 300,
            productId: 'dunlop-cx24', applicationContext: 'floor-dry',
        });
        expect(r.adhesiveKg).toBeCloseTo(70);
        expect(r.bagsNeeded).toBe(4);
        expect(r.coverageRateUsed).toBe(3.5);
    });

    it('TC4: Keraflex Maxi S1, 10m², bedDepthMm=6 → 72kg, 4 bags', () => {
        // bed-depth method: perMmBedDepthKg (1.2) × 6mm = 7.2 kg/m²
        // kg = 10 × 7.2 = 72, bags = ceil(72/20) = 4
        const r = calculateAdhesive({
            areaM2: 10, tileLengthMm: 300, tileWidthMm: 300,
            productId: 'mapei-keraflex-maxi-s1', applicationContext: 'floor-dry',
            bedDepthMm: 6,
        });
        expect(r.adhesiveKg).toBeCloseTo(72);
        expect(r.bagsNeeded).toBe(4);
        expect(r.coverageRateUsed).toBeCloseTo(7.2);
    });

    it('TC5: RX-3000 on floor → "wall" warning, still computes (30kg, 2×15kg bags)', () => {
        // 'walls-only' restriction + floor context → warning
        // floor-dry rate = 3 kg/m², kg = 10 × 3 = 30, bags = ceil(30/15) = 2
        const r = calculateAdhesive({
            areaM2: 10, tileLengthMm: 300, tileWidthMm: 300,
            productId: 'dunlop-rx3000', applicationContext: 'floor-dry',
        });
        expect(r.warnings.length).toBeGreaterThan(0);
        expect(r.warnings[0].toLowerCase()).toContain('wall');
        expect(r.adhesiveKg).toBeCloseTo(30);
        expect(r.bagsNeeded).toBe(2);
    });

    it('TC6: Fast Set Plus, 450×450mm tile → max-tile warning (mentions "330")', () => {
        // maxTileMm=330, tile=450 → warning; floor-dry rate = 4 kg/m²
        // kg = 10 × 4 = 40, bags = ceil(40/20) = 2
        const r = calculateAdhesive({
            areaM2: 10, tileLengthMm: 450, tileWidthMm: 450,
            productId: 'mapei-fast-set-plus', applicationContext: 'floor-dry',
        });
        expect(r.warnings.length).toBeGreaterThan(0);
        expect(r.warnings.some(w => w.includes('330'))).toBe(true);
        expect(r.adhesiveKg).toBeCloseTo(40);
        expect(r.bagsNeeded).toBe(2);
    });

    it('TC7: Ultralite D2 on floor → "wall" warning', () => {
        // 'internal-walls-only' restriction + floor context → warning
        // floor-dry rate = 1.56 kg/m², kg = 10 × 1.56 = 15.6, bags = ceil(15.6/12.5) = 2
        const r = calculateAdhesive({
            areaM2: 10, tileLengthMm: 200, tileWidthMm: 200,
            productId: 'mapei-ultralite-d2', applicationContext: 'floor-dry',
        });
        expect(r.warnings.length).toBeGreaterThan(0);
        expect(r.warnings[0].toLowerCase()).toContain('wall');
        expect(r.adhesiveKg).toBeCloseTo(15.6, 0);
        expect(r.bagsNeeded).toBe(2);
    });

    it('throws for unknown productId', () => {
        expect(() => calculateAdhesive({
            areaM2: 10, tileLengthMm: 300, tileWidthMm: 300,
            productId: 'does-not-exist', applicationContext: 'wall-dry',
        })).toThrow();
    });
});

// ---------------------------------------------------------------------------
// calculateAdhesiveByBedDepth — unchanged function; keep coverage
// ---------------------------------------------------------------------------

describe('calculateAdhesiveByBedDepth', () => {
    it('scales linearly at 6mm (double the 3mm base)', () => {
        const r = calculateAdhesiveByBedDepth({
            areaM2: 10, bedDepthMm: 6, baseCoverageKgPerM2: 2, bagSizeKg: 20, wastage: 10,
        });
        expect(r.scaledCoverageKgPerM2).toBeCloseTo(4, 5);
        expect(r.kgNeeded).toBeCloseTo(40, 5);
        expect(r.kgWithWastage).toBeCloseTo(44, 5);
        expect(r.bagsNeeded).toBe(3);
    });

    it('returns base coverage unchanged at 3mm bed depth', () => {
        const r = calculateAdhesiveByBedDepth({
            areaM2: 10, bedDepthMm: 3, baseCoverageKgPerM2: 2, bagSizeKg: 20, wastage: 0,
        });
        expect(r.scaledCoverageKgPerM2).toBeCloseTo(2, 5);
        expect(r.kgNeeded).toBeCloseTo(20, 5);
        expect(r.kgWithWastage).toBeCloseTo(20, 5);
        expect(r.bagsNeeded).toBe(1);
    });

    it('throws for zero bed depth', () => {
        const input: AdhesiveBedDepthInput = {
            areaM2: 10, bedDepthMm: 0, baseCoverageKgPerM2: 2, bagSizeKg: 20, wastage: 10,
        };
        expect(() => calculateAdhesiveByBedDepth(input)).toThrow('Bed depth must be greater than zero.');
    });

    it('throws for negative wastage', () => {
        const input: AdhesiveBedDepthInput = {
            areaM2: 10, bedDepthMm: 6, baseCoverageKgPerM2: 2, bagSizeKg: 20, wastage: -5,
        };
        expect(() => calculateAdhesiveByBedDepth(input)).toThrow('Wastage must be between 0 and 100.');
    });
});
