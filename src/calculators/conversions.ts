// ---------------------------------------------------------------------------
// Unit types
// ---------------------------------------------------------------------------

/** Supported length units. */
export type LengthUnit = 'mm' | 'cm' | 'm' | 'km' | 'in' | 'ft' | 'yd' | 'miles';

/** Supported area units. */
export type AreaUnit = 'mm2' | 'cm2' | 'm2' | 'hectare' | 'in2' | 'ft2' | 'yd2';

/** Supported weight units. */
export type WeightUnit = 'g' | 'kg' | 'oz' | 'lb' | 'tonnes' | 'stones' | 'cwt';

/** Supported volume units. */
export type VolumeUnit = 'cm3' | 'm3' | 'litres' | 'in3' | 'ft3' | 'yd3' | 'gallons_uk';

/** Supported temperature units. */
export type TemperatureUnit = 'C' | 'F';

/** Supported density materials. */
export type DensityMaterial = 'concrete' | 'hardcore' | 'sand' | 'sharp_sand' | 'plastering_sand' | 'gravel' | 'gravel_10mm' | 'gravel_20mm' | 'ballast' | 'ballast_20mm';

/** Supported conversion families for {@link convertUnits} and {@link convert}. */
export type ConversionFamily = 'length' | 'area' | 'volume' | 'weight' | 'temperature';

// ---------------------------------------------------------------------------
// Conversion factor tables — each value converts 1 of that unit TO the base unit
// ---------------------------------------------------------------------------

/** Factor to convert 1 unit → metres. */
const lengthToMetres: Record<LengthUnit, number> = {
    mm: 0.001,
    cm: 0.01,
    m: 1,
    km: 1000,
    in: 0.0254,
    ft: 0.3048,
    yd: 0.9144,
    miles: 1609.34,
};

/** Factor to convert 1 unit → square metres. */
const areaToM2: Record<AreaUnit, number> = {
    mm2: 1e-6,
    cm2: 1e-4,
    m2: 1,
    hectare: 10_000,
    in2: 0.00064516,
    ft2: 0.09290304,
    yd2: 0.83612736,
};

/** Factor to convert 1 unit → kilograms. */
const weightToKg: Record<WeightUnit, number> = {
    g: 0.001,
    kg: 1,
    oz: 0.0283495231,
    lb: 0.45359237,
    tonnes: 1000,
    stones: 6.35029318,
    cwt: 50.80234544,     // UK hundredweight (112 lb) — BS 350-1:1974
};

/** Factor to convert 1 unit → cubic metres. */
const volumeToM3: Record<VolumeUnit, number> = {
    cm3: 1e-6,
    m3: 1,
    litres: 0.001,
    in3: 0.000016387064,
    ft3: 0.0283168,
    yd3: 0.764555,
    gallons_uk: 0.00454609,
};

// ---------------------------------------------------------------------------
// Density constants (tonnes per m³)
// ---------------------------------------------------------------------------

/** Density of common building materials in tonnes per cubic metre. */
export const DENSITY: Record<DensityMaterial, number> = {
    concrete: 2.4,          // BS EN 206:2013+A2:2021
    hardcore: 2.1,          // Highways England SHW Series 800
    sand: 1.6,              // BS EN 13139:2002 (soft building sand)
    sharp_sand: 1.7,        // BS EN 12620:2002+A1:2008
    plastering_sand: 1.5,   // BS EN 13139:2002
    gravel: 1.8,            // BS EN 12620:2002+A1:2008
    gravel_10mm: 1.8,       // BS EN 12620:2002+A1:2008
    gravel_20mm: 1.8,       // BS EN 12620:2002+A1:2008
    ballast: 1.8,           // BS EN 12620:2002+A1:2008
    ballast_20mm: 1.8,      // BS EN 12620:2002+A1:2008
};

/** Alias for {@link DENSITY} — preferred name for new code. */
export const DENSITIES: Record<DensityMaterial, number> = DENSITY;

// ---------------------------------------------------------------------------
// CONVERSION_FACTORS — public export of base-unit factor tables
// ---------------------------------------------------------------------------

/**
 * Conversion factor tables for each family, keyed by unit identifier.
 * Each factor converts 1 of that unit to the family's base unit:
 * - `length.*` → metres
 * - `area.*`   → square metres
 * - `volume.*` → cubic metres
 * - `weight.*` → kilograms
 *
 * @example
 * CONVERSION_FACTORS.length.ft  // 0.3048 (1 ft = 0.3048 m)
 * CONVERSION_FACTORS.area.hectare  // 10000 (1 ha = 10000 m²)
 */
export const CONVERSION_FACTORS = {
    length: lengthToMetres,
    area: areaToM2,
    volume: volumeToM3,
    weight: weightToKg,
} as const;

// ---------------------------------------------------------------------------
// Unit option lists for UI dropdowns
// ---------------------------------------------------------------------------

/** Pre-built arrays of { value, label } for each conversion category. */
export const UNITS = {
    length: [
        { value: 'mm',    label: 'Millimetres (mm)' },
        { value: 'cm',    label: 'Centimetres (cm)' },
        { value: 'm',     label: 'Metres (m)' },
        { value: 'km',    label: 'Kilometres (km)' },
        { value: 'in',    label: 'Inches (in)' },
        { value: 'ft',    label: 'Feet (ft)' },
        { value: 'yd',    label: 'Yards (yd)' },
        { value: 'miles', label: 'Miles (mi)' },
    ],
    area: [
        { value: 'mm2',     label: 'mm²' },
        { value: 'cm2',     label: 'cm²' },
        { value: 'm2',      label: 'm²' },
        { value: 'hectare', label: 'Hectares (ha)' },
        { value: 'in2',     label: 'in²' },
        { value: 'ft2',     label: 'ft²' },
        { value: 'yd2',     label: 'yd²' },
    ],
    volume: [
        { value: 'cm3',        label: 'Cubic centimetres (cm³)' },
        { value: 'm3',         label: 'Cubic metres (m³)' },
        { value: 'litres',     label: 'Litres (L)' },
        { value: 'in3',        label: 'Cubic inches (in³)' },
        { value: 'ft3',        label: 'Cubic feet (ft³)' },
        { value: 'yd3',        label: 'Cubic yards (yd³)' },
        { value: 'gallons_uk', label: 'UK Gallons' },
    ],
    weight: [
        { value: 'g',      label: 'Grams (g)' },
        { value: 'kg',     label: 'Kilograms (kg)' },
        { value: 'oz',     label: 'Ounces (oz)' },
        { value: 'lb',     label: 'Pounds (lb)' },
        { value: 'stones', label: 'Stones (st)' },
        { value: 'cwt',    label: 'Hundredweight (cwt)' },
        { value: 'tonnes', label: 'Tonnes (t)' },
    ],
    temperature: [
        { value: 'C', label: 'Celsius (°C)' },
        { value: 'F', label: 'Fahrenheit (°F)' },
    ],
} as const;

// ---------------------------------------------------------------------------
// Per-family typed conversion functions
// ---------------------------------------------------------------------------

/**
 * Convert a length value between two units.
 */
export function convertLength(value: number, from: LengthUnit, to: LengthUnit): number {
    if (from === to) return value;
    const metres = value * lengthToMetres[from];
    return metres / lengthToMetres[to];
}

/**
 * Convert an area value between two units.
 */
export function convertArea(value: number, from: AreaUnit, to: AreaUnit): number {
    if (from === to) return value;
    const m2 = value * areaToM2[from];
    return m2 / areaToM2[to];
}

/**
 * Convert a weight value between two units.
 */
export function convertWeight(value: number, from: WeightUnit, to: WeightUnit): number {
    if (from === to) return value;
    const kg = value * weightToKg[from];
    return kg / weightToKg[to];
}

/**
 * Convert a volume value between two units.
 */
export function convertVolume(value: number, from: VolumeUnit, to: VolumeUnit): number {
    if (from === to) return value;
    const m3 = value * volumeToM3[from];
    return m3 / volumeToM3[to];
}

/**
 * Convert a temperature value between Celsius and Fahrenheit.
 */
export function convertTemperature(value: number, from: TemperatureUnit, to: TemperatureUnit): number {
    if (from === to) return value;
    if (from === 'C') return (value * 9 / 5) + 32;
    return (value - 32) * 5 / 9;
}

/**
 * Convert a volume of material to weight in tonnes using density constants.
 *
 * @param volumeM3 - Volume in cubic metres.
 * @param material - Material type (e.g. 'concrete', 'sand').
 * @returns Weight in tonnes.
 */
export function convertDensityToWeight(volumeM3: number, material: DensityMaterial): number {
    return volumeM3 * DENSITY[material];
}

// ---------------------------------------------------------------------------
// Generic dispatch helper
// ---------------------------------------------------------------------------

/**
 * Convert a value between two units of the same family.
 *
 * Convenience wrapper that dispatches to the appropriate typed conversion
 * function so UI components do not need to switch on family themselves.
 * Unit string values must match those found in {@link UNITS}.
 *
 * @throws If the family is not recognised.
 *
 * @example
 * convertUnits('length', 'm', 'ft', 1.8) // → 5.905...
 * convertUnits('temperature', 'C', 'F', 100) // → 212
 */
export function convertUnits(family: ConversionFamily, fromUnit: string, toUnit: string, value: number): number {
    switch (family) {
        case 'length':
            return convertLength(value, fromUnit as LengthUnit, toUnit as LengthUnit);
        case 'area':
            return convertArea(value, fromUnit as AreaUnit, toUnit as AreaUnit);
        case 'volume':
            return convertVolume(value, fromUnit as VolumeUnit, toUnit as VolumeUnit);
        case 'weight':
            return convertWeight(value, fromUnit as WeightUnit, toUnit as WeightUnit);
        case 'temperature':
            return convertTemperature(value, fromUnit as TemperatureUnit, toUnit as TemperatureUnit);
        /* c8 ignore next */
        default:
            throw new Error(`Unknown conversion family: ${family}`);
    }
}

/**
 * Return the unit option list for a given conversion family.
 *
 * Convenience helper that maps a family name to the corresponding
 * `{ value, label }[]` array in {@link UNITS}.
 *
 * @throws If the family is not one of the five supported families.
 *
 * @example
 * getUnitsForFamily('length')
 * // → [{ value: 'mm', label: 'Millimetres (mm)' }, ...]
 */
export function getUnitsForFamily(family: ConversionFamily): readonly { value: string; label: string }[] {
    if (!(family in UNITS)) {
        throw new Error(`Unknown conversion family: "${family}". Supported: ${Object.keys(UNITS).join(', ')}.`);
    }
    return UNITS[family as keyof typeof UNITS];
}

// ---------------------------------------------------------------------------
// Unified convert() API
// ---------------------------------------------------------------------------

/** Input for the unified {@link convert} function. */
export interface ConversionInput {
    value: number;
    fromUnit: string;
    toUnit: string;
}

/** Result from the unified {@link convert} function. */
export interface ConversionResult {
    /** The converted value. */
    result: number;
    fromUnit: string;
    toUnit: string;
    /** Human-readable formula string, e.g. `"1 m = 1000 mm"`. */
    formula: string;
}

// Set of unit identifiers for each family — used for auto-detection in convert().
// Built once at module load from the factor tables; stays in sync automatically.
const LENGTH_UNIT_SET  = new Set(Object.keys(lengthToMetres));
const AREA_UNIT_SET    = new Set(Object.keys(areaToM2));
const VOLUME_UNIT_SET  = new Set(Object.keys(volumeToM3));
const WEIGHT_UNIT_SET  = new Set(Object.keys(weightToKg));
const TEMP_UNIT_SET    = new Set<string>(['C', 'F']);

function detectFamily(unit: string): ConversionFamily {
    if (LENGTH_UNIT_SET.has(unit))  return 'length';
    if (AREA_UNIT_SET.has(unit))    return 'area';
    if (VOLUME_UNIT_SET.has(unit))  return 'volume';
    if (WEIGHT_UNIT_SET.has(unit))  return 'weight';
    if (TEMP_UNIT_SET.has(unit))    return 'temperature';
    throw new Error(`Unknown unit: "${unit}". Check UNITS for supported identifiers.`);
}

/**
 * Convert a value between any two supported units using a single unified API.
 *
 * The conversion family (length, area, volume, weight, temperature) is
 * auto-detected from `fromUnit`, so callers do not need to specify it.
 * Both `fromUnit` and `toUnit` must belong to the **same** family.
 *
 * Internally uses the base-unit pattern: `fromUnit → base → toUnit`.
 *
 * @throws If either unit is unknown or the units belong to different families.
 *
 * @example
 * convert({ value: 1, fromUnit: 'm', toUnit: 'mm' })
 * // → { result: 1000, fromUnit: 'm', toUnit: 'mm', formula: '1 m = 1000 mm' }
 *
 * convert({ value: 100, fromUnit: 'C', toUnit: 'F' })
 * // → { result: 212, fromUnit: 'C', toUnit: 'F', formula: '100 C = 212 F' }
 */
export function convert(input: ConversionInput): ConversionResult {
    const { value, fromUnit, toUnit } = input;

    const family = detectFamily(fromUnit);

    // Validate toUnit belongs to the same family
    detectFamily(toUnit);

    const result = convertUnits(family, fromUnit, toUnit, value);

    // Format result cleanly: strip unnecessary trailing zeros after rounding
    const resultDisplay = Number.isInteger(result) ? result.toString() : parseFloat(result.toPrecision(7)).toString();
    const formula = `${value} ${fromUnit} = ${resultDisplay} ${toUnit}`;

    return { result, fromUnit, toUnit, formula };
}
