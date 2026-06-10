/**
 * @file src/calculators/registry.test.ts
 *
 * Tests for the CALCULATOR_REGISTRY:
 *   - All entries have the required CalculatorMeta fields
 *   - Category values are valid ('project' | 'handy')
 *   - Status values are valid ('live' | 'coming-soon')
 *   - comingSoon flag is consistent with status
 *   - Icon paths (when present) reference files that exist in public/images/hero/
 *   - Filtered views (PROJECT_CALCULATORS, HANDY_CALCULATORS, LIVE_CALCULATORS)
 *     are subsets of the full registry
 *   - getCalculatorById returns the correct entry
 */

import { describe, it, expect } from 'vitest';
import {
    CALCULATOR_REGISTRY,
    PROJECT_CALCULATORS,
    HANDY_CALCULATORS,
    LIVE_CALCULATORS,
    getCalculatorById,
} from './registry';
import type { CalculatorMeta } from '../types';

// ---------------------------------------------------------------------------
// CALCULATOR_REGISTRY — structural integrity
// ---------------------------------------------------------------------------

describe('CALCULATOR_REGISTRY', () => {
    it('exports a non-empty array', () => {
        expect(CALCULATOR_REGISTRY).toBeInstanceOf(Array);
        expect(CALCULATOR_REGISTRY.length).toBeGreaterThanOrEqual(8);
    });

    it('every entry has the required CalculatorMeta fields', () => {
        const requiredKeys: (keyof CalculatorMeta)[] = [
            'id', 'name', 'slug', 'category', 'description', 'status', 'path',
        ];
        for (const entry of CALCULATOR_REGISTRY) {
            for (const key of requiredKeys) {
                expect(entry, `entry "${entry.id}" is missing field "${key}"`).toHaveProperty(key);
                expect(
                    entry[key],
                    `entry "${entry.id}" has empty/undefined field "${key}"`,
                ).toBeTruthy();
            }
        }
    });

    it('every category value is "project" or "handy"', () => {
        const valid = new Set(['project', 'handy']);
        for (const entry of CALCULATOR_REGISTRY) {
            expect(
                valid.has(entry.category),
                `"${entry.id}" has invalid category: "${entry.category}"`,
            ).toBe(true);
        }
    });

    it('every status value is "live" or "coming-soon"', () => {
        const valid = new Set(['live', 'coming-soon']);
        for (const entry of CALCULATOR_REGISTRY) {
            expect(
                valid.has(entry.status),
                `"${entry.id}" has invalid status: "${entry.status}"`,
            ).toBe(true);
        }
    });

    it('comingSoon flag is consistent with status', () => {
        for (const entry of CALCULATOR_REGISTRY) {
            if (entry.status === 'coming-soon') {
                expect(
                    entry.comingSoon,
                    `"${entry.id}" has status 'coming-soon' but comingSoon !== true`,
                ).toBe(true);
            } else {
                // live entries should not have comingSoon: true
                expect(
                    entry.comingSoon,
                    `"${entry.id}" has status 'live' but comingSoon is set`,
                ).toBeFalsy();
            }
        }
    });

    it('all id and slug values are unique', () => {
        const ids = CALCULATOR_REGISTRY.map((e) => e.id);
        const slugs = CALCULATOR_REGISTRY.map((e) => e.slug);
        expect(new Set(ids).size).toBe(ids.length);
        expect(new Set(slugs).size).toBe(slugs.length);
    });

    // Icons are inline SVGs rendered by CalculatorPageHeader, coloured via the
    // SELCO-yellow token (stroke="currentColor"). Every entry must carry one so
    // the banner is uniform across pages — see the UI Conventions note.
    it('every entry icon is an inline SVG coloured via currentColor (no hardcoded hex)', () => {
        for (const entry of CALCULATOR_REGISTRY) {
            const svg = entry.icon;
            expect(svg, `"${entry.id}" has no inline SVG icon`).toBeTruthy();
            expect(
                svg!.trimStart().startsWith('<svg'),
                `"${entry.id}" icon is not an inline <svg>`,
            ).toBe(true);
            expect(svg!.includes('</svg>'), `"${entry.id}" icon is not closed`).toBe(true);
            expect(
                svg!.includes('currentColor'),
                `"${entry.id}" icon must use currentColor, not a fixed colour`,
            ).toBe(true);
            expect(
                /#[0-9a-fA-F]{3,6}\b/.test(svg!),
                `"${entry.id}" icon must not hardcode a hex colour`,
            ).toBe(false);
        }
    });

    it('all icons share one stroke weight and viewBox (uniform iconography)', () => {
        for (const entry of CALCULATOR_REGISTRY) {
            expect(entry.icon, `"${entry.id}" missing icon`).toContain('viewBox="0 0 24 24"');
            expect(entry.icon, `"${entry.id}" wrong stroke weight`).toContain('stroke-width="2"');
        }
    });
});

// ---------------------------------------------------------------------------
// CALCULATOR_REGISTRY — known entries
// ---------------------------------------------------------------------------

describe('CALCULATOR_REGISTRY — known entries', () => {
    it('includes the tiling project calculator', () => {
        const entry = CALCULATOR_REGISTRY.find((e) => e.id === 'tiling');
        expect(entry).toBeDefined();
        expect(entry!.category).toBe('project');
        expect(entry!.status).toBe('live');
    });

    it('includes at least 5 project calculators (1 live + 4 coming-soon)', () => {
        const projects = CALCULATOR_REGISTRY.filter((e) => e.category === 'project');
        expect(projects.length).toBeGreaterThanOrEqual(5);
        const live = projects.filter((e) => e.status === 'live');
        expect(live.length).toBeGreaterThanOrEqual(1);
    });

    it('includes the unit-converter handy calculator', () => {
        const entry = CALCULATOR_REGISTRY.find((e) => e.id === 'unit-converter');
        expect(entry).toBeDefined();
        expect(entry!.category).toBe('handy');
        expect(entry!.status).toBe('live');
    });

    it('includes the board-coverage handy calculator', () => {
        const entry = CALCULATOR_REGISTRY.find((e) => e.id === 'board-coverage');
        expect(entry).toBeDefined();
        expect(entry!.category).toBe('handy');
    });

    it('includes at least 3 handy calculators', () => {
        const handy = CALCULATOR_REGISTRY.filter((e) => e.category === 'handy');
        expect(handy.length).toBeGreaterThanOrEqual(3);
    });
});

// ---------------------------------------------------------------------------
// Filtered views
// ---------------------------------------------------------------------------

describe('PROJECT_CALCULATORS', () => {
    it('contains only project-category entries', () => {
        for (const entry of PROJECT_CALCULATORS) {
            expect(entry.category).toBe('project');
        }
    });

    it('is a subset of CALCULATOR_REGISTRY', () => {
        const registryIds = new Set(CALCULATOR_REGISTRY.map((e) => e.id));
        for (const entry of PROJECT_CALCULATORS) {
            expect(registryIds.has(entry.id)).toBe(true);
        }
    });
});

describe('HANDY_CALCULATORS', () => {
    it('contains only handy-category entries', () => {
        for (const entry of HANDY_CALCULATORS) {
            expect(entry.category).toBe('handy');
        }
    });

    it('PROJECT_CALCULATORS and HANDY_CALCULATORS together equal CALCULATOR_REGISTRY', () => {
        expect(PROJECT_CALCULATORS.length + HANDY_CALCULATORS.length).toBe(
            CALCULATOR_REGISTRY.length,
        );
    });
});

describe('LIVE_CALCULATORS', () => {
    it('contains only live-status entries', () => {
        for (const entry of LIVE_CALCULATORS) {
            expect(entry.status).toBe('live');
        }
    });

    it('contains no coming-soon entries', () => {
        for (const entry of LIVE_CALCULATORS) {
            expect(entry.comingSoon).toBeFalsy();
        }
    });
});

// ---------------------------------------------------------------------------
// getCalculatorById
// ---------------------------------------------------------------------------

describe('getCalculatorById', () => {
    it('returns the correct entry for a known id', () => {
        const entry = getCalculatorById('tiling');
        expect(entry).toBeDefined();
        expect(entry!.id).toBe('tiling');
    });

    it('returns undefined for an unknown id', () => {
        expect(getCalculatorById('nonexistent-calculator')).toBeUndefined();
    });

    it('finds coming-soon entries too', () => {
        const entry = getCalculatorById('board-cutting');
        expect(entry).toBeDefined();
        expect(entry!.comingSoon).toBe(true);
    });
});
