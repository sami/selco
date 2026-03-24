/**
 * @file src/calculators/board-coverage.test.ts
 *
 * Legacy-style tests for calculateBoardCoverage, adapted to the presets-based
 * API. Uses custom mode to replicate the original scenarios.
 *
 * Comprehensive TDD tests (TC1–TC17) live in __tests__/board-coverage.test.ts.
 */

import { describe, it, expect } from 'vitest';
import { calculateBoardCoverage } from './board-coverage';
import { BOARD_PRESETS } from './board-presets';

// ---------------------------------------------------------------------------
// calculateBoardCoverage — custom mode scenarios
// ---------------------------------------------------------------------------

describe('calculateBoardCoverage', () => {
    it('calculates boards needed with 10% wastage (standard plywood)', () => {
        const result = calculateBoardCoverage({
            areaM2: 10,
            customLengthMm: 2440,
            customWidthMm: 1220,
            wastagePercent: 10,
        });
        expect(result.coveragePerBoardM2).toBeCloseTo(2.9768, 4);
        expect(result.boardsNeeded).toBe(4);
    });

    it('calculates boards with zero wastage', () => {
        const result = calculateBoardCoverage({
            areaM2: 5,
            customLengthMm: 2400,
            customWidthMm: 1200,
            wastagePercent: 0,
        });
        expect(result.coveragePerBoardM2).toBeCloseTo(2.88, 4);
        expect(result.boardsNeeded).toBe(2);
    });

    it('returns exactly the right count when area is an exact multiple of board area', () => {
        const result = calculateBoardCoverage({
            areaM2: 7.5,
            customLengthMm: 2500,
            customWidthMm: 1000,
            wastagePercent: 0,
        });
        expect(result.boardsNeeded).toBe(3);
    });

    it('boardsNeeded × coveragePerBoardM2 ≥ grossAreaM2', () => {
        const result = calculateBoardCoverage({
            areaM2: 20,
            customLengthMm: 2440,
            customWidthMm: 1220,
            wastagePercent: 5,
        });
        expect(result.boardsNeeded * result.coveragePerBoardM2).toBeGreaterThanOrEqual(result.grossAreaM2);
    });

    it('handles small boards (flooring boards)', () => {
        const result = calculateBoardCoverage({
            areaM2: 15,
            customLengthMm: 2400,
            customWidthMm: 600,
            wastagePercent: 10,
        });
        expect(result.coveragePerBoardM2).toBeCloseTo(1.44, 4);
        expect(result.boardsNeeded).toBe(12);
    });

    it('handles large wastage percentage', () => {
        const result = calculateBoardCoverage({
            areaM2: 10,
            customLengthMm: 2400,
            customWidthMm: 1200,
            wastagePercent: 20,
        });
        expect(result.boardsNeeded).toBe(5);
    });

    it('returns 0 boards for zero area', () => {
        const result = calculateBoardCoverage({
            areaM2: 0,
            customLengthMm: 2400,
            customWidthMm: 1200,
            wastagePercent: 10,
        });
        expect(result.boardsNeeded).toBe(0);
    });

    it('throws for negative area', () => {
        expect(() =>
            calculateBoardCoverage({
                areaM2: -1,
                customLengthMm: 2400,
                customWidthMm: 1200,
            }),
        ).toThrow('Area must be non-negative.');
    });
});

// ---------------------------------------------------------------------------
// BOARD_PRESETS — shape validation
// ---------------------------------------------------------------------------

describe('BOARD_PRESETS', () => {
    it('exports an array of board presets', () => {
        expect(BOARD_PRESETS).toBeInstanceOf(Array);
        expect(BOARD_PRESETS.length).toBeGreaterThanOrEqual(4);
    });

    it('each preset has id, label, description, lengthMm, widthMm, coverageM2', () => {
        for (const preset of BOARD_PRESETS) {
            expect(preset).toHaveProperty('id');
            expect(preset).toHaveProperty('label');
            expect(preset).toHaveProperty('description');
            expect(preset).toHaveProperty('lengthMm');
            expect(preset).toHaveProperty('widthMm');
            expect(preset).toHaveProperty('coverageM2');
            expect(preset.lengthMm).toBeGreaterThan(0);
            expect(preset.widthMm).toBeGreaterThan(0);
        }
    });

    it('includes the standard plasterboard size (2400 × 1200)', () => {
        const standard = BOARD_PRESETS.find((p) => p.lengthMm === 2400 && p.widthMm === 1200);
        expect(standard).toBeDefined();
    });
});
