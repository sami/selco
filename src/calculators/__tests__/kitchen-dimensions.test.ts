/**
 * @file src/calculators/__tests__/kitchen-dimensions.test.ts
 *
 * TDD suite for the Selco kitchen unit, fascia and decor-panel
 * dimensions, and for the engine quoting them on the bill of materials.
 * The dimensions are read off the range dimension sheets; the engine's
 * counts and logic are unchanged, only the line detail text gains the
 * real sizes.
 */

import { describe, it, expect } from 'vitest';
import {
    CARCASS,
    END_PANELS,
    CORNER,
    DRAWER_FRONTS,
    TALL_UNITS,
    fmtSize,
    fmtSplit,
} from '../v2/kitchen-dimensions';
import { calculateKitchen, type KitchenInput } from '../v2/kitchen';

// ---------------------------------------------------------------------------
// The data module
// ---------------------------------------------------------------------------

describe('kitchen-dimensions data', () => {
    it('TC1: base carcass front + plinth make the worktop height', () => {
        expect(CARCASS.base.doorFrontMm + CARCASS.base.plinthMm).toBe(CARCASS.base.toWorktopMm);
        expect(CARCASS.base.depthMm).toBe(565);
    });

    it('TC2: tall fascia + plinth make the overall tall height', () => {
        expect(CARCASS.tall.fasciaMm + CARCASS.tall.plinthMm).toBe(CARCASS.tall.overallMm);
        expect(CARCASS.tall.overallMm).toBe(2118);
    });

    it('TC3: wall units are 700 high and the shallow 330 deep', () => {
        expect(CARCASS.wall.heightMm).toBe(700);
        expect(CARCASS.wall.depthMm).toBe(330);
    });

    it('TC4: 18 mm plant-on decor end panels carry their real sizes', () => {
        expect(fmtSize(END_PANELS.base)).toBe('615 × 915 mm');
        expect(fmtSize(END_PANELS.wall)).toBe('585 × 748 mm');
        expect(fmtSize(END_PANELS.tall)).toBe('615 × 2143 mm');
    });

    it('TC5: corner units split their fascias as on the sheet', () => {
        expect(fmtSplit(CORNER.l935.fasciaSplit)).toBe('635 / 300 mm');
        expect(CORNER.l935.footprintMm).toBe(935);
        expect(CORNER.c1000.blankingPanelMm).toBe(135);
        expect(CORNER.wall635.footprintMm).toBe(635);
    });

    it('TC6: drawer fronts add up under the door-front height', () => {
        expect(fmtSplit(DRAWER_FRONTS[500])).toBe('124 / 124 / 124 / 316 mm');
        expect(fmtSplit(DRAWER_FRONTS[600])).toBe('124 / 252 / 316 mm');
        expect(fmtSplit(DRAWER_FRONTS[800])).toBe('124 / 252 / 316 mm');
        expect(DRAWER_FRONTS[500].reduce((a, b) => a + b, 0)).toBeLessThanOrEqual(CARCASS.base.doorFrontMm);
    });

    it('TC7: fridge housings split 50:50 and 70:30', () => {
        expect(fmtSplit(TALL_UNITS.fridge5050.splitMm)).toBe('1052 / 892 mm');
        expect(fmtSplit(TALL_UNITS.fridge7030.splitMm)).toBe('1244 / 700 mm');
    });
});

// ---------------------------------------------------------------------------
// The engine quotes the dimensions on the bill
// ---------------------------------------------------------------------------

const base: KitchenInput = {
    shape: 'l-shape',
    doorStyle: 'handleless',
    wallAM: 3.6,
    wallBM: 3.0,
    wallCM: 2.4,
    cornerType: 'l935',
    sinkUnder: 'dw500',
    fridgeType: 'integrated',
    ovenHousing: true,
    includeWallUnits: true,
    includeCornice: true,
    layout: {
        A: [
            { id: 'a1', kind: 'fridge', widthMm: 600 },
            { id: 'a2', kind: 'base', widthMm: 600 },
            { id: 'a3', kind: 'sink', widthMm: 1000 },
            { id: 'a4', kind: 'larder', widthMm: 600 },
        ],
        B: [
            { id: 'b1', kind: 'cooker', widthMm: 600 },
            { id: 'b2', kind: 'drawers', widthMm: 500 },
            { id: 'b3', kind: 'drawers', widthMm: 600 },
        ],
        C: [],
    },
};

function detailOf(bom: ReturnType<typeof calculateKitchen>, id: string): string {
    for (const s of bom.sections) {
        const line = s.lines.find((l) => l.id === id);
        if (line) return line.detail ?? '';
    }
    return '';
}

describe('calculateKitchen — dimensions on the bill', () => {
    it('TC8: decor end panels quote their real sizes', () => {
        const bom = calculateKitchen(base);
        expect(detailOf(bom, 'base-clads')).toContain('615 × 915 mm');
        expect(detailOf(bom, 'wall-clads')).toContain('585 × 748 mm');
        expect(detailOf(bom, 'tall-clads')).toContain('615 × 2143 mm');
    });

    it('TC9: the 935 L-shape corner quotes its footprint and fascia split', () => {
        const bom = calculateKitchen(base);
        const corner = detailOf(bom, 'corner');
        expect(corner).toContain('935');
        expect(corner).toContain('635 / 300 mm');
    });

    it('TC10: drawer units quote their front splits', () => {
        const bom = calculateKitchen(base);
        expect(detailOf(bom, 'drawers-500')).toContain('124 / 124 / 124 / 316 mm');
        expect(detailOf(bom, 'drawers-600')).toContain('124 / 252 / 316 mm');
    });

    it('TC11: the larder quotes the 2118 mm tall carcass', () => {
        const bom = calculateKitchen(base);
        expect(detailOf(bom, 'larder')).toContain('2118 mm');
    });

    it('TC12: the integrated fridge housing quotes its 50:50 split', () => {
        const bom = calculateKitchen(base);
        expect(detailOf(bom, 'fridge-housing')).toContain('1052 / 892 mm');
    });

    it('TC13: wall units quote the shallow 330 mm depth', () => {
        const bom = calculateKitchen(base);
        expect(detailOf(bom, 'wall-units')).toContain('330 mm');
    });
});
