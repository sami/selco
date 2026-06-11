/**
 * @file src/calculators/v2/specs/insulation-heating.ts
 *
 * Specs: loft insulation, acoustic insulation, cavity wall batts,
 * external wall insulation, BTU radiator sizing, wet underfloor heating.
 */

import { fmtM2, units } from '../types';
import type { CalcSpec } from './spec-types';
import { bool, num, str } from './spec-types';

// ---------------------------------------------------------------------------
// Loft insulation
// ---------------------------------------------------------------------------

export const loftInsulation: CalcSpec = {
    slug: 'loft-insulation',
    name: 'Loft insulation',
    category: 'Insulation & heating',
    icon: 'fa-temperature-arrow-down',
    description:
        'Loft insulation to 270 mm: a 100 mm layer between joists and a 170 mm cross-layer over the top.',
    fields: [
        { kind: 'number', id: 'width', label: 'Loft width', unit: 'm', min: 1, max: 20, default: 6 },
        { kind: 'number', id: 'length', label: 'Loft length', unit: 'm', min: 1, max: 25, default: 8 },
        { kind: 'toggle', id: 'topup', label: 'Top-up only', hint: 'Existing 100 mm is sound, just add the cross-layer', default: false },
        { kind: 'toggle', id: 'boarding', label: 'Storage boarding', hint: 'Raised loft legs + P5 chipboard over a walkway', default: false },
    ],
    rectPreview: (v) => ({
        widthM: num(v, 'width'),
        lengthM: num(v, 'length'),
        caption: 'Loft plan, keep the eaves ventilation clear',
    }),
    compute: (v) => {
        const area = num(v, 'width') * num(v, 'length');
        const boardedArea = bool(v, 'boarding') ? Math.min(area * 0.3, 15) : 0;

        return {
            facts: [
                { label: 'Loft area', value: fmtM2(area) },
                { label: 'Target depth', value: '270 mm (current regs)' },
                { label: 'Layers', value: bool(v, 'topup') ? 'Cross-layer only' : '100 mm + 170 mm' },
            ],
            sections: [
                {
                    title: 'Insulation',
                    lines: [
                        ...(!bool(v, 'topup')
                            ? [{ id: 'base', name: 'Loft insulation roll, 100 mm', detail: 'covers 13.89 m² per roll, between joists', qty: units(area / 13.89), unit: 'rolls' }]
                            : []),
                        { id: 'top', name: 'Loft insulation roll, 170 mm', detail: 'covers 8.34 m² per roll, cross-laid over joists', qty: units(area / 8.34), unit: 'rolls' },
                    ],
                },
                ...(bool(v, 'boarding')
                    ? [
                          {
                              title: 'Storage area',
                              lines: [
                                  { id: 'legs', name: 'Loft storage stilts / legs', detail: 'pack of 12, keeps boards off the insulation', qty: units(boardedArea / 1.5), unit: 'packs' },
                                  { id: 'boards', name: 'P5 T&G loft board, 18 mm', detail: '1220 × 320 mm (0.39 m²)', qty: units(boardedArea / 0.39), unit: 'boards' },
                                  { id: 'screws', name: 'Wood screws, 4 × 40 mm', detail: 'box of 200', qty: 1, unit: 'boxes' },
                              ],
                          },
                      ]
                    : []),
            ],
            tools: [
                'FFP3 mask, gloves, long sleeves and eye protection, mineral wool itches',
                'Crawl boards to span the joists while you work',
                'Long-bladed insulation knife or old wood saw',
                'Head torch, loft lighting never reaches the eaves',
                'Loft cap / downlight covers for any spotlights below',
                'Expanding gap foam for sealing around the hatch and pipes',
            ],
            notes: [
                'Never block the eaves, leave a 50 mm ventilation path or fit eaves trays.',
                'Cables run on top of insulation, not buried under it.',
                'Insulate and draught-strip the hatch, it is the biggest single leak.',
            ],
        };
    },
};

// ---------------------------------------------------------------------------
// Acoustic insulation
// ---------------------------------------------------------------------------

export const acousticInsulation: CalcSpec = {
    slug: 'acoustic-insulation',
    name: 'Acoustic insulation',
    category: 'Insulation & heating',
    icon: 'fa-volume-xmark',
    description:
        'Mineral wool slabs between studs or joists to cut noise between rooms and floors.',
    fields: [
        { kind: 'number', id: 'area', label: 'Wall / floor area', unit: 'm²', min: 1, max: 200, step: 0.5, default: 12 },
        {
            kind: 'choice',
            id: 'depth',
            label: 'Slab thickness',
            options: [
                { value: '50', label: '50 mm' },
                { value: '70', label: '70 mm' },
                { value: '100', label: '100 mm' },
            ],
            default: '50',
        },
        { kind: 'toggle', id: 'soundbloc', label: 'Upgrade the boards too', hint: 'Add acoustic plasterboard over the top', default: false },
    ],
    compute: (v) => {
        const area = num(v, 'area');
        const depth = str(v, 'depth');
        const packM2 = { '50': 8.64, '70': 5.76, '100': 4.32 }[depth] ?? 8.64;

        return {
            facts: [
                { label: 'Area', value: fmtM2(area) },
                { label: 'Slab', value: `Acoustic mineral wool, ${depth} mm` },
                { label: 'Packs', value: `${units(area / packM2)}` },
            ],
            sections: [
                {
                    title: 'Insulation',
                    lines: [
                        { id: 'slabs', name: `Acoustic mineral wool slab, ${depth} mm`, detail: `600 × 1200 mm slabs, ${packM2} m² per pack`, qty: units(area / packM2), unit: 'packs' },
                        ...(bool(v, 'soundbloc')
                            ? [{ id: 'boards', name: 'Acoustic plasterboard, 12.5 mm', detail: '1200 × 2400 mm, inc. 10% cuts', qty: units((area * 1.1) / 2.88), unit: 'boards' }]
                            : []),
                        { id: 'sealant', name: 'Acoustic sealant', detail: 'perimeter joints, flanking kills sound ratings', qty: units(area / 15) + 1, unit: 'cartridges' },
                    ],
                },
            ],
            tools: [
                'Insulation saw or long-bladed knife, cut slabs 5 to 10 mm oversize for a friction fit',
                'FFP3 mask, gloves and goggles',
                'Tape measure and straight edge, clean cuts pack tighter',
                'Pad saw for socket boxes (use acoustic putty pads behind them)',
                'Caulk gun for the acoustic sealant',
                'Torch for joist bays and stud cavities',
            ],
            notes: [
                'Sound flanks around insulation through gaps, seal every perimeter and socket.',
                'Friction-fit slabs need no fixings in walls; floors may need netting below.',
                'Mass + absorption + sealing together beat any one of them doubled.',
            ],
        };
    },
};

// ---------------------------------------------------------------------------
// Cavity wall insulation (new-build / extension batts)
// ---------------------------------------------------------------------------

export const cavityInsulation: CalcSpec = {
    slug: 'cavity-insulation',
    name: 'Cavity wall batts',
    category: 'Insulation & heating',
    icon: 'fa-table-columns',
    description:
        'Full-fill cavity batts for new masonry work, with retaining clips counted per tie.',
    fields: [
        { kind: 'number', id: 'area', label: 'Cavity wall area', unit: 'm²', min: 1, max: 500, step: 0.5, default: 35 },
        {
            kind: 'choice',
            id: 'thickness',
            label: 'Batt thickness',
            options: [
                { value: '75', label: '75 mm' },
                { value: '100', label: '100 mm' },
                { value: '125', label: '125 mm' },
            ],
            default: '100',
        },
    ],
    compute: (v) => {
        const area = num(v, 'area');
        const t = str(v, 'thickness');
        const packM2 = { '75': 8.74, '100': 6.55, '125': 4.37 }[t] ?? 6.55;

        return {
            facts: [
                { label: 'Wall area', value: fmtM2(area) },
                { label: 'Batt', value: `Full-fill batt, ${t} mm` },
                { label: 'Packs', value: `${units(area / packM2)}` },
            ],
            sections: [
                {
                    title: 'Insulation',
                    lines: [
                        { id: 'batts', name: `Full-fill cavity slab, ${t} mm`, detail: `455 × 1200 mm, ${packM2} m² per pack`, qty: units(area / packM2), unit: 'packs' },
                        { id: 'clips', name: 'Insulation retaining clips', detail: 'one per wall tie, ties at 2.5/m²', qty: units((area * 2.5) / 50), unit: 'packs of 50' },
                        { id: 'cavity-closer', name: 'Cavity closers, 2.4 m', detail: 'reveals at openings, count your openings', qty: 0, unit: 'lengths' },
                    ],
                },
            ],
            tools: [
                'Long insulation knife and a board to cut on',
                'Brick trowel, keep batt tops clean of mortar droppings',
                'Cavity battens / boards to protect batts as the wall rises',
                'Gloves and FFP3 mask',
                'String line, batts sit flush, not bulging the cavity',
                'Expanding foam for awkward closures at eaves',
            ],
            notes: [
                'Batts go in as the work rises, never poked down from above.',
                'Stagger vertical joints and butt batts tight; gaps are cold bridges.',
                'Cavity closer quantity left at zero, count one length per reveal side and head.',
            ],
        };
    },
};

// ---------------------------------------------------------------------------
// External wall insulation (EWI)
// ---------------------------------------------------------------------------

export const externalInsulation: CalcSpec = {
    slug: 'external-insulation',
    name: 'External wall insulation',
    category: 'Insulation & heating',
    icon: 'fa-house-circle-check',
    description:
        'EPS boards, basecoat, mesh, fixings and a silicone render finish, the full EWI build-up per m².',
    fields: [
        { kind: 'number', id: 'area', label: 'Wall area', unit: 'm²', min: 1, max: 400, step: 0.5, default: 60 },
        {
            kind: 'choice',
            id: 'thickness',
            label: 'EPS thickness',
            options: [
                { value: '50', label: '50 mm' },
                { value: '90', label: '90 mm' },
                { value: '110', label: '110 mm' },
            ],
            default: '90',
        },
        { kind: 'number', id: 'beads', label: 'Corner / starter beads', min: 0, max: 40, step: 1, default: 8, hint: '2.5 m lengths, corners, starter track, reveals' },
    ],
    compute: (v) => {
        const area = num(v, 'area');

        return {
            facts: [
                { label: 'Wall area', value: fmtM2(area) },
                { label: 'System', value: `EPS ${str(v, 'thickness')} mm + thin-coat render` },
                { label: 'Fixings', value: `${units(area * 8)} @ 8/m²` },
            ],
            sections: [
                {
                    title: 'Insulation layer',
                    lines: [
                        { id: 'eps', name: `EWI-grade EPS board, ${str(v, 'thickness')} mm`, detail: '1200 × 600 mm (0.72 m²)', qty: units((area * 1.05) / 0.72), unit: 'boards' },
                        { id: 'adhesive', name: 'EWI basecoat adhesive', detail: '25 kg bag ≈ 4 m² for bonding boards', qty: units(area / 4), unit: 'bags' },
                        { id: 'fixings', name: 'Insulation hammer fixings, 8/m²', detail: 'length = EPS + 50 mm embed', qty: units((area * 8) / 100), unit: 'boxes of 100' },
                    ],
                },
                {
                    title: 'Render system',
                    lines: [
                        { id: 'basecoat', name: 'EWI basecoat (mesh coat)', detail: '25 kg bag ≈ 4 m² at 6 mm with mesh', qty: units(area / 4), unit: 'bags' },
                        { id: 'mesh', name: 'Alkali-resistant mesh, 160 g', detail: '1 m × 50 m roll, 100 mm laps', qty: units((area * 1.1) / 50), unit: 'rolls' },
                        { id: 'primer', name: 'Render primer (keyed)', detail: '~7 kg covers 25 to 30 m²', qty: units(area / 25), unit: 'tubs' },
                        { id: 'topcoat', name: 'Silicone render topcoat, 1.5 mm grain', detail: '25 kg tub ≈ 10 m²', qty: units(area / 10), unit: 'tubs' },
                        { id: 'beads', name: 'EWI corner / starter / bellcast beads', detail: '2.5 m lengths', qty: Math.round(num(v, 'beads')), unit: 'lengths' },
                    ],
                },
            ],
            tools: [
                'Long rasp / sanding float, EPS must be flat before the basecoat',
                'SDS drill for hammer fixings',
                'Notched trowel, spatula and a plastic float for the topcoat texture',
                'Scaffold, EWI is a two-storey job almost everywhere',
                'String line and level for the starter track (it sets the whole wall)',
                'Low-modulus silicone for sealing to windows, sills and soffits',
            ],
            notes: [
                'The starter track must be dead level, check it before any board goes on.',
                'Mesh laps 100 mm and beds into wet basecoat, never dry-fixed.',
                'Check eaves overhang and sill projections cover the new wall thickness.',
            ],
        };
    },
};

// ---------------------------------------------------------------------------
// BTU radiator sizing
// ---------------------------------------------------------------------------

export const radiatorBtu: CalcSpec = {
    slug: 'radiators-btu',
    name: 'Radiator BTU sizing',
    category: 'Insulation & heating',
    icon: 'fa-temperature-arrow-up',
    description:
        'Sizes the heat output a room needs, suggests a panel-radiator combination, and lists the install kit.',
    fields: [
        { kind: 'number', id: 'length', label: 'Room length', unit: 'm', min: 1, max: 15, default: 4.5 },
        { kind: 'number', id: 'width', label: 'Room width', unit: 'm', min: 1, max: 15, default: 3.5 },
        { kind: 'number', id: 'height', label: 'Ceiling height', unit: 'm', min: 2, max: 4, default: 2.4 },
        {
            kind: 'choice',
            id: 'room',
            label: 'Room type',
            options: [
                { value: 'living', label: 'Living' },
                { value: 'bedroom', label: 'Bedroom' },
                { value: 'kitchen', label: 'Kitchen/hall' },
            ],
            default: 'living',
        },
        { kind: 'toggle', id: 'cold', label: 'North-facing / poorly insulated', hint: 'Adds 15% to the requirement', default: false },
        { kind: 'toggle', id: 'bigGlazing', label: 'Large glazed areas', hint: 'Adds 10%', default: false },
    ],
    compute: (v) => {
        const volM3 = num(v, 'length') * num(v, 'width') * num(v, 'height');
        const base = { living: 153, bedroom: 128, kitchen: 110 }[str(v, 'room')] ?? 153;
        let btu = volM3 * base;
        if (bool(v, 'cold')) btu *= 1.15;
        if (bool(v, 'bigGlazing')) btu *= 1.1;
        btu = Math.ceil(btu / 50) * 50;

        // Stelrad K2 (Type 22) 600 mm high outputs at ΔT50, by length.
        const K2_OUTPUTS: Array<{ len: number; btu: number }> = [
            { len: 600, btu: 3450 },
            { len: 800, btu: 4600 },
            { len: 1000, btu: 5750 },
            { len: 1200, btu: 6900 },
            { len: 1400, btu: 8050 },
            { len: 1600, btu: 9200 },
        ];
        const single = K2_OUTPUTS.find((r) => r.btu >= btu);
        const radiators = single
            ? [{ len: single.len, count: 1 }]
            : [{ len: 1400, count: Math.ceil(btu / 8050) }];
        const radCount = radiators.reduce((s, r) => s + r.count, 0);

        return {
            facts: [
                { label: 'Room volume', value: `${volM3.toFixed(1)} m³` },
                { label: 'Heat needed', value: `${btu.toLocaleString('en-GB')} BTU/hr` },
                { label: 'In watts', value: `${Math.round(btu / 3.412)} W` },
                { label: 'Suggestion', value: radiators.map((r) => `${r.count} × K2 600×${r.len}`).join(' + ') },
            ],
            sections: [
                {
                    title: 'Radiators',
                    lines: radiators.map((r) => ({
                        id: `rad-${r.len}`,
                        name: `Type 22 (K2) double-panel radiator, 600 × ${r.len} mm`,
                        detail: 'double panel, double convector, ΔT50 rated',
                        qty: r.count,
                        unit: 'radiators',
                    })),
                },
                {
                    title: 'Install kit',
                    lines: [
                        { id: 'trv', name: 'TRV + lockshield valve pack, 15 mm', detail: 'one pack per radiator', qty: radCount, unit: 'packs' },
                        { id: 'pipe', name: 'Copper tube, 15 mm × 3 m', detail: 'allowance for drops and tails', qty: radCount * 2, unit: 'lengths' },
                        { id: 'fittings', name: 'End-feed elbow & coupler selection, 15 mm', detail: 'trade pack', qty: 1, unit: 'packs' },
                        { id: 'clips', name: 'Pipe clips, 15 mm', detail: 'pack of 20', qty: units(radCount / 2) || 1, unit: 'packs' },
                        { id: 'inhibitor', name: 'Central heating inhibitor', detail: 'top up after any drain-down', qty: 1, unit: 'bottles' },
                        { id: 'ptfe', name: 'PTFE tape', qty: 2, unit: 'rolls' },
                    ],
                },
            ],
            tools: [
                'Pipe slice / cutter and deburrer, clean cuts seal first time',
                'Blow torch, solder and flux (or push-fit fittings to stay flame-free)',
                'Radiator spanner and adjustable grips',
                'Spirit level, radiators read level or slightly towards the bleed end',
                'Drain hose, radiator bleed key and a dust sheet under every joint',
                'Pipe detector before drilling any wall fixings',
            ],
            notes: [
                'Rule-of-thumb sizing (BS-style room factors), a full heat-loss calc beats it for extensions and old solid-wall rooms.',
                'ΔT50 outputs assume a boiler flow around 75 °C; heat pumps run cooler and need bigger emitters.',
                'Two smaller radiators heat a long room more evenly than one large one.',
            ],
        };
    },
};

// ---------------------------------------------------------------------------
// Wet underfloor heating
// ---------------------------------------------------------------------------

export const underfloorHeating: CalcSpec = {
    slug: 'underfloor-heating',
    name: 'Underfloor heating (wet)',
    category: 'Insulation & heating',
    icon: 'fa-water-ladder',
    description:
        'Pipe coils, manifold ports, edge insulation and screed additive for a wet UFH zone.',
    fields: [
        { kind: 'number', id: 'area', label: 'Heated floor area', unit: 'm²', min: 1, max: 120, step: 0.5, default: 20 },
        {
            kind: 'choice',
            id: 'centres',
            label: 'Pipe centres',
            options: [
                { value: '150', label: '150 mm' },
                { value: '200', label: '200 mm' },
            ],
            default: '200',
        },
        { kind: 'number', id: 'perimeter', label: 'Room perimeter', unit: 'm', min: 4, max: 80, default: 18 },
        { kind: 'toggle', id: 'screed', label: 'New screed over', hint: 'Adds fibres/additive and a moisture programme note', default: true },
    ],
    compute: (v) => {
        const area = num(v, 'area');
        const centresM = Number(str(v, 'centres')) / 1000;
        const pipeM = (area / centresM) * 1.1 + 10; // runs + 10 m of tails
        const loops = units(pipeM / 100);

        return {
            facts: [
                { label: 'Heated area', value: fmtM2(area) },
                { label: 'Pipe needed', value: `${Math.ceil(pipeM)} m @ ${str(v, 'centres')} mm centres` },
                { label: 'Manifold', value: `${loops} port${loops === 1 ? '' : 's'} (max 100 m/loop)` },
            ],
            sections: [
                {
                    title: 'UFH system',
                    lines: [
                        { id: 'pipe', name: 'UFH barrier pipe (PB), 16 mm', detail: '100 m coils', qty: loops, unit: 'coils' },
                        { id: 'manifold', name: `UFH manifold, ${loops}-port`, detail: 'inc. flow meters & blending valve', qty: 1, unit: 'manifolds' },
                        { id: 'staples', name: 'Pipe staples (insulation fix)', detail: 'box of 300, every 400 mm, closer on bends', qty: units((pipeM / 0.4) / 300), unit: 'boxes' },
                        { id: 'edge', name: 'Perimeter edge insulation strip', detail: '25 m roll with skirt', qty: units(num(v, 'perimeter') / 25), unit: 'rolls' },
                        { id: 'stat', name: 'Programmable room thermostat + wiring centre', qty: 1, unit: 'kits' },
                    ],
                },
                ...(bool(v, 'screed')
                    ? [
                          {
                              title: 'Screed',
                              lines: [
                                  { id: 'additive', name: 'Screed plasticiser / fibre additive', detail: 'dose per m³, see bag rate', qty: units((area * 0.065) / 5) || 1, unit: 'bottles' },
                              ],
                          },
                      ]
                    : []),
            ],
            tools: [
                'Pipe decoiler (hire), fighting a 100 m coil alone is a two-person job at best',
                'Pipe cutter for clean tail ends at the manifold',
                'Pressure test kit, test at 6 bar BEFORE and DURING the screed pour',
                'Tape measure and marker for the loop layout (serpentine from the cold wall)',
                'Photographs, shoot the whole layout before it disappears under screed',
                'Manifold spanner set and PTFE',
            ],
            notes: [
                'Keep every loop under 100 m including tails, and balance loop lengths within ~10%.',
                'Leave the pipe pressurised while the screed goes down, a nicked pipe shows instantly.',
                'Screed cures ~1 day/mm before the slow UFH commissioning ramp starts.',
            ],
        };
    },
};

export const INSULATION_HEATING_SPECS: CalcSpec[] = [
    loftInsulation,
    acousticInsulation,
    cavityInsulation,
    externalInsulation,
    radiatorBtu,
    underfloorHeating,
];
