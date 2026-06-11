/**
 * @file src/calculators/v2/patio.ts
 *
 * Patio & paving estimator.
 *
 * Standard build-up for a domestic patio on a full mortar bed:
 *   - 100 mm compacted MOT Type 1 sub-base
 *   - 30 mm sand/cement mortar bed (5:1)
 *   - slabs at the chosen format, 10 mm joints
 *   - brush-in jointing compound
 */

import type { BillOfMaterials, BomLine } from './types';
import { aggregateLines, fmtM2, units } from './types';

export interface SlabFormat {
    id: string;
    label: string;
    productName: string;
    detail: string;
    wMm: number;
    hMm: number;
    porcelain: boolean;
}

export const SLAB_FORMATS: SlabFormat[] = [
    {
        id: 'concrete450',
        label: 'Concrete 450',
        productName: 'Stonemarket Ryton riven utility slab, 450 × 450 mm',
        detail: '32 mm thick, grey / buff / charcoal',
        wMm: 450,
        hMm: 450,
        porcelain: false,
    },
    {
        id: 'concrete600',
        label: 'Concrete 600',
        productName: 'Stonemarket Stretton smooth utility slab, 600 × 600 mm',
        detail: '38 mm thick, grey / buff',
        wMm: 600,
        hMm: 600,
        porcelain: false,
    },
    {
        id: 'porcelain600',
        label: 'Porcelain 600',
        productName: 'Stonemarket Fortuna porcelain slab, 600 × 600 mm',
        detail: '20 mm thick, vitrified',
        wMm: 600,
        hMm: 600,
        porcelain: true,
    },
    {
        id: 'porcelain1200',
        label: 'Porc. 1200',
        productName: 'Stonemarket Locana porcelain slab, 600 × 1200 mm',
        detail: '20 mm thick, vitrified',
        wMm: 1200,
        hMm: 600,
        porcelain: true,
    },
];

export interface PatioInput {
    widthM: number;
    lengthM: number;
    slabId: string;
    /** Cutting waste percentage (5 to 10 typical). */
    wastePct: number;
    includeSubBase: boolean;
    includeEdging: boolean;
}

const JOINT_MM = 10;
const MORTAR_BED_M = 0.03;
const SUBBASE_M = 0.1;

export interface PatioPlan {
    areaM2: number;
    slab: SlabFormat;
    /** Slabs per row / column at module size (slab + joint). */
    cols: number;
    rows: number;
    slabs: number;
}

export function planPatio(input: PatioInput): PatioPlan {
    const slab = SLAB_FORMATS.find((s) => s.id === input.slabId) ?? SLAB_FORMATS[1];
    const moduleW = (slab.wMm + JOINT_MM) / 1000;
    const moduleH = (slab.hMm + JOINT_MM) / 1000;
    const cols = Math.max(1, Math.ceil(input.widthM / moduleW));
    const rows = Math.max(1, Math.ceil(input.lengthM / moduleH));
    const areaM2 = input.widthM * input.lengthM;
    const slabs = units(cols * rows * (1 + input.wastePct / 100));
    return { areaM2, slab, cols, rows, slabs };
}

export function calculatePatio(input: PatioInput): BillOfMaterials {
    const plan = planPatio(input);
    const a = plan.areaM2;

    // Mortar bed: 30 mm over the area at ~2.1 t/m³ wet → split 5:1 by volume.
    const mortarVolM3 = a * MORTAR_BED_M;
    const sandT = mortarVolM3 * 1.7; // sharp sand tonnage incl. bulking
    const cementBags = units((mortarVolM3 / 5) * 1400 / 25); // ~1400 kg/m³ cement

    const lines: BomLine[] = [
        {
            id: 'slabs',
            name: plan.slab.productName,
            detail: `${plan.slab.detail}, ${plan.cols} × ${plan.rows} grid + ${input.wastePct}% cuts`,
            qty: plan.slabs,
            unit: 'slabs',
        },
        ...aggregateLines('sharp-sand', 'Concreting Sharp Sand', sandT * 1000, '30 mm full mortar bed'),
        {
            id: 'cement',
            name: 'Rugby Premium Cement',
            detail: '25 kg bag, 5:1 bed mix',
            qty: cementBags,
            unit: 'bags',
        },
        {
            id: 'jointing',
            name: 'Pavetuf All-Weather jointing compound',
            detail: '12.5 kg tub, brush-in',
            qty: units(a / 10),
            unit: 'tubs',
        },
        {
            id: 'primer',
            name: 'Pavetuf priming slurry',
            detail: plan.slab.porcelain
                ? '17 kg tub, essential under porcelain'
                : '17 kg tub, bonds slab to bed',
            qty: units(a / 17),
            unit: 'tubs',
        },
    ];

    if (input.includeSubBase) {
        lines.splice(1, 0, ...aggregateLines('mot', 'MOT Type 1 Roadstone', a * SUBBASE_M * 2200, '100 mm compacted'));
    }

    if (input.includeEdging) {
        const perimeterM = 2 * (input.widthM + input.lengthM);
        lines.push({
            id: 'edging',
            name: 'Round Top path edging',
            detail: '150 × 915 mm concrete edging stone',
            qty: units(perimeterM / 0.915),
            unit: 'stones',
        });
    }

    return {
        facts: [
            { label: 'Patio area', value: fmtM2(a) },
            { label: 'Slab format', value: plan.slab.label },
            { label: 'Grid', value: `${plan.cols} × ${plan.rows} slabs` },
            { label: 'Total slabs', value: `${plan.slabs} inc. waste` },
        ],
        sections: [{ title: 'Paving', lines }],
        tools: [
            'Wacker plate (hire) for compacting the sub-base',
            'Rubber mallet and 1.2 m spirit level for bedding slabs',
            'Angle grinder + diamond blade for cuts (with dust suppression)',
            'String line, pegs and a long straight edge for falls',
            'Soft brush for the jointing compound',
            'Knee pads and gloves, slabs are heavier than they look',
        ],
        notes: [
            ...(plan.slab.porcelain
                ? ['Porcelain must be primed slab-by-slab with the slurry and cut with a diamond blade. Worth every minute.']
                : []),
            'Build-up: 100 mm compacted MOT Type 1, 30 mm full mortar bed (5:1), 10 mm joints.',
            'Fall of 1:80 away from the house assumed, adjust dig depth accordingly.',
            'Excavation roughly 175 mm below finished level; allow for muck-away.',
        ],
    };
}
