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
    'floorAreaM2',
    'perimeterM',
    'flooringType',
    'coveragePerPackM2',
    'layingPattern',
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
