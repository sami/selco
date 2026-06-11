/**
 * @file src/calculators/v2/specs/interiors.ts
 *
 * Specs: wallpapering, skirting & architrave, doors & linings.
 * (Bathroom tiling merged into the main tiling calculator.)
 */

import { fmtM2, units } from '../types';
import type { CalcSpec } from './spec-types';
import { bool, num, str } from './spec-types';

// ---------------------------------------------------------------------------
// Wallpapering
// ---------------------------------------------------------------------------

export const wallpapering: CalcSpec = {
    slug: 'wallpapering',
    name: 'Wallpapering',
    category: 'Interiors & finishing',
    icon: 'fa-scroll',
    description:
        'Rolls, paste and lining paper from your room size, with pattern repeat handled properly, not guessed.',
    fields: [
        { kind: 'number', id: 'perimeter', label: 'Wall run to paper', unit: 'm', min: 1, max: 60, default: 14, hint: 'Add up the width of every wall being papered' },
        { kind: 'number', id: 'height', label: 'Wall height', unit: 'm', min: 2, max: 4, default: 2.4 },
        {
            kind: 'choice',
            id: 'repeat',
            label: 'Pattern repeat',
            options: [
                { value: '0', label: 'Free match' },
                { value: '32', label: '32 cm' },
                { value: '64', label: '64 cm' },
            ],
            default: '0',
        },
        { kind: 'toggle', id: 'lining', label: 'Cross-line first', hint: 'Lining paper hung horizontally, best finish', default: false },
    ],
    compute: (v) => {
        const ROLL_W = 0.53;
        const ROLL_L = 10.05;
        const repeatM = Number(str(v, 'repeat')) / 100;
        // Each drop = height + 100 mm trim, rounded up to a whole repeat.
        const rawDrop = num(v, 'height') + 0.1;
        const dropM = repeatM > 0 ? Math.ceil(rawDrop / repeatM) * repeatM : rawDrop;
        const dropsPerRoll = Math.max(1, Math.floor(ROLL_L / dropM));
        const dropsNeeded = Math.ceil(num(v, 'perimeter') / ROLL_W);
        const rolls = units(dropsNeeded / dropsPerRoll);

        return {
            facts: [
                { label: 'Drops needed', value: `${dropsNeeded}` },
                { label: 'Drop length', value: `${dropM.toFixed(2)} m` },
                { label: 'Drops per roll', value: `${dropsPerRoll}` },
                { label: 'Rolls', value: `${rolls}` },
            ],
            sections: [
                {
                    title: 'Paper & paste',
                    lines: [
                        { id: 'paper', name: 'Wallpaper (e.g. Anaglypta vinyl range)', detail: `530 mm × 10 m roll, same batch number throughout`, qty: rolls, unit: 'rolls' },
                        ...(bool(v, 'lining')
                            ? [{ id: 'lining', name: 'Lining paper, 1400 grade', detail: 'double roll 0.56 × 20 m, hung horizontally', qty: units((num(v, 'perimeter') * num(v, 'height') * 1.1) / 11.2), unit: 'rolls' }]
                            : []),
                        { id: 'paste', name: 'All-purpose wallpaper paste', detail: 'one box hangs ~4 to 5 rolls', qty: units((rolls + (bool(v, 'lining') ? 2 : 0)) / 4), unit: 'boxes' },
                        { id: 'size', name: 'Wall size / primer sealer', detail: 'seals bare plaster before hanging', qty: 1, unit: 'packs' },
                    ],
                },
            ],
            tools: [
                'Pasting table, bucket and pasting brush',
                'Paper-hanging brush and seam roller',
                'Sharp snap-off knife and decorators scissors',
                'Plumb bob or laser line, the first drop must be dead vertical',
                'Clean sponge and bucket for paste on the face',
                'Steam stripper (hire) if old paper is coming off first',
            ],
            notes: [
                'Add one spare roll on patterned papers, and keep the batch number.',
                'Pattern repeat rounds every drop up to a whole repeat. A 64 cm repeat on 2.4 m walls wastes about 14% by design.',
                'Free-match papers are the friendly choice for first-time hangers.',
            ],
        };
    },
};

// ---------------------------------------------------------------------------
// Skirting & architrave
// ---------------------------------------------------------------------------

export const skirtingArchitrave: CalcSpec = {
    slug: 'finishing-touches',
    name: 'Skirting, architrave & coving',
    category: 'Interiors & finishing',
    icon: 'fa-ruler-combined',
    description:
        'The trims that finish a room: skirting by the metre, architrave per door, coving overhead and a panelling kit if you fancy one.',
    fields: [
        { kind: 'number', id: 'perimeter', label: 'Room perimeter', unit: 'm', min: 1, max: 60, default: 16 },
        { kind: 'number', id: 'doors', label: 'Door openings', min: 0, max: 8, step: 1, default: 1 },
        {
            kind: 'choice',
            id: 'profile',
            label: 'Profile',
            options: [
                { value: 'ogee', label: 'Ogee' },
                { value: 'torus', label: 'Torus' },
                { value: 'chamfer', label: 'Chamfered' },
            ],
            default: 'torus',
        },
        { kind: 'toggle', id: 'mdf', label: 'Primed MDF', hint: 'Off = pine, knots need priming first', default: true },
        {
            kind: 'choice',
            id: 'coving',
            label: 'Coving',
            options: [
                { value: 'none', label: 'None' },
                { value: 'plaster', label: 'Plaster 90' },
                { value: 'supercove', label: 'SuperCove 127' },
            ],
            default: 'none',
        },
        { kind: 'toggle', id: 'panelling', label: 'Panelled feature wall', hint: 'Shaker MDF wall panelling kit', default: false },
    ],
    compute: (v) => {
        const doors = Math.round(num(v, 'doors'));
        const skirtM = Math.max(0, num(v, 'perimeter') - doors * 0.84);
        const material = bool(v, 'mdf') ? 'Primed MDF' : 'Redwood pine';
        const profile = str(v, 'profile');

        return {
            facts: [
                { label: 'Skirting run', value: `${skirtM.toFixed(1)} m` },
                { label: 'Door sets', value: `${doors}` },
                { label: 'Profile', value: `${material} ${profile}` },
            ],
            sections: [
                {
                    title: 'Timber',
                    lines: [
                        { id: 'skirting', name: `${material} skirting, ${profile} 119 × 18 mm`, detail: '4.2 m lengths, 10% for mitre waste', qty: units((skirtM * 1.1) / 4.2), unit: 'lengths' },
                        ...(doors > 0
                            ? [{ id: 'architrave', name: `${material} architrave, ${profile} 69 × 18 mm`, detail: 'set = 2 legs + head per door side', qty: doors * 2, unit: 'sets' }]
                            : []),
                    ],
                },
                ...(str(v, 'coving') !== 'none'
                    ? [
                          {
                              title: 'Coving',
                              lines: [
                                  str(v, 'coving') === 'plaster'
                                      ? {
                                            id: 'coving',
                                            name: 'Siniat plaster cove, 90 mm × 3 m',
                                            detail: 'gypsum, paints beautifully',
                                            qty: units((num(v, 'perimeter') * 1.05) / 3),
                                            unit: 'lengths',
                                        }
                                      : {
                                            id: 'coving',
                                            name: 'SuperCove polyurethane coving, 127 mm × 3 m',
                                            detail: 'pack of 6, light and crack-resistant',
                                            qty: units((num(v, 'perimeter') * 1.05) / 18),
                                            unit: 'packs',
                                        },
                                  str(v, 'coving') === 'plaster'
                                      ? {
                                            id: 'coving-adhesive',
                                            name: 'Siniat cove adhesive, 5 kg',
                                            detail: 'about 15 m per bag',
                                            qty: units(num(v, 'perimeter') / 15),
                                            unit: 'bags',
                                        }
                                      : {
                                            id: 'coving-adhesive',
                                            name: 'SuperCove coving adhesive, 310 ml',
                                            detail: 'about 8 m per cartridge',
                                            qty: units(num(v, 'perimeter') / 8),
                                            unit: 'cartridges',
                                        },
                              ],
                          },
                      ]
                    : []),
                ...(bool(v, 'panelling')
                    ? [
                          {
                              title: 'Feature wall',
                              lines: [
                                  {
                                      id: 'panelling-kit',
                                      name: 'Shaker MDF wall panelling kit',
                                      detail: '6 pre-cut strips, one kit per feature wall',
                                      qty: 1,
                                      unit: 'kits',
                                  },
                                  {
                                      id: 'panelling-adhesive',
                                      name: 'High-strength grab adhesive',
                                      detail: 'one cartridge per kit',
                                      qty: 1,
                                      unit: 'cartridges',
                                  },
                              ],
                          },
                      ]
                    : []),
                {
                    title: 'Fixing & finishing',
                    lines: [
                        { id: 'adhesive', name: 'High-strength grab adhesive', detail: 'one cartridge per ~8 lm', qty: units(skirtM / 8), unit: 'cartridges' },
                        { id: 'pins', name: 'Lost-head nails, 40 mm', detail: '500 g pack, mechanical fix on bowed walls', qty: 1, unit: 'packs' },
                        { id: 'caulk', name: 'Decorators caulk', detail: 'top edge and mitre gaps', qty: units(skirtM / 12), unit: 'cartridges' },
                        { id: 'filler', name: 'Wood filler (fine surface)', qty: 1, unit: 'tubs' },
                    ],
                },
            ],
            tools: [
                'Mitre saw or mitre box, internal corners are scribed, not mitred',
                'Coping saw for scribing internal joints',
                'Caulk gun, sealant smoother and a damp rag',
                'Stud detector, find fixing points through the plasterboard',
                'Pin hammer and nail punch',
                bool(v, 'mdf') ? 'Fine sandpaper, MDF edges drink paint, prime cut ends' : 'Knotting solution and primer for pine',
            ],
            notes: [
                'Internal corners: scribe one board over the other, mitres open up as timber moves.',
                'Architrave sits with a 6 mm margin off the lining edge all round.',
                'Deduct only the door widths, short offcuts rarely reuse cleanly.',
            ],
        };
    },
};

// ---------------------------------------------------------------------------
// Doors & linings
// ---------------------------------------------------------------------------

export const doorsLinings: CalcSpec = {
    slug: 'doors-linings',
    name: 'Doors & door linings',
    category: 'Interiors & finishing',
    icon: 'fa-door-open',
    description:
        'Everything per door: lining set, hinges, latch, handles, stops, fire-rated kit handled automatically.',
    fields: [
        { kind: 'number', id: 'doors', label: 'Number of doors', min: 1, max: 12, step: 1, default: 3 },
        {
            kind: 'choice',
            id: 'doorType',
            label: 'Door type',
            options: [
                { value: 'panel', label: 'Moulded panel' },
                { value: 'oak', label: 'Oak veneer' },
                { value: 'primed', label: 'Primed flush' },
            ],
            default: 'oak',
        },
        { kind: 'toggle', id: 'fire', label: 'FD30 fire doors', hint: 'Adds intumescent strips, fire hinges & closers', default: false },
        { kind: 'toggle', id: 'newLinings', label: 'New linings', hint: 'Off = hanging into existing frames', default: true },
    ],
    compute: (v) => {
        const n = Math.round(num(v, 'doors'));
        const fire = bool(v, 'fire');
        const doorName = {
            panel: 'Moulded panel door (Premdor / LPD range)',
            oak: 'Oak veneer door (e.g. Belize, Shaker 4-panel)',
            primed: 'White primed door (e.g. Amsterdam, Arnhem)',
        }[str(v, 'doorType')] ?? 'Oak veneer door';

        return {
            facts: [
                { label: 'Doors', value: `${n}` },
                { label: 'Spec', value: fire ? 'FD30 fire-rated' : 'Standard internal' },
                { label: 'Hinges', value: `${n * 3} (1.5 pairs each)` },
            ],
            sections: [
                {
                    title: 'Doors & linings',
                    lines: [
                        { id: 'doors', name: `${doorName}${fire ? ' FD30' : ''}`, detail: `1981 × 762 × ${fire ? 44 : 35} mm`, qty: n, unit: 'doors' },
                        ...(bool(v, 'newLinings')
                            ? [
                                  {
                                      id: 'linings',
                                      name: fire
                                          ? 'Firecheck BWF door lining, 38 × 138 mm'
                                          : 'Door lining pack, 32 × 138 mm',
                                      detail: 'inc. loose stops',
                                      qty: n,
                                      unit: 'sets',
                                  },
                                  { id: 'packers', name: 'Assorted packers / shims', detail: 'bag of 100', qty: units(n / 4), unit: 'bags' },
                                  { id: 'foam', name: 'Low-expansion gun foam', detail: 'one can per 2 to 3 linings', qty: units(n / 2.5), unit: 'cans' },
                              ]
                            : []),
                    ],
                },
                {
                    title: 'Ironmongery, per door, all counted',
                    lines: [
                        { id: 'hinges', name: fire ? 'Grade 11 fire-rated ball bearing hinges, 100 mm' : 'Ball bearing hinges, 75 mm', detail: '3 hinges per door', qty: n * 3, unit: 'hinges' },
                        { id: 'latch', name: fire ? 'Fire-rated tubular latch, 75 mm' : 'Tubular latch, 75 mm', qty: n, unit: 'latches' },
                        { id: 'handles', name: 'Lever handles on rose (pair)', qty: n, unit: 'pairs' },
                        ...(fire
                            ? [
                                  { id: 'strips', name: 'Intumescent strip with smoke seal, 15 × 4 mm', detail: '2.1 m lengths, 3 per door', qty: n * 3, unit: 'lengths' },
                                  { id: 'closers', name: 'Overhead door closer (CE marked)', qty: n, unit: 'closers' },
                              ]
                            : []),
                        { id: 'screws', name: 'Woodscrew trade pack, 4 × 30 mm', detail: 'hinges and keeps', qty: units(n / 6) || 1, unit: 'boxes' },
                    ],
                },
            ],
            tools: [
                'Door wedges and door lifter for hanging solo',
                'Sharp 25 mm chisel and mallet for hinge recesses',
                '13 mm and 25 mm flat bits for latch and spindle holes',
                'Block plane for easing edges, 2 mm gap all round, 6 mm at floor',
                'Combination square and marking gauge',
                str(v, 'doorType') === 'oak'
                    ? 'Hardwax oil or clear varnish, seal all six faces including top and bottom edges'
                    : 'Primer and undercoat, seal all six faces including top and bottom edges',
            ],
            notes: [
                'Seal every face of the door including top and bottom edges. Warping is a moisture story.',
                'FD30 doors must not be trimmed past the manufacturer limit, usually 3 to 6 mm per edge.',
                'Heavier fire doors need their own hinges. Never reuse 75 mm standard hinges.',
                'At home, FD30 doors are required to garages and on some loft conversions and three-storey layouts. Rented HMOs and public buildings step up to self-closers and often FD30S smoke seals or FD60. When in doubt, ask building control before you buy.',
            ],
        };
    },
};

export const INTERIOR_SPECS: CalcSpec[] = [skirtingArchitrave];
