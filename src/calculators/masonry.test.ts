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
    SAND_BAG_SIZES,
} from './masonry';
import type { MasonryInput, SandBagSize } from './types';

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
        // 10 * 0.043 = 0.43
        const result = calculateMortar(10, 'half-brick', '1:4', 0, 'jumbo');
        expect(result.wetVolume).toBeCloseTo(0.43);
    });

    it('one-brick mortar volume', () => {
        // 10 * 0.086 = 0.86
        const result = calculateMortar(10, 'one-brick', '1:4', 0, 'jumbo');
        expect(result.wetVolume).toBeCloseTo(0.86);
    });

    it('cavity = brick leaf + block leaf', () => {
        // 0.043 (brick) + 0.011 (block) = 0.054
        // 10 * 0.054 = 0.54
        const result = calculateMortar(10, 'cavity', '1:4', 0, 'jumbo');
        expect(result.wetVolume).toBeCloseTo(0.54);
    });

    it('blockwork mortar volume', () => {
        // 10 * 0.011 = 0.11
        const result = calculateMortar(10, 'blockwork', '1:4', 0, 'jumbo');
        expect(result.wetVolume).toBeCloseTo(0.11);
    });

    it('1:4 mix produces correct cement bags', () => {
        // wetVolume = 0.43
        // dryVolume = 0.43 * 1.33 = 0.5719
        // cement = 0.5719 / 5 * 1440 = 164.7072 kg (using 1440 density)
        // bags = ceil(164.7072 / 25) = 7
        const result = calculateMortar(10, 'half-brick', '1:4', 0, 'jumbo');
        expect(result.cementBags).toBe(7);
    });

    it('1:4 mix produces correct sand tonnes', () => {
        // sand = 0.5719 * 4/5 * 1600 = 732.032 kg
        // tonnes = 0.732032 -> roughly 0.73
        const result = calculateMortar(10, 'half-brick', '1:4', 0, 'jumbo');
        expect(result.sandTonnes).toBeCloseTo(0.73, 1);
    });

    it('applies mortar waste', () => {
        // 0.43 * 1.10 = 0.473
        const result = calculateMortar(10, 'half-brick', '1:4', 10, 'jumbo');
        expect(result.wetVolume).toBeCloseTo(0.473);
    });

    it('1:3 mix uses more cement than 1:6', () => {
        const r1 = calculateMortar(10, 'half-brick', '1:3', 0, 'jumbo');
        const r2 = calculateMortar(10, 'half-brick', '1:6', 0, 'jumbo');
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
            sandBagSize: 'jumbo',
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
            sandBagSize: 'jumbo',
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
            sandBagSize: 'jumbo',
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
            sandBagSize: 'jumbo',
        };
        expect(() => calculateMasonry(input)).toThrow('Mortar waste must be between 0 and 100.');
    });
});

describe('sand bag calculations', () => {
    // Tests for specific bag logic if we were testing a helper,
    // but here we test the result via calculateMortar if we updated it,
    // or calculateMasonry.
    // The plan says:
    // - jumbo: 408.576 kg sand -> ceil(408.576 / 875) = 1 jumbo bag
    // - large: 408.576 kg sand -> ceil(408.576 / 35) = 12 large bags
    // - small quantity: 30 kg -> 1 jumbo or 1 large bag
    // - zero sand -> 0 bags
    // Since calculateMortar doesn't take sandBagSize in the current stub/signature in test file,
    // we should check if we need to update calculateMortar signature in valid TS or just test via calculateMasonry.
    // The plan prompts say: Prompt 5 calculateMortar.
    // Wait, the prompts are for the OTHER AI.
    // I need to write tests that match the FUTURE signature even if it breaks now.
    // Does calculateMortar take sandBagSize? The Prompt 5 details aren't explicitly "add sandBagSize arg",
    // but Prompt 1 adds it to MasonryInput.
    // Let's assume calculateMortar might NOT take it if it just returns mass,
    // but calculateMasonry definitely does.
    // However, the checks are "result.mortar.sandBags".
    // Let's put these checks in calculateMasonry tests or new describe block.
    //
    // Actually, looking at the plan: "describe('sand bag calculations')"
    // This implies unit testing the logic.
    // I will add a test that mimics the logic or uses calculateMasonry.
    // Since I can't easily change calculateMortar signature here without changing all calls,
    // I'll stick to testing 'calculateMasonry' which I updated the input for,
    // OR I'll assume calculateMortar WILL be updated to take it?
    // Plan: "Prompt 5: calculateMortar ... sand bag count".
    // This suggests calculateMortar should do it.
    // But calculateMortar currently is: (netArea, wallType, mixRatio, wastage).
    // I should probably update calculateMortar calls in THIS file to include sandBagSize if I want to test it directly.
    // BUT the instructions say "No changes to existing test expectations."
    // If I change the signature, I break existing tests.
    // Maybe `sandBagSize` is optional or I update all calls?
    // "Update all calculateMasonry integration test inputs" was explicit.
    // It didn't explicitly say "Update all calculateMortar calls".
    // So maybe `calculateMasonry` handles the bag conversion?
    // "Prompt 5: calculateMortar ... sand bag count" implies it's in there.
    // Use an optional argument for now? Or just update `calculateMasonry` tests.
    // Let's use `calculateMasonry` for the new tests to be safe and avoid refactoring everything.
    // The plan listed:
    // describe('calculateMasonry with sandBagSize')
    //   - half-brick + jumbo -> result.mortar.sandBags > 0, sandBagSizeKg = 875
    // ...
    // So I will implement those.

    const baseInput: MasonryInput = {
        wallType: 'half-brick',
        walls: [{ length: 5, height: 2.4 }], // 12m2 gross
        openings: [],
        blockWidth: 100,
        mixRatio: '1:4',
        unitWaste: 5,
        mortarWaste: 10,
        cavityWidth: 0,
        sandBagSize: 'jumbo',
    };

    it('calculates jumbo bags correctly', () => {
        // 12m2 * 0.024 = 0.288 m3 wet
        // 0.288 * 1.33 = 0.38304 dry
        // Sand = 0.38304 * 0.8 * 1600 = 490.29 kg
        // Jumbo (875): ceil(490.29 / 875) = 1
        const input = { ...baseInput, sandBagSize: 'jumbo' as const };
        const result = calculateMasonry(input);
        // With new rate (0.043): ~966kg sand -> 2 jumbo bags
        expect(result.mortar.sandBags).toBe(2);
        expect(result.mortar.sandBagSizeKg).toBe(875);
    });

    it('calculates large bags correctly', () => {
        // Same sand mass: ~490.29 kg
        // Large (35): ceil(490.29 / 35) = 15
        const input = { ...baseInput, sandBagSize: 'large' as const };
        const result = calculateMasonry(input);
        // With new rate (0.043): ~966kg sand -> 28 large bags
        expect(result.mortar.sandBags).toBe(28);
        expect(result.mortar.sandBagSizeKg).toBe(35);
    });

    it('handles zero sand (small area)', () => {
        const input = {
            ...baseInput,
            walls: [{ length: 0.1, height: 0.1 }],
            sandBagSize: 'jumbo' as const
        };
        const result = calculateMasonry(input);
        // extremely small amount might round to 0 if we aren't careful,
        // but Math.ceil(>0) is 1.
        // 0.01 m2 -> ... -> >0 kg -> 1 bag.
        // Unless it's literally 0.
        expect(result.mortar.sandBags).toBeGreaterThanOrEqual(1);
    });

    it('handles zero wall area -> zero bags', () => {
        const input = {
            ...baseInput,
            // calculateWallArea throws if 0 dim.
            // Let's use opening to make net area 0.
            walls: [{ length: 1, height: 1 }],
            openings: [{ width: 1, height: 1 }],
        };
        const result = calculateMasonry(input);
        expect(result.mortar.sandBags).toBe(0);
    });
});

describe('SAND_BAG_SIZES constant', () => {
    it('exports correct bag definitions', () => {
        expect(SAND_BAG_SIZES).toHaveLength(2);
        expect(SAND_BAG_SIZES).toContainEqual(
            expect.objectContaining({ value: 'jumbo', kg: 875 })
        );
        expect(SAND_BAG_SIZES).toContainEqual(
            expect.objectContaining({ value: 'large', kg: 35 })
        );
    });
});
