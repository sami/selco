/**
 * @file src/calculators/v2/boards.ts
 *
 * Board & sheet coverage estimator — v2 rebuild of the v1 handy tool.
 *
 * Lays sheets over a wall/floor/ceiling area as a grid (the way they get
 * fixed), counts whole sheets including cut edges, and adds the fixings
 * and joint materials each board family needs.
 */

import type { BillOfMaterials } from './types';
import { fmtM2, units } from './types';

export interface BoardFormat {
    id: string;
    label: string;
    productName: string;
    wMm: number;
    hMm: number;
    fixing: { name: string; detail: string; perBoard: number; perBox: number };
}

export const BOARD_FORMATS: BoardFormat[] = [
    {
        id: 'plasterboard',
        label: 'Plasterboard',
        productName: 'Plasterboard, 12.5 mm',
        wMm: 1200,
        hMm: 2400,
        fixing: { name: 'Drywall screws, 38 mm', detail: 'box of 500', perBoard: 30, perBox: 500 },
    },
    {
        id: 'plywood',
        label: 'Plywood',
        productName: 'Hardwood-faced plywood, 18 mm',
        wMm: 1220,
        hMm: 2440,
        fixing: { name: 'Wood screws, 4 × 40 mm', detail: 'box of 200', perBoard: 24, perBox: 200 },
    },
    {
        id: 'osb',
        label: 'OSB3',
        productName: 'OSB3 board, 18 mm',
        wMm: 1220,
        hMm: 2440,
        fixing: { name: 'Wood screws, 4 × 50 mm', detail: 'box of 200', perBoard: 24, perBox: 200 },
    },
    {
        id: 'backer',
        label: 'Backer board',
        productName: 'Cement backer board, 12 mm',
        wMm: 1200,
        hMm: 800,
        fixing: { name: 'Backer board screws', detail: 'box of 200', perBoard: 15, perBox: 200 },
    },
];

export interface BoardsInput {
    widthM: number;
    heightM: number;
    boardId: string;
    /** Lay sheets landscape (long edge horizontal). */
    landscape: boolean;
}

export interface BoardsPlan {
    areaM2: number;
    board: BoardFormat;
    cols: number;
    rows: number;
    boards: number;
    /** Sheet size as laid, metres. */
    sheetW: number;
    sheetH: number;
}

export function planBoards(input: BoardsInput): BoardsPlan {
    const board = BOARD_FORMATS.find((b) => b.id === input.boardId) ?? BOARD_FORMATS[0];
    const sheetW = (input.landscape ? board.hMm : board.wMm) / 1000;
    const sheetH = (input.landscape ? board.wMm : board.hMm) / 1000;
    const cols = Math.max(1, Math.ceil(input.widthM / sheetW));
    const rows = Math.max(1, Math.ceil(input.heightM / sheetH));
    return {
        areaM2: input.widthM * input.heightM,
        board,
        cols,
        rows,
        boards: units(cols * rows * 1.05),
        sheetW,
        sheetH,
    };
}

export function calculateBoards(input: BoardsInput): BillOfMaterials {
    const plan = planBoards(input);
    const b = plan.board;
    const isPb = b.id === 'plasterboard';
    const isBacker = b.id === 'backer';

    return {
        facts: [
            { label: 'Area to cover', value: fmtM2(plan.areaM2) },
            { label: 'Sheet', value: `${b.label} ${b.wMm} × ${b.hMm}` },
            { label: 'Grid', value: `${plan.cols} × ${plan.rows} sheets` },
            { label: 'Sheets', value: `${plan.boards} inc. 5% cuts` },
        ],
        sections: [
            {
                title: 'Boards & fixings',
                lines: [
                    {
                        id: 'boards',
                        name: b.productName,
                        detail: `${b.wMm} × ${b.hMm} mm — laid ${input.landscape ? 'landscape' : 'portrait'}`,
                        qty: plan.boards,
                        unit: 'sheets',
                    },
                    {
                        id: 'fixings',
                        name: b.fixing.name,
                        detail: `${b.fixing.detail} — ~${b.fixing.perBoard} per sheet`,
                        qty: units((plan.boards * b.fixing.perBoard) / b.fixing.perBox),
                        unit: 'boxes',
                    },
                    ...(isPb
                        ? [
                              {
                                  id: 'scrim',
                                  name: 'Self-adhesive scrim tape',
                                  detail: '90 m roll for the joints',
                                  qty: units(plan.areaM2 / 30),
                                  unit: 'rolls',
                              },
                              {
                                  id: 'filler',
                                  name: 'Jointing & filling compound (60 min)',
                                  detail: '10 kg bag — joints and screw heads',
                                  qty: units(plan.areaM2 / 15),
                                  unit: 'bags',
                              },
                          ]
                        : []),
                    ...(isBacker
                        ? [
                              {
                                  id: 'tape',
                                  name: 'Alkaline-resistant joint tape',
                                  detail: 'cement board joints before tiling',
                                  qty: units(plan.areaM2 / 20) || 1,
                                  unit: 'rolls',
                              },
                          ]
                        : []),
                ],
            },
        ],
        tools: [
            isPb ? 'Drywall saw, rasp and a board lifter for ceilings' : 'Circular saw with a guide rail (TCT blade) and trestles',
            'Tape measure, pencil and a 1.2 m straight edge — measure twice, cut once',
            isPb ? 'Drywall screw gun with a depth stop' : 'Combi drill with countersink bit',
            'Stud detector / chalk line to mark the fixing lines',
            isBacker ? 'Score-and-snap knife — backer board cuts like plasterboard, just harder' : 'Dust mask and eye protection when cutting',
            'A second pair of hands — full sheets are a two-person lift',
        ],
        notes: [
            'Stagger sheet joints row to row; never four corners meeting at one point.',
            isPb
                ? 'Screws just dimple the paper without tearing it, 150 mm centres at edges.'
                : 'Leave 2–3 mm expansion gaps between structural sheets.',
            'The 5% cut allowance suits plain areas — add more around openings and angles.',
        ],
    };
}
