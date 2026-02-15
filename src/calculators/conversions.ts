/** Supported length units. */
export type LengthUnit = 'mm' | 'cm' | 'm' | 'km' | 'in' | 'ft' | 'yd' | 'miles';

/** Supported area units. */
export type AreaUnit = 'mm2' | 'cm2' | 'm2' | 'in2' | 'ft2' | 'yd2';

/** Supported weight units. */
export type WeightUnit = 'g' | 'kg' | 'oz' | 'lb' | 'tonnes' | 'stones';

/** Supported volume units. */
export type VolumeUnit = 'cm3' | 'm3' | 'litres' | 'in3' | 'ft3' | 'yd3' | 'gallons_uk';

/** Supported temperature units. */
export type TemperatureUnit = 'C' | 'F';

/** Supported density materials. */
export type DensityMaterial = 'concrete' | 'hardcore' | 'sand' | 'sharp_sand' | 'plastering_sand' | 'gravel' | 'gravel_10mm' | 'gravel_20mm' | 'ballast' | 'ballast_20mm';

// ---------------------------------------------------------------------------
// Conversion factors — each value converts 1 of that unit TO the base unit
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
    concrete: 2.4,
    hardcore: 2.1,
    sand: 1.6,
    sharp_sand: 1.7,
    plastering_sand: 1.5,
    gravel: 1.8,
    gravel_10mm: 1.8,
    gravel_20mm: 1.8,
    ballast: 1.8,
    ballast_20mm: 1.8,
};

// ---------------------------------------------------------------------------
// Unit option lists for UI dropdowns
// ---------------------------------------------------------------------------

/** Pre-built arrays of { value, label } for each conversion category. */
export const UNITS = {
    length: [
        { value: 'mm', label: 'Millimetres (mm)' },
        { value: 'cm', label: 'Centimetres (cm)' },
        { value: 'm', label: 'Metres (m)' },
        { value: 'km', label: 'Kilometres (km)' },
        { value: 'in', label: 'Inches (in)' },
        { value: 'ft', label: 'Feet (ft)' },
        { value: 'yd', label: 'Yards (yd)' },
        { value: 'miles', label: 'Miles (mi)' },
    ],
    area: [
        { value: 'mm2', label: 'mm²' },
        { value: 'cm2', label: 'cm²' },
        { value: 'm2', label: 'm²' },
        { value: 'in2', label: 'in²' },
        { value: 'ft2', label: 'ft²' },
        { value: 'yd2', label: 'yd²' },
    ],
    volume: [
        { value: 'cm3', label: 'Cubic centimetres (cm³)' },
        { value: 'm3', label: 'Cubic metres (m³)' },
        { value: 'litres', label: 'Litres (L)' },
        { value: 'in3', label: 'Cubic inches (in³)' },
        { value: 'ft3', label: 'Cubic feet (ft³)' },
        { value: 'yd3', label: 'Cubic yards (yd³)' },
        { value: 'gallons_uk', label: 'UK Gallons' },
    ],
    weight: [
        { value: 'g', label: 'Grams (g)' },
        { value: 'kg', label: 'Kilograms (kg)' },
        { value: 'oz', label: 'Ounces (oz)' },
        { value: 'lb', label: 'Pounds (lb)' },
        { value: 'tonnes', label: 'Tonnes (t)' },
        { value: 'stones', label: 'Stones (st)' },
    ],
    temperature: [
        { value: 'C', label: 'Celsius (°C)' },
        { value: 'F', label: 'Fahrenheit (°F)' },
    ],
} as const;

// ---------------------------------------------------------------------------
// Public API
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
