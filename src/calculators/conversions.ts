/** Supported length units. */
export type LengthUnit = 'mm' | 'cm' | 'm' | 'in' | 'ft' | 'yd';

/** Supported area units. */
export type AreaUnit = 'mm2' | 'cm2' | 'm2' | 'ft2' | 'yd2';

/** Supported weight units. */
export type WeightUnit = 'g' | 'kg' | 'oz' | 'lb';

// ---------------------------------------------------------------------------
// Conversion factors — each value converts 1 of that unit TO the base unit
// ---------------------------------------------------------------------------

/** Factor to convert 1 unit → metres. */
const lengthToMetres: Record<LengthUnit, number> = {
    mm: 0.001,
    cm: 0.01,
    m: 1,
    in: 0.0254,
    ft: 0.3048,
    yd: 0.9144,
};

/** Factor to convert 1 unit → square metres. */
const areaToM2: Record<AreaUnit, number> = {
    mm2: 1e-6,
    cm2: 1e-4,
    m2: 1,
    ft2: 0.09290304,
    yd2: 0.83612736,
};

/** Factor to convert 1 unit → kilograms. */
const weightToKg: Record<WeightUnit, number> = {
    g: 0.001,
    kg: 1,
    oz: 0.0283495231,
    lb: 0.45359237,
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Convert a length value between two units.
 *
 * @param value - The numeric value to convert.
 * @param from  - Source unit.
 * @param to    - Target unit.
 * @returns The converted value.
 */
export function convertLength(value: number, from: LengthUnit, to: LengthUnit): number {
    if (from === to) return value;
    const metres = value * lengthToMetres[from];
    return metres / lengthToMetres[to];
}

/**
 * Convert an area value between two units.
 *
 * @param value - The numeric value to convert.
 * @param from  - Source unit.
 * @param to    - Target unit.
 * @returns The converted value.
 */
export function convertArea(value: number, from: AreaUnit, to: AreaUnit): number {
    if (from === to) return value;
    const m2 = value * areaToM2[from];
    return m2 / areaToM2[to];
}

/**
 * Convert a weight value between two units.
 *
 * @param value - The numeric value to convert.
 * @param from  - Source unit.
 * @param to    - Target unit.
 * @returns The converted value.
 */
export function convertWeight(value: number, from: WeightUnit, to: WeightUnit): number {
    if (from === to) return value;
    const kg = value * weightToKg[from];
    return kg / weightToKg[to];
}
