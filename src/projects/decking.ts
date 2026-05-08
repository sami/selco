/**
 * @file src/projects/decking.ts
 *
 * Layer 2 orchestrator config for the Decking project calculator.
 *
 * This file contains **no calculation logic** — it only describes the step
 * sequence, which Layer 1 calculators are involved, and which inputs are
 * shared between steps. The actual maths lives in `src/calculators/`.
 *
 * The config is consumed by `DeckingProjectWizard.tsx` to drive step
 * ordering, optional-step visibility, and the summary bill of materials.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Deck build type — affects substructure requirements. */
export type DeckBuildType = 'ground-level' | 'raised';

/**
 * A single step in the decking project wizard.
 */
export interface DeckingStepConfig {
    /** Unique step identifier. */
    id: string;
    /** The Layer 1 calculator module this step delegates to. */
    calculatorId: string;
    /** Human-readable label shown in the wizard progress bar. */
    label: string;
    /** If true, the user can skip this step. */
    optional?: boolean;
    /** Inputs that come from shared project state. */
    sharedInputs: readonly string[];
}

// ---------------------------------------------------------------------------
// Step sequence
// ---------------------------------------------------------------------------

/**
 * Ordered wizard step sequence for the Decking project.
 *
 * Steps run top-to-bottom. The `setup` step collects dimensions and board
 * selection. Subsequent steps consume shared inputs from setup.
 */
export const DECKING_STEPS: readonly DeckingStepConfig[] = [
    {
        id: 'setup',
        calculatorId: 'setup',
        label: 'Deck size & board',
        sharedInputs: [],
    },
    {
        id: 'boards',
        calculatorId: 'decking',
        label: 'Decking boards',
        sharedInputs: ['areaM2', 'boardWidthMm', 'boardLengthMm', 'gapMm', 'wastage'],
    },
    {
        id: 'fixings',
        calculatorId: 'decking-fixings',
        label: 'Fixings',
        sharedInputs: ['boardsNeeded', 'boardLengthMm', 'joistSpacingMm'],
    },
    {
        id: 'substructure',
        calculatorId: 'decking-substructure',
        label: 'Substructure',
        sharedInputs: ['deckSpanM', 'deckDepthM', 'joistSpacingMm'],
    },
    {
        id: 'summary',
        calculatorId: 'summary',
        label: 'Summary',
        sharedInputs: [],
    },
] as const;

// ---------------------------------------------------------------------------
// Shared inputs
// ---------------------------------------------------------------------------

/**
 * Inputs computed in the setup step and available to all subsequent steps.
 */
export const DECKING_SHARED_INPUTS = [
    'deckLengthM',
    'deckWidthM',
    'areaM2',
    'boardWidthMm',
    'boardLengthMm',
    'gapMm',
    'joistSpacingMm',
    'fixingMethod',
    'buildType',
] as const;

// ---------------------------------------------------------------------------
// Default values
// ---------------------------------------------------------------------------

/** Default wastage percentages. */
export const DECKING_WASTAGE = {
    boards: 10,
    fixings: 10,
    joists: 10,
} as const;

/** Default support (deck block) spacing in mm. */
export const DEFAULT_SUPPORT_SPACING_MM = 1200;

/** Default gap between boards in mm. */
export const DEFAULT_GAP_MM = 5;

/** Default joist spacing in mm. */
export const DEFAULT_JOIST_SPACING_MM = 400;
