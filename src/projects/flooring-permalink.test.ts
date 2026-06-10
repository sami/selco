/**
 * @file src/projects/flooring-permalink.test.ts
 *
 * Tests for the Hard flooring wizard permalink schema (Layer 2).
 */

import { describe, test, expect } from 'vitest';
import { decodePermalink, encodePermalink } from './permalink';
import { FLOORING_PERMALINK_SCHEMA } from './flooring-permalink';

describe('FLOORING_PERMALINK_SCHEMA', () => {
    test('TC1: decodes a realistic shared link', () => {
        const decoded = decodePermalink(
            FLOORING_PERMALINK_SCHEMA,
            '?rl=5&rw=4&ft=laminate&cpp=2.2&lp=brick-bond&ul=1&sc=1&ts=0&dc=2',
        );
        expect(decoded).toEqual({
            rl: '5',
            rw: '4',
            ft: 'laminate',
            cpp: '2.2',
            lp: 'brick-bond',
            ul: '1',
            sc: '1',
            ts: '0',
            dc: '2',
        });
    });

    test('TC2: keeps valid params and drops invalid ones from a mixed link', () => {
        const decoded = decodePermalink(
            FLOORING_PERMALINK_SCHEMA,
            '?rl=5&rw=0&ft=carpet&lp=zigzag&im=floating&dc=-1',
        );
        expect(decoded).toEqual({ rl: '5', im: 'floating' });
    });

    test('TC3: L-shape flag and extension dimensions decode together', () => {
        const decoded = decodePermalink(
            FLOORING_PERMALINK_SCHEMA,
            '?ls=1&sl=2&sw=1.5',
        );
        expect(decoded).toEqual({ ls: '1', sl: '2', sw: '1.5' });
        expect(decodePermalink(FLOORING_PERMALINK_SCHEMA, '?ls=yes')).toEqual({});
    });

    test('TC4: ancillary toggles accept "0" and "1" only', () => {
        expect(
            decodePermalink(FLOORING_PERMALINK_SCHEMA, '?ul=0&ad=1&dpm=1&sc=0&ts=1'),
        ).toEqual({ ul: '0', ad: '1', dpm: '1', sc: '0', ts: '1' });
        expect(
            decodePermalink(FLOORING_PERMALINK_SCHEMA, '?ul=true&ad=on&dpm=2'),
        ).toEqual({});
    });

    test('TC5: full wizard state round-trips unchanged', () => {
        const values = {
            rl: '5.5',
            rw: '4.2',
            ls: '1',
            sl: '2',
            sw: '1.5',
            ft: 'solid-wood',
            cpp: '1.8',
            lp: 'herringbone',
            im: 'glue-down',
            ul: '0',
            ad: '1',
            dpm: '1',
            sc: '1',
            ts: '0',
            dc: '3',
        };
        const query = encodePermalink(FLOORING_PERMALINK_SCHEMA, values);
        expect(decodePermalink(FLOORING_PERMALINK_SCHEMA, `?${query}`)).toEqual(values);
    });
});
