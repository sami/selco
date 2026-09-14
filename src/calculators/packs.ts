/**
 * Pack maths shared by every calculator: rounding a requirement up to
 * whole sellable units, and splitting it across the two pack sizes a
 * product is stocked in.
 */

/** One line of a materials list, already rounded to whole sellable units. */
export interface MaterialLine {
  /** Stable key, e.g. 'cement' or 'sand-jumbo'. */
  id: string;
  /** Product name as it would be asked for at the counter. */
  name: string;
  quantity: number;
  /** Sellable unit, e.g. '25kg bags' or 'boxes of 50'. */
  unit: string;
}

/**
 * Round a continuous requirement up to whole units. The epsilon stops
 * float noise tipping an exact count over (700 × 0.01 is 7.000000000000001).
 */
export function roundUp(required: number): number {
  return Math.max(0, Math.ceil(required - 1e-9));
}

export interface PackSizes {
  largeSize: number;
  smallSize: number;
  /** Past this many small packs, buy another large pack instead. */
  maxSmall: number;
}

/** Whole large packs, topped up with small packs until that stops making sense. */
export function splitPacks(needed: number, { largeSize, smallSize, maxSmall }: PackSizes): { large: number; small: number } {
  if (needed <= 0) return { large: 0, small: 0 };
  let large = Math.floor(needed / largeSize);
  let small = roundUp((needed - large * largeSize) / smallSize);
  if (small > maxSmall) {
    large += 1;
    small = 0;
  }
  return { large, small };
}
