import { describe, it, expect } from 'vitest';
import {
    calculateWallArea,
    calculateBricks,
    calculateBlocks,
    calculateMortar,
    calculateWallTies,
    calculateLintels,
    calculateDPC,
    calculateMasonry,
    UNITS_PER_M2,
    MORTAR_PER_M2,
    WALL_TYPES,
} from './masonry';
import type { MasonryInput } from './types';

describe('calculateWallArea', () => {
    it('calculates area for a single wall', () => {
        const result = calculateWallArea(
            [{ length: 5, height: 2.4 }],
            []
        );
        expect(result).toEqual({ grossArea: 12, openingArea: 0, netArea: 12 });
    });

    it('subtracts openings from gross area', () => {
        const result = calculateWallArea(
            [{ length: 5, height: 2.4 }],
            [{ width: 1.2, height: 2.1 }]
        );
        expect(result.openingArea).toBeCloseTo(2.52);
        expect(result.netArea).toBeCloseTo(9.48);
    });

    it('handles multiple walls', () => {
        const result = calculateWallArea(
            [{ length: 5, height: 2.4 }, { length: 3, height: 2.4 }],
            []
        );
        expect(result.grossArea).toBeCloseTo(19.2);
    });

    it('handles zero openings', () => {
        const result = calculateWallArea(
            [{ length: 4, height: 2.4 }],
            []
        );
        expect(result.netArea).toBe(result.grossArea);
        expect(result.netArea).toBeCloseTo(9.6);
    });

    it('throws for empty walls array', () => {
        expect(() => calculateWallArea([], []))
            .toThrow('At least one wall section is required.');
    });

    it('throws for zero wall dimension', () => {
        expect(() => calculateWallArea([{ length: 0, height: 2.4 }], []))
            .toThrow('Wall dimensions must be greater than zero.');
    });

    it('throws for negative opening', () => {
        expect(() => calculateWallArea(
            [{ length: 5, height: 2.4 }],
            [{ width: -1, height: 2 }]
        )).toThrow('Opening dimensions must not be negative.');
    });

    it('clamps net area to zero', () => {
        const result = calculateWallArea(
            [{ length: 1, height: 1 }],
            [{ width: 2, height: 2 }]
        );
        expect(result.netArea).toBe(0);
    });
});

describe('calculateBricks', () => {
    it('half-brick = 60/m²', () => {
        expect(calculateBricks(10, 'half-brick', 0)).toBe(600);
    });

    it('one-brick = 120/m²', () => {
        expect(calculateBricks(10, 'one-brick', 0)).toBe(1200);
    });

    it('cavity outer leaf = 60/m²', () => {
        expect(calculateBricks(10, 'cavity', 0)).toBe(600);
    });

    it('applies waste', () => {
        // 600 * 1.05 = 630
        expect(calculateBricks(10, 'half-brick', 5)).toBe(630);
    });

    it('returns 0 for blockwork', () => {
        expect(calculateBricks(10, 'blockwork', 0)).toBe(0);
    });
});

describe('calculateBlocks', () => {
    it('10/m² for 100mm', () => {
        expect(calculateBlocks(10, 'blockwork', 100, 0)).toBe(100);
    });

    it('10/m² for 140mm', () => {
        expect(calculateBlocks(10, 'blockwork', 140, 0)).toBe(100);
    });

    it('10/m² for cavity inner leaf', () => {
        expect(calculateBlocks(10, 'cavity', 100, 0)).toBe(100);
    });

    it('applies waste', () => {
        // 100 * 1.05 = 105
        expect(calculateBlocks(10, 'blockwork', 100, 5)).toBe(105);
    });

    it('returns 0 for half-brick', () => {
        expect(calculateBlocks(10, 'half-brick', 100, 0)).toBe(0);
    });
});

describe('calculateMortar', () => {
    it('half-brick mortar volume', () => {
        // 10 * 0.024 = 0.24
        const result = calculateMortar(10, 'half-brick', '1:4', 0);
        expect(result.wetVolume).toBeCloseTo(0.24);
    });

    it('one-brick mortar volume', () => {
        // 10 * 0.048 = 0.48
        const result = calculateMortar(10, 'one-brick', '1:4', 0);
        expect(result.wetVolume).toBeCloseTo(0.48);
    });

    it('cavity = brick leaf + block leaf', () => {
        // 0.024 (brick) + 0.009 (block) = 0.033
        // 10 * 0.033 = 0.33
        const result = calculateMortar(10, 'cavity', '1:4', 0);
        expect(result.wetVolume).toBeCloseTo(0.33);
    });

    it('blockwork mortar volume', () => {
        // 10 * 0.009 = 0.09
        const result = calculateMortar(10, 'blockwork', '1:4', 0);
        expect(result.wetVolume).toBeCloseTo(0.09);
    });

    it('1:4 mix produces correct cement bags', () => {
        // wetVolume = 0.24
        // dryVolume = 0.24 * 1.33 = 0.3192
        // cement = 0.3192 / 5 * 1500 = 95.76 kg
        // bags = ceil(95.76 / 25) = 4
        const result = calculateMortar(10, 'half-brick', '1:4', 0);
        expect(result.cementBags).toBe(4);
    });

    it('1:4 mix produces correct sand tonnes', () => {
        // sand = 0.3192 * 4/5 * 1600 = 408.576 kg
        // tonnes = 0.408576 -> roughly 0.41
        // Note: Check rounding logic in implementation vs test expectation
        // Prompt says "roughly 0.41 tonnes", we'll check closeTo
        const result = calculateMortar(10, 'half-brick', '1:4', 0);
        expect(result.sandTonnes).toBeCloseTo(0.41, 1);
    });

    it('applies mortar waste', () => {
        // 0.24 * 1.10 = 0.264
        const result = calculateMortar(10, 'half-brick', '1:4', 10);
        expect(result.wetVolume).toBeCloseTo(0.264);
    });

    it('1:3 mix uses more cement than 1:6', () => {
        const r1 = calculateMortar(10, 'half-brick', '1:3', 0);
        const r2 = calculateMortar(10, 'half-brick', '1:6', 0);
        expect(r1.cementBags).toBeGreaterThan(r2.cementBags);
    });
});

describe('calculateWallTies', () => {
    it('general = 2.5/m²', () => {
        const result = calculateWallTies(10, []);
        // ceil(10 * 2.5) = 25
        expect(result.general).toBe(25);
        expect(result.atOpenings).toBe(0);
        expect(result.total).toBe(25);
    });

    it('extra ties at openings', () => {
        const result = calculateWallTies(10, [{ width: 1.2, height: 2.1 }]);
        // Perimeter = (1.2 + 2.1) * 2 = 6.6
        // Edges needing ties (verticals) = 2.1 * 2 = 4.2
        // Wait, prompt says: atOpenings=ceil(2×(1.2+2.1)/0.3)=ceil(22)=22
        // This suggests perimeter based calculation: perimeter / 300mm spacing
        // 2 * (1.2 + 2.1) = 6.6m = 6600mm
        // 6600 / 300 = 22 ties
        expect(result.atOpenings).toBe(22);
        // Total = 25 + 22 = 47
        expect(result.total).toBe(47);
    });
});

describe('calculateLintels', () => {
    it('length = width + 300mm', () => {
        const result = calculateLintels([{ width: 1.2, height: 2.1 }]);
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({ width: 1.2, lintelLength: 1500 });
    });

    it('handles multiple openings', () => {
        const result = calculateLintels([
            { width: 0.9, height: 1.2 },
            { width: 1.8, height: 2.1 },
        ]);
        expect(result).toHaveLength(2);
        // 1.8m = 1800mm + 300mm = 2100mm
        expect(result[1].lintelLength).toBe(2100);
    });
});

describe('calculateDPC', () => {
    it('calculates total length', () => {
        const result = calculateDPC(
            [{ length: 5, height: 2.4 }, { length: 3, height: 2.4 }],
            'half-brick'
        );
        expect(result.length).toBe(8);
    });

    it('half-brick width = 112.5mm', () => {
        const result = calculateDPC([{ length: 1, height: 1 }], 'half-brick');
        expect(result.widthMm).toBe(112.5);
    });

    it('cavity width = 225mm', () => {
        const result = calculateDPC([{ length: 1, height: 1 }], 'cavity');
        expect(result.widthMm).toBe(225);
    });
});

describe('calculateMasonry', () => {
    it('full calculation for half-brick wall', () => {
        const input: MasonryInput = {
            wallType: 'half-brick',
            walls: [{ length: 6, height: 2.4 }],
            openings: [{ width: 1.2, height: 2.1 }],
            blockWidth: 100,
            mixRatio: '1:4',
            unitWaste: 5,
            mortarWaste: 10,
            cavityWidth: 0,
        };

        const result = calculateMasonry(input);
        // Gross: 6*2.4 = 14.4
        // Opening: 1.2*2.1 = 2.52
        // Net: 11.88
        expect(result.area.netArea).toBeCloseTo(11.88);
        expect(result.bricks).toBeGreaterThan(0);
        expect(result.blocks).toBe(0);
        expect(result.wallTies.total).toBe(0);
    });

    it('full calculation for cavity wall', () => {
        const input: MasonryInput = {
            wallType: 'cavity',
            walls: [{ length: 6, height: 2.4 }],
            openings: [{ width: 1.2, height: 2.1 }],
            blockWidth: 100,
            mixRatio: '1:4',
            unitWaste: 5,
            mortarWaste: 10,
            cavityWidth: 50,
        };

        const result = calculateMasonry(input);
        expect(result.bricks).toBeGreaterThan(0);
        expect(result.blocks).toBeGreaterThan(0);
        expect(result.wallTies.total).toBeGreaterThan(0);
    });

    it('throws for invalid waste', () => {
        const input: MasonryInput = {
            wallType: 'half-brick',
            walls: [{ length: 1, height: 1 }],
            openings: [],
            blockWidth: 100,
            mixRatio: '1:4',
            unitWaste: -5,
            mortarWaste: 10,
            cavityWidth: 0,
        };
        expect(() => calculateMasonry(input)).toThrow('Unit waste must be between 0 and 100.');
    });

    it('throws for waste over 100', () => {
        const input: MasonryInput = {
            wallType: 'half-brick',
            walls: [{ length: 1, height: 1 }],
            openings: [],
            blockWidth: 100,
            mixRatio: '1:4',
            unitWaste: 5,
            mortarWaste: 150,
            cavityWidth: 0,
        };
        expect(() => calculateMasonry(input)).toThrow('Mortar waste must be between 0 and 100.');
    });
});
