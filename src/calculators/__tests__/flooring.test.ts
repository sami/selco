import { describe, it, expect } from 'vitest';
import { calculateFlooring } from '../flooring';
import type { FlooringInput } from '../types';

describe('calculateFlooring — core calculation', () => {
    it('TC1: 12 m², engineered, 2.13 m²/pack, brick-bond (10%) → 7 packs', () => {
        const result = calculateFlooring({
            areaM2: 12,
            flooringType: 'engineered',
            coveragePerPackM2: 2.13,
            layingPattern: 'brick-bond',
        });
        expect(result.grossAreaM2).toBeCloseTo(13.2, 6);
        expect(result.packsNeeded).toBe(7);
        expect(result.wastagePercent).toBe(10);
    });

    it('TC2: 30 m², laminate, 2.2 m²/pack, straight (5%) → 15 packs', () => {
        const result = calculateFlooring({
            areaM2: 30,
            flooringType: 'laminate',
            coveragePerPackM2: 2.2,
            layingPattern: 'straight',
        });
        expect(result.grossAreaM2).toBeCloseTo(31.5, 6);
        expect(result.packsNeeded).toBe(15);
        expect(result.wastagePercent).toBe(5);
    });

    it('TC3: 16 m², lvt, 3.0 m²/pack, brick-bond (10%) → 6 packs', () => {
        const result = calculateFlooring({
            areaM2: 16,
            flooringType: 'lvt',
            coveragePerPackM2: 3.0,
            layingPattern: 'brick-bond',
        });
        expect(result.grossAreaM2).toBeCloseTo(17.6, 6);
        expect(result.packsNeeded).toBe(6);
    });

    it('TC4: 20 m², solid-wood, 1.5 m²/pack, herringbone (15%) → 16 packs', () => {
        const result = calculateFlooring({
            areaM2: 20,
            flooringType: 'solid-wood',
            coveragePerPackM2: 1.5,
            layingPattern: 'herringbone',
        });
        expect(result.grossAreaM2).toBeCloseTo(23.0, 6);
        expect(result.packsNeeded).toBe(16);
        expect(result.wastagePercent).toBe(15);
    });

    it('TC5: 25 m², engineered, 2.5 m²/pack, diagonal (15%) → 12 packs', () => {
        const result = calculateFlooring({
            areaM2: 25,
            flooringType: 'engineered',
            coveragePerPackM2: 2.5,
            layingPattern: 'diagonal',
        });
        expect(result.grossAreaM2).toBeCloseTo(28.75, 6);
        expect(result.packsNeeded).toBe(12);
    });

    it('TC6: zero area → 0 packs', () => {
        const result = calculateFlooring({
            areaM2: 0,
            flooringType: 'laminate',
            coveragePerPackM2: 2.2,
        });
        expect(result.packsNeeded).toBe(0);
        expect(result.grossAreaM2).toBe(0);
        expect(result.netAreaM2).toBe(0);
    });

    it('TC7: invalid flooring type → throws', () => {
        expect(() =>
            calculateFlooring({
                areaM2: 10,
                flooringType: 'carpet' as any,
                coveragePerPackM2: 2.0,
            }),
        ).toThrow();
    });

    it('TC8: coveragePerPackM2 <= 0 → throws', () => {
        expect(() =>
            calculateFlooring({
                areaM2: 10,
                flooringType: 'engineered',
                coveragePerPackM2: 0,
            }),
        ).toThrow();
        expect(() =>
            calculateFlooring({
                areaM2: 10,
                flooringType: 'engineered',
                coveragePerPackM2: -1,
            }),
        ).toThrow();
    });
});

describe('calculateFlooring — defaults', () => {
    it('TC9: engineered with no pattern → defaults to brick-bond (10%)', () => {
        const result = calculateFlooring({
            areaM2: 12,
            flooringType: 'engineered',
            coveragePerPackM2: 2.13,
        });
        expect(result.layingPattern).toBe('brick-bond');
        expect(result.wastagePercent).toBe(10);
    });

    it('TC10: lvt with no pattern → defaults to brick-bond (10%)', () => {
        const result = calculateFlooring({
            areaM2: 16,
            flooringType: 'lvt',
            coveragePerPackM2: 3.0,
        });
        expect(result.layingPattern).toBe('brick-bond');
        expect(result.wastagePercent).toBe(10);
    });

    it('TC11: solid-wood with no pattern → defaults to brick-bond (10%)', () => {
        const result = calculateFlooring({
            areaM2: 20,
            flooringType: 'solid-wood',
            coveragePerPackM2: 1.5,
        });
        expect(result.layingPattern).toBe('brick-bond');
        expect(result.wastagePercent).toBe(10);
    });

    it('TC12: laminate with no pattern → defaults to brick-bond (10%)', () => {
        const result = calculateFlooring({
            areaM2: 30,
            flooringType: 'laminate',
            coveragePerPackM2: 2.2,
        });
        expect(result.layingPattern).toBe('brick-bond');
        expect(result.wastagePercent).toBe(10);
    });
});

describe('calculateFlooring — output shape', () => {
    it('TC13: returns materials array with flooring entry', () => {
        const result = calculateFlooring({
            areaM2: 12,
            flooringType: 'engineered',
            coveragePerPackM2: 2.13,
            layingPattern: 'brick-bond',
        });
        expect(result.materials).toEqual([
            { material: 'Flooring', quantity: 7, unit: 'packs' },
        ]);
    });

    it('TC14: result includes grossAreaM2, netAreaM2, wastagePercent, layingPattern', () => {
        const result = calculateFlooring({
            areaM2: 12,
            flooringType: 'engineered',
            coveragePerPackM2: 2.13,
            layingPattern: 'brick-bond',
        });
        expect(result).toHaveProperty('grossAreaM2');
        expect(result).toHaveProperty('netAreaM2');
        expect(result).toHaveProperty('wastagePercent');
        expect(result).toHaveProperty('layingPattern');
        expect(result.netAreaM2).toBe(12);
        expect(result.flooringType).toBe('engineered');
        expect(result.coveragePerPackM2).toBe(2.13);
    });
});
