/**
 * @file src/components/v2/registry.ts
 *
 * Registry for the v2 concept hub — same single-source-of-truth pattern as
 * src/projects/registry.ts, scoped to the /v2/ showcase so the main app's
 * registry stays untouched.
 *
 * Icons are Font Awesome 6.0 class names (already loaded by SelcoLayout).
 */

export interface V2CalculatorMeta {
    slug: string;
    name: string;
    strap: string;
    description: string;
    icon: string;
    /** What the live preview shows — used on the hub cards. */
    preview: string;
}

export const V2_CALCULATORS: V2CalculatorMeta[] = [
    {
        slug: 'artificial-grass',
        name: 'Artificial grass',
        strap: 'Garden & landscaping',
        description:
            'Plans the actual roll strips for your lawn, picks 2 m or 4 m rolls to cut waste, and lists tape, membrane, sub-base and infill.',
        icon: 'fa-seedling',
        preview: 'Live roll plan with seams and pile direction',
    },
    {
        slug: 'kitchen-planner',
        name: 'Kitchen planner',
        strap: 'Interiors',
        description:
            'Packs base units, corner units and appliance slots along your walls, then counts worktops, plinths, legs and handles.',
        icon: 'fa-sink',
        preview: 'Top-down plan view of your unit layout',
    },
    {
        slug: 'paint',
        name: 'Paint & decorating',
        strap: 'Decorating',
        description:
            'Measures walls and ceiling from room sizes, deducts doors and windows, and recommends the cheapest tin combination.',
        icon: 'fa-paint-roller',
        preview: 'Unwrapped wall elevation with openings',
    },
    {
        slug: 'fencing',
        name: 'Fencing',
        strap: 'Garden & landscaping',
        description:
            'Panels, posts, postcrete and gravel boards for any run — timber or concrete, with corner posts handled.',
        icon: 'fa-grip-lines-vertical',
        preview: 'Bay-by-bay elevation with burial depth',
    },
    {
        slug: 'patio',
        name: 'Patio & paving',
        strap: 'Garden & landscaping',
        description:
            'Slab grid for three formats plus the full bed: MOT Type 1, sharp sand, cement, primer and jointing compound.',
        icon: 'fa-border-all',
        preview: 'Slab-by-slab layout, cuts highlighted',
    },
    {
        slug: 'plastering',
        name: 'Plastering',
        strap: 'Interiors',
        description:
            'Bags of multi-finish or bonding for skim and float-and-set work, with PVA, scrim and beads where the job needs them.',
        icon: 'fa-layer-group',
        preview: 'Cross-section of the system build-up',
    },
];
