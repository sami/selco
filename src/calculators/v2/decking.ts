/**
 * @file src/calculators/v2/decking.ts
 *
 * Decking estimator, v2 rebuild of the v1 flagship.
 *
 * Boards run across the deck width; joists run perpendicular at 400 mm
 * centres on a supported sub-frame. Supports (deck blocks or posts) sit on
 * a ~1.2 m grid under the joists.
 *
 * The board is chosen from `DECK_BOARDS`, the real Selco decking range:
 * softwood Easi Deck and grooved treated boards in several widths and
 * stocked lengths, plus the Habitat+ and I-Series composite profiles. The
 * chosen board sets the row width, the board length, the fascia and the
 * fixing, so the bill follows whatever the customer picks rather than a
 * single hard-coded board.
 */

import type { BillOfMaterials } from './types';
import { fmtM2, units } from './types';

export type BoardMaterial = 'timber' | 'composite';

/** A decking board profile as Selco stocks it. */
export interface DeckBoard {
    id: string;
    /** Product name as it reads at the counter, without the length. */
    name: string;
    material: BoardMaterial;
    /** Hollow extrusion (lighter, cheaper) vs solid composite. */
    hollow?: boolean;
    widthMm: number;
    thicknessMm: number;
    /** Stocked lengths, metres. */
    lengthsM: number[];
    fascia: { name: string; lengthM: number };
    fixing: { name: string; detail: string; perPack: number; perCrossing: number };
}

const SCREW_FIXING = {
    name: 'Unifix green decking screws, 4 × 60 mm',
    detail: 'pack of 1000, 2 per board/joist crossing',
    perPack: 1000,
    perCrossing: 2,
};

const CLIP_FIXING = {
    name: 'Habitat+ composite deck hidden fixing clips',
    detail: 'stainless clip per board edge at each joist, pack of 100 with driver bit',
    perPack: 100,
    perCrossing: 1,
};

const TIMBER_FASCIA = { name: 'Treated fascia board, 150 × 22 mm', lengthM: 3.6 };
const HABITAT_FASCIA = { name: 'Habitat+ composite skirting/fascia trim, 100 × 15 mm', lengthM: 2.4 };
const ISERIES_FASCIA = { name: 'I-Series composite deck fascia board, 12 × 150 mm', lengthM: 2.2 };

/**
 * The stocked range. Widths and lengths are the Selco product sizes; the
 * customer's choice flows straight into the row count and the bill.
 */
export const DECK_BOARDS: DeckBoard[] = [
    {
        id: 'grooved-125-38',
        name: 'Grooved treated softwood deck board, 125 × 38 mm',
        material: 'timber',
        widthMm: 125,
        thicknessMm: 38,
        lengthsM: [3.0, 3.6, 4.2, 4.8],
        fascia: TIMBER_FASCIA,
        fixing: SCREW_FIXING,
    },
    {
        id: 'easi-100-32',
        name: 'Easi Deck softwood deck board, 100 × 32 mm',
        material: 'timber',
        widthMm: 100,
        thicknessMm: 32,
        lengthsM: [2.4, 3.0, 3.6, 4.2, 4.8],
        fascia: TIMBER_FASCIA,
        fixing: SCREW_FIXING,
    },
    {
        id: 'habitat-solid-135-22',
        name: 'Alchemy Habitat+ solid composite deck board, 135 × 22 mm',
        material: 'composite',
        widthMm: 135,
        thicknessMm: 22,
        lengthsM: [3.6],
        fascia: HABITAT_FASCIA,
        fixing: CLIP_FIXING,
    },
    {
        id: 'rydal-hollow-135-22',
        name: 'Hollow composite deck board Rydal Grey, 135 × 22 mm',
        material: 'composite',
        hollow: true,
        widthMm: 135,
        thicknessMm: 22,
        lengthsM: [3.6],
        fascia: HABITAT_FASCIA,
        fixing: CLIP_FIXING,
    },
    {
        id: 'iseries-135-25',
        name: 'I-Series 2-sided grooved composite deck board, 135 × 25.4 mm',
        material: 'composite',
        widthMm: 135,
        thicknessMm: 25.4,
        lengthsM: [4.8],
        fascia: ISERIES_FASCIA,
        fixing: CLIP_FIXING,
    },
];

/** Resolve a board by id, falling back to the first in the range. */
export function deckBoard(id: string): DeckBoard {
    return DECK_BOARDS.find((b) => b.id === id) ?? DECK_BOARDS[0];
}

export interface DeckingInput {
    widthM: number;
    lengthM: number;
    /** Which board from `DECK_BOARDS`. */
    boardId: string;
    /** Chosen board length, one of the board's stocked lengths (m). */
    boardLengthM: number;
    /** Raised deck on posts vs ground-level on deck blocks. */
    raised: boolean;
}

const BOARD_GAP_M = 0.006;
const JOIST_CENTRES_M = 0.4;
const JOIST_LEN_M = 3.6;
const SUPPORT_GRID_M = 1.2;

export interface DeckingPlan {
    areaM2: number;
    /** Board rows across the width. */
    rows: number;
    boards: number;
    /** Number of joists (run across the width, spaced along the length). */
    joistCount: number;
    joistLengths: number;
    supports: number;
    screws: number;
}

export function planDecking(input: DeckingInput): DeckingPlan {
    const board = deckBoard(input.boardId);
    const boardWidthM = board.widthMm / 1000;
    const boardLenM = input.boardLengthM || board.lengthsM[0];
    const rows = Math.max(1, Math.ceil(input.widthM / (boardWidthM + BOARD_GAP_M)));
    const boardLm = rows * input.lengthM * 1.05;
    const joistCount = Math.ceil(input.lengthM / JOIST_CENTRES_M) + 1;
    const joistLm = joistCount * input.widthM + 2 * input.lengthM; // + ringbeam
    const supportsPerJoist = Math.ceil(input.widthM / SUPPORT_GRID_M) + 1;
    const supportJoists = Math.ceil(input.lengthM / SUPPORT_GRID_M) + 1;
    return {
        areaM2: input.widthM * input.lengthM,
        rows,
        boards: units(boardLm / boardLenM),
        joistCount,
        joistLengths: units((joistLm * 1.05) / JOIST_LEN_M),
        supports: supportsPerJoist * supportJoists,
        screws: rows * joistCount * board.fixing.perCrossing,
    };
}

export function calculateDecking(input: DeckingInput): BillOfMaterials {
    const plan = planDecking(input);
    const board = deckBoard(input.boardId);
    const boardLenM = input.boardLengthM || board.lengthsM[0];

    return {
        facts: [
            { label: 'Deck area', value: fmtM2(plan.areaM2) },
            { label: 'Board rows', value: `${plan.rows} + 6 mm gaps` },
            { label: 'Joists', value: `${plan.joistCount} @ 400 mm centres` },
            { label: 'Supports', value: `${plan.supports} on a 1.2 m grid` },
        ],
        sections: [
            {
                title: 'Deck surface',
                lines: [
                    {
                        id: 'boards',
                        name: board.name,
                        detail: `${boardLenM.toFixed(1)} m lengths, inc. 5% cuts`,
                        qty: plan.boards,
                        unit: 'boards',
                    },
                    {
                        id: 'screws',
                        name: board.fixing.name,
                        detail: board.fixing.detail,
                        qty: units(plan.screws / board.fixing.perPack),
                        unit: 'packs',
                    },
                    {
                        id: 'fascia',
                        name: `${board.fascia.name} × ${board.fascia.lengthM.toFixed(1)} m`,
                        detail: 'around the visible edges',
                        qty: units((2 * (input.widthM + input.lengthM)) / board.fascia.lengthM),
                        unit: 'boards',
                    },
                ],
            },
            {
                title: 'Sub-frame',
                lines: [
                    {
                        id: 'joists',
                        name: 'Sawn treated C16 timber, 100 × 47 mm (4" × 2")',
                        detail: '3.6 m lengths, joists + ringbeam, 5% over',
                        qty: plan.joistLengths,
                        unit: 'lengths',
                    },
                    {
                        id: 'frame-screws',
                        name: 'Timber frame screws, 100 mm',
                        detail: 'box of 100',
                        qty: units((plan.joistCount * 6) / 100) || 1,
                        unit: 'boxes',
                    },
                    ...(input.raised
                        ? [
                              {
                                  id: 'posts',
                                  name: 'Incised fence post, treated 100 × 100 mm',
                                  detail: 'cut down, one per support point',
                                  qty: units(plan.supports / 2),
                                  unit: 'posts',
                              },
                              {
                                  id: 'postfix',
                                  name: 'Carlton Rapid Set fence post concrete',
                                  detail: '20 kg bag, two per post',
                                  qty: units(plan.supports),
                                  unit: 'bags',
                              },
                          ]
                        : [
                              {
                                  id: 'blocks',
                                  name: 'Dense concrete block 7N, 100 mm solid',
                                  detail: 'bedded flat on a 1.2 m grid under the joists',
                                  qty: plan.supports,
                                  unit: 'blocks',
                              },
                          ]),
                    {
                        id: 'membrane',
                        name: 'TDP50 weed control fabric',
                        detail: '1 m × 14 m roll under the deck',
                        qty: units((plan.areaM2 * 1.1) / 14),
                        unit: 'rolls',
                    },
                ],
            },
        ],
        tools: [
            'Mitre saw and a combi drill with long driver bits',
            'String lines, pegs and a 1.2 m level, square the frame with the 3-4-5 rule',
            'End-grain preserver for every cut on treated timber',
            'Joist hangers and bolts if fixing a ledger to the house (plus DPC strip behind it)',
            'Decking board spacers (6 mm) for even gaps',
            'Knee pads and a chalk line for the screw rows',
        ],
        notes: [
            'Fall the deck ~1:100 along the boards so water runs off the grooves.',
            'Boards laid ridge-side up with 6 mm gaps; pre-drill near board ends.',
            'Keep the frame 150 mm below any door threshold and clear of the DPC.',
            board.material === 'composite'
                ? 'Composite boards expand with heat: leave a 6 mm end gap and follow the Habitat+ joist-centre guidance for the board run.'
                : 'Treated softwood will silver over time; an annual coat of decking oil keeps the colour.',
        ],
    };
}
