import { describe, it, expect } from 'vitest';
import { calculateCavityTray } from '../cavity-trays';

describe('calculateCavityTray()', () => {
    // TC1 — standard tray, quantity=1
    it('TC1: quantity=1, manthorpe-type-e → traysNeeded=1', () => {
        const r = calculateCavityTray({ productId: 'manthorpe-type-e', quantity: 1 });
        expect(r.traysNeeded).toBe(1);
    });

    // TC2 — quantity=3
    it('TC2: quantity=3 → traysNeeded=3', () => {
        const r = calculateCavityTray({ productId: 'manthorpe-type-e', quantity: 3 });
        expect(r.traysNeeded).toBe(3);
    });

    // TC3 — unknown productId throws
    it('TC3: unknown productId → throws descriptive error', () => {
        expect(() =>
            calculateCavityTray({ productId: 'unknown-tray', quantity: 1 })
        ).toThrow('Unknown cavity tray product ID: "unknown-tray"');
    });

    // TC4 — materials shape
    it('TC4: materials has 1 entry, unit=each, quantity=traysNeeded', () => {
        const r = calculateCavityTray({ productId: 'manthorpe-type-e', quantity: 2 });
        expect(r.materials).toHaveLength(1);
        expect(r.materials[0].unit).toBe('each');
        expect(r.materials[0].quantity).toBe(2);
    });
});
