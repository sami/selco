/**
 * @file src/projects/masonry-permalink.test.ts
 *
 * Tests for the Brick & block wall wizard permalink schema (Layer 2).
 *
 * The masonry wizard has repeating wall-section and opening inputs. These
 * are encoded as indexed number params (w1l/w1h …, o1w/o1h …) up to a fixed
 * cap, with pure helpers to pack and unpack the arrays.
 */

import { describe, test, expect } from 'vitest';
import { decodePermalink, encodePermalink } from './permalink';
import {
    MASONRY_PERMALINK_SCHEMA,
    MAX_WALL_SECTIONS,
    MAX_OPENINGS,
    wallsToParams,
    paramsToWalls,
    openingsToParams,
    paramsToOpenings,
} from './masonry-permalink';

describe('MASONRY_PERMALINK_SCHEMA', () => {
    test('TC1: decodes a realistic shared link', () => {
        const decoded = decodePermalink(
            MASONRY_PERMALINK_SCHEMA,
            '?w1l=5&w1h=2.4&w2l=3&w2h=2.4&wt=cavity&mix=1:4&cw=100&wa=5&dpc=1&ab=0',
        );
        expect(decoded).toEqual({
            w1l: '5',
            w1h: '2.4',
            w2l: '3',
            w2h: '2.4',
            wt: 'cavity',
            mix: '1:4',
            cw: '100',
            wa: '5',
            dpc: '1',
            ab: '0',
        });
    });

    test('TC2: keeps valid params and drops invalid ones from a mixed link', () => {
        const decoded = decodePermalink(
            MASONRY_PERMALINK_SCHEMA,
            '?w1l=5&w1h=-2&wt=igloo&mix=1:9&wa=200&cw=100',
        );
        expect(decoded).toEqual({ w1l: '5', cw: '100' });
    });

    test('TC3: product params only accept catalogue product IDs', () => {
        expect(
            decodePermalink(
                MASONRY_PERMALINK_SCHEMA,
                '?bpr=lbc-london-brick-65&blp=thermalite-shield-100',
            ),
        ).toEqual({ bpr: 'lbc-london-brick-65', blp: 'thermalite-shield-100' });
        expect(
            decodePermalink(MASONRY_PERMALINK_SCHEMA, '?bpr=fake-brick&blp=<script>'),
        ).toEqual({});
    });

    test('TC4: full wizard state round-trips unchanged', () => {
        const values = {
            w1l: '5',
            w1h: '2.4',
            o1w: '1200',
            o1h: '2100',
            wt: 'cavity',
            bpr: 'ibstock-regent-68',
            blp: 'dense-concrete-block-100',
            mix: '1:3',
            cw: '110',
            wa: '7.5',
            dpc: '1',
            ab: '1',
        };
        const query = encodePermalink(MASONRY_PERMALINK_SCHEMA, values);
        expect(decodePermalink(MASONRY_PERMALINK_SCHEMA, `?${query}`)).toEqual(values);
    });
});

describe('walls helpers', () => {
    test('TC5: wallsToParams packs sections into indexed params', () => {
        expect(
            wallsToParams([
                { length: '5', height: '2.4' },
                { length: '3', height: '2.4' },
            ]),
        ).toEqual({ w1l: '5', w1h: '2.4', w2l: '3', w2h: '2.4' });
    });

    test('TC6: wallsToParams skips incomplete sections and truncates at the cap', () => {
        expect(wallsToParams([{ length: '5', height: '' }])).toEqual({});
        const many = Array.from({ length: MAX_WALL_SECTIONS + 3 }, () => ({
            length: '2',
            height: '2',
        }));
        const packed = wallsToParams(many);
        expect(Object.keys(packed)).toHaveLength(MAX_WALL_SECTIONS * 2);
    });

    test('TC7: paramsToWalls rebuilds only complete pairs, in index order', () => {
        expect(
            paramsToWalls({ w1l: '5', w1h: '2.4', w2l: '3', w2h: '2.4' }),
        ).toEqual([
            { length: '5', height: '2.4' },
            { length: '3', height: '2.4' },
        ]);
        // w2 incomplete — only w1 and w3 survive
        expect(
            paramsToWalls({ w1l: '5', w1h: '2.4', w2l: '3', w3l: '4', w3h: '2' }),
        ).toEqual([
            { length: '5', height: '2.4' },
            { length: '4', height: '2' },
        ]);
        expect(paramsToWalls({})).toEqual([]);
    });

    test('TC8: openings helpers pack and rebuild the same way', () => {
        const openings = [
            { width: '1200', height: '2100' },
            { width: '900', height: '1200' },
        ];
        const packed = openingsToParams(openings);
        expect(packed).toEqual({ o1w: '1200', o1h: '2100', o2w: '900', o2h: '1200' });
        expect(paramsToOpenings(packed)).toEqual(openings);
        expect(paramsToOpenings({})).toEqual([]);
        const many = Array.from({ length: MAX_OPENINGS + 2 }, () => ({
            width: '600',
            height: '600',
        }));
        expect(Object.keys(openingsToParams(many))).toHaveLength(MAX_OPENINGS * 2);
    });
});
