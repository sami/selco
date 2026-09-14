# Board Cutting Print Sheet Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the board cutting optimiser in `src/` with a printable A4 cutting sheet the customer signs, carrying the agreed terms on tolerance, board choice, cut edges, small pieces and returns.

**Architecture:** A pure engine (`src/calculators/board-cutting.ts`) plans pieces onto boards and flags problems. A wording module (`src/components/board-cutting/cutting-terms.ts`) turns a plan into the terms and cut-list notes, so screen and print share one source. A React island renders the inputs, plan, cut list and on-screen terms, plus a print-only sheet that `@media print` swaps in.

**Tech Stack:** Astro 5, React 19, Tailwind CSS 4 (`print:` variant), Vitest 4 + React Testing Library + jsdom, TypeScript strict.

**Design:** `docs/plans/2026-09-14-board-cutting-print-sheet-design.md`

---

## Ground rules

- **Node 22 is required.** Prefix every `npx`/`npm` command with
  `PATH="$HOME/.nvm/versions/node/v22.21.1/bin:$PATH"`. Node 18 fails with `ERR_REQUIRE_ESM`.
- **No AI trailers** on commits (no `Co-Authored-By`, no session links).
- Commit style follows the repo: `test: … (RED)`, then `feat: … (TDD GREEN)`.
- Enforce trade rules at the input: invalid combinations are unselectable or block printing, never silently corrected.
- Copy is British English, no em dashes in user-facing text.

---

### Task 1: Engine tests (RED)

**Files:**
- Test: `src/calculators/__tests__/board-cutting.test.ts`

**Step 1: Write the failing test**

```ts
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
```

**Step 2: Run test to verify it fails**

Run: `PATH="$HOME/.nvm/versions/node/v22.21.1/bin:$PATH" npx vitest run src/calculators/__tests__/board-cutting.test.ts`
Expected: FAIL with `Failed to resolve import "../board-cutting"`

**Step 3: Commit**

```bash
git add src/calculators/__tests__/board-cutting.test.ts
git commit -m "test: board cutting engine with reference letters, saw limits and validation (RED)"
```

---

### Task 2: Engine implementation (GREEN)

**Files:**
- Create: `src/calculators/board-cutting.ts`

**Step 1: Write the implementation**

```ts
/**
 * Board cutting optimiser: plans a customer's pieces onto standard boards
 * for a vertical panel saw (straight cuts only). Ported from the pre-reset
 * v2 engine (200e7f4).
 *
 * Boards are grouped by size, not material:
 *   - standard sheet, 2440 × 1220 mm, cut both ways (shelf packing, first-fit decreasing height)
 *   - worktop, 3000 × 600 × 38 mm, cut to length only (1D first-fit decreasing)
 *
 * Every row gets a reference letter so the drawing, the cut list and the
 * signed cutting sheet all name the same piece.
 */

export const PANEL_SAW = {
  kerfMm: 3,
  minLongMm: 500,
  minShortMm: 230,
  maxLongMm: 3100,
  maxShortMm: 1644,
  maxDepthMm: 60,
} as const;

/** Every cut piece can be this far over or under the size listed. */
export const TOLERANCE_MM = 3;
export const MAX_QTY = 50;

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const MAX_PIECES = LETTERS.length;

export type SheetId = 'sheet' | 'worktop';

export interface SheetFormat {
  id: SheetId;
  label: string;
  wMm: number;
  hMm: number;
  thicknessMm?: number;
  /** Cut to length only: no lengthways rips, so every piece takes the full width. */
  crossCutOnly: boolean;
}

export const SHEET_FORMATS: SheetFormat[] = [
  { id: 'sheet', label: 'Standard sheet, 2440 × 1220 mm (ply, MDF, OSB, hardboard)', wMm: 1220, hMm: 2440, crossCutOnly: false },
  { id: 'worktop', label: 'Worktop, 3000 × 600 × 38 mm (cut to length only)', wMm: 600, hMm: 3000, thicknessMm: 38, crossCutOnly: true },
];

export interface PieceInput {
  wMm: number;
  hMm: number;
  qty: number;
}

export interface CuttingInput {
  sheetId: SheetId;
  pieces: PieceInput[];
  allowRotation: boolean;
}

export interface CutListEntry {
  ref: string;
  wMm: number;
  hMm: number;
  qty: number;
  /** Fits the board in an allowed orientation. */
  fits: boolean;
  /** Below the panel saw minimum: cut oversize in store, trimmed at home. */
  belowMin: boolean;
  /** Worktop piece narrower than the worktop: cut to length, trimmed to width at home. */
  trimToWidth: boolean;
}

export interface PlacedPiece {
  ref: string;
  xMm: number;
  yMm: number;
  wMm: number;
  hMm: number;
  rotated: boolean;
}

export interface SheetLayout {
  pieces: PlacedPiece[];
  /** Share of the board covered by pieces, 0 to 1. */
  utilisation: number;
}

export interface CuttingPlan {
  sheet: SheetFormat;
  /** Rotation only applies to sheets; worktops always keep their direction. */
  rotationAllowed: boolean;
  cutList: CutListEntry[];
  layouts: SheetLayout[];
  unplaceableRefs: string[];
  belowMinRefs: string[];
  trimToWidthRefs: string[];
}

/** Why a piece can't be planned, or null if it's fine. Shared with the UI for row errors. */
export function validatePiece({ wMm, hMm, qty }: PieceInput): string | null {
  if (!Number.isFinite(wMm) || !Number.isFinite(hMm) || wMm <= 0 || hMm <= 0) {
    return 'Enter a width and height above 0 mm';
  }
  if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
    return `Quantity must be a whole number from 1 to ${MAX_QTY}`;
  }
  return null;
}

export function isBelowSawMinimum(wMm: number, hMm: number): boolean {
  return Math.max(wMm, hMm) < PANEL_SAW.minLongMm || Math.min(wMm, hMm) < PANEL_SAW.minShortMm;
}

function describePiece(p: PieceInput, ref: string, sheet: SheetFormat, allowRotation: boolean): CutListEntry {
  if (sheet.crossCutOnly) {
    const across = Math.min(p.wMm, p.hMm);
    const length = Math.max(p.wMm, p.hMm);
    const fits = across <= sheet.wMm && length <= sheet.hMm;
    return {
      ref, wMm: p.wMm, hMm: p.hMm, qty: p.qty, fits,
      // In store the piece comes off at full width, so test that shape.
      belowMin: fits && isBelowSawMinimum(sheet.wMm, length),
      trimToWidth: fits && across < sheet.wMm,
    };
  }
  const fits =
    (p.wMm <= sheet.wMm && p.hMm <= sheet.hMm) ||
    (allowRotation && p.hMm <= sheet.wMm && p.wMm <= sheet.hMm);
  return {
    ref, wMm: p.wMm, hMm: p.hMm, qty: p.qty, fits,
    belowMin: fits && isBelowSawMinimum(p.wMm, p.hMm),
    trimToWidth: false,
  };
}

interface Orientation {
  w: number;
  h: number;
  rotated: boolean;
}

interface Shelf {
  yMm: number;
  heightMm: number;
  usedWMm: number;
}

interface WorkingSheet {
  shelves: Shelf[];
  nextShelfY: number;
  pieces: PlacedPiece[];
}

const place = (ref: string, xMm: number, yMm: number, o: Orientation): PlacedPiece => ({
  ref, xMm, yMm, wMm: o.w, hMm: o.h, rotated: o.rotated,
});

/** Shelf packing, first-fit decreasing height, with a blade width between pieces and rows. */
function packShelves(pieces: PieceInput[], cutList: CutListEntry[], sheet: SheetFormat, allowRotation: boolean): PlacedPiece[][] {
  const kerf = PANEL_SAW.kerfMm;
  const instances = pieces.flatMap((p, i) =>
    cutList[i].fits ? Array.from({ length: p.qty }, () => ({ ref: cutList[i].ref, w: p.wMm, h: p.hMm })) : [],
  );
  instances.sort((a, b) => Math.max(b.w, b.h) - Math.max(a.w, a.h) || b.w * b.h - a.w * a.h);

  const sheets: WorkingSheet[] = [];
  for (const inst of instances) {
    const orientations: Orientation[] = [{ w: inst.w, h: inst.h, rotated: false }];
    if (allowRotation && inst.w !== inst.h) orientations.push({ w: inst.h, h: inst.w, rotated: true });
    const fitting = orientations.filter((o) => o.w <= sheet.wMm && o.h <= sheet.hMm);

    // 1. Best fit on an existing row, across both orientations.
    let best: { s: WorkingSheet; shelf: Shelf; o: Orientation; waste: number } | null = null;
    for (const s of sheets) {
      for (const shelf of s.shelves) {
        for (const o of fitting) {
          const x = shelf.usedWMm + kerf;
          if (o.h <= shelf.heightMm && x + o.w <= sheet.wMm) {
            const waste = shelf.heightMm - o.h;
            if (!best || waste < best.waste) best = { s, shelf, o, waste };
          }
        }
      }
    }
    if (best) {
      const x = best.shelf.usedWMm + kerf;
      best.s.pieces.push(place(inst.ref, x, best.shelf.yMm, best.o));
      best.shelf.usedWMm = x + best.o.w;
      continue;
    }

    // 2. A new row on an existing sheet, flattest orientation first.
    const flattest = [...fitting].sort((a, b) => a.h - b.h);
    let placedOnSheet = false;
    for (const s of sheets) {
      for (const o of flattest) {
        const y = s.nextShelfY + kerf;
        if (y + o.h <= sheet.hMm) {
          s.shelves.push({ yMm: y, heightMm: o.h, usedWMm: o.w });
          s.nextShelfY = y + o.h;
          s.pieces.push(place(inst.ref, 0, y, o));
          placedOnSheet = true;
          break;
        }
      }
      if (placedOnSheet) break;
    }
    if (placedOnSheet) continue;

    // 3. A new sheet.
    const o = flattest[0];
    sheets.push({ shelves: [{ yMm: 0, heightMm: o.h, usedWMm: o.w }], nextShelfY: o.h, pieces: [place(inst.ref, 0, 0, o)] });
  }
  return sheets.map((s) => s.pieces);
}

/** Cut-to-length packing: longest first, a blade width between cuts, full board width per piece. */
function packCrossCut(pieces: PieceInput[], cutList: CutListEntry[], sheet: SheetFormat): PlacedPiece[][] {
  const kerf = PANEL_SAW.kerfMm;
  const instances = pieces.flatMap((p, i) =>
    cutList[i].fits ? Array.from({ length: p.qty }, () => ({ ref: cutList[i].ref, length: Math.max(p.wMm, p.hMm) })) : [],
  );
  instances.sort((a, b) => b.length - a.length);

  const boards: Array<{ usedMm: number; pieces: PlacedPiece[] }> = [];
  for (const inst of instances) {
    const o: Orientation = { w: sheet.wMm, h: inst.length, rotated: false };
    const board = boards.find((b) => b.usedMm + kerf + inst.length <= sheet.hMm);
    if (board) {
      const y = board.usedMm + kerf;
      board.pieces.push(place(inst.ref, 0, y, o));
      board.usedMm = y + inst.length;
    } else {
      boards.push({ usedMm: inst.length, pieces: [place(inst.ref, 0, 0, o)] });
    }
  }
  return boards.map((b) => b.pieces);
}

export function planCutting(input: CuttingInput): CuttingPlan {
  const sheet = SHEET_FORMATS.find((s) => s.id === input.sheetId);
  if (!sheet) throw new Error(`Unknown board type: ${input.sheetId}`);
  if (input.pieces.length > MAX_PIECES) {
    throw new Error(`No more than ${MAX_PIECES} different pieces per plan`);
  }
  input.pieces.forEach((p, i) => {
    const error = validatePiece(p);
    if (error) throw new Error(`Piece ${LETTERS[i]}: ${error}`);
  });

  const cutList = input.pieces.map((p, i) => describePiece(p, LETTERS[i], sheet, input.allowRotation));
  const packed = sheet.crossCutOnly
    ? packCrossCut(input.pieces, cutList, sheet)
    : packShelves(input.pieces, cutList, sheet, input.allowRotation);

  const boardArea = sheet.wMm * sheet.hMm;
  const refsWhere = (test: (c: CutListEntry) => boolean) => cutList.filter(test).map((c) => c.ref);

  return {
    sheet,
    rotationAllowed: input.allowRotation && !sheet.crossCutOnly,
    cutList,
    layouts: packed.map((pieces) => ({
      pieces,
      utilisation: pieces.reduce((sum, p) => sum + p.wMm * p.hMm, 0) / boardArea,
    })),
    unplaceableRefs: refsWhere((c) => !c.fits),
    belowMinRefs: refsWhere((c) => c.belowMin),
    trimToWidthRefs: refsWhere((c) => c.trimToWidth),
  };
}
```

**Step 2: Run tests to verify they pass**

Run: `PATH="$HOME/.nvm/versions/node/v22.21.1/bin:$PATH" npx vitest run src/calculators/__tests__/board-cutting.test.ts`
Expected: PASS, all tests green.

**Step 3: Commit**

```bash
git add src/calculators/board-cutting.ts
git commit -m "feat: board cutting engine for sheets and worktops (TDD GREEN)"
```

---

### Task 3: Terms and cut-list notes tests (RED)

**Files:**
- Test: `src/components/board-cutting/__tests__/cutting-terms.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { planCutting, type PieceInput, type SheetId } from '../../../calculators/board-cutting';
import { buildCuttingTerms, formatRefs, notesFor, SIGN_OFF_STATEMENT } from '../cutting-terms';

const plan = (pieces: PieceInput[], { sheetId = 'sheet' as SheetId, allowRotation = true } = {}) =>
  planCutting({ sheetId, pieces, allowRotation });
const term = (terms: ReturnType<typeof buildCuttingTerms>, id: string) => terms.find((t) => t.id === id);

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
    expect(term(terms, 'trim')?.text).toBe(
      "Pieces A and B are narrower than the 600 mm worktop. Worktops are cut to length only, so you'll need to trim them to width yourself.",
    );
  });

  it('has a sign-off statement for the signature block', () => {
    expect(SIGN_OFF_STATEMENT).toBe("I've checked the sizes, the cutting plan and the boards, and I agree to the terms above.");
  });
});

describe('formatRefs', () => {
  it('joins letters the way you would say them', () => {
    expect(formatRefs(['A'])).toBe('A');
    expect(formatRefs(['A', 'C'])).toBe('A and C');
    expect(formatRefs(['A', 'B', 'D'])).toBe('A, B and D');
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
    expect(notesFor(p.cutList[2], p.rotationAllowed)).toEqual(['May be turned to fit', 'Below saw minimum: cut oversize, trim at home']);
    expect(notesFor(p.cutList[3], p.rotationAllowed)).toEqual(['Too big for this board']);
  });

  it('marks worktop pieces that need trimming to width', () => {
    const p = plan([{ wMm: 400, hMm: 1000, qty: 1 }], { sheetId: 'worktop' });
    expect(notesFor(p.cutList[0], p.rotationAllowed)).toEqual(['Cut to length only: trim to width at home']);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `PATH="$HOME/.nvm/versions/node/v22.21.1/bin:$PATH" npx vitest run src/components/board-cutting/__tests__/cutting-terms.test.ts`
Expected: FAIL with `Failed to resolve import "../cutting-terms"`

**Step 3: Commit**

```bash
git add src/components/board-cutting/__tests__/cutting-terms.test.ts
git commit -m "test: cutting sheet terms and cut list notes (RED)"
```

---

### Task 4: Terms and cut-list notes (GREEN)

**Files:**
- Create: `src/components/board-cutting/cutting-terms.ts`

**Step 1: Write the implementation**

```ts
/**
 * The wording a customer signs on the board cutting sheet. Screen and print
 * both render from here, so what the TSA reads out is what gets signed.
 *
 * Plain English, not legal advice: check against the employer's terms of sale.
 */
import { PANEL_SAW, TOLERANCE_MM, type CutListEntry, type CuttingPlan } from '../../calculators/board-cutting';

export interface Term {
  id: string;
  title: string;
  text: string;
}

export const SIGN_OFF_STATEMENT = "I've checked the sizes, the cutting plan and the boards, and I agree to the terms above.";
export const SHEET_FOOTER = 'Produced with Trade Materials Calculator, an independent estimating tool.';

/** "A", "A and C", "A, B and D". */
export function formatRefs(refs: string[]): string {
  if (refs.length <= 1) return refs.join('');
  return `${refs.slice(0, -1).join(', ')} and ${refs[refs.length - 1]}`;
}

function pieceGroup(refs: string[]) {
  const one = refs.length === 1;
  return { subject: `${one ? 'Piece' : 'Pieces'} ${formatRefs(refs)} ${one ? 'is' : 'are'}`, them: one ? 'it' : 'them' };
}

function trimText(plan: CuttingPlan): string | null {
  const parts: string[] = [];
  if (plan.belowMinRefs.length > 0) {
    const g = pieceGroup(plan.belowMinRefs);
    parts.push(
      `${g.subject} below the saw's ${PANEL_SAW.minLongMm} × ${PANEL_SAW.minShortMm} mm minimum. We'll cut ${g.them} oversize and you'll need to trim ${g.them} yourself.`,
    );
  }
  if (plan.trimToWidthRefs.length > 0) {
    const g = pieceGroup(plan.trimToWidthRefs);
    parts.push(
      `${g.subject} narrower than the ${plan.sheet.wMm} mm worktop. Worktops are cut to length only, so you'll need to trim ${g.them} to width yourself.`,
    );
  }
  return parts.length > 0 ? parts.join(' ') : null;
}

export function buildCuttingTerms(plan: CuttingPlan): Term[] {
  const trim = trimText(plan);
  return [
    { id: 'sizes', title: 'Sizes', text: "We cut to the sizes in the cut list above. Check every line before you sign, because we can't change a size once it's been cut." },
    { id: 'tolerance', title: 'Tolerance', text: `Each cut piece can be up to ${TOLERANCE_MM} mm over or under the size listed. Allow for this in your fitting, for example with a small gap or by scribing to fit.` },
    { id: 'blade', title: 'Blade width', text: `The saw removes about ${PANEL_SAW.kerfMm} mm with every cut. The plan already allows for it, so leftover pieces will be slightly smaller than they look on paper.` },
    { id: 'board-choice', title: 'Board choice', text: "Our staff chose these boards. By signing, you confirm you've seen them and are happy they're free of damage or bowing before cutting starts." },
    { id: 'cut-edges', title: 'Cut edges', text: "Coated boards such as melamine or laminate can chip along a cut. Cut edges aren't finished and may need edging tape or a light sand." },
    {
      id: 'grain',
      title: 'Grain and pattern',
      text: plan.rotationAllowed
        ? 'Pieces may be turned on the sheet to save board. If grain or pattern direction matters, tell us before signing.'
        : 'Pieces are cut in the direction shown on the plan.',
    },
    ...(trim ? [{ id: 'trim', title: "Pieces we can't cut to size", text: trim }] : []),
    { id: 'once-cut', title: 'Once cut', text: 'Boards can move slightly with changes in temperature and humidity, so store cut pieces flat and dry.' },
    { id: 'returns', title: 'Returns', text: "Cut boards and offcuts can't be returned or refunded. This doesn't affect your rights if a board is faulty." },
    { id: 'estimate', title: 'Estimate', text: 'Sheet counts and layouts are worked out from the sizes given and are an estimate. Board sizes can vary slightly between batches.' },
  ];
}

/** Notes column for one cut list line. */
export function notesFor(entry: CutListEntry, rotationAllowed: boolean): string[] {
  if (!entry.fits) return ['Too big for this board'];
  const notes: string[] = [];
  if (rotationAllowed && entry.wMm !== entry.hMm) notes.push('May be turned to fit');
  if (entry.belowMin) notes.push('Below saw minimum: cut oversize, trim at home');
  if (entry.trimToWidth) notes.push('Cut to length only: trim to width at home');
  return notes;
}
```

**Step 2: Run tests to verify they pass**

Run: `PATH="$HOME/.nvm/versions/node/v22.21.1/bin:$PATH" npx vitest run src/components/board-cutting/__tests__/cutting-terms.test.ts`
Expected: PASS

**Step 3: Commit**

```bash
git add src/components/board-cutting/cutting-terms.ts
git commit -m "feat: cutting sheet terms and cut list notes (TDD GREEN)"
```

---

### Task 5: Calculator component tests (RED)

**Files:**
- Test: `src/components/board-cutting/__tests__/BoardCuttingCalculator.test.tsx`

**Step 1: Write the failing test**

```tsx
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BoardCuttingCalculator } from '../BoardCuttingCalculator';
import { SIGN_OFF_STATEMENT } from '../cutting-terms';

const printButton = () => screen.getByRole('button', { name: 'Print cutting sheet' });
const printSheet = () => screen.getByRole('region', { name: 'Printable cutting sheet' });

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('BoardCuttingCalculator', () => {
  it('starts with one blank piece, no plan and printing disabled', () => {
    render(<BoardCuttingCalculator />);
    expect(screen.getAllByLabelText(/^width of/i)).toHaveLength(1);
    expect(screen.queryByRole('region', { name: 'Cutting plan' })).not.toBeInTheDocument();
    expect(printButton()).toBeDisabled();
    expect(screen.getByText('Add at least one piece before printing.')).toBeInTheDocument();
  });

  it('draws the plan and enables printing once a piece is entered', () => {
    render(<BoardCuttingCalculator />);
    fireEvent.change(screen.getByLabelText('Width of new piece'), { target: { value: '800' } });
    fireEvent.change(screen.getByLabelText('Height of piece A'), { target: { value: '600' } });

    expect(screen.getByRole('region', { name: 'Cutting plan' })).toBeInTheDocument();
    expect(printButton()).toBeEnabled();
  });

  it('adds and removes pieces', () => {
    render(<BoardCuttingCalculator />);
    fireEvent.click(screen.getByRole('button', { name: 'Add another piece' }));
    expect(screen.getAllByLabelText(/^width of/i)).toHaveLength(2);

    fireEvent.click(screen.getAllByRole('button', { name: /^remove/i })[0]);
    expect(screen.getAllByLabelText(/^width of/i)).toHaveLength(1);
  });

  it('flags a piece too big for the board and blocks printing', () => {
    render(<BoardCuttingCalculator initialRows={[{ w: '1300', h: '2500', qty: '1' }]} />);

    expect(screen.getByLabelText('Width of piece A')).toHaveAttribute('aria-invalid', 'true');
    expect(printButton()).toBeDisabled();
    expect(screen.getByText('Fix the highlighted pieces before printing.')).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Printable cutting sheet' })).not.toBeInTheDocument();
  });

  it('shows a row error for a bad quantity and hides the plan', () => {
    render(<BoardCuttingCalculator initialRows={[{ w: '500', h: '500', qty: '0' }]} />);

    expect(screen.getByText('Quantity must be a whole number from 1 to 50')).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Cutting plan' })).not.toBeInTheDocument();
    expect(printButton()).toBeDisabled();
  });

  it('hides the rotation option for worktops, which only cut to length', () => {
    render(<BoardCuttingCalculator />);
    expect(screen.getByLabelText('Pieces may be turned to fit')).toBeChecked();

    fireEvent.change(screen.getByLabelText('Board type'), { target: { value: 'worktop' } });
    expect(screen.queryByLabelText('Pieces may be turned to fit')).not.toBeInTheDocument();
  });

  it('opens the print dialog from the print button', () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => {});
    render(<BoardCuttingCalculator initialRows={[{ w: '800', h: '600', qty: '2' }]} />);

    fireEvent.click(printButton());
    expect(print).toHaveBeenCalledTimes(1);
  });

  it('stamps the printed date and time when the print dialog opens', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 8, 14, 21, 50));
    render(<BoardCuttingCalculator initialRows={[{ w: '800', h: '600', qty: '2' }]} />);
    expect(within(printSheet()).getByText('14/09/2026, 21:50')).toBeInTheDocument();

    vi.setSystemTime(new Date(2026, 8, 14, 21, 55));
    act(() => {
      window.dispatchEvent(new Event('beforeprint'));
    });
    expect(within(printSheet()).getByText('14/09/2026, 21:55')).toBeInTheDocument();
  });

  it('shows the same terms on screen as on the printed sheet', () => {
    render(<BoardCuttingCalculator initialRows={[{ w: '800', h: '600', qty: '2' }]} />);
    const onScreen = within(screen.getByRole('region', { name: 'Terms the customer signs' }))
      .getAllByRole('listitem')
      .map((li) => li.textContent);
    const printed = within(printSheet()).getAllByRole('listitem').map((li) => li.textContent);

    expect(onScreen).toHaveLength(9);
    expect(printed).toEqual(onScreen);
    expect(onScreen.some((t) => t?.includes('up to 3 mm over or under'))).toBe(true);
  });

  it('prints the cut list letters, the trim term and a signature block', () => {
    render(<BoardCuttingCalculator initialRows={[{ w: '800', h: '600', qty: '2' }, { w: '400', h: '300', qty: '1' }]} />);
    const sheet = within(printSheet());

    const rows = sheet.getAllByRole('row').slice(1);
    expect(rows.map((r) => r.querySelector('td')?.textContent)).toEqual(['A', 'B']);
    expect(sheet.getByText(/Piece B is below the saw's 500 × 230 mm minimum/)).toBeInTheDocument();
    expect(sheet.getByText(SIGN_OFF_STATEMENT)).toBeInTheDocument();
    expect(sheet.getByText(/Customer signature/)).toBeInTheDocument();
    expect(sheet.getByText(/Date and time signed/)).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `PATH="$HOME/.nvm/versions/node/v22.21.1/bin:$PATH" npx vitest run src/components/board-cutting/__tests__/BoardCuttingCalculator.test.tsx`
Expected: FAIL with `Failed to resolve import "../BoardCuttingCalculator"`

**Step 3: Commit**

```bash
git add src/components/board-cutting/__tests__/BoardCuttingCalculator.test.tsx
git commit -m "test: board cutting calculator, on-screen terms and printable sheet (RED)"
```

---

### Task 6: Presentational components

**Files:**
- Create: `src/components/board-cutting/CuttingTerms.tsx`
- Create: `src/components/board-cutting/CutListTable.tsx`
- Create: `src/components/board-cutting/CuttingPlanDrawing.tsx`
- Create: `src/components/board-cutting/PrintableCuttingSheet.tsx`

No separate tests: they're covered through the calculator tests in Task 5. Don't commit yet; Task 7 makes the RED tests pass and commits these together.

**Step 1: `CuttingTerms.tsx`**

```tsx
import type { Term } from './cutting-terms';

export function CuttingTerms({ terms }: { terms: Term[] }) {
  return (
    <ol className="list-decimal pl-5 space-y-2 text-sm leading-relaxed">
      {terms.map((t) => (
        <li key={t.id} className="break-inside-avoid">
          <strong>{t.title}.</strong> {t.text}
        </li>
      ))}
    </ol>
  );
}
```

**Step 2: `CutListTable.tsx`**

```tsx
import type { CuttingPlan } from '../../calculators/board-cutting';
import { notesFor } from './cutting-terms';

const cell = 'px-3 py-2 text-left align-top border-b border-border-default print:border-black';

export function CutListTable({ plan }: { plan: CuttingPlan }) {
  return (
    <table className="min-w-full text-sm border-collapse">
      <caption className="sr-only">Cut list</caption>
      <thead>
        <tr>
          {['Ref', 'Size (mm)', 'Qty', 'Notes'].map((h) => (
            <th key={h} scope="col" className={`${cell} font-bold`}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {plan.cutList.map((entry) => (
          <tr key={entry.ref} className="break-inside-avoid">
            <td className={`${cell} font-bold`}>{entry.ref}</td>
            <td className={cell}>{`${entry.wMm} × ${entry.hMm}`}</td>
            <td className={cell}>{entry.qty}</td>
            <td className={cell}>{notesFor(entry, plan.rotationAllowed).join('; ')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

**Step 3: `CuttingPlanDrawing.tsx`**

Colours come from `currentColor`, so the parent sets navy on screen and black in print.

```tsx
import type { CuttingPlan } from '../../calculators/board-cutting';

export function CuttingPlanDrawing({ plan }: { plan: CuttingPlan }) {
  const { sheet, layouts } = plan;
  const boardName = sheet.crossCutOnly ? 'Worktop' : 'Sheet';
  const maxLabel = Math.min(sheet.wMm, sheet.hMm) / 5;

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 print:grid-cols-3">
      {layouts.map((layout, i) => (
        <figure key={i} className="m-0 break-inside-avoid">
          <svg
            viewBox={`0 0 ${sheet.wMm} ${sheet.hMm}`}
            className="block h-72 w-auto mx-auto print:h-[85mm]"
            role="img"
            aria-label={`${boardName} ${i + 1}: pieces ${layout.pieces.map((p) => p.ref).join(', ')}`}
          >
            <rect x={0} y={0} width={sheet.wMm} height={sheet.hMm} fill="none" stroke="currentColor" strokeWidth={sheet.wMm / 120} />
            {layout.pieces.map((p, j) => (
              <g key={j}>
                <rect
                  x={p.xMm}
                  y={p.yMm}
                  width={p.wMm}
                  height={p.hMm}
                  fill="currentColor"
                  fillOpacity={0.12}
                  stroke="currentColor"
                  strokeWidth={sheet.wMm / 240}
                />
                <text
                  x={p.xMm + p.wMm / 2}
                  y={p.yMm + p.hMm / 2}
                  fill="currentColor"
                  fontSize={Math.min(maxLabel, p.wMm * 0.6, p.hMm * 0.6)}
                  fontWeight={700}
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  {p.ref}
                </text>
              </g>
            ))}
          </svg>
          <figcaption className="mt-2 text-center text-xs font-bold">
            {`${boardName} ${i + 1} of ${layouts.length}, ${Math.round(layout.utilisation * 100)}% used`}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
```

**Step 4: `PrintableCuttingSheet.tsx`**

```tsx
import type { CuttingPlan } from '../../calculators/board-cutting';
import { CutListTable } from './CutListTable';
import { CuttingPlanDrawing } from './CuttingPlanDrawing';
import { CuttingTerms } from './CuttingTerms';
import { SHEET_FOOTER, SIGN_OFF_STATEMENT, type Term } from './cutting-terms';

interface Props {
  plan: CuttingPlan;
  terms: Term[];
  printedAt: string;
}

/** Only visible in print. Rendered only when the plan is printable. */
export function PrintableCuttingSheet({ plan, terms, printedAt }: Props) {
  return (
    <section aria-label="Printable cutting sheet" className="hidden print:block text-black bg-white">
      <h1 className="text-2xl font-bold mb-3">Board cutting sheet</h1>

      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm mb-5">
        <dt className="font-bold">Board</dt>
        <dd className="m-0">{plan.sheet.label}</dd>
        <dt className="font-bold">Boards needed</dt>
        <dd className="m-0">{plan.layouts.length}</dd>
        <dt className="font-bold">Pieces may be turned</dt>
        <dd className="m-0">{plan.rotationAllowed ? 'Yes' : 'No'}</dd>
        <dt className="font-bold">Printed on</dt>
        <dd className="m-0">{printedAt}</dd>
      </dl>

      <CuttingPlanDrawing plan={plan} />

      <h2 className="text-lg font-bold mt-6 mb-2">Cut list</h2>
      <CutListTable plan={plan} />

      <h2 className="text-lg font-bold mt-6 mb-2">Please read before signing</h2>
      <CuttingTerms terms={terms} />

      <div className="break-inside-avoid mt-8 border-t border-black pt-4">
        <p className="font-bold text-sm">{SIGN_OFF_STATEMENT}</p>
        <div className="grid grid-cols-2 gap-8 mt-10 text-sm">
          <p className="m-0">Customer signature ______________________________</p>
          <p className="m-0">Date and time signed ____ / ____ / ______ ____ : ____</p>
        </div>
      </div>

      <p className="mt-8 text-xs">{SHEET_FOOTER}</p>
    </section>
  );
}
```

---

### Task 7: Calculator island (GREEN)

**Files:**
- Create: `src/components/board-cutting/BoardCuttingCalculator.tsx`

**Step 1: Write the implementation**

```tsx
import { useEffect, useState } from 'react';
import {
  MAX_PIECES,
  PANEL_SAW,
  SHEET_FORMATS,
  planCutting,
  validatePiece,
  type PieceInput,
  type SheetId,
} from '../../calculators/board-cutting';
import { FormField } from '../ui/FormField';
import { NumberInput } from '../ui/NumberInput';
import { ResultCard } from '../ui/ResultCard';
import { CutListTable } from './CutListTable';
import { CuttingPlanDrawing } from './CuttingPlanDrawing';
import { CuttingTerms } from './CuttingTerms';
import { PrintableCuttingSheet } from './PrintableCuttingSheet';
import { buildCuttingTerms } from './cutting-terms';

export interface PieceRow {
  w: string;
  h: string;
  qty: string;
}

interface Row extends PieceRow {
  key: number;
}

const selectClass =
  'block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm bg-white focus:border-selco-navy focus:outline-none focus:ring-1 focus:ring-selco-navy text-neutral-grey-800';

const formatNow = () => new Date().toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' });

/** A row with no width and no height yet hasn't been started, so it's ignored rather than flagged. */
const isBlank = (r: PieceRow) => r.w.trim() === '' && r.h.trim() === '';
const toPiece = (r: PieceRow): PieceInput => ({ wMm: Number(r.w), hMm: Number(r.h), qty: Number(r.qty) });

let nextKey = 0;
const withKey = (r: PieceRow): Row => ({ ...r, key: nextKey++ });

interface Props {
  initialRows?: PieceRow[];
}

export function BoardCuttingCalculator({ initialRows = [{ w: '', h: '', qty: '1' }] }: Props) {
  const [sheetId, setSheetId] = useState<SheetId>('sheet');
  const [allowRotation, setAllowRotation] = useState(true);
  const [rows, setRows] = useState<Row[]>(() => initialRows.map(withKey));
  // Set after mount and again as the print dialog opens, never at build time.
  const [printedAt, setPrintedAt] = useState('');

  useEffect(() => {
    const stamp = () => setPrintedAt(formatNow());
    stamp();
    window.addEventListener('beforeprint', stamp);
    return () => window.removeEventListener('beforeprint', stamp);
  }, []);

  const sheet = SHEET_FORMATS.find((s) => s.id === sheetId)!;
  const filled = rows.filter((r) => !isBlank(r));
  const inputError = new Map(filled.map((r) => [r.key, validatePiece(toPiece(r))]));
  const inputsValid = filled.every((r) => inputError.get(r.key) === null);

  const plan = inputsValid && filled.length > 0
    ? planCutting({ sheetId, pieces: filled.map(toPiece), allowRotation })
    : null;

  const refOf = (row: Row) => {
    const i = filled.indexOf(row);
    return i === -1 ? '' : String.fromCharCode(65 + i);
  };
  const rowError = (row: Row): string | null => {
    const i = filled.indexOf(row);
    if (i === -1) return null;
    return inputError.get(row.key) ?? (plan && !plan.cutList[i].fits ? 'Too big for this board' : null);
  };

  const hasErrors = filled.some((r) => rowError(r) !== null);
  const printBlockedReason =
    filled.length === 0
      ? 'Add at least one piece before printing.'
      : hasErrors
        ? 'Fix the highlighted pieces before printing.'
        : null;
  const terms = plan ? buildCuttingTerms(plan) : null;

  const update = (key: number, patch: Partial<PieceRow>) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const remove = (key: number) => setRows((rs) => rs.filter((r) => r.key !== key));
  const add = () => setRows((rs) => [...rs, withKey({ w: '', h: '', qty: '1' })]);

  const piecesPlaced = plan ? plan.layouts.reduce((n, l) => n + l.pieces.length, 0) : 0;

  return (
    <div className="space-y-8">
      <div className="space-y-8 print:hidden">
        <form onSubmit={(e) => e.preventDefault()} noValidate className="card space-y-5" aria-label="Board cutting optimiser">
          <FormField id="board-type" label="Board type">
            <select value={sheetId} onChange={(e) => setSheetId(e.target.value as SheetId)} className={selectClass}>
              {SHEET_FORMATS.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </FormField>

          <p className="text-sm text-text-muted m-0">
            {`Straight cuts on a vertical panel saw with a ${PANEL_SAW.kerfMm} mm blade. The smallest piece it can cut is ${PANEL_SAW.minLongMm} × ${PANEL_SAW.minShortMm} mm.`}
          </p>

          {sheet.crossCutOnly ? (
            <p className="text-sm text-text-muted m-0">Worktops are cut to length only, never along their length.</p>
          ) : (
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-selco-navy">
                <input type="checkbox" checked={allowRotation} onChange={(e) => setAllowRotation(e.target.checked)} />
                Pieces may be turned to fit
              </label>
              <p className="text-sm text-gray-500 m-0 mt-1">Untick if grain or pattern direction matters.</p>
            </div>
          )}

          <fieldset className="space-y-3">
            <legend className="text-sm font-bold text-selco-navy mb-2">Pieces (mm)</legend>
            <ul className="list-none m-0 p-0 space-y-3">
              {rows.map((row) => {
                const ref = refOf(row);
                const error = rowError(row);
                const name = ref ? `piece ${ref}` : 'new piece';
                const errorId = `piece-${row.key}-error`;
                const invalid = { 'aria-invalid': error !== null, 'aria-describedby': error ? errorId : undefined };
                return (
                  <li key={row.key}>
                    <div className="grid grid-cols-[1.5rem_1fr_1fr_4.5rem_2.75rem] gap-2 items-center">
                      <span className="font-bold text-brand-navy" aria-hidden="true">{ref}</span>
                      <NumberInput aria-label={`Width of ${name}`} unit="mm" min="1" value={row.w} onChange={(e) => update(row.key, { w: e.target.value })} {...invalid} />
                      <NumberInput aria-label={`Height of ${name}`} unit="mm" min="1" value={row.h} onChange={(e) => update(row.key, { h: e.target.value })} {...invalid} />
                      <NumberInput aria-label={`Quantity of ${name}`} min="1" max="50" step="1" value={row.qty} onChange={(e) => update(row.key, { qty: e.target.value })} {...invalid} />
                      <button type="button" aria-label={`Remove ${name}`} onClick={() => remove(row.key)} className="btn-ghost !min-w-0 !px-0">
                        ×
                      </button>
                    </div>
                    {error && (
                      <p id={errorId} className="text-sm text-error-red font-medium m-0 mt-1">{error}</p>
                    )}
                  </li>
                );
              })}
            </ul>
            <button type="button" onClick={add} disabled={rows.length >= MAX_PIECES} className="btn-ghost">
              Add another piece
            </button>
          </fieldset>
        </form>

        {plan && (
          <section aria-label="Cutting plan" className="space-y-6">
            <ResultCard
              title="Estimated boards needed"
              quantity={plan.layouts.length}
              unit={sheet.crossCutOnly ? 'worktops' : 'sheets'}
              detail={`${piecesPlaced} pieces planned with a ${PANEL_SAW.kerfMm} mm blade allowance between cuts`}
            />
            <div className="card text-brand-navy">
              <CuttingPlanDrawing plan={plan} />
            </div>
            <div className="card overflow-x-auto">
              <CutListTable plan={plan} />
            </div>
          </section>
        )}

        {terms && (
          <section aria-label="Terms the customer signs" className="card space-y-3">
            <h2 className="text-lg font-bold text-brand-navy m-0">Terms the customer signs</h2>
            <p className="text-sm text-text-muted m-0">Go through these with the customer before printing.</p>
            <CuttingTerms terms={terms} />
          </section>
        )}

        <div className="space-y-2">
          <button
            type="button"
            className="btn-accent"
            disabled={printBlockedReason !== null}
            aria-describedby={printBlockedReason ? 'print-status' : undefined}
            onClick={() => window.print()}
          >
            Print cutting sheet
          </button>
          {printBlockedReason && (
            <p id="print-status" className="text-sm text-text-muted m-0">{printBlockedReason}</p>
          )}
        </div>
      </div>

      {plan && terms && printBlockedReason === null ? (
        <PrintableCuttingSheet plan={plan} terms={terms} printedAt={printedAt} />
      ) : (
        <p className="hidden print:block">Fix the pieces on screen before printing this sheet.</p>
      )}
    </div>
  );
}
```

**Step 2: Run the component tests**

Run: `PATH="$HOME/.nvm/versions/node/v22.21.1/bin:$PATH" npx vitest run src/components/board-cutting`
Expected: PASS for `BoardCuttingCalculator.test.tsx` and `cutting-terms.test.ts`.

If the timestamp test fails on the format, print `new Date(2026, 8, 14, 21, 50).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })` in Node 22 and match the test to the actual ICU output. Don't change the format to suit the test.

**Step 3: Commit**

```bash
git add src/components/board-cutting/BoardCuttingCalculator.tsx src/components/board-cutting/CuttingTerms.tsx src/components/board-cutting/CutListTable.tsx src/components/board-cutting/CuttingPlanDrawing.tsx src/components/board-cutting/PrintableCuttingSheet.tsx
git commit -m "feat: board cutting calculator with on-screen terms and printable sheet (TDD GREEN)"
```

---

### Task 8: Route, registry and print styles

**Files:**
- Modify: `src/projects/registry.ts` (append an entry)
- Create: `src/pages/projects/board-cutting/index.astro`

**Step 1: Add the registry entry**

Append to `projectRegistry` in `src/projects/registry.ts`:

```ts
  {
    id: 'board-cutting',
    title: 'Board Cutting Optimiser',
    blurb: "Plan a customer's cuts onto boards and print a cutting sheet to sign.",
    route: '/projects/board-cutting',
    category: 'Handy Calculators',
  },
```

The registry test caps blurbs at 80 characters; this one is 70.

**Step 2: Create the page**

```astro
---
import BaseLayout from '../../../layouts/BaseLayout.astro';
import { projectRegistry } from '../../../projects/registry';
import { BoardCuttingCalculator } from '../../../components/board-cutting/BoardCuttingCalculator';

const project = projectRegistry.find(p => p.id === 'board-cutting');
const baseUrl = import.meta.env.BASE_URL;
---

<BaseLayout title={project?.title || 'Board Cutting Optimiser'} description={project?.blurb}>
  <Fragment slot="breadcrumb">
    <a href={baseUrl}>Home</a><span>/</span><span class="current">{project?.title}</span>
  </Fragment>

  <div class="max-w-5xl">
    <div class="page-intro">
      <h1 class="text-3xl md:text-4xl font-bold text-brand-navy mb-4">{project?.title}</h1>
      <p class="text-lg text-text-muted mb-8">{project?.blurb}</p>
    </div>

    <BoardCuttingCalculator client:load />

    <p class="page-intro text-sm text-text-muted mt-8">
      This is an estimate to plan the job with the customer, not a guarantee of how the boards
      will cut. Go through the terms with them and get the sheet signed before any board is cut.
    </p>
  </div>
</BaseLayout>

<style is:global>
  @page {
    size: A4;
    margin: 12mm;
  }
  @media print {
    .tmc-header,
    .tmc-footer,
    .breadcrumbs,
    .page-intro {
      display: none !important;
    }
    body {
      background: #fff !important;
    }
    main {
      padding: 0 !important;
      max-width: none !important;
    }
  }
</style>
```

**Step 3: Type check, test and build**

Run:
```bash
PATH="$HOME/.nvm/versions/node/v22.21.1/bin:$PATH" npx vitest run
PATH="$HOME/.nvm/versions/node/v22.21.1/bin:$PATH" npx astro check
PATH="$HOME/.nvm/versions/node/v22.21.1/bin:$PATH" npm run build
PATH="$HOME/.nvm/versions/node/v22.21.1/bin:$PATH" npm run lint:tokens
```
Expected: all tests pass, 0 type errors, `dist/projects/board-cutting/index.html` built, token check passes.

**Step 4: Commit**

```bash
git add src/projects/registry.ts src/pages/projects/board-cutting/index.astro
git commit -m "feat: board cutting optimiser page with A4 print styles"
```

---

### Task 9: Point the catalogue card at the rebuilt page

**Files:**
- Modify: `public/index.html` (single minified line; edit with a script, not by hand)

**Step 1: Repoint and reword the card**

```bash
python3 - <<'EOF'
p = 'public/index.html'
s = open(p, encoding='utf-8').read()
start_tag = '<a href="/selco/board-cutting/" class="group card'
assert s.count(start_tag) == 1, s.count(start_tag)
i = s.index(start_tag)
j = s.index('</a>', i) + len('</a>')
card = s[i:j]
old_blurb = 'Enter the pieces the customer needs and they&#39;re fitted onto the fewest sheets, planned around a typical in-store panel saw.'
new_blurb = 'Enter the customer&#39;s pieces, plan them onto the fewest boards and print a cutting sheet for them to sign.'
old_tag = 'In-store cutting plan, drawn to scale'
new_tag = 'Printable cutting sheet with sign-off'
assert card.count(old_blurb) == 1 and card.count(old_tag) == 1
card = card.replace(old_blurb, new_blurb).replace(old_tag, new_tag)
card = card.replace('href="/selco/board-cutting/"', 'href="/selco/projects/board-cutting/"', 1)
open(p, 'w', encoding='utf-8').write(s[:i] + card + s[j:])
print('ok')
EOF
grep -o 'href="/selco/projects/board-cutting/"' public/index.html
```
Expected: `ok` and one matching href.

**Step 2: Commit**

```bash
git add public/index.html
git commit -m "feat: point the catalogue board cutting card at the rebuilt optimiser"
```

---

### Task 10: Real print check (no commit)

Verify the A4 output in Chrome. The page starts blank, so use a temporary page with pieces filled in, and delete it afterwards.

**Step 1: Create a temporary check page**

`src/pages/print-check.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { BoardCuttingCalculator } from '../components/board-cutting/BoardCuttingCalculator';
---
<BaseLayout title="Print check">
  <BoardCuttingCalculator
    client:load
    initialRows={[
      { w: '800', h: '600', qty: '4' },
      { w: '1200', h: '400', qty: '2' },
      { w: '600', h: '400', qty: '6' },
      { w: '400', h: '300', qty: '2' },
    ]}
  />
</BaseLayout>
<style is:global>
  @page { size: A4; margin: 12mm; }
  @media print { .tmc-header, .tmc-footer, .breadcrumbs { display: none !important; } body { background: #fff !important; } main { padding: 0 !important; max-width: none !important; } }
</style>
```

**Step 2: Build, serve and print to PDF**

```bash
PATH="$HOME/.nvm/versions/node/v22.21.1/bin:$PATH" npm run build
(PATH="$HOME/.nvm/versions/node/v22.21.1/bin:$PATH" npx astro preview --port 4339 >/dev/null 2>&1 &)
sleep 3
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
  --virtual-time-budget=5000 --no-pdf-header-footer \
  --print-to-pdf="$SCRATCHPAD/cutting-sheet.pdf" "http://localhost:4339/selco/print-check/"
pkill -f "astro preview --port 4339"
```

**Step 3: Review the PDF**

Read `cutting-sheet.pdf` and confirm:
- A4 pages, no site header, footer, breadcrumbs, inputs or buttons
- Heading, job summary with a "Printed on" date and time
- Every sheet drawing labelled with letters, none split across pages
- Cut list rows A to D, with D noted as below the saw minimum
- Ten terms, term 7 naming piece D, ±3 mm in term 2
- Signature block with the sign-off statement, customer signature, and date and time lines, not split
- Footer line

Fix anything wrong in the components (with a test where the behaviour is testable), re-run Task 8 Step 3, and commit the fix.

**Step 4: Remove the temporary page**

```bash
rm src/pages/print-check.astro
git status --short
```
Expected: no untracked `print-check.astro`, nothing else changed.

---

## Done when

- All tests pass, `astro check` shows 0 errors, build and token lint are clean
- `/projects/board-cutting/` plans pieces, flags bad rows, shows the terms and blocks printing until the pieces are valid
- The printed A4 sheet matches the approved wording in the design document
- The catalogue card links to the rebuilt page; `/board-cutting/` still loads
