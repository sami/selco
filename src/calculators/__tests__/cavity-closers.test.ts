import { describe, it, expect } from 'vitest';
import { calculateCavityCloser } from '../cavity-closers';

describe('calculateCavityCloser()', () => {
    // TC1 — 1200×1200 opening: perimeter=4.8m, closer=2.44m → ceil(4.8/2.44)=2
    it('TC1: 1200×1200 opening, multicor-closer-50-100 → closersNeeded=2', () => {
        const r = calculateCavityCloser({ openingWidthMm: 1200, openingHeightMm: 1200, productId: 'multicor-closer-50-100' });
        expect(r.closersNeeded).toBe(2);
        expect(r.perimeterM).toBeCloseTo(4.8, 2);
    });

    // TC2 — unknown productId throws
    it('TC2: unknown productId → throws descriptive error', () => {
        expect(() =>
            calculateCavityCloser({ openingWidthMm: 1200, openingHeightMm: 1200, productId: 'unknown-closer' })
        ).toThrow('Unknown cavity closer product ID: "unknown-closer"');
    });

    // TC3 — materials shape
    it('TC3: materials has 1 entry, unit=each, quantity=closersNeeded', () => {
        const r = calculateCavityCloser({ openingWidthMm: 1200, openingHeightMm: 1200, productId: 'multicor-closer-50-100' });
        expect(r.materials).toHaveLength(1);
        expect(r.materials[0].unit).toBe('each');
        expect(r.materials[0].quantity).toBe(r.closersNeeded);
    });
});
