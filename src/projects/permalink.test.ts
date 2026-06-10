/**
 * @file src/projects/permalink.test.ts
 *
 * Tests for the generic permalink query-param codec (Layer 2).
 *
 * The codec serialises wizard inputs to a URL query string and parses them
 * back, validating every value against a declarative schema. Unknown keys
 * and malformed values must be dropped silently so a bad link can never
 * crash or blank a wizard — it simply falls back to defaults.
 */

import { describe, test, expect } from 'vitest';
import {
    decodePermalink,
    encodePermalink,
    type PermalinkSchema,
} from './permalink';

const schema = {
    unit: { kind: 'enum', values: ['m', 'ft'] },
    aw: { kind: 'number', min: 0.01 },
    twa: { kind: 'number', min: 0, max: 100 },
    skp: { kind: 'flag' },
} satisfies PermalinkSchema;

describe('decodePermalink', () => {
    test('TC1: parses valid values for every schema kind', () => {
        const decoded = decodePermalink(schema, '?unit=ft&aw=4.5&twa=12&skp=1');
        expect(decoded).toEqual({ unit: 'ft', aw: '4.5', twa: '12', skp: '1' });
    });

    test('TC2: ignores params that are not in the schema', () => {
        const decoded = decodePermalink(schema, '?unit=m&utm_source=email&rogue=1');
        expect(decoded).toEqual({ unit: 'm' });
    });

    test('TC3: drops non-numeric values for number params', () => {
        expect(decodePermalink(schema, '?aw=abc')).toEqual({});
        expect(decodePermalink(schema, '?aw=')).toEqual({});
        expect(decodePermalink(schema, '?aw=1e999')).toEqual({});
        expect(decodePermalink(schema, '?aw=NaN')).toEqual({});
    });

    test('TC4: drops numbers outside the min/max bounds', () => {
        expect(decodePermalink(schema, '?aw=-5')).toEqual({});
        expect(decodePermalink(schema, '?aw=0')).toEqual({});
        expect(decodePermalink(schema, '?twa=101')).toEqual({});
        expect(decodePermalink(schema, '?twa=0')).toEqual({ twa: '0' });
        expect(decodePermalink(schema, '?twa=100')).toEqual({ twa: '100' });
    });

    test('TC5: drops enum values that are not in the allowed list', () => {
        expect(decodePermalink(schema, '?unit=yards')).toEqual({});
        expect(decodePermalink(schema, '?unit=M')).toEqual({});
    });

    test('TC6: flags accept "1" only', () => {
        expect(decodePermalink(schema, '?skp=1')).toEqual({ skp: '1' });
        expect(decodePermalink(schema, '?skp=true')).toEqual({});
        expect(decodePermalink(schema, '?skp=0')).toEqual({});
        expect(decodePermalink(schema, '?skp=')).toEqual({});
    });

    test('TC7: empty or missing query string decodes to an empty object', () => {
        expect(decodePermalink(schema, '')).toEqual({});
        expect(decodePermalink(schema, '?')).toEqual({});
    });

    test('TC8: accepts the search string with or without a leading "?"', () => {
        expect(decodePermalink(schema, 'unit=ft')).toEqual({ unit: 'ft' });
        expect(decodePermalink(schema, '?unit=ft')).toEqual({ unit: 'ft' });
    });

    test('TC9: keeps valid params from a partially malformed query', () => {
        const decoded = decodePermalink(schema, '?unit=m&aw=banana&twa=15&skp=yes');
        expect(decoded).toEqual({ unit: 'm', twa: '15' });
    });

    test('TC10: garbage input does not throw', () => {
        expect(() => decodePermalink(schema, '?=&&==%%%&unit')).not.toThrow();
        expect(decodePermalink(schema, '?=&&==&unit')).toEqual({});
    });
});

describe('encodePermalink', () => {
    test('TC11: serialises valid values to a query string', () => {
        const query = encodePermalink(schema, {
            unit: 'ft',
            aw: '4.5',
            twa: '12',
            skp: '1',
        });
        expect(query).toBe('unit=ft&aw=4.5&twa=12&skp=1');
    });

    test('TC12: omits empty and missing values', () => {
        expect(encodePermalink(schema, { unit: 'm', aw: '' })).toBe('unit=m');
        expect(encodePermalink(schema, {})).toBe('');
    });

    test('TC13: omits values that fail schema validation', () => {
        const query = encodePermalink(schema, {
            unit: 'yards',
            aw: '-2',
            twa: '15',
        });
        expect(query).toBe('twa=15');
    });

    test('TC14: ignores keys that are not in the schema', () => {
        expect(encodePermalink(schema, { unit: 'm', rogue: '1' })).toBe('unit=m');
    });

    test('TC15: round-trips through decodePermalink unchanged', () => {
        const values = { unit: 'm', aw: '3.25', twa: '0', skp: '1' };
        const query = encodePermalink(schema, values);
        expect(decodePermalink(schema, `?${query}`)).toEqual(values);
    });
});
