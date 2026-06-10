/**
 * @file src/calculators/v2/decking.ts
 *
 * Decking estimator — v2 rebuild of the v1 flagship.
 *
 * Boards run across the deck width; joists run perpendicular at 400 mm
 * centres on a supported sub-frame. Supports (deck blocks or posts) sit on
 * a ~1.2 m grid under the joists.
 */

import type { BillOfMaterials } from './types';
import { fmtM2, units } from './types';

export interface DeckingInput {
    widthM: number;
    lengthM: number;
    /** Composite boards instead of treated softwood. */
    composite: boolean;
    /** Raised deck on posts vs ground-level on deck blocks. */
    raised: boolean;
}

const BOARD_W_M = 0.144;
const BOARD_GAP_M = 0.006;
const BOARD_LEN_M = 3.6;
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
    const rows = Math.max(1, Math.ceil(input.widthM / (BOARD_W_M + BOARD_GAP_M)));
    const boardLm = rows * input.lengthM * 1.05;
    const joistCount = Math.ceil(input.lengthM / JOIST_CENTRES_M) + 1;
    const joistLm = joistCount * input.widthM + 2 * input.lengthM; // + ringbeam
    const supportsPerJoist = Math.ceil(input.widthM / SUPPORT_GRID_M) + 1;
    const supportJoists = Math.ceil(input.lengthM / SUPPORT_GRID_M) + 1;
    return {
        areaM2: input.widthM * input.lengthM,
        rows,
        boards: units(boardLm / BOARD_LEN_M),
        joistCount,
        joistLengths: units((joistLm * 1.05) / JOIST_LEN_M),
        supports: supportsPerJoist * supportJoists,
        screws: rows * joistCount * 2,
    };
}

export function calculateDecking(input: DeckingInput): BillOfMaterials {
    const plan = planDecking(input);

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
                        name: input.composite
                            ? 'Composite deck board, 146 × 25 mm'
                            : 'UC4 treated softwood deck board, 144 × 28 mm',
                        detail: '3.6 m lengths — inc. 5% cuts',
                        qty: plan.boards,
                        unit: 'boards',
                    },
                    {
                        id: 'screws',
                        name: input.composite
                            ? 'Composite hidden fixing clips'
                            : 'Green-coated decking screws, 64 mm',
                        detail: input.composite ? 'pack of 100 inc. screws' : 'box of 200 — 2 per board/joist crossing',
                        qty: units(plan.screws / (input.composite ? 100 : 200)),
                        unit: input.composite ? 'packs' : 'boxes',
                    },
                    {
                        id: 'fascia',
                        name: input.composite ? 'Composite fascia board, 3.6 m' : 'Treated fascia / edging board, 3.6 m',
                        detail: 'around the visible edges',
                        qty: units((2 * (input.widthM + input.lengthM)) / 3.6),
                        unit: 'boards',
                    },
                ],
            },
            {
                title: 'Sub-frame',
                lines: [
                    {
                        id: 'joists',
                        name: 'UC4 treated joist, 47 × 100 mm',
                        detail: '3.6 m lengths — joists + ringbeam, 5% over',
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
                                  name: 'UC4 treated post, 100 × 100 mm × 2.4 m',
                                  detail: 'cut down — one per support point',
                                  qty: units(plan.supports / 2),
                                  unit: 'posts',
                              },
                              {
                                  id: 'postfix',
                                  name: 'Fast-set post-fixing concrete',
                                  detail: '20 kg bag — one per post',
                                  qty: units(plan.supports / 2),
                                  unit: 'bags',
                              },
                          ]
                        : [
                              {
                                  id: 'blocks',
                                  name: 'Concrete deck support blocks',
                                  detail: 'on a 1.2 m grid under the joists',
                                  qty: plan.supports,
                                  unit: 'blocks',
                              },
                          ]),
                    {
                        id: 'membrane',
                        name: 'Weed control membrane',
                        detail: '1 m × 15 m roll under the deck',
                        qty: units((plan.areaM2 * 1.1) / 15),
                        unit: 'rolls',
                    },
                ],
            },
        ],
        tools: [
            'Mitre saw and a combi drill with long driver bits',
            'String lines, pegs and a 1.2 m level — square the frame with the 3-4-5 rule',
            'End-grain preserver for every cut on treated timber',
            'Joist hangers and bolts if fixing a ledger to the house (plus DPC strip behind it)',
            'Decking board spacers (6 mm) for even gaps',
            'Knee pads and a chalk line for the screw rows',
        ],
        notes: [
            'Fall the deck ~1:100 along the boards so water runs off the grooves.',
            'Boards laid ridge-side up with 6 mm gaps; pre-drill near board ends.',
            'Keep the frame 150 mm below any door threshold and clear of the DPC.',
        ],
    };
}
