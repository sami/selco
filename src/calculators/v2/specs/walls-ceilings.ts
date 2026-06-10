/**
 * @file src/calculators/v2/specs/walls-ceilings.ts
 *
 * Specs: dot & dab drylining, metal stud partition, MF plasterboard
 * ceiling, suspended grid ceiling.
 */

import { fmtM2, units } from '../types';
import type { CalcSpec } from './spec-types';
import { bool, num, str } from './spec-types';

const BOARD_M2 = 2.88; // 1200 × 2400 plasterboard

// ---------------------------------------------------------------------------
// Dot & dab drylining
// ---------------------------------------------------------------------------

export const drylining: CalcSpec = {
    slug: 'drylining',
    name: 'Drylining (dot & dab)',
    category: 'Walls, ceilings & partitions',
    icon: 'fa-clone',
    description:
        'Plasterboard and dot-and-dab adhesive bonded onto masonry, with the joint finishing kit included.',
    fields: [
        { kind: 'number', id: 'area', label: 'Wall area to board', unit: 'm²', min: 1, max: 500, step: 0.5, default: 30 },
        {
            kind: 'choice',
            id: 'board',
            label: 'Board type',
            options: [
                { value: 'standard', label: 'Standard' },
                { value: 'moisture', label: 'Moisture' },
                { value: 'acoustic', label: 'Acoustic' },
            ],
            default: 'standard',
        },
        { kind: 'toggle', id: 'skim', label: 'Skim finish', hint: 'Off = taped & jointed finish', default: true },
    ],
    compute: (v) => {
        const area = num(v, 'area');
        const boardName = {
            standard: 'Plasterboard, 12.5 mm',
            moisture: 'Moisture-resistant plasterboard, 12.5 mm',
            acoustic: 'Acoustic plasterboard, 12.5 mm',
        }[str(v, 'board')] ?? 'Plasterboard, 12.5 mm';

        return {
            facts: [
                { label: 'Wall area', value: fmtM2(area) },
                { label: 'Boards', value: `${units((area * 1.1) / BOARD_M2)}` },
                { label: 'Finish', value: bool(v, 'skim') ? 'Skim coat' : 'Tape & joint' },
            ],
            sections: [
                {
                    title: 'Boards & adhesive',
                    lines: [
                        { id: 'boards', name: boardName, detail: '1200 × 2400 mm — inc. 10% cuts', qty: units((area * 1.1) / BOARD_M2), unit: 'boards' },
                        { id: 'adhesive', name: 'Drywall (dot & dab) adhesive', detail: '25 kg bag ≈ 3 m² of dabs', qty: units(area / 3), unit: 'bags' },
                    ],
                },
                {
                    title: 'Finishing',
                    lines: bool(v, 'skim')
                        ? [
                              { id: 'scrim', name: 'Self-adhesive scrim tape', detail: '90 m roll', qty: units(area / 30), unit: 'rolls' },
                              { id: 'multifinish', name: 'Multi-finish plaster', detail: '25 kg bag ≈ 10 m²', qty: units(area / 10), unit: 'bags' },
                          ]
                        : [
                              { id: 'tape', name: 'Paper joint tape', detail: '150 m roll', qty: units(area / 60), unit: 'rolls' },
                              { id: 'jointing', name: 'Jointing & filling compound (60 min)', detail: '10 kg bag — two-coat joints', qty: units(area / 15), unit: 'bags' },
                              { id: 'primer', name: 'Drywall sealer / primer', detail: '10 L', qty: units(area / 80), unit: 'tubs' },
                          ],
                },
            ],
            tools: [
                'Drywall saw, rasp and a board lifter for ceiling-height sheets',
                'Straight edge and 2 m level — dabs let you plumb the wall, use it',
                'Mixing paddle and two buckets (adhesive goes off fast — small mixes)',
                'Taping knives (100/200 mm) if taping & jointing',
                'Foam gun cleaner and gap foam for reveals',
                'Acoustic sealant along floor and ceiling junctions',
            ],
            notes: [
                'Dabs in vertical rows at 600 mm centres plus a continuous band at floor and ceiling.',
                'Boards stop ~10 mm clear of the floor — sealed, not resting in damp.',
                'Moisture board in any room with a shower or external door.',
            ],
        };
    },
};

// ---------------------------------------------------------------------------
// Metal stud partition
// ---------------------------------------------------------------------------

export const metalStud: CalcSpec = {
    slug: 'metal-stud',
    name: 'Metal stud partition',
    category: 'Walls, ceilings & partitions',
    icon: 'fa-grip-lines-vertical',
    description:
        'Metal studs and track, boards both sides, acoustic insulation and screws for a new internal wall.',
    fields: [
        { kind: 'number', id: 'length', label: 'Partition length', unit: 'm', min: 0.5, max: 20, default: 4 },
        { kind: 'number', id: 'height', label: 'Floor-to-ceiling height', unit: 'm', min: 2, max: 4, default: 2.4 },
        { kind: 'number', id: 'doors', label: 'Door openings', min: 0, max: 3, step: 1, default: 1 },
        { kind: 'toggle', id: 'acoustic', label: 'Acoustic upgrade', hint: 'Sound insulation + acoustic plasterboard', default: true },
    ],
    compute: (v) => {
        const len = num(v, 'length');
        const h = num(v, 'height');
        const doors = Math.round(num(v, 'doors'));
        const area = len * h;
        const studs = Math.ceil(len / 0.6) + 1 + doors * 2; // 600 centres + doubles at openings
        const boards = units(((area * 2) * 1.1) / BOARD_M2); // both faces

        return {
            facts: [
                { label: 'Partition', value: `${len.toFixed(1)} × ${h.toFixed(1)} m` },
                { label: 'Studs', value: `${studs} @ 600 mm centres` },
                { label: 'Boards', value: `${boards} (both faces)` },
            ],
            sections: [
                {
                    title: 'Framing',
                    lines: [
                        { id: 'studs', name: 'Metal C-stud, 70 mm', detail: `${h <= 3 ? '3.0' : '3.6'} m lengths`, qty: studs, unit: 'studs' },
                        { id: 'track', name: 'Metal floor & ceiling track, 72 mm', detail: '3.0 m lengths — head and base', qty: units((len * 2) / 3), unit: 'lengths' },
                        ...(doors > 0
                            ? [{ id: 'timber', name: 'CLS timber, 63 × 38 mm', detail: 'door head formers and fixing grounds', qty: doors * 2, unit: 'lengths' }]
                            : []),
                    ],
                },
                {
                    title: 'Boarding & insulation',
                    lines: [
                        { id: 'boards', name: bool(v, 'acoustic') ? 'Acoustic plasterboard, 12.5 mm' : 'Plasterboard, 12.5 mm', detail: '1200 × 2400 mm — both faces, 10% cuts', qty: boards, unit: 'boards' },
                        { id: 'insulation', name: bool(v, 'acoustic') ? 'Acoustic mineral wool slab, 50 mm' : 'Acoustic partition roll (APR)', detail: bool(v, 'acoustic') ? 'pack covers 8.64 m²' : 'roll covers 11.25 m²', qty: units(area / (bool(v, 'acoustic') ? 8.64 : 11.25)), unit: bool(v, 'acoustic') ? 'packs' : 'rolls' },
                        { id: 'screws', name: 'Drywall screws, 25 mm (fine thread)', detail: 'box of 1000 — ~15 per m² per face', qty: units((area * 30) / 1000), unit: 'boxes' },
                        { id: 'scrim', name: 'Scrim tape + jointing compound', detail: 'joint finishing kit', qty: units(area / 25), unit: 'kits' },
                    ],
                },
            ],
            tools: [
                'Tin snips and a crimper for the metal frame — no screws needed stud-to-track',
                'Laser level or chalk line for the track lines, floor then ceiling',
                'Drywall screw gun with depth stop (dimpled, not torn, paper)',
                'Acoustic sealant for the head, base and abutments — it is half the sound rating',
                'Pad saw for socket cut-outs',
                'Door lining and packers if a door is going in',
            ],
            notes: [
                'Double studs at door openings and noggin the head with CLS timber.',
                'Stagger board joints between faces — never two joints on the same stud line.',
                'Drop sockets and services in before the second face goes on.',
            ],
        };
    },
};

// ---------------------------------------------------------------------------
// MF plasterboard ceiling
// ---------------------------------------------------------------------------

export const mfCeiling: CalcSpec = {
    slug: 'mf-ceiling',
    name: 'MF ceiling system',
    category: 'Walls, ceilings & partitions',
    icon: 'fa-grip',
    description:
        'British Gypsum Casoline MF — channels, hangers and boards for a flat suspended plasterboard ceiling.',
    fields: [
        { kind: 'number', id: 'width', label: 'Room width', unit: 'm', min: 1, max: 20, default: 4 },
        { kind: 'number', id: 'length', label: 'Room length', unit: 'm', min: 1, max: 20, default: 5 },
        { kind: 'toggle', id: 'insulation', label: 'Acoustic quilt over', hint: 'Mineral wool laid over the grid', default: false },
    ],
    rectPreview: (v) => ({
        widthM: num(v, 'width'),
        lengthM: num(v, 'length'),
        caption: 'MF5 at 450 mm centres, MF7 primaries at 1200 mm',
    }),
    compute: (v) => {
        const w = num(v, 'width');
        const l = num(v, 'length');
        const area = w * l;
        const perimeter = 2 * (w + l);
        // MF5 ceiling sections at 450 centres run across the width;
        // MF7 primary channels at 1200 centres run the other way.
        const mf5M = (Math.ceil(l / 0.45) + 1) * w;
        const mf7M = (Math.ceil(w / 1.2) + 1) * l;
        const hangers = units(mf7M / 1.2);

        return {
            facts: [
                { label: 'Ceiling area', value: fmtM2(area) },
                { label: 'MF5 sections', value: `${Math.ceil(mf5M)} lm` },
                { label: 'MF7 primaries', value: `${Math.ceil(mf7M)} lm` },
                { label: 'Hangers', value: `${hangers}` },
            ],
            sections: [
                {
                    title: 'Grid',
                    lines: [
                        { id: 'mf5', name: 'MF5 ceiling section', detail: '3.6 m lengths @ 450 mm centres', qty: units((mf5M * 1.05) / 3.6), unit: 'lengths' },
                        { id: 'mf7', name: 'MF7 primary channel', detail: '3.6 m lengths @ 1200 mm centres', qty: units((mf7M * 1.05) / 3.6), unit: 'lengths' },
                        { id: 'mf6a', name: 'MF6A perimeter channel', detail: '3.6 m lengths', qty: units(perimeter / 3.6), unit: 'lengths' },
                        { id: 'hangers', name: 'Strap hangers + soffit cleats', detail: 'one per 1200 mm along each MF7', qty: hangers, unit: 'sets' },
                        { id: 'clips', name: 'MF connecting clips', detail: 'MF5 to MF7 junctions', qty: units(mf5M / 0.45 / 10) * 10, unit: 'clips' },
                    ],
                },
                {
                    title: 'Boarding',
                    lines: [
                        { id: 'boards', name: 'Plasterboard, 12.5 mm', detail: '1200 × 2400 mm — inc. 10% cuts', qty: units((area * 1.1) / BOARD_M2), unit: 'boards' },
                        { id: 'screws', name: 'Drywall screws, 25 mm (fine thread)', detail: 'box of 1000', qty: units((area * 18) / 1000), unit: 'boxes' },
                        { id: 'wafer', name: 'Wafer-head jack-point screws, 13 mm', detail: 'box of 500 — metal-to-metal', qty: 1, unit: 'boxes' },
                        ...(bool(v, 'insulation')
                            ? [{ id: 'quilt', name: 'Acoustic insulation roll, 100 mm', detail: 'laid loose over the grid', qty: units(area / 11.25), unit: 'rolls' }]
                            : []),
                        { id: 'scrim', name: 'Scrim tape + jointing compound', detail: 'joint finishing kit', qty: units(area / 25), unit: 'kits' },
                    ],
                },
            ],
            tools: [
                'Laser level — set the perimeter channel line first, everything hangs off it',
                'Tin snips and a rivet gun or wafer-head screws for the grid',
                'Drywall screw gun and a board lifter (boards go up flat, arms give out)',
                'Podium steps or low tower — overhead work all day',
                'Chalk line for marking MF5 centres on the boards',
                'Eye protection — cutting channel overhead rains swarf',
            ],
            notes: [
                'Minimum void depth ~150 mm for the standard hanger arrangement.',
                'Board joints land mid-MF5 and stagger row to row.',
                'Set the finished level from the lowest point of the existing soffit.',
            ],
        };
    },
};

// ---------------------------------------------------------------------------
// Suspended grid ceiling
// ---------------------------------------------------------------------------

export const suspendedCeiling: CalcSpec = {
    slug: 'suspended-ceiling',
    name: 'Suspended ceiling (grid & tile)',
    category: 'Walls, ceilings & partitions',
    icon: 'fa-table-cells',
    description:
        'Standard 600 × 600 lay-in grid: main runners, cross tees, perimeter trim, hangers and tiles.',
    fields: [
        { kind: 'number', id: 'width', label: 'Room width', unit: 'm', min: 1, max: 30, default: 5 },
        { kind: 'number', id: 'length', label: 'Room length', unit: 'm', min: 1, max: 30, default: 8 },
        {
            kind: 'choice',
            id: 'tile',
            label: 'Tile type',
            options: [
                { value: 'mineral', label: 'Mineral fibre' },
                { value: 'vinyl', label: 'Vinyl-faced' },
            ],
            default: 'mineral',
        },
    ],
    rectPreview: (v) => ({
        widthM: num(v, 'width'),
        lengthM: num(v, 'length'),
        caption: '600 × 600 grid — centre the layout, cut tiles at edges',
    }),
    compute: (v) => {
        const w = num(v, 'width');
        const l = num(v, 'length');
        const area = w * l;
        const perimeter = 2 * (w + l);
        const tiles = units((area / 0.36) * 1.05);
        // Standard estimating rates per m² of grid:
        const mainRunnerM = area * 0.84;
        const ct1200 = units(area * 1.4);
        const ct600 = units(area * 0.7);

        return {
            facts: [
                { label: 'Ceiling area', value: fmtM2(area) },
                { label: 'Tiles', value: `${tiles} × 600 mm` },
                { label: 'Grid module', value: '600 × 600 mm' },
            ],
            sections: [
                {
                    title: 'Grid',
                    lines: [
                        { id: 'main', name: 'Main runner, 3.6 m', detail: 'at 1200 mm centres', qty: units(mainRunnerM / 3.6), unit: 'lengths' },
                        { id: 'ct1200', name: 'Cross tee, 1200 mm', qty: ct1200, unit: 'tees' },
                        { id: 'ct600', name: 'Cross tee, 600 mm', qty: ct600, unit: 'tees' },
                        { id: 'angle', name: 'Perimeter wall angle, 3 m', qty: units(perimeter / 3), unit: 'lengths' },
                        { id: 'hangers', name: 'Suspension wire / angle hangers', detail: 'one per 1.2 m of main runner', qty: units(mainRunnerM / 1.2), unit: 'hangers' },
                    ],
                },
                {
                    title: 'Tiles',
                    lines: [
                        { id: 'tiles', name: str(v, 'tile') === 'vinyl' ? 'Vinyl-faced wipeable tile, 600 × 600' : 'Mineral fibre ceiling tile, 600 × 600', detail: 'inc. 5% cutting margin', qty: tiles, unit: 'tiles' },
                    ],
                },
            ],
            tools: [
                'Laser level — strike the wall-angle line around the room first',
                'Tin snips and a sharp knife (mineral tiles cut face-up)',
                'String lines to keep the grid square as you build out',
                'Steps or podium and a helper for the long runners',
                'Fixings to suit the soffit: shot-fire, screw + plug, or beam clamps',
                'White gloves — mineral tiles mark easily during fitting',
            ],
            notes: [
                'Centre the grid so the cut tiles at opposite edges match — never start tight to one wall.',
                'Minimum 100 mm void for tile lift-and-tilt access; more over light fittings.',
                'Order a few spare tiles — they double as access panels forever after.',
            ],
        };
    },
};

export const WALLS_CEILINGS_SPECS: CalcSpec[] = [drylining, metalStud, mfCeiling, suspendedCeiling];
