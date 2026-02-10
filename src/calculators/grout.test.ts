import { describe, it, expect } from 'vitest';
import { calculateGrout } from './grout';
import type { GroutInput } from './types';

describe('calculateGrout', () => {
  it('calculates grout for standard 300x300mm tiles', () => {
    const input: GroutInput = {
      area: 10,
      tileWidth: 300,
      tileHeight: 300,
      jointWidth: 3,
      tileDepth: 8,
      wastage: 10,
      bagSize: 5,
    };
    const result = calculateGrout(input);

    // Formula: ((300+300)/(300*300)) * 3 * 8 * 1.6 = 0.2560 kg/m²
    // 10m² * 0.256 * 1.1 = 2.816 kg, ceil(2.816/5) = 1 bag
    expect(result.kgNeeded).toBeCloseTo(2.816, 1);
    expect(result.bagsNeeded).toBe(1);
  });

  it('calculates grout for large tiles with wide joints', () => {
    const input: GroutInput = {
      area: 20,
      tileWidth: 600,
      tileHeight: 600,
      jointWidth: 5,
      tileDepth: 10,
      wastage: 10,
      bagSize: 5,
    };
    const result = calculateGrout(input);

    // ((600+600)/(600*600)) * 5 * 10 * 1.6 = 0.2667 kg/m²
    // 20m² * 0.2667 * 1.1 = 5.867 kg, ceil(5.867/5) = 2 bags
    expect(result.kgNeeded).toBeCloseTo(5.867, 1);
    expect(result.bagsNeeded).toBe(2);
  });

  it('calculates grout for small mosaic tiles', () => {
    const input: GroutInput = {
      area: 5,
      tileWidth: 50,
      tileHeight: 50,
      jointWidth: 2,
      tileDepth: 4,
      wastage: 10,
      bagSize: 5,
    };
    const result = calculateGrout(input);

    // ((50+50)/(50*50)) * 2 * 4 * 1.6 = 0.512 kg/m²
    // 5m² * 0.512 * 1.1 = 2.816 kg, ceil(2.816/5) = 1 bag
    expect(result.kgNeeded).toBeCloseTo(2.816, 1);
    expect(result.bagsNeeded).toBe(1);
  });

  it('handles non-square tiles', () => {
    const input: GroutInput = {
      area: 10,
      tileWidth: 600,
      tileHeight: 300,
      jointWidth: 3,
      tileDepth: 8,
      wastage: 0,
      bagSize: 5,
    };
    const result = calculateGrout(input);

    // ((600+300)/(600*300)) * 3 * 8 * 1.6 = 0.192 kg/m²
    // 10m² * 0.192 * 1.0 = 1.92 kg, ceil(1.92/5) = 1 bag
    expect(result.kgNeeded).toBeCloseTo(1.92, 1);
    expect(result.bagsNeeded).toBe(1);
  });

  it('throws for zero area', () => {
    const input: GroutInput = {
      area: 0,
      tileWidth: 300,
      tileHeight: 300,
      jointWidth: 3,
      tileDepth: 8,
      wastage: 10,
      bagSize: 5,
    };

    expect(() => calculateGrout(input)).toThrow();
  });

  it('throws for zero tile dimensions', () => {
    const input: GroutInput = {
      area: 10,
      tileWidth: 0,
      tileHeight: 300,
      jointWidth: 3,
      tileDepth: 8,
      wastage: 10,
      bagSize: 5,
    };

    expect(() => calculateGrout(input)).toThrow();
  });
});
