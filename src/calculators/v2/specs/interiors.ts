/**
 * @file src/calculators/v2/specs/interiors.ts
 *
 * Specs: wallpapering, skirting & architrave, doors & linings, bathroom.
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
        'Rolls, paste and lining paper from your room size — with pattern repeat handled properly, not guessed.',
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
        { kind: 'toggle', id: 'lining', label: 'Cross-line first', hint: 'Lining paper hung horizontally — best finish', default: false },
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
                        { id: 'paper', name: 'Wallpaper', detail: `0.53 × 10.05 m roll — same batch number throughout`, qty: rolls, unit: 'rolls' },
                        ...(bool(v, 'lining')
                            ? [{ id: 'lining', name: 'Lining paper, 1400 grade', detail: 'double roll 0.56 × 20 m, hung horizontally', qty: units((num(v, 'perimeter') * num(v, 'height') * 1.1) / 11.2), unit: 'rolls' }]
                            : []),
                        { id: 'paste', name: 'Solvite all-purpose paste', detail: 'one box hangs ~4–5 rolls', qty: units((rolls + (bool(v, 'lining') ? 2 : 0)) / 4), unit: 'boxes' },
                        { id: 'size', name: 'Wall size / primer-sealer', detail: 'seals bare plaster before hanging', qty: 1, unit: 'packs' },
                    ],
                },
            ],
            tools: [
                'Pasting table, bucket and pasting brush',
                'Paper-hanging brush and seam roller',
                'Sharp snap-off knife and decorators scissors',
                'Plumb bob or laser line — the first drop must be dead vertical',
                'Clean sponge and bucket for paste on the face',
                'Steam stripper (hire) if old paper is coming off first',
            ],
            notes: [
                'Add one spare roll on patterned papers — and keep the batch number.',
                'Pattern repeat rounds every drop up to a whole repeat: a 64 cm repeat on 2.4 m walls wastes ~14% by design.',
                'Free-match papers are the budget-friendly choice for first-time hangers.',
            ],
        };
    },
};

// ---------------------------------------------------------------------------
// Skirting & architrave
// ---------------------------------------------------------------------------

export const skirtingArchitrave: CalcSpec = {
    slug: 'skirting-architrave',
    name: 'Skirting & architrave',
    category: 'Interiors & finishing',
    icon: 'fa-ruler-combined',
    description:
        'Skirting lengths, architrave sets per door, plus the grab adhesive, caulk and pins everyone forgets.',
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
        { kind: 'toggle', id: 'mdf', label: 'Primed MDF', hint: 'Off = pine — knots need priming', default: true },
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
                        { id: 'skirting', name: `${material} skirting, ${profile} 119 × 18 mm`, detail: '4.2 m lengths — 10% for mitre waste', qty: units((skirtM * 1.1) / 4.2), unit: 'lengths' },
                        ...(doors > 0
                            ? [{ id: 'architrave', name: `${material} architrave, ${profile} 69 × 18 mm`, detail: 'set = 2 legs + head per door side', qty: doors * 2, unit: 'sets' }]
                            : []),
                    ],
                },
                {
                    title: 'Fixing & finishing',
                    lines: [
                        { id: 'adhesive', name: 'Everbuild Stixall grab adhesive', detail: 'one cartridge per ~8 lm', qty: units(skirtM / 8), unit: 'cartridges' },
                        { id: 'pins', name: 'Lost-head nails, 40 mm', detail: '500 g pack — mechanical fix on bowed walls', qty: 1, unit: 'packs' },
                        { id: 'caulk', name: 'Everbuild decorators caulk', detail: 'top edge and mitre gaps', qty: units(skirtM / 12), unit: 'cartridges' },
                        { id: 'filler', name: 'Wood filler (fine surface)', qty: 1, unit: 'tubs' },
                    ],
                },
            ],
            tools: [
                'Mitre saw or mitre box — internal corners are scribed, not mitred',
                'Coping saw for scribing internal joints',
                'Caulk gun, sealant smoother and a damp rag',
                'Stud detector — find fixing points through the plasterboard',
                'Pin hammer and nail punch',
                bool(v, 'mdf') ? 'Fine sandpaper — MDF edges drink paint, prime cut ends' : 'Knotting solution and primer for pine',
            ],
            notes: [
                'Internal corners: scribe one board over the other — mitres open up as timber moves.',
                'Architrave sits with a 6 mm margin off the lining edge all round.',
                'Deduct only the door widths — short offcuts rarely reuse cleanly.',
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
        'Everything per door: lining set, hinges, latch, handles, stops — fire-rated kit handled automatically.',
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
        const doorName = { panel: 'Moulded 6-panel door', oak: 'Oak veneer 5-panel door', primed: 'Primed flush door' }[str(v, 'doorType')] ?? 'Oak veneer door';

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
                                  { id: 'linings', name: `Door lining set, 32 × ${fire ? 138 : 115} mm${fire ? ' FD30' : ''}`, detail: 'inc. loose stops', qty: n, unit: 'sets' },
                                  { id: 'packers', name: 'Assorted packers / shims', detail: 'bag of 100', qty: units(n / 4), unit: 'bags' },
                                  { id: 'foam', name: 'Everbuild low-expansion foam', detail: 'one can per 2–3 linings', qty: units(n / 2.5), unit: 'cans' },
                              ]
                            : []),
                    ],
                },
                {
                    title: 'Ironmongery — per door, all counted',
                    lines: [
                        { id: 'hinges', name: fire ? 'Grade 11 fire-rated ball bearing hinges, 100 mm' : 'Ball bearing hinges, 75 mm', detail: '3 hinges per door', qty: n * 3, unit: 'hinges' },
                        { id: 'latch', name: fire ? 'Fire-rated tubular latch, 75 mm' : 'Tubular latch, 75 mm', qty: n, unit: 'latches' },
                        { id: 'handles', name: 'Lever handles on rose (pair)', qty: n, unit: 'pairs' },
                        ...(fire
                            ? [
                                  { id: 'strips', name: 'Intumescent strip with smoke seal, 15 × 4 mm', detail: '2.1 m lengths — 3 per door', qty: n * 3, unit: 'lengths' },
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
                'Block plane for easing edges — 2 mm gap all round, 6 mm at floor',
                'Combination square and marking gauge',
                str(v, 'doorType') === 'oak'
                    ? 'Osmo door oil or clear varnish — seal all six faces including top and bottom edges'
                    : 'Primer and undercoat — seal all six faces including top and bottom edges',
            ],
            notes: [
                'Seal every face of the door including top and bottom edges — warping is a moisture story.',
                'FD30 doors must not be trimmed beyond the manufacturer limit (usually 3–6 mm per edge).',
                'Heavier fire doors need their hinges — never reuse 75 mm standard hinges.',
            ],
        };
    },
};

// ---------------------------------------------------------------------------
// Bathroom walls & floor
// ---------------------------------------------------------------------------

export const bathroom: CalcSpec = {
    slug: 'bathroom',
    name: 'Bathroom walls & floor',
    category: 'Kitchens & bathrooms',
    icon: 'fa-bath',
    description:
        'Backer board, tanking, tile adhesive, grout, trims and silicone for a full bathroom refit — wet zones done right.',
    fields: [
        { kind: 'number', id: 'wallArea', label: 'Wall area to tile', unit: 'm²', min: 1, max: 60, step: 0.5, default: 18 },
        { kind: 'number', id: 'floorArea', label: 'Floor area to tile', unit: 'm²', min: 0, max: 20, step: 0.5, default: 4 },
        { kind: 'toggle', id: 'tanking', label: 'Tank the shower zone', hint: 'Waterproof membrane kit behind shower tiling', default: true },
        { kind: 'toggle', id: 'backer', label: 'Cement backer board', hint: 'In wet zones instead of plasterboard', default: true },
    ],
    compute: (v) => {
        const wall = num(v, 'wallArea');
        const floor = num(v, 'floorArea');
        const total = wall + floor;

        return {
            facts: [
                { label: 'Wall tiling', value: fmtM2(wall) },
                { label: 'Floor tiling', value: fmtM2(floor) },
                { label: 'Wet zone', value: bool(v, 'tanking') ? 'Tanked' : 'Not tanked' },
            ],
            sections: [
                {
                    title: 'Substrate & waterproofing',
                    lines: [
                        ...(bool(v, 'backer')
                            ? [{ id: 'backer', name: 'HardieBacker cement board, 12 mm', detail: '1200 × 800 mm (0.96 m²) — wet walls', qty: units(Math.min(wall, 6) / 0.96), unit: 'boards' },
                               { id: 'backer-screws', name: 'HardieBacker screws & alkaline-resistant tape', detail: 'kit per ~6 boards', qty: 1, unit: 'kits' }]
                            : []),
                        ...(bool(v, 'tanking')
                            ? [{ id: 'tanking', name: 'Mapei Shower Waterproofing kit', detail: 'covers ~4.5 m² inc. corner tape', qty: units(Math.min(wall, 9) / 4.5), unit: 'kits' }]
                            : []),
                        { id: 'primer', name: 'BAL APD acrylic primer', detail: 'porous backgrounds before adhesive', qty: 1, unit: 'bottles' },
                    ],
                },
                {
                    title: 'Tiling consumables',
                    lines: [
                        { id: 'adhesive', name: 'Mapei rapid-set flexible adhesive (white)', detail: '20 kg bag ≈ 4 m² with a 10 mm trowel', qty: units(total / 4), unit: 'bags' },
                        { id: 'grout', name: 'Mapei Ultracolor Plus grout', detail: '5 kg bag ≈ 8–10 m² (tile-size dependent)', qty: units(total / 8), unit: 'bags' },
                        { id: 'spacers', name: 'Tile spacers, 2 mm', detail: 'bag of 500', qty: units(total / 12), unit: 'bags' },
                        { id: 'trim', name: 'Chrome / PVC tile trim, 2.44 m', detail: 'external edges and niches', qty: units(Math.sqrt(wall) * 1.5 / 2.44) + 2, unit: 'lengths' },
                        { id: 'silicone', name: 'Everbuild Forever White sanitary silicone', detail: 'every internal corner, tray and worktop joint', qty: units(total / 10) + 1, unit: 'cartridges' },
                    ],
                },
            ],
            tools: [
                'Manual tile cutter + tile saw for cut-outs around pipes',
                'Notched trowel (10 mm walls, 12 mm floors) and grout float',
                'Tile levelling clips for large-format tiles',
                'Laser level — set out from a level datum, never the bath edge',
                'Sealant gun, masking tape and smoothing tool for the silicone day',
                'Sponges, buckets and a grout profiling tool',
            ],
            notes: [
                'Plasterboard holds ~32 kg/m² tiled; cement board holds ~50 kg/m² — check your tile weight.',
                'Tank at minimum the shower enclosure plus 300 mm beyond it.',
                'Silicone joints, not grout, at every change of plane — they move, grout cracks.',
            ],
        };
    },
};

export const INTERIOR_SPECS: CalcSpec[] = [wallpapering, skirtingArchitrave, doorsLinings, bathroom];
