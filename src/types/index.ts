/**
 * @file src/types/index.ts
 *
 * Shared types barrel for the SELCO Trade Materials Calculator.
 *
 * All calculator-specific input/output interfaces are defined in
 * {@link ../calculators/types} and re-exported from here so that
 * consumers can import from a single canonical path:
 *
 * ```ts
 * import type { TileInput, MaterialQuantity, CalculatorMeta } from '../types';
 * ```
 *
 * Design context: the app follows a two-category taxonomy (Project Calculators
 * vs Handy Calculators), a three-button design system, and the canonical SELCO
 * live-site colour palette. All of these are reflected in the types below.
 */

// Re-export every interface and type from the calculators type file.
export type * from '../calculators/types';

// ===========================================================================
// Design system — brand palette
// ===========================================================================

/**
 * Canonical SELCO brand colours, aligned to the live site (selcobw.com).
 * Single source of truth for TypeScript; the CSS equivalents live in
 * `src/styles/global.css` inside the `@theme` block.
 *
 * @example
 * import { BRAND } from '../types';
 * const navBg = BRAND.navy; // '#04204b'
 */
export const BRAND = {
    navy: '#04204b',
    blue: '#253081',
    yellow: '#ffd407',
    lightGrey: '#f2f6fa',
    white: '#ffffff',
} as const;

// ===========================================================================
// Design system — component types
// ===========================================================================

/**
 * The three canonical button variants that achieve WCAG AAA contrast.
 *
 * - `'primary'` — navy background, white text. Used for submit actions
 *                 (Calculate, Save).
 * - `'accent'`  — yellow background, navy text. Used for wizard advance and
 *                 primary CTAs (Next Step, Start Project).
 * - `'ghost'`   — transparent background, navy border. Used for secondary
 *                 actions (Back, Reset, Skip).
 */
export type ButtonVariant = 'primary' | 'accent' | 'ghost';

// ===========================================================================
// Unit system
// ===========================================================================

/**
 * Top-level category for a unit of measurement.
 * Matches the conversion families exposed by `src/calculators/conversions.ts`.
 */
export type UnitCategory =
    | 'length'
    | 'area'
    | 'volume'
    | 'weight'
    | 'temperature'
    | 'density';

/**
 * A single unit of measurement with its symbol, full name, and category.
 * Matches the shape used by `UNITS` in `src/calculators/conversions.ts`.
 */
export interface Unit {
    /** Short symbol shown in the UI (e.g. `'m'`, `'ft'`, `'kg'`). */
    symbol: string;
    /** Full name for accessibility labels (e.g. `'metres'`, `'kilograms'`). */
    name: string;
    /** Top-level measurement category. */
    category: UnitCategory;
}

// ===========================================================================
// Calculator taxonomy — two-category design model
// ===========================================================================

/**
 * Top-level category that determines how a calculator is presented.
 *
 * - `'project'`  — wizard-style multi-step flow (e.g. Tiling, Flooring).
 *                  Sequences several Layer 1 calculators and carries shared
 *                  inputs (area, tile size) between steps.
 * - `'handy'`    — standalone single-purpose tool (e.g. Unit Converter,
 *                  Board Coverage). One input form, one result.
 */
export type CalculatorCategory = 'project' | 'handy';

/**
 * Publication status of a calculator.
 *
 * - `'live'`         — fully built and accessible to users.
 * - `'coming-soon'`  — placeholder card shown in the homepage grid; the
 *                      route does not yet exist.
 */
export type CalculatorStatus = 'live' | 'coming-soon';

/**
 * Registry entry describing a calculator's identity, routing, and
 * categorisation. Consumed by `src/projects/registry.ts`, the homepage grid,
 * and sidebar navigation.
 *
 * @see {@link CalculatorCategory}
 * @see {@link CalculatorStatus}
 */
export interface CalculatorMeta {
    /** Unique identifier. Used as a lookup key in `getCalculatorById`. */
    id: string;
    /** Human-readable name shown in navigation and card headings. */
    name: string;
    /**
     * URL-safe slug for routing.
     * Typically the same as `id` (e.g. `'tiling'`, `'unit-converter'`).
     */
    slug: string;
    /** One-sentence description for card subtitles and `<meta>` tags. */
    description: string;
    /** Top-level category. Drives sidebar grouping and card styling. */
    category: CalculatorCategory;
    /** Authoritative publication status. */
    status: CalculatorStatus;
    /**
     * Convenience shorthand for `status === 'coming-soon'`.
     * Set to `true` on all coming-soon entries so templates can use
     * `{calc.comingSoon && <Badge>}` without a string comparison.
     */
    comingSoon?: boolean;
    /** URL path relative to `BASE_URL` (e.g. `'/tiling/'`). */
    path: string;
    /**
     * Path to the SVG hero banner in `public/images/hero/`.
     * Used as `<img src={calc.icon}>` in card and page headers.
     */
    icon?: string;
}

// ===========================================================================
// Calculator base types
// ===========================================================================

/**
 * Generic input shape for any calculator.
 * Use this as a base constraint when writing generic calculator utilities.
 */
export interface CalculatorInput {
    [key: string]: number | string | boolean;
}

/**
 * A single material entry in a bill-of-materials or purchase list.
 * Used when assembling the summary table at the end of a project wizard.
 */
export interface MaterialQuantity {
    /** Human-readable material name (e.g. `'Tile adhesive'`). */
    material: string;
    /** Calculated quantity value (e.g. `22.4`). */
    quantity: number;
    /** Unit of measurement (e.g. `'kg'`, `'boards'`, `'litres'`). */
    unit: string;
    /** Purchase unit size (e.g. `20` for a 20 kg bag). */
    packSize?: number;
    /** Number of packs to buy, ceiling-rounded (e.g. `2`). */
    packsNeeded?: number;
}

/**
 * Full result returned by a project-level calculator (multi-material).
 * Individual Layer 1 calculators return their own typed results; this
 * type is for the assembled summary emitted by a project wizard.
 */
export interface CalculatorResult {
    /** Bill of materials — one entry per material type. */
    materials: MaterialQuantity[];
    /** Total project area in m² (if area-based). */
    totalArea?: number;
    /** Wastage percentage applied across the project. */
    wastePercent: number;
    /**
     * Non-fatal warnings the user should see (e.g. substrate cautions,
     * minimum order quantities not met, pattern-specific advice).
     */
    warnings?: string[];
}

// ===========================================================================
// Wastage presets
// ===========================================================================

/**
 * Laying pattern identifiers used by wastage presets and spacer calculations.
 *
 * Note: the tiling wizard also uses `TilePattern` (from `calculators/types`)
 * which uses underscore naming (`brick_bond`, `grid`) to match the internal
 * spacer model. `LayingPattern` uses hyphen naming matching the constants
 * exported by `src/calculators/constants.ts`.
 */
export type LayingPattern = 'straight' | 'brick-bond' | 'diagonal' | 'herringbone';

/**
 * A map from each laying pattern to its recommended wastage percentage.
 * Exported from `src/calculators/constants.ts` as `WASTAGE`.
 */
export type WastagePreset = Record<LayingPattern, number>;

// ===========================================================================
// Common UI option pair
// ===========================================================================

/**
 * A `{ value, label }` pair for populating UI dropdowns.
 * Matches the shape exported by `UNITS` in `src/calculators/conversions.ts`
 * and all board/tile preset arrays.
 */
export interface UnitOption {
    value: string;
    label: string;
}

// ===========================================================================
// Product catalogue
// ===========================================================================

/**
 * A single product from the SELCO product catalogue.
 * Used to pre-populate calculator fields and build product-specific results.
 */
export interface Product {
    /** Unique product identifier (SKU or slug). */
    id: string;
    /** Full product name as shown on the SELCO website. */
    name: string;
    /** Manufacturer or brand name (e.g. `'Dunlop'`, `'Mapei'`). */
    brand?: string;
    /** Quantity per pack (e.g. `20` for a 20 kg bag). */
    packSize: number;
    /** Unit for `packSize` (e.g. `'kg'`, `'litres'`, `'m²'`). */
    packUnit: string;
    /** How much area or volume one unit covers at standard application. */
    coveragePerUnit: number;
    /** Unit for `coveragePerUnit` (e.g. `'m²/kg'`, `'m²/litre'`). */
    coverageUnit: string;
}
