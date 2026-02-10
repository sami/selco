import { describe, it, expect } from 'vitest';
import { convertLength, convertArea, convertWeight } from './conversions';

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
});
