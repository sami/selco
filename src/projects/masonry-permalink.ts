/**
 * @file src/projects/masonry-permalink.ts
 *
 * Permalink param schema for the Brick & block wall wizard (Layer 2).
 *
 * Consumed by `MasonryProjectWizard.tsx` together with the generic codec in
 * `permalink.ts`. The wizard has repeating wall-section and opening inputs;
 * these are encoded as indexed number params (`w1l`/`w1h` …, `o1w`/`o1h` …)
 * up to a fixed cap, using the pure pack/unpack helpers below. Anything
 * beyond the cap is silently truncated from the link.
 */

import type { PermalinkSchema, PermalinkValues } from './permalink';
import { BRICK_PRODUCTS, BLOCK_PRODUCTS } from '../data/masonry-products';

/** Maximum wall sections a link can carry. */
export const MAX_WALL_SECTIONS = 8;

/** Maximum openings a link can carry. */
export const MAX_OPENINGS = 8;

/** Indexed number params: `w1l`, `w1h` … and `o1w`, `o1h` … */
const indexedPairs = (
    prefix: string,
    suffixes: [string, string],
    count: number,
    min: number,
): Record<string, { kind: 'number'; min: number }> => {
    const specs: Record<string, { kind: 'number'; min: number }> = {};
    for (let i = 1; i <= count; i += 1) {
        specs[`${prefix}${i}${suffixes[0]}`] = { kind: 'number', min };
        specs[`${prefix}${i}${suffixes[1]}`] = { kind: 'number', min };
    }
    return specs;
};

/**
 * Query params accepted by the Brick & block wall wizard.
 *
 * Key → wizard input:
 * - `w1l`/`w1h` … `w8l`/`w8h` — wall section length / height (m)
 * - `o1w`/`o1h` … `o8w`/`o8h` — opening width / height (mm)
 * - `wt`  — wall type (brick | block | cavity)
 * - `bpr` — brick product
 * - `blp` — block product
 * - `mix` — mortar mix ratio
 * - `cw`  — cavity width (mm)
 * - `wa`  — wastage (%)
 * - `dpc` / `ab` — DPC and air-brick toggles (0 | 1; default-on)
 */
export const MASONRY_PERMALINK_SCHEMA = {
    ...indexedPairs('w', ['l', 'h'], MAX_WALL_SECTIONS, 0.01),
    ...indexedPairs('o', ['w', 'h'], MAX_OPENINGS, 1),
    wt: { kind: 'enum', values: ['brick', 'block', 'cavity'] },
    bpr: { kind: 'enum', values: BRICK_PRODUCTS.map((p) => p.id) },
    blp: { kind: 'enum', values: BLOCK_PRODUCTS.map((p) => p.id) },
    mix: { kind: 'enum', values: ['1:3', '1:4'] },
    cw: { kind: 'number', min: 50 },
    wa: { kind: 'number', min: 0, max: 50 },
    dpc: { kind: 'enum', values: ['0', '1'] },
    ab: { kind: 'enum', values: ['0', '1'] },
} satisfies PermalinkSchema;

// ---------------------------------------------------------------------------
// Repeater pack/unpack helpers
// ---------------------------------------------------------------------------

interface IndexedPair {
    first: string;
    second: string;
}

const pairsToParams = (
    pairs: IndexedPair[],
    prefix: string,
    suffixes: [string, string],
    cap: number,
): PermalinkValues => {
    const values: PermalinkValues = {};
    let index = 0;
    for (const pair of pairs) {
        if (index >= cap) break;
        if (pair.first === '' || pair.second === '') continue;
        index += 1;
        values[`${prefix}${index}${suffixes[0]}`] = pair.first;
        values[`${prefix}${index}${suffixes[1]}`] = pair.second;
    }
    return values;
};

const paramsToPairs = (
    values: PermalinkValues,
    prefix: string,
    suffixes: [string, string],
    cap: number,
): IndexedPair[] => {
    const pairs: IndexedPair[] = [];
    for (let i = 1; i <= cap; i += 1) {
        const first = values[`${prefix}${i}${suffixes[0]}`];
        const second = values[`${prefix}${i}${suffixes[1]}`];
        if (first !== undefined && second !== undefined) {
            pairs.push({ first, second });
        }
    }
    return pairs;
};

/** Pack wall sections into indexed params (complete sections only). */
export const wallsToParams = (
    walls: ReadonlyArray<{ length: string; height: string }>,
): PermalinkValues =>
    pairsToParams(
        walls.map((w) => ({ first: w.length, second: w.height })),
        'w',
        ['l', 'h'],
        MAX_WALL_SECTIONS,
    );

/** Rebuild wall sections from decoded params (complete pairs, index order). */
export const paramsToWalls = (
    values: PermalinkValues,
): { length: string; height: string }[] =>
    paramsToPairs(values, 'w', ['l', 'h'], MAX_WALL_SECTIONS).map((p) => ({
        length: p.first,
        height: p.second,
    }));

/** Pack openings into indexed params (complete openings only). */
export const openingsToParams = (
    openings: ReadonlyArray<{ width: string; height: string }>,
): PermalinkValues =>
    pairsToParams(
        openings.map((o) => ({ first: o.width, second: o.height })),
        'o',
        ['w', 'h'],
        MAX_OPENINGS,
    );

/** Rebuild openings from decoded params (complete pairs, index order). */
export const paramsToOpenings = (
    values: PermalinkValues,
): { width: string; height: string }[] =>
    paramsToPairs(values, 'o', ['w', 'h'], MAX_OPENINGS).map((p) => ({
        width: p.first,
        height: p.second,
    }));
