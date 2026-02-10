import { describe, it, expect } from 'vitest';
import { calculateSpacers } from './spacers';
import type { SpacersInput } from './types';

describe('calculateSpacers', () => {
  it('calculates spacers for grid pattern', () => {
    const input: SpacersInput = {
      numberOfTiles: 80,
      pattern: 'grid',
      wastage: 10,
    };
    const result = calculateSpacers(input);

    // Grid: 4 spacers per tile, 80 * 4 = 320, +10% = ceil(352) = 352
    expect(result.spacersNeeded).toBe(352);
    expect(result.spacersPerTile).toBe(4);
  });

  it('calculates spacers for brick/offset pattern', () => {
    const input: SpacersInput = {
      numberOfTiles: 80,
      pattern: 'brick',
      wastage: 10,
    };
    const result = calculateSpacers(input);

    // Brick: 3 spacers per tile, 80 * 3 = 240, +10% = ceil(264) = 264
    expect(result.spacersNeeded).toBe(264);
    expect(result.spacersPerTile).toBe(3);
  });

  it('handles zero wastage', () => {
    const input: SpacersInput = {
      numberOfTiles: 100,
      pattern: 'grid',
      wastage: 0,
    };
    const result = calculateSpacers(input);

    // 100 * 4 = 400
    expect(result.spacersNeeded).toBe(400);
  });

  it('rounds up to whole spacers', () => {
    const input: SpacersInput = {
      numberOfTiles: 7,
      pattern: 'grid',
      wastage: 10,
    };
    const result = calculateSpacers(input);

    // 7 * 4 = 28, +10% = ceil(30.8) = 31
    expect(result.spacersNeeded).toBe(31);
  });

  it('throws for zero tiles', () => {
    const input: SpacersInput = {
      numberOfTiles: 0,
      pattern: 'grid',
      wastage: 10,
    };

    expect(() => calculateSpacers(input)).toThrow();
  });

  it('throws for negative tile count', () => {
    const input: SpacersInput = {
      numberOfTiles: -5,
      pattern: 'grid',
      wastage: 10,
    };

    expect(() => calculateSpacers(input)).toThrow();
  });
});
