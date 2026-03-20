import { describe, it, expect } from 'vitest';
import { calculateSpacers } from '../spacers';
import type { SpacersInput } from '../types';

// Formula: spacersNeeded = tilesNeeded × spacersPerTile
//          packsNeeded   = ceil(spacersNeeded / packSize)
// spacersPerTile: straight=3, brick-bond=3, diagonal=4, herringbone=4

describe('calculateSpacers — spec test cases', () => {

    it('TC1: 134 tiles, 3mm, straight, pack=250 → 402 spacers, 2 packs', () => {
        // 134 × 3 = 402 → ceil(402/250) = 2
        const r = calculateSpacers({
            tilesNeeded: 134, spacerSizeMm: 3,
            layingPattern: 'straight', packSize: 250,
        });
        expect(r.spacersNeeded).toBe(402);
        expect(r.packsNeeded).toBe(2);
        expect(r.spacersPerTile).toBe(3);
        expect(r.materials).toHaveLength(1);
    });

    it('TC2: 134 tiles, 2mm, straight, pack=1500 → 402 spacers, 1 pack', () => {
        // 134 × 3 = 402 → ceil(402/1500) = 1
        const r = calculateSpacers({
            tilesNeeded: 134, spacerSizeMm: 2,
            layingPattern: 'straight', packSize: 1500,
        });
        expect(r.spacersNeeded).toBe(402);
        expect(r.packsNeeded).toBe(1);
    });

    it('TC3: 50 tiles, 5mm, diagonal, pack=250 → 200 spacers, 1 pack', () => {
        // 50 × 4 = 200 → ceil(200/250) = 1
        const r = calculateSpacers({
            tilesNeeded: 50, spacerSizeMm: 5,
            layingPattern: 'diagonal', packSize: 250,
        });
        expect(r.spacersNeeded).toBe(200);
        expect(r.packsNeeded).toBe(1);
        expect(r.spacersPerTile).toBe(4);
    });

    it('TC4: zero tiles → throws', () => {
        expect(() => calculateSpacers({
            tilesNeeded: 0, spacerSizeMm: 3,
            layingPattern: 'straight', packSize: 250,
        })).toThrow();
    });
});

describe('calculateSpacers — validation + pattern coverage', () => {
    const base: SpacersInput = {
        tilesNeeded: 100, spacerSizeMm: 3,
        layingPattern: 'straight', packSize: 250,
    };

    it('brick-bond uses 3 spacers per tile', () => {
        const r = calculateSpacers({ ...base, layingPattern: 'brick-bond' });
        expect(r.spacersPerTile).toBe(3);
        expect(r.spacersNeeded).toBe(300);
    });

    it('herringbone uses 4 spacers per tile', () => {
        const r = calculateSpacers({ ...base, layingPattern: 'herringbone' });
        expect(r.spacersPerTile).toBe(4);
        expect(r.spacersNeeded).toBe(400);
    });

    it('throws for zero pack size', () => {
        expect(() => calculateSpacers({ ...base, packSize: 0 })).toThrow();
    });

    it('materials array has 1 entry with correct spacer size label', () => {
        const r = calculateSpacers(base);
        expect(r.materials[0].material).toContain('3 mm');
    });
});
