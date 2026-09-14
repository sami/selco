import { describe, it, expect } from 'vitest';
import {
  PANEL_SAW,
  TOLERANCE_MM,
  planCutting,
  validatePiece,
  type CuttingPlan,
  type PieceInput,
} from '../board-cutting';

const sheetPlan = (pieces: PieceInput[], allowRotation = false) =>
  planCutting({ sheetId: 'sheet', pieces, allowRotation });
const worktopPlan = (pieces: PieceInput[], allowRotation = false) =>
  planCutting({ sheetId: 'worktop', pieces, allowRotation });
const placed = (plan: CuttingPlan) => plan.layouts.flatMap((l) => l.pieces);

/** Every piece inside its board, and at least one blade width between any two pieces. */
function expectCuttable(plan: CuttingPlan) {
  const kerf = PANEL_SAW.kerfMm;
  for (const layout of plan.layouts) {
    for (const p of layout.pieces) {
      expect(p.xMm).toBeGreaterThanOrEqual(0);
      expect(p.yMm).toBeGreaterThanOrEqual(0);
      expect(p.xMm + p.wMm).toBeLessThanOrEqual(plan.sheet.wMm);
      expect(p.yMm + p.hMm).toBeLessThanOrEqual(plan.sheet.hMm);
    }
    layout.pieces.forEach((a, i) =>
      layout.pieces.slice(i + 1).forEach((b) => {
        const apart =
          a.xMm + a.wMm + kerf <= b.xMm ||
          b.xMm + b.wMm + kerf <= a.xMm ||
          a.yMm + a.hMm + kerf <= b.yMm ||
          b.yMm + b.hMm + kerf <= a.yMm;
        expect(apart).toBe(true);
      }),
    );
  }
}

describe('constants', () => {
  it('uses a 3 mm blade and a ±3 mm tolerance', () => {
    expect(PANEL_SAW.kerfMm).toBe(3);
    expect(TOLERANCE_MM).toBe(3);
  });
});

describe('planCutting — standard sheets', () => {
  const job: PieceInput[] = [
    { wMm: 800, hMm: 600, qty: 4 },
    { wMm: 1200, hMm: 400, qty: 2 },
    { wMm: 600, hMm: 400, qty: 6 },
  ];

  it('places every piece, cuttably, across enough sheets', () => {
    const plan = sheetPlan(job, true);
    expect(placed(plan)).toHaveLength(12);
    expectCuttable(plan);
    // 4.32 m² of pieces on 2.98 m² sheets needs at least two
    expect(plan.layouts.length).toBeGreaterThanOrEqual(2);
  });

  it('gives each row a reference letter used on the placed pieces', () => {
    const plan = sheetPlan(job, true);
    expect(plan.cutList.map((c) => c.ref)).toEqual(['A', 'B', 'C']);
    expect(placed(plan).filter((p) => p.ref === 'A')).toHaveLength(4);
    expect(placed(plan).filter((p) => p.ref === 'C')).toHaveLength(6);
  });

  it('never turns a piece when rotation is off', () => {
    const plan = sheetPlan(job, false);
    expectCuttable(plan);
    expect(placed(plan).every((p) => !p.rotated)).toBe(true);
    expect(plan.rotationAllowed).toBe(false);
  });

  it('fills a sheet exactly with a full-size piece', () => {
    const plan = sheetPlan([{ wMm: 1220, hMm: 2440, qty: 1 }]);
    expect(plan.layouts).toHaveLength(1);
    expect(plan.layouts[0].utilisation).toBe(1);
    expect(sheetPlan([{ wMm: 1220, hMm: 2440, qty: 2 }]).layouts).toHaveLength(2);
  });

  it('leaves a blade width between pieces side by side', () => {
    // 608 + 3 + 608 = 1219, fits the 1220 width
    const fits = placed(sheetPlan([{ wMm: 608, hMm: 500, qty: 2 }]));
    expect(fits.map((p) => [p.xMm, p.yMm])).toEqual([[0, 0], [611, 0]]);
    // 610 + 3 + 610 = 1223, so the second piece starts a new row below
    const wraps = placed(sheetPlan([{ wMm: 610, hMm: 500, qty: 2 }]));
    expect(wraps.map((p) => [p.xMm, p.yMm])).toEqual([[0, 0], [0, 503]]);
  });

  it('turns a piece to fit only when rotation is allowed', () => {
    const turned = sheetPlan([{ wMm: 2000, hMm: 1000, qty: 1 }], true);
    expect(placed(turned)).toEqual([{ ref: 'A', xMm: 0, yMm: 0, wMm: 1000, hMm: 2000, rotated: true }]);

    const fixed = sheetPlan([{ wMm: 2000, hMm: 1000, qty: 1 }], false);
    expect(fixed.unplaceableRefs).toEqual(['A']);
    expect(fixed.layouts).toHaveLength(0);
  });

  it('flags pieces below the 500 × 230 mm saw minimum', () => {
    const plan = sheetPlan([
      { wMm: 400, hMm: 300, qty: 1 },
      { wMm: 600, hMm: 230, qty: 1 },
      { wMm: 600, hMm: 229, qty: 1 },
    ]);
    expect(plan.belowMinRefs).toEqual(['A', 'C']);
    expect(placed(plan)).toHaveLength(3);
  });

  it('reports pieces too big for the board and still places the rest', () => {
    const plan = sheetPlan([
      { wMm: 1300, hMm: 2500, qty: 1 },
      { wMm: 500, hMm: 500, qty: 1 },
    ]);
    expect(plan.unplaceableRefs).toEqual(['A']);
    expect(plan.cutList[0].fits).toBe(false);
    expect(placed(plan).map((p) => p.ref)).toEqual(['B']);
  });

  it('returns an empty plan for no pieces', () => {
    const plan = sheetPlan([]);
    expect(plan.cutList).toEqual([]);
    expect(plan.layouts).toEqual([]);
  });
});

describe('planCutting — worktops', () => {
  it('cuts to length only, every piece taking the full 600 mm width', () => {
    // 1500 + 3 + 1497 = 3000, exactly one worktop
    const plan = worktopPlan([
      { wMm: 1500, hMm: 600, qty: 1 },
      { wMm: 600, hMm: 1497, qty: 1 },
    ]);
    expect(plan.layouts).toHaveLength(1);
    expect(placed(plan).map((p) => [p.ref, p.wMm, p.hMm, p.yMm])).toEqual([
      ['A', 600, 1500, 0],
      ['B', 600, 1497, 1503],
    ]);
    expectCuttable(plan);
  });

  it('starts another worktop when the blade width tips it over', () => {
    expect(worktopPlan([{ wMm: 1500, hMm: 600, qty: 1 }, { wMm: 600, hMm: 1498, qty: 1 }]).layouts).toHaveLength(2);
  });

  it('flags pieces narrower than the worktop for trimming to width at home', () => {
    const plan = worktopPlan([{ wMm: 400, hMm: 1000, qty: 1 }]);
    expect(plan.trimToWidthRefs).toEqual(['A']);
    expect(placed(plan)[0]).toMatchObject({ wMm: 600, hMm: 1000 });
  });

  it('rejects pieces wider or longer than the worktop', () => {
    expect(worktopPlan([{ wMm: 700, hMm: 1000, qty: 1 }]).unplaceableRefs).toEqual(['A']);
    expect(worktopPlan([{ wMm: 600, hMm: 3100, qty: 1 }]).unplaceableRefs).toEqual(['A']);
  });

  it('applies the same saw minimum to the piece as cut in store', () => {
    // 150 × 200 is cut in store as 600 × 200: under 230 mm, so below minimum
    const plan = worktopPlan([{ wMm: 150, hMm: 200, qty: 1 }]);
    expect(plan.belowMinRefs).toEqual(['A']);
    expect(plan.trimToWidthRefs).toEqual(['A']);
  });

  it('never allows rotation on worktops', () => {
    expect(worktopPlan([{ wMm: 600, hMm: 1000, qty: 1 }], true).rotationAllowed).toBe(false);
  });
});

describe('validation', () => {
  it('accepts a sensible piece', () => {
    expect(validatePiece({ wMm: 600, hMm: 400, qty: 2 })).toBeNull();
  });

  it('rejects zero or missing sizes', () => {
    expect(validatePiece({ wMm: 0, hMm: 400, qty: 1 })).toBe('Enter a width and height above 0 mm');
    expect(validatePiece({ wMm: Number.NaN, hMm: 400, qty: 1 })).toBe('Enter a width and height above 0 mm');
    expect(() => sheetPlan([{ wMm: 0, hMm: 500, qty: 1 }])).toThrow('Piece A: Enter a width and height above 0 mm');
  });

  it('rejects quantities that are not whole numbers from 1 to 50', () => {
    for (const qty of [0, 1.5, 51]) {
      expect(() => sheetPlan([{ wMm: 500, hMm: 500, qty }])).toThrow('Piece A: Quantity must be a whole number from 1 to 50');
    }
  });

  it('rejects an unknown board type', () => {
    expect(() => planCutting({ sheetId: 'door' as 'sheet', pieces: [], allowRotation: false })).toThrow('Unknown board type: door');
  });

  it('rejects more than 26 rows, since each needs a letter', () => {
    const pieces = Array.from({ length: 27 }, () => ({ wMm: 500, hMm: 500, qty: 1 }));
    expect(() => sheetPlan(pieces)).toThrow('No more than 26 different pieces per plan');
  });
});
