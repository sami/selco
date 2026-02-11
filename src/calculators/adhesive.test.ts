import { describe, it, expect } from 'vitest';
import { calculateAdhesive, ADHESIVE_TYPES } from './adhesive';
import type { AdhesiveInput } from './types';

// ---------------------------------------------------------------------------
// Phase 3: New bed-thickness model
//
// Coverage rates by tile size (largest edge):
//   < 300 mm  -> 3 mm bed  -> 4 kg/m²
//   300-450 mm -> 6 mm bed  -> 7 kg/m²
//   > 450 mm  -> 10 mm bed -> 10 kg/m²
//
// Uneven substrate adds +20% to coverage rate.
// Returns bags for both 20 kg and 10 kg sizes.
// ---------------------------------------------------------------------------

describe('calculateAdhesive', () => {
  it('calculates adhesive for small tiles (<300mm), even substrate', () => {
    const input: AdhesiveInput = {
      area: 10,
      tileSize: 200,
      substrate: 'even',
      wastage: 10,
    };
    const result = calculateAdhesive(input);

    // rate = 4 kg/m², kg = 10 * 4 * 1.1 = 44
    expect(result.coverageRate).toBe(4);
    expect(result.bedThickness).toBe(3);
    expect(result.kgNeeded).toBeCloseTo(44);
    expect(result.bags20kg).toBe(3);   // ceil(44/20)
    expect(result.bags10kg).toBe(5);   // ceil(44/10)
  });

  it('calculates adhesive for medium tiles (300-450mm), even substrate', () => {
    const input: AdhesiveInput = {
      area: 10,
      tileSize: 300,
      substrate: 'even',
      wastage: 10,
    };
    const result = calculateAdhesive(input);

    // rate = 7 kg/m², kg = 10 * 7 * 1.1 = 77
    expect(result.coverageRate).toBe(7);
    expect(result.bedThickness).toBe(6);
    expect(result.kgNeeded).toBeCloseTo(77);
    expect(result.bags20kg).toBe(4);   // ceil(77/20)
    expect(result.bags10kg).toBe(8);   // ceil(77/10)
  });

  it('calculates adhesive for large tiles (>450mm), even substrate', () => {
    const input: AdhesiveInput = {
      area: 15,
      tileSize: 600,
      substrate: 'even',
      wastage: 5,
    };
    const result = calculateAdhesive(input);

    // rate = 10 kg/m², kg = 15 * 10 * 1.05 = 157.5
    expect(result.coverageRate).toBe(10);
    expect(result.bedThickness).toBe(10);
    expect(result.kgNeeded).toBeCloseTo(157.5);
    expect(result.bags20kg).toBe(8);   // ceil(157.5/20)
    expect(result.bags10kg).toBe(16);  // ceil(157.5/10)
  });

  it('applies +20% for uneven substrate', () => {
    const input: AdhesiveInput = {
      area: 10,
      tileSize: 400,
      substrate: 'uneven',
      wastage: 10,
    };
    const result = calculateAdhesive(input);

    // base rate = 7, effective = 7 * 1.2 = 8.4 kg/m²
    // kg = 10 * 8.4 * 1.1 = 92.4
    expect(result.coverageRate).toBe(7);       // base rate
    expect(result.bedThickness).toBe(6);
    expect(result.kgNeeded).toBeCloseTo(92.4);
    expect(result.bags20kg).toBe(5);           // ceil(92.4/20)
    expect(result.bags10kg).toBe(10);          // ceil(92.4/10)
  });

  it('handles boundary: tile exactly 300mm is medium', () => {
    const input: AdhesiveInput = {
      area: 10,
      tileSize: 300,
      substrate: 'even',
      wastage: 0,
    };
    const result = calculateAdhesive(input);

    expect(result.coverageRate).toBe(7);
    expect(result.bedThickness).toBe(6);
    expect(result.kgNeeded).toBeCloseTo(70);
  });

  it('handles boundary: tile exactly 450mm is medium', () => {
    const input: AdhesiveInput = {
      area: 10,
      tileSize: 450,
      substrate: 'even',
      wastage: 0,
    };
    const result = calculateAdhesive(input);

    expect(result.coverageRate).toBe(7);
    expect(result.bedThickness).toBe(6);
    expect(result.kgNeeded).toBeCloseTo(70);
  });

  it('handles zero wastage', () => {
    const input: AdhesiveInput = {
      area: 10,
      tileSize: 300,
      substrate: 'even',
      wastage: 0,
    };
    const result = calculateAdhesive(input);

    // 10 * 7 * 1.0 = 70
    expect(result.kgNeeded).toBeCloseTo(70);
    expect(result.bags20kg).toBe(4);  // ceil(70/20) = 3.5 -> 4
  });

  it('throws for zero area', () => {
    const input: AdhesiveInput = {
      area: 0,
      tileSize: 300,
      substrate: 'even',
      wastage: 10,
    };

    expect(() => calculateAdhesive(input)).toThrow();
  });

  it('throws for negative tile size', () => {
    const input: AdhesiveInput = {
      area: 10,
      tileSize: -100,
      substrate: 'even',
      wastage: 10,
    };

    expect(() => calculateAdhesive(input)).toThrow();
  });
});

// --- ADHESIVE_TYPES export ---

describe('ADHESIVE_TYPES', () => {
  it('exports an array of adhesive types', () => {
    expect(ADHESIVE_TYPES).toBeInstanceOf(Array);
    expect(ADHESIVE_TYPES.length).toBeGreaterThanOrEqual(3);
  });

  it('each type has value and label', () => {
    for (const type of ADHESIVE_TYPES) {
      expect(type).toHaveProperty('value');
      expect(type).toHaveProperty('label');
    }
  });
});
