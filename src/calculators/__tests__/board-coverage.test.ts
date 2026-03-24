/**
 * @file src/calculators/__tests__/board-coverage.test.ts
 *
 * TDD test suite for the board coverage calculator.
 * Presets are common 2D sizes — product type and thickness are irrelevant.
 */

import { describe, it, expect } from 'vitest';
import { calculateBoardCoverage } from '../board-coverage';
import { BOARD_PRESETS, getPresetById, getBoardDimensions } from '../board-presets';

// ---------------------------------------------------------------------------
// Preset mode
// ---------------------------------------------------------------------------

describe('calculateBoardCoverage — preset mode', () => {
    it('TC1: 10 m², 2400×1200 (2.88 m²/board), 10% waste → 4 boards', () => {
        // grossArea = 11, ceil(11 / 2.88) = 4
        const result = calculateBoardCoverage({
            areaM2: 10,
            presetId: '2400-1200',
            wastagePercent: 10,
        });
        expect(result.boardsNeeded).toBe(4);
        expect(result.coveragePerBoardM2).toBeCloseTo(2.88, 6);
    });

    it('TC2: 24 m², 2400×1200, 10% waste → 10 boards', () => {
        // grossArea = 26.4, ceil(26.4 / 2.88) = 10
        const result = calculateBoardCoverage({
            areaM2: 24,
            presetId: '2400-1200',
            wastagePercent: 10,
        });
        expect(result.boardsNeeded).toBe(10);
    });

    it('TC3: 10 m², 1200×600 (0.72 m²/board), 5% waste → 15 boards', () => {
        // grossArea = 10.5, ceil(10.5 / 0.72) = ceil(14.58) = 15
        const result = calculateBoardCoverage({
            areaM2: 10,
            presetId: '1200-600',
            wastagePercent: 5,
        });
        expect(result.boardsNeeded).toBe(15);
        expect(result.coveragePerBoardM2).toBeCloseTo(0.72, 6);
    });

    it('TC4: 24 m², 2440×600 (1.464 m²/sheet), 5% waste → 18 sheets', () => {
        // grossArea = 25.2, ceil(25.2 / 1.464) = 18
        const result = calculateBoardCoverage({
            areaM2: 24,
            presetId: '2440-600',
            wastagePercent: 5,
        });
        expect(result.boardsNeeded).toBe(18);
    });

    it('TC5: zero area → 0 boards (no throw)', () => {
        const result = calculateBoardCoverage({
            areaM2: 0,
            presetId: '2400-1200',
        });
        expect(result.boardsNeeded).toBe(0);
    });

    it('TC6: invalid preset ID → throws descriptive error', () => {
        expect(() =>
            calculateBoardCoverage({ areaM2: 10, presetId: 'bad-id' }),
        ).toThrow('Unknown board preset: bad-id');
    });
});

// ---------------------------------------------------------------------------
// Custom mode
// ---------------------------------------------------------------------------

describe('calculateBoardCoverage — custom mode', () => {
    it('TC7: 10 m², custom 2400×1200mm, 10% waste → 4 boards', () => {
        const result = calculateBoardCoverage({
            areaM2: 10,
            customLengthMm: 2400,
            customWidthMm: 1200,
            wastagePercent: 10,
        });
        expect(result.boardsNeeded).toBe(4);
    });

    it('TC8: 10 m², custom 1000×500mm (0.5 m²/board), 0% waste → 20 boards', () => {
        const result = calculateBoardCoverage({
            areaM2: 10,
            customLengthMm: 1000,
            customWidthMm: 500,
            wastagePercent: 0,
        });
        expect(result.boardsNeeded).toBe(20);
    });

    it('TC9: customLabel present → boardLabel matches', () => {
        const result = calculateBoardCoverage({
            areaM2: 5,
            customLengthMm: 1000,
            customWidthMm: 500,
            customLabel: 'My Board',
        });
        expect(result.boardLabel).toBe('My Board');
    });

    it('TC10: no customLabel → auto-generated label', () => {
        const result = calculateBoardCoverage({
            areaM2: 5,
            customLengthMm: 1000,
            customWidthMm: 500,
        });
        expect(result.boardLabel).toBe('Custom 1000×500mm');
    });
});

// ---------------------------------------------------------------------------
// Result shape
// ---------------------------------------------------------------------------

describe('calculateBoardCoverage — result shape', () => {
    it('TC11: materials array has correct material, quantity, and unit', () => {
        const result = calculateBoardCoverage({
            areaM2: 10,
            presetId: '2400-1200',
            wastagePercent: 10,
        });
        expect(result.materials).toHaveLength(1);
        const mat = result.materials[0];
        expect(mat.material).toBe(result.boardLabel);
        expect(mat.quantity).toBe(result.boardsNeeded);
        expect(mat.unit).toBe('boards');
    });

    it('TC12: grossAreaM2 includes waste; netAreaM2 is original area', () => {
        const result = calculateBoardCoverage({
            areaM2: 10,
            presetId: '2400-1200',
            wastagePercent: 10,
        });
        expect(result.netAreaM2).toBe(10);
        expect(result.grossAreaM2).toBeCloseTo(11, 6);
    });
});

// ---------------------------------------------------------------------------
// Presets module invariants
// ---------------------------------------------------------------------------

describe('board-presets module', () => {
    it('TC13: getPresetById returns correct preset', () => {
        const preset = getPresetById('2400-1200');
        expect(preset).toBeDefined();
        expect(preset!.lengthMm).toBe(2400);
        expect(preset!.widthMm).toBe(1200);
    });

    it('TC14: getPresetById returns undefined for unknown ID', () => {
        expect(getPresetById('does-not-exist')).toBeUndefined();
    });

    it('TC15: every preset coverageM2 equals lengthMm × widthMm / 1_000_000', () => {
        for (const preset of BOARD_PRESETS) {
            const expected = preset.lengthMm * preset.widthMm / 1_000_000;
            expect(preset.coverageM2).toBeCloseTo(expected, 6);
        }
    });

    it('TC16: all preset IDs are unique', () => {
        const ids = BOARD_PRESETS.map((p) => p.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('TC17: getBoardDimensions resolves preset and custom correctly', () => {
        const fromPreset = getBoardDimensions({ areaM2: 0, presetId: '2440-1220' });
        expect(fromPreset.lengthMm).toBe(2440);
        expect(fromPreset.coverageM2).toBeCloseTo(2.9768, 4);

        const fromCustom = getBoardDimensions({ areaM2: 0, customLengthMm: 900, customWidthMm: 600 });
        expect(fromCustom.coverageM2).toBeCloseTo(0.54, 4);
        expect(fromCustom.label).toBe('Custom 900×600mm');
    });
});
