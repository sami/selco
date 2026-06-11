/**
 * @file src/components/v2/UnitConverterV2.tsx
 *
 * Unit converter island, v2 rebuild of the v1 handy tool in the counter
 * ticket style: pick a category and a from-unit, type a value, and every
 * other unit converts live. Ends with trade-handy equivalents instead of
 * a tools list.
 */

import { useMemo, useState } from 'react';
import { JobCard, NumberField, Segmented } from './ui';

interface Unit {
    id: string;
    label: string;
    /** Multiplier to the category's base unit (ignored for temperature). */
    toBase: number;
}

interface Category {
    id: string;
    label: string;
    units: Unit[];
    /** Decimal places for display. */
    dp: number;
}

const CATEGORIES: Category[] = [
    {
        id: 'length',
        label: 'Length',
        dp: 3,
        units: [
            { id: 'mm', label: 'millimetres', toBase: 0.001 },
            { id: 'cm', label: 'centimetres', toBase: 0.01 },
            { id: 'm', label: 'metres', toBase: 1 },
            { id: 'in', label: 'inches', toBase: 0.0254 },
            { id: 'ft', label: 'feet', toBase: 0.3048 },
            { id: 'yd', label: 'yards', toBase: 0.9144 },
        ],
    },
    {
        id: 'area',
        label: 'Area',
        dp: 3,
        units: [
            { id: 'm2', label: 'square metres', toBase: 1 },
            { id: 'ft2', label: 'square feet', toBase: 0.092903 },
            { id: 'yd2', label: 'square yards', toBase: 0.836127 },
            { id: 'acre', label: 'acres', toBase: 4046.86 },
        ],
    },
    {
        id: 'volume',
        label: 'Volume',
        dp: 3,
        units: [
            { id: 'l', label: 'litres', toBase: 0.001 },
            { id: 'm3', label: 'cubic metres', toBase: 1 },
            { id: 'ft3', label: 'cubic feet', toBase: 0.0283168 },
            { id: 'gal', label: 'gallons (UK)', toBase: 0.00454609 },
        ],
    },
    {
        id: 'weight',
        label: 'Weight',
        dp: 3,
        units: [
            { id: 'g', label: 'grams', toBase: 0.001 },
            { id: 'kg', label: 'kilograms', toBase: 1 },
            { id: 't', label: 'tonnes', toBase: 1000 },
            { id: 'lb', label: 'pounds', toBase: 0.453592 },
            { id: 'st', label: 'stone', toBase: 6.35029 },
        ],
    },
    {
        id: 'temp',
        label: 'Temp',
        dp: 1,
        units: [
            { id: 'c', label: 'Celsius', toBase: 1 },
            { id: 'f', label: 'Fahrenheit', toBase: 1 },
        ],
    },
];

/** Trade-handy equivalents shown under the results, per category. */
const HANDY: Record<string, string[]> = {
    length: ['A standard brick course gauge: 4 courses = 300 mm.', 'A 6 ft fence panel is 1.83 m wide.'],
    area: ['A bulk bag of gravel covers ~10 m² at 50 mm deep.', 'One 2400 × 1200 plasterboard covers 2.88 m².'],
    volume: ['A bulk bag holds roughly 0.5 m³ of aggregate.', '1 m³ of concrete needs ~2.2 t of ballast + cement.'],
    weight: ['A bulk bag is ~850 kg; 34 × 25 kg bags make one.', 'A 25 kg bag of plaster mixes with ~11.5 L of water.'],
    temp: ['Don\'t lay bricks or render below 5 °C.', 'Plaster sets fastest on hot days, mix smaller batches.'],
};

function convert(catId: string, value: number, from: Unit, to: Unit): number {
    if (catId === 'temp') {
        const c = from.id === 'c' ? value : ((value - 32) * 5) / 9;
        return to.id === 'c' ? c : (c * 9) / 5 + 32;
    }
    return (value * from.toBase) / to.toBase;
}

function fmt(n: number, dp: number): string {
    if (!Number.isFinite(n)) return ',';
    const abs = Math.abs(n);
    if (abs !== 0 && (abs >= 1e7 || abs < 0.0001)) return n.toExponential(3);
    return n.toLocaleString('en-GB', { maximumFractionDigits: abs < 1 ? Math.max(dp, 4) : dp });
}

export default function UnitConverterV2() {
    const [catId, setCatId] = useState('length');
    const [value, setValue] = useState(1);
    const [fromId, setFromId] = useState('m');

    const cat = CATEGORIES.find((c) => c.id === catId) ?? CATEGORIES[0];
    const from = cat.units.find((u) => u.id === fromId) ?? cat.units[0];

    const results = useMemo(
        () =>
            cat.units
                .filter((u) => u.id !== from.id)
                .map((u) => ({ unit: u, value: convert(cat.id, value, from, u) })),
        [cat, from, value],
    );

    const pickCategory = (id: string) => {
        setCatId(id);
        const next = CATEGORIES.find((c) => c.id === id)!;
        setFromId(next.units[0].id);
    };

    return (
        <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)] items-start">
            <JobCard title="What are you converting?">
                <Segmented
                    label="Measurement"
                    value={catId}
                    onChange={pickCategory}
                    options={CATEGORIES.map((c) => ({ value: c.id, label: c.label }))}
                />
                <NumberField
                    label="Value"
                    value={value}
                    onChange={setValue}
                    min={catId === 'temp' ? -100 : 0}
                    max={1000000}
                    step={0.01}
                />
                <div>
                    <label htmlFor="from-unit" className="form-label text-sm">
                        From
                    </label>
                    <select
                        id="from-unit"
                        className="form-select"
                        value={from.id}
                        onChange={(e) => setFromId(e.target.value)}
                    >
                        {cat.units.map((u) => (
                            <option key={u.id} value={u.id}>
                                {u.label}
                            </option>
                        ))}
                    </select>
                </div>
            </JobCard>

            <section className="panel overflow-hidden shadow-sm bg-bg-section">
                <div className="px-5 py-3 bg-brand-yellow">
                    <h2 className="text-sm font-extrabold uppercase tracking-[0.15em] text-brand-navy m-0">
                        {fmt(value, cat.dp)} {from.label} =
                    </h2>
                </div>

                <ul className="m-0 p-0 list-none divide-y divide-border-default/60 px-5 py-2">
                    {results.map((r) => (
                        <li key={r.unit.id} className="flex items-baseline justify-between gap-3 py-3">
                            <span className="text-sm font-semibold text-text-main">{r.unit.label}</span>
                            <span className="text-lg font-extrabold text-brand-navy tabular-nums">
                                {fmt(r.value, cat.dp)}
                            </span>
                        </li>
                    ))}
                </ul>

                <div className="px-5 py-4 bg-brand-navy">
                    <h3 className="flex items-center gap-2 text-[0.7rem] font-bold uppercase tracking-[0.15em] text-brand-yellow mb-2">
                        <i className="fas fa-lightbulb" aria-hidden="true"></i>
                        Trade handy
                    </h3>
                    <ul className="m-0 p-0 list-none space-y-1.5">
                        {(HANDY[cat.id] ?? []).map((h) => (
                            <li key={h} className="text-xs text-white/85 leading-relaxed pl-4 relative">
                                <span aria-hidden="true" className="absolute left-0 top-1 w-2 h-2 rounded-sm bg-brand-yellow" />
                                {h}
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        </div>
    );
}
