# Phase 4 — Layer 2 Orchestration Configs



**Goal:** Create Layer 2 orchestration configs for masonry and flooring projects (matching the existing `tiling.ts` pattern), then wire all three wizards to import step definitions from their configs instead of hardcoding them.

**Architecture:** Each config file defines the step sequence, shared inputs, and calculator-to-step mapping for a project type. Wizard components import the step array and pass it to `WizardShell`. The config is descriptive (documenting the contract), not generative (no dynamic form rendering). This ensures new wizards have a documented template to follow.

**Tech Stack:** TypeScript (pure data — no React, no DOM)

**Branch:** `wt/pedantic-hypatia`

---

### Task 1: Create masonry orchestration config

**Files:**
- Create: `src/projects/masonry.ts`

**Step 1: Create the config file**

Follow the `tiling.ts` pattern exactly. The file should contain:

```ts
/**
 * @file src/projects/masonry.ts
 *
 * Layer 2 orchestrator config for the Masonry project calculator.
 *
 * This file contains no calculation logic — it only describes the step
 * sequence, which Layer 1 calculators are involved, and which inputs are
 * shared between steps. The actual maths lives in src/calculators/.
 *
 * Consumed by MasonryProjectWizard.tsx to drive step ordering,
 * optional-step visibility, and the summary bill of materials.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MasonryWallType = 'brick' | 'block' | 'cavity';

export type MasonryMixRatio = '1:3' | '1:4';

/**
 * A single step in the masonry project wizard.
 */
export interface MasonryStepConfig {
    /** Unique step identifier. */
    id: string;
    /** The Layer 1 calculator module this step delegates to. */
    calculatorId: string;
    /** Human-readable label shown in the progress bar. */
    label: string;
    /** If true, the user can skip this step. */
    optional?: boolean;
    /** If set, step only shown for matching wall types. */
    wallTypeOnly?: MasonryWallType;
    /** Inputs that come from shared project state. */
    sharedInputs: readonly string[];
}

// ---------------------------------------------------------------------------
// Step sequence
// ---------------------------------------------------------------------------

export const MASONRY_STEPS: readonly MasonryStepConfig[] = [
    {
        id: 'wall-dimensions',
        calculatorId: 'setup',
        label: 'Wall dimensions',
        sharedInputs: [],
    },
    {
        id: 'wall-type',
        calculatorId: 'setup',
        label: 'Wall type & products',
        sharedInputs: ['wallAreaM2', 'wallLengthM'],
    },
    {
        id: 'openings',
        calculatorId: 'setup',
        label: 'Openings',
        optional: true,
        sharedInputs: ['wallAreaM2'],
    },
    {
        id: 'mortar-options',
        calculatorId: 'masonry-project',
        label: 'Mortar & options',
        sharedInputs: ['wallAreaM2', 'wallLengthM', 'wallType', 'openings'],
    },
    {
        id: 'summary',
        calculatorId: 'summary',
        label: 'Results',
        sharedInputs: [],
    },
] as const;

// ---------------------------------------------------------------------------
// Shared inputs
// ---------------------------------------------------------------------------

export const MASONRY_SHARED_INPUTS = [
    'wallAreaM2',     // sum of (length × height) for all wall sections
    'wallLengthM',    // sum of wall lengths (for DPC)
    'wallType',       // brick | block | cavity
    'openings',       // { widthMm, heightMm }[]
    'mixRatio',       // 1:3 | 1:4
    'cavityWidthMm',  // only for cavity walls
] as const;

// ---------------------------------------------------------------------------
// Product catalogues used by this project
// ---------------------------------------------------------------------------

/**
 * Maps step IDs to the product catalogue arrays they consume.
 * The wizard uses this to know which ProductSelector to render.
 */
export const MASONRY_PRODUCT_CATALOGUES = {
    'wall-type': ['BRICK_PRODUCTS', 'BLOCK_PRODUCTS'],
} as const;
```

**Step 2: Commit**

```bash
git add src/projects/masonry.ts
git commit -m "feat(projects): add masonry orchestration config (Layer 2)"
```

---

### Task 2: Create flooring orchestration config

**Files:**
- Create: `src/projects/flooring.ts`

**Step 1: Create the config file**

```ts
/**
 * @file src/projects/flooring.ts
 *
 * Layer 2 orchestrator config for the Flooring project calculator.
 *
 * Consumed by FlooringProjectWizard.tsx to drive step ordering
 * and the summary bill of materials.
 */

import type { FlooringType, LayingPattern } from '../calculators/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * A single step in the flooring project wizard.
 */
export interface FlooringStepConfig {
    /** Unique step identifier. */
    id: string;
    /** The Layer 1 calculator module this step delegates to. */
    calculatorId: string;
    /** Human-readable label shown in the progress bar. */
    label: string;
    /** If true, the user can skip this step. */
    optional?: boolean;
    /** Inputs that come from shared project state. */
    sharedInputs: readonly string[];
}

// ---------------------------------------------------------------------------
// Step sequence
// ---------------------------------------------------------------------------

export const FLOORING_STEPS: readonly FlooringStepConfig[] = [
    {
        id: 'room-dimensions',
        calculatorId: 'setup',
        label: 'Room dimensions',
        sharedInputs: [],
    },
    {
        id: 'flooring-type',
        calculatorId: 'flooring',
        label: 'Flooring type',
        sharedInputs: ['floorAreaM2'],
    },
    {
        id: 'ancillaries',
        calculatorId: 'flooring-room',
        label: 'Ancillaries',
        sharedInputs: ['floorAreaM2', 'perimeterM', 'flooringType', 'coveragePerPackM2'],
    },
    {
        id: 'summary',
        calculatorId: 'summary',
        label: 'Results',
        sharedInputs: [],
    },
] as const;

// ---------------------------------------------------------------------------
// Shared inputs
// ---------------------------------------------------------------------------

export const FLOORING_SHARED_INPUTS = [
    'floorAreaM2',        // room length × width (+ L-shape extension)
    'perimeterM',         // room perimeter (for scotia)
    'flooringType',       // engineered | laminate | solid-wood | lvt
    'coveragePerPackM2',  // from product box
    'layingPattern',      // straight | brick-bond | diagonal | herringbone
] as const;

// ---------------------------------------------------------------------------
// Flooring type metadata
// ---------------------------------------------------------------------------

/** Default laying pattern per flooring type. */
export const DEFAULT_PATTERN: Record<FlooringType, LayingPattern> = {
    'engineered': 'brick-bond',
    'laminate': 'brick-bond',
    'solid-wood': 'brick-bond',
    'lvt': 'brick-bond',
};

/** Human-readable labels for flooring types. */
export const FLOORING_TYPE_LABELS: Record<FlooringType, string> = {
    'engineered': 'Engineered wood',
    'laminate': 'Laminate',
    'solid-wood': 'Solid wood',
    'lvt': 'Luxury vinyl tile (LVT)',
};
```

**Step 2: Commit**

```bash
git add src/projects/flooring.ts
git commit -m "feat(projects): add flooring orchestration config (Layer 2)"
```

---

### Task 3: Wire TilingProjectWizard to import steps from tiling config

**Files:**
- Modify: `src/components/TilingProjectWizard.tsx`

**Step 1: Import the step config**

```tsx
import { TILING_STEPS } from '../projects/tiling';
```

**Step 2: Replace the inline step definitions**

Currently the wizard builds its `steps` array in a `useMemo` (lines ~123-143):
```tsx
const steps = useMemo(() => {
    const base = [
        { id: 'setup', label: 'Area & tile setup' },
        { id: 'tiles', label: 'Tiles' },
        ...
    ];
    if (application === 'floor') { base.push({ id: 'slc', ... }); }
    base.push({ id: 'summary', label: 'Summary' });
    return base;
}, [application]);
```

Replace with:
```tsx
const steps = useMemo(() => {
    return TILING_STEPS
        .filter(s => !s.applicationOnly || s.applicationOnly === application)
        .map(s => ({
            id: s.id,
            label: s.optional ? `${s.label} (optional)` : s.label,
            optional: s.optional,
        }));
}, [application]);
```

This derives the wizard steps from the config, preserving the conditional SLC step logic (via `applicationOnly`) and the optional labels.

**Step 3: Run tests**

Run: `npx vitest run`
Expected: all pass (no behaviour change)

**Step 4: Commit**

```bash
git add src/components/TilingProjectWizard.tsx
git commit -m "refactor(tiling-wizard): derive steps from Layer 2 config"
```

---

### Task 4: Wire MasonryProjectWizard to import steps from masonry config

**Files:**
- Modify: `src/components/MasonryProjectWizard.tsx`

**Step 1: Import the step config**

```tsx
import { MASONRY_STEPS } from '../projects/masonry';
```

**Step 2: Replace inline STEPS constant**

Currently the wizard has:
```tsx
const STEPS = [
    { label: 'Wall dimensions' },
    { label: 'Wall type & products' },
    ...
];
```

Replace with:
```tsx
const STEPS = MASONRY_STEPS.map(s => ({
    label: s.label,
    optional: s.optional,
}));
```

**Step 3: Run tests**

Run: `npx vitest run src/components/__tests__/MasonryProjectWizard.test.tsx`
Expected: PASS

**Step 4: Commit**

```bash
git add src/components/MasonryProjectWizard.tsx
git commit -m "refactor(masonry-wizard): derive steps from Layer 2 config"
```

---

### Task 5: Wire FlooringProjectWizard to import steps from flooring config

**Files:**
- Modify: `src/components/FlooringProjectWizard.tsx`

**Step 1: Import the step config**

```tsx
import { FLOORING_STEPS } from '../projects/flooring';
```

**Step 2: Replace inline STEPS constant**

Replace:
```tsx
const STEPS = [
    { label: 'Room dimensions' },
    { label: 'Flooring type' },
    ...
];
```

With:
```tsx
const STEPS = FLOORING_STEPS.map(s => ({
    label: s.label,
    optional: s.optional,
}));
```

**Step 3: Run full test suite**

Run: `npx vitest run`
Expected: all pass

**Step 4: Commit**

```bash
git add src/components/FlooringProjectWizard.tsx
git commit -m "refactor(flooring-wizard): derive steps from Layer 2 config"
```

---

## Summary

| File | Action | Notes |
|------|--------|-------|
| `src/projects/masonry.ts` | Create | Step sequence, shared inputs, product catalogue refs |
| `src/projects/flooring.ts` | Create | Step sequence, shared inputs, type metadata |
| `src/components/TilingProjectWizard.tsx` | Modify | Import steps from `tiling.ts` config |
| `src/components/MasonryProjectWizard.tsx` | Modify | Import steps from `masonry.ts` config |
| `src/components/FlooringProjectWizard.tsx` | Modify | Import steps from `flooring.ts` config |
