import { describe, it, expect } from 'vitest';
import { calculateWallTies } from '../wall-ties';

describe('calculateWallTies()', () => {
    // TC1 — 24 m² wall, 75mm cavity → 60 ties, 225mm tie
    it('TC1: 24 m² wall, 75mm cavity → 60 ties, 225mm tie', () => {
        const r = calculateWallTies({ areaM2: 24, cavityWidthMm: 75 });
        expect(r.tiesNeeded).toBe(60);
        expect(r.tieLengthMm).toBe(225);
    });

    // TC2 — 10 m² wall, 50mm cavity → 25 ties, 200mm tie
    it('TC2: 10 m² wall, 50mm cavity → 25 ties, 200mm tie', () => {
        const r = calculateWallTies({ areaM2: 10, cavityWidthMm: 50 });
        expect(r.tiesNeeded).toBe(25);
        expect(r.tieLengthMm).toBe(200);
    });

    // TC3 — pack rounding (same 60 ties, different pack sizes)
    it('TC3: 60 ties, pack of 50 → 2 packs; pack of 250 → 1 pack', () => {
        const r50 = calculateWallTies({ areaM2: 24, cavityWidthMm: 75, packSize: 50 });
        expect(r50.packsNeeded).toBe(2);
        const r250 = calculateWallTies({ areaM2: 24, cavityWidthMm: 75, packSize: 250 });
        expect(r250.packsNeeded).toBe(1);
    });

    // TC4 — product-ID lookup by cavity width
    it('TC4: cavity 50mm → wall-tie-200-50-75; cavity 100mm → wall-tie-250-100-125', () => {
        const r50 = calculateWallTies({ areaM2: 10, cavityWidthMm: 50 });
        expect(r50.productId).toBe('wall-tie-200-50-75');
        const r100 = calculateWallTies({ areaM2: 10, cavityWidthMm: 100 });
        expect(r100.productId).toBe('wall-tie-250-100-125');
    });

    // TC5 — invalid cavity width
    it('TC5: cavity 200mm → throws descriptive error', () => {
        expect(() =>
            calculateWallTies({ areaM2: 10, cavityWidthMm: 200 })
        ).toThrow('No wall tie product found for cavity width 200mm');
    });

    // TC6 — MaterialQuantity shape
    it('TC6: materials has 1 entry with correct shape', () => {
        const r = calculateWallTies({ areaM2: 24, cavityWidthMm: 75 });
        expect(r.materials).toHaveLength(1);
        const m = r.materials[0];
        expect(m.unit).toBe('each');
        expect(m.quantity).toBe(60);
        expect(m.packSize).toBe(250);   // default pack (primaryPackSize)
        expect(m.packsNeeded).toBe(1);  // ceil(60/250) = 1
    });
});
