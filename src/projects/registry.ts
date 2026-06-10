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
// Icon set
// ---------------------------------------------------------------------------

/**
 * Wrap inner SVG markup in a uniform `<svg>` shell so every registry icon
 * shares one viewBox, one stroke weight, and one colour source. Icons are
 * coloured via `currentColor` (the SELCO-yellow token on the banner) and
 * carry no hardcoded hex, so `lint:tokens` and the registry-shape test pass.
 */
const icon = (inner: string): string =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;

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
        icon: icon('<rect x="3" y="3" width="18" height="18" rx="1.5"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>'),
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
        icon: icon('<rect x="3" y="4" width="18" height="16" rx="1.5"/><path d="M3 9.5h18M3 14.5h18M10 4v5.5M7 9.5v5M14 9.5v5M11 14.5V20"/>'),
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
        icon: icon('<rect x="3" y="5" width="18" height="14" rx="1"/><path d="M3 9.6h18M3 14.4h18M12 5v4.6M8 9.6v4.8M16 9.6v4.8M12 14.4V19"/>'),
    },
    {
        id: 'decking',
        slug: 'decking',
        name: 'Decking',
        description:
            'Estimate decking boards, joists, screws or hidden clips, and concrete deck blocks for outdoor decking areas.',
        category: 'project',
        status: 'live',
        path: '/decking/',
        icon: icon('<rect x="3" y="3" width="18" height="18" rx="1.5"/><path d="M8 3v18M13 3v18M18 3v18"/>'),
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
        icon: icon('<rect x="3" y="3" width="18" height="18" rx="1.5"/><path d="M3 8h18M3 13h18M3 18h18"/>'),
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
        icon: icon('<path d="M4 8h12M13 5l3 3-3 3"/><path d="M20 16H8M11 13l-3 3 3 3"/>'),
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
        icon: icon('<path d="M6 3h8l6 6v12H6z"/><path d="M14 3v6h6"/>'),
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
        icon: icon('<circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><path d="M8.2 7.6L20 16M8.2 16.4L20 8"/>'),
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
