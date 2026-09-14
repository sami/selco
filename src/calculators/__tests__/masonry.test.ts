import { describe, it, expect } from 'vitest';
import { calculateMasonry, type MasonryResult } from '../masonry';

const line = (result: MasonryResult, id: string) => result.lines.find((l) => l.id === id);
const ids = (result: MasonryResult) => result.lines.map((l) => l.id);

describe('Masonry Engine', () => {
  describe('5.0m × 2.5m brick wall (12.5 m², 5% wastage)', () => {
    const result = calculateMasonry({ length: 5.0, height: 2.5 });

    it('counts bricks with wastage', () => {
      expect(result.areaM2).toBe(12.5);
      expect(result.unitKind).toBe('bricks');
      expect(result.unitCount).toBe(670); // 12.5 × 51 × 1.05 = 669.375 → 670
    });

    it('derives cement from the brick count at 100 bricks per bag', () => {
      // 670 × 0.01 = 6.7 → 7
      expect(line(result, 'cement')).toEqual({
        id: 'cement',
        name: 'Blue Circle OPC',
        quantity: 7,
        unit: '25kg bags',
      });
    });

    it('buys a jumbo bag of sand when large bags would pass ten', () => {
      // 670 × 0.85 kg = 569.5 kg → 17 large bags is too many → 1 jumbo
      expect(line(result, 'sand-jumbo')).toMatchObject({ name: 'Building Sand Jumbo Bag', quantity: 1 });
      expect(line(result, 'sand-large')).toBeUndefined();
    });

    it('boxes wall ties in the smallest sensible pack', () => {
      // 12.5 × 2.5 = 31.25 → 32 ties → 1 box of 50
      expect(line(result, 'ties-small')).toMatchObject({
        name: 'Type 4 Light Duty Wall Tie 200mm',
        quantity: 1,
        unit: 'boxes of 50',
      });
      expect(line(result, 'ties-large')).toBeUndefined();
    });
  });

  it('3.0m × 2.0m brick wall: sand in 35kg large bags', () => {
    const result = calculateMasonry({ length: 3.0, height: 2.0 });

    expect(result.unitCount).toBe(322); // 6 × 51 × 1.05 = 321.3 → 322
    expect(line(result, 'cement')?.quantity).toBe(4); // 3.22 → 4
    // 322 × 0.85 = 273.7 kg → 8 × 35 kg
    expect(line(result, 'sand-large')).toMatchObject({ name: 'Building Sand Large Bag', quantity: 8, unit: '35kg bags' });
    expect(line(result, 'sand-jumbo')).toBeUndefined();
  });

  it('4.0m × 2.4m block wall: blocks use their own mortar rate', () => {
    const result = calculateMasonry({ length: 4.0, height: 2.4, wallType: 'block' });

    expect(result.unitKind).toBe('blocks');
    expect(result.unitCount).toBe(101); // 9.6 × 10 × 1.05 = 100.8 → 101
    expect(line(result, 'cement')?.quantity).toBe(3); // 101 × 0.025 = 2.525 → 3
    expect(line(result, 'sand-large')?.quantity).toBe(7); // 101 × 2.1 = 212.1 kg → 7 × 35 kg
  });

  it('carries wastage through to the mortar, not just the bricks', () => {
    const base = calculateMasonry({ length: 5.0, height: 2.5, wastage: 0 });
    const wasteful = calculateMasonry({ length: 5.0, height: 2.5, wastage: 20 });

    expect(base.unitCount).toBe(638); // 637.5 → 638
    expect(wasteful.unitCount).toBe(765); // 765
    expect(line(base, 'cement')?.quantity).toBe(7); // 6.38 → 7
    expect(line(wasteful, 'cement')?.quantity).toBe(8); // 7.65 → 8
  });

  it('uses 5% wastage by default', () => {
    expect(calculateMasonry({ length: 5.0, height: 2.5 }).unitCount).toBe(670);
    expect(calculateMasonry({ length: 5.0, height: 2.5, wastage: 10 }).unitCount).toBe(702);
  });

  it('lists materials in counter order: cement, sand, ties', () => {
    expect(ids(calculateMasonry({ length: 3.0, height: 2.0 }))).toEqual(['cement', 'sand-large', 'ties-small']);
  });

  it('throws for zero-length wall', () => {
    expect(() => calculateMasonry({ length: 0, height: 2.5 })).toThrow('Wall dimensions must be positive');
  });

  it('throws for negative-height wall', () => {
    expect(() => calculateMasonry({ length: 3, height: -1 })).toThrow('Wall dimensions must be positive');
  });

  it('throws for negative wastage', () => {
    expect(() => calculateMasonry({ length: 3, height: 2, wastage: -5 })).toThrow('Wastage must be between 0 and 100%');
  });
});
