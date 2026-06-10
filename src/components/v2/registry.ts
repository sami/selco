/**
 * @file src/components/v2/registry.ts
 *
 * Registry for the v2 concept hub — same single-source-of-truth pattern as
 * src/projects/registry.ts, scoped to the /v2/ showcase.
 *
 * Two kinds of calculator:
 *   - bespoke: hand-built islands with custom blueprint SVGs (six flagship
 *     trades), each with its own folder route.
 *   - spec:    declarative CalcSpecs rendered by the generic SpecCalculator
 *     island via the dynamic [slug] route.
 *
 * Icons are Font Awesome 6.0 class names (already loaded by SelcoLayout).
 */

import { ALL_SPECS } from '../../calculators/v2/specs';
import type { V2Category } from '../../calculators/v2/specs/spec-types';

export interface V2CalculatorMeta {
    slug: string;
    name: string;
    category: V2Category;
    description: string;
    icon: string;
    kind: 'bespoke' | 'spec';
    /** Bespoke calculators get a "live blueprint" badge on the hub. */
    preview?: string;
}

/** The six flagship calculators with hand-built blueprint previews. */
const BESPOKE: V2CalculatorMeta[] = [
    {
        slug: 'artificial-grass',
        name: 'Artificial grass',
        category: 'Garden & outdoors',
        description:
            'Plans the actual roll strips for your lawn, picks 2 m or 4 m rolls to cut waste, and lists tape, membrane, sub-base and infill.',
        icon: 'fa-seedling',
        kind: 'bespoke',
        preview: 'Live roll plan with seams and pile direction',
    },
    {
        slug: 'kitchen-planner',
        name: 'Kitchen planner',
        category: 'Kitchens & bathrooms',
        description:
            'Packs base units, corner units and appliance slots along your walls, then counts worktops, plinths, legs and handles.',
        icon: 'fa-sink',
        kind: 'bespoke',
        preview: 'Top-down plan view of your unit layout',
    },
    {
        slug: 'paint',
        name: 'Paint & decorating',
        category: 'Interiors & finishing',
        description:
            'Measures walls and ceiling from room sizes, deducts doors and windows, and recommends the right tin combination.',
        icon: 'fa-paint-roller',
        kind: 'bespoke',
        preview: 'Unwrapped wall elevation with openings',
    },
    {
        slug: 'fencing',
        name: 'Fencing',
        category: 'Garden & outdoors',
        description:
            'Panels, posts, postcrete and gravel boards for any run — timber or concrete, with corner posts handled.',
        icon: 'fa-grip-lines-vertical',
        kind: 'bespoke',
        preview: 'Bay-by-bay elevation with burial depth',
    },
    {
        slug: 'patio',
        name: 'Patio & paving',
        category: 'Garden & outdoors',
        description:
            'Slab grid for three formats plus the full bed: MOT Type 1, sharp sand, cement, primer and jointing compound.',
        icon: 'fa-border-all',
        kind: 'bespoke',
        preview: 'Slab-by-slab layout, cuts highlighted',
    },
    {
        slug: 'plastering',
        name: 'Plastering',
        category: 'Walls, ceilings & partitions',
        description:
            'Bags of Thistle MultiFinish or BondingCoat for skim and float-and-set work, with PVA, scrim and beads where needed.',
        icon: 'fa-layer-group',
        kind: 'bespoke',
        preview: 'Cross-section of the system build-up',
    },
];

/** Spec-driven calculators, surfaced with the same metadata shape. */
const SPEC_METAS: V2CalculatorMeta[] = ALL_SPECS.map((s) => ({
    slug: s.slug,
    name: s.name,
    category: s.category,
    description: s.description,
    icon: s.icon,
    kind: 'spec' as const,
}));

export const V2_CALCULATORS: V2CalculatorMeta[] = [...BESPOKE, ...SPEC_METAS];

/** Hub display order for the category groups. */
export const V2_CATEGORY_ORDER: V2Category[] = [
    'Garden & outdoors',
    'Groundworks & drainage',
    'Kitchens & bathrooms',
    'Interiors & finishing',
    'Walls, ceilings & partitions',
    'Roofing & exteriors',
    'Insulation & heating',
];

export function getV2CalculatorBySlug(slug: string): V2CalculatorMeta | undefined {
    return V2_CALCULATORS.find((c) => c.slug === slug);
}
