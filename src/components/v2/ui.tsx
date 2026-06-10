/**
 * @file src/components/v2/ui.tsx
 *
 * Shared form primitives for the v2 concept calculators.
 *
 * All v2 calculators are live: every keystroke recalculates, there is no
 * submit button. These primitives keep the inputs compact so the layout can
 * give most of the screen to the preview and the materials ticket.
 */

import type { ReactNode } from 'react';
import { useId } from 'react';

/** Numeric input with unit suffix, clamped to a sensible range. */
export function NumberField({
    label,
    value,
    onChange,
    unit,
    min = 0,
    max = 100,
    step = 0.1,
    hint,
}: {
    label: string;
    value: number;
    onChange: (v: number) => void;
    unit?: string;
    min?: number;
    max?: number;
    step?: number;
    hint?: string;
}) {
    const id = useId();
    return (
        <div>
            <label htmlFor={id} className="form-label text-sm">
                {label}
            </label>
            <div className="relative">
                <input
                    id={id}
                    type="number"
                    inputMode="decimal"
                    className="form-input pr-12"
                    value={Number.isFinite(value) ? value : ''}
                    min={min}
                    max={max}
                    step={step}
                    onChange={(e) => {
                        const v = parseFloat(e.target.value);
                        if (Number.isNaN(v)) return onChange(0);
                        onChange(Math.min(max, Math.max(min, v)));
                    }}
                />
                {unit && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-text-muted pointer-events-none">
                        {unit}
                    </span>
                )}
            </div>
            {hint && <span className="field-description">{hint}</span>}
        </div>
    );
}

/** Pill-style single-choice control. */
export function Segmented<T extends string>({
    label,
    options,
    value,
    onChange,
}: {
    label: string;
    options: Array<{ value: T; label: string }>;
    value: T;
    onChange: (v: T) => void;
}) {
    return (
        <div>
            <span className="form-label text-sm">{label}</span>
            <div
                role="radiogroup"
                aria-label={label}
                className="grid gap-1 p-1 rounded-lg bg-bg-page border border-border-default"
                style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}
            >
                {options.map((o) => (
                    <button
                        key={o.value}
                        type="button"
                        role="radio"
                        aria-checked={value === o.value}
                        onClick={() => onChange(o.value)}
                        className={`min-h-[38px] px-2 rounded-md text-sm font-semibold transition-colors cursor-pointer ${
                            value === o.value
                                ? 'bg-brand-navy text-white shadow-sm'
                                : 'text-text-muted hover:text-brand-navy'
                        }`}
                    >
                        {o.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

/** Labelled toggle row with a yellow switch. */
export function ToggleRow({
    label,
    hint,
    checked,
    onChange,
}: {
    label: string;
    hint?: string;
    checked: boolean;
    onChange: (v: boolean) => void;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className="w-full flex items-center justify-between gap-3 py-2.5 px-3 rounded-lg border border-border-default bg-bg-section text-left hover:border-brand-navy/40 transition-colors cursor-pointer"
        >
            <span>
                <span className="block text-sm font-semibold text-text-main">{label}</span>
                {hint && <span className="block text-xs text-text-muted">{hint}</span>}
            </span>
            <span
                aria-hidden="true"
                className={`relative shrink-0 w-11 h-6 rounded-full transition-colors ${
                    checked ? 'bg-brand-yellow' : 'bg-border-default'
                }`}
            >
                <span
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                        checked ? 'left-[22px]' : 'left-0.5'
                    }`}
                />
            </span>
        </button>
    );
}

/** Left-hand inputs card with a safety-stripe header. */
export function JobCard({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="panel overflow-hidden bg-bg-section shadow-sm">
            <div className="relative px-5 py-3.5 bg-brand-navy">
                <div
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-1"
                    style={{
                        background:
                            'repeating-linear-gradient(-45deg, var(--color-brand-yellow) 0 10px, var(--color-brand-navy) 10px 20px)',
                    }}
                />
                <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-white m-0">
                    {title}
                </h2>
            </div>
            <div className="p-5 space-y-4">{children}</div>
        </section>
    );
}

/** Navy "blueprint" frame for the live SVG preview. */
export function BlueprintPanel({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <section className="panel overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-5 py-3 bg-bg-section border-b border-border-default">
                <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-brand-navy m-0">
                    {title}
                </h2>
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-text-muted">
                    Live preview — updates as you type
                </span>
            </div>
            <div className="relative bg-brand-navy p-4 sm:p-6">
                {/* blueprint grid */}
                <div
                    aria-hidden="true"
                    className="absolute inset-0 opacity-[0.13]"
                    style={{
                        backgroundImage:
                            'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
                        backgroundSize: '24px 24px',
                    }}
                />
                <div className="relative">{children}</div>
            </div>
        </section>
    );
}
