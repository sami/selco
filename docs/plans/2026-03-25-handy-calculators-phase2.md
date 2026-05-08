# Handy Calculators Phase 2 — Migrate CoverageCalculator & UnitConverter

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate the two remaining "handy" calculator components to use the shared `ui/` design system components (`NumberInput`, `FormField`), completing Phase 2 of the design system rollout.

**Architecture:** Both calculators keep their bespoke layouts (CoverageCalculator has a two-column card grid with preset buttons; UnitConverter has a tabbed interface with swap button). We only replace inline `<input>` and `<select>` elements with `NumberInput` and `FormField` from `ui/`. CoverageCalculator additionally swaps its inline results panel for `ResultCard` since the engine already returns `MaterialQuantity[]`. UnitConverter keeps its inline result display (it returns raw numbers, not materials).

**Tech Stack:** React 18, TypeScript, Vitest + Testing Library, Tailwind v4

**Branch:** `claude/pedantic-hypatia`

---

### Task 1: Migrate CoverageCalculator — replace inline inputs with ui/ components

**Files:**
- Modify: `src/components/calculators/CoverageCalculator.tsx`
- Create: `src/components/calculators/__tests__/CoverageCalculator.test.tsx`

**Step 1: Create smoke test**

```tsx
import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CoverageCalculator from '../CoverageCalculator';

test('renders coverage calculator with area input and board presets', () => {
    render(<CoverageCalculator />);
    expect(screen.getByLabelText(/total area/i)).toBeInTheDocument();
    expect(screen.getByText(/plasterboard/i)).toBeInTheDocument();
});
```

**Step 2: Run test to verify it passes with existing component**

Run: `npx vitest run src/components/calculators/__tests__/CoverageCalculator.test.tsx`
Expected: PASS

**Step 3: Replace imports and inline inputs**

Add imports:
```tsx
import { NumberInput } from '../ui/NumberInput';
import { ResultCard } from '../ui/ResultCard';
import type { BoardCoverageResult } from '../../calculators/types';
```

Replace inline `<input>` for area (lines 69-79) with:
```tsx
<NumberInput
    id="area-input"
    label="Total area to cover"
    value={areaStr}
    onChange={setAreaStr}
    unit="m²"
    placeholder="e.g. 15"
    min={0}
/>
```

Replace inline `<input>` for custom length (lines 124-133) with:
```tsx
<NumberInput
    id="custom-length"
    label="Length"
    value={customLengthStr}
    onChange={setCustomLengthStr}
    unit="m"
    placeholder="e.g. 2.4"
    min={0}
/>
```

Replace inline `<input>` for custom width (lines 137-146) with:
```tsx
<NumberInput
    id="custom-width"
    label="Width"
    value={customWidthStr}
    onChange={setCustomWidthStr}
    unit="m"
    placeholder="e.g. 1.2"
    min={0}
/>
```

**Step 4: Replace inline results with ResultCard**

Store the full result object:
```tsx
const [result, setResult] = useState<BoardCoverageResult | null>(null);
```

Compute result reactively (this calculator has no Calculate button — it updates live):
```tsx
// Replace the existing isValid / boards / maxAreaSqm logic with a useMemo:
const result = useMemo(() => {
    if (!isValid) return null;
    const input = selectedPresetId !== null
        ? { areaM2: parsedArea, presetId: selectedPresetId, wastagePercent: wastage }
        : {
            areaM2: parsedArea,
            customLengthMm: parseFloat(customLengthStr) * 1000,
            customWidthMm: parseFloat(customWidthStr) * 1000,
            wastagePercent: wastage,
        };
    return calculateBoardCoverage(input);
}, [isValid, parsedArea, selectedPresetId, wastage, customLengthStr, customWidthStr]);
```

Replace the right-side results card (lines 188-216) with:
```tsx
{result ? (
    <div className="w-full text-left">
        <h2 className="text-xl font-bold text-text-main mb-6">You will need to buy:</h2>
        <div className="text-4xl md:text-5xl font-extrabold text-primary-dark mb-4">
            {result.boardsNeeded} {result.boardsNeeded === 1 ? 'board' : 'boards'}
        </div>
        <ResultCard
            title="Materials"
            materials={result.materials}
        />
    </div>
) : (
    <div className="w-full text-left space-y-2">
        <h2 className="text-xl font-bold text-text-main mb-2">Result</h2>
        <p className="text-text-muted">
            Enter your project area and select a board size to calculate how many you need.
        </p>
    </div>
)}
```

**Keep unchanged:**
- Board preset buttons (custom UI, better UX than a dropdown)
- Wastage pill buttons (custom UI)
- Two-column card layout
- Live/reactive calculation (no Calculate button)

**Step 5: Run tests**

Run: `npx vitest run src/components/calculators/__tests__/CoverageCalculator.test.tsx`
Expected: PASS

**Step 6: Commit**

```bash
git add src/components/calculators/CoverageCalculator.tsx src/components/calculators/__tests__/CoverageCalculator.test.tsx
git commit -m "refactor(coverage): use NumberInput and ResultCard from ui/"
```

---

### Task 2: Migrate UnitConverter — replace inline inputs and selects with ui/ components

**Files:**
- Modify: `src/components/ConversionsCalculator.tsx`
- Create: `src/components/__tests__/ConversionsCalculator.test.tsx`

**Step 1: Create smoke test**

```tsx
import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ConversionsCalculator from '../ConversionsCalculator';

test('renders unit converter with value input and unit selects', () => {
    render(<ConversionsCalculator />);
    expect(screen.getByText('Unit Converter')).toBeInTheDocument();
    expect(screen.getByLabelText(/value/i)).toBeInTheDocument();
});
```

**Step 2: Run test to verify it passes**

Run: `npx vitest run src/components/__tests__/ConversionsCalculator.test.tsx`
Expected: PASS

**Step 3: Replace imports and inline elements**

Add imports:
```tsx
import { NumberInput } from './ui/NumberInput';
import { FormField } from './ui/FormField';
```

Replace inline `<input>` for value (lines 197-204 for standard, lines 163-172 for density) with `NumberInput`:
```tsx
<NumberInput
    id="convert-value"
    label="Value"
    value={inputValue}
    onChange={setInputValue}
    placeholder="Enter a value"
    min={0}
/>
```

And the density volume input:
```tsx
<NumberInput
    id="density-volume"
    label="Volume"
    value={inputValue}
    onChange={setInputValue}
    unit="m³"
    placeholder="Enter volume in cubic metres"
    min={0}
/>
```

Replace inline `<select>` elements for from/to units (lines 214-223, 237-246) with `FormField type="select"`:
```tsx
<FormField
    id="from-unit"
    label="From"
    type="select"
    value={fromUnit}
    onChange={(e) => setFromUnit(e.target.value)}
    options={options.map(o => ({ value: o.value, label: o.label }))}
/>
```

```tsx
<FormField
    id="to-unit"
    label="To"
    type="select"
    value={toUnit}
    onChange={(e) => setToUnit(e.target.value)}
    options={options.map(o => ({ value: o.value, label: o.label }))}
/>
```

Replace inline density material `<select>` (lines 178-187):
```tsx
<FormField
    id="density-material"
    label="Material"
    type="select"
    value={densityMaterial}
    onChange={(e) => setDensityMaterial(e.target.value as DensityMaterial)}
    options={materialOptions}
/>
```

**Keep unchanged:**
- Tabbed category selector buttons (custom UI)
- Swap button (⇄)
- Inline result display (not a materials calculator — no ResultCard)
- The `flex items-end gap-3` layout around From/Swap/To
- Live reactive calculation

**Step 4: Run tests**

Run: `npx vitest run src/components/__tests__/ConversionsCalculator.test.tsx`
Expected: PASS

**Step 5: Run full test suite**

Run: `npx vitest run`
Expected: all pass

**Step 6: Commit**

```bash
git add src/components/ConversionsCalculator.tsx src/components/__tests__/ConversionsCalculator.test.tsx
git commit -m "refactor(conversions): use NumberInput and FormField from ui/"
```

---

## Summary of changes

| File | Action | Notes |
|------|--------|-------|
| `src/components/calculators/CoverageCalculator.tsx` | Modify | NumberInput for 3 inputs, ResultCard for results |
| `src/components/calculators/__tests__/CoverageCalculator.test.tsx` | Create | Smoke test |
| `src/components/ConversionsCalculator.tsx` | Modify | NumberInput for value, FormField for selects |
| `src/components/__tests__/ConversionsCalculator.test.tsx` | Create | Smoke test |
