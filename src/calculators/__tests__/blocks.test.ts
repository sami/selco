import { describe, it, expect } from 'vitest';
import { calculateBlocks } from '../blocks';

describe('calculateBlocks()', () => {
    // TC1 — 100mm aerated block, 10 m², 5% wastage
    it('TC1: aerated 100mm, 10 m², 5% → 105 blocks', () => {
        const r = calculateBlocks({ areaM2: 10, productId: 'thermalite-shield-100', wastagePercent: 5 });
        expect(r.blocksNeeded).toBe(105);
    });

    // TC2 — 140mm dense block, 24 m², 5% wastage
    it('TC2: dense 140mm, 24 m², 5% → 252 blocks', () => {
        const r = calculateBlocks({ areaM2: 24, productId: 'dense-concrete-block-140', wastagePercent: 5 });
        expect(r.blocksNeeded).toBe(252);
    });

    // TC3 — Zero area
    it('TC3: zero area → 0 blocks', () => {
        const r = calculateBlocks({ areaM2: 0, productId: 'thermalite-shield-100' });
        expect(r.blocksNeeded).toBe(0);
    });

    // TC4 — Product-ID lookup: valid and invalid
    it('TC4a: valid productId returns correct blocksPerM2', () => {
        const r = calculateBlocks({ areaM2: 1, productId: 'thermalite-shield-100', wastagePercent: 0 });
        expect(r.blocksPerM2).toBe(10);
    });
    it('TC4b: invalid productId throws descriptive error', () => {
        expect(() =>
            calculateBlocks({ areaM2: 10, productId: 'unknown-block' })
        ).toThrow('Unknown block product ID: "unknown-block"');
    });

    // TC5 — Coverage derivation check: (440+10)×(215+10)=101,250 mm² → ceil(9.877)=10/m²
    it('TC5: catalogue blocksPerM2=10 matches (440+10)×(215+10) mm² geometry', () => {
        const faceAreaMm2 = (440 + 10) * (215 + 10); // 450 × 225 = 101,250 mm²
        const theoreticalPerM2 = 1_000_000 / faceAreaMm2; // ≈ 9.877
        const r = calculateBlocks({ areaM2: 1, productId: 'thermalite-shield-100', wastagePercent: 0 });
        expect(r.blocksPerM2).toBe(Math.ceil(theoreticalPerM2));
    });

    // TC6 — Returns MaterialQuantity[] with correct shape
    it('TC6: materials array contains blocks entry with correct fields', () => {
        const r = calculateBlocks({ areaM2: 10, productId: 'thermalite-shield-100', wastagePercent: 5 });
        expect(r.materials).toHaveLength(1);
        const m = r.materials[0];
        expect(m.unit).toBe('blocks');
        expect(m.quantity).toBe(105);
        expect(typeof m.material).toBe('string');
    });
});
