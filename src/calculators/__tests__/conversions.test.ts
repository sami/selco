import { describe, it, expect } from 'vitest';
import {
    convert,
    convertLength,
    convertArea,
    convertWeight,
    convertVolume,
    convertTemperature,
    convertDensityToWeight,
    convertUnits,
    getUnitsForFamily,
    CONVERSION_FACTORS,
    DENSITIES,
    DENSITY,
    UNITS,
    type ConversionInput,
    type ConversionFamily,
} from '../conversions';

// ---------------------------------------------------------------------------
// convert() — unified API (new)
// Tests use ConversionInput { value, fromUnit, toUnit } → ConversionResult { result, fromUnit, toUnit, formula }
// ---------------------------------------------------------------------------

describe('convert() — LENGTH family', () => {

    it('TC-L1: 1 m → mm = 1000', () => {
        const r = convert({ value: 1, fromUnit: 'm', toUnit: 'mm' });
        expect(r.result).toBe(1000);
        expect(r.fromUnit).toBe('m');
        expect(r.toUnit).toBe('mm');
        expect(r.formula).toMatch(/1000/);
    });

    it('TC-L2: 1 ft → mm = 304.8', () => {
        const r = convert({ value: 1, fromUnit: 'ft', toUnit: 'mm' });
        expect(r.result).toBeCloseTo(304.8, 2);
    });

    it('TC-L3: 1 yd → m = 0.9144', () => {
        const r = convert({ value: 1, fromUnit: 'yd', toUnit: 'm' });
        expect(r.result).toBeCloseTo(0.9144, 4);
    });

    it('TC-L4: 1 km → m = 1000', () => {
        const r = convert({ value: 1, fromUnit: 'km', toUnit: 'm' });
        expect(r.result).toBe(1000);
    });

    it('TC-L5: same unit — 5 ft → ft = 5', () => {
        const r = convert({ value: 5, fromUnit: 'ft', toUnit: 'ft' });
        expect(r.result).toBe(5);
    });

    it('TC-L6: 1 m → ft ≈ 3.28084', () => {
        const r = convert({ value: 1, fromUnit: 'm', toUnit: 'ft' });
        expect(r.result).toBeCloseTo(3.28084, 3);
    });
});

describe('convert() — AREA family', () => {

    it('TC-A1: 1 m² → mm² = 1,000,000', () => {
        const r = convert({ value: 1, fromUnit: 'm2', toUnit: 'mm2' });
        expect(r.result).toBeCloseTo(1_000_000, 0);
    });

    it('TC-A2: 1 m² → ft² ≈ 10.7639', () => {
        const r = convert({ value: 1, fromUnit: 'm2', toUnit: 'ft2' });
        expect(r.result).toBeCloseTo(10.7639, 2);
    });

    it('TC-A3: 1 hectare → m² = 10,000', () => {
        const r = convert({ value: 1, fromUnit: 'hectare', toUnit: 'm2' });
        expect(r.result).toBeCloseTo(10_000, 0);
    });

    it('TC-A4: 1 ft² → m² ≈ 0.09290', () => {
        const r = convert({ value: 1, fromUnit: 'ft2', toUnit: 'm2' });
        expect(r.result).toBeCloseTo(0.09290, 4);
    });

    it('TC-A5: 1 yd² → m² ≈ 0.8361', () => {
        const r = convert({ value: 1, fromUnit: 'yd2', toUnit: 'm2' });
        expect(r.result).toBeCloseTo(0.8361, 3);
    });
});

describe('convert() — VOLUME family', () => {

    it('TC-V1: 1 m³ → litres = 1000', () => {
        const r = convert({ value: 1, fromUnit: 'm3', toUnit: 'litres' });
        expect(r.result).toBeCloseTo(1000, 1);
    });

    it('TC-V2: 1 m³ → ft³ ≈ 35.3147', () => {
        const r = convert({ value: 1, fromUnit: 'm3', toUnit: 'ft3' });
        expect(r.result).toBeCloseTo(35.3147, 2);
    });

    it('TC-V3: 1 litre → cm³ = 1000', () => {
        const r = convert({ value: 1, fromUnit: 'litres', toUnit: 'cm3' });
        expect(r.result).toBeCloseTo(1000, 1);
    });

    it('TC-V4: 1 ft³ → m³ ≈ 0.028317', () => {
        const r = convert({ value: 1, fromUnit: 'ft3', toUnit: 'm3' });
        expect(r.result).toBeCloseTo(0.028317, 4);
    });
});

describe('convert() — WEIGHT family', () => {

    it('TC-W1: 1 kg → lb ≈ 2.20462', () => {
        const r = convert({ value: 1, fromUnit: 'kg', toUnit: 'lb' });
        expect(r.result).toBeCloseTo(2.20462, 3);
    });

    it('TC-W2: 1 tonne → kg = 1000 (tonnes identifier)', () => {
        const r = convert({ value: 1, fromUnit: 'tonnes', toUnit: 'kg' });
        expect(r.result).toBeCloseTo(1000, 1);
    });

    it('TC-W3: 1 cwt → kg ≈ 50.802 (new unit — UK hundredweight)', () => {
        // 1 cwt (UK) = 112 lb = 50.80234544 kg
        const r = convert({ value: 1, fromUnit: 'cwt', toUnit: 'kg' });
        expect(r.result).toBeCloseTo(50.802, 2);
    });

    it('TC-W4: 1 stone → kg ≈ 6.350 (stones identifier)', () => {
        const r = convert({ value: 1, fromUnit: 'stones', toUnit: 'kg' });
        expect(r.result).toBeCloseTo(6.350, 2);
    });

    it('TC-W5: 1 lb → g ≈ 453.59', () => {
        const r = convert({ value: 1, fromUnit: 'lb', toUnit: 'g' });
        expect(r.result).toBeCloseTo(453.59, 1);
    });
});

describe('convert() — TEMPERATURE family', () => {

    it('TC-T1: 0°C → °F = 32', () => {
        const r = convert({ value: 0, fromUnit: 'C', toUnit: 'F' });
        expect(r.result).toBeCloseTo(32, 3);
    });

    it('TC-T2: 100°C → °F = 212', () => {
        const r = convert({ value: 100, fromUnit: 'C', toUnit: 'F' });
        expect(r.result).toBeCloseTo(212, 3);
    });

    it('TC-T3: 32°F → °C = 0', () => {
        const r = convert({ value: 32, fromUnit: 'F', toUnit: 'C' });
        expect(r.result).toBeCloseTo(0, 3);
    });

    it('TC-T4: −40°C → °F = −40 (cross-check)', () => {
        const r = convert({ value: -40, fromUnit: 'C', toUnit: 'F' });
        expect(r.result).toBeCloseTo(-40, 3);
    });
});

describe('convert() — result shape', () => {

    it('returns fromUnit, toUnit, formula and result', () => {
        const r = convert({ value: 1, fromUnit: 'm', toUnit: 'ft' });
        expect(r).toHaveProperty('result');
        expect(r).toHaveProperty('fromUnit', 'm');
        expect(r).toHaveProperty('toUnit', 'ft');
        expect(r).toHaveProperty('formula');
        expect(typeof r.formula).toBe('string');
        expect(r.formula.length).toBeGreaterThan(0);
    });

    it('formula contains the converted result value', () => {
        const r = convert({ value: 1, fromUnit: 'm', toUnit: 'mm' });
        expect(r.formula).toMatch(/1000/);
    });

    it('throws for unknown fromUnit', () => {
        expect(() => convert({ value: 1, fromUnit: 'furlongs', toUnit: 'm' })).toThrow();
    });

    it('handles zero value', () => {
        const r = convert({ value: 0, fromUnit: 'm', toUnit: 'ft' });
        expect(r.result).toBe(0);
    });
});

// ---------------------------------------------------------------------------
// New units accessible via existing typed functions
// ---------------------------------------------------------------------------

describe('convertArea() — hectare (new unit)', () => {
    it('1 hectare → m² = 10,000', () => {
        expect(convertArea(1, 'hectare', 'm2')).toBeCloseTo(10_000, 0);
    });

    it('10,000 m² → 1 hectare', () => {
        expect(convertArea(10_000, 'm2', 'hectare')).toBeCloseTo(1, 6);
    });
});

describe('convertWeight() — cwt (new unit)', () => {
    it('1 cwt → kg ≈ 50.802', () => {
        expect(convertWeight(1, 'cwt', 'kg')).toBeCloseTo(50.802, 2);
    });

    it('50.80234544 kg → 1 cwt', () => {
        expect(convertWeight(50.80234544, 'kg', 'cwt')).toBeCloseTo(1, 6);
    });
});

// ---------------------------------------------------------------------------
// CONVERSION_FACTORS export (new)
// ---------------------------------------------------------------------------

describe('CONVERSION_FACTORS', () => {
    it('exports factor table for length family', () => {
        expect(CONVERSION_FACTORS).toHaveProperty('length');
        expect(CONVERSION_FACTORS.length).toHaveProperty('m', 1);
        expect(CONVERSION_FACTORS.length).toHaveProperty('mm', 0.001);
        expect(CONVERSION_FACTORS.length).toHaveProperty('ft');
    });

    it('exports factor table for area family', () => {
        expect(CONVERSION_FACTORS).toHaveProperty('area');
        expect(CONVERSION_FACTORS.area).toHaveProperty('m2', 1);
        expect(CONVERSION_FACTORS.area).toHaveProperty('hectare', 10_000);
    });

    it('exports factor table for weight family with cwt', () => {
        expect(CONVERSION_FACTORS).toHaveProperty('weight');
        expect(CONVERSION_FACTORS.weight).toHaveProperty('cwt');
    });
});

// ---------------------------------------------------------------------------
// getUnitsForFamily() helper (new)
// ---------------------------------------------------------------------------

describe('getUnitsForFamily()', () => {
    it('returns unit list for length', () => {
        const units = getUnitsForFamily('length');
        expect(Array.isArray(units)).toBe(true);
        expect(units.length).toBeGreaterThanOrEqual(6);
        expect(units[0]).toHaveProperty('value');
        expect(units[0]).toHaveProperty('label');
    });

    it('returns unit list for area including hectare', () => {
        const units = getUnitsForFamily('area');
        const values = units.map(u => u.value);
        expect(values).toContain('hectare');
    });

    it('returns unit list for weight including cwt', () => {
        const units = getUnitsForFamily('weight');
        const values = units.map(u => u.value);
        expect(values).toContain('cwt');
    });

    it('returns unit list for temperature', () => {
        const units = getUnitsForFamily('temperature');
        expect(units.length).toBeGreaterThanOrEqual(2);
    });

    it('throws for unknown family', () => {
        expect(() => getUnitsForFamily('density' as ConversionFamily)).toThrow();
    });
});

// ---------------------------------------------------------------------------
// DENSITIES export (new — alias of DENSITY for consistent naming)
// ---------------------------------------------------------------------------

describe('DENSITIES', () => {
    it('exports same values as DENSITY', () => {
        expect(DENSITIES).toBe(DENSITY);
    });

    it('concrete density is 2.4 t/m³', () => {
        expect(DENSITIES.concrete).toBe(2.4);
    });

    it('sand density is 1.6 t/m³', () => {
        expect(DENSITIES.sand).toBe(1.6);
    });
});

// ---------------------------------------------------------------------------
// DENSITY + convertDensityToWeight — retained coverage
// ---------------------------------------------------------------------------

describe('convertDensityToWeight — density helpers', () => {
    it('2 m³ concrete → 4.8 tonnes', () => {
        expect(convertDensityToWeight(2, 'concrete')).toBeCloseTo(4.8, 3);
    });

    it('5 m³ sand → 8.0 tonnes', () => {
        expect(convertDensityToWeight(5, 'sand')).toBeCloseTo(8.0, 3);
    });

    it('1 m³ hardcore → 2.1 tonnes', () => {
        expect(convertDensityToWeight(1, 'hardcore')).toBeCloseTo(2.1, 3);
    });

    it('handles zero volume', () => {
        expect(convertDensityToWeight(0, 'concrete')).toBe(0);
    });
});

// ---------------------------------------------------------------------------
// Same-unit identity — branch coverage for `if (from === to) return value`
// guards in convertArea, convertWeight, convertVolume, convertTemperature
// ---------------------------------------------------------------------------

describe('convert() — same-unit identity (branch guards)', () => {

    it('area: m2 → m2 returns input unchanged', () => {
        const r = convert({ value: 5, fromUnit: 'm2', toUnit: 'm2' });
        expect(r.result).toBe(5);
    });

    it('weight: kg → kg returns input unchanged', () => {
        const r = convert({ value: 3.5, fromUnit: 'kg', toUnit: 'kg' });
        expect(r.result).toBe(3.5);
    });

    it('volume: litres → litres returns input unchanged', () => {
        const r = convert({ value: 10, fromUnit: 'litres', toUnit: 'litres' });
        expect(r.result).toBe(10);
    });

    it('temperature: C → C returns input unchanged', () => {
        const r = convert({ value: 100, fromUnit: 'C', toUnit: 'C' });
        expect(r.result).toBe(100);
    });

    it('temperature: F → C converts 212°F to 100°C', () => {
        const r = convert({ value: 212, fromUnit: 'F', toUnit: 'C' });
        expect(r.result).toBeCloseTo(100, 3);
    });
});
