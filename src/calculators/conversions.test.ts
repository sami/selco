import { describe, it, expect } from 'vitest';
import {
  convertLength,
  convertArea,
  convertWeight,
  convertVolume,
  convertTemperature,
  convertDensityToWeight,
  DENSITY,
  UNITS,
  type LengthUnit,
  type AreaUnit,
  type WeightUnit,
  type VolumeUnit,
  type TemperatureUnit,
  type DensityMaterial,
} from './conversions';

// ---------------------------------------------------------------------------
// Length (existing)
// ---------------------------------------------------------------------------

describe('convertLength', () => {
  it('converts metres to feet', () => {
    expect(convertLength(1, 'm', 'ft')).toBeCloseTo(3.28084, 3);
  });

  it('converts feet to metres', () => {
    expect(convertLength(10, 'ft', 'm')).toBeCloseTo(3.048, 3);
  });

  it('converts millimetres to inches', () => {
    expect(convertLength(25.4, 'mm', 'in')).toBeCloseTo(1, 3);
  });

  it('converts inches to millimetres', () => {
    expect(convertLength(1, 'in', 'mm')).toBeCloseTo(25.4, 3);
  });

  it('converts metres to centimetres', () => {
    expect(convertLength(1, 'm', 'cm')).toBeCloseTo(100, 3);
  });

  it('converts centimetres to metres', () => {
    expect(convertLength(250, 'cm', 'm')).toBeCloseTo(2.5, 3);
  });

  it('converts feet to inches', () => {
    expect(convertLength(1, 'ft', 'in')).toBeCloseTo(12, 3);
  });

  it('converts yards to metres', () => {
    expect(convertLength(1, 'yd', 'm')).toBeCloseTo(0.9144, 3);
  });

  it('returns same value for same unit', () => {
    expect(convertLength(5, 'm', 'm')).toBe(5);
  });

  it('handles zero', () => {
    expect(convertLength(0, 'm', 'ft')).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Area (existing)
// ---------------------------------------------------------------------------

describe('convertArea', () => {
  it('converts square metres to square feet', () => {
    expect(convertArea(1, 'm2', 'ft2')).toBeCloseTo(10.7639, 2);
  });

  it('converts square feet to square metres', () => {
    expect(convertArea(100, 'ft2', 'm2')).toBeCloseTo(9.2903, 2);
  });

  it('converts square metres to square yards', () => {
    expect(convertArea(1, 'm2', 'yd2')).toBeCloseTo(1.19599, 2);
  });

  it('returns same value for same unit', () => {
    expect(convertArea(5, 'm2', 'm2')).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// Weight (existing + tonnes)
// ---------------------------------------------------------------------------

describe('convertWeight', () => {
  it('converts kilograms to pounds', () => {
    expect(convertWeight(1, 'kg', 'lb')).toBeCloseTo(2.20462, 3);
  });

  it('converts pounds to kilograms', () => {
    expect(convertWeight(10, 'lb', 'kg')).toBeCloseTo(4.53592, 3);
  });

  it('converts grams to ounces', () => {
    expect(convertWeight(100, 'g', 'oz')).toBeCloseTo(3.52739, 3);
  });

  it('converts kilograms to grams', () => {
    expect(convertWeight(1, 'kg', 'g')).toBeCloseTo(1000, 3);
  });

  it('returns same value for same unit', () => {
    expect(convertWeight(5, 'kg', 'kg')).toBe(5);
  });

  it('converts tonnes to kilograms', () => {
    expect(convertWeight(1, 'tonnes', 'kg')).toBeCloseTo(1000, 3);
  });

  it('converts kilograms to tonnes', () => {
    expect(convertWeight(500, 'kg', 'tonnes')).toBeCloseTo(0.5, 3);
  });
  it('converts stones to kilograms', () => {
    expect(convertWeight(1, 'stones', 'kg')).toBeCloseTo(6.35, 2);
  });
});

// ---------------------------------------------------------------------------
// Volume (new)
// ---------------------------------------------------------------------------

describe('convertVolume', () => {
  it('converts cubic metres to litres', () => {
    expect(convertVolume(1, 'm3', 'litres')).toBeCloseTo(1000, 1);
  });

  it('converts cubic metres to cubic feet', () => {
    expect(convertVolume(1, 'm3', 'ft3')).toBeCloseTo(35.3147, 2);
  });

  it('converts litres to UK gallons', () => {
    expect(convertVolume(10, 'litres', 'gallons_uk')).toBeCloseTo(2.1997, 2);
  });

  it('converts cubic feet to cubic metres', () => {
    expect(convertVolume(1, 'ft3', 'm3')).toBeCloseTo(0.02832, 3);
  });

  it('converts cubic metres to cubic yards', () => {
    // 1 m³ = 1.30795 yd³
    expect(convertVolume(1, 'm3', 'yd3')).toBeCloseTo(1.30795, 2);
  });

  it('returns same value for same unit', () => {
    expect(convertVolume(5, 'm3', 'm3')).toBe(5);
  });

  it('handles zero', () => {
    expect(convertVolume(0, 'litres', 'gallons_uk')).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Temperature (new)
// ---------------------------------------------------------------------------

describe('convertTemperature', () => {
  it('converts 0 Celsius to 32 Fahrenheit', () => {
    expect(convertTemperature(0, 'C', 'F')).toBeCloseTo(32, 3);
  });

  it('converts 100 Celsius to 212 Fahrenheit', () => {
    expect(convertTemperature(100, 'C', 'F')).toBeCloseTo(212, 3);
  });

  it('converts 32 Fahrenheit to 0 Celsius', () => {
    expect(convertTemperature(32, 'F', 'C')).toBeCloseTo(0, 3);
  });

  it('converts 72 Fahrenheit to Celsius', () => {
    expect(convertTemperature(72, 'F', 'C')).toBeCloseTo(22.222, 2);
  });

  it('returns same value for same unit', () => {
    expect(convertTemperature(20, 'C', 'C')).toBe(20);
  });

  it('handles negative temperatures', () => {
    expect(convertTemperature(-40, 'C', 'F')).toBeCloseTo(-40, 3);
  });
});

// ---------------------------------------------------------------------------
// Density (new)
// ---------------------------------------------------------------------------

describe('DENSITY', () => {
  it('exports density constants for common materials', () => {
    expect(DENSITY.concrete).toBe(2.4);
    expect(DENSITY.hardcore).toBe(2.1);
    expect(DENSITY.sand).toBe(1.6);
    expect(DENSITY.gravel).toBe(1.8);
    expect(DENSITY.ballast).toBe(1.8);
  });
});

describe('convertDensityToWeight', () => {
  it('converts 3 m\u00B3 of concrete to tonnes', () => {
    expect(convertDensityToWeight(3, 'concrete')).toBeCloseTo(7.2, 3);
  });

  it('converts 5 m\u00B3 of sand to tonnes', () => {
    expect(convertDensityToWeight(5, 'sand')).toBeCloseTo(8.0, 3);
  });

  it('converts 1 m\u00B3 of hardcore to tonnes', () => {
    expect(convertDensityToWeight(1, 'hardcore')).toBeCloseTo(2.1, 3);
  });

  it('converts 2 m\u00B3 of gravel to tonnes', () => {
    expect(convertDensityToWeight(2, 'gravel')).toBeCloseTo(3.6, 3);
  });

  it('handles zero volume', () => {
    expect(convertDensityToWeight(0, 'concrete')).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// UNITS export (new)
// ---------------------------------------------------------------------------

describe('UNITS', () => {
  it('exports unit lists for all categories', () => {
    expect(UNITS.length).toBeInstanceOf(Array);
    expect(UNITS.length.length).toBeGreaterThanOrEqual(6);

    expect(UNITS.area).toBeInstanceOf(Array);
    expect(UNITS.area.length).toBeGreaterThanOrEqual(5);

    expect(UNITS.volume).toBeInstanceOf(Array);
    expect(UNITS.volume.length).toBeGreaterThanOrEqual(5);

    expect(UNITS.weight).toBeInstanceOf(Array);
    expect(UNITS.weight.length).toBeGreaterThanOrEqual(6);

    expect(UNITS.temperature).toBeInstanceOf(Array);
    expect(UNITS.temperature.length).toBeGreaterThanOrEqual(2);
  });

  it('each unit entry has value and label', () => {
    for (const unit of UNITS.length) {
      expect(unit).toHaveProperty('value');
      expect(unit).toHaveProperty('label');
    }
  });
});
