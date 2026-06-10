/**
 * @file src/calculators/v2/specs/index.ts
 *
 * All spec-driven v2 calculators in one list. The dynamic route
 * (src/pages/v2/[slug].astro) and the hub grid both derive from this.
 */

import type { CalcSpec } from './spec-types';
import { INTERIOR_SPECS } from './interiors';
import { WALLS_CEILINGS_SPECS } from './walls-ceilings';
import { ROOFING_EXTERIOR_SPECS } from './roofing-exteriors';
import { INSULATION_HEATING_SPECS } from './insulation-heating';
import { GROUNDWORKS_SPECS } from './groundworks';

export const ALL_SPECS: CalcSpec[] = [
    ...INTERIOR_SPECS,
    ...WALLS_CEILINGS_SPECS,
    ...ROOFING_EXTERIOR_SPECS,
    ...INSULATION_HEATING_SPECS,
    ...GROUNDWORKS_SPECS,
];

export function getSpecBySlug(slug: string): CalcSpec | undefined {
    return ALL_SPECS.find((s) => s.slug === slug);
}

export type { CalcSpec } from './spec-types';
