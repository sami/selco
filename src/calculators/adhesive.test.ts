import { describe, it, expect } from 'vitest';
import { calculateAdhesive } from './adhesive';
import type { AdhesiveInput } from './types';

describe('calculateAdhesive', () => {
  it('calculates adhesive for small tiles (<=200mm)', () => {
    const input: AdhesiveInput = {
      area: 10,
      tileSize: 150,
      wastage: 10,
      bagSize: 20,
    };
    const result = calculateAdhesive(input);

    // Small tiles: 2.0 kg/m², 10m² * 2.0 * 1.1 = 22 kg, ceil(22/20) = 2 bags
    expect(result.kgNeeded).toBeCloseTo(22);
    expect(result.bagsNeeded).toBe(2);
    expect(result.coverageRate).toBe(2.0);
  });

  it('calculates adhesive for medium tiles (201-400mm)', () => {
    const input: AdhesiveInput = {
      area: 10,
      tileSize: 300,
      wastage: 10,
      bagSize: 20,
    };
    const result = calculateAdhesive(input);

    // Medium tiles: 3.5 kg/m², 10m² * 3.5 * 1.1 = 38.5 kg, ceil(38.5/20) = 2 bags
    expect(result.kgNeeded).toBeCloseTo(38.5);
    expect(result.bagsNeeded).toBe(2);
    expect(result.coverageRate).toBe(3.5);
  });

  it('calculates adhesive for large tiles (401-600mm)', () => {
    const input: AdhesiveInput = {
      area: 15,
      tileSize: 500,
      wastage: 5,
      bagSize: 20,
    };
    const result = calculateAdhesive(input);

    // Large tiles: 5.0 kg/m², 15m² * 5.0 * 1.05 = 78.75 kg, ceil(78.75/20) = 4 bags
    expect(result.kgNeeded).toBeCloseTo(78.75);
    expect(result.bagsNeeded).toBe(4);
    expect(result.coverageRate).toBe(5.0);
  });

  it('calculates adhesive for extra large tiles (>600mm)', () => {
    const input: AdhesiveInput = {
      area: 8,
      tileSize: 900,
      wastage: 10,
      bagSize: 20,
    };
    const result = calculateAdhesive(input);

    // XL tiles: 5.5 kg/m², 8m² * 5.5 * 1.1 = 48.4 kg, ceil(48.4/20) = 3 bags
    expect(result.kgNeeded).toBeCloseTo(48.4);
    expect(result.bagsNeeded).toBe(3);
    expect(result.coverageRate).toBe(5.5);
  });

  it('handles zero wastage', () => {
    const input: AdhesiveInput = {
      area: 10,
      tileSize: 300,
      wastage: 0,
      bagSize: 20,
    };
    const result = calculateAdhesive(input);

    // 10m² * 3.5 * 1.0 = 35 kg, ceil(35/20) = 2 bags
    expect(result.kgNeeded).toBeCloseTo(35);
    expect(result.bagsNeeded).toBe(2);
  });

  it('throws for zero area', () => {
    const input: AdhesiveInput = {
      area: 0,
      tileSize: 300,
      wastage: 10,
      bagSize: 20,
    };

    expect(() => calculateAdhesive(input)).toThrow();
  });

  it('throws for negative tile size', () => {
    const input: AdhesiveInput = {
      area: 10,
      tileSize: -100,
      wastage: 10,
      bagSize: 20,
    };

    expect(() => calculateAdhesive(input)).toThrow();
  });
});
