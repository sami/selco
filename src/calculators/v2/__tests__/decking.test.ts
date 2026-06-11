import { describe, it, expect } from 'vitest';
import {
    DECK_BOARDS,
    deckBoard,
    planDecking,
    calculateDecking,
    type DeckingInput,
} from '../decking';

// The concept decking calculator used to offer a single timber board and a
// single composite board behind one toggle. It now carries the real Selco
// range: several softwood and composite profiles in their stocked widths,
// thicknesses and lengths. These tests pin the catalogue and the way the
// chosen board drives the bill.

const baseInput = (over: Partial<DeckingInput> = {}): DeckingInput => ({
    widthM: 3.0,
    lengthM: 4.0,
    boardId: 'grooved-125-38',
    boardLengthM: 3.6,
    raised: false,
    ...over,
});

describe('DECK_BOARDS catalogue', () => {
    it('TC1: offers more than one board per material, drawn from the Selco range', () => {
        const timber = DECK_BOARDS.filter((b) => b.material === 'timber');
        const composite = DECK_BOARDS.filter((b) => b.material === 'composite');
        expect(timber.length).toBeGreaterThan(1);
        expect(composite.length).toBeGreaterThan(1);
    });

    it('TC2: every board has real dimensions and at least one stocked length', () => {
        for (const b of DECK_BOARDS) {
            expect(b.widthMm).toBeGreaterThan(0);
            expect(b.thicknessMm).toBeGreaterThan(0);
            expect(b.lengthsM.length).toBeGreaterThan(0);
            expect(b.lengthsM.every((l) => l > 0)).toBe(true);
            expect(b.fascia.name.length).toBeGreaterThan(0);
            expect(b.fixing.perPack).toBeGreaterThan(0);
        }
    });

    it('TC3: ids are unique', () => {
        const ids = DECK_BOARDS.map((b) => b.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('TC4: carries the stocked softwood and composite profiles', () => {
        const byId = (id: string) => DECK_BOARDS.find((b) => b.id === id);
        expect(byId('grooved-125-38')).toMatchObject({ material: 'timber', widthMm: 125, thicknessMm: 38 });
        expect(byId('easi-100-32')).toMatchObject({ material: 'timber', widthMm: 100, thicknessMm: 32 });
        // Softwood comes in a range of lengths, not just 3.6 m.
        expect(byId('easi-100-32')!.lengthsM).toEqual(expect.arrayContaining([2.4, 4.8]));
    });

    it('TC5: deckBoard() resolves by id and falls back to the first board', () => {
        expect(deckBoard('easi-100-32').id).toBe('easi-100-32');
        expect(deckBoard('does-not-exist').id).toBe(DECK_BOARDS[0].id);
    });
});

describe('planDecking — board choice drives the row count', () => {
    it('TC6: a narrower board lays more rows over the same deck width', () => {
        const wide = planDecking(baseInput({ boardId: 'grooved-125-38' })); // 125 mm
        const narrow = planDecking(baseInput({ boardId: 'easi-100-32' })); // 100 mm
        expect(narrow.rows).toBeGreaterThan(wide.rows);
    });

    it('TC7: a longer board length means fewer boards for the same deck', () => {
        const short = planDecking(baseInput({ boardLengthM: 3.0 }));
        const long = planDecking(baseInput({ boardLengthM: 4.8 }));
        expect(long.boards).toBeLessThan(short.boards);
    });
});

describe('calculateDecking — bill reflects the selected board', () => {
    it('TC8: the board line is named after the chosen product and its length', () => {
        const bom = calculateDecking(baseInput({ boardId: 'easi-100-32', boardLengthM: 4.8 }));
        const board = deckBoard('easi-100-32');
        const line = bom.sections[0].lines.find((l) => l.id === 'boards');
        expect(line?.name).toContain(board.name);
        expect(line?.detail).toContain('4.8 m');
    });

    it('TC9: composite boards take hidden clips, softwood takes screws', () => {
        const timber = calculateDecking(baseInput({ boardId: 'grooved-125-38' }));
        const composite = calculateDecking(baseInput({ boardId: 'rydal-hollow-135-22' }));
        const fix = (b: ReturnType<typeof calculateDecking>) =>
            b.sections[0].lines.find((l) => l.id === 'screws')?.name ?? '';
        expect(fix(timber).toLowerCase()).toContain('screw');
        expect(fix(composite).toLowerCase()).toContain('clip');
    });

    it('TC10: the fascia line matches the board fascia spec', () => {
        const bom = calculateDecking(baseInput({ boardId: 'rydal-hollow-135-22' }));
        const board = deckBoard('rydal-hollow-135-22');
        const line = bom.sections[0].lines.find((l) => l.id === 'fascia');
        expect(line?.name).toContain(board.fascia.name);
    });
});
