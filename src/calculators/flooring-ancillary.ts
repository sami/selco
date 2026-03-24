/**
 * @file src/calculators/flooring-ancillary.ts
 *
 * Ancillary material estimators for flooring installations.
 *
 * Each function returns a FlooringAncillaryEstimate with the best-fit
 * pack size. Pack selection logic: choose the smallest pack where total
 * purchased is within 50% overshoot of the quantity needed. If all
 * overshoots exceed 50%, use the largest pack.
 *
 * Pure functions: no DOM, no React, no side effects.
 */

import { applyWaste } from './primitives';
import {
    UNDERLAY_ROLL_SIZES,
    UNDERLAY_OVERLAP_PERCENT,
    FLOORING_ADHESIVE_M2_PER_LITRE,
    ADHESIVE_BUCKET_SIZES,
    SCOTIA_LENGTH_M,
    SCOTIA_WASTE_PERCENT,
    DPM_ROLL_SIZES,
    DPM_OVERLAP_PERCENT,
} from './flooring-constants';
import type { FlooringAncillaryEstimate } from './types';

// ---------------------------------------------------------------------------
// Pack size selection — shared helper
// ---------------------------------------------------------------------------

/**
 * Choose the best pack size from available options.
 *
 * Strategy: pick the smallest pack where total purchased is within
 * 50% overshoot of the quantity needed. If all overshoots exceed 50%,
 * fall back to the largest pack.
 */
function bestPackSize(quantityNeeded: number, packSizes: readonly number[]): number {
    if (quantityNeeded === 0) return packSizes[0];

    const sorted = [...packSizes].sort((a, b) => a - b);

    for (const size of sorted) {
        const packs = Math.ceil(quantityNeeded / size);
        const totalPurchased = packs * size;
        const overshoot = totalPurchased / quantityNeeded;
        if (overshoot <= 1.5) return size;
    }

    // All overshoots > 50%, use the smallest pack to minimise waste
    return sorted[0];
}

// ---------------------------------------------------------------------------
// Underlay (engineered, laminate, solid-wood floating)
// ---------------------------------------------------------------------------

/**
 * Estimate underlay rolls needed for a given floor area.
 *
 * Adds overlap allowance for taped joins between rolls.
 */
export function estimateUnderlay(floorAreaM2: number): FlooringAncillaryEstimate {
    if (floorAreaM2 === 0) {
        return { material: 'Underlay', quantityNeeded: 0, packSize: UNDERLAY_ROLL_SIZES[0], packsNeeded: 0, unit: 'rolls' };
    }

    const quantityNeeded = applyWaste(floorAreaM2, UNDERLAY_OVERLAP_PERCENT);
    const packSize = bestPackSize(quantityNeeded, UNDERLAY_ROLL_SIZES);
    const packsNeeded = Math.ceil(quantityNeeded / packSize);

    return { material: 'Underlay', quantityNeeded, packSize, packsNeeded, unit: 'rolls' };
}

// ---------------------------------------------------------------------------
// Adhesive (solid wood glue-down only)
// ---------------------------------------------------------------------------

/**
 * Estimate flooring adhesive for solid wood glue-down installation.
 *
 * Coverage rate: 5 m² per litre (BS 8203 reference).
 */
export function estimateFlooringAdhesive(floorAreaM2: number): FlooringAncillaryEstimate {
    if (floorAreaM2 === 0) {
        return { material: 'Flooring Adhesive', quantityNeeded: 0, packSize: ADHESIVE_BUCKET_SIZES[0], packsNeeded: 0, unit: 'buckets' };
    }

    const quantityNeeded = floorAreaM2 / FLOORING_ADHESIVE_M2_PER_LITRE;
    const packSize = bestPackSize(quantityNeeded, ADHESIVE_BUCKET_SIZES);
    const packsNeeded = Math.ceil(quantityNeeded / packSize);

    return { material: 'Flooring Adhesive', quantityNeeded, packSize, packsNeeded, unit: 'buckets' };
}

// ---------------------------------------------------------------------------
// Scotia beading (edge trim at skirting)
// ---------------------------------------------------------------------------

/**
 * Estimate scotia beading lengths needed for a room perimeter.
 *
 * Adds 10% wastage for mitred corners.
 */
export function estimateScotia(perimeterM: number): FlooringAncillaryEstimate {
    if (perimeterM === 0) {
        return { material: 'Scotia Beading', quantityNeeded: 0, packSize: SCOTIA_LENGTH_M, packsNeeded: 0, unit: 'lengths' };
    }

    const quantityNeeded = applyWaste(perimeterM, SCOTIA_WASTE_PERCENT);
    const packsNeeded = Math.ceil(quantityNeeded / SCOTIA_LENGTH_M);

    return { material: 'Scotia Beading', quantityNeeded, packSize: SCOTIA_LENGTH_M, packsNeeded, unit: 'lengths' };
}

// ---------------------------------------------------------------------------
// Threshold strips (transition at doorways)
// ---------------------------------------------------------------------------

/**
 * Estimate threshold strips needed (1 per doorway).
 */
export function estimateThresholdStrips(doorwayCount: number): FlooringAncillaryEstimate {
    return {
        material: 'Threshold Strip',
        quantityNeeded: doorwayCount,
        packSize: 1,
        packsNeeded: doorwayCount,
        unit: 'strips',
    };
}

// ---------------------------------------------------------------------------
// DPM / vapour barrier (concrete subfloors, optional)
// ---------------------------------------------------------------------------

/**
 * Estimate DPM rolls needed for a given floor area.
 *
 * Adds 10% overlap allowance (150 mm at joins).
 */
export function estimateDPM(floorAreaM2: number): FlooringAncillaryEstimate {
    if (floorAreaM2 === 0) {
        return { material: 'DPM', quantityNeeded: 0, packSize: DPM_ROLL_SIZES[0], packsNeeded: 0, unit: 'rolls' };
    }

    const quantityNeeded = applyWaste(floorAreaM2, DPM_OVERLAP_PERCENT);
    const packSize = bestPackSize(quantityNeeded, DPM_ROLL_SIZES);
    const packsNeeded = Math.ceil(quantityNeeded / packSize);

    return { material: 'DPM', quantityNeeded, packSize, packsNeeded, unit: 'rolls' };
}
