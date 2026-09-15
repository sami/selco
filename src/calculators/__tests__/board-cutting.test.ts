import { describe, it, expect } from 'vitest';
import {
  GAP_MM,
  MAX_QTY,
  MIN_OFFCUT_MM,
  PANEL_SAW,
  SHEET_FORMATS,
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

interface Rect {
  xMm: number;
  yMm: number;
  wMm: number;
  hMm: number;
}

/** True when the two rectangles are at least `gap` apart in one direction. */
const apartBy = (a: Rect, b: Rect, gap: number) =>
  a.xMm + a.wMm + gap <= b.xMm ||
  b.xMm + b.wMm + gap <= a.xMm ||
  a.yMm + a.hMm + gap <= b.yMm ||
  b.yMm + b.hMm + gap <= a.yMm;

/**
 * Every piece inside its board, at least the blade and tolerance gap between any two pieces, offcuts inside
 * the board, clear of every piece by the gap and of each other, never smaller than MIN_OFFCUT_MM, and steps
 * numbered 1, 2, 3… per board.
 */
function expectCuttable(plan: CuttingPlan) {
  for (const layout of plan.layouts) {
    for (const p of layout.pieces) {
      expect(p.xMm).toBeGreaterThanOrEqual(0);
      expect(p.yMm).toBeGreaterThanOrEqual(0);
      expect(p.xMm + p.wMm).toBeLessThanOrEqual(plan.sheet.wMm);
      expect(p.yMm + p.hMm).toBeLessThanOrEqual(plan.sheet.hMm);
    }
    layout.pieces.forEach((a, i) => layout.pieces.slice(i + 1).forEach((b) => expect(apartBy(a, b, GAP_MM)).toBe(true)));
    for (const o of layout.offcuts) {
      expect(o.xMm).toBeGreaterThanOrEqual(0);
      expect(o.yMm).toBeGreaterThanOrEqual(0);
      expect(o.xMm + o.wMm).toBeLessThanOrEqual(plan.sheet.wMm);
      expect(o.yMm + o.hMm).toBeLessThanOrEqual(plan.sheet.hMm);
      expect(Math.min(o.wMm, o.hMm)).toBeGreaterThanOrEqual(MIN_OFFCUT_MM);
      for (const p of layout.pieces) expect(apartBy(o, p, GAP_MM)).toBe(true);
    }
    layout.offcuts.forEach((a, i) => layout.offcuts.slice(i + 1).forEach((b) => expect(apartBy(a, b, 0)).toBe(true)));
    expect(layout.cuts.map((c) => c.step)).toEqual(layout.cuts.map((_, i) => i + 1));
    if (plan.sheet.crossCutOnly) expect(layout.strips).toEqual([]);
  }
}

describe('constants', () => {
  it('uses a 3 mm blade and a ±3 mm tolerance', () => {
    expect(PANEL_SAW.kerfMm).toBe(3);
    expect(TOLERANCE_MM).toBe(3);
  });

  it('leaves a 6 mm gap for the blade and tolerance, and ignores offcuts under 10 mm', () => {
    expect(GAP_MM).toBe(PANEL_SAW.kerfMm + TOLERANCE_MM);
    expect(GAP_MM).toBe(6);
    expect(MIN_OFFCUT_MM).toBe(10);
  });

  it('keeps every board format within the panel saw limits', () => {
    for (const format of SHEET_FORMATS) {
      expect(Math.max(format.wMm, format.hMm)).toBeLessThanOrEqual(PANEL_SAW.maxLongMm);
      expect(Math.min(format.wMm, format.hMm)).toBeLessThanOrEqual(PANEL_SAW.maxShortMm);
      if (format.thicknessMm !== undefined) {
        expect(format.thicknessMm).toBeLessThanOrEqual(PANEL_SAW.maxDepthMm);
      }
    }
  });
});

describe('planCutting: standard sheets', () => {
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
    expectCuttable(plan);
    expect(sheetPlan([{ wMm: 1220, hMm: 2440, qty: 2 }]).layouts).toHaveLength(2);
  });

  it('leaves the blade and tolerance gap between pieces side by side', () => {
    // 605 + 6 + 605 = 1216, fits the 1220 width
    const fits = placed(sheetPlan([{ wMm: 605, hMm: 500, qty: 2 }]));
    expect(fits.map((p) => [p.xMm, p.yMm])).toEqual([[0, 0], [611, 0]]);
    // 608 + 6 + 608 = 1222, so the second piece starts a new row 500 + 6 below
    const wraps = placed(sheetPlan([{ wMm: 608, hMm: 500, qty: 2 }]));
    expect(wraps.map((p) => [p.xMm, p.yMm])).toEqual([[0, 0], [0, 506]]);
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

  it('flags the saw minimum at its exact boundaries', () => {
    const plan = sheetPlan([
      { wMm: 499, hMm: 300, qty: 1 },
      { wMm: 500, hMm: 230, qty: 1 },
    ]);
    expect(plan.belowMinRefs).toEqual(['A']);
  });

  it('packs pieces below the saw minimum at the size cut in store', () => {
    // Two rows of MAX_QTY, since a single row can't order 100
    const plan = sheetPlan([{ wMm: 100, hMm: 100, qty: MAX_QTY }, { wMm: 100, hMm: 100, qty: MAX_QTY }], true);
    // Each is cut as 500 × 230 mm: 11.5 m² of cuts on 2.98 m² sheets needs at least four
    expect(plan.layouts.length).toBeGreaterThanOrEqual(4);
    expect(placed(plan)).toHaveLength(100);
    for (const p of placed(plan)) {
      expect(Math.max(p.wMm, p.hMm)).toBeGreaterThanOrEqual(PANEL_SAW.minLongMm);
      expect(Math.min(p.wMm, p.hMm)).toBeGreaterThanOrEqual(PANEL_SAW.minShortMm);
    }
    expectCuttable(plan);
    // The cut list keeps the finished size the customer asked for
    expect(plan.cutList[0]).toMatchObject({ wMm: 100, hMm: 100, belowMin: true });
  });

  it('cuts small pieces oversize in the direction entered when rotation is off', () => {
    expect(placed(sheetPlan([{ wMm: 100, hMm: 400, qty: 1 }]))[0]).toMatchObject({ wMm: 230, hMm: 500, rotated: false });
    expect(placed(sheetPlan([{ wMm: 400, hMm: 100, qty: 1 }]))[0]).toMatchObject({ wMm: 500, hMm: 230, rotated: false });
  });

  it('only fits a full-length sheet across the width when it may be turned', () => {
    expect(sheetPlan([{ wMm: 2440, hMm: 1220, qty: 1 }], false).unplaceableRefs).toEqual(['A']);
    const turned = sheetPlan([{ wMm: 2440, hMm: 1220, qty: 1 }], true);
    expect(placed(turned)).toEqual([{ ref: 'A', xMm: 0, yMm: 0, wMm: 1220, hMm: 2440, rotated: true }]);
  });

  it('never marks a square piece as turned', () => {
    const plan = sheetPlan([{ wMm: 1220, hMm: 1220, qty: 1 }], true);
    expect(placed(plan)).toHaveLength(1);
    expect(placed(plan)[0].rotated).toBe(false);
  });

  it('packs a full job of 26 rows cuttably', () => {
    const pieces = Array.from({ length: 26 }, (_, i) => ({ wMm: 200 + i * 37, hMm: 150 + i * 53, qty: MAX_QTY }));
    const plan = sheetPlan(pieces, true);
    expectCuttable(plan);
    for (const entry of plan.cutList) {
      expect(placed(plan).filter((p) => p.ref === entry.ref)).toHaveLength(entry.qty);
    }
    for (const p of placed(plan)) {
      const entry = plan.cutList.find((e) => e.ref === p.ref)!;
      expect(p.rotated ? [p.hMm, p.wMm] : [p.wMm, p.hMm]).toEqual([entry.cutWMm, entry.cutHMm]);
    }
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

  it('gives the in-store cut size, in the direction entered, on each cut list line', () => {
    const cutSize = (piece: PieceInput) => {
      const entry = sheetPlan([piece]).cutList[0];
      return [entry.cutWMm, entry.cutHMm];
    };
    expect(cutSize({ wMm: 400, hMm: 300, qty: 1 })).toEqual([500, 300]);
    expect(cutSize({ wMm: 200, hMm: 200, qty: 1 })).toEqual([500, 230]);
    expect(cutSize({ wMm: 300, hMm: 400, qty: 1 })).toEqual([300, 500]);
    expect(cutSize({ wMm: 800, hMm: 600, qty: 1 })).toEqual([800, 600]);
  });

  it('keeps the finished size as the cut size for a piece too big for the board', () => {
    const entry = sheetPlan([{ wMm: 1300, hMm: 2500, qty: 1 }]).cutList[0];
    expect(entry.fits).toBe(false);
    expect([entry.cutWMm, entry.cutHMm]).toEqual([1300, 2500]);
  });
});

describe('planCutting: worktops', () => {
  it('cuts to length only, every piece taking the full 600 mm width', () => {
    // 1500 + 6 + 1494 = 3000, exactly one worktop
    const plan = worktopPlan([
      { wMm: 600, hMm: 1500, qty: 1 },
      { wMm: 600, hMm: 1494, qty: 1 },
    ]);
    expect(plan.layouts).toHaveLength(1);
    expect(placed(plan).map((p) => [p.ref, p.wMm, p.hMm, p.yMm])).toEqual([
      ['A', 600, 1500, 0],
      ['B', 600, 1494, 1506],
    ]);
    expectCuttable(plan);
  });

  it('starts another worktop when the blade and tolerance gap tips it over', () => {
    // 1500 + 6 + 1495 = 3001
    expect(worktopPlan([{ wMm: 600, hMm: 1500, qty: 1 }, { wMm: 600, hMm: 1495, qty: 1 }]).layouts).toHaveLength(2);
  });

  it('fits a full 600 × 3000 mm piece on one worktop with no trimming', () => {
    const plan = worktopPlan([{ wMm: 600, hMm: 3000, qty: 1 }]);
    expect(plan.layouts).toHaveLength(1);
    expect(plan.cutList[0]).toMatchObject({ fits: true, trimToWidth: false, belowMin: false });
  });

  it('keeps the direction entered: width is the depth, height is the length', () => {
    const narrow = worktopPlan([{ wMm: 550, hMm: 300, qty: 1 }]);
    expect(narrow.cutList[0].fits).toBe(true);
    expect(narrow.trimToWidthRefs).toEqual(['A']);
    expect(placed(narrow)[0]).toMatchObject({ wMm: 600, hMm: 300 });

    expect(worktopPlan([{ wMm: 700, hMm: 300, qty: 1 }]).unplaceableRefs).toEqual(['A']);
  });

  it('packs short worktop pieces at the 230 mm length cut in store', () => {
    // 12 × 230 + 11 × 6 = 2826 fits a worktop; 13 would need 13 × 230 + 12 × 6 = 3062, so 50 pieces take 5
    const plan = worktopPlan([{ wMm: 600, hMm: 50, qty: 50 }]);
    expect(plan.layouts).toHaveLength(5);
    expect(placed(plan).every((p) => p.hMm === 230)).toBe(true);
    expect(placed(plan).every((p) => p.wMm === plan.cutList[0].cutWMm && p.hMm === plan.cutList[0].cutHMm)).toBe(true);
    expectCuttable(plan);
  });

  it('gives the full worktop width and the oversize length as the cut size', () => {
    const entry = worktopPlan([{ wMm: 150, hMm: 200, qty: 1 }]).cutList[0];
    expect([entry.cutWMm, entry.cutHMm]).toEqual([600, 230]);

    const tooWide = worktopPlan([{ wMm: 700, hMm: 300, qty: 1 }]).cutList[0];
    expect(tooWide.fits).toBe(false);
    expect([tooWide.cutWMm, tooWide.cutHMm]).toEqual([700, 300]);
  });

  it('does not flag trimming or the saw minimum on a piece that does not fit', () => {
    const plan = worktopPlan([{ wMm: 100, hMm: 3100, qty: 1 }]);
    expect(plan.cutList[0]).toMatchObject({ fits: false, belowMin: false, trimToWidth: false });
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
    // 150 × 200 comes off at full width as 600 × 200: under 230 mm, so below minimum
    const plan = worktopPlan([{ wMm: 150, hMm: 200, qty: 1 }]);
    expect(plan.belowMinRefs).toEqual(['A']);
    expect(plan.trimToWidthRefs).toEqual(['A']);
    expect(placed(plan)[0]).toMatchObject({ wMm: 600, hMm: 230 });
  });

  it('never allows rotation on worktops', () => {
    expect(worktopPlan([{ wMm: 600, hMm: 1000, qty: 1 }], true).rotationAllowed).toBe(false);
  });
});

describe('planCutting: saw steps and offcuts', () => {
  it('cuts a sheet into a strip, then cross-cuts each piece, and lists the offcut below', () => {
    const plan = sheetPlan([{ wMm: 800, hMm: 600, qty: 1 }, { wMm: 400, hMm: 600, qty: 1 }]);
    expect(plan.layouts).toHaveLength(1);
    const [layout] = plan.layouts;
    expect(layout.strips.map((s) => [s.yMm, s.heightMm])).toEqual([[0, 600]]);
    // A at 0, B at 800 + 6 = 806
    expect(layout.strips[0].pieces.map((p) => [p.ref, p.xMm])).toEqual([['A', 0], ['B', 806]]);
    expect(layout.cuts).toEqual([
      { kind: 'strip', step: 1, strip: 1, atMm: 600 },
      { kind: 'piece', step: 2, strip: 1, ref: 'A', atMm: 800, trimToMm: null },
      { kind: 'piece', step: 3, strip: 1, ref: 'B', atMm: 400, trimToMm: null },
    ]);
    // Right of the strip: 1220 - 1206 - 6 = 8 mm, under MIN_OFFCUT_MM, so not listed.
    // Below the strip: y 600 + 6 = 606, height 2440 - 600 - 6 = 1834.
    expect(layout.offcuts).toEqual([{ xMm: 0, yMm: 606, wMm: 1220, hMm: 1834 }]);
    expectCuttable(plan);
  });

  it('trims a piece shorter than its strip and lists the offcut above it', () => {
    const plan = sheetPlan([{ wMm: 700, hMm: 600, qty: 1 }, { wMm: 500, hMm: 400, qty: 1 }]);
    expect(plan.layouts).toHaveLength(1);
    const [layout] = plan.layouts;
    expect(layout.strips.map((s) => [s.yMm, s.heightMm])).toEqual([[0, 600]]);
    // A at 0, B at 700 + 6 = 706, ending at 1206
    expect(layout.strips[0].pieces.map((p) => [p.ref, p.xMm])).toEqual([['A', 0], ['B', 706]]);
    expect(layout.cuts).toEqual([
      { kind: 'strip', step: 1, strip: 1, atMm: 600 },
      { kind: 'piece', step: 2, strip: 1, ref: 'A', atMm: 700, trimToMm: null },
      // B is 400 high on a 600 strip, so it's trimmed to 400
      { kind: 'piece', step: 3, strip: 1, ref: 'B', atMm: 500, trimToMm: 400 },
    ]);
    // Offcuts are listed per strip: above each piece in x order, then the right remainder; then below the last strip.
    // Above B: x 706, y 400 + 6 = 406, 500 wide, 600 - 400 - 6 = 194 high.
    // Right of the strip: 1220 - 1206 - 6 = 8 mm, under MIN_OFFCUT_MM, so not listed.
    // Below the strip: y 606, 1220 wide, 2440 - 600 - 6 = 1834 high.
    expect(layout.offcuts).toEqual([
      { xMm: 706, yMm: 406, wMm: 500, hMm: 194 },
      { xMm: 0, yMm: 606, wMm: 1220, hMm: 1834 },
    ]);
    expectCuttable(plan);
  });

  it('plans steps and offcuts for a piece below the saw minimum at its in-store cut size', () => {
    // B (300 × 400) is below the saw minimum, so it's cut, placed and trimmed on the saw at 300 × 500.
    // The home trim from 500 down to 400 is covered by the cut list note, not by a saw step.
    const plan = sheetPlan([{ wMm: 800, hMm: 600, qty: 1 }, { wMm: 300, hMm: 400, qty: 1 }]);
    expect(plan.belowMinRefs).toEqual(['B']);
    const [layout] = plan.layouts;
    // B at 800 + 6 = 806, ending at 1106
    expect(layout.cuts).toEqual([
      { kind: 'strip', step: 1, strip: 1, atMm: 600 },
      { kind: 'piece', step: 2, strip: 1, ref: 'A', atMm: 800, trimToMm: null },
      { kind: 'piece', step: 3, strip: 1, ref: 'B', atMm: 300, trimToMm: 500 },
    ]);
    expect(layout.offcuts).toEqual([
      // Above B: y 500 + 6 = 506, height 600 - 500 - 6 = 94
      { xMm: 806, yMm: 506, wMm: 300, hMm: 94 },
      // Right of the strip: x 1106 + 6 = 1112, width 1220 - 1106 - 6 = 108
      { xMm: 1112, yMm: 0, wMm: 108, hMm: 600 },
      { xMm: 0, yMm: 606, wMm: 1220, hMm: 1834 },
    ]);
    expectCuttable(plan);
  });

  it('uses the placed size of a turned piece', () => {
    const plan = sheetPlan([{ wMm: 2000, hMm: 1000, qty: 1 }], true);
    const [layout] = plan.layouts;
    expect(layout.cuts).toEqual([
      { kind: 'strip', step: 1, strip: 1, atMm: 2000 },
      { kind: 'piece', step: 2, strip: 1, ref: 'A', atMm: 1000, trimToMm: null },
    ]);
    expect(layout.offcuts).toEqual([
      // 1220 - 1000 - 6 = 214 to the right
      { xMm: 1006, yMm: 0, wMm: 214, hMm: 2000 },
      // 2440 - 2000 - 6 = 434 below
      { xMm: 0, yMm: 2006, wMm: 1220, hMm: 434 },
    ]);
    expectCuttable(plan);
  });

  it('needs no cross-cut for a piece flush with the board edge that needs no trim', () => {
    const strip = sheetPlan([{ wMm: 1220, hMm: 600, qty: 1 }]).layouts[0];
    expect(strip.cuts).toEqual([{ kind: 'strip', step: 1, strip: 1, atMm: 600 }]);
    expect(strip.offcuts).toEqual([{ xMm: 0, yMm: 606, wMm: 1220, hMm: 1834 }]);

    const full = sheetPlan([{ wMm: 1220, hMm: 2440, qty: 1 }]).layouts[0];
    expect(full.strips.map((s) => [s.yMm, s.heightMm])).toEqual([[0, 2440]]);
    expect(full.cuts).toEqual([]);
    expect(full.offcuts).toEqual([]);
  });

  it('numbers the steps per board, starting again at 1', () => {
    const plan = sheetPlan([{ wMm: 1000, hMm: 2000, qty: 2 }]);
    expect(plan.layouts).toHaveLength(2);
    for (const layout of plan.layouts) {
      expect(layout.cuts).toEqual([
        { kind: 'strip', step: 1, strip: 1, atMm: 2000 },
        { kind: 'piece', step: 2, strip: 1, ref: 'A', atMm: 1000, trimToMm: null },
      ]);
    }
    expectCuttable(plan);
  });

  it('cuts worktops length by length and lists the end offcut', () => {
    const plan = worktopPlan([{ wMm: 600, hMm: 1500, qty: 1 }, { wMm: 600, hMm: 1000, qty: 1 }]);
    const [layout] = plan.layouts;
    expect(layout.strips).toEqual([]);
    expect(layout.cuts).toEqual([
      { kind: 'length', step: 1, ref: 'A', atMm: 1500 },
      { kind: 'length', step: 2, ref: 'B', atMm: 1000 },
    ]);
    // Used 1500 + 6 + 1000 = 2506; offcut from 2506 + 6 = 2512, 3000 - 2506 - 6 = 488 long
    expect(layout.offcuts).toEqual([{ xMm: 0, yMm: 2512, wMm: 600, hMm: 488 }]);
    expectCuttable(plan);
  });

  it('skips the last worktop cut when the piece ends flush with the worktop end', () => {
    const exact = worktopPlan([{ wMm: 600, hMm: 1500, qty: 1 }, { wMm: 600, hMm: 1494, qty: 1 }]).layouts[0];
    expect(exact.cuts).toEqual([{ kind: 'length', step: 1, ref: 'A', atMm: 1500 }]);
    expect(exact.offcuts).toEqual([]);

    const full = worktopPlan([{ wMm: 600, hMm: 3000, qty: 1 }]).layouts[0];
    expect(full.cuts).toEqual([]);
    expect(full.offcuts).toEqual([]);
  });

  it('does not list a worktop end offcut under 10 mm', () => {
    // 2984 leaves 3000 - 2984 - 6 = 10, which is listed; 2985 leaves 9, which is not
    expect(worktopPlan([{ wMm: 600, hMm: 2984, qty: 1 }]).layouts[0].offcuts).toEqual([{ xMm: 0, yMm: 2990, wMm: 600, hMm: 10 }]);
    expect(worktopPlan([{ wMm: 600, hMm: 2985, qty: 1 }]).layouts[0].offcuts).toEqual([]);
  });
});

describe('validation', () => {
  it('accepts a sensible piece', () => {
    expect(validatePiece({ wMm: 600, hMm: 400, qty: 2 })).toBeNull();
  });

  it('rejects zero, negative, missing, infinite or fractional sizes', () => {
    const message = 'Enter a width and height in whole mm above 0';
    for (const wMm of [0, -600, Number.NaN, Number.POSITIVE_INFINITY, 405.5]) {
      expect(validatePiece({ wMm, hMm: 400, qty: 1 })).toBe(message);
      expect(validatePiece({ wMm: 400, hMm: wMm, qty: 1 })).toBe(message);
    }
    expect(() => sheetPlan([{ wMm: 0, hMm: 500, qty: 1 }])).toThrow(`Piece A: ${message}`);
  });

  it(`rejects quantities that are not whole numbers from 1 to ${MAX_QTY}`, () => {
    for (const qty of [0, -1, 1.5, MAX_QTY + 1]) {
      expect(() => sheetPlan([{ wMm: 500, hMm: 500, qty }])).toThrow(
        `Piece A: Quantity must be a whole number from 1 to ${MAX_QTY}`,
      );
    }
    expect(validatePiece({ wMm: 500, hMm: 500, qty: MAX_QTY })).toBeNull();
  });

  it('rejects an unknown board type', () => {
    expect(() => planCutting({ sheetId: 'door' as 'sheet', pieces: [], allowRotation: false })).toThrow('Unknown board type: door');
  });

  it('rejects more than 26 rows, since each needs a letter', () => {
    const pieces = Array.from({ length: 27 }, () => ({ wMm: 500, hMm: 500, qty: 1 }));
    expect(() => sheetPlan(pieces)).toThrow('No more than 26 different pieces per plan');
  });
});
