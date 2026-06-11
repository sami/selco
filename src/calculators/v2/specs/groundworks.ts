/**
 * @file src/calculators/v2/specs/groundworks.ts
 *
 * Specs: concrete & footings, block-paved driveway, landscape aggregates.
 * (French drain graduated to a bespoke calculator with its own visual.)
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
                        { id: 'ballast', name: 'All-in ballast', detail: 'Large Bag (~800 kg)', qty: units(ballastKg / 800), unit: 'Large Bags' },
                        { id: 'cement', name: 'Rugby Premium Cement', detail: '25 kg bag', qty: units(cementKg / 25), unit: 'bags' },
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
                                  { id: 'mesh', name: 'A142 reinforcement mesh', detail: '3.6 × 2 m sheet (7.2 m²)', qty: units((area * 1.15) / 7.2), unit: 'sheets' },
                                  { id: 'spacers', name: 'Mesh spacers / chairs, 50 mm', detail: 'bag of 50', qty: units(area / 10) || 1, unit: 'bags' },
                              ]
                            : []),
                        { id: 'timber', name: 'Sawn timber for formwork, 100 × 22 mm', detail: '4.8 m lengths around the perimeter', qty: units((2 * (num(v, 'width') + num(v, 'length'))) / 4.8), unit: 'lengths' },
                    ],
                },
            ],
            tools: [
                'Powered cement mixer (hire) — hand mixing past 0.5 m³ is a false economy',
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
        'Concrete block paving with the full build-up: deep sub-base, screeded sand bed, edge restraints and kiln sand.',
    fields: [
        { kind: 'number', id: 'width', label: 'Driveway width', unit: 'm', min: 1, max: 15, default: 3 },
        { kind: 'number', id: 'length', label: 'Driveway length', unit: 'm', min: 1, max: 25, default: 6 },
        {
            kind: 'choice',
            id: 'block',
            label: 'Block format',
            options: [
                { value: 'standard', label: '200 × 100' },
                { value: 'tegula', label: 'Tumbled mix' },
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
                            name: tegula ? 'Tumbled concrete block paving, mixed-size project pack' : 'Concrete block paving, 50 mm',
                            detail: tegula ? 'pack covers ~9.7 m² — inc. 5% cuts' : '~9.8 m² per pack (488 blocks) — inc. 5% cuts',
                            qty: units((area * 1.05) / 9.7),
                            unit: 'packs',
                        },
                        { id: 'kiln-sand', name: 'Kiln Dried Sand 20 kg', detail: 'brushed into the joints, ~12 m² per bag', qty: units(area / 12), unit: 'bags' },
                        ...(bool(v, 'edging')
                            ? [
                                  { id: 'edging', name: 'Stonemarket Small Pavekerb', detail: '127 × 100 × 125 mm, laid in a concrete haunch', qty: units(perimeter / 0.127), unit: 'kerbs' },
                                  { id: 'haunch-ballast', name: 'All-in ballast (haunching)', detail: 'Large Bag', qty: units((perimeter * 0.02 * 2000) / 800), unit: 'Large Bags' },
                                  { id: 'haunch-cement', name: 'Rugby Premium Cement', detail: '25 kg bag', qty: units((perimeter * 0.02 * 300) / 25), unit: 'bags' },
                              ]
                            : []),
                    ],
                },
                {
                    title: 'Build-up',
                    lines: [
                        { id: 'mot', name: 'MOT Type 1 Roadstone', detail: 'Large Bag — 150 mm compacted for vehicles', qty: units((area * 0.15 * 2200) / 800), unit: 'Large Bags' },
                        { id: 'sharp-sand', name: 'Concreting Sharp Sand', detail: 'Large Bag — 50 mm screeded laying course', qty: units((area * 0.05 * 1700) / 800), unit: 'Large Bags' },
                        { id: 'membrane', name: 'Geotextile Fabric GF609', detail: '4.5 × 11.1 m roll under the sub-base', qty: units((area * 1.1) / 49), unit: 'rolls' },
                    ],
                },
            ],
            tools: [
                'Wacker plate (hire). Compact MOT in two 75 mm passes, then the laid blocks',
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
                { value: 'gravel', label: 'Golden gravel' },
                { value: 'limestone', label: 'Limestone' },
                { value: 'slate', label: 'Blue slate' },
                { value: 'cotswold', label: 'Cotswold' },
                { value: 'bark', label: 'Bark' },
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
            gravel: { name: '20 mm Golden Gravel', depthM: 0.05, density: 1600, unit: 'Large Bags', perUnit: 800 },
            limestone: { name: '20 mm Grey Limestone', depthM: 0.05, density: 1600, unit: 'Large Bags', perUnit: 800 },
            slate: { name: 'Blue Slate chippings', depthM: 0.04, density: 1400, unit: 'Large Bags', perUnit: 800 },
            cotswold: { name: 'Cotswold Chippings', depthM: 0.05, density: 1600, unit: 'Large Bags', perUnit: 800 },
            bark: { name: 'Landscape Bark', depthM: 0.075, density: 280, unit: '100 L bags', perUnit: 28 },
        }[mat] ?? { name: '20 mm Golden Gravel', depthM: 0.05, density: 1600, unit: 'Large Bags', perUnit: 800 };

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
                        { id: 'material', name: spec.name, detail: mat === 'bark' ? '100 L bag' : 'Large Bag (~800 kg)', qty: units(kg / spec.perUnit), unit: spec.unit },
                        ...(bool(v, 'membrane')
                            ? [
                                  { id: 'membrane', name: 'TDP50 weed control fabric', detail: '1 m × 14 m roll, 100 mm laps', qty: units((area * 1.15) / 14), unit: 'rolls' },
                                  { id: 'pins', name: 'Luxigraze artificial grass fixing pins', detail: 'pack of 10, doubles as membrane pegs', qty: units(area / 2 / 10) || 1, unit: 'packs' },
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
                'A Large Bag covers roughly 10 m² of gravel at 50 mm, or 14 m² of slate at 40 mm. Bark bags do about 1.3 m² each.',
                'Lay membrane on cleared, levelled ground — it is weed control, not a substitute for prep.',
                'Bark settles ~20% in the first year; top up annually.',
            ],
        };
    },
};

export const GROUNDWORKS_SPECS: CalcSpec[] = [concrete, driveway, aggregates];
