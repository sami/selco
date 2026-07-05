import { describe, it, expect } from 'vitest';
import { calculateMasonry } from '../masonry';

describe('Masonry Engine', () => {
  it('calculates correct materials for a 5.0m x 2.5m wall', () => {
    const result = calculateMasonry({ length: 5.0, height: 2.5 });
    
    expect(result.bricks).toBe(669);
    expect(result.mortarBags).toBe(10);
    expect(result.sandTonnes).toBeCloseTo(0.51, 2);
  });
});
