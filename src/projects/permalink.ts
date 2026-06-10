/**
 * @file src/projects/permalink.ts
 *
 * Generic permalink query-param codec (Layer 2).
 *
 * Wizard inputs are serialised into a URL query string so a user can copy a
 * link on one device and open it on another with the same values prefilled.
 * Every value is validated against a declarative {@link PermalinkSchema} in
 * both directions: unknown keys and malformed values are dropped silently,
 * so a bad or tampered link can never crash a wizard — the affected inputs
 * simply fall back to their defaults.
 *
 * This module is pure (no React, no DOM, no I/O). Each wizard declares its
 * own schema alongside its Layer 2 step config — see `tiling-permalink.ts`.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Validation rule for a single query param. */
export type PermalinkParamSpec =
    /** Value must be one of a fixed set of strings (e.g. units, product IDs). */
    | { kind: 'enum'; values: readonly string[] }
    /** Value must parse to a finite number within the optional bounds. */
    | { kind: 'number'; min?: number; max?: number }
    /** Boolean marker — present and equal to `'1'`, or absent. */
    | { kind: 'flag' };

/** Maps each accepted query-param key to its validation rule. */
export type PermalinkSchema = Readonly<Record<string, PermalinkParamSpec>>;

/**
 * Decoded param values, keyed by schema key. Values stay as strings —
 * wizard inputs hold strings, and flags decode to the literal `'1'`.
 */
export type PermalinkValues = Record<string, string>;

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/** True if `raw` satisfies `spec`. */
function isValidParamValue(spec: PermalinkParamSpec, raw: string): boolean {
    switch (spec.kind) {
        case 'enum':
            return spec.values.includes(raw);
        case 'number': {
            const trimmed = raw.trim();
            if (trimmed === '') return false;
            const value = Number(trimmed);
            if (!Number.isFinite(value)) return false;
            if (spec.min !== undefined && value < spec.min) return false;
            if (spec.max !== undefined && value > spec.max) return false;
            return true;
        }
        case 'flag':
            return raw === '1';
    }
}

// ---------------------------------------------------------------------------
// Codec
// ---------------------------------------------------------------------------

/**
 * Parse a `location.search` string against a schema.
 *
 * @param schema - The wizard's param schema.
 * @param search - The query string, with or without the leading `?`.
 * @returns Only the params that exist in the schema and pass validation.
 */
export function decodePermalink(
    schema: PermalinkSchema,
    search: string,
): PermalinkValues {
    const params = new URLSearchParams(search);
    const decoded: PermalinkValues = {};
    for (const [key, spec] of Object.entries(schema)) {
        const raw = params.get(key);
        if (raw !== null && isValidParamValue(spec, raw)) {
            decoded[key] = raw;
        }
    }
    return decoded;
}

/**
 * Serialise wizard values to a query string (without the leading `?`).
 *
 * Keys not present in the schema, empty values, and values that fail
 * validation are omitted, so the generated link only ever carries params
 * that {@link decodePermalink} will accept back.
 *
 * @param schema - The wizard's param schema.
 * @param values - Current input values keyed by schema key. Encode flags as
 *                 `'1'` when set and `''` when not.
 */
export function encodePermalink(
    schema: PermalinkSchema,
    values: PermalinkValues,
): string {
    const params = new URLSearchParams();
    for (const [key, spec] of Object.entries(schema)) {
        const raw = values[key];
        if (raw !== undefined && raw !== '' && isValidParamValue(spec, raw)) {
            params.set(key, raw);
        }
    }
    return params.toString();
}
