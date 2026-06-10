/**
 * @file src/calculators/v2/types.ts
 *
 * Shared types for the v2 concept calculators.
 *
 * Every v2 engine returns a `BillOfMaterials` — a flat list of line items
 * with indicative unit prices — so the shared MaterialsTicket component can
 * render any calculator's output without per-calculator wiring.
 *
 * Prices are indicative, for concept-demonstration only; they are NOT live
 * SELCO trade prices.
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
    /** Indicative price per unit in GBP (ex VAT). */
    unitPrice: number;
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
    /** Practical site notes / assumptions the estimate relies on. */
    notes: string[];
}

/** Sum a bill's total in GBP (ex VAT). */
export function bomTotal(bom: BillOfMaterials): number {
    return bom.sections
        .flatMap((s) => s.lines)
        .reduce((sum, l) => sum + l.qty * l.unitPrice, 0);
}

/** Round a continuous requirement up to whole sellable units. */
export function units(required: number): number {
    return Math.max(0, Math.ceil(required - 1e-9));
}

/** Format square metres to one decimal place. */
export function fmtM2(m2: number): string {
    return `${m2.toFixed(1)} m²`;
}
