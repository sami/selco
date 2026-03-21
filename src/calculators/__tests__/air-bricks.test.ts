import { describe, it, expect } from 'vitest';
import { calculateAirBricks } from '../air-bricks';

describe('calculateAirBricks()', () => {
    // TC1 — 10m wall → ceil(10000 / 450) = ceil(22.22) = 23
    it('TC1: 10m wall → 23 air bricks', () => {
        const r = calculateAirBricks({ wallLengthM: 10 });
        expect(r.airBricksNeeded).toBe(23);
    });

    // TC2 — 4.5m wall → ceil(4500 / 450) = ceil(10.0) = 10 (exact)
    it('TC2: 4.5m wall → 10 air bricks', () => {
        const r = calculateAirBricks({ wallLengthM: 4.5 });
        expect(r.airBricksNeeded).toBe(10);
    });

    // TC3 — zero length → 0
    it('TC3: zero wall length → 0 air bricks', () => {
        const r = calculateAirBricks({ wallLengthM: 0 });
        expect(r.airBricksNeeded).toBe(0);
    });

    // TC4 — MaterialQuantity shape
    it('TC4: materials has 1 entry with correct shape', () => {
        const r = calculateAirBricks({ wallLengthM: 10 });
        expect(r.materials).toHaveLength(1);
        const m = r.materials[0];
        expect(m.unit).toBe('each');
        expect(m.quantity).toBe(23);
    });
});
