/**
 * @file src/calculators/v2/specs/groundworks.ts
 *
 * Specs: concrete & footings, block-paved driveway, french drain,
 * landscape aggregates.
 */

import { fmtM2, units } from '../types';
import type { CalcSpec } from './spec-types';
import { bool, num, str } from './spec-types';

// ---------------------------------------------------------------------------
// Concrete & groundworks
// ---------------------------------------------------------------------------

export const concrete: CalcSpec = {
    slug: 'concrete',
    name: 'Concrete & footings',
    category: 'Groundworks & drainage',
    icon: 'fa-cubes',
    description:
        'Volume for slabs or strip footings, mixed on site from ballast and cement — with the ready-mix tipping point flagged.',
    fields: [
        { kind: 'number', id: 'width', label: 'Width', unit: 'm', min: 0.1, max: 20, default: 3 },
        { kind: 'number', id: 'length', label: 'Length', unit: 'm', min: 0.1, max: 30, default: 4 },
        { kind: 'number', id: 'depth', label: 'Depth', unit: 'mm', min: 50, max: 1000, step: 25, default: 150 },
        {
            kind: 'choice',
            id: 'mix',
            label: 'Mix',
            options: [
                { value: 'c20', label: 'C20 general' },
                { value: 'c25', label: 'C25 footings' },
            ],
            default: 'c20',
        },
        { kind: 'toggle', id: 'mesh', label: 'A142 mesh reinforcement', hint: 'Slabs taking vehicles or point loads', default: false },
        { kind: 'toggle', id: 'dpm', label: 'DPM under slab', hint: '1200-gauge polythene membrane', default: true },
    ],
    rectPreview: (v) => ({
        widthM: num(v, 'width'),
        lengthM: num(v, 'length'),
        caption: `Slab plan — ${Math.round(num(v, 'depth'))} mm deep`,
    }),
    compute: (v) => {
        const volM3 = num(v, 'width') * num(v, 'length') * (num(v, 'depth') / 1000);
        const wasteVol = volM3 * 1.1;
        const c25 = str(v, 'mix') === 'c25';
        // Per m³: ~1850 kg ballast, cement at ~300 kg (C20) / ~340 kg (C25).
        const cementKg = wasteVol * (c25 ? 340 : 300);
        const ballastKg = wasteVol * 1850;
        const area = num(v, 'width') * num(v, 'length');

        return {
            facts: [
                { label: 'Volume', value: `${volM3.toFixed(2)} m³` },
                { label: 'Mix', value: c25 ? 'C25 (1:1.5:3)' : 'C20 (1:2:4)' },
                { label: 'Approx weight', value: `${((ballastKg + cementKg) / 1000).toFixed(1)} t` },
                { label: 'Ready-mix?', value: volM3 > 2 ? 'Yes — over 2 m³' : 'Site-mix is fine' },
            ],
            sections: [
                {
                    title: 'Concrete (site-mixed)',
                    lines: [
                        { id: 'ballast', name: 'Hanson all-in ballast', detail: 'bulk bag (~850 kg)', qty: units(ballastKg / 850), unit: 'bulk bags' },
                        { id: 'cement', name: 'Blue Circle Mastercrete cement', detail: '25 kg bag', qty: units(cementKg / 25), unit: 'bags' },
                    ],
                },
                {
                    title: 'Slab build-up',
                    lines: [
                        ...(bool(v, 'dpm')
                            ? [{ id: 'dpm', name: 'DPM polythene, 1200 gauge', detail: '4 m × 25 m roll — laps 300 mm', qty: units((area * 1.2) / 100), unit: 'rolls' }]
                            : []),
                        ...(bool(v, 'mesh')
                            ? [
                                  { id: 'mesh', name: 'A142 reinforcement mesh', detail: '4.8 × 2.4 m sheet (11.52 m²)', qty: units((area * 1.15) / 11.52), unit: 'sheets' },
                                  { id: 'spacers', name: 'Mesh spacers / chairs, 50 mm', detail: 'bag of 50', qty: units(area / 10) || 1, unit: 'bags' },
                              ]
                            : []),
                        { id: 'timber', name: 'Sawn timber for formwork, 100 × 22 mm', detail: '4.8 m lengths around the perimeter', qty: units((2 * (num(v, 'width') + num(v, 'length'))) / 4.8), unit: 'lengths' },
                    ],
                },
            ],
            tools: [
                'Belle-style cement mixer (hire) — hand mixing past 0.5 m³ is a false economy',
                'Wheelbarrow, shovels and a rake for placing',
                'Long straight edge / screed bar and a float or power float for big slabs',
                'String lines, pegs and a level for the formwork',
                'Polythene sheet to cure under (slow curing = strong slab)',
                'Wellies and gloves — wet concrete burns skin',
            ],
            notes: [
                `Over ~2 m³, price ready-mix with a pump — ${volM3 > 2 ? 'this job qualifies' : 'this job is comfortably site-mixable'}.`,
                'Volumes carry 10% for uneven ground and spillage.',
                'Footings below ground rarely need mesh; check with building control for structural work.',
            ],
        };
    },
};

// ---------------------------------------------------------------------------
// Block-paved driveway
// ---------------------------------------------------------------------------

export const driveway: CalcSpec = {
    slug: 'driveway',
    name: 'Driveway (block paving)',
    category: 'Groundworks & drainage',
    icon: 'fa-car',
    description:
        'Marshalls-style block paving with the full build-up: deep sub-base, screeded sand bed, edge restraints and kiln sand.',
    fields: [
        { kind: 'number', id: 'width', label: 'Driveway width', unit: 'm', min: 1, max: 15, default: 3 },
        { kind: 'number', id: 'length', label: 'Driveway length', unit: 'm', min: 1, max: 25, default: 6 },
        {
            kind: 'choice',
            id: 'block',
            label: 'Block format',
            options: [
                { value: 'standard', label: '200 × 100' },
                { value: 'tegula', label: 'Tegula mix' },
            ],
            default: 'standard',
        },
        { kind: 'toggle', id: 'edging', label: 'New edge restraints', hint: 'Concrete kerb edging haunched in mortar', default: true },
    ],
    rectPreview: (v) => ({
        widthM: num(v, 'width'),
        lengthM: num(v, 'length'),
        caption: '45° herringbone resists braking forces best',
    }),
    compute: (v) => {
        const area = num(v, 'width') * num(v, 'length');
        const perimeter = 2 * (num(v, 'width') + num(v, 'length'));
        const tegula = str(v, 'block') === 'tegula';

        return {
            facts: [
                { label: 'Area', value: fmtM2(area) },
                { label: 'Build-up', value: '150 mm MOT + 50 mm sand + 50 mm block' },
                { label: 'Excavation', value: '~250 mm below finished level' },
            ],
            sections: [
                {
                    title: 'Surface',
                    lines: [
                        {
                            id: 'blocks',
                            name: tegula ? 'Marshalls Tegula block paving, mixed-size project pack' : 'Marshalls Driveline 50 mm block paving',
                            detail: tegula ? 'pack covers ~9.7 m² — inc. 5% cuts' : '~9.8 m² per pack (488 blocks) — inc. 5% cuts',
                            qty: units((area * 1.05) / 9.7),
                            unit: 'packs',
                        },
                        { id: 'kiln-sand', name: 'Kiln-dried paving sand', detail: '25 kg bag ≈ 15 m² of joints', qty: units(area / 15), unit: 'bags' },
                        ...(bool(v, 'edging')
                            ? [
                                  { id: 'edging', name: 'Concrete block paving kerb, 200 × 100', detail: 'laid on edge in concrete haunch', qty: units(perimeter / 0.2), unit: 'kerbs' },
                                  { id: 'haunch-ballast', name: 'Hanson all-in ballast (haunching)', detail: 'bulk bag', qty: units((perimeter * 0.02 * 2000) / 850), unit: 'bulk bags' },
                                  { id: 'haunch-cement', name: 'Blue Circle Mastercrete cement', detail: '25 kg bag', qty: units((perimeter * 0.02 * 300) / 25), unit: 'bags' },
                              ]
                            : []),
                    ],
                },
                {
                    title: 'Build-up',
                    lines: [
                        { id: 'mot', name: 'Hanson MOT Type 1 sub-base', detail: 'bulk bag — 150 mm compacted (vehicles)', qty: units((area * 0.15 * 2200) / 850), unit: 'bulk bags' },
                        { id: 'sharp-sand', name: 'Hanson sharp sand (laying course)', detail: 'bulk bag — 50 mm screeded', qty: units((area * 0.05 * 1700) / 850), unit: 'bulk bags' },
                        { id: 'membrane', name: 'Geotextile separation membrane', detail: '2.25 × 20 m roll under the sub-base', qty: units((area * 1.1) / 45), unit: 'rolls' },
                    ],
                },
            ],
            tools: [
                'Wacker plate (hire) — compact MOT in two 75 mm passes, then the laid blocks',
                'Block splitter (hire) — faster and safer than a grinder for the cuts',
                'Screed rails and bar for the sand bed',
                'String lines, pegs and a big rubber mallet',
                'Angle grinder + diamond blade for the awkward cuts the splitter refuses',
                'Knee pads, gloves and a broom for the kiln sand',
            ],
            notes: [
                'Fall ~1:60 away from the house; driveways draining to the road may need planning rules checked (SUDS).',
                'Herringbone at 45° is the strongest bond under turning wheels.',
                'Compact the blocks with a mat-faced plate, then top up kiln sand again after a week.',
            ],
        };
    },
};

// ---------------------------------------------------------------------------
// French drain
// ---------------------------------------------------------------------------

export const frenchDrain: CalcSpec = {
    slug: 'french-drain',
    name: 'French drain',
    category: 'Groundworks & drainage',
    icon: 'fa-arrow-down-up-across-line',
    description:
        'Perforated pipe, geotextile sock and clean stone to move standing water away — with the gravel tonnage done for you.',
    fields: [
        { kind: 'number', id: 'length', label: 'Drain run', unit: 'm', min: 1, max: 60, default: 10 },
        {
            kind: 'choice',
            id: 'width',
            label: 'Trench width',
            options: [
                { value: '300', label: '300 mm' },
                { value: '450', label: '450 mm' },
            ],
            default: '300',
        },
        { kind: 'number', id: 'depth', label: 'Trench depth', unit: 'mm', min: 300, max: 1200, step: 50, default: 600 },
        { kind: 'toggle', id: 'catchpit', label: 'Catch pit / soakaway crates', hint: 'Where the run terminates', default: false },
    ],
    compute: (v) => {
        const len = num(v, 'length');
        const widthM = Number(str(v, 'width')) / 1000;
        const depthM = num(v, 'depth') / 1000;
        // Stone fills the trench minus ~150 mm topsoil cap and the pipe volume.
        const stoneVolM3 = Math.max(0, len * widthM * (depthM - 0.15) - len * 0.008);
        const stoneT = stoneVolM3 * 1.6;

        return {
            facts: [
                { label: 'Run', value: `${len.toFixed(1)} m` },
                { label: 'Trench', value: `${str(v, 'width')} × ${Math.round(num(v, 'depth'))} mm` },
                { label: 'Stone needed', value: `${stoneT.toFixed(1)} t` },
                { label: 'Fall', value: '1:100 minimum to the outfall' },
            ],
            sections: [
                {
                    title: 'Drainage',
                    lines: [
                        { id: 'pipe', name: 'Perforated land drain coil, 100 mm', detail: '25 m coil', qty: units(len / 25), unit: 'coils' },
                        { id: 'geotextile', name: 'Geotextile membrane (non-woven)', detail: '2.25 × 20 m roll — line trench, wrap the top', qty: units((len * (widthM + 2 * depthM + 0.3)) / 45), unit: 'rolls' },
                        { id: 'stone', name: '20 mm clean limestone / gravel', detail: 'bulk bag (~850 kg) — NOT MOT (fines clog drains)', qty: units((stoneT * 1000) / 850), unit: 'bulk bags' },
                        ...(bool(v, 'catchpit')
                            ? [{ id: 'crates', name: 'Soakaway crates, 1 m³ + silt trap', detail: 'wrapped in geotextile at the outfall', qty: 1, unit: 'sets' }]
                            : []),
                    ],
                },
            ],
            tools: [
                'Trenching spade and mattock — or a micro digger (hire) past 10 m',
                'Wheelbarrow and boards to protect the lawn route',
                'Line level or laser for the 1:100 fall',
                'Utility scanner / CAT before digging — services love garden edges',
                'Heavy-duty gloves — clean stone is sharp by design',
                'Pipe sock (filter mesh) if the ground is silty clay',
            ],
            notes: [
                'Use clean stone only — MOT Type 1 fines blind the drain within a season.',
                'Perforations face DOWN on modern guidance (water rises into the pipe).',
                'Cap with 150 mm of topsoil and turf, or finish with decorative gravel flush.',
            ],
        };
    },
};

// ---------------------------------------------------------------------------
// Landscape aggregates
// ---------------------------------------------------------------------------

export const aggregates: CalcSpec = {
    slug: 'aggregates',
    name: 'Landscape aggregates',
    category: 'Garden & outdoors',
    icon: 'fa-mound',
    description:
        'Decorative gravel, slate chippings or bark by the bulk bag — depth-correct tonnage, membrane included.',
    fields: [
        { kind: 'number', id: 'width', label: 'Area width', unit: 'm', min: 0.5, max: 30, default: 4 },
        { kind: 'number', id: 'length', label: 'Area length', unit: 'm', min: 0.5, max: 30, default: 6 },
        {
            kind: 'choice',
            id: 'material',
            label: 'Material',
            options: [
                { value: 'gravel', label: '20 mm gravel' },
                { value: 'slate', label: 'Slate 40 mm' },
                { value: 'bark', label: 'Bark mulch' },
            ],
            default: 'gravel',
        },
        { kind: 'toggle', id: 'membrane', label: 'Weed membrane under', default: true },
    ],
    rectPreview: (v) => ({
        widthM: num(v, 'width'),
        lengthM: num(v, 'length'),
        caption: 'Coverage at the recommended depth for the material',
    }),
    compute: (v) => {
        const area = num(v, 'width') * num(v, 'length');
        const mat = str(v, 'material');
        const spec = {
            gravel: { name: 'Golden gravel, 20 mm', depthM: 0.05, density: 1600, unit: 'bulk bags', perUnit: 850 },
            slate: { name: 'Blue slate chippings, 40 mm', depthM: 0.04, density: 1400, unit: 'bulk bags', perUnit: 850 },
            bark: { name: 'Ornamental bark mulch', depthM: 0.075, density: 280, unit: '100 L bags', perUnit: 28 },
        }[mat] ?? { name: 'Golden gravel, 20 mm', depthM: 0.05, density: 1600, unit: 'bulk bags', perUnit: 850 };

        const kg = area * spec.depthM * spec.density;

        return {
            facts: [
                { label: 'Area', value: fmtM2(area) },
                { label: 'Material', value: spec.name },
                { label: 'Depth', value: `${Math.round(spec.depthM * 1000)} mm recommended` },
                { label: 'Weight', value: mat === 'bark' ? `${(area * spec.depthM * 1000).toFixed(0)} L` : `${(kg / 1000).toFixed(1)} t` },
            ],
            sections: [
                {
                    title: 'Aggregate',
                    lines: [
                        { id: 'material', name: spec.name, detail: mat === 'bark' ? '100 L bag' : 'bulk bag (~850 kg)', qty: units(kg / spec.perUnit), unit: spec.unit },
                        ...(bool(v, 'membrane')
                            ? [
                                  { id: 'membrane', name: 'Weedtex weed control membrane', detail: '1 m × 15 m roll, 100 mm laps', qty: units((area * 1.15) / 15), unit: 'rolls' },
                                  { id: 'pins', name: 'Membrane fixing pegs', detail: 'pack of 50', qty: units(area / 2 / 50) || 1, unit: 'packs' },
                              ]
                            : []),
                    ],
                },
            ],
            tools: [
                'Wheelbarrow and shovel — a bulk bag will not move itself',
                'Landscaping rake for an even depth',
                'Sharp knife for the membrane, cut crosses for planting through',
                'Timber or steel edging to stop migration onto the lawn',
                'Gloves — slate edges are sharp',
                'Plate compactor only if it is a path base, never for decorative top layers',
            ],
            notes: [
                'Bulk bag coverage at recommended depth: gravel ~10 m², slate ~12 m², bark bags ~1.3 m² each.',
                'Lay membrane on cleared, levelled ground — it is weed control, not a substitute for prep.',
                'Bark settles ~20% in the first year; top up annually.',
            ],
        };
    },
};

export const GROUNDWORKS_SPECS: CalcSpec[] = [concrete, driveway, frenchDrain, aggregates];
