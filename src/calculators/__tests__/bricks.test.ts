import { describe, it, expect } from 'vitest';
import { calculateBricks } from '../bricks';

describe('calculateBricks()', () => {
    // TC1 — Standard 65mm brick, 10 m², 10% wastage
    it('TC1: 65mm brick, 10 m², 10% → 660 bricks, 2 packs', () => {
        const r = calculateBricks({ areaM2: 10, productId: 'lbc-london-brick-65', wastagePercent: 10 });
        expect(r.bricksNeeded).toBe(660);
        expect(r.packsNeeded).toBe(2);
    });

    // TC2 — 73mm brick, 10 m², 10% wastage
    it('TC2: 73mm brick, 10 m², 10% → 550 bricks', () => {
        const r = calculateBricks({ areaM2: 10, productId: 'wienerberger-piatraforte-73', wastagePercent: 10 });
        expect(r.bricksNeeded).toBe(550);
        expect(r.packsNeeded).toBe(2);
    });

    // TC3 — 68mm imperial, 10 m², 5% wastage
    it('TC3: 68mm brick, 10 m², 5% → 588 bricks', () => {
        const r = calculateBricks({ areaM2: 10, productId: 'ibstock-regent-68', wastagePercent: 5 });
        expect(r.bricksNeeded).toBe(588);
        expect(r.packsNeeded).toBe(2);
    });

    // TC4 — Zero area
    it('TC4: zero area → 0 bricks, 0 packs', () => {
        const r = calculateBricks({ areaM2: 0, productId: 'lbc-london-brick-65' });
        expect(r.bricksNeeded).toBe(0);
        expect(r.packsNeeded).toBe(0);
    });

    // TC5 — Product-ID lookup: bricksPerM2 returned correctly
    it('TC5: product lookup returns correct bricksPerM2', () => {
        const r = calculateBricks({ areaM2: 1, productId: 'lbc-london-brick-65', wastagePercent: 0 });
        expect(r.bricksPerM2).toBe(60);
    });

    // TC6 — Product-ID lookup: invalid ID throws descriptive error
    it('TC6: invalid productId throws descriptive error', () => {
        expect(() =>
            calculateBricks({ areaM2: 10, productId: 'unknown-brick' })
        ).toThrow('Unknown brick product ID: "unknown-brick"');
    });

    // TC7 — Large wall 50 m²: correct pack count (ceil division)
    it('TC7: 50 m², 10% → 3300 bricks, 9 packs', () => {
        const r = calculateBricks({ areaM2: 50, productId: 'lbc-london-brick-65', wastagePercent: 10 });
        expect(r.bricksNeeded).toBe(3300);
        expect(r.packsNeeded).toBe(9);
    });

    // TC8 — Bond pattern: flemish/english emit a mortar warning; count unchanged
    it('TC8: flemish bond emits mortar consumption warning, same brick count as stretcher', () => {
        const stretcher = calculateBricks({ areaM2: 10, productId: 'lbc-london-brick-65', wastagePercent: 10, bondPattern: 'stretcher' });
        const flemish   = calculateBricks({ areaM2: 10, productId: 'lbc-london-brick-65', wastagePercent: 10, bondPattern: 'flemish' });
        expect(flemish.bricksNeeded).toBe(stretcher.bricksNeeded);
        expect(flemish.warnings.some(w => /mortar/i.test(w))).toBe(true);
    });

    // TC9 — Returns MaterialQuantity[] with correct shape
    it('TC9: materials array contains bricks entry with correct fields', () => {
        const r = calculateBricks({ areaM2: 10, productId: 'lbc-london-brick-65', wastagePercent: 10 });
        expect(r.materials).toHaveLength(1);
        const m = r.materials[0];
        expect(m.unit).toBe('bricks');
        expect(m.quantity).toBe(660);
        expect(m.packSize).toBe(400);
        expect(m.packsNeeded).toBe(2);
        expect(typeof m.material).toBe('string');
    });
});
