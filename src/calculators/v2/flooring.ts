/**
 * @file src/calculators/v2/flooring.ts
 *
 * Hard flooring estimator, v2 rebuild of the v1 flagship.
 *
 * Plans plank rows across the room (with the stagger a fitter would use),
 * then quantifies packs, underlay, beading, thresholds and the expansion
 * kit. Pack coverage varies by floor type.
 */

import type { BillOfMaterials } from './types';
import { fmtM2, units } from './types';

export interface FloorType {
    id: string;
    label: string;
    plankMm: { w: number; l: number };
    packM2: number;
    productName: string;
}

export const FLOOR_TYPES: FloorType[] = [
    {
        id: 'laminate8',
        label: 'Laminate 8mm',
        plankMm: { w: 192, l: 1285 },
        packM2: 2.26,
        productName: 'Krono 8 mm laminate (e.g. Rockford or Harlech Oak)',
    },
    {
        id: 'laminate12',
        label: 'Laminate 12mm',
        plankMm: { w: 192, l: 1285 },
        packM2: 1.51,
        productName: 'Krono Eurohome 12 mm laminate (e.g. Dartmoor Oak)',
    },
    {
        id: 'lvt',
        label: 'LVT / SPC',
        plankMm: { w: 180, l: 1220 },
        packM2: 2.17,
        productName: 'SPC rigid vinyl click plank (e.g. Farmhouse Oak)',
    },
    {
        id: 'engineered',
        label: 'Eng. wood',
        plankMm: { w: 190, l: 1900 },
        packM2: 2.17,
        productName: 'Engineered oak click plank',
    },
];

export interface FlooringInput {
    widthM: number;
    lengthM: number;
    floorId: string;
    /** Concrete subfloors need a vapour barrier. */
    concreteSubfloor: boolean;
    /** Number of doorways needing threshold bars. */
    doorways: number;
}

export interface FlooringPlan {
    areaM2: number;
    floor: FloorType;
    /** Rows of planks across the room width. */
    rows: number;
    /** Planks per full row along the length. */
    planksPerRow: number;
    packs: number;
}

const WASTE = 0.08;

export function planFlooring(input: FlooringInput): FlooringPlan {
    const floor = FLOOR_TYPES.find((f) => f.id === input.floorId) ?? FLOOR_TYPES[0];
    const rows = Math.max(1, Math.ceil((input.widthM * 1000) / floor.plankMm.w));
    const planksPerRow = Math.max(1, Math.ceil((input.lengthM * 1000) / floor.plankMm.l));
    const areaM2 = input.widthM * input.lengthM;
    return {
        areaM2,
        floor,
        rows,
        planksPerRow,
        packs: units((areaM2 * (1 + WASTE)) / floor.packM2),
    };
}

export function calculateFlooring(input: FlooringInput): BillOfMaterials {
    const plan = planFlooring(input);
    const a = plan.areaM2;
    const perimeter = 2 * (input.widthM + input.lengthM);
    const doorways = Math.round(input.doorways);
    const lvt = plan.floor.id === 'lvt';

    return {
        facts: [
            { label: 'Floor area', value: fmtM2(a) },
            { label: 'Floor type', value: plan.floor.label },
            { label: 'Layout', value: `${plan.rows} rows × ~${plan.planksPerRow} planks` },
            { label: 'Packs', value: `${plan.packs} inc. 8% cuts` },
        ],
        sections: [
            {
                title: 'Flooring',
                lines: [
                    {
                        id: 'packs',
                        name: plan.floor.productName,
                        detail: `${plan.floor.packM2} m² per pack, inc. 8% cutting waste`,
                        qty: plan.packs,
                        unit: 'packs',
                    },
                    {
                        id: 'underlay',
                        name: lvt
                            ? 'Timbertech Elite acoustic underlay (LVT-rated)'
                            : 'Vapour barrier foam underlay',
                        detail: lvt ? '10 m² per roll' : '15 m² per roll, built-in DPM',
                        qty: units((a * 1.05) / (lvt ? 10 : 15)),
                        unit: 'rolls',
                    },
                    ...(input.concreteSubfloor && !lvt
                        ? [
                              {
                                  id: 'dpm',
                                  name: 'Polythene vapour barrier (or combi underlay)',
                                  detail: 'concrete subfloors, laps taped 200 mm',
                                  qty: units((a * 1.15) / 25),
                                  unit: 'rolls',
                              },
                          ]
                        : []),
                ],
            },
            {
                title: 'Edges & thresholds',
                lines: [
                    {
                        id: 'beading',
                        name: 'Matching scotia beading, 2.4 m',
                        detail: 'covers the expansion gap at skirtings',
                        qty: units((perimeter - doorways * 0.8) / 2.4),
                        unit: 'lengths',
                    },
                    ...(doorways > 0
                        ? [
                              {
                                  id: 'thresholds',
                                  name: 'Threshold / door bar, 900 mm',
                                  detail: 'ramp or T-bar to suit adjoining floor',
                                  qty: doorways,
                                  unit: 'bars',
                              },
                          ]
                        : []),
                    {
                        id: 'spacers',
                        name: 'Expansion spacer & fitting kit',
                        detail: '10 mm wedges + tapping block + pull bar',
                        qty: 1,
                        unit: 'kits',
                    },
                ],
            },
        ],
        tools: [
            'Mitre saw or fine-tooth handsaw, cut laminate face-up by hand, face-down on a power saw',
            'Jigsaw for radiator pipes and door frame scribes',
            'Tapping block and pull bar (in the fitting kit), never hammer the click joint directly',
            'Undercut saw or multi-tool to trim door casings so planks slide under',
            'Sharp knife for the underlay and a roll of underlay tape',
            'Decorators caulk to finish the scotia after fitting',
        ],
        notes: [
            'Acclimatise packs flat in the room for 48 hours before laying.',
            'Stagger end joints at least 300 mm row to row; never let joints line up.',
            '10 mm expansion gap at every wall and fixed point, the floor floats, nothing screws through it.',
        ],
    };
}
