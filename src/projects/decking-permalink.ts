/**
 * @file src/projects/decking-permalink.ts
 *
 * Permalink param schema for the Decking project wizard (Layer 2).
 *
 * Consumed by `DeckingProjectWizard.tsx` together with the generic codec in
 * `permalink.ts`. Product and preset params validate against the catalogue
 * in `src/data/decking-products`, so a stale or tampered link falls back to
 * defaults rather than selecting something that does not exist.
 */

import type { PermalinkSchema } from './permalink';
import {
    BOARD_PRESETS,
    FIXING_PRODUCTS,
    JOIST_PRODUCTS,
} from '../data/decking-products';

/**
 * Query params accepted by the Decking wizard.
 *
 * Key → wizard input:
 * - `dl` / `dw` — deck length / width (m)
 * - `bp`  — board preset (product ID)
 * - `bw` / `bl` — board width / length (mm)
 * - `gap` — board gap (mm)
 * - `bwa` — board wastage (%)
 * - `fm`  — fixing method (face-fix-screws | hidden-clips)
 * - `fp`  — fixing product
 * - `fwa` — fixing wastage (%)
 * - `js`  — joist spacing (mm, fixed options)
 * - `jp`  — joist product
 * - `jsl` — joist stock length (mm, fixed options)
 * - `blk` — include concrete deck blocks (0 | 1; default-on toggle)
 * - `jwa` — joist wastage (%)
 */
export const DECKING_PERMALINK_SCHEMA = {
    dl: { kind: 'number', min: 0.01 },
    dw: { kind: 'number', min: 0.01 },
    bp: { kind: 'enum', values: BOARD_PRESETS.map((p) => p.value) },
    bw: { kind: 'number', min: 1 },
    bl: { kind: 'number', min: 1 },
    gap: { kind: 'number', min: 0, max: 15 },
    bwa: { kind: 'number', min: 0, max: 30 },
    fm: { kind: 'enum', values: ['face-fix-screws', 'hidden-clips'] },
    fp: { kind: 'enum', values: FIXING_PRODUCTS.map((p) => p.id) },
    fwa: { kind: 'number', min: 0, max: 20 },
    js: { kind: 'enum', values: ['300', '400', '450', '500'] },
    jp: { kind: 'enum', values: JOIST_PRODUCTS.map((p) => p.id) },
    jsl: { kind: 'enum', values: ['2400', '3000', '3600', '4800'] },
    blk: { kind: 'enum', values: ['0', '1'] },
    jwa: { kind: 'number', min: 0, max: 20 },
} satisfies PermalinkSchema;
