import { describe, it, expect } from 'vitest';
import { calculateMasonry } from '../masonry';

describe('Masonry Engine', () => {
  it('calculates materials for a 5.0m x 2.5m wall (12.5 m²)', () => {
    const result = calculateMasonry({ length: 5.0, height: 2.5 });
    
    // We expect ceil() rounding now, so bricks goes from 669 -> 670
    expect(result.bricks).toBe(670);
    expect(result.mortarBags).toBe(10);
    expect(result.sandTonnes).toBeCloseTo(0.51, 2);
    // Standard wall tie rate: 2.5 ties per m² -> 12.5 * 2.5 = 31.25 -> 32
    expect(result.wallTies).toBe(32); 
  });

  it('calculates materials for a 3.0m x 2.0m wall (6.0 m²)', () => {
    const result = calculateMasonry({ length: 3.0, height: 2.0 });
    
    expect(result.bricks).toBe(322); // 6 * 51 * 1.05 = 321.3 -> ceil 322
    expect(result.mortarBags).toBe(5); // 6 * 0.8 = 4.8 -> ceil 5
    expect(result.sandTonnes).toBeCloseTo(0.24, 2); // 6 * 0.0408 = 0.2448
    expect(result.wallTies).toBe(15); // 6 * 2.5 = 15
  });

  it('returns zeros for zero or negative inputs', () => {
    const result = calculateMasonry({ length: 0, height: 2.5 });
    
    expect(result.bricks).toBe(0);
    expect(result.mortarBags).toBe(0);
    expect(result.sandTonnes).toBe(0);
    expect(result.wallTies).toBe(0);
  });
});
