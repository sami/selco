import { describe, it, expect } from 'vitest';
import { planCutting, type PieceInput, type SheetId } from '../../../calculators/board-cutting';
import { buildCuttingTerms, formatRefs, notesFor, SHEET_FOOTER, SIGN_OFF_STATEMENT, type TermId } from '../cutting-terms';

const plan = (pieces: PieceInput[], { sheetId = 'sheet' as SheetId, allowRotation = true } = {}) =>
  planCutting({ sheetId, pieces, allowRotation });
const term = (terms: ReturnType<typeof buildCuttingTerms>, id: TermId) => terms.find((t) => t.id === id);

describe('buildCuttingTerms', () => {
  it('lists the nine standard terms in order when nothing needs trimming', () => {
    const terms = buildCuttingTerms(plan([{ wMm: 800, hMm: 600, qty: 2 }]));
    expect(terms.map((t) => t.id)).toEqual([
      'sizes', 'tolerance', 'blade', 'board-choice', 'cut-edges', 'grain', 'once-cut', 'returns', 'estimate',
    ]);
  });

  it('always states the ±3 mm tolerance and the 3 mm blade', () => {
    const terms = buildCuttingTerms(plan([{ wMm: 800, hMm: 600, qty: 2 }]));
    expect(term(terms, 'tolerance')?.text).toContain('up to 3 mm over or under the size listed');
    expect(term(terms, 'blade')?.text).toContain('removes about 3 mm with every cut');
  });

  it('makes the customer confirm the boards staff chose, and that cut boards are non-returnable', () => {
    const terms = buildCuttingTerms(plan([{ wMm: 800, hMm: 600, qty: 2 }]));
    expect(term(terms, 'board-choice')?.text).toBe(
      "Our staff chose these boards. By signing, you confirm you've seen them and are happy they're free of damage or bowing before cutting starts.",
    );
    expect(term(terms, 'returns')?.text).toBe(
      "Cut boards and offcuts can't be returned or refunded. This doesn't affect your rights if a board is faulty.",
    );
  });

  it('switches the grain wording with the rotation setting', () => {
    expect(term(buildCuttingTerms(plan([{ wMm: 800, hMm: 600, qty: 1 }])), 'grain')?.text).toBe(
      'Pieces may be turned on the sheet to save board. If grain or pattern direction matters, tell us before signing.',
    );
    expect(term(buildCuttingTerms(plan([{ wMm: 800, hMm: 600, qty: 1 }], { allowRotation: false })), 'grain')?.text).toBe(
      'Pieces are cut in the direction shown on the plan.',
    );
    expect(
      term(buildCuttingTerms(plan([{ wMm: 600, hMm: 1000, qty: 1 }], { sheetId: 'worktop', allowRotation: true })), 'grain')?.text,
    ).toBe('Pieces are cut in the direction shown on the plan.');
  });

  it('adds the trim term, in seventh place, naming a single small piece', () => {
    const terms = buildCuttingTerms(plan([{ wMm: 500, hMm: 500, qty: 1 }, { wMm: 400, hMm: 300, qty: 1 }]));
    expect(terms.map((t) => t.id).indexOf('trim')).toBe(6);
    expect(term(terms, 'trim')?.text).toBe(
      "Piece B is below the saw's 500 × 230 mm minimum. We'll cut it oversize and you'll need to trim it yourself.",
    );
  });

  it('names several small pieces together', () => {
    const terms = buildCuttingTerms(plan([
      { wMm: 400, hMm: 300, qty: 1 },
      { wMm: 500, hMm: 500, qty: 1 },
      { wMm: 300, hMm: 300, qty: 2 },
    ]));
    expect(term(terms, 'trim')?.text).toBe(
      "Pieces A and C are below the saw's 500 × 230 mm minimum. We'll cut them oversize and you'll need to trim them yourself.",
    );
  });

  it('explains trimming worktop pieces to width at home', () => {
    const terms = buildCuttingTerms(plan([{ wMm: 400, hMm: 1000, qty: 1 }, { wMm: 450, hMm: 1200, qty: 1 }], { sheetId: 'worktop' }));
    expect(terms.map((t) => t.id).indexOf('trim')).toBe(6);
    expect(term(terms, 'trim')?.text).toBe(
      "Pieces A and B are narrower than the 600 mm worktop. Worktops are cut to length only, so you'll need to trim them to width yourself.",
    );
  });

  it('combines both trim sentences when a worktop piece is short and narrow', () => {
    const terms = buildCuttingTerms(plan([{ wMm: 150, hMm: 200, qty: 1 }], { sheetId: 'worktop' }));
    expect(term(terms, 'trim')?.text).toBe(
      "Piece A is below the saw's 500 × 230 mm minimum. We'll cut it oversize and you'll need to trim it yourself. Piece A is narrower than the 600 mm worktop. Worktops are cut to length only, so you'll need to trim it to width yourself.",
    );
  });

  it('names each worktop trim sentence after its own pieces', () => {
    const terms = buildCuttingTerms(plan([{ wMm: 600, hMm: 200, qty: 1 }, { wMm: 400, hMm: 1000, qty: 1 }], { sheetId: 'worktop' }));
    expect(term(terms, 'trim')?.text).toBe(
      "Piece A is below the saw's 500 × 230 mm minimum. We'll cut it oversize and you'll need to trim it yourself. Piece B is narrower than the 600 mm worktop. Worktops are cut to length only, so you'll need to trim it to width yourself.",
    );
  });

  it('calls board counts an estimate in the last term', () => {
    const terms = buildCuttingTerms(plan([{ wMm: 800, hMm: 600, qty: 2 }]));
    expect(terms.at(-1)?.id).toBe('estimate');
    expect(term(terms, 'estimate')?.title).toBe('Estimate');
    expect(term(terms, 'estimate')?.text).toBe(
      'Board counts and layouts are worked out from the sizes given and are an estimate. Board sizes can vary slightly between batches.',
    );
  });

  it('has a sign-off statement for the signature block', () => {
    expect(SIGN_OFF_STATEMENT).toBe("I've checked the sizes, the cutting plan and the boards, and I agree to the terms above.");
  });

  it('has a footer for the printed sheet', () => {
    expect(SHEET_FOOTER).toBe('Produced with Trade Materials Calculator, an independent estimating tool.');
  });
});

describe('formatRefs', () => {
  it('joins letters the way you would say them', () => {
    expect(formatRefs(['A'])).toBe('A');
    expect(formatRefs(['A', 'C'])).toBe('A and C');
    expect(formatRefs(['A', 'B', 'D'])).toBe('A, B and D');
  });

  it('returns an empty string for no letters', () => {
    expect(formatRefs([])).toBe('');
  });
});

describe('notesFor', () => {
  it('describes each cut list line', () => {
    const p = plan([
      { wMm: 800, hMm: 600, qty: 1 },
      { wMm: 500, hMm: 500, qty: 1 },
      { wMm: 400, hMm: 300, qty: 1 },
      { wMm: 1300, hMm: 2500, qty: 1 },
    ]);
    expect(notesFor(p.cutList[0], p.rotationAllowed)).toEqual(['May be turned to fit']);
    expect(notesFor(p.cutList[1], p.rotationAllowed)).toEqual([]);
    expect(notesFor(p.cutList[2], p.rotationAllowed)).toEqual(['May be turned to fit', 'Below saw minimum: cut at 500 × 300, trim at home']);
    expect(notesFor(p.cutList[3], p.rotationAllowed)).toEqual(['Too big for this board']);
  });

  it('notes that a small square piece may be turned, because it is cut oversize and no longer square', () => {
    const p = plan([{ wMm: 200, hMm: 200, qty: 1 }]);
    expect(notesFor(p.cutList[0], p.rotationAllowed)).toEqual(['May be turned to fit', 'Below saw minimum: cut at 500 × 230, trim at home']);
  });

  it('does not mention turning when rotation is off', () => {
    const p = plan([{ wMm: 800, hMm: 600, qty: 1 }], { allowRotation: false });
    expect(notesFor(p.cutList[0], p.rotationAllowed)).toEqual([]);
  });

  it('marks worktop pieces that need trimming to width', () => {
    const p = plan([{ wMm: 400, hMm: 1000, qty: 1 }], { sheetId: 'worktop' });
    expect(notesFor(p.cutList[0], p.rotationAllowed)).toEqual(['Cut to length only: trim to width at home']);
  });
});
