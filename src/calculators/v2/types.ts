/**
 * @file src/calculators/v2/types.ts
 *
 * Shared types for the v2 concept calculators.
 *
 * Every v2 engine returns a `BillOfMaterials`, product line items named
 * after ranges SELCO stocks, plus a tools-and-consumables checklist, so
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
     * Tools and consumables worth having for the job, own, buy or hire.
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


/** Selco loose-aggregate bag sizes: sands, MOT and gravels come either as
 *  35 kg large packs or ~875 kg jumbo bags. */
export const JUMBO_BAG_KG = 875;
export const LARGE_PACK_KG = 35;

/**
 * Split an aggregate requirement into jumbo bags topped up with 35 kg
 * packs. Past ten packs the maths (and your back) say take the next
 * jumbo bag instead.
 */
export function aggregateBags(kgNeeded: number): { jumbo: number; packs: number } {
    if (kgNeeded <= 0) return { jumbo: 0, packs: 0 };
    let jumbo = Math.floor(kgNeeded / JUMBO_BAG_KG);
    const remKg = kgNeeded - jumbo * JUMBO_BAG_KG;
    let packs = Math.ceil(remKg / LARGE_PACK_KG);
    if (packs > 10) {
        jumbo += 1;
        packs = 0;
    }
    return { jumbo, packs };
}

/** BoM lines for an aggregate: a jumbo-bag line, a 35 kg pack line, or both. */
export function aggregateLines(
    id: string,
    name: string,
    kgNeeded: number,
    detail?: string,
): BomLine[] {
    const { jumbo, packs } = aggregateBags(kgNeeded);
    const lines: BomLine[] = [];
    if (jumbo > 0) {
        lines.push({
            id: `${id}-jumbo`,
            name,
            detail: detail ? `Jumbo Bag (~875 kg), ${detail}` : 'Jumbo Bag (~875 kg)',
            qty: jumbo,
            unit: 'Jumbo Bags',
        });
    }
    if (packs > 0) {
        lines.push({
            id: `${id}-pack`,
            name,
            detail: jumbo > 0 ? '35 kg large pack, tops up the jumbo bags' : detail ? `35 kg large pack, ${detail}` : '35 kg large pack',
            qty: packs,
            unit: 'packs',
        });
    }
    return lines;
}

/** Round a continuous requirement up to whole sellable units. */
export function units(required: number): number {
    return Math.max(0, Math.ceil(required - 1e-9));
}

/** Format square metres to one decimal place. */
export function fmtM2(m2: number): string {
    return `${m2.toFixed(1)} m²`;
}
