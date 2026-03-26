import React from 'react';

/* ─── Shared types for calculator pages ─── */

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
    /** Pre-rendered results node (e.g. <ResultCard />) */
    resultsSlot?: React.ReactNode;
    /** Calculate button handler */
    onCalculate: () => void;
    /** Reset button handler */
    onReset: () => void;
    /** Whether calculation is in progress */
    isCalculating?: boolean;
    /** Optional error message to display */
    error?: string | null;
}

/* ─── Error Alert ─── */
function ErrorAlert({ message }: { message: string }) {
    return (
        <div className="p-4 rounded-[--radius-card] bg-[--color-destructive]/10 border border-[--color-destructive]/20 text-[--color-destructive] text-sm font-medium">
            {message}
        </div>
    );
}

/* ─── Empty state for results panel ─── */
function ResultsEmptyState() {
    return (
        <div className="text-center py-12 px-4">
            <h3 className="text-sm font-medium text-[--color-surface-foreground] mb-1">No results yet</h3>
            <p className="text-sm text-[--color-muted-foreground]">
                Enter your measurements and click calculate to see the results.
            </p>
        </div>
    );
}

/* ─── Main Calculator Layout ─── */
export default function CalculatorLayout({
    title,
    description,
    fieldGroups,
    resultsSlot,
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
                                className="card space-y-4"
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
                            className="btn-primary w-full lg:w-auto active:scale-[0.98]"
                        >
                            {isCalculating ? 'Calculating...' : 'Calculate'}
                        </button>

                        {/* Reset link */}
                        {(resultsSlot || error) && (
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
              ${resultsSlot
                                ? 'bg-[--color-surface] border-[--color-success]/30 shadow-sm'
                                : 'bg-[--color-surface] border-[--color-border]'
                            }
            `}
                    >
                        <div className="p-6">
                            <h2 className="text-sm font-semibold text-[--color-muted-foreground] uppercase tracking-wider mb-4">
                                Results
                            </h2>
                            {resultsSlot ?? <ResultsEmptyState />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
