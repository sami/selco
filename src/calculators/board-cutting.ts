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
