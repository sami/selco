/**
 * @file src/calculators/v2/flooring.ts
 *
 * Hard flooring estimator, v2 rebuild of the v1 flagship.
 *
 * Pack sizes vary range to range, so the answer is given as the area to
 * cover (m², cutting waste included) rather than a pack count — you take
 * that many square metres to the counter and buy whole packs of whatever
 * range you've chosen. Plank thickness doesn't change the area you need;
 * it sets the threshold-bar height and how far the door casings are
 * undercut.
 *
 * The customer chooses the underlay (foam, vapour-barrier, fibreboard,
 * acoustic, integrated-into-the-plank, or none) and the fixing method
 * (floating click or glued down). Wood floors keep a perimeter expansion
 * gap even when glued; a fully bonded LVT does not.
 */

import type { BillOfMaterials, BomLine } from './types';
import { fmtM2, units } from './types';

export interface FloorType {
    id: string;
    label: string;
    thicknessMm: number;
    plankMm: { w: number; l: number };
    productName: string;
    /** Can be bonded down as well as floated. Laminate is float-only. */
    canGlue: boolean;
    /** A real-timber wearing layer: needs a perimeter expansion gap. */
    wood: boolean;
}

export const FLOOR_TYPES: FloorType[] = [
    {
        id: 'laminate8',
        label: 'Laminate 8 mm',
        thicknessMm: 8,
        plankMm: { w: 192, l: 1285 },
        productName: 'Krono 8 mm laminate (e.g. Rockford or Harlech Oak)',
        canGlue: false,
        wood: false,
    },
    {
        id: 'laminate12',
        label: 'Laminate 12 mm',
        thicknessMm: 12,
        plankMm: { w: 192, l: 1285 },
        productName: 'Krono Eurohome 12 mm laminate (e.g. Dartmoor Oak)',
        canGlue: false,
        wood: false,
    },
    {
        id: 'lvt',
        label: 'LVT / SPC 5 mm',
        thicknessMm: 5,
        plankMm: { w: 180, l: 1220 },
        productName: 'SPC rigid vinyl plank (e.g. Quickstep Alpha, Woodpecker)',
        canGlue: true,
        wood: false,
    },
    {
        id: 'engineered',
        label: 'Engineered wood 14 mm',
        thicknessMm: 14,
        plankMm: { w: 190, l: 1900 },
        productName: 'Engineered oak plank',
        canGlue: true,
        wood: true,
    },
    {
        id: 'solid',
        label: 'Solid wood 18 mm',
        thicknessMm: 18,
        plankMm: { w: 150, l: 1200 },
        productName: 'Solid oak plank',
        canGlue: true,
        wood: true,
    },
];

export type UnderlayType = 'foam' | 'vapour' | 'fibreboard' | 'acoustic' | 'integrated' | 'none';

export interface UnderlayOption {
    id: UnderlayType;
    label: string;
    /** Selco product, blank for integrated/none which add no line. */
    productName: string;
    note: string;
}

export const UNDERLAYS: UnderlayOption[] = [
    { id: 'foam', label: 'Foam underlay', productName: 'White foam flooring underlay', note: 'Laminate, engineered and solid over a dry, level subfloor.' },
    { id: 'vapour', label: 'Vapour-barrier foam', productName: 'Vapour barrier foam underlay', note: 'Built-in DPM — the choice over a concrete subfloor.' },
    { id: 'fibreboard', label: 'Fibreboard', productName: 'Fibreboard flooring underlay, 5 mm', note: 'Wood-fibre board that evens out a slightly uneven subfloor.' },
    { id: 'acoustic', label: 'Acoustic (LVT-rated)', productName: 'Timbertech acoustic underlay', note: 'Thin, dense underlay rated for rigid LVT / SPC.' },
    { id: 'integrated', label: 'Integrated (built into the plank)', productName: '', note: 'Your plank carries its own underlay — nothing separate to lay.' },
    { id: 'none', label: 'None (glued / bonded)', productName: '', note: 'Bonded straight to the subfloor, no underlay.' },
];

export function underlayOption(id: UnderlayType): UnderlayOption {
    return UNDERLAYS.find((u) => u.id === id) ?? UNDERLAYS[0];
}

export type FixingMethod = 'floating' | 'glued';

export interface FlooringInput {
    widthM: number;
    lengthM: number;
    floorId: string;
    underlay: UnderlayType;
    fixing: FixingMethod;
    /** Concrete subfloors want a vapour barrier. */
    concreteSubfloor: boolean;
    /** Number of doorways needing threshold bars. */
    doorways: number;
}

export interface FlooringPlan {
    areaM2: number;
    floor: FloorType;
    fixing: FixingMethod;
    /** Rows of planks across the room width (for the layout preview). */
    rows: number;
    /** Planks per full row along the length (for the layout preview). */
    planksPerRow: number;
    /** Area to buy, m², cutting waste included. */
    coverM2: number;
    /** Does the floor float free at the perimeter (needs the expansion gap)? */
    needsExpansionGap: boolean;
}

const WASTE = 0.08;

export function resolveFloor(id: string): FloorType {
    return FLOOR_TYPES.find((f) => f.id === id) ?? FLOOR_TYPES[0];
}

export function planFlooring(input: FlooringInput): FlooringPlan {
    const floor = resolveFloor(input.floorId);
    // Laminate can't be glued; fall back to floating if asked.
    const fixing: FixingMethod = input.fixing === 'glued' && floor.canGlue ? 'glued' : 'floating';
    const rows = Math.max(1, Math.ceil((input.widthM * 1000) / floor.plankMm.w));
    const planksPerRow = Math.max(1, Math.ceil((input.lengthM * 1000) / floor.plankMm.l));
    const areaM2 = input.widthM * input.lengthM;
    // A floating floor (and any real-timber floor, even glued) moves and so
    // needs the perimeter expansion gap. A fully bonded LVT does not.
    const needsExpansionGap = fixing === 'floating' || floor.wood;
    return {
        areaM2,
        floor,
        fixing,
        rows,
        planksPerRow,
        coverM2: Math.round(areaM2 * (1 + WASTE) * 100) / 100,
        needsExpansionGap,
    };
}

export function calculateFlooring(input: FlooringInput): BillOfMaterials {
    const plan = planFlooring(input);
    const a = plan.areaM2;
    const floor = plan.floor;
    const perimeter = 2 * (input.widthM + input.lengthM);
    const doorways = Math.round(input.doorways);
    const glued = plan.fixing === 'glued';
    const underlay = underlayOption(input.underlay);
    // A glued floor is bonded straight down — no separate underlay.
    const layUnderlay = !glued && underlay.id !== 'integrated' && underlay.id !== 'none';

    const flooringLines: BomLine[] = [
        {
            id: 'floor',
            name: floor.productName,
            detail: `${plan.coverM2.toFixed(2)} m² to buy, inc. ${Math.round(WASTE * 100)}% cutting waste. Pack sizes vary by range, so buy whole packs to cover this.`,
            qty: plan.coverM2,
            unit: 'm²',
        },
    ];

    if (layUnderlay) {
        flooringLines.push({
            id: 'underlay',
            name: underlay.productName,
            detail: `${(Math.ceil(a * 1.05 * 100) / 100).toFixed(2)} m² to cover. ${underlay.note}`,
            qty: Math.ceil(a * 1.05 * 100) / 100,
            unit: 'm²',
        });
    }

    if (glued) {
        flooringLines.push({
            id: 'adhesive',
            name: floor.wood ? 'SikaBond-54 wood floor adhesive' : 'Flexible vinyl floor adhesive (LVT)',
            detail: `${(Math.ceil(a * 100) / 100).toFixed(2)} m² to bond. Trowel-applied; coverage per tub is on the tub.`,
            qty: Math.ceil(a * 100) / 100,
            unit: 'm² to bond',
        });
    }

    const edgeLines: BomLine[] = [];
    if (plan.needsExpansionGap) {
        edgeLines.push({
            id: 'beading',
            name: 'Matching scotia beading, 2.4 m',
            detail: 'covers the expansion gap at the skirtings',
            qty: units((perimeter - doorways * 0.8) / 2.4),
            unit: 'lengths',
        });
    }
    if (doorways > 0) {
        edgeLines.push({
            id: 'thresholds',
            name: 'Threshold / door bar, 900 mm',
            detail: `ramp or T-bar to suit the ${floor.thicknessMm} mm floor and the adjoining room`,
            qty: doorways,
            unit: 'bars',
        });
    }
    if (!glued) {
        edgeLines.push({
            id: 'spacers',
            name: 'Expansion spacer & fitting kit',
            detail: '10 mm wedges + tapping block + pull bar for the click joints',
            qty: 1,
            unit: 'kits',
        });
    }

    const concreteNote =
        input.concreteSubfloor && layUnderlay && underlay.id !== 'vapour'
            ? 'Concrete subfloor: switch to the vapour-barrier foam (or lay a separate DPM) so damp can’t reach the floor.'
            : null;

    return {
        facts: [
            { label: 'Floor area', value: fmtM2(a) },
            { label: 'Floor type', value: `${floor.label} (${glued ? 'glued' : 'floating'})` },
            { label: 'To buy', value: `${plan.coverM2.toFixed(2)} m² inc. ${Math.round(WASTE * 100)}% cuts` },
            { label: 'Underlay', value: layUnderlay ? underlay.label : underlay.id === 'integrated' ? 'Integrated' : 'None' },
        ],
        sections: [
            { title: 'Flooring', lines: flooringLines },
            { title: 'Edges & thresholds', lines: edgeLines },
        ],
        tools: [
            'Mitre saw or fine-tooth handsaw, cut laminate face-up by hand, face-down on a power saw',
            'Jigsaw for radiator pipes and door frame scribes',
            glued
                ? 'Notched adhesive trowel and a clean roller to bed the boards into the glue'
                : 'Tapping block and pull bar (in the fitting kit), never hammer the click joint directly',
            'Undercut saw or multi-tool to trim door casings so planks slide under',
            'Sharp knife for the underlay and a roll of underlay tape',
            'Decorators caulk to finish the scotia after fitting',
        ],
        notes: [
            'Acclimatise packs flat in the room for 48 hours before laying.',
            'Stagger end joints at least 300 mm row to row; never let joints line up.',
            `Plank thickness (${floor.thicknessMm} mm) doesn't change how much floor you buy — it sets the threshold-bar height and how far you undercut the door casings.`,
            plan.needsExpansionGap
                ? '10 mm expansion gap at every wall and fixed point; the floor needs room to move.'
                : 'Bonded LVT sits tight to the wall — no expansion gap, so the skirting can sit straight down.',
            ...(underlay.id === 'integrated' ? ['Your plank has integrated underlay, so there is no separate underlay to lay.'] : []),
            ...(concreteNote ? [concreteNote] : []),
        ],
    };
}
