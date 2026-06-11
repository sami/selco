import { describe, it, expect } from 'vitest';
import { paintAreas, calculatePaint, type PaintInput } from '../paint';

// Decorating convention: walls are painted in full. You still cut in around
// doors and windows and paint the reveals, so deducting their area just
// risks under-ordering paint. The calculator therefore takes no door/window
// inputs and makes no deduction.

const room = (over: Partial<PaintInput> = {}): PaintInput => ({
    lengthM: 4.5,
    widthM: 3.5,
    heightM: 2.4,
    coats: 2,
    paintWalls: true,
    paintCeiling: true,
    paintWoodwork: false,
    barePlaster: false,
    ...over,
});

describe('paintAreas — no opening deductions', () => {
    it('TC1: wall area is the full perimeter × height', () => {
        const a = paintAreas(room());
        const perimeter = 2 * (4.5 + 3.5);
        expect(a.wallM2).toBeCloseTo(perimeter * 2.4, 5);
    });

    it('TC2: ceiling area is length × width', () => {
        expect(paintAreas(room()).ceilingM2).toBeCloseTo(4.5 * 3.5, 5);
    });

    it('TC3: bare plaster lifts wall litres by 20%', () => {
        const sound = paintAreas(room({ barePlaster: false })).wallLitres;
        const bare = paintAreas(room({ barePlaster: true })).wallLitres;
        expect(bare).toBeCloseTo(sound * 1.2, 5);
    });
});

describe('calculatePaint — bill', () => {
    it('TC4: no "openings deducted" fact is reported', () => {
        const bom = calculatePaint(room());
        expect(bom.facts.some((f) => /opening/i.test(f.label))).toBe(false);
    });

    it('TC5: woodwork adds undercoat + gloss sized off the room, not a door count', () => {
        const bom = calculatePaint(room({ paintWoodwork: true }));
        const ids = bom.sections.flatMap((s) => s.lines.map((l) => l.id));
        expect(ids).toContain('undercoat');
        expect(ids).toContain('gloss');
    });

    it('TC6: walls off → no wall paint lines', () => {
        const bom = calculatePaint(room({ paintWalls: false, paintCeiling: false }));
        const ids = bom.sections.flatMap((s) => s.lines.map((l) => l.id));
        expect(ids.some((id) => id.startsWith('wall-'))).toBe(false);
    });
});
