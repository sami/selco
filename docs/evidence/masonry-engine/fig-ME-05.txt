import { describe, it, expect } from 'vitest';
import { calculateLintel } from '../lintels';

describe('calculateLintel()', () => {
    // TC1 — concrete lintel: 1200mm opening + 150mm bearing each side → 1500mm
    it('TC1: 1200mm opening, concrete lintel-100 → lintelLengthMm=1500', () => {
        const r = calculateLintel({ openingWidthMm: 1200, productId: 'supreme-concrete-lintel-100' });
        expect(r.lintelLengthMm).toBe(1500);
    });

    // TC2 — steel lintel: IG L1/S75 cavity, same 1200mm → 1500mm (cut to order)
    it('TC2: 1200mm opening, IG L1/S75 steel cavity → lintelLengthMm=1500', () => {
        const r = calculateLintel({ openingWidthMm: 1200, productId: 'ig-l1-s75-cavity' });
        expect(r.lintelLengthMm).toBe(1500);
    });

    // TC3 — unknown productId throws
    it('TC3: unknown productId → throws descriptive error', () => {
        expect(() =>
            calculateLintel({ openingWidthMm: 1200, productId: 'unknown-lintel' })
        ).toThrow('Unknown lintel product ID: "unknown-lintel"');
    });

    // TC4 — materials shape
    it('TC4: materials has 1 entry, unit=each, quantity=1', () => {
        const r = calculateLintel({ openingWidthMm: 1200, productId: 'supreme-concrete-lintel-100' });
        expect(r.materials).toHaveLength(1);
        expect(r.materials[0].unit).toBe('each');
        expect(r.materials[0].quantity).toBe(1);
    });
});
