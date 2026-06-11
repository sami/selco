/**
 * @file src/calculators/v2/specs/spec-types.ts
 *
 * The spec framework that scales v2 to dozens of trades.
 *
 * A `CalcSpec` is a declarative calculator: input fields plus a pure
 * compute function returning the shared `BillOfMaterials`. One generic
 * React island (`SpecCalculator`) renders any spec, and one dynamic Astro
 * route generates a page per spec, so adding a calculator is ~80 lines of
 * domain knowledge, no new UI code.
 */

import type { BillOfMaterials } from '../types';

export type FieldValue = number | string | boolean;
export type Values = Record<string, FieldValue>;

export interface NumberFieldSpec {
    kind: 'number';
    id: string;
    label: string;
    unit?: string;
    min: number;
    max: number;
    step?: number;
    default: number;
    hint?: string;
}

export interface ChoiceFieldSpec {
    kind: 'choice';
    id: string;
    label: string;
    options: Array<{ value: string; label: string }>;
    default: string;
}

export interface ToggleFieldSpec {
    kind: 'toggle';
    id: string;
    label: string;
    hint?: string;
    default: boolean;
}

export type FieldSpec = NumberFieldSpec | ChoiceFieldSpec | ToggleFieldSpec;

export type V2Category =
    | 'Garden & outdoors'
    | 'Groundworks & drainage'
    | 'Building & masonry'
    | 'Kitchens & bathrooms'
    | 'Interiors & finishing'
    | 'Walls, ceilings & partitions'
    | 'Roofing & exteriors'
    | 'Insulation & heating'
    | 'Handy tools';

export interface CalcSpec {
    slug: string;
    name: string;
    category: V2Category;
    description: string;
    /** Font Awesome 6.0 icon class (loaded by SelcoLayout). */
    icon: string;
    fields: FieldSpec[];
    /**
     * Optional plan-view rectangle for the blueprint preview panel.
     * Return null to render the ticket full-width with no preview.
     */
    rectPreview?: (
        v: Values,
    ) => { widthM: number; lengthM: number; caption: string } | null;
    compute: (v: Values) => BillOfMaterials;
}

// ---------------------------------------------------------------------------
// Typed accessors, keep compute functions terse and safe
// ---------------------------------------------------------------------------

export function num(v: Values, id: string): number {
    const x = v[id];
    return typeof x === 'number' && Number.isFinite(x) ? x : 0;
}

export function str(v: Values, id: string): string {
    const x = v[id];
    return typeof x === 'string' ? x : '';
}

export function bool(v: Values, id: string): boolean {
    return v[id] === true;
}

/** Default values for a spec's fields, initial island state. */
export function defaultsFor(spec: CalcSpec): Values {
    return Object.fromEntries(spec.fields.map((f) => [f.id, f.default]));
}
