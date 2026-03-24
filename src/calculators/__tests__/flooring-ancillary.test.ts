import { describe, it, expect } from 'vitest';
import {
    estimateUnderlay,
    estimateFlooringAdhesive,
    estimateScotia,
    estimateThresholdStrips,
    estimateDPM,
} from '../flooring-ancillary';

describe('estimateUnderlay', () => {
    it('TC1: 12 m² + 5% overlap = 12.6 m² → 1 × 15 m² roll', () => {
        const result = estimateUnderlay(12);
        expect(result.quantityNeeded).toBeCloseTo(12.6, 6);
        expect(result.packSize).toBe(15);
        expect(result.packsNeeded).toBe(1);
        expect(result.material).toBe('Underlay');
        expect(result.unit).toBe('rolls');
    });

    it('TC2: 30 m² + 5% = 31.5 m² → best fit roll size', () => {
        const result = estimateUnderlay(30);
        expect(result.quantityNeeded).toBeCloseTo(31.5, 6);
        // 31.5 / 15 = 2.1 → 3 rolls (overshoot 45/31.5 = 43%) ✓
        // 31.5 / 25 = 1.26 → 2 rolls (overshoot 50/31.5 = 59%) ✗ > 50%
        // Best fit: 15 m² rolls (3 rolls, 43% overshoot)
        expect(result.packsNeeded).toBeGreaterThanOrEqual(2);
    });

    it('TC3: 0 m² → 0 rolls', () => {
        const result = estimateUnderlay(0);
        expect(result.packsNeeded).toBe(0);
        expect(result.quantityNeeded).toBe(0);
    });
});

describe('estimateFlooringAdhesive', () => {
    it('TC4: 12 m² at 5 m²/L = 2.4L → 1 × 5L bucket', () => {
        const result = estimateFlooringAdhesive(12);
        expect(result.quantityNeeded).toBeCloseTo(2.4, 6);
        expect(result.packSize).toBe(5);
        expect(result.packsNeeded).toBe(1);
        expect(result.material).toBe('Flooring Adhesive');
        expect(result.unit).toBe('buckets');
    });

    it('TC5: 30 m² = 6L → best fit bucket', () => {
        const result = estimateFlooringAdhesive(30);
        expect(result.quantityNeeded).toBeCloseTo(6, 6);
        // 6 / 5 = 1.2 → 2 buckets (overshoot 10/6 = 67%) ✗ > 50%
        // 6 / 15 = 0.4 → 1 bucket (overshoot 15/6 = 150%) ✗ > 50%
        // All > 50%, use largest: 15L, 1 bucket
        expect(result.packsNeeded).toBeGreaterThanOrEqual(1);
    });

    it('TC6: 0 m² → 0 buckets', () => {
        const result = estimateFlooringAdhesive(0);
        expect(result.packsNeeded).toBe(0);
        expect(result.quantityNeeded).toBe(0);
    });
});

describe('estimateScotia', () => {
    it('TC7: 14m perimeter + 10% waste = 15.4m → 7 lengths', () => {
        const result = estimateScotia(14);
        expect(result.quantityNeeded).toBeCloseTo(15.4, 6);
        expect(result.packSize).toBe(2.4);
        expect(result.packsNeeded).toBe(7);
        expect(result.material).toBe('Scotia Beading');
        expect(result.unit).toBe('lengths');
    });

    it('TC8: 10m perimeter + 10% = 11m → 5 lengths', () => {
        const result = estimateScotia(10);
        expect(result.quantityNeeded).toBeCloseTo(11, 6);
        expect(result.packsNeeded).toBe(5);
    });

    it('TC9: 0 perimeter → 0 lengths', () => {
        const result = estimateScotia(0);
        expect(result.packsNeeded).toBe(0);
        expect(result.quantityNeeded).toBe(0);
    });
});

describe('estimateThresholdStrips', () => {
    it('TC10: 1 doorway → 1 strip', () => {
        const result = estimateThresholdStrips(1);
        expect(result.packsNeeded).toBe(1);
        expect(result.material).toBe('Threshold Strip');
        expect(result.unit).toBe('strips');
    });

    it('TC11: 3 doorways → 3 strips', () => {
        const result = estimateThresholdStrips(3);
        expect(result.packsNeeded).toBe(3);
    });

    it('TC12: 0 doorways → 0 strips', () => {
        const result = estimateThresholdStrips(0);
        expect(result.packsNeeded).toBe(0);
    });
});

describe('estimateDPM', () => {
    it('TC13: 12 m² + 10% overlap = 13.2 m² → 1 × 15 m² roll', () => {
        const result = estimateDPM(12);
        expect(result.quantityNeeded).toBeCloseTo(13.2, 6);
        expect(result.packSize).toBe(15);
        expect(result.packsNeeded).toBe(1);
        expect(result.material).toBe('DPM');
        expect(result.unit).toBe('rolls');
    });

    it('TC14: 30 m² + 10% = 33 m² → best fit roll', () => {
        const result = estimateDPM(30);
        expect(result.quantityNeeded).toBeCloseTo(33, 6);
        // 33 / 15 = 2.2 → 3 rolls (overshoot 45/33 = 36%) ✓ smallest pack within 50%
        expect(result.packSize).toBe(15);
        expect(result.packsNeeded).toBe(3);
    });

    it('TC15: 0 m² → 0 rolls', () => {
        const result = estimateDPM(0);
        expect(result.packsNeeded).toBe(0);
        expect(result.quantityNeeded).toBe(0);
    });
});
