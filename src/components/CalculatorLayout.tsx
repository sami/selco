import React from 'react';

/* ─── Shared types for calculator pages ─── */

/** A single result line displayed in the results panel */
export interface ResultItem {
    label: string;
    value: string;
    /** Whether this is the primary/hero result */
    primary?: boolean;
}

/** A group of related form fields */
export interface FieldGroup {
    legend: string;
    children: React.ReactNode;
}

/** Props for the CalculatorLayout component */
export interface CalculatorLayoutProps {
    /** Calculator title (e.g. "Tile Calculator") */
    title: string;
    /** Short description of what this calculator does */
    description: string;
    /** Grouped form field sections */
    fieldGroups: FieldGroup[];
    /** Results to display (empty array = show empty state) */
    results: ResultItem[];
    /** Whether the calculator has been calculated at least once */
    hasResults: boolean;
    /** Calculate button handler */
    onCalculate: () => void;
    /** Reset button handler */
    onReset: () => void;
    /** Whether calculation is in progress */
    isCalculating?: boolean;
}

/* ─── Sub-components ─── */

/** Reusable form input with label and optional unit suffix */
export interface FormInputProps {
    id: string;
    label: string;
    unit?: string;
    type?: 'number' | 'text';
    value: string | number;
    onChange: (value: string) => void;
    placeholder?: string;
    min?: number;
    max?: number;
    step?: number | string;
    required?: boolean;
}

export function FormInput({
    id,
    label,
    unit,
    type = 'number',
    value,
    onChange,
    placeholder,
    min,
    max,
    step,
    required = false,
}: FormInputProps) {
    return (
        <div className="space-y-1.5">
            <label htmlFor={id} className="block text-sm font-medium text-[--color-surface-foreground]">
                {label}
            </label>
            <div className="relative">
                <input
                    id={id}
                    name={id}
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    min={min}
                    max={max}
                    step={step}
                    required={required}
                    className={`
            w-full h-11 px-4 bg-[--color-surface] border border-[--color-border]
            rounded-[--radius-input] text-sm text-[--color-surface-foreground]
            placeholder:text-[--color-muted-foreground]
            focus:outline-none focus:ring-2 focus:ring-[--color-brand-blue]/30 focus:border-[--color-brand-blue]/40
            transition-all
            ${unit ? 'pr-16' : ''}
          `}
                />
                {unit && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-xs text-[--color-muted-foreground] pointer-events-none">
                        {unit}
                    </span>
                )}
            </div>
        </div>
    );
}

/** Reusable select dropdown with label */
export interface FormSelectProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
}

export function FormSelect({ id, label, value, onChange, options }: FormSelectProps) {
    return (
        <div className="space-y-1.5">
            <label htmlFor={id} className="block text-sm font-medium text-[--color-surface-foreground]">
                {label}
            </label>
            <select
                id={id}
                name={id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="
          w-full h-11 px-4 bg-[--color-surface] border border-[--color-border]
          rounded-[--radius-input] text-sm text-[--color-surface-foreground]
          focus:outline-none focus:ring-2 focus:ring-[--color-brand-blue]/30 focus:border-[--color-brand-blue]/40
          transition-all appearance-none cursor-pointer
        "
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

/* ─── Empty state for results panel ─── */
function ResultsEmptyState() {
    return (
        <div className="flex flex-col items-center justify-center text-center py-12 px-6">
            <p className="font-medium text-[--color-surface-foreground] text-sm">
                Enter your measurements to see results
            </p>
            <p className="text-xs text-[--color-muted-foreground] mt-1">
                Fill in the form and hit Calculate.
            </p>
        </div>
    );
}

/* ─── Results panel with items ─── */
function ResultsPanel({ results }: { results: ResultItem[] }) {
    const primary = results.find((r) => r.primary);
    const secondary = results.filter((r) => !r.primary);

    return (
        <div className="space-y-5">
            {primary && (
                <div className="text-center py-4">
                    <p className="text-3xl font-bold text-[--color-surface-foreground]">{primary.value}</p>
                    <p className="text-sm text-[--color-muted-foreground] mt-1">{primary.label}</p>
                </div>
            )}
            {secondary.length > 0 && (
                <div className="space-y-3 border-t border-[--color-border] pt-4">
                    {secondary.map((item, i) => (
                        <div key={i}>
                            <p className="text-xs text-[--color-muted-foreground]">{item.label}</p>
                            <p className="text-sm font-semibold text-[--color-surface-foreground]">{item.value}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ─── Main Calculator Layout ─── */
export default function CalculatorLayout({
    title,
    description,
    fieldGroups,
    results,
    hasResults,
    onCalculate,
    onReset,
    isCalculating = false,
}: CalculatorLayoutProps) {
    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-xl md:text-2xl font-bold text-[--color-surface-foreground] tracking-tight">
                    {title}
                </h1>
                <p className="text-sm text-[--color-muted-foreground]">{description}</p>
            </div>

            {/* Two-column layout */}
            <div className="grid lg:grid-cols-5 gap-6 lg:gap-8 items-start">
                {/* Left — Input Form */}
                <div className="lg:col-span-3 space-y-6">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            onCalculate();
                        }}
                        className="space-y-6"
                    >
                        {fieldGroups.map((group, i) => (
                            <fieldset
                                key={i}
                                className="p-5 bg-[--color-surface] rounded-[--radius-card] border border-[--color-border] space-y-4"
                            >
                                <legend className="text-sm font-semibold text-[--color-surface-foreground] px-1">
                                    {group.legend}
                                </legend>
                                {group.children}
                            </fieldset>
                        ))}

                        {/* Calculate Button */}
                        <button
                            type="submit"
                            disabled={isCalculating}
                            className="
                w-full lg:w-auto px-8 h-12 font-bold text-sm
                bg-[--color-brand-yellow] text-[--color-brand-blue]
                rounded-[--radius-button] shadow-sm
                hover:brightness-105 active:scale-[0.98]
                disabled:opacity-60 disabled:cursor-not-allowed
                transition-all duration-150
                focus-ring
              "
                        >
                            {isCalculating ? 'Calculating...' : 'Calculate'}
                        </button>

                        {/* Reset link */}
                        {hasResults && (
                            <button
                                type="button"
                                onClick={onReset}
                                className="block text-sm text-[--color-muted-foreground] hover:text-[--color-brand-blue] transition-colors ml-1 mt-2"
                            >
                                Reset values
                            </button>
                        )}
                    </form>
                </div>

                {/* Right — Results Panel */}
                <div className="lg:col-span-2 lg:sticky lg:top-24">
                    <div
                        className={`
              rounded-[--radius-card] border transition-colors duration-300
              ${hasResults
                                ? 'bg-[--color-surface] border-[--color-success]/30 shadow-sm'
                                : 'bg-[--color-surface] border-[--color-border]'
                            }
            `}
                    >
                        <div className="p-6">
                            <h2 className="text-sm font-semibold text-[--color-muted-foreground] uppercase tracking-wider mb-4">
                                Results
                            </h2>
                            {hasResults ? <ResultsPanel results={results} /> : <ResultsEmptyState />}
                        </div>

                        {/* Future: Save to Project */}
                        {hasResults && (
                            <div className="border-t border-[--color-border] p-4">
                                <button
                                    type="button"
                                    disabled
                                    className="
                    w-full h-10 text-sm font-medium
                    text-[--color-muted-foreground] bg-[--color-muted]
                    rounded-[--radius-button]
                    cursor-not-allowed opacity-60
                    flex items-center justify-center gap-2
                  "
                                >
                                    Save to project (coming soon)
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
