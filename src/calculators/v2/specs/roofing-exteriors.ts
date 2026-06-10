/**
 * @file src/calculators/v2/specs/roofing-exteriors.ts
 *
 * Specs: pitched roofing, flat roofing (GRP / EPDM / torch-on),
 * guttering, rendering, cladding.
 */

import { fmtM2, units } from '../types';
import type { CalcSpec } from './spec-types';
import { bool, num, str } from './spec-types';

// ---------------------------------------------------------------------------
// Pitched roofing — clay plain tiles, natural slate, interlocking concrete
// ---------------------------------------------------------------------------

/** Coverage data per covering: pieces/m² and batten metres/m² (at gauge). */
const COVERINGS = {
    clay: {
        label: 'Rosemary clay plain tile',
        detail: '265 × 165 mm, 100 mm gauge',
        perM2: 60,
        battenPerM2: 10,
        unit: 'tiles',
    },
    slate: {
        label: 'Spanish natural slate',
        detail: '500 × 250 mm, 205 mm gauge',
        perM2: 21,
        battenPerM2: 4.9,
        unit: 'slates',
    },
    concrete: {
        label: 'Marley Modern interlocking tile',
        detail: '420 × 330 mm, 345 mm gauge',
        perM2: 9.7,
        battenPerM2: 2.9,
        unit: 'tiles',
    },
} as const;

export const roofPitched: CalcSpec = {
    slug: 'roof-pitched',
    name: 'Pitched roofing',
    category: 'Roofing & exteriors',
    icon: 'fa-house-chimney',
    description:
        'Tiles or slates, treated battens, breather membrane, ridge and fixings for a duo-pitch or mono-pitch roof.',
    fields: [
        { kind: 'number', id: 'width', label: 'Roof width (along ridge)', unit: 'm', min: 1, max: 30, default: 8 },
        { kind: 'number', id: 'slope', label: 'Slope length (eaves to ridge)', unit: 'm', min: 1, max: 15, default: 5, hint: 'Measure up the slope, not the plan' },
        {
            kind: 'choice',
            id: 'covering',
            label: 'Covering',
            options: [
                { value: 'clay', label: 'Clay plain' },
                { value: 'slate', label: 'Nat. slate' },
                { value: 'concrete', label: 'Concrete' },
            ],
            default: 'concrete',
        },
        { kind: 'toggle', id: 'duo', label: 'Duo-pitch (both sides)', hint: 'Off = single slope / lean-to', default: true },
    ],
    rectPreview: (v) => ({
        widthM: num(v, 'width'),
        lengthM: num(v, 'slope') * (bool(v, 'duo') ? 2 : 1),
        caption: bool(v, 'duo') ? 'Both slopes, unfolded flat' : 'Single slope',
    }),
    compute: (v) => {
        const cov = COVERINGS[str(v, 'covering') as keyof typeof COVERINGS] ?? COVERINGS.concrete;
        const slopes = bool(v, 'duo') ? 2 : 1;
        const area = num(v, 'width') * num(v, 'slope') * slopes;
        const ridgeM = bool(v, 'duo') ? num(v, 'width') : 0;
        const battenM = area * cov.battenPerM2 * 1.05;

        return {
            facts: [
                { label: 'Roof area', value: fmtM2(area) },
                { label: 'Covering', value: cov.label },
                { label: 'Battens', value: `${Math.ceil(battenM)} lm` },
                { label: 'Ridge', value: ridgeM ? `${ridgeM.toFixed(1)} m` : 'n/a (mono-pitch)' },
            ],
            sections: [
                {
                    title: 'Roof covering',
                    lines: [
                        {
                            id: 'covering',
                            name: cov.label,
                            detail: `${cov.detail} — inc. 5% cuts & breakages`,
                            qty: units(area * cov.perM2 * 1.05),
                            unit: cov.unit,
                        },
                        ...(ridgeM
                            ? [
                                  {
                                      id: 'ridge',
                                      name: 'Universal angle ridge tile',
                                      detail: '450 mm cover per ridge',
                                      qty: units(ridgeM / 0.45),
                                      unit: 'ridges',
                                  },
                                  {
                                      id: 'ridge-mortar',
                                      name: 'Dry ridge fixing kit',
                                      detail: 'covers 6 m per kit — BS 5534 compliant',
                                      qty: units(ridgeM / 6),
                                      unit: 'kits',
                                  },
                              ]
                            : []),
                    ],
                },
                {
                    title: 'Battens & membrane',
                    lines: [
                        {
                            id: 'battens',
                            name: 'BS 5534 graded treated batten, 25 × 50 mm',
                            detail: '4.8 m lengths',
                            qty: units(battenM / 4.8),
                            unit: 'lengths',
                        },
                        {
                            id: 'membrane',
                            name: 'Cromar Vent 3 breather membrane',
                            detail: '1 m × 50 m roll — 150 mm laps',
                            qty: units((area * 1.15) / 50),
                            unit: 'rolls',
                        },
                        {
                            id: 'batten-nails',
                            name: 'Galvanised batten nails, 65 mm',
                            detail: '2.5 kg tub',
                            qty: units(battenM / 90),
                            unit: 'tubs',
                        },
                        {
                            id: 'tile-fix',
                            name: str(v, 'covering') === 'slate' ? 'Copper slate nails, 35 mm' : 'Aluminium clout tile nails',
                            detail: '1 kg pack',
                            qty: units(area / 12),
                            unit: 'packs',
                        },
                    ],
                },
            ],
            tools: [
                'Roofing square, chalk line and gauge lath for setting out',
                'Slate cutter & ripper (slate) or angle grinder with diamond blade (tiles)',
                'Scaffold or tower — working at height regs apply',
                'Tile lifter bars and a bucket line for loading out',
                'Lead snips and sealant for flashing details',
                'Harness and edge protection (hire with the scaffold)',
            ],
            notes: [
                'Quantities assume a plain rectangular slope — add valleys, hips and abutments separately.',
                'Eaves, verge and undercloak details vary by system; check the manufacturer fixing spec.',
                'Battens at 5% over — gauge tightens near the eaves and ridge.',
            ],
        };
    },
};

// ---------------------------------------------------------------------------
// Flat roofing — GRP / EPDM / torch-on felt
// ---------------------------------------------------------------------------

export const roofFlat: CalcSpec = {
    slug: 'roof-flat',
    name: 'Flat roofing',
    category: 'Roofing & exteriors',
    icon: 'fa-layer-group',
    description:
        'Three systems in one calculator: GRP fibreglass, EPDM rubber, or torch-on felt — with deck boards, trims and adhesives.',
    fields: [
        { kind: 'number', id: 'width', label: 'Roof width', unit: 'm', min: 1, max: 15, default: 4 },
        { kind: 'number', id: 'length', label: 'Roof length', unit: 'm', min: 1, max: 20, default: 6 },
        {
            kind: 'choice',
            id: 'system',
            label: 'System',
            options: [
                { value: 'grp', label: 'GRP' },
                { value: 'epdm', label: 'EPDM' },
                { value: 'felt', label: 'Torch-on' },
            ],
            default: 'grp',
        },
        { kind: 'toggle', id: 'newDeck', label: 'New OSB3 deck', hint: '18 mm tongue & groove boards', default: true },
    ],
    rectPreview: (v) => ({
        widthM: num(v, 'width'),
        lengthM: num(v, 'length'),
        caption: 'Flat roof plan — min 1:80 fall to the outlet',
    }),
    compute: (v) => {
        const area = num(v, 'width') * num(v, 'length');
        const perimeter = 2 * (num(v, 'width') + num(v, 'length'));
        const system = str(v, 'system');

        const systemLines =
            system === 'grp'
                ? [
                      { id: 'resin', name: 'Cromar PRO 25 GRP roofing resin', detail: '~1.5 kg/m² laminate coat', qty: units((area * 1.5) / 20), unit: '20 kg tins' },
                      { id: 'topcoat', name: 'Cromar PRO 25 GRP topcoat', detail: '~0.5 kg/m²', qty: units((area * 0.5) / 10), unit: '10 kg tins' },
                      { id: 'csm', name: 'Chopped strand matting, 450 g/m²', detail: '1 m wide roll, 50 mm laps', qty: units((area * 1.1) / 45), unit: '45 m² rolls' },
                      { id: 'catalyst', name: 'GRP catalyst (hardener)', detail: '2% mix ratio — more in cold weather', qty: units(area / 25), unit: '500 g bottles' },
                      { id: 'trims', name: 'GRP edge trim (A170 drip / C100 raised edge)', detail: '3 m lengths', qty: units(perimeter / 3), unit: 'lengths' },
                      { id: 'bandage', name: 'GRP joint bandage / corner matting', detail: '75 mm × 25 m roll', qty: units(perimeter / 25), unit: 'rolls' },
                  ]
                : system === 'epdm'
                  ? [
                        { id: 'membrane', name: 'ClassicBond EPDM membrane, 1.2 mm', detail: 'one-piece sheet inc. 150 mm upstands', qty: Math.ceil((num(v, 'width') + 0.3) * (num(v, 'length') + 0.3) * 10) / 10, unit: 'm²' },
                        { id: 'deck-adhesive', name: 'ClassicBond water-based deck adhesive', detail: '~3.5 m²/L on the flat deck', qty: units(area / 3.5 / 5), unit: '5 L tubs' },
                        { id: 'contact-adhesive', name: 'ClassicBond contact bonding adhesive', detail: 'upstands and perimeter — ~2 m²/L', qty: units((perimeter * 0.3) / 2), unit: 'litres' },
                        { id: 'trims', name: 'EPDM kerb edge & drip trim set', detail: '2.5 m lengths + corners', qty: units(perimeter / 2.5), unit: 'lengths' },
                        { id: 'primer', name: 'EPDM primer & seam tape', detail: 'for any joins and details', qty: 1, unit: 'kits' },
                    ]
                  : [
                        { id: 'underlay', name: 'IKO torch-on underlay (2 mm)', detail: '1 m × 16 m roll, laps allowed', qty: units((area * 1.15) / 14), unit: 'rolls' },
                        { id: 'capsheet', name: 'IKO torch-on mineral cap sheet (4 mm)', detail: '1 m × 8 m roll, green or charcoal', qty: units((area * 1.2) / 7), unit: 'rolls' },
                        { id: 'primer', name: 'IKO bitumen primer', detail: '~5 m²/L on the deck and upstands', qty: units(area / 5 / 5), unit: '5 L tins' },
                        { id: 'drip', name: 'Felt drip trim / gutter edge', detail: '2.4 m lengths', qty: units(perimeter / 2.4), unit: 'lengths' },
                    ];

        return {
            facts: [
                { label: 'Roof area', value: fmtM2(area) },
                { label: 'System', value: system === 'grp' ? 'GRP fibreglass' : system === 'epdm' ? 'EPDM rubber' : 'Torch-on felt' },
                { label: 'Perimeter', value: `${perimeter.toFixed(1)} m` },
                { label: 'Deck', value: bool(v, 'newDeck') ? 'New 18 mm OSB3' : 'Existing deck' },
            ],
            sections: [
                ...(bool(v, 'newDeck')
                    ? [
                          {
                              title: 'Decking',
                              lines: [
                                  { id: 'osb', name: 'OSB3 tongue & groove board, 18 mm', detail: '2440 × 590 mm (1.44 m²) — 10% cuts', qty: units((area * 1.1) / 1.44), unit: 'boards' },
                                  { id: 'deck-screws', name: 'Exterior deck screws, 50 mm', detail: 'box of 200', qty: units((area * 12) / 200), unit: 'boxes' },
                              ],
                          },
                      ]
                    : []),
                { title: 'Waterproofing system', lines: systemLines },
            ],
            tools: [
                system === 'felt'
                    ? 'Gas torch, regulator and a fire extinguisher on the roof — hot works permit if required'
                    : 'Paddle mixer, rollers and brushes dedicated to the system',
                system === 'epdm' ? 'Silicone seam roller and scissors — EPDM cuts cold, no flames' : 'Acetone and rags for tool cleaning',
                'Sharp utility knife and tin snips for trims',
                'Broom and leaf blower — the deck must be bone dry and dust-free',
                'Everbuild bitumen mastic or low-modulus silicone for detail sealing',
                'Weather app open — none of these systems go down in rain or below 5 °C',
            ],
            notes: [
                'Allow a minimum 1:80 fall to the outlet — firrings are excluded; add them if the deck is dead flat.',
                'GRP figures use a single 600 g laminate equivalent (1 × 450 g CSM); heavy foot traffic needs a second layer.',
                'Upstands taken at 300 mm girth around the full perimeter.',
            ],
        };
    },
};

// ---------------------------------------------------------------------------
// Guttering
// ---------------------------------------------------------------------------

export const guttering: CalcSpec = {
    slug: 'guttering',
    name: 'Guttering & downpipes',
    category: 'Roofing & exteriors',
    icon: 'fa-water',
    description:
        'FloPlast gutter runs, unions, brackets, outlets and downpipes — counted the way a roofline fitter would.',
    fields: [
        { kind: 'number', id: 'run', label: 'Total gutter run', unit: 'm', min: 1, max: 60, default: 12 },
        { kind: 'number', id: 'downpipes', label: 'Downpipes', min: 1, max: 6, step: 1, default: 1 },
        { kind: 'number', id: 'drop', label: 'Downpipe drop height', unit: 'm', min: 1, max: 10, default: 4.8 },
        {
            kind: 'choice',
            id: 'profile',
            label: 'Profile',
            options: [
                { value: 'half-round', label: 'Half round' },
                { value: 'square', label: 'Square' },
                { value: 'deep', label: 'Deepflow' },
            ],
            default: 'half-round',
        },
    ],
    compute: (v) => {
        const run = num(v, 'run');
        const downpipes = Math.round(num(v, 'downpipes'));
        const profileLabel = { 'half-round': 'half round 112 mm', square: 'square 114 mm', deep: 'Deepflow 110 mm' }[str(v, 'profile')] ?? 'half round 112 mm';
        const gutterLengths = units(run / 4);
        const joints = Math.max(0, gutterLengths - 1);
        const pipeLengths = units((downpipes * num(v, 'drop')) / 2.5);

        return {
            facts: [
                { label: 'Gutter run', value: `${run.toFixed(1)} m` },
                { label: 'Profile', value: `FloPlast ${profileLabel}` },
                { label: 'Downpipes', value: `${downpipes}` },
                { label: 'Fall', value: '1:350 towards outlets' },
            ],
            sections: [
                {
                    title: 'Gutter',
                    lines: [
                        { id: 'gutter', name: `FloPlast gutter, ${profileLabel}`, detail: '4 m lengths', qty: gutterLengths, unit: 'lengths' },
                        { id: 'unions', name: 'Union brackets (joints)', qty: joints, unit: 'unions' },
                        { id: 'brackets', name: 'Fascia brackets', detail: 'one per 800 mm + one each side of joints', qty: units(run / 0.8) + joints * 2, unit: 'brackets' },
                        { id: 'outlets', name: 'Running outlets', qty: downpipes, unit: 'outlets' },
                        { id: 'stop-ends', name: 'External stop ends', qty: 2, unit: 'stop ends' },
                    ],
                },
                {
                    title: 'Downpipes',
                    lines: [
                        { id: 'pipe', name: 'FloPlast 68 mm round downpipe', detail: '2.5 m lengths', qty: pipeLengths, unit: 'lengths' },
                        { id: 'clips', name: 'Downpipe clips', detail: 'one per 1.8 m of drop', qty: units((downpipes * num(v, 'drop')) / 1.8), unit: 'clips' },
                        { id: 'offsets', name: 'Offset bends (swan neck pairs)', detail: '2 bends per downpipe at the eaves', qty: downpipes * 2, unit: 'bends' },
                        { id: 'shoes', name: 'Downpipe shoes', qty: downpipes, unit: 'shoes' },
                    ],
                },
            ],
            tools: [
                'Ladder with standoff, or tower — never lean on the gutter',
                'String line and level for the 1:350 fall',
                'Fine-tooth saw and file for clean pipe cuts',
                '25 mm wood screws (stainless) for brackets — about 2 per bracket',
                'Everbuild Roof & Gutter sealant for stop ends on old systems',
                'Bucket and gutter scoop if you are clearing the old run first',
            ],
            notes: [
                'One 4 m length spare is sensible on runs with several cuts.',
                'Brackets at max 800 mm centres; close up to 600 mm in snow areas.',
                'Check the drain connection — a shoe discharges over a gully, a connector goes direct.',
            ],
        };
    },
};

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

export const rendering: CalcSpec = {
    slug: 'rendering',
    name: 'Rendering',
    category: 'Roofing & exteriors',
    icon: 'fa-brush',
    description:
        'Traditional sand & cement or through-coloured monocouche — bags, beads and mesh for external walls.',
    fields: [
        { kind: 'number', id: 'area', label: 'Wall area', unit: 'm²', min: 1, max: 500, step: 0.5, default: 40 },
        {
            kind: 'choice',
            id: 'system',
            label: 'System',
            options: [
                { value: 'sc', label: 'Sand & cement' },
                { value: 'mono', label: 'Monocouche' },
            ],
            default: 'mono',
        },
        { kind: 'number', id: 'beads', label: 'External corners / stops', min: 0, max: 30, step: 1, default: 4, hint: 'Corner + bellcast + stop beads, in 2.5 m lengths' },
        { kind: 'toggle', id: 'mesh', label: 'Reinforcing mesh', hint: 'Mixed backgrounds or crack-prone walls', default: false },
    ],
    compute: (v) => {
        const area = num(v, 'area');
        const mono = str(v, 'system') === 'mono';

        const systemLines = mono
            ? [
                  { id: 'mono', name: 'Weber monocouche render (through-colour)', detail: '25 kg bag ≈ 1 m² at 15 mm, two passes', qty: units(area / 1), unit: 'bags' },
              ]
            : [
                  { id: 'sand', name: 'Hanson plastering sand', detail: 'bulk bag — scratch + top coat at 18 mm total', qty: units((area * 31) / 850), unit: 'bulk bags' },
                  { id: 'cement', name: 'Blue Circle Mastercrete cement', detail: '25 kg bag — 5:1 with plasticiser', qty: units((area * 6.2) / 25), unit: 'bags' },
                  { id: 'plasticiser', name: 'Everbuild mortar plasticiser', detail: '5 L', qty: units(area / 100), unit: 'bottles' },
                  { id: 'waterproofer', name: 'Everbuild 202 integral waterproofer', detail: '5 L — scratch coat', qty: units(area / 100), unit: 'bottles' },
              ];

        return {
            facts: [
                { label: 'Wall area', value: fmtM2(area) },
                { label: 'System', value: mono ? 'Monocouche 15 mm' : 'Sand & cement 18 mm' },
                { label: 'Beads', value: `${Math.round(num(v, 'beads'))} lengths` },
            ],
            sections: [
                { title: 'Render', lines: systemLines },
                {
                    title: 'Beads & prep',
                    lines: [
                        { id: 'beads', name: 'Stainless render beads (corner / bellcast / stop)', detail: '2.5 m lengths', qty: Math.round(num(v, 'beads')), unit: 'lengths' },
                        ...(bool(v, 'mesh')
                            ? [{ id: 'mesh', name: 'Alkali-resistant render mesh, 160 g', detail: '1 m × 50 m roll', qty: units((area * 1.1) / 50), unit: 'rolls' }]
                            : []),
                        { id: 'sbr', name: 'Everbuild SBR bond', detail: '5 L — key coat on dense or painted backgrounds', qty: units(area / 60), unit: 'bottles' },
                    ],
                },
            ],
            tools: [
                'Plastering trowel, hawk, and a sponge float (monocouche) or wood float',
                'Serrated straight edge and darby for ruling off',
                'Scratch comb for keying the first coat',
                mono ? 'Nail float / scraper for the scraped texture finish' : 'Churn brush for the top coat finish',
                'Mixer or paddle drill and clean buckets — wash out between mixes',
                'Masking film and tape — render splash stains glass and PVC',
            ],
            notes: [
                'Do not render in direct hot sun, rain, or below 5 °C — it will craze or wash off.',
                'Monocouche goes on in two passes the same day, then scraped at leather-hard.',
                'Check bellcast bead lines twice — it sets the whole wall visually.',
            ],
        };
    },
};

// ---------------------------------------------------------------------------
// Cladding
// ---------------------------------------------------------------------------

export const cladding: CalcSpec = {
    slug: 'cladding',
    name: 'Cladding',
    category: 'Roofing & exteriors',
    icon: 'fa-table-cells-large',
    description:
        'Fibre cement or treated timber boards with battens, breather membrane and colour-matched fixings.',
    fields: [
        { kind: 'number', id: 'area', label: 'Wall area to clad', unit: 'm²', min: 1, max: 300, step: 0.5, default: 25 },
        {
            kind: 'choice',
            id: 'board',
            label: 'Board type',
            options: [
                { value: 'cedral', label: 'Fibre cement' },
                { value: 'timber', label: 'Timber f/edge' },
            ],
            default: 'cedral',
        },
        { kind: 'number', id: 'corners', label: 'External corners', min: 0, max: 12, step: 1, default: 2 },
        { kind: 'toggle', id: 'membrane', label: 'Breather membrane', hint: 'Needed over solid walls and most frames', default: true },
    ],
    compute: (v) => {
        const area = num(v, 'area');
        const cedral = str(v, 'board') === 'cedral';
        // Cedral Lap: 3.6 m board, 186 mm face, 160 mm exposure → 6.25 lm/m².
        // Featheredge: 150 mm board at 125 mm cover → 8 lm/m².
        const lmPerM2 = cedral ? 6.25 : 8;
        const boardLen = cedral ? 3.6 : 4.8;
        const battenM = area / 0.6 + Math.sqrt(area) * 2; // verticals @600 + heads/cills

        return {
            facts: [
                { label: 'Clad area', value: fmtM2(area) },
                { label: 'Board', value: cedral ? 'Cedral Lap fibre cement' : 'Treated featheredge' },
                { label: 'Board run', value: `${Math.ceil(area * lmPerM2)} lm` },
            ],
            sections: [
                {
                    title: 'Cladding',
                    lines: [
                        {
                            id: 'boards',
                            name: cedral ? 'Cedral Lap weatherboard, 3.6 m' : 'Treated featheredge board, 150 mm × 4.8 m',
                            detail: cedral ? '160 mm exposure — inc. 7.5% cuts' : '125 mm cover — inc. 7.5% cuts',
                            qty: units((area * lmPerM2 * 1.075) / boardLen),
                            unit: 'boards',
                        },
                        { id: 'corner-trims', name: cedral ? 'Cedral external corner profile, 3 m' : 'Treated corner roll, 50 × 50 mm × 3 m', qty: Math.round(num(v, 'corners')), unit: 'lengths' },
                        {
                            id: 'fixings',
                            name: cedral ? 'Colour-matched cladding screws' : 'Stainless annular ring nails, 50 mm',
                            detail: cedral ? 'box of 100' : '1 kg pack',
                            qty: units((area * (cedral ? 20 : 16)) / (cedral ? 100 : 110)),
                            unit: cedral ? 'boxes' : 'packs',
                        },
                    ],
                },
                {
                    title: 'Battens & membrane',
                    lines: [
                        { id: 'battens', name: 'Treated batten, 25 × 50 mm', detail: '4.8 m lengths, verticals at 600 mm centres', qty: units(battenM / 4.8), unit: 'lengths' },
                        ...(bool(v, 'membrane')
                            ? [{ id: 'membrane', name: 'Cromar Vent 3 breather membrane', detail: '1 m × 50 m roll', qty: units((area * 1.15) / 50), unit: 'rolls' }]
                            : []),
                        { id: 'batten-screws', name: 'Concrete frame screws, 100 mm', detail: 'box of 100 — battens to masonry', qty: units(battenM / 0.6 / 100), unit: 'boxes' },
                    ],
                },
            ],
            tools: [
                cedral ? 'Fibre cement shears or a TCT blade with dust extraction — FFP3 mask essential' : 'Mitre saw and ear defenders',
                'Laser level or water level for the first course — everything follows it',
                'Cladding gauge / spacer blocks for consistent exposure',
                'Insect mesh for the ventilation gap top and bottom',
                'Everbuild low-modulus silicone for abutments and penetrations',
                'Touch-up paint pen (fibre cement) or end-grain preserver (timber)',
            ],
            notes: [
                'Keep a 10 mm ventilation gap top and bottom of the cavity, meshed against insects.',
                'First course sets every line above it — level it twice, fix it once.',
                'Window and door reveals need trims — count them as extra corner lengths.',
            ],
        };
    },
};

export const ROOFING_EXTERIOR_SPECS: CalcSpec[] = [roofPitched, roofFlat, guttering, rendering, cladding];
