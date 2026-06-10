/**
 * @file src/projects/decking-permalink.test.ts
 *
 * Tests for the Decking wizard permalink schema (Layer 2).
 */

import { describe, test, expect } from 'vitest';
import { decodePermalink, encodePermalink } from './permalink';
import { DECKING_PERMALINK_SCHEMA } from './decking-permalink';

describe('DECKING_PERMALINK_SCHEMA', () => {
    test('TC1: decodes a realistic shared link', () => {
        const decoded = decodePermalink(
            DECKING_PERMALINK_SCHEMA,
            '?dl=4&dw=3&bp=composite-135-25-3600&bw=135&bl=3600&gap=5&bwa=10&fm=hidden-clips&js=400&jsl=3600&blk=1',
        );
        expect(decoded).toEqual({
            dl: '4',
            dw: '3',
            bp: 'composite-135-25-3600',
            bw: '135',
            bl: '3600',
            gap: '5',
            bwa: '10',
            fm: 'hidden-clips',
            js: '400',
            jsl: '3600',
            blk: '1',
        });
    });

    test('TC2: keeps valid params and drops invalid ones from a mixed link', () => {
        const decoded = decodePermalink(
            DECKING_PERMALINK_SCHEMA,
            '?dl=-4&dw=3&fm=nails&js=350&gap=20&bwa=10',
        );
        expect(decoded).toEqual({ dw: '3', bwa: '10' });
    });

    test('TC3: product params only accept catalogue product IDs', () => {
        expect(
            decodePermalink(DECKING_PERMALINK_SCHEMA, '?fp=deck-screws-75-200&jp=joist-47x100-2400'),
        ).toEqual({ fp: 'deck-screws-75-200', jp: 'joist-47x100-2400' });
        expect(
            decodePermalink(DECKING_PERMALINK_SCHEMA, '?fp=fake-screws&jp=<script>&bp=not-a-board'),
        ).toEqual({});
    });

    test('TC4: deck-blocks toggle accepts "0" and "1" only', () => {
        expect(decodePermalink(DECKING_PERMALINK_SCHEMA, '?blk=0')).toEqual({ blk: '0' });
        expect(decodePermalink(DECKING_PERMALINK_SCHEMA, '?blk=1')).toEqual({ blk: '1' });
        expect(decodePermalink(DECKING_PERMALINK_SCHEMA, '?blk=true')).toEqual({});
    });

    test('TC5: full wizard state round-trips unchanged', () => {
        const values = {
            dl: '4.2',
            dw: '3.6',
            bp: 'softwood-120-32-3600',
            bw: '120',
            bl: '3600',
            gap: '6',
            bwa: '10',
            fm: 'face-fix-screws',
            fp: 'deck-screws-75-600',
            fwa: '5',
            js: '450',
            jp: 'joist-47x150-3600',
            jsl: '4800',
            blk: '0',
            jwa: '10',
        };
        const query = encodePermalink(DECKING_PERMALINK_SCHEMA, values);
        expect(decodePermalink(DECKING_PERMALINK_SCHEMA, `?${query}`)).toEqual(values);
    });
});
