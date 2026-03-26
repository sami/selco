import type { ReactNode } from 'react';

interface Step {
    label: string;
    optional?: boolean;
}

interface WizardShellProps {
    steps: Step[];
    currentStep: number;
    onNext: () => void;
    onBack: () => void;
    onCalculate?: () => void;
    onSkip?: () => void;
    onStartOver?: () => void;
    children: ReactNode;
}

export function WizardShell({
    steps,
    currentStep,
    onNext,
    onBack,
    onCalculate,
    onSkip,
    onStartOver,
    children,
}: WizardShellProps) {
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === steps.length - 1;

    return (
        <div>
            {/* Progress bar */}
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    {steps.map((_, index) => (
                        <div
                            key={index}
                            className={`flex-1 h-2 rounded-full transition-colors ${
                                index <= currentStep ? 'bg-brand-blue' : 'bg-muted/40'
                            }`}
                        />
                    ))}
                </div>
                <p className="text-sm text-text-muted font-medium">
                    Step {currentStep + 1} of {steps.length} — {steps[currentStep]?.label}
                </p>
            </div>

            {/* Step content */}
            <div className="mt-6">{children}</div>

            {/* Navigation */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <button
                    type="button"
                    className="btn-ghost"
                    onClick={onBack}
                    disabled={isFirstStep}
                >
                    Back
                </button>

                <div className="flex flex-wrap gap-3">
                    {isLastStep ? (
                        <>
                            {onCalculate && (
                                <button type="button" className="btn-primary" onClick={onCalculate}>
                                    Calculate
                                </button>
                            )}
                            {onStartOver && (
                                <button type="button" className="btn-ghost" onClick={onStartOver}>
                                    Start over
                                </button>
                            )}
                        </>
                    ) : (
                        <>
                            {steps[currentStep]?.optional && onSkip && (
                                <button type="button" className="btn-ghost" onClick={onSkip}>
                                    Skip this step
                                </button>
                            )}
                            <button type="button" className="btn-accent" onClick={onNext}>
                                Next
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
