/**
 * @file src/components/v2/registry.ts
 *
 * Registry for the v2 concept hub, same single-source-of-truth pattern as
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
            "Lay the lawn right first time. We plan the roll strips, pick roll lengths that waste the least grass and point every seam the same way.",
        icon: 'fa-seedling',
        kind: 'bespoke',
        preview: 'Live roll plan with seams and pile direction',
    },
    {
        slug: 'kitchen-planner',
        name: 'Kitchen planner',
        category: 'Kitchens & bathrooms',
        description:
            "Sketch your kitchen in seconds. Tell us the walls and we'll fit the units in, worktops, plinths and panels included.",
        icon: 'fa-sink',
        kind: 'bespoke',
        preview: 'Top-down plan view of your unit layout',
    },
    {
        slug: 'paint',
        name: 'Paint & decorating',
        category: 'Interiors & finishing',
        description:
            "How many tins, honestly. Room sizes in, doors and windows taken off, the right mix of 5 litre and 2.5 litre tins out.",
        icon: 'fa-paint-roller',
        kind: 'bespoke',
        preview: 'Unwrapped wall elevation with openings',
    },
    {
        slug: 'fencing',
        name: 'Fencing',
        category: 'Garden & outdoors',
        description:
            "Panels, posts and postmix for any run. Pick lap or closeboard, timber or concrete posts, and we'll count the corners too.",
        icon: 'fa-grip-lines-vertical',
        kind: 'bespoke',
        preview: 'Bay-by-bay elevation with burial depth',
    },
    {
        slug: 'patio',
        name: 'Patio & paving',
        category: 'Garden & outdoors',
        description:
            "Slabs, sub-base, bed mix and jointing for a patio that stays flat. Concrete or porcelain, drawn slab by slab.",
        icon: 'fa-border-all',
        kind: 'bespoke',
        preview: 'Slab-by-slab layout, cuts highlighted',
    },
    {
        slug: 'plastering',
        name: 'Plastering',
        category: 'Walls, ceilings & partitions',
        description:
            "Bags of plaster without the guesswork. Skim or float and set, with the PVA, scrim and beads that go with it.",
        icon: 'fa-layer-group',
        kind: 'bespoke',
        preview: 'Cross-section of the system build-up',
    },
    {
        slug: 'tiling',
        name: 'Tiling',
        category: 'Interiors & finishing',
        description:
            "Any room, wall or floor. Tiles drawn out from the centre, adhesive and grout matched to the job, tanking for wet zones.",
        icon: 'fa-border-none',
        kind: 'bespoke',
        preview: 'Tile-by-tile layout, cuts highlighted',
    },
    {
        slug: 'flooring',
        name: 'Hard flooring',
        category: 'Interiors & finishing',
        description:
            "Click flooring by the pack: laminate, rigid LVT or engineered oak. Underlay, scotia and thresholds come along for the ride.",
        icon: 'fa-bars',
        kind: 'bespoke',
        preview: 'Plank rows with staggered end joints',
    },
    {
        slug: 'masonry',
        name: 'Brick & block wall',
        category: 'Building & masonry',
        description:
            "From a garden wall to a cavity extension. Bricks or blocks, mortar, lintels over the openings and padstones under the beams.",
        icon: 'fa-trowel-bricks',
        kind: 'bespoke',
        preview: 'Stretcher-bond elevation with DPC line',
    },
    {
        slug: 'decking',
        name: 'Decking',
        category: 'Garden & outdoors',
        description:
            "Boards, joists and fixings for a deck that doesn't bounce. Timber or composite, ground level or raised on posts.",
        icon: 'fa-table-list',
        kind: 'bespoke',
        preview: 'Joist grid and board plan with supports',
    },
    {
        slug: 'board-coverage',
        name: 'Board & sheet coverage',
        category: 'Handy tools',
        description:
            "How many sheets to cover a wall, floor or ceiling, with the screws and joint kit each board needs.",
        icon: 'fa-clone',
        kind: 'bespoke',
        preview: 'Sheet-by-sheet layout, cuts highlighted',
    },
    {
        slug: 'unit-converter',
        name: 'Unit converter',
        category: 'Handy tools',
        description:
            "Feet to metres, gallons to litres, and the handy ones like how many 25 kg bags make a Large Bag.",
        icon: 'fa-right-left',
        kind: 'bespoke',
        preview: 'Live conversions with trade equivalents',
    },
    {
        slug: 'wallpapering',
        name: 'Wallpapering',
        category: 'Interiors & finishing',
        description:
            'See every drop before you paste a thing. Rolls, paste and lining paper worked out with the pattern repeat done properly.',
        icon: 'fa-scroll',
        kind: 'bespoke',
        preview: 'Drop-by-drop wall plan',
    },
    {
        slug: 'doors-linings',
        name: 'Doors & door linings',
        category: 'Interiors & finishing',
        description:
            'Door, lining, three hinges, latch, handles. Fire doors get the right kit for where they hang, home or public, and the drawing shows where everything goes.',
        icon: 'fa-door-open',
        kind: 'bespoke',
        preview: 'Door elevation with the ironmongery marked',
    },
    {
        slug: 'french-drain',
        name: 'French drain',
        category: 'Groundworks & drainage',
        description:
            'Sort a soggy lawn for good. Geotextile, clean stone and an optional soakaway, with the trench drawn so you can see how it goes together.',
        icon: 'fa-arrow-down-up-across-line',
        kind: 'bespoke',
        preview: 'Trench cross-section and fall diagram',
    },
    {
        slug: 'board-cutting',
        name: 'Board cutting optimiser',
        category: 'Handy tools',
        description:
            "Type in the pieces you need and we'll fit them onto the fewest sheets, planned for our in-store panel saw.",
        icon: 'fa-scissors',
        kind: 'bespoke',
        preview: 'In-store cutting plan, drawn to scale',
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
    'Building & masonry',
    'Kitchens & bathrooms',
    'Interiors & finishing',
    'Walls, ceilings & partitions',
    'Roofing & exteriors',
    'Insulation & heating',
    'Handy tools',
];

export function getV2CalculatorBySlug(slug: string): V2CalculatorMeta | undefined {
    return V2_CALCULATORS.find((c) => c.slug === slug);
}
