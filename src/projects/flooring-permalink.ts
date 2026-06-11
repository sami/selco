/**
 * @file src/projects/flooring-permalink.ts
 *
 * Permalink param schema for the Hard flooring project wizard (Layer 2).
 *
 * Consumed by `FlooringProjectWizard.tsx` together with the generic codec
 * in `permalink.ts`. Ancillary include/exclude toggles have mixed defaults,
 * so they are encoded explicitly as `0` / `1` rather than as presence flags.
 */

import type { PermalinkSchema } from './permalink';

/**
 * Query params accepted by the Hard flooring wizard.
 *
 * Key → wizard input:
 * - `rl` / `rw` — room length / width (m)
 * - `ls`  — L-shaped room (presence flag)
 * - `sl` / `sw` — extension length / width (m)
 * - `ft`  — flooring type
 * - `cpp` — coverage per pack (m²)
 * - `lp`  — laying pattern
 * - `im`  — installation method (solid wood only)
 * - `ul` / `ad` / `dpm` / `sc` / `ts` — ancillary toggles (0 | 1):
 *   underlay, adhesive, damp-proof membrane, scotia, thresholds
 * - `dc`  — number of doorways
 */
export const FLOORING_PERMALINK_SCHEMA = {
    rl: { kind: 'number', min: 0.01 },
    rw: { kind: 'number', min: 0.01 },
    ls: { kind: 'flag' },
    sl: { kind: 'number', min: 0.01 },
    sw: { kind: 'number', min: 0.01 },
    ft: { kind: 'enum', values: ['engineered', 'laminate', 'solid-wood', 'lvt'] },
    cpp: { kind: 'number', min: 0.01 },
    lp: { kind: 'enum', values: ['straight', 'brick-bond', 'diagonal', 'herringbone'] },
    im: { kind: 'enum', values: ['floating', 'glue-down'] },
    ul: { kind: 'enum', values: ['0', '1'] },
    ad: { kind: 'enum', values: ['0', '1'] },
    dpm: { kind: 'enum', values: ['0', '1'] },
    sc: { kind: 'enum', values: ['0', '1'] },
    ts: { kind: 'enum', values: ['0', '1'] },
    dc: { kind: 'number', min: 0, max: 20 },
} satisfies PermalinkSchema;
