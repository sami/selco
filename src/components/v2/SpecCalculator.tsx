/**
 * @file src/components/v2/SpecCalculator.tsx
 *
 * Generic island that renders any spec-driven v2 calculator: builds the
 * input form from the spec's field list, recomputes the bill of materials
 * on every change, and draws a dimensioned plan rectangle when the spec
 * provides one.
 */

import { useMemo, useState } from 'react';
import { getSpecBySlug } from '../../calculators/v2/specs';
import { defaultsFor, type FieldSpec, type Values } from '../../calculators/v2/specs/spec-types';
import { BlueprintPanel, JobCard, NumberField, Segmented, ToggleRow } from './ui';
import MaterialsTicket from './MaterialsTicket';

const YELLOW = '#ffd407';

/** Dimensioned plan-view rectangle on the blueprint grid. */
function RectPreview({
    widthM,
    lengthM,
    caption,
}: {
    widthM: number;
    lengthM: number;
    caption: string;
}) {
    const W = 760;
    const H = 360;
    const PAD = 56;
    const scale = Math.min((W - PAD * 2) / Math.max(widthM, 0.1), (H - PAD * 2) / Math.max(lengthM, 0.1));
    const rw = widthM * scale;
    const rh = lengthM * scale;
    const x0 = (W - rw) / 2;
    const y0 = (H - rh) / 2;

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={caption}>
            <defs>
                <pattern id="rect-hatch" width="14" height="14" patternUnits="userSpaceOnUse">
                    <rect width="14" height="14" fill="rgba(255,255,255,0.07)" />
                    <line x1="0" y1="14" x2="14" y2="0" stroke="rgba(255,255,255,0.16)" strokeWidth="1" />
                </pattern>
            </defs>

            <rect x={x0} y={y0} width={rw} height={rh} fill="url(#rect-hatch)" stroke="#fff" strokeWidth="2" />

            {/* corner ticks */}
            {(
                [
                    [x0, y0],
                    [x0 + rw, y0],
                    [x0, y0 + rh],
                    [x0 + rw, y0 + rh],
                ] as const
            ).map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r="3" fill={YELLOW} />
            ))}

            {/* dimensions */}
            <g fill={YELLOW} fontSize="13" fontWeight="700">
                <line x1={x0} y1={y0 - 18} x2={x0 + rw} y2={y0 - 18} stroke={YELLOW} strokeWidth="1" />
                <text x={x0 + rw / 2} y={y0 - 26} textAnchor="middle">
                    {widthM.toFixed(1)} m
                </text>
                <line x1={x0 - 18} y1={y0} x2={x0 - 18} y2={y0 + rh} stroke={YELLOW} strokeWidth="1" />
                <text x={x0 - 26} y={y0 + rh / 2} textAnchor="middle" transform={`rotate(-90 ${x0 - 26} ${y0 + rh / 2})`}>
                    {lengthM.toFixed(1)} m
                </text>
            </g>

            <text x={W / 2} y={H - 12} fill="#fff" fontSize="11" textAnchor="middle" opacity="0.8">
                {caption}
            </text>
        </svg>
    );
}

function Field({
    field,
    value,
    onChange,
}: {
    field: FieldSpec;
    value: Values[string];
    onChange: (v: Values[string]) => void;
}) {
    if (field.kind === 'number') {
        return (
            <NumberField
                label={field.label}
                value={typeof value === 'number' ? value : field.default}
                onChange={onChange}
                unit={field.unit}
                min={field.min}
                max={field.max}
                step={field.step ?? 0.1}
                hint={field.hint}
            />
        );
    }
    if (field.kind === 'choice') {
        return (
            <Segmented
                label={field.label}
                value={typeof value === 'string' ? value : field.default}
                onChange={onChange}
                options={field.options}
            />
        );
    }
    return (
        <ToggleRow
            label={field.label}
            hint={field.hint}
            checked={value === true}
            onChange={onChange}
        />
    );
}

export default function SpecCalculator({ slug }: { slug: string }) {
    const spec = getSpecBySlug(slug);
    const [values, setValues] = useState<Values>(() => (spec ? defaultsFor(spec) : {}));

    const bom = useMemo(() => (spec ? spec.compute(values) : null), [spec, values]);
    const rect = useMemo(
        () => (spec?.rectPreview ? spec.rectPreview(values) : null),
        [spec, values],
    );

    if (!spec || !bom) {
        return (
            <p className="text-sm text-text-muted">
                Calculator not found, head back to the v2 hub.
            </p>
        );
    }

    return (
        <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)] items-start">
            <JobCard title="Job details">
                {spec.fields.map((f) => (
                    <Field
                        key={f.id}
                        field={f}
                        value={values[f.id]}
                        onChange={(v) => setValues((s) => ({ ...s, [f.id]: v }))}
                    />
                ))}
            </JobCard>

            <div className="space-y-6">
                {rect && (
                    <BlueprintPanel title="Plan view">
                        <RectPreview {...rect} />
                    </BlueprintPanel>
                )}
                <MaterialsTicket bom={bom} />
            </div>
        </div>
    );
}
