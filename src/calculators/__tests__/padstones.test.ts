import { describe, it, expect } from 'vitest';
import { calculatePadstone } from '../padstones';

describe('calculatePadstone()', () => {
    // TC1 — standard padstone, quantity=2
    it('TC1: quantity=2, supreme-padstone-215x140x102 → padstonesNeeded=2', () => {
        const r = calculatePadstone({ productId: 'supreme-padstone-215x140x102', quantity: 2 });
        expect(r.padstonesNeeded).toBe(2);
    });

    // TC2 — unknown productId throws
    it('TC2: unknown productId → throws descriptive error', () => {
        expect(() =>
            calculatePadstone({ productId: 'unknown-padstone', quantity: 1 })
        ).toThrow('Unknown padstone product ID: "unknown-padstone"');
    });

    // TC3 — materials shape
    it('TC3: materials has 1 entry, unit=each, quantity matches input', () => {
        const r = calculatePadstone({ productId: 'supreme-padstone-215x140x102', quantity: 4 });
        expect(r.materials).toHaveLength(1);
        expect(r.materials[0].unit).toBe('each');
        expect(r.materials[0].quantity).toBe(4);
    });
});
