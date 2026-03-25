import type { ReactNode } from 'react';

interface Step {
    label: string;
}

interface WizardShellProps {
    steps: Step[];
    currentStep: number;
    onNext: () => void;
    onBack: () => void;
    onCalculate?: () => void;
    children: ReactNode;
}

export function WizardShell({
    steps,
    currentStep,
    onNext,
    onBack,
    onCalculate,
    children,
}: WizardShellProps) {
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === steps.length - 1;

    return (
        <div>
            {/* Step indicator */}
            <nav aria-label="Wizard steps">
                <ol className="flex gap-4">
                    {steps.map((step, index) => (
                        <li
                            key={index}
                            className={`text-sm font-medium ${index === currentStep ? 'text-brand-navy' : 'text-text-muted'}`}
                            aria-current={index === currentStep ? 'step' : undefined}
                        >
                            {step.label}
                        </li>
                    ))}
                </ol>
            </nav>

            {/* Step content */}
            <div className="mt-6">{children}</div>

            {/* Navigation */}
            <div className="mt-6 flex items-center gap-3">
                <button
                    type="button"
                    className="btn-ghost"
                    onClick={onBack}
                    disabled={isFirstStep}
                >
                    Back
                </button>

                {isLastStep ? (
                    <button
                        type="button"
                        className="btn-primary"
                        onClick={onCalculate}
                    >
                        Calculate
                    </button>
                ) : (
                    <button
                        type="button"
                        className="btn-accent"
                        onClick={onNext}
                    >
                        Next
                    </button>
                )}
            </div>
        </div>
    );
}
