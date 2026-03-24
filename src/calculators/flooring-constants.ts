/**
 * @file src/calculators/flooring-constants.ts
 *
 * Industry constants for flooring ancillary material estimation.
 *
 * These are generic estimates, not product-specific. The user does not
 * pick an underlay brand or adhesive product at the calculator stage.
 *
 * Sources:
 *   - BS 8203:2017 — Installation of resilient floor coverings
 *   - FITA (Flooring Industry Training Association) best practice guides
 *   - British Wood Flooring Association (BWFA) installation handbook
 */

// ---------------------------------------------------------------------------
// Underlay (engineered, laminate, solid-wood floating)
// ---------------------------------------------------------------------------

/** Standard underlay roll sizes in m². */
export const UNDERLAY_ROLL_SIZES = [15, 25] as const;

/** Overlap allowance at taped joins (%). */
export const UNDERLAY_OVERLAP_PERCENT = 5;

// ---------------------------------------------------------------------------
// Adhesive (solid wood glue-down only)
// ---------------------------------------------------------------------------

/** Coverage rate for solid wood glue-down adhesive (m² per litre). BS 8203 reference. */
export const FLOORING_ADHESIVE_M2_PER_LITRE = 5;

/** Standard adhesive bucket sizes in litres. */
export const ADHESIVE_BUCKET_SIZES = [5, 15] as const;

// ---------------------------------------------------------------------------
// Scotia / beading (edge trim at skirting for all floating floors)
// ---------------------------------------------------------------------------

/** Standard scotia beading length in metres. */
export const SCOTIA_LENGTH_M = 2.4;

/** Wastage allowance for mitred corners (%). */
export const SCOTIA_WASTE_PERCENT = 10;

// ---------------------------------------------------------------------------
// Threshold strips (transition at doorways)
// ---------------------------------------------------------------------------

/** Standard UK door width threshold strip length in mm. */
export const THRESHOLD_STRIP_LENGTH_MM = 900;

// ---------------------------------------------------------------------------
// DPM / vapour barrier (concrete subfloors, optional)
// ---------------------------------------------------------------------------

/** Standard DPM roll sizes in m². */
export const DPM_ROLL_SIZES = [15, 20] as const;

/** Overlap allowance at joins (150 mm overlap). */
export const DPM_OVERLAP_PERCENT = 10;
