/**
 * @file src/calculators/flooring-config.ts
 *
 * Configuration constants for the flooring coverage calculator.
 *
 * Flooring wastage rates differ from tiling (see constants.ts).
 * Straight flooring has only 5% waste vs 10% for tiling, because
 * flooring boards are larger and produce fewer offcuts.
 *
 * Sources:
 *   - British Wood Flooring Association (BWFA) installation guide
 *   - Flooring Industry Training Association (FITA)
 */

import type { FlooringType, LayingPattern } from './types';

// ---------------------------------------------------------------------------
// Wastage by laying pattern (% added to net area)
// ---------------------------------------------------------------------------

/** Wastage percentages by laying pattern for flooring installations. */
export const FLOORING_WASTAGE: Record<LayingPattern, number> = {
    'straight': 5,
    'brick-bond': 10,
    'diagonal': 15,
    'herringbone': 15,
};

// ---------------------------------------------------------------------------
// Default laying pattern per flooring type
// ---------------------------------------------------------------------------

/** Default laying pattern when the user does not specify one. */
export const DEFAULT_LAYING_PATTERN: Record<FlooringType, LayingPattern> = {
    'engineered': 'brick-bond',
    'laminate': 'brick-bond',
    'solid-wood': 'brick-bond',
    'lvt': 'brick-bond',
};

// ---------------------------------------------------------------------------
// Valid patterns per flooring type
// ---------------------------------------------------------------------------

/** All four types support all four patterns. Map exists for future extensibility. */
export const VALID_PATTERNS: Record<FlooringType, LayingPattern[]> = {
    'engineered': ['straight', 'brick-bond', 'diagonal', 'herringbone'],
    'laminate': ['straight', 'brick-bond', 'diagonal', 'herringbone'],
    'solid-wood': ['straight', 'brick-bond', 'diagonal', 'herringbone'],
    'lvt': ['straight', 'brick-bond', 'diagonal', 'herringbone'],
};
