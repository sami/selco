/** Supported length units. */
export type LengthUnit = 'mm' | 'cm' | 'm' | 'in' | 'ft' | 'yd';

/** Supported area units. */
export type AreaUnit = 'mm2' | 'cm2' | 'm2' | 'ft2' | 'yd2';

/** Supported weight units. */
export type WeightUnit = 'g' | 'kg' | 'oz' | 'lb' | 'tonnes';

/** Supported volume units. */
export type VolumeUnit = 'm3' | 'litres' | 'ft3' | 'yd3' | 'gallons_uk';

/** Supported temperature units. */
export type TemperatureUnit = 'C' | 'F';

/** Supported density materials. */
export type DensityMaterial = 'concrete' | 'hardcore' | 'sand' | 'gravel' | 'ballast';

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
    tonnes: 1000,
};

/** Factor to convert 1 unit → cubic metres. */
const volumeToM3: Record<VolumeUnit, number> = {
    m3: 1,
    litres: 0.001,
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
    gravel: 1.8,
    ballast: 1.8,
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
        { value: 'in', label: 'Inches (in)' },
        { value: 'ft', label: 'Feet (ft)' },
        { value: 'yd', label: 'Yards (yd)' },
    ],
    area: [
        { value: 'mm2', label: 'mm²' },
        { value: 'cm2', label: 'cm²' },
        { value: 'm2', label: 'm²' },
        { value: 'ft2', label: 'ft²' },
        { value: 'yd2', label: 'yd²' },
    ],
    volume: [
        { value: 'm3', label: 'Cubic metres (m³)' },
        { value: 'litres', label: 'Litres (L)' },
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
