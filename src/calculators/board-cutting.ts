/**
 * Board cutting optimiser: plans a customer's pieces onto standard boards
 * for a vertical panel saw (straight cuts only). Ported from the pre-reset
 * v2 engine (200e7f4).
 *
 * Boards are grouped by size, not material:
 *   - standard sheet, 2440 × 1220 mm, cut both ways: pieces are sorted longest
 *     side first, then by area; each goes on the existing row it fills best,
 *     else a new row, else a new sheet
 *   - worktop, 3000 × 600 × 38 mm, cut to length only: longest first, each on
 *     the first worktop with room, else a new worktop
 *
 * Neighbouring pieces, rows and worktop cuts are kept GAP_MM apart: the blade
 * plus room for a piece to come out up to the tolerance over. There is no gap
 * at a board edge.
 *
 * Pieces below the saw minimum are packed at the oversize they're cut at in
 * store, so the drawing and board count match what actually comes off the saw.
 *
 * Each board also carries the saw operator's plan: its strips (sheets only),
 * the numbered cut steps and the offcuts left over, at their smallest size.
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

/**
 * Space left between neighbouring pieces, rows and worktop cuts: the blade plus room for a piece to come out
 * up to the tolerance over, so it never runs the board out. The operator still cuts each piece to its size.
 */
export const GAP_MM = PANEL_SAW.kerfMm + TOLERANCE_MM;

/** Offcuts smaller than this in either direction are dust and aren't listed. */
export const MIN_OFFCUT_MM = 10;

export const MAX_QTY = 50;

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const MAX_PIECES = LETTERS.length;

export type SheetId = 'sheet' | 'worktop';

export interface SheetFormat {
  id: SheetId;
  label: string;
  /** Across the board, as drawn. For worktops this is the depth. */
  wMm: number;
  /** Along the board, as drawn. For worktops this is the length. */
  hMm: number;
  thicknessMm?: number;
  /** Cut to length only: no lengthways rips, so every piece takes the full width. */
  crossCutOnly: boolean;
}

export const SHEET_FORMATS: readonly SheetFormat[] = [
  { id: 'sheet', label: 'Standard sheet, 2440 × 1220 mm (ply, MDF, OSB, hardboard)', wMm: 1220, hMm: 2440, crossCutOnly: false },
  { id: 'worktop', label: 'Worktop, 3000 × 600 × 38 mm (cut to length only)', wMm: 600, hMm: 3000, thicknessMm: 38, crossCutOnly: true },
];

export interface PieceInput {
  /** Across the board, as drawn. For worktops this is the depth. */
  wMm: number;
  /** Along the board, as drawn. For worktops this is the length. */
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
  /** Finished size the customer asked for. */
  wMm: number;
  hMm: number;
  /**
   * Size cut in store, in the direction entered. Larger than the finished size for pieces below the saw
   * minimum; for worktops the width is always the full worktop width. Equal to the finished size for pieces
   * that don't fit the board.
   */
  cutWMm: number;
  /** Length of the in-store cut, paired with `cutWMm`. */
  cutHMm: number;
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
  /** Size as cut in store, which is larger than the finished size for pieces below the saw minimum. */
  wMm: number;
  hMm: number;
  rotated: boolean;
}

/** A strip cut across the full board width (sheets only), with its pieces in the order they are cut. */
export interface Strip {
  yMm: number;
  heightMm: number;
  /** Sorted by xMm. */
  pieces: PlacedPiece[];
}

export type CutStep =
  /** Cut a strip across the full board width, measured from the current board edge. */
  | { kind: 'strip'; step: number; strip: number; atMm: number }
  /** Cross-cut a piece off the strip; trimToMm set when the piece is shorter than its strip. */
  | { kind: 'piece'; step: number; strip: number; ref: string; atMm: number; trimToMm: number | null }
  /** Worktops: cut a piece to length. */
  | { kind: 'length'; step: number; ref: string; atMm: number };

export interface Offcut {
  xMm: number;
  yMm: number;
  /** Smallest size the customer gets, after the blade and tolerance gap. */
  wMm: number;
  hMm: number;
}

export interface SheetLayout {
  pieces: PlacedPiece[];
  /** Share of the board covered by pieces as cut, 0 to 1. */
  utilisation: number;
  /** Strips in the order they're cut, numbered from 1. Always empty for worktops. */
  strips: Strip[];
  /** The saw operator's steps, numbered 1, 2, 3… for this board. */
  cuts: CutStep[];
  /**
   * Offcuts of at least MIN_OFFCUT_MM both ways. Sheets list them per strip (above each trimmed piece in x
   * order, then the strip's right remainder), then below the last strip; worktops list the end offcut.
   */
  offcuts: Offcut[];
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
  if (!Number.isInteger(wMm) || !Number.isInteger(hMm) || wMm <= 0 || hMm <= 0) {
    return 'Enter a width and height in whole mm above 0';
  }
  if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
    return `Quantity must be a whole number from 1 to ${MAX_QTY}`;
  }
  return null;
}

function isBelowSawMinimum(wMm: number, hMm: number): boolean {
  return Math.max(wMm, hMm) < PANEL_SAW.minLongMm || Math.min(wMm, hMm) < PANEL_SAW.minShortMm;
}

interface Size {
  w: number;
  h: number;
}

/** The size the store actually cuts: oversize up to the saw minimum, keeping the piece's direction. */
function inStoreSize(p: PieceInput, sheet: SheetFormat): Size {
  if (sheet.crossCutOnly) {
    // Comes off at the full worktop width, so only the length can be under the minimum.
    return { w: sheet.wMm, h: Math.max(p.hMm, PANEL_SAW.minShortMm) };
  }
  const long = Math.max(Math.max(p.wMm, p.hMm), PANEL_SAW.minLongMm);
  const short = Math.max(Math.min(p.wMm, p.hMm), PANEL_SAW.minShortMm);
  return p.wMm >= p.hMm ? { w: long, h: short } : { w: short, h: long };
}

function describePiece(p: PieceInput, cut: Size, ref: string, sheet: SheetFormat, allowRotation: boolean): CutListEntry {
  if (sheet.crossCutOnly) {
    const fits = p.wMm <= sheet.wMm && p.hMm <= sheet.hMm;
    return {
      ref, wMm: p.wMm, hMm: p.hMm, qty: p.qty, fits,
      cutWMm: fits ? cut.w : p.wMm,
      cutHMm: fits ? cut.h : p.hMm,
      // Decided from the full-width shape the piece comes off the saw at; the
      // oversize length itself is applied in inStoreSize.
      belowMin: fits && isBelowSawMinimum(sheet.wMm, p.hMm),
      trimToWidth: fits && p.wMm < sheet.wMm,
    };
  }
  // Checked on the cut size on purpose, so a board smaller than the saw minimum stays correct (same answer on current boards).
  const fits =
    (cut.w <= sheet.wMm && cut.h <= sheet.hMm) ||
    (allowRotation && cut.h <= sheet.wMm && cut.w <= sheet.hMm);
  return {
    ref, wMm: p.wMm, hMm: p.hMm, qty: p.qty, fits,
    cutWMm: fits ? cut.w : p.wMm,
    cutHMm: fits ? cut.h : p.hMm,
    belowMin: fits && isBelowSawMinimum(p.wMm, p.hMm),
    trimToWidth: false,
  };
}

interface Orientation extends Size {
  rotated: boolean;
}

interface Shelf {
  yMm: number;
  heightMm: number;
  usedWMm: number;
  pieces: PlacedPiece[];
}

interface WorkingSheet {
  shelves: Shelf[];
  nextShelfY: number;
}

/** A packed board before its steps and offcuts are worked out. */
interface PackedBoard {
  pieces: PlacedPiece[];
  /** Sheets only, in the order they were opened, which is top to bottom. */
  shelves: Shelf[];
}

interface Instance extends Size {
  ref: string;
}

const place = (ref: string, xMm: number, yMm: number, o: Orientation): PlacedPiece => ({
  ref, xMm, yMm, wMm: o.w, hMm: o.h, rotated: o.rotated,
});

/** One instance per piece to cut, at its in-store size, for rows that fit the board. */
function instancesToCut(pieces: PieceInput[], cuts: Size[], cutList: CutListEntry[]): Instance[] {
  return pieces.flatMap((p, i) =>
    cutList[i].fits ? Array.from({ length: p.qty }, () => ({ ref: cutList[i].ref, ...cuts[i] })) : [],
  );
}

/**
 * Shelf packing with the blade and tolerance gap between pieces and rows, and
 * none at the board edges. Pieces are sorted longest side first, then by area;
 * each goes on the existing row it fills best, else a new row, else a new sheet.
 */
function packShelves(instances: Instance[], sheet: SheetFormat, allowRotation: boolean): PackedBoard[] {
  const gap = GAP_MM;
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
          const x = shelf.usedWMm + gap;
          if (o.h <= shelf.heightMm && x + o.w <= sheet.wMm) {
            const waste = shelf.heightMm - o.h;
            if (!best || waste < best.waste) best = { s, shelf, o, waste };
          }
        }
      }
    }
    if (best) {
      const x = best.shelf.usedWMm + gap;
      best.shelf.pieces.push(place(inst.ref, x, best.shelf.yMm, best.o));
      best.shelf.usedWMm = x + best.o.w;
      continue;
    }

    // 2. A new row on an existing sheet, flattest orientation first.
    const flattest = [...fitting].sort((a, b) => a.h - b.h);
    let placedOnSheet = false;
    for (const s of sheets) {
      for (const o of flattest) {
        const y = s.nextShelfY + gap;
        if (y + o.h <= sheet.hMm) {
          s.shelves.push({ yMm: y, heightMm: o.h, usedWMm: o.w, pieces: [place(inst.ref, 0, y, o)] });
          s.nextShelfY = y + o.h;
          placedOnSheet = true;
          break;
        }
      }
      if (placedOnSheet) break;
    }
    if (placedOnSheet) continue;

    // 3. A new sheet.
    const o = flattest[0];
    sheets.push({
      shelves: [{ yMm: 0, heightMm: o.h, usedWMm: o.w, pieces: [place(inst.ref, 0, 0, o)] }],
      nextShelfY: o.h,
    });
  }
  return sheets.map((s) => ({ shelves: s.shelves, pieces: s.shelves.flatMap((shelf) => shelf.pieces) }));
}

/** Cut-to-length packing: longest first, the blade and tolerance gap between cuts, full board width per piece. */
function packCrossCut(instances: Instance[], sheet: SheetFormat): PackedBoard[] {
  const gap = GAP_MM;
  instances.sort((a, b) => b.h - a.h);

  const boards: Array<{ usedMm: number; pieces: PlacedPiece[] }> = [];
  for (const inst of instances) {
    const o: Orientation = { w: inst.w, h: inst.h, rotated: false };
    const board = boards.find((b) => b.usedMm + gap + inst.h <= sheet.hMm);
    if (board) {
      const y = board.usedMm + gap;
      board.pieces.push(place(inst.ref, 0, y, o));
      board.usedMm = y + inst.h;
    } else {
      boards.push({ usedMm: inst.h, pieces: [place(inst.ref, 0, 0, o)] });
    }
  }
  return boards.map((b) => ({ pieces: b.pieces, shelves: [] }));
}

const usable = (o: Offcut) => o.wMm >= MIN_OFFCUT_MM && o.hMm >= MIN_OFFCUT_MM;

/** Sheets: cut each strip across the full width, then cross-cut its pieces in x order. */
function planSheetBoard(board: PackedBoard, sheet: SheetFormat): Pick<SheetLayout, 'strips' | 'cuts' | 'offcuts'> {
  const strips: Strip[] = board.shelves.map((shelf) => ({
    yMm: shelf.yMm,
    heightMm: shelf.heightMm,
    pieces: [...shelf.pieces].sort((a, b) => a.xMm - b.xMm),
  }));

  const cuts: CutStep[] = [];
  const offcuts: Offcut[] = [];
  const next = () => cuts.length + 1;

  strips.forEach((strip, i) => {
    const n = i + 1;
    if (strip.yMm + strip.heightMm < sheet.hMm) {
      cuts.push({ kind: 'strip', step: next(), strip: n, atMm: strip.heightMm });
    }
    for (const p of strip.pieces) {
      const trimToMm = p.hMm < strip.heightMm ? p.hMm : null;
      if (p.xMm + p.wMm === sheet.wMm && trimToMm === null) continue;
      cuts.push({ kind: 'piece', step: next(), strip: n, ref: p.ref, atMm: p.wMm, trimToMm });
    }

    for (const p of strip.pieces) {
      if (p.hMm < strip.heightMm) {
        offcuts.push({ xMm: p.xMm, yMm: p.yMm + p.hMm + GAP_MM, wMm: p.wMm, hMm: strip.heightMm - p.hMm - GAP_MM });
      }
    }
    const usedW = Math.max(...strip.pieces.map((p) => p.xMm + p.wMm));
    offcuts.push({ xMm: usedW + GAP_MM, yMm: strip.yMm, wMm: sheet.wMm - usedW - GAP_MM, hMm: strip.heightMm });
  });

  const last = strips.at(-1);
  if (last) {
    const end = last.yMm + last.heightMm;
    offcuts.push({ xMm: 0, yMm: end + GAP_MM, wMm: sheet.wMm, hMm: sheet.hMm - end - GAP_MM });
  }

  return { strips, cuts, offcuts: offcuts.filter(usable) };
}

/** Worktops: cut each piece to length, in order along the worktop. */
function planWorktopBoard(board: PackedBoard, sheet: SheetFormat): Pick<SheetLayout, 'strips' | 'cuts' | 'offcuts'> {
  const pieces = [...board.pieces].sort((a, b) => a.yMm - b.yMm);
  const cuts: CutStep[] = [];
  for (const p of pieces) {
    if (p.yMm + p.hMm === sheet.hMm) continue;
    cuts.push({ kind: 'length', step: cuts.length + 1, ref: p.ref, atMm: p.hMm });
  }
  const used = Math.max(0, ...pieces.map((p) => p.yMm + p.hMm));
  const end: Offcut = { xMm: 0, yMm: used + GAP_MM, wMm: sheet.wMm, hMm: sheet.hMm - used - GAP_MM };
  return { strips: [], cuts, offcuts: [end].filter(usable) };
}

/**
 * Plans the pieces onto boards.
 *
 * Throws for input that can't be planned: sizes that aren't whole mm above 0,
 * quantities outside 1 to MAX_QTY, an unknown board type, or more than 26 rows.
 * Only flags, and still plans the rest, for pieces too big for the board
 * (`unplaceableRefs`), below the saw minimum (`belowMinRefs`) or needing
 * trimming to width at home (`trimToWidthRefs`).
 */
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

  const cuts = input.pieces.map((p) => inStoreSize(p, sheet));
  const cutList = input.pieces.map((p, i) => describePiece(p, cuts[i], LETTERS[i], sheet, input.allowRotation));
  const instances = instancesToCut(input.pieces, cuts, cutList);
  const packed = sheet.crossCutOnly
    ? packCrossCut(instances, sheet)
    : packShelves(instances, sheet, input.allowRotation);

  const boardArea = sheet.wMm * sheet.hMm;
  const refsWhere = (test: (c: CutListEntry) => boolean) => cutList.filter(test).map((c) => c.ref);

  return {
    sheet,
    rotationAllowed: input.allowRotation && !sheet.crossCutOnly,
    cutList,
    layouts: packed.map((board) => ({
      pieces: board.pieces,
      utilisation: board.pieces.reduce((sum, p) => sum + p.wMm * p.hMm, 0) / boardArea,
      ...(sheet.crossCutOnly ? planWorktopBoard(board, sheet) : planSheetBoard(board, sheet)),
    })),
    unplaceableRefs: refsWhere((c) => !c.fits),
    belowMinRefs: refsWhere((c) => c.belowMin),
    trimToWidthRefs: refsWhere((c) => c.trimToWidth),
  };
}
