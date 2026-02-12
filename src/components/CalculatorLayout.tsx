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
    /** Optional error message to display */
    error?: string | null;
}

/* ─── Sub-components ─── */
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

/* ─── Error Alert ─── */
function ErrorAlert({ message }: { message: string }) {
    return (
        <div className="p-4 rounded-[--radius-card] bg-[--color-destructive]/10 border border-[--color-destructive]/20 text-[--color-destructive] text-sm font-medium flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
            <span>{message}</span>
        </div>
    );
}

/* ─── Empty state for results panel ─── */
function ResultsEmptyState() {
    return (
        <div className="text-center py-12 px-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[--color-muted] mb-4 text-[--color-muted-foreground]">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
            </div>
            <h3 className="text-sm font-medium text-[--color-surface-foreground] mb-1">No results yet</h3>
            <p className="text-sm text-[--color-muted-foreground]">
                Enter your measurements and click calculate to see the results.
            </p>
        </div>
    );
}

/* ─── Results panel with items ─── */
function ResultsPanel({ results }: { results: ResultItem[] }) {
    return (
        <div className="space-y-4">
            {results.map((item, index) => (
                <div
                    key={index}
                    className={`
            p-4 rounded-lg flex items-center justify-between
            ${item.primary
                            ? 'bg-[--color-brand-blue]/5 border border-[--color-brand-blue]/10'
                            : 'bg-transparent border-b border-[--color-border] last:border-0'
                        }
          `}
                >
                    <span className={`text-sm ${item.primary ? 'font-medium text-[--color-brand-blue]' : 'text-[--color-muted-foreground]'}`}>
                        {item.label}
                    </span>
                    <span className={`font-bold ${item.primary ? 'text-lg text-[--color-brand-blue]' : 'text-[--color-surface-foreground]'}`}>
                        {item.value}
                    </span>
                </div>
            ))}
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
    error,
}: CalculatorLayoutProps) {
    return (
        <div className="space-y-8">
            {/* ... Page Header ... */}
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
                    {error && <ErrorAlert message={error} />}

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
                        {(hasResults || error) && (
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
