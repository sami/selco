/**
 * @file src/projects/registry.ts
 *
 * Canonical registry of every calculator in the SELCO Trade Materials app.
 *
 * This is the single source of truth for the two-category taxonomy:
 *   - **Project Calculators** — wizard-style multi-step flows that sequence
 *     several Layer 1 calculators and carry shared inputs between steps.
 *   - **Handy Calculators**   — standalone single-purpose tools with one
 *     input form and one result.
 *
 * The homepage grid, sidebar navigation, and breadcrumb component all derive
 * their data from this registry. If a new calculator is added, update this
 * file first, then create the corresponding route and calculator module.
 *
 * @see {@link ../../src/types/index.ts} for `CalculatorMeta`, `CalculatorCategory`
 * @see {@link ../../src/data/projects.ts} — legacy registry (superseded by this file)
 */

import type { CalculatorMeta } from '../types';

// ---------------------------------------------------------------------------
// Registry — ordered as shown on the homepage
// ---------------------------------------------------------------------------

/**
 * All calculators, ordered by category then by maturity (live before
 * coming-soon within each group).
 */
export const CALCULATOR_REGISTRY: CalculatorMeta[] = [

    // -----------------------------------------------------------------------
    // Project Calculators — wizard-style multi-step flows
    // -----------------------------------------------------------------------

    {
        id: 'tiling',
        slug: 'tiling',
        name: 'Tiling project',
        description:
            'Estimate tiles, adhesive, grout, spacers, and self-levelling compound for any floor or wall area.',
        category: 'project',
        status: 'live',
        path: '/tiling/',
        icon: '/images/hero/hero-tiling.svg',
    },
    {
        id: 'flooring',
        slug: 'flooring',
        name: 'Hard flooring',
        description:
            'Work out quantities for laminate, engineered wood, or vinyl click flooring including underlay.',
        category: 'project',
        status: 'live',
        path: '/hard-flooring/',
        icon: '/images/hero/hero-flooring.svg',
    },
    {
        id: 'brick-wall',
        slug: 'brick-wall',
        name: 'Brick & block wall',
        description:
            'Calculate bricks or blocks, sand, cement, and wall ties for single-skin or cavity walls.',
        category: 'project',
        status: 'live',
        path: '/brick-wall/',
        icon: '/images/hero/hero-brick-wall.svg',
    },
    {
        id: 'decking',
        slug: 'decking',
        name: 'Decking',
        description:
            'Estimate decking boards, joists, screws, and concrete posts for outdoor decking areas.',
        category: 'project',
        status: 'coming-soon',
        comingSoon: true,
        path: '/decking/',
        icon: '/images/hero/hero-decking.svg',
    },
    {
        id: 'cladding',
        slug: 'cladding',
        name: 'Cladding',
        description:
            'Calculate boards, battens, and fixings needed for exterior or interior cladding.',
        category: 'project',
        status: 'coming-soon',
        comingSoon: true,
        path: '/cladding/',
        icon: '/images/hero/hero-cladding.svg',
    },

    // -----------------------------------------------------------------------
    // Handy Calculators — standalone single-purpose tools
    // -----------------------------------------------------------------------

    {
        id: 'unit-converter',
        slug: 'unit-converter',
        name: 'Unit converter',
        description:
            'Convert between metric and imperial units for length, area, volume, weight, and temperature.',
        category: 'handy',
        status: 'live',
        path: '/unit-converter/',
        icon: '/images/hero/hero-handy.svg',
    },
    {
        id: 'board-coverage',
        slug: 'board-coverage',
        name: 'Board coverage',
        description:
            'Work out how many plasterboard, plywood, or backer boards you need to cover a given area.',
        category: 'handy',
        status: 'live',
        path: '/coverage/',
        icon: '/images/hero/hero-handy.svg',
    },
    {
        id: 'board-cutting',
        slug: 'board-cutting',
        name: 'Board cutting optimiser',
        description:
            'Plan your cuts to get the most parts out of standard plywood or plasterboard sheets.',
        category: 'handy',
        status: 'coming-soon',
        comingSoon: true,
        path: '/board-cutting/',
        icon: '/images/hero/hero-handy.svg',
    },
];

// ---------------------------------------------------------------------------
// Filtered views — convenience exports for nav and homepage grid
// ---------------------------------------------------------------------------

/** Project calculators only (wizard-style multi-step flows). */
export const PROJECT_CALCULATORS = CALCULATOR_REGISTRY.filter(
    (c) => c.category === 'project',
);

/** Handy calculators only (standalone single-purpose tools). */
export const HANDY_CALCULATORS = CALCULATOR_REGISTRY.filter(
    (c) => c.category === 'handy',
);

/** Live calculators only (status === 'live'). */
export const LIVE_CALCULATORS = CALCULATOR_REGISTRY.filter(
    (c) => c.status === 'live',
);

/**
 * Look up a calculator by its ID slug.
 *
 * @param id - The calculator slug (e.g. `'tiling'`, `'unit-converter'`).
 * @returns The matching `CalculatorMeta`, or `undefined` if not found.
 */
export function getCalculatorById(id: string): CalculatorMeta | undefined {
    return CALCULATOR_REGISTRY.find((c) => c.id === id);
}
