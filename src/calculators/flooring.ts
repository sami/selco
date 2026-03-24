/**
 * @file src/calculators/flooring.ts
 *
 * Layer 1 calculator — Hard Flooring coverage.
 *
 * Accepts a flooring type and coverage-per-pack (from the product box).
 * Applies wastage for the chosen laying pattern. Returns packs needed.
 *
 * The calculator does NOT need plank dimensions, thickness, or pieces
 * per pack. Every flooring product prints coverage per pack on the box.
 *
 * Pure function: no DOM, no React imports, no side effects.
 */

import { applyWaste } from './primitives';
import { FLOORING_WASTAGE, DEFAULT_LAYING_PATTERN, VALID_PATTERNS } from './flooring-config';
import type { FlooringInput, FlooringResult, MaterialQuantity } from './types';

/**
 * Calculate flooring packs needed for a given area.
 *
 * Formula: packsNeeded = ceil(areaM2 × (1 + wastage/100) / coveragePerPackM2)
 *
 * @param input - Floor area, flooring type, coverage per pack, and optional laying pattern.
 * @returns Packs needed, gross/net area, wastage, and materials array.
 * @throws If flooring type is invalid, or coveragePerPackM2 is not positive.
 */
export function calculateFlooring(input: FlooringInput): FlooringResult {
    const { areaM2, flooringType, coveragePerPackM2, layingPattern: requestedPattern } = input;

    // 1. Validate flooring type
    const validTypes = VALID_PATTERNS;
    if (!(flooringType in validTypes)) {
        throw new Error(`Invalid flooring type: '${flooringType}'. Expected one of: engineered, laminate, solid-wood, lvt.`);
    }

    // 2. Validate coverage per pack
    if (coveragePerPackM2 <= 0) {
        throw new Error(`Coverage per pack must be positive. Received: ${coveragePerPackM2}`);
    }

    // 3. Resolve laying pattern (use default if not provided)
    const layingPattern = requestedPattern ?? DEFAULT_LAYING_PATTERN[flooringType];

    // 4. Validate pattern is valid for this type
    if (!validTypes[flooringType].includes(layingPattern)) {
        throw new Error(
            `Pattern '${layingPattern}' is not valid for flooring type '${flooringType}'.`,
        );
    }

    // 5. Look up wastage % from FLOORING_WASTAGE
    const wastagePercent = FLOORING_WASTAGE[layingPattern];

    // 6. Handle zero area
    if (areaM2 === 0) {
        return {
            packsNeeded: 0,
            flooringType,
            coveragePerPackM2,
            grossAreaM2: 0,
            netAreaM2: 0,
            wastagePercent,
            layingPattern,
            materials: [{ material: 'Flooring', quantity: 0, unit: 'packs' }],
        };
    }

    // 7. Core calculation
    const grossAreaM2 = applyWaste(areaM2, wastagePercent);
    const packsNeeded = Math.ceil(grossAreaM2 / coveragePerPackM2);

    // 8. Build materials array
    const materials: MaterialQuantity[] = [
        { material: 'Flooring', quantity: packsNeeded, unit: 'packs' },
    ];

    return {
        packsNeeded,
        flooringType,
        coveragePerPackM2,
        grossAreaM2,
        netAreaM2: areaM2,
        wastagePercent,
        layingPattern,
        materials,
    };
}
