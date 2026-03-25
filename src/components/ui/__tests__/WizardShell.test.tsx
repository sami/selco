import { test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WizardShell } from '../WizardShell';

const steps = [{ label: 'Room Details' }, { label: 'Tile Spec' }, { label: 'Summary' }];

test('renders all step labels', () => {
    render(<WizardShell steps={steps} currentStep={0} onNext={() => {}} onBack={() => {}}><div /></WizardShell>);
    expect(screen.getByText('Room Details')).toBeInTheDocument();
    expect(screen.getByText('Tile Spec')).toBeInTheDocument();
    expect(screen.getByText('Summary')).toBeInTheDocument();
});

test('renders children content', () => {
    render(
        <WizardShell steps={steps} currentStep={0} onNext={() => {}} onBack={() => {}}>
            <div>Step content here</div>
        </WizardShell>
    );
    expect(screen.getByText('Step content here')).toBeInTheDocument();
});

test('Back button is disabled on first step (currentStep=0)', () => {
    render(<WizardShell steps={steps} currentStep={0} onNext={() => {}} onBack={() => {}}><div /></WizardShell>);
    expect(screen.getByRole('button', { name: /back/i })).toBeDisabled();
});

test('Back button is enabled on steps after the first', () => {
    render(<WizardShell steps={steps} currentStep={1} onNext={() => {}} onBack={() => {}}><div /></WizardShell>);
    expect(screen.getByRole('button', { name: /back/i })).not.toBeDisabled();
});

test('renders Next button with btn-accent class on non-last step', () => {
    render(<WizardShell steps={steps} currentStep={0} onNext={() => {}} onBack={() => {}}><div /></WizardShell>);
    const nextBtn = screen.getByRole('button', { name: /next/i });
    expect(nextBtn).toBeInTheDocument();
    expect(nextBtn).toHaveClass('btn-accent');
});

test('renders Calculate button with btn-primary class on last step', () => {
    render(
        <WizardShell steps={steps} currentStep={2} onNext={() => {}} onBack={() => {}} onCalculate={() => {}}>
            <div />
        </WizardShell>
    );
    expect(screen.getByRole('button', { name: /calculate/i })).toHaveClass('btn-primary');
    expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument();
});

test('Back button has btn-ghost class', () => {
    render(<WizardShell steps={steps} currentStep={1} onNext={() => {}} onBack={() => {}}><div /></WizardShell>);
    expect(screen.getByRole('button', { name: /back/i })).toHaveClass('btn-ghost');
});

test('calls onNext when Next button is clicked', () => {
    const onNext = vi.fn();
    render(<WizardShell steps={steps} currentStep={0} onNext={onNext} onBack={() => {}}><div /></WizardShell>);
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(onNext).toHaveBeenCalledOnce();
});

test('calls onBack when Back button is clicked', () => {
    const onBack = vi.fn();
    render(<WizardShell steps={steps} currentStep={1} onNext={() => {}} onBack={onBack}><div /></WizardShell>);
    fireEvent.click(screen.getByRole('button', { name: /back/i }));
    expect(onBack).toHaveBeenCalledOnce();
});

test('calls onCalculate when Calculate button is clicked on last step', () => {
    const onCalculate = vi.fn();
    render(
        <WizardShell steps={steps} currentStep={2} onNext={() => {}} onBack={() => {}} onCalculate={onCalculate}>
            <div />
        </WizardShell>
    );
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));
    expect(onCalculate).toHaveBeenCalledOnce();
});
