import { describe, it, expect } from 'vitest';
import { calculateCement } from '../cement';

describe('calculateCement()', () => {
    // TC1 — Rugby Premium OPC 25 kg
    it('TC1: 40 kg cement, Rugby Premium 25 kg → 2 bags', () => {
        const r = calculateCement({ cementKg: 40, productId: 'rugby-premium-opc-25' });
        expect(r.bagsNeeded).toBe(2);
        expect(r.bagSizeKg).toBe(25);
    });

    // TC2 — Carlton Mortar Mix 20 kg pre-mixed
    it('TC2: 40 kg cement, Carlton 20 kg → 2 bags', () => {
        const r = calculateCement({ cementKg: 40, productId: 'carlton-mortar-mix-20' });
        expect(r.bagsNeeded).toBe(2);
        expect(r.bagSizeKg).toBe(20);
    });

    // TC3 — Jetcem 6 kg pre-mixed
    it('TC3: 6 kg cement, Jetcem 6 kg → 1 bag', () => {
        const r = calculateCement({ cementKg: 6, productId: 'jetcem-premix-6' });
        expect(r.bagsNeeded).toBe(1);
        expect(r.bagSizeKg).toBe(6);
    });

    // TC4 — product-ID lookup: invalid ID throws
    it('TC4: unknown productId throws descriptive error', () => {
        expect(() =>
            calculateCement({ cementKg: 25, productId: 'unknown-cement' })
        ).toThrow('Unknown cement product ID: "unknown-cement"');
    });

    // TC5 — MaterialQuantity shape
    it('TC5: materials array has correct shape', () => {
        const r = calculateCement({ cementKg: 40, productId: 'rugby-premium-opc-25' });
        expect(r.materials).toHaveLength(1);
        const m = r.materials[0];
        expect(m.unit).toBe('kg');
        expect(m.quantity).toBe(40);
        expect(m.packSize).toBe(25);
        expect(m.packsNeeded).toBe(2);
    });
});
