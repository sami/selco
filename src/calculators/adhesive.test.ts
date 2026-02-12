import { describe, it, expect } from 'vitest';
import { calculateAdhesive, ADHESIVE_PRODUCTS } from './adhesive';
import type { AdhesiveInput } from './types';

// ---------------------------------------------------------------------------
// Phase 3: Product-based adhesive calculator
//
// Coverage rates from Selco-stocked manufacturer TDS data:
//   Dunlop RX-3000 (15 kg tub): dry wall 2 kg/m², wet area 3 kg/m²
//   Dunlop CX-24 Essential (20 kg bag): dry wall 2 kg/m², wet area 3.5 kg/m²
//   Dunlop CF-03 Flexible Fast Set (20 kg bag): dry wall 2 kg/m², wet area 4 kg/m²
//   Mapei Standard Set Plus (20 kg bag): dry wall 2 kg/m², wet area 4 kg/m²
//
// The pure function takes coverageRate and bagSize as inputs (looked up
// from ADHESIVE_PRODUCTS by the UI based on product + application type).
// Uneven substrate adds +20%.
// ---------------------------------------------------------------------------

describe('calculateAdhesive', () => {
  it('calculates for Dunlop RX-3000, dry wall, 10 m²', () => {
    // RX-3000: 15 kg tub, dry wall rate = 2 kg/m²
    const input: AdhesiveInput = {
      area: 10,
      coverageRate: 2,
      bagSize: 15,
      substrate: 'even',
      wastage: 10,
    };
    const result = calculateAdhesive(input);

    // kg = 10 * 2 * 1.1 = 22, bags = ceil(22/15) = 2
    expect(result.kgNeeded).toBeCloseTo(22);
    expect(result.bagsNeeded).toBe(2);
  });

  it('calculates for Dunlop RX-3000, wet area, 10 m²', () => {
    // RX-3000: 15 kg tub, wet area rate = 3 kg/m²
    const input: AdhesiveInput = {
      area: 10,
      coverageRate: 3,
      bagSize: 15,
      substrate: 'even',
      wastage: 10,
    };
    const result = calculateAdhesive(input);

    // kg = 10 * 3 * 1.1 = 33, bags = ceil(33/15) = 3
    expect(result.kgNeeded).toBeCloseTo(33);
    expect(result.bagsNeeded).toBe(3);
  });

  it('calculates for Dunlop CX-24, wet area, 10 m²', () => {
    // CX-24: 20 kg bag, wet area rate = 3.5 kg/m²
    const input: AdhesiveInput = {
      area: 10,
      coverageRate: 3.5,
      bagSize: 20,
      substrate: 'even',
      wastage: 10,
    };
    const result = calculateAdhesive(input);

    // kg = 10 * 3.5 * 1.1 = 38.5, bags = ceil(38.5/20) = 2
    expect(result.kgNeeded).toBeCloseTo(38.5);
    expect(result.bagsNeeded).toBe(2);
  });

  it('calculates for Dunlop CF-03, wet area, 15 m²', () => {
    // CF-03: 20 kg bag, wet area rate = 4 kg/m²
    const input: AdhesiveInput = {
      area: 15,
      coverageRate: 4,
      bagSize: 20,
      substrate: 'even',
      wastage: 5,
    };
    const result = calculateAdhesive(input);

    // kg = 15 * 4 * 1.05 = 63, bags = ceil(63/20) = 4
    expect(result.kgNeeded).toBeCloseTo(63);
    expect(result.bagsNeeded).toBe(4);
  });

  it('applies +20% for uneven substrate', () => {
    // Mapei: 20 kg bag, wet area rate = 4 kg/m², uneven substrate
    const input: AdhesiveInput = {
      area: 10,
      coverageRate: 4,
      bagSize: 20,
      substrate: 'uneven',
      wastage: 10,
    };
    const result = calculateAdhesive(input);

    // effective rate = 4 * 1.2 = 4.8
    // kg = 10 * 4.8 * 1.1 = 52.8, bags = ceil(52.8/20) = 3
    expect(result.kgNeeded).toBeCloseTo(52.8);
    expect(result.bagsNeeded).toBe(3);
  });

  it('handles zero wastage', () => {
    const input: AdhesiveInput = {
      area: 10,
      coverageRate: 2,
      bagSize: 20,
      substrate: 'even',
      wastage: 0,
    };
    const result = calculateAdhesive(input);

    // kg = 10 * 2 * 1.0 = 20, bags = ceil(20/20) = 1
    expect(result.kgNeeded).toBeCloseTo(20);
    expect(result.bagsNeeded).toBe(1);
  });

  it('handles large area with small bag size', () => {
    // RX-3000 tub (15 kg), wet area, 20 m²
    const input: AdhesiveInput = {
      area: 20,
      coverageRate: 3,
      bagSize: 15,
      substrate: 'even',
      wastage: 10,
    };
    const result = calculateAdhesive(input);

    // kg = 20 * 3 * 1.1 = 66, bags = ceil(66/15) = 5
    expect(result.kgNeeded).toBeCloseTo(66);
    expect(result.bagsNeeded).toBe(5);
  });

  it('throws for zero area', () => {
    const input: AdhesiveInput = {
      area: 0,
      coverageRate: 2,
      bagSize: 20,
      substrate: 'even',
      wastage: 10,
    };

    expect(() => calculateAdhesive(input)).toThrow();
  });

  it('throws for zero or negative coverage rate', () => {
    const input: AdhesiveInput = {
      area: 10,
      coverageRate: 0,
      bagSize: 20,
      substrate: 'even',
      wastage: 10,
    };

    expect(() => calculateAdhesive(input)).toThrow('Coverage rate must be greater than zero.');
  });

  it('throws for negative wastage', () => {
    const input: AdhesiveInput = {
      area: 10,
      coverageRate: 2,
      bagSize: 20,
      substrate: 'even',
      wastage: -5,
    };

    expect(() => calculateAdhesive(input)).toThrow('Wastage must be between 0 and 100.');
  });

  it('throws for wastage over 100', () => {
    const input: AdhesiveInput = {
      area: 10,
      coverageRate: 2,
      bagSize: 20,
      substrate: 'even',
      wastage: 200,
    };

    expect(() => calculateAdhesive(input)).toThrow('Wastage must be between 0 and 100.');
  });
});

// --- ADHESIVE_PRODUCTS export (manufacturer TDS data) ---

describe('ADHESIVE_PRODUCTS', () => {
  it('exports an array of at least 4 products', () => {
    expect(ADHESIVE_PRODUCTS).toBeInstanceOf(Array);
    expect(ADHESIVE_PRODUCTS.length).toBeGreaterThanOrEqual(4);
  });

  it('each product has value, label, bagSize, dryWallRate, wetAreaRate', () => {
    for (const product of ADHESIVE_PRODUCTS) {
      expect(product).toHaveProperty('value');
      expect(product).toHaveProperty('label');
      expect(product).toHaveProperty('bagSize');
      expect(product).toHaveProperty('dryWallRate');
      expect(product).toHaveProperty('wetAreaRate');
      expect(product.bagSize).toBeGreaterThan(0);
      expect(product.dryWallRate).toBeGreaterThan(0);
      expect(product.wetAreaRate).toBeGreaterThan(0);
    }
  });

  it('includes Dunlop RX-3000 with correct rates', () => {
    const rx3000 = ADHESIVE_PRODUCTS.find((p: { value: string }) => p.value === 'dunlop-rx3000');
    expect(rx3000).toBeDefined();
    expect(rx3000!.bagSize).toBe(15);
    expect(rx3000!.dryWallRate).toBe(2);
    expect(rx3000!.wetAreaRate).toBe(3);
  });

  it('includes Dunlop CX-24 with correct rates', () => {
    const cx24 = ADHESIVE_PRODUCTS.find((p: { value: string }) => p.value === 'dunlop-cx24');
    expect(cx24).toBeDefined();
    expect(cx24!.bagSize).toBe(20);
    expect(cx24!.dryWallRate).toBe(2);
    expect(cx24!.wetAreaRate).toBe(3.5);
  });

  it('includes Dunlop CF-03 with correct rates', () => {
    const cf03 = ADHESIVE_PRODUCTS.find((p: { value: string }) => p.value === 'dunlop-cf03');
    expect(cf03).toBeDefined();
    expect(cf03!.bagSize).toBe(20);
    expect(cf03!.dryWallRate).toBe(2);
    expect(cf03!.wetAreaRate).toBe(4);
  });

  it('includes Mapei with correct rates', () => {
    const mapei = ADHESIVE_PRODUCTS.find((p: { value: string }) => p.value === 'mapei-standard');
    expect(mapei).toBeDefined();
    expect(mapei!.bagSize).toBe(20);
    expect(mapei!.dryWallRate).toBe(2);
    expect(mapei!.wetAreaRate).toBe(4);
  });
});
