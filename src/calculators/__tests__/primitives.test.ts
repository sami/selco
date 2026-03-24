/**
 * @file src/calculators/__tests__/primitives.test.ts
 *
 * Tests for the shared calculator primitives.
 * Written before implementation (TDD red → green).
 */

import { describe, it, expect } from 'vitest';
import {
    roundUp,
    ceilToWhole,
    applyWaste,
    packsNeeded,
    areaMSquared,
    volumeMCubed,
    mmToM,
    mToMm,
} from '../primitives';

// ---------------------------------------------------------------------------
// roundUp — ceiling to a given number of decimal places
// ---------------------------------------------------------------------------

describe('roundUp', () => {
    it('rounds up to 2 decimal places by default', () => {
        expect(roundUp(1.234)).toBe(1.24);
    });

    it('returns the same value when already exact at that precision', () => {
        expect(roundUp(1.23)).toBe(1.23);
        expect(roundUp(1.20)).toBe(1.20);
    });

    it('rounds up to 1 decimal place', () => {
        expect(roundUp(1.23, 1)).toBe(1.3);
        expect(roundUp(1.20, 1)).toBe(1.2);
    });

    it('rounds up to 0 decimal places (whole number ceiling)', () => {
        expect(roundUp(1.1, 0)).toBe(2);
        expect(roundUp(3.0, 0)).toBe(3);
    });

    it('handles zero', () => {
        expect(roundUp(0)).toBe(0);
        expect(roundUp(0, 0)).toBe(0);
    });

    it('leaves whole numbers unchanged', () => {
        expect(roundUp(5, 2)).toBe(5);
        expect(roundUp(10, 2)).toBe(10);
    });

    it('handles values that are already at max precision', () => {
        expect(roundUp(2.50, 2)).toBe(2.50);
    });
});

// ---------------------------------------------------------------------------
// ceilToWhole — ceiling to nearest integer
// ---------------------------------------------------------------------------

describe('ceilToWhole', () => {
    it('rounds fractional values up to next whole number', () => {
        expect(ceilToWhole(1.1)).toBe(2);
        expect(ceilToWhole(1.9)).toBe(2);
        expect(ceilToWhole(0.001)).toBe(1);
    });

    it('leaves whole numbers unchanged', () => {
        expect(ceilToWhole(3)).toBe(3);
        expect(ceilToWhole(10)).toBe(10);
    });

    it('handles zero', () => {
        expect(ceilToWhole(0)).toBe(0);
    });

    it('handles values just under a whole number', () => {
        expect(ceilToWhole(2.9999)).toBe(3);
    });
});

// ---------------------------------------------------------------------------
// applyWaste — multiply quantity by (1 + waste/100)
// ---------------------------------------------------------------------------

describe('applyWaste', () => {
    it('adds 10% waste to a quantity', () => {
        expect(applyWaste(100, 10)).toBe(110);
    });

    it('adds 15% waste', () => {
        expect(applyWaste(200, 15)).toBe(230);
    });

    it('applies zero waste (returns quantity unchanged)', () => {
        expect(applyWaste(100, 0)).toBe(100);
        expect(applyWaste(75, 0)).toBe(75);
    });

    it('handles fractional results', () => {
        // 80 × 1.10 = 88
        expect(applyWaste(80, 10)).toBeCloseTo(88, 5);
    });

    it('handles 100% waste (doubles the quantity)', () => {
        expect(applyWaste(50, 100)).toBe(100);
    });
});

// ---------------------------------------------------------------------------
// packsNeeded — ceiling division of quantity by pack size
// ---------------------------------------------------------------------------

describe('packsNeeded', () => {
    it('returns exact count when evenly divisible', () => {
        expect(packsNeeded(9, 3)).toBe(3);
        expect(packsNeeded(100, 10)).toBe(10);
    });

    it('rounds up when not evenly divisible', () => {
        expect(packsNeeded(10, 3)).toBe(4);   // ceil(10/3) = 4
        expect(packsNeeded(7, 4)).toBe(2);    // ceil(7/4)  = 2
        expect(packsNeeded(1, 5)).toBe(1);    // ceil(1/5)  = 1
    });

    it('returns 0 when quantity is 0', () => {
        expect(packsNeeded(0, 3)).toBe(0);
    });

    it('works with pack size of 1', () => {
        expect(packsNeeded(7, 1)).toBe(7);
    });

    it('works with large numbers', () => {
        expect(packsNeeded(1000, 250)).toBe(4);
        expect(packsNeeded(1001, 250)).toBe(5);
    });
});

// ---------------------------------------------------------------------------
// areaMSquared — length × width in metres
// ---------------------------------------------------------------------------

describe('areaMSquared', () => {
    it('multiplies length by width', () => {
        expect(areaMSquared(4, 3)).toBe(12);
        expect(areaMSquared(10, 10)).toBe(100);
    });

    it('handles fractional dimensions', () => {
        expect(areaMSquared(1.5, 2)).toBeCloseTo(3, 5);
        expect(areaMSquared(2.5, 4)).toBeCloseTo(10, 5);
    });

    it('returns 0 when either dimension is 0', () => {
        expect(areaMSquared(0, 5)).toBe(0);
        expect(areaMSquared(5, 0)).toBe(0);
    });

    it('handles non-integer square areas', () => {
        expect(areaMSquared(3.2, 2.5)).toBeCloseTo(8, 5);
    });
});

// ---------------------------------------------------------------------------
// volumeMCubed — area in m × depth in mm → volume in m³
// ---------------------------------------------------------------------------

describe('volumeMCubed', () => {
    it('computes volume converting depth from mm to m', () => {
        // 4m × 3m × 100mm = 4 × 3 × 0.1 = 1.2 m³
        expect(volumeMCubed(4, 3, 100)).toBeCloseTo(1.2, 5);
    });

    it('handles shallow depths', () => {
        // 2m × 2m × 50mm = 4 × 0.05 = 0.2 m³
        expect(volumeMCubed(2, 2, 50)).toBeCloseTo(0.2, 5);
    });

    it('returns 0 when depth is 0', () => {
        expect(volumeMCubed(10, 10, 0)).toBe(0);
    });

    it('handles a typical floor screed scenario', () => {
        // 25m² at 75mm depth → 25 × 0.075 = 1.875 m³
        expect(volumeMCubed(5, 5, 75)).toBeCloseTo(1.875, 5);
    });
});

// ---------------------------------------------------------------------------
// mmToM — millimetres → metres
// ---------------------------------------------------------------------------

describe('mmToM', () => {
    it('converts 1000 mm to 1 m', () => {
        expect(mmToM(1000)).toBe(1);
    });

    it('converts 100 mm to 0.1 m', () => {
        expect(mmToM(100)).toBeCloseTo(0.1, 5);
    });

    it('converts 1 mm to 0.001 m', () => {
        expect(mmToM(1)).toBeCloseTo(0.001, 5);
    });

    it('converts 0 mm to 0 m', () => {
        expect(mmToM(0)).toBe(0);
    });

    it('converts common tile dimensions', () => {
        expect(mmToM(300)).toBeCloseTo(0.3, 5);   // 300mm tile → 0.3m
        expect(mmToM(600)).toBeCloseTo(0.6, 5);   // 600mm tile → 0.6m
    });
});

// ---------------------------------------------------------------------------
// mToMm — metres → millimetres
// ---------------------------------------------------------------------------

describe('mToMm', () => {
    it('converts 1 m to 1000 mm', () => {
        expect(mToMm(1)).toBe(1000);
    });

    it('converts 0.1 m to 100 mm', () => {
        expect(mToMm(0.1)).toBeCloseTo(100, 5);
    });

    it('converts 2.5 m to 2500 mm', () => {
        expect(mToMm(2.5)).toBeCloseTo(2500, 5);
    });

    it('converts 0 m to 0 mm', () => {
        expect(mToMm(0)).toBe(0);
    });

    it('is the inverse of mmToM', () => {
        const original = 450;
        expect(mToMm(mmToM(original))).toBeCloseTo(original, 5);
    });
});
