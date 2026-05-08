# Phase 3.1 — Refactor TilingProjectWizard

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor TilingProjectWizard to use `WizardShell` for step navigation and `ProductSelector` for product dropdowns, completing the design system integration for the tiling wizard.

**Architecture:** Extend `WizardShell` to support optional/skippable steps and a "Start over" action. Then replace the bespoke step navigation UI in `TilingProjectWizard` with `WizardShell`, and replace all product `<FormField type="select">` instances with `ProductSelector`. All state management, calculation logic, and step content stay unchanged.

**Tech Stack:** React 18, TypeScript, Vitest + Testing Library, Tailwind v4

**Branch:** `claude/pedantic-hypatia`

---

### Task 1: Extend WizardShell to support optional steps, skip, and start over

**Files:**
- Modify: `src/components/ui/WizardShell.tsx`
- Modify: `src/components/ui/__tests__/WizardShell.test.tsx`

**Step 1: Update the Step interface and WizardShellProps**

```tsx
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
    onSkip?: () => void;          // NEW — called when Skip is clicked on an optional step
    onStartOver?: () => void;     // NEW — shown on the last step instead of Calculate
    children: ReactNode;
}
```

**Step 2: Update the step indicator to use progress bars (not text labels)**

Replace the current `<ol>` text list with filled progress bars matching the TilingProjectWizard pattern:

```tsx
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
```

**Step 3: Update the footer navigation buttons**

Replace the current button rendering with:

```tsx
<div className="flex flex-wrap items-center justify-between gap-4">
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
```

**Step 4: Update tests**

Add tests for new behaviour:

```tsx
test('shows Skip button on optional steps when onSkip provided', () => {
    const onSkip = vi.fn();
    render(
        <WizardShell
            steps={[{ label: 'Step 1' }, { label: 'Optional', optional: true }]}
            currentStep={1}
            onNext={() => {}}
            onBack={() => {}}
            onSkip={onSkip}
        >
            Content
        </WizardShell>
    );
    const skipBtn = screen.getByText('Skip this step');
    fireEvent.click(skipBtn);
    expect(onSkip).toHaveBeenCalled();
});

test('does not show Skip button on non-optional steps', () => {
    render(
        <WizardShell
            steps={[{ label: 'Required' }, { label: 'Also required' }]}
            currentStep={0}
            onNext={() => {}}
            onBack={() => {}}
            onSkip={() => {}}
        >
            Content
        </WizardShell>
    );
    expect(screen.queryByText('Skip this step')).not.toBeInTheDocument();
});

test('shows Start over button on last step when onStartOver provided', () => {
    const onStartOver = vi.fn();
    render(
        <WizardShell
            steps={[{ label: 'Step 1' }, { label: 'Summary' }]}
            currentStep={1}
            onNext={() => {}}
            onBack={() => {}}
            onStartOver={onStartOver}
        >
            Content
        </WizardShell>
    );
    const btn = screen.getByText('Start over');
    fireEvent.click(btn);
    expect(onStartOver).toHaveBeenCalled();
});

test('renders progress bar with correct filled segments', () => {
    render(
        <WizardShell
            steps={[{ label: 'A' }, { label: 'B' }, { label: 'C' }]}
            currentStep={1}
            onNext={() => {}}
            onBack={() => {}}
        >
            Content
        </WizardShell>
    );
    expect(screen.getByText('Step 2 of 3 — B')).toBeInTheDocument();
});
```

Update existing tests if they assert on the old `<ol>` step indicator markup — the progress bar no longer renders step labels in a list.

**Step 5: Run tests**

Run: `npx vitest run src/components/ui/__tests__/WizardShell.test.tsx`
Expected: all pass

**Step 6: Commit**

```bash
git add src/components/ui/WizardShell.tsx src/components/ui/__tests__/WizardShell.test.tsx
git commit -m "feat(ui): extend WizardShell with optional steps, skip, start over, progress bar"
```

---

### Task 2: Replace product FormField selects with ProductSelector in TilingProjectWizard

**Files:**
- Modify: `src/components/TilingProjectWizard.tsx`

**Step 1: Add ProductSelector import**

```tsx
import { ProductSelector } from './ui/ProductSelector';
```

**Step 2: Replace 5 product `<FormField type="select">` instances with `<ProductSelector>`**

The `ProductSelector` accepts `products: { id: string; name: string; brand?: string }[]`, `value: string | null`, and `onChange: (e: ChangeEvent<HTMLSelectElement>) => void`.

All 5 product arrays (`GROUT_PRODUCTS`, `PRIMER_PRODUCTS`, `BACKER_BOARD_PRODUCTS`, `TANKING_PRODUCTS`, `SLC_PRODUCTS`) already have `{ id, name, brand }` fields — they match `ProductSelector`'s `Product` interface directly. No mapping needed.

**Grout product** (~line 638):
```tsx
// OLD:
<FormField
    type="select"
    id="grout-product"
    label="Grout product"
    value={selectedGroutProduct}
    onChange={(e) => setSelectedGroutProduct(e.target.value)}
    options={GROUT_PRODUCTS
        .filter(p => application !== 'floor' || !p.restrictions?.includes('walls-only'))
        .map(p => ({ value: p.id, label: `${p.brand} ${p.name}` }))}
/>

// NEW:
<ProductSelector
    id="grout-product"
    label="Grout product"
    products={GROUT_PRODUCTS.filter(p => application !== 'floor' || !p.restrictions?.includes('walls-only'))}
    value={selectedGroutProduct}
    onChange={(e) => setSelectedGroutProduct(e.target.value)}
/>
```

**Primer product** (~line 739):
```tsx
<ProductSelector
    id="primer-product"
    label="Product"
    products={PRIMER_PRODUCTS}
    value={selectedPrimerProduct}
    onChange={(e) => setSelectedPrimerProduct(e.target.value)}
/>
```

**Backer board product** (~line 784):
```tsx
<ProductSelector
    id="backer-product"
    label="Product"
    products={BACKER_BOARD_PRODUCTS}
    value={selectedBackerProduct}
    onChange={(e) => setSelectedBackerProduct(e.target.value)}
/>
```

**Tanking product** (~line 838):
```tsx
<ProductSelector
    id="tanking-product"
    label="Product"
    products={TANKING_PRODUCTS}
    value={selectedTankingProduct}
    onChange={(e) => setSelectedTankingProduct(e.target.value)}
/>
```

**SLC product** (~line 878):
```tsx
<ProductSelector
    id="slc-product"
    label="Product"
    products={SLC_PRODUCTS}
    value={selectedSLCProduct}
    onChange={(e) => setSelectedSLCProduct(e.target.value)}
/>
```

**Step 3: Remove the FormField import if no longer used**

Check if any `<FormField>` instances remain. If none, remove the import. If some non-product FormFields remain, keep the import.

**Step 4: Run type check**

Run: `npx tsc --noEmit`
Expected: no new errors

**Step 5: Commit**

```bash
git add src/components/TilingProjectWizard.tsx
git commit -m "refactor(tiling-wizard): replace product FormFields with ProductSelector"
```

---

### Task 3: Replace bespoke step navigation with WizardShell

**Files:**
- Modify: `src/components/TilingProjectWizard.tsx`

**Step 1: Add WizardShell import**

```tsx
import { WizardShell } from './ui/WizardShell';
```

**Step 2: Build the steps array for WizardShell**

The wizard already has a `steps` array (line ~122). It has shape `{ id: StepId; label: string; optional?: boolean }[]`. `WizardShell` expects `{ label: string; optional?: boolean }[]`. The existing array is already compatible — just pass it directly.

**Step 3: Wrap the step content with WizardShell**

Replace the outer `return` structure. Currently it looks like:

```tsx
return (
    <div className="space-y-8">
        {/* Progress bar (lines 410-420) */}
        <div className="space-y-2">...</div>

        {/* Step content (lines 422-1005) */}
        {currentStep?.id === 'setup' && (...)}
        {currentStep?.id === 'tiles' && (...)}
        ...

        {/* Footer buttons (lines 1008-1038) */}
        <div className="flex flex-wrap items-center justify-between gap-4">...</div>
    </div>
);
```

Replace with:

```tsx
return (
    <WizardShell
        steps={steps}
        currentStep={currentIndex}
        onNext={goNext}
        onBack={goBack}
        onSkip={() => currentStep && handleSkip(currentStep.id)}
        onStartOver={() => setCurrentIndex(0)}
    >
        {/* All step content stays exactly as-is */}
        {currentStep?.id === 'setup' && (...)}
        {currentStep?.id === 'tiles' && (...)}
        ...
    </WizardShell>
);
```

**Step 4: Delete the bespoke progress bar and footer buttons**

Remove:
- The progress bar div (lines ~410-420): `<div className="space-y-2"><div className="flex items-center gap-2">...`
- The footer buttons div (lines ~1008-1038): `<div className="flex flex-wrap items-center justify-between gap-4">...`

These are now rendered by `WizardShell`.

**Step 5: Delete the inline Skip buttons from optional step content**

The optional steps (primer, backer, tanking, SLC) each have their own Skip button inside the step content, e.g.:
```tsx
<button onClick={() => handleSkip('backer')} className="btn-ghost">Skip this step</button>
```

These are now redundant — `WizardShell` renders the Skip button in the footer for any step with `optional: true`. **Remove these inline Skip buttons** from the 4 optional step sections.

**Step 6: Run full test suite**

Run: `npx vitest run`
Expected: all pass

**Step 7: Commit**

```bash
git add src/components/TilingProjectWizard.tsx
git commit -m "refactor(tiling-wizard): replace bespoke navigation with WizardShell"
```

---

## Summary of changes

| File | Action | Notes |
|------|--------|-------|
| `src/components/ui/WizardShell.tsx` | Modify | Add optional steps, skip, start over, progress bar |
| `src/components/ui/__tests__/WizardShell.test.tsx` | Modify | Tests for new features |
| `src/components/TilingProjectWizard.tsx` | Modify | ProductSelector + WizardShell integration |
