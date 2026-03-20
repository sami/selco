import { describe, it, expect } from 'vitest';
import { calculateTiles } from '../tiles';
import type { TileInput } from '../types';

// Formula: effectiveArea = (tileLengthMm + gapWidthMm) × (tileWidthMm + gapWidthMm) mm²
//          tilesPerM2 = 1,000,000 / effectiveArea
//          tilesNeeded = Math.ceil(roomArea × tilesPerM2 × (1 + wastePercent/100))
//
// Note: Spec test-case descriptions contain arithmetic errors (e.g. "10.09 tiles/m²"
// for 300mm+3mm gap). Correct value from formula: 1,000,000/(303×303) = 10.891 tiles/m².
// Expected values below are derived from the formula, not from the spec prose.

describe('calculateTiles — spec test cases', () => {

    it('TC1: 3×4m, 300×300mm, 3mm gap, straight, pack=9 → 144 tiles, 16 packs', () => {
        // effective = 303×303 = 91809 mm², tilesPerM2 = 10.891
        // 12m² × 10.891 × 1.10 = 143.77 → 144
        const result = calculateTiles({
            roomLengthM: 3, roomWidthM: 4,
            tileLengthMm: 300, tileWidthMm: 300,
            gapWidthMm: 3, layingPattern: 'straight', packSize: 9,
        });
        expect(result.tilesNeeded).toBe(144);
        expect(result.packsNeeded).toBe(16);
        expect(result.totalAreaM2).toBeCloseTo(12);
        expect(result.tilesPerM2).toBeCloseTo(10.89, 1);
        expect(result.wastePercent).toBe(10);
        expect(result.materials).toHaveLength(1);
    });

    it('TC2: 5×4m, 600×600mm, 3mm gap, straight → 61 tiles', () => {
        // effective = 603×603 = 363609 mm², tilesPerM2 = 2.750
        // 20m² × 2.750 × 1.10 = 60.50 → 61
        const result = calculateTiles({
            roomLengthM: 5, roomWidthM: 4,
            tileLengthMm: 600, tileWidthMm: 600,
            gapWidthMm: 3, layingPattern: 'straight', packSize: 1,
        });
        expect(result.tilesNeeded).toBe(61);
    });

    it('TC3: 2×2m, 100×100mm, 2mm gap, straight → 423 tiles', () => {
        // effective = 102×102 = 10404 mm², tilesPerM2 = 96.12
        // 4m² × 96.12 × 1.10 = 422.93 → 423
        const result = calculateTiles({
            roomLengthM: 2, roomWidthM: 2,
            tileLengthMm: 100, tileWidthMm: 100,
            gapWidthMm: 2, layingPattern: 'straight', packSize: 1,
        });
        expect(result.tilesNeeded).toBe(423);
    });

    it('TC4: 3×3m, 300×300mm, 3mm gap, diagonal (15% waste) → 113 tiles', () => {
        // 9m² × 10.891 × 1.15 = 112.73 → 113
        const result = calculateTiles({
            roomLengthM: 3, roomWidthM: 3,
            tileLengthMm: 300, tileWidthMm: 300,
            gapWidthMm: 3, layingPattern: 'diagonal', packSize: 1,
        });
        expect(result.tilesNeeded).toBe(113);
        expect(result.wastePercent).toBe(15);
    });

    it('TC5: 2×2m, 300×300mm, 0mm gap, straight → 49 tiles', () => {
        // effective = 300×300 = 90000 mm², tilesPerM2 = 11.111
        // 4m² × 11.111 × 1.10 = 48.89 → 49
        const result = calculateTiles({
            roomLengthM: 2, roomWidthM: 2,
            tileLengthMm: 300, tileWidthMm: 300,
            gapWidthMm: 0, layingPattern: 'straight', packSize: 1,
        });
        expect(result.tilesNeeded).toBe(49);
    });

    it('TC6: areaM2=15, 300×300mm, 3mm gap, straight → 180 tiles', () => {
        // 15m² × 10.891 × 1.10 = 179.71 → 180
        const result = calculateTiles({
            roomLengthM: 0, roomWidthM: 0, areaM2: 15,
            tileLengthMm: 300, tileWidthMm: 300,
            gapWidthMm: 3, layingPattern: 'straight', packSize: 1,
        });
        expect(result.tilesNeeded).toBe(180);
        expect(result.totalAreaM2).toBe(15);
    });

    it('TC7: TC1 repeated but packSize=25 → 6 packs', () => {
        // 144 tiles / 25 = 5.76 → ceil = 6
        const result = calculateTiles({
            roomLengthM: 3, roomWidthM: 4,
            tileLengthMm: 300, tileWidthMm: 300,
            gapWidthMm: 3, layingPattern: 'straight', packSize: 25,
        });
        expect(result.tilesNeeded).toBe(144);
        expect(result.packsNeeded).toBe(6);
    });
});

describe('calculateTiles — validation', () => {
    const base: TileInput = {
        roomLengthM: 3, roomWidthM: 3, tileLengthMm: 300, tileWidthMm: 300,
        gapWidthMm: 3, layingPattern: 'straight', packSize: 1,
    };

    it('throws for zero tile length', () => {
        expect(() => calculateTiles({ ...base, tileLengthMm: 0 })).toThrow();
    });

    it('throws for zero room dimensions (no override)', () => {
        expect(() => calculateTiles({ ...base, roomLengthM: 0, roomWidthM: 0 })).toThrow();
    });

    it('throws for zero areaM2 override', () => {
        expect(() => calculateTiles({ ...base, areaM2: 0 })).toThrow();
    });

    it('brick-bond uses 12% waste', () => {
        const r = calculateTiles({ ...base, layingPattern: 'brick-bond' });
        expect(r.wastePercent).toBe(12);
    });

    it('herringbone uses 15% waste', () => {
        const r = calculateTiles({ ...base, layingPattern: 'herringbone' });
        expect(r.wastePercent).toBe(15);
    });
});
