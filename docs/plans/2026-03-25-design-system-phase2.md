# Design System Phase 2 — Wire UI Components to Calculators



**Goal:** Refactor all calculator React components to use the Phase 1 shared `ui/` components (`FormField`, `NumberInput`, `ResultCard`, `MaterialsList`) instead of `CalculatorLayout`'s inline sub-components, and pipe `MaterialQuantity[]` directly from pure calculators into the results UI.

**Architecture:** Approach A — keep `CalculatorLayout` as a thin layout shell (page header, responsive two-column grid, form wrapper, Calculate/Reset buttons). Strip its sub-components (`FormInput`, `FormSelect`, `ResultsPanel`, `ErrorAlert`, `ResultsEmptyState`). The layout now accepts a `resultsSlot: ReactNode` instead of `ResultItem[]`. Each calculator composes its inputs from `ui/NumberInput` + `ui/FormField` and passes `<ResultCard materials={result.materials} />` into the results slot. `ConversionsCalculator` is **out of scope** — it has a bespoke tabbed UI with no `CalculatorLayout` dependency.

**Tech Stack:** React 18, TypeScript, Vitest + Testing Library, Astro (pages unchanged), Tailwind v4 (global.css tokens)

**Branch:** `wt/pedantic-hypatia` (all work continues here — Phase 1 UI components already exist)

---

## API alignment note

Phase 1's `NumberInput` uses `onChange: (e: ChangeEvent<HTMLInputElement>) => void` and `value: number | ''`.
The current calculators use string state (`useState('')`) and `onChange: (value: string) => void`.

**Decision:** Adapt `NumberInput` to the calculator convention — change to `onChange: (value: string) => void` and `value: string | number`. This minimises the diff across 5 calculator files and matches the existing `FormInput` API that all calculators already use. Phase 1 tests update trivially.

---

### Task 1: Adapt `NumberInput` API to match calculator convention

**Files:**
- Modify: `src/components/ui/NumberInput.tsx`
- Modify: `src/components/ui/__tests__/NumberInput.test.tsx`

**Step 1: Update `NumberInput` props and handler**

Change `NumberInputProps`:
```tsx
interface NumberInputProps {
    id: string;
    label: string;
    value: string | number;                   // was: number | ''
    onChange: (value: string) => void;         // was: (e: ChangeEvent) => void
    unit?: string;
    min?: number;
    max?: number;
    step?: number;
    placeholder?: string;                     // add: matches FormInput
    error?: string;
    helperText?: string;
    required?: boolean;
    disabled?: boolean;
}
```

Update the `<input>` onChange handler:
```tsx
onChange={(e) => onChange(e.target.value)}
```

Add `placeholder` prop pass-through to `<input>`.

**Step 2: Update tests to use new API**

Every test that passes `onChange` should pass `(value: string) => void` instead of a mock expecting a ChangeEvent. Example:

```tsx
test('calls onChange with string value', () => {
    const onChange = vi.fn();
    render(<NumberInput id="area" label="Area" value="10" onChange={onChange} />);
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '20' } });
    expect(onChange).toHaveBeenCalledWith('20');
});
```

**Step 3: Run tests**

Run: `npx vitest run src/components/ui/__tests__/NumberInput.test.tsx`
Expected: all pass

**Step 4: Commit**

```bash
git add src/components/ui/NumberInput.tsx src/components/ui/__tests__/NumberInput.test.tsx
git commit -m "refactor(ui): align NumberInput API to (value: string) convention"
```

---

### Task 2: Slim down `CalculatorLayout` — extract results slot

**Files:**
- Modify: `src/components/CalculatorLayout.tsx`

**Step 1: Replace `results`/`hasResults` props with `resultsSlot`**

New `CalculatorLayoutProps`:
```tsx
export interface CalculatorLayoutProps {
    title: string;
    description: string;
    fieldGroups: FieldGroup[];
    resultsSlot?: React.ReactNode;           // replaces results + hasResults
    onCalculate: () => void;
    onReset: () => void;
    isCalculating?: boolean;
    error?: string | null;
}
```

Keep `FieldGroup` and `ErrorAlert` (both are still useful).

**Step 2: Update the results panel area**

Replace the `ResultsPanel`/`ResultsEmptyState` conditional with:
```tsx
{resultsSlot ?? <ResultsEmptyState />}
```

Keep the `ResultsEmptyState` component (it's used as the default when no `resultsSlot` is provided).

**Step 3: Keep `FormInput`, `FormSelect` exports temporarily**

Do NOT remove `FormInput` and `FormSelect` yet — the calculators still import them. They'll be replaced one-by-one in Tasks 3–7. We'll remove them in Task 8 after all calculators are migrated.

**Step 4: Mark deprecated exports with JSDoc**

Add `@deprecated Use NumberInput or FormField from ui/ instead` to `FormInput` and `FormSelect`.

**Step 5: Run build check**

Run: `npx astro check` (or `npx tsc --noEmit`)
Expected: no type errors

**Step 6: Commit**

```bash
git add src/components/CalculatorLayout.tsx
git commit -m "refactor(layout): replace ResultItem[] with resultsSlot ReactNode"
```

---

### Task 3: Migrate `TileCalculator`

**Files:**
- Modify: `src/components/TileCalculator.tsx`
- Create: `src/components/__tests__/TileCalculator.test.tsx`

**Step 1: Write a smoke test**

```tsx
import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TileCalculator from '../TileCalculator';

test('renders tile calculator with title and form', () => {
    render(<TileCalculator />);
    expect(screen.getByText('Tile Calculator')).toBeInTheDocument();
    expect(screen.getByLabelText(/width/i)).toBeInTheDocument();
});
```

Run: `npx vitest run src/components/__tests__/TileCalculator.test.tsx`
Expected: PASS (existing component renders fine)

**Step 2: Replace imports and results wiring**

Replace:
```tsx
import CalculatorLayout, { FormInput, FormSelect, type ResultItem, type FieldGroup } from './CalculatorLayout';
```

With:
```tsx
import CalculatorLayout, { type FieldGroup } from './CalculatorLayout';
import { NumberInput } from './ui/NumberInput';
import { FormField } from './ui/FormField';
import { ResultCard } from './ui/ResultCard';
```

Remove `results` and `hasResults` state variables. Keep `error` state.

After `calculateTiles()` call, store the result object:
```tsx
const [result, setResult] = useState<TileResult | null>(null);
```

In `handleCalculate`, replace the manual `ResultItem[]` mapping with:
```tsx
setResult(calculateTiles({ ... }));
```

In `handleReset`:
```tsx
setResult(null);
```

Build the `resultsSlot`:
```tsx
resultsSlot={result && <ResultCard title="Materials" materials={result.materials} warnings={result.warnings} />}
```

**Step 3: Replace `FormInput` → `NumberInput` in field groups**

Replace each `<FormInput>` with `<NumberInput>`. The API is now identical (after Task 1), so this is a 1:1 rename.

Replace each `<FormSelect>` with `<FormField type="select">`. Map the `onChange` handler:
- `FormSelect` uses `onChange: (value: string) => void`
- `FormField` uses `onChange: (e: ChangeEvent) => void`

So wrap: `onChange={(e) => handleSizeChange(e.target.value)}`

**Step 4: Run tests and build**

Run: `npx vitest run src/components/__tests__/TileCalculator.test.tsx`
Run: `npx astro check`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/TileCalculator.tsx src/components/__tests__/TileCalculator.test.tsx
git commit -m "refactor(tile): use ui/ components, pipe MaterialQuantity[] to ResultCard"
```

---

### Task 4: Migrate `AdhesiveCalculator`

**Files:**
- Modify: `src/components/AdhesiveCalculator.tsx`
- Create: `src/components/__tests__/AdhesiveCalculator.test.tsx`

**Same pattern as Task 3:**

1. Write smoke test (renders title + product select)
2. Replace imports: `NumberInput`, `FormField`, `ResultCard`
3. Replace `ResultItem[]` state → `AdhesiveResult | null` state
4. Map `result.materials` to `<ResultCard>`; pass `result.warnings`
5. Replace `FormInput` → `NumberInput`, `FormSelect` → `FormField type="select"`
6. The radio button group for application type is **custom UI** — leave as-is (it's not a standard select)
7. Run tests + build check
8. Commit: `refactor(adhesive): use ui/ components, pipe MaterialQuantity[] to ResultCard`

---

### Task 5: Migrate `GroutCalculator`

**Files:**
- Modify: `src/components/GroutCalculator.tsx`
- Create: `src/components/__tests__/GroutCalculator.test.tsx`

**Same pattern as Task 3:**

1. Write smoke test
2. Replace imports
3. `GroutResult | null` state replaces `ResultItem[]`
4. Pipe `result.materials` + `result.warnings` to `<ResultCard>`
5. Replace `FormInput` → `NumberInput`, `FormSelect` → `FormField type="select"`
6. Run tests + build
7. Commit: `refactor(grout): use ui/ components, pipe MaterialQuantity[] to ResultCard`

---

### Task 6: Migrate `SpacersCalculator`

**Files:**
- Modify: `src/components/SpacersCalculator.tsx`
- Create: `src/components/__tests__/SpacersCalculator.test.tsx`

**Same pattern as Task 3:**

1. Write smoke test
2. Replace imports
3. `SpacerResult | null` state replaces `ResultItem[]`
4. Pipe `result.materials` to `<ResultCard>`
5. Replace `FormInput` → `NumberInput`, `FormSelect` → `FormField type="select"`
6. Run tests + build
7. Commit: `refactor(spacers): use ui/ components, pipe MaterialQuantity[] to ResultCard`

---

### Task 7: Migrate `MasonryCalculator`

**Files:**
- Modify: `src/components/MasonryCalculator.tsx`
- Create: `src/components/__tests__/MasonryCalculator.test.tsx`

This is the most complex calculator (wall repeaters, opening repeaters, conditional block/cavity fields). The migration follows the same pattern but with extra care:

1. Write smoke test (renders title, wall type select, wall length/height inputs)
2. Replace imports
3. Store full `MasonryResult | null` instead of `ResultItem[]`
4. The masonry orchestrator on `pedantic-hypatia` already returns a combined `materials: MaterialQuantity[]` on `MasonryResult` — verify this. If it doesn't, build the materials array from the sub-results (bricks, blocks, mortar, ties, lintels, DPC, starters, insulation)
5. Pipe to `<ResultCard title="Materials" materials={result.materials} />`
6. Replace `FormInput` → `NumberInput` (wall length, height, waste, cavity width)
7. Replace `FormSelect` → `FormField type="select"` (wall type, block type, block width, mix ratio, sand bag size)
8. Repeater UI (add/remove wall sections, add/remove openings) stays as-is — these are custom components, not standard form fields
9. Run tests + build
10. Commit: `refactor(masonry): use ui/ components, pipe MaterialQuantity[] to ResultCard`

---

### Task 8: Remove deprecated exports from `CalculatorLayout`

**Files:**
- Modify: `src/components/CalculatorLayout.tsx`

**Step 1: Verify no remaining imports**

Run: `grep -r "FormInput\|FormSelect\|ResultItem\|ResultsPanel" src/components/ --include="*.tsx" | grep -v CalculatorLayout | grep -v __tests__`

Expected: no matches (all calculators now use `ui/` components)

**Step 2: Delete dead code**

Remove from `CalculatorLayout.tsx`:
- `ResultItem` interface
- `FormInputProps` interface + `FormInput` component
- `FormSelectProps` interface + `FormSelect` component
- `ResultsPanel` component

Keep:
- `FieldGroup` interface (still used by all calculators)
- `CalculatorLayoutProps` (updated in Task 2)
- `ErrorAlert` component (still used internally)
- `ResultsEmptyState` component (still used as default)
- The main `CalculatorLayout` component

**Step 3: Run full test suite**

Run: `npx vitest run`
Expected: all pass

**Step 4: Run build**

Run: `npx astro build`
Expected: clean build

**Step 5: Commit**

```bash
git add src/components/CalculatorLayout.tsx
git commit -m "chore: remove deprecated FormInput/FormSelect/ResultsPanel from CalculatorLayout"
```

---

## Summary of changes per file

| File | Action | Notes |
|------|--------|-------|
| `src/components/ui/NumberInput.tsx` | Modify | API: `onChange(value)`, `placeholder` |
| `src/components/ui/__tests__/NumberInput.test.tsx` | Modify | Match new API |
| `src/components/CalculatorLayout.tsx` | Modify | `resultsSlot` replaces `results[]`, strip sub-components last |
| `src/components/TileCalculator.tsx` | Modify | Use `ui/` components + `MaterialQuantity[]` |
| `src/components/AdhesiveCalculator.tsx` | Modify | Use `ui/` components + `MaterialQuantity[]` |
| `src/components/GroutCalculator.tsx` | Modify | Use `ui/` components + `MaterialQuantity[]` |
| `src/components/SpacersCalculator.tsx` | Modify | Use `ui/` components + `MaterialQuantity[]` |
| `src/components/MasonryCalculator.tsx` | Modify | Use `ui/` components + `MaterialQuantity[]` |
| `src/components/__tests__/*.test.tsx` | Create | Smoke tests for each calculator |
| `src/components/ConversionsCalculator.tsx` | **Untouched** | Bespoke UI, not materials-based |
