import { describe, it, expect } from 'vitest';
import { calculateMasonry } from '../masonry';

describe('Masonry Engine', () => {
  it('calculates materials for a 5.0m x 2.5m wall (12.5 m²)', () => {
    const result = calculateMasonry({ length: 5.0, height: 2.5 });

    expect(result.bricks).toBe(670); // 12.5 * 51 * 1.05 = 669.375 -> ceil 670
    expect(result.mortar).toBe('10 × 25kg bags of Blue Circle OPC');
    // 510 kg / 875 kg per jumbo bag = 0.583 -> ceil 1
    expect(result.sand).toBe('1 × Building Sand Jumbo Bag');
    // 32 ties / 250 per box = 0.128 -> ceil 1
    expect(result.ties).toBe('1 × Type 4 Light Duty Wall Tie 200mm (Box of 250)');
  });

  it('calculates materials for a 3.0m x 2.0m wall (6.0 m²)', () => {
    const result = calculateMasonry({ length: 3.0, height: 2.0 });

    expect(result.bricks).toBe(322); // 6 * 51 * 1.05 = 321.3 -> ceil 322
    expect(result.mortar).toBe('5 × 25kg bags of Blue Circle OPC');
    // 244.8 kg / 875 kg = 0.2798 -> ceil 1
    expect(result.sand).toBe('1 × Building Sand Jumbo Bag');
    // 15 ties / 250 per box = 0.06 -> ceil 1
    expect(result.ties).toBe('1 × Type 4 Light Duty Wall Tie 200mm (Box of 250)');
  });

  it('calculates materials for a 4.0m x 2.4m block wall (9.6 m²)', () => {
    const result = calculateMasonry({ length: 4.0, height: 2.4, wallType: 'block' });

    expect(result.blocks).toBe(101); // 9.6 * 10 * 1.05 = 100.8 -> ceil 101
    expect(result.mortar).toBe('8 × 25kg bags of Blue Circle OPC');
    // 391.68 kg / 875 kg = 0.4476 -> ceil 1
    expect(result.sand).toBe('1 × Building Sand Jumbo Bag');
    // 24 ties / 250 per box = 0.096 -> ceil 1
    expect(result.ties).toBe('1 × Type 4 Light Duty Wall Tie 200mm (Box of 250)');
  });

  it('applies custom wastage when provided', () => {
    // Same 5×2.5m wall but with 10% wastage instead of default 5%
    const result = calculateMasonry({ length: 5.0, height: 2.5, wastage: 10 });

    // 12.5 * 51 * 1.10 = 701.25 -> ceil 702
    expect(result.bricks).toBe(702);
  });

  it('uses default 5% wastage when not specified', () => {
    const result = calculateMasonry({ length: 5.0, height: 2.5 });

    // 12.5 * 51 * 1.05 = 669.375 -> ceil 670 (unchanged)
    expect(result.bricks).toBe(670);
  });

  it('throws for zero-length wall', () => {
    expect(() => calculateMasonry({ length: 0, height: 2.5 }))
      .toThrow('Wall dimensions must be positive');
  });

  it('throws for negative-height wall', () => {
    expect(() => calculateMasonry({ length: 3, height: -1 }))
      .toThrow('Wall dimensions must be positive');
  });
});
