/**
 * @file src/projects/tiling-permalink.ts
 *
 * Permalink param schema for the Tiling project wizard (Layer 2).
 *
 * Declares which query params the Tiling wizard accepts, how each maps to a
 * wizard input, and how it is validated. Consumed by
 * `TilingProjectWizard.tsx` together with the generic codec in
 * `permalink.ts`.
 *
 * Product params validate against the catalogue in `src/data/tiling-products`
 * (already a Layer 1 dependency), so a stale or tampered link can never
 * select a product that does not exist.
 *
 * Note: the tile-size preset is intentionally not encoded — the wizard
 * re-derives it from `tw`/`th` on load, falling back to "custom".
 */

import type { PermalinkSchema } from './permalink';
import { PATTERN_WASTAGE } from './tiling';
import {
    GROUT_PRODUCTS,
    PRIMER_PRODUCTS,
    BACKER_BOARD_PRODUCTS,
    TANKING_PRODUCTS,
    SLC_PRODUCTS,
} from '../data/tiling-products';

/** Allowed product IDs for an enum param, straight from the catalogue. */
const productIds = (products: ReadonlyArray<{ id: string }>): string[] =>
    products.map((product) => product.id);

/**
 * Query params accepted by the Tiling wizard.
 *
 * Key → wizard input:
 * - `unit` — area unit (m | ft)
 * - `aw` / `ah` — area width / height in the chosen unit
 * - `app`  — application (floor | wall)
 * - `tw` / `th` — tile width / height (mm)
 * - `gap`  — grout joint width (mm)
 * - `pat`  — laying pattern
 * - `twa`  — tile wastage (%)
 * - `bed`  — adhesive bed depth (mm)
 * - `abag` / `awa` — adhesive bag size (kg) / wastage (%)
 * - `tde`  — tile depth (mm)
 * - `gbag` / `gwa` / `gpr` — grout bag size (kg) / wastage (%) / product
 * - `spk`  — spacers per pack
 * - `ppr` / `pco` — primer product / coats
 * - `bpr`  — backer board product
 * - `tkp`  — tanking product
 * - `slp` / `sld` / `slb` — SLC product / depth (mm) / bag size (kg)
 * - `skp` / `skb` / `skt` / `sks` — skip flags for the optional steps
 *   (primer, backer board, tanking, SLC)
 */
export const TILING_PERMALINK_SCHEMA = {
    unit: { kind: 'enum', values: ['m', 'ft'] },
    aw: { kind: 'number', min: 0.01 },
    ah: { kind: 'number', min: 0.01 },
    app: { kind: 'enum', values: ['floor', 'wall'] },
    tw: { kind: 'number', min: 1 },
    th: { kind: 'number', min: 1 },
    gap: { kind: 'number', min: 0 },
    pat: { kind: 'enum', values: Object.keys(PATTERN_WASTAGE) },
    twa: { kind: 'number', min: 0, max: 100 },
    bed: { kind: 'number', min: 0.5 },
    abag: { kind: 'number', min: 1 },
    awa: { kind: 'number', min: 0, max: 100 },
    tde: { kind: 'number', min: 1 },
    gbag: { kind: 'number', min: 1 },
    gwa: { kind: 'number', min: 0, max: 100 },
    gpr: { kind: 'enum', values: productIds(GROUT_PRODUCTS) },
    spk: { kind: 'number', min: 1 },
    ppr: { kind: 'enum', values: productIds(PRIMER_PRODUCTS) },
    pco: { kind: 'number', min: 1, max: 10 },
    bpr: { kind: 'enum', values: productIds(BACKER_BOARD_PRODUCTS) },
    tkp: { kind: 'enum', values: productIds(TANKING_PRODUCTS) },
    slp: { kind: 'enum', values: productIds(SLC_PRODUCTS) },
    sld: { kind: 'number', min: 0.5 },
    slb: { kind: 'number', min: 1 },
    skp: { kind: 'flag' },
    skb: { kind: 'flag' },
    skt: { kind: 'flag' },
    sks: { kind: 'flag' },
} satisfies PermalinkSchema;
