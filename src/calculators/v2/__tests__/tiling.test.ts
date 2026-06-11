import { describe, it, expect } from 'vitest';
import {
    TILE_FORMATS,
    TILE_SPACERS,
    resolveTile,
    planTiling,
    calculateTiling,
    type TilingInput,
} from '../tiling';

// Tiling now offers Selco's preset tile sizes plus a custom size, and lets
// the customer choose the spacer (joint) size rather than fixing it by
// surface. The chosen spacer drives the grid, the grout and the spacer line.

const job = (over: Partial<TilingInput> = {}): TilingInput => ({
    widthM: 3,
    heightM: 2.4,
    tileId: '300x600',
    customWMm: 200,
    customHMm: 200,
    surface: 'wall',
    jointMm: 2,
    wastePct: 10,
    includeTrim: true,
    tanking: false,
    backerBoard: false,
    levelling: false,
    ...over,
});

describe('TILE_FORMATS & TILE_SPACERS catalogues', () => {
    it('TC1: presets cover the Selco range, including 150×150 and the Eltham 550×333', () => {
        const dims = TILE_FORMATS.map((t) => `${t.wMm}x${t.hMm}`);
        expect(dims).toContain('200x100'); // Metro
        expect(dims).toContain('150x150'); // Flat gloss
        expect(dims).toContain('550x333'); // Eltham
    });

    it('TC2: spacer sizes Selco stocks are offered', () => {
        expect(TILE_SPACERS).toEqual(expect.arrayContaining([2, 3, 5]));
    });
});

describe('resolveTile — preset and custom', () => {
    it('TC3: a preset id resolves to that format', () => {
        expect(resolveTile(job({ tileId: '600x600' }))).toMatchObject({ wMm: 600, hMm: 600 });
    });

    it('TC4: tileId "custom" builds a format from the entered size', () => {
        const t = resolveTile(job({ tileId: 'custom', customWMm: 450, customHMm: 120 }));
        expect(t.id).toBe('custom');
        expect(t.wMm).toBe(450);
        expect(t.hMm).toBe(120);
    });
});

describe('planTiling — chosen spacer drives the joint', () => {
    it('TC5: plan joint follows the selected spacer, not the surface', () => {
        expect(planTiling(job({ jointMm: 5 })).jointMm).toBe(5);
        expect(planTiling(job({ surface: 'floor', jointMm: 1 })).jointMm).toBe(1);
    });

    it('TC6: a custom tile size drives the tile count', () => {
        const small = planTiling(job({ tileId: 'custom', customWMm: 100, customHMm: 100 }));
        const big = planTiling(job({ tileId: 'custom', customWMm: 600, customHMm: 600 }));
        expect(small.tiles).toBeGreaterThan(big.tiles);
    });
});

describe('calculateTiling — bill reflects the spacer', () => {
    it('TC7: the spacer line names the chosen size', () => {
        const bom = calculateTiling(job({ jointMm: 5 }));
        const spacer = bom.sections
            .flatMap((s) => s.lines)
            .find((l) => l.id === 'spacers');
        expect(spacer?.name).toContain('5 mm');
    });

    it('TC8: a wider joint needs at least as much grout', () => {
        const grout = (mm: number) =>
            calculateTiling(job({ jointMm: mm }))
                .sections.flatMap((s) => s.lines)
                .find((l) => l.id === 'grout')!.qty;
        expect(grout(5)).toBeGreaterThanOrEqual(grout(2));
    });
});
