/**
 * @file src/calculators/v2/types.ts
 *
 * Shared types for the v2 concept calculators.
 *
 * Every v2 engine returns a `BillOfMaterials` — product line items named
 * after ranges SELCO stocks, plus a tools-and-consumables checklist — so
 * the shared MaterialsTicket component can render any calculator's output
 * without per-calculator wiring.
 *
 * Quantities only: product mapping and live pricing are a later phase.
 */

/** One line on the bill of materials. */
export interface BomLine {
    /** Stable key for React lists. */
    id: string;
    /** Product name as it would appear at the counter. */
    name: string;
    /** Short spec detail, e.g. "25kg bag" or "4m × 9m roll". */
    detail?: string;
    /** Quantity to order (already rounded up to whole sellable units). */
    qty: number;
    /** Sellable unit, e.g. "bags", "rolls", "lengths", "tubs". */
    unit: string;
}

/** A grouped section of the bill, e.g. "Groundworks" / "Finishing". */
export interface BomSection {
    title: string;
    lines: BomLine[];
}

/** Full output contract for every v2 engine. */
export interface BillOfMaterials {
    sections: BomSection[];
    /** Headline facts shown above the ticket, e.g. "Lawn area 24.0 m²". */
    facts: Array<{ label: string; value: string }>;
    /**
     * Tools and consumables worth having for the job — own, buy or hire.
     * Rendered as a tick-off checklist, not quantified order lines.
     */
    tools: string[];
    /** Practical site notes / assumptions the estimate relies on. */
    notes: string[];
}

/** Count total order lines on a bill. */
export function bomLineCount(bom: BillOfMaterials): number {
    return bom.sections.reduce((sum, s) => sum + s.lines.length, 0);
}

/** Round a continuous requirement up to whole sellable units. */
export function units(required: number): number {
    return Math.max(0, Math.ceil(required - 1e-9));
}

/** Format square metres to one decimal place. */
export function fmtM2(m2: number): string {
    return `${m2.toFixed(1)} m²`;
}
