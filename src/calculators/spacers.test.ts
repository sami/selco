import { describe, it, expect } from 'vitest';
import { calculateSpacers, SPACER_SIZES } from './spacers';
import type { SpacersInput } from './types';

// ---------------------------------------------------------------------------
// Phase 3: Area-based spacer calculator
//
// Input changed from numberOfTiles to areaM2 + tile dimensions.
// Function calculates tile count internally.
// Returns pack counts for 100 and 250 packs.
// Cross layout = 4 spacers/tile, T-junction = 3 spacers/tile.
// ---------------------------------------------------------------------------

describe('calculateSpacers', () => {
  it('calculates spacers for cross layout, 300x300 tiles, 10m²', () => {
    const input: SpacersInput = {
      areaM2: 10,
      tileWidthMm: 300,
      tileHeightMm: 300,
      layout: 'cross',
      wastage: 10,
    };
    const result = calculateSpacers(input);

    // tiles = ceil(10 / 0.09) = 112
    // spacers = ceil(112 * 4 * 1.1) = ceil(492.8) = 493
    expect(result.spacersNeeded).toBe(493);
    expect(result.packs100).toBe(5);   // ceil(493/100)
    expect(result.packs250).toBe(2);   // ceil(493/250)
  });

  it('calculates spacers for t-junction layout, 300x300 tiles, 10m²', () => {
    const input: SpacersInput = {
      areaM2: 10,
      tileWidthMm: 300,
      tileHeightMm: 300,
      layout: 't-junction',
      wastage: 10,
    };
    const result = calculateSpacers(input);

    // tiles = ceil(10 / 0.09) = 112
    // spacers = ceil(112 * 3 * 1.1) = ceil(369.6) = 370
    expect(result.spacersNeeded).toBe(370);
    expect(result.packs100).toBe(4);   // ceil(370/100)
    expect(result.packs250).toBe(2);   // ceil(370/250)
  });

  it('calculates spacers for rectangular tiles', () => {
    const input: SpacersInput = {
      areaM2: 15,
      tileWidthMm: 600,
      tileHeightMm: 300,
      layout: 'cross',
      wastage: 10,
    };
    const result = calculateSpacers(input);

    // tiles = ceil(15 / 0.18) = ceil(83.33) = 84
    // spacers = ceil(84 * 4 * 1.1) = ceil(369.6) = 370
    expect(result.spacersNeeded).toBe(370);
    expect(result.packs100).toBe(4);
    expect(result.packs250).toBe(2);
  });

  it('handles zero wastage', () => {
    const input: SpacersInput = {
      areaM2: 10,
      tileWidthMm: 300,
      tileHeightMm: 300,
      layout: 'cross',
      wastage: 0,
    };
    const result = calculateSpacers(input);

    // tiles = ceil(10 / 0.09) = 112
    // spacers = ceil(112 * 4 * 1.0) = 448
    expect(result.spacersNeeded).toBe(448);
    expect(result.packs100).toBe(5);   // ceil(448/100)
    expect(result.packs250).toBe(2);   // ceil(448/250)
  });

  it('handles large area with small tiles', () => {
    const input: SpacersInput = {
      areaM2: 5,
      tileWidthMm: 100,
      tileHeightMm: 100,
      layout: 'cross',
      wastage: 10,
    };
    const result = calculateSpacers(input);

    // tiles = ceil(5 / 0.01) = 500
    // spacers = ceil(500 * 4 * 1.1) = ceil(2200) = 2200
    expect(result.spacersNeeded).toBe(2200);
    expect(result.packs100).toBe(22);
    expect(result.packs250).toBe(9);   // ceil(2200/250)
  });

  it('throws for zero area', () => {
    const input: SpacersInput = {
      areaM2: 0,
      tileWidthMm: 300,
      tileHeightMm: 300,
      layout: 'cross',
      wastage: 10,
    };

    expect(() => calculateSpacers(input)).toThrow();
  });

  it('throws for negative tile dimensions', () => {
    const input: SpacersInput = {
      areaM2: 10,
      tileWidthMm: -300,
      tileHeightMm: 300,
      layout: 'cross',
      wastage: 10,
    };

    expect(() => calculateSpacers(input)).toThrow();
  });
});

// --- Phase 3: SPACER_SIZES export ---

describe('SPACER_SIZES', () => {
  it('exports an array of spacer sizes', () => {
    expect(SPACER_SIZES).toBeInstanceOf(Array);
    expect(SPACER_SIZES.length).toBeGreaterThanOrEqual(5);
  });

  it('each entry has value and label', () => {
    for (const size of SPACER_SIZES) {
      expect(size).toHaveProperty('value');
      expect(size).toHaveProperty('label');
      expect(size.value).toBeGreaterThan(0);
    }
  });

  it('includes common sizes: 1mm, 2mm, 3mm, 5mm', () => {
    const values = SPACER_SIZES.map((s: { value: number }) => s.value);
    expect(values).toContain(1);
    expect(values).toContain(2);
    expect(values).toContain(3);
    expect(values).toContain(5);
  });
});
