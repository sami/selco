/**
 * @file src/projects/tiling.ts
 *
 * Layer 2 orchestrator config for the Tiling project calculator.
 *
 * This file contains **no calculation logic** — it only describes the step
 * sequence, which Layer 1 calculators are involved, and which inputs are
 * shared between steps. The actual maths lives in `src/calculators/`.
 *
 * The config is consumed by `TilingProjectWizard.tsx` to drive step
 * ordering, optional-step visibility, and the summary bill of materials.
 *
 * Layer relationships:
 *   Layer 1 (calculators) — pure functions in src/calculators/
 *   Layer 2 (this file)   — step sequence + shared-input declarations
 *   Layer 3 (pages)       — TilingProjectWizard.tsx React island
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Which type of area the project is being applied to. */
export type TilingApplication = 'floor' | 'wall';

/** Available laying patterns with their recommended wastage allowances. */
export type TilingPattern = 'grid' | 'brick_bond' | 'diagonal' | 'herringbone';

/**
 * A single step in the tiling project wizard.
 *
 * Each step corresponds to one Layer 1 calculator module. Optional steps
 * can be skipped by the user and are excluded from the bill of materials.
 */
export interface TilingStepConfig {
    /** Unique step identifier (used as React key and URL anchor). */
    id: string;
    /**
     * The Layer 1 calculator module this step delegates to.
     * Matches the filename in `src/calculators/` without the extension.
     */
    calculatorId: string;
    /** Human-readable label shown in the step rail and progress bar. */
    label: string;
    /** If true, the user can skip this step. Defaults to false. */
    optional?: boolean;
    /**
     * If set, this step is only shown when the project application matches.
     * e.g. SLC is floor-only.
     */
    applicationOnly?: TilingApplication;
    /**
     * Names of inputs that come from the shared project state rather than
     * being entered fresh in this step. These are pre-computed earlier
     * (e.g. `areaM2` from the setup step) and passed in.
     */
    sharedInputs: readonly string[];
}

// ---------------------------------------------------------------------------
// Step sequence
// ---------------------------------------------------------------------------

/**
 * Ordered wizard step sequence for the Tiling project.
 *
 * Steps run top-to-bottom. Optional steps can be skipped. The `setup` step
 * is always first and populates the shared inputs used by all subsequent steps.
 */
export const TILING_STEPS: readonly TilingStepConfig[] = [
    {
        id: 'setup',
        calculatorId: 'setup',        // not a calculator — collects shared inputs
        label: 'Area & tile setup',
        sharedInputs: [],             // this step IS the source of shared inputs
    },
    {
        id: 'tiles',
        calculatorId: 'tiles',
        label: 'Tiles',
        sharedInputs: ['areaM2', 'tileWidth', 'tileHeight', 'gapWidth', 'pattern', 'wastage'],
    },
    {
        id: 'adhesive',
        calculatorId: 'adhesive',
        label: 'Adhesive',
        sharedInputs: ['areaM2'],
    },
    {
        id: 'grout',
        calculatorId: 'grout',
        label: 'Grout',
        sharedInputs: ['areaM2', 'tileWidth', 'tileHeight', 'gapWidth'],
    },
    {
        id: 'spacers',
        calculatorId: 'spacers',
        label: 'Spacers',
        sharedInputs: ['tileCount', 'pattern'],  // tileCount from tiles step output
    },
    {
        id: 'primer',
        calculatorId: 'primer',
        label: 'Primer',
        optional: true,
        sharedInputs: ['areaM2'],
    },
    {
        id: 'backer-board',
        calculatorId: 'backer-board',
        label: 'Backer board',
        optional: true,
        sharedInputs: ['areaM2'],
    },
    {
        id: 'tanking',
        calculatorId: 'tanking',
        label: 'Tanking',
        optional: true,
        sharedInputs: ['areaM2'],
    },
    {
        id: 'slc',
        calculatorId: 'slc',
        label: 'Self-levelling compound',
        optional: true,
        applicationOnly: 'floor',
        sharedInputs: ['areaM2'],
    },
    {
        id: 'summary',
        calculatorId: 'summary',      // not a calculator — renders bill of materials
        label: 'Summary',
        sharedInputs: [],
    },
] as const;

// ---------------------------------------------------------------------------
// Shared inputs
// ---------------------------------------------------------------------------

/**
 * Inputs computed once in the setup step and available to all subsequent steps.
 * These flow through the wizard as React state rather than being re-entered
 * at each step.
 */
export const TILING_SHARED_INPUTS = [
    'areaM2',       // derived from areaWidth × areaHeight (with unit conversion)
    'tileWidth',    // tile width in mm (from preset or custom entry)
    'tileHeight',   // tile height in mm (from preset or custom entry)
    'gapWidth',     // grout joint width in mm
    'pattern',      // TilingPattern — drives spacer model and wastage default
    'application',  // TilingApplication — drives SLC step visibility
] as const;

// ---------------------------------------------------------------------------
// Pattern metadata
// ---------------------------------------------------------------------------

/** Recommended wastage percentage for each laying pattern. */
export const PATTERN_WASTAGE: Record<TilingPattern, number> = {
    grid: 10,
    brick_bond: 12,
    diagonal: 15,
    herringbone: 15,
};

/** Human-readable labels for each laying pattern. */
export const PATTERN_LABELS: Record<TilingPattern, string> = {
    grid: 'Grid',
    brick_bond: 'Brick bond',
    diagonal: 'Diagonal',
    herringbone: 'Herringbone',
};
