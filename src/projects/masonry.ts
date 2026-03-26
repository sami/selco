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
    'wallAreaM2',
    'wallLengthM',
    'wallType',
    'openings',
    'mixRatio',
    'cavityWidthMm',
] as const;

// ---------------------------------------------------------------------------
// Product catalogues used by this project
// ---------------------------------------------------------------------------

export const MASONRY_PRODUCT_CATALOGUES = {
    'wall-type': ['BRICK_PRODUCTS', 'BLOCK_PRODUCTS'],
} as const;
