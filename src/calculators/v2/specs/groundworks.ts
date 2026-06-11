/**
 * @file src/calculators/v2/specs/groundworks.ts
 *
 * Specs: concrete & footings, block-paved driveway, landscape aggregates.
 * (French drain graduated to a bespoke calculator with its own visual.)
 */

import { aggregateBags, aggregateLines, fmtM2, units } from '../types';
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
        'Volume for slabs or strip footings, mixed on site from ballast and cement, with the mixer loads counted.',
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
        {
            kind: 'choice',
            id: 'reinforcement',
            label: 'Reinforcement',
            options: [
                { value: 'none', label: 'None' },
                { value: 'a142', label: 'A142 mesh' },
                { value: 'a393', label: 'A393 mesh' },
                { value: 'bars', label: '12 mm bars' },
            ],
            default: 'none',
        },
        { kind: 'toggle', id: 'dpm', label: 'DPM under slab', hint: '1200-gauge polythene membrane', default: true },
    ],
    rectPreview: (v) => ({
        widthM: num(v, 'width'),
        lengthM: num(v, 'length'),
        caption: `Slab plan, ${Math.round(num(v, 'depth'))} mm deep`,
    }),
    compute: (v) => {
        const volM3 = num(v, 'width') * num(v, 'length') * (num(v, 'depth') / 1000);
        const wasteVol = volM3 * 1.1;
        const c25 = str(v, 'mix') === 'c25';
        // Per m³: ~1850 kg ballast, cement at ~300 kg (C20) / ~340 kg (C25).
        const cementKg = wasteVol * (c25 ? 340 : 300);
        const ballastKg = wasteVol * 1850;
        const area = num(v, 'width') * num(v, 'length');

        // Reinforcement. Mesh laps one square (~200 mm), call it 15% over.
        const rebar = str(v, 'reinforcement');
        const meshNeedM2 = area * 1.15;
        // A142 comes in two sheet sizes: fill with 3.6 x 2 m (7.2 m²),
        // top up with 2.45 x 1.25 m (3.06 m²); three top-ups beat a big sheet.
        let a142Big = Math.floor(meshNeedM2 / 7.2);
        let a142Small = Math.ceil(Math.max(0, meshNeedM2 - a142Big * 7.2) / 3.06);
        if (a142Small >= 3) {
            a142Big += 1;
            a142Small = 0;
        }
        if (rebar === 'a142' && a142Big + a142Small === 0) a142Small = 1;
        // Bars: 3 No. 12 mm along the long dimension, typical domestic
        // strip footing, with 500 mm laps (~10% over). Sold in 6 m lengths.
        const longSideM = Math.max(num(v, 'width'), num(v, 'length'));
        const barLengths = units((longSideM * 3 * 1.1) / 6);

        const reinforcementLines =
            rebar === 'a142'
                ? [
                      ...(a142Big > 0
                          ? [{ id: 'mesh-big', name: 'A142 reinforcement mesh', detail: '3.6 × 2 m sheet (7.2 m²)', qty: a142Big, unit: 'sheets' }]
                          : []),
                      ...(a142Small > 0
                          ? [{ id: 'mesh-small', name: 'A142 reinforcement mesh', detail: '2.45 × 1.25 m sheet, the handy size', qty: a142Small, unit: 'sheets' }]
                          : []),
                  ]
                : rebar === 'a393'
                  ? [{ id: 'mesh-a393', name: 'A393 reinforcement mesh', detail: '4.8 × 2.4 m sheet (11.52 m²), the heavy one', qty: units(meshNeedM2 / 11.52), unit: 'sheets' }]
                  : rebar === 'bars'
                    ? [{ id: 'rebar', name: '12 mm reinforcing bar, 6 m', detail: '3 bars along the run with 500 mm laps', qty: barLengths, unit: 'lengths' }]
                    : [];
        if (reinforcementLines.length) {
            reinforcementLines.push(
                { id: 'spacers', name: 'Mesh spacer supports, 40/50 mm', detail: 'pack of 200, keeps steel mid-slab', qty: 1, unit: 'packs' },
                { id: 'tying-wire', name: 'Concrete tying wire', detail: '10 kg roll, ties laps and bar junctions', qty: 1, unit: 'rolls' },
            );
        }

        return {
            facts: [
                { label: 'Volume', value: `${volM3.toFixed(2)} m³` },
                { label: 'Mix', value: c25 ? 'C25 (1:1.5:3)' : 'C20 (1:2:4)' },
                { label: 'Approx weight', value: `${((ballastKg + cementKg) / 1000).toFixed(1)} t` },
                { label: 'Mixer loads', value: `~${Math.ceil(wasteVol / 0.06)} (90 L drum)` },
            ],
            sections: [
                {
                    title: 'Concrete (site-mixed)',
                    lines: [
                        ...aggregateLines('ballast', 'Ballast', ballastKg, 'sharp sand and 20 mm gravel pre-mixed'),
                        { id: 'cement', name: 'Rugby Premium Cement', detail: '25 kg bag', qty: units(cementKg / 25), unit: 'bags' },
                    ],
                },
                {
                    title: 'Slab build-up',
                    lines: [
                        ...(bool(v, 'dpm')
                            ? [{ id: 'dpm', name: 'DPM polythene, 1200 gauge', detail: '4 m × 25 m roll, laps 300 mm', qty: units((area * 1.2) / 100), unit: 'rolls' }]
                            : []),
                        ...reinforcementLines,
                        { id: 'timber', name: 'Sawn timber for formwork, 100 × 22 mm', detail: '4.8 m lengths around the perimeter', qty: units((2 * (num(v, 'width') + num(v, 'length'))) / 4.8), unit: 'lengths' },
                    ],
                },
            ],
            tools: [
                'Powered cement mixer (hire), hand mixing past 0.5 m³ is a false economy',
                'Wheelbarrow, shovels and a rake for placing',
                'Long straight edge / screed bar and a float or power float for big slabs',
                'String lines, pegs and a level for the formwork',
                'Polythene sheet to cure under (slow curing = strong slab)',
                'Wellies and gloves, wet concrete burns skin',
            ],
            notes: [
                'Ballast is sharp sand and 20 mm gravel already blended, so the mix is just ballast, cement and water. Big pours go easier with two people: one mixing, one placing.',
                'Volumes carry 10% for uneven ground and spillage.',
                rebar === 'a142'
                    ? 'A142 suits paths, shed bases and light slabs. Lap sheets one full square and tie the laps.'
                    : rebar === 'a393'
                      ? 'A393 is the heavy mesh for driveways and structural slabs. Two people to carry a sheet, no exceptions.'
                      : rebar === 'bars'
                        ? '3 No. 12 mm bars is a typical domestic strip footing. If an engineer has specified the steel, their drawing wins.'
                        : 'Plain concrete is fine for most garden slabs. Add mesh once vehicles or point loads get involved, and check structural work with building control.',
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
                            detail: tegula ? 'pack covers ~9.7 m², inc. 5% cuts' : '~9.8 m² per pack (488 blocks), inc. 5% cuts',
                            qty: units((area * 1.05) / 9.7),
                            unit: 'packs',
                        },
                        { id: 'kiln-sand', name: 'Kiln Dried Sand 20 kg', detail: 'brushed into the joints, ~12 m² per bag', qty: units(area / 12), unit: 'bags' },
                        ...(bool(v, 'edging')
                            ? [
                                  { id: 'edging', name: 'Stonemarket Small Pavekerb', detail: '127 × 100 × 125 mm, laid in a concrete haunch', qty: units(perimeter / 0.127), unit: 'kerbs' },
                                  ...aggregateLines('haunch-ballast', 'Ballast (haunching)', perimeter * 0.02 * 2000, 'sharp sand and 20 mm gravel pre-mixed'),
                                  { id: 'haunch-cement', name: 'Rugby Premium Cement', detail: '25 kg bag', qty: units((perimeter * 0.02 * 300) / 25), unit: 'bags' },
                              ]
                            : []),
                    ],
                },
                {
                    title: 'Build-up',
                    lines: [
                        ...aggregateLines('mot', 'MOT Type 1 Roadstone', area * 0.15 * 2200, '150 mm compacted for vehicles'),
                        ...aggregateLines('sharp-sand', 'Concreting Sharp Sand', area * 0.05 * 1700, '50 mm screeded laying course'),
                        { id: 'membrane', name: 'Geotextile Fabric GF609', detail: '4.5 × 11.1 m roll under the sub-base', qty: units((area * 1.1) / 49), unit: 'rolls' },
                    ],
                },
            ],
            tools: [
                'Wacker plate (hire). Compact MOT in two 75 mm passes, then the laid blocks',
                'Block splitter (hire), faster and safer than a grinder for the cuts',
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
        'Gravel, slate or bark for borders and paths. Jumbo bags or 35 kg large bags, worked out at the right depth, membrane included.',
    fields: [
        { kind: 'number', id: 'width', label: 'Area width', unit: 'm', min: 0.5, max: 30, default: 4 },
        { kind: 'number', id: 'length', label: 'Area length', unit: 'm', min: 0.5, max: 30, default: 6 },
        {
            kind: 'choice',
            id: 'material',
            label: 'Material',
            options: [
                { value: 'gravel', label: 'Golden gravel' },
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
            gravel: { name: '20 mm Golden Gravel', depthM: 0.05, density: 1600 },
            slate: { name: 'Blue Slate chippings', depthM: 0.04, density: 1400 },
            cotswold: { name: 'Cotswold Chippings', depthM: 0.05, density: 1600 },
            bark: { name: 'Landscape Bark', depthM: 0.075, density: 280 },
        }[mat] ?? { name: '20 mm Golden Gravel', depthM: 0.05, density: 1600 };

        const kg = area * spec.depthM * spec.density;

        return {
            facts: [
                { label: 'Area', value: fmtM2(area) },
                { label: 'Material', value: spec.name },
                { label: 'Depth', value: `${Math.round(spec.depthM * 1000)} mm recommended` },
                {
                    label: mat === 'bark' ? 'Volume' : 'Bags',
                    value:
                        mat === 'bark'
                            ? `${(area * spec.depthM * 1000).toFixed(0)} L`
                            : (() => {
                                  const b = aggregateBags(kg);
                                  return [b.jumbo ? `${b.jumbo} jumbo` : '', b.largeBags ? `${b.largeBags} × 35 kg` : ''].filter(Boolean).join(' + ') || 'none';
                              })(),
                },
            ],
            sections: [
                {
                    title: 'Aggregate',
                    lines: [
                        ...(mat === 'bark'
                            ? [{ id: 'material', name: spec.name, detail: '100 L bag', qty: units(kg / 28), unit: '100 L bags' }]
                            : aggregateLines('material', spec.name, kg)),
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
                'Wheelbarrow and shovel, a jumbo bag will not move itself',
                'Landscaping rake for an even depth',
                'Sharp knife for the membrane, cut crosses for planting through',
                'Timber or steel edging to stop migration onto the lawn',
                'Gloves, slate edges are sharp',
                'Plate compactor only if it is a path base, never for decorative top layers',
            ],
            notes: [
                'A jumbo bag (~875 kg) covers roughly 11 m² of gravel at 50 mm, or 15 m² of slate at 40 mm. The 35 kg large bags are there for top-ups and small jobs.',
                'Lay membrane on cleared, levelled ground, it is weed control, not a substitute for prep.',
                'Bark settles ~20% in the first year; top up annually.',
            ],
        };
    },
};

export const GROUNDWORKS_SPECS: CalcSpec[] = [concrete, driveway, aggregates];
