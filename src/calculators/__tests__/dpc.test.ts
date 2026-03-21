import { describe, it, expect } from 'vitest';
import { calculateDPC, recommendDPCProductId } from '../dpc';

describe('calculateDPC()', () => {
    // TC1 — 20m wall, 112mm DPC → 1 roll (20 ≤ 30)
    it('TC1: 20m wall, 112mm DPC → 1 roll', () => {
        const r = calculateDPC({ wallLengthM: 20, productId: 'dpc-polythene-112mm-30m' });
        expect(r.rollsNeeded).toBe(1);
        expect(r.widthMm).toBe(112);
    });

    // TC2 — 35m wall → 2 rolls (35 > 30, ceil(35/30) = 2)
    it('TC2: 35m wall, 112mm DPC → 2 rolls', () => {
        const r = calculateDPC({ wallLengthM: 35, productId: 'dpc-polythene-112mm-30m' });
        expect(r.rollsNeeded).toBe(2);
    });

    // TC3 — width selection: 102.5mm brick leaf → 112mm is the next available width
    it('TC3: 102.5mm brick leaf → recommend dpc-polythene-112mm-30m', () => {
        const productId = recommendDPCProductId(102.5);
        expect(productId).toBe('dpc-polythene-112mm-30m');
    });

    // TC4 — MaterialQuantity shape
    it('TC4: materials has 1 entry with correct shape', () => {
        const r = calculateDPC({ wallLengthM: 20, productId: 'dpc-polythene-112mm-30m' });
        expect(r.materials).toHaveLength(1);
        const m = r.materials[0];
        expect(m.unit).toBe('m');
        expect(m.quantity).toBe(20);
        expect(m.packSize).toBe(30);
        expect(m.packsNeeded).toBe(1);
    });
});
