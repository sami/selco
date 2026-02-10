import { describe, it, expect } from 'vitest';
import { calculateTiles } from './tiles';
import type { TileInput } from './types';

describe('calculateTiles', () => {
  it('calculates correct tile count for a standard room', () => {
    const input: TileInput = {
      areaWidth: 3,
      areaHeight: 2.4,
      tileWidth: 300,
      tileHeight: 300,
      wastage: 10,
    };
    const result = calculateTiles(input);

    // 3 * 2.4 = 7.2 m², tile = 0.09 m², raw = 80, +10% = 88
    expect(result.tilesNeeded).toBe(88);
    expect(result.coverageArea).toBeCloseTo(7.2);
    expect(result.wastageAmount).toBe(8);
  });

  it('calculates with zero wastage', () => {
    const input: TileInput = {
      areaWidth: 1,
      areaHeight: 1,
      tileWidth: 500,
      tileHeight: 500,
      wastage: 0,
    };
    const result = calculateTiles(input);

    // 1 m², tile = 0.25 m², raw = 4, +0% = 4
    expect(result.tilesNeeded).toBe(4);
    expect(result.coverageArea).toBeCloseTo(1);
    expect(result.wastageAmount).toBe(0);
  });

  it('rounds up to whole tiles', () => {
    const input: TileInput = {
      areaWidth: 1,
      areaHeight: 1,
      tileWidth: 300,
      tileHeight: 300,
      wastage: 0,
    };
    const result = calculateTiles(input);

    // 1 m², tile = 0.09 m², raw = 11.11, ceil = 12
    expect(result.tilesNeeded).toBe(12);
  });

  it('handles non-square tiles', () => {
    const input: TileInput = {
      areaWidth: 2,
      areaHeight: 3,
      tileWidth: 600,
      tileHeight: 300,
      wastage: 5,
    };
    const result = calculateTiles(input);

    // 6 m², tile = 0.18 m², raw = 33.33, +5% = ceil(35) = 35
    expect(result.tilesNeeded).toBe(35);
    expect(result.coverageArea).toBeCloseTo(6);
  });

  it('handles large wastage percentage', () => {
    const input: TileInput = {
      areaWidth: 2,
      areaHeight: 2,
      tileWidth: 400,
      tileHeight: 400,
      wastage: 25,
    };
    const result = calculateTiles(input);

    // 4 m², tile = 0.16 m², raw = 25, +25% = ceil(31.25) = 32
    expect(result.tilesNeeded).toBe(32);
    expect(result.wastageAmount).toBe(7); // ceil(25 * 0.25)
  });

  it('throws or returns error for zero area width', () => {
    const input: TileInput = {
      areaWidth: 0,
      areaHeight: 2,
      tileWidth: 300,
      tileHeight: 300,
      wastage: 10,
    };

    expect(() => calculateTiles(input)).toThrow();
  });

  it('throws or returns error for zero tile size', () => {
    const input: TileInput = {
      areaWidth: 3,
      areaHeight: 2,
      tileWidth: 0,
      tileHeight: 300,
      wastage: 10,
    };

    expect(() => calculateTiles(input)).toThrow();
  });

  it('throws or returns error for negative dimensions', () => {
    const input: TileInput = {
      areaWidth: -1,
      areaHeight: 2,
      tileWidth: 300,
      tileHeight: 300,
      wastage: 10,
    };

    expect(() => calculateTiles(input)).toThrow();
  });
});
