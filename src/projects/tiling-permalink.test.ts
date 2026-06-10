/**
 * @file src/projects/tiling-permalink.test.ts
 *
 * Tests for the Tiling wizard permalink schema (Layer 2).
 *
 * The schema declares which query params the Tiling wizard accepts and how
 * each is validated. Product params must only accept IDs that exist in the
 * product catalogue, so a stale or tampered link falls back to defaults
 * rather than selecting a product that does not exist.
 */

import { describe, test, expect } from 'vitest';
import { decodePermalink, encodePermalink } from './permalink';
import { TILING_PERMALINK_SCHEMA } from './tiling-permalink';

describe('TILING_PERMALINK_SCHEMA', () => {
    test('TC16: decodes a realistic shared link', () => {
        const decoded = decodePermalink(
            TILING_PERMALINK_SCHEMA,
            '?unit=m&aw=4.5&ah=3.2&app=floor&tw=300&th=600&gap=3&pat=herringbone&twa=15',
        );
        expect(decoded).toEqual({
            unit: 'm',
            aw: '4.5',
            ah: '3.2',
            app: 'floor',
            tw: '300',
            th: '600',
            gap: '3',
            pat: 'herringbone',
            twa: '15',
        });
    });

    test('TC17: keeps valid params and drops invalid ones from a mixed link', () => {
        const decoded = decodePermalink(
            TILING_PERMALINK_SCHEMA,
            '?unit=m&aw=-5&app=ceiling&pat=zigzag&gap=3',
        );
        expect(decoded).toEqual({ unit: 'm', gap: '3' });
    });

    test('TC18: product params only accept catalogue product IDs', () => {
        expect(
            decodePermalink(TILING_PERMALINK_SCHEMA, '?gpr=mapei-ultracolor-plus'),
        ).toEqual({ gpr: 'mapei-ultracolor-plus' });
        expect(
            decodePermalink(TILING_PERMALINK_SCHEMA, '?gpr=not-a-real-product'),
        ).toEqual({});
        expect(
            decodePermalink(TILING_PERMALINK_SCHEMA, '?slp=mapei-ultraplan&ppr=<script>'),
        ).toEqual({ slp: 'mapei-ultraplan' });
    });

    test('TC19: skip flags decode independently', () => {
        const decoded = decodePermalink(
            TILING_PERMALINK_SCHEMA,
            '?skp=1&skb=1&skt=0&sks=true',
        );
        expect(decoded).toEqual({ skp: '1', skb: '1' });
    });

    test('TC20: full wizard state round-trips unchanged', () => {
        const values = {
            unit: 'ft',
            aw: '14.7',
            ah: '10.5',
            app: 'wall',
            tw: '100',
            th: '200',
            gap: '2',
            pat: 'brick_bond',
            twa: '12',
            bed: '3',
            abag: '20',
            awa: '10',
            tde: '8',
            gbag: '5',
            gwa: '10',
            gpr: 'mapei-ultracolor-plus',
            spk: '250',
            pco: '1',
            sld: '3',
            slb: '25',
            skb: '1',
        };
        const query = encodePermalink(TILING_PERMALINK_SCHEMA, values);
        expect(decodePermalink(TILING_PERMALINK_SCHEMA, `?${query}`)).toEqual(values);
    });
});
