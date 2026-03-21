import { describe, it, expect } from 'vitest';
import { calculateSand } from '../sand';

describe('calculateSand()', () => {
    // TC1 — 35 kg bags, 110 kg needed → 4 bags
    it('TC1: 110 kg, 35 kg bags → 4 packs', () => {
        const r = calculateSand({ sandKg: 110, productId: 'building-sand-35kg' });
        expect(r.bagsNeeded).toBe(4);
        expect(r.packSizeKg).toBe(35);
    });

    // TC2 — 875 kg jumbo bag, 110 kg needed → 1 bag
    it('TC2: 110 kg, 875 kg jumbo → 1 pack', () => {
        const r = calculateSand({ sandKg: 110, productId: 'building-sand-875kg' });
        expect(r.bagsNeeded).toBe(1);
        expect(r.packSizeKg).toBe(875);
    });

    // TC3 — product-ID lookup: invalid ID throws
    it('TC3: unknown productId throws descriptive error', () => {
        expect(() =>
            calculateSand({ sandKg: 110, productId: 'unknown-sand' })
        ).toThrow('Unknown sand product ID: "unknown-sand"');
    });

    // TC4 — MaterialQuantity shape
    it('TC4: materials array has correct shape', () => {
        const r = calculateSand({ sandKg: 110, productId: 'building-sand-35kg' });
        expect(r.materials).toHaveLength(1);
        const m = r.materials[0];
        expect(m.unit).toBe('kg');
        expect(m.quantity).toBe(110);
        expect(m.packSize).toBe(35);
        expect(m.packsNeeded).toBe(4);
    });
});
