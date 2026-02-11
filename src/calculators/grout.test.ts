import { describe, it, expect } from 'vitest';
import { calculateGrout, COMMON_JOINT_WIDTHS } from './grout';
import type { GroutInput } from './types';

// ---------------------------------------------------------------------------
// Phase 3: Updated grout calculator
//
// - Removed bagSize input — now always returns bags5kg and bags2_5kg
// - Added COMMON_JOINT_WIDTHS export
// - Formula unchanged: ((W+H)/(W*H)) * jointWidth * tileDepth * 1.6
// ---------------------------------------------------------------------------

describe('calculateGrout', () => {
  it('calculates grout for standard 300x300mm tiles', () => {
    const input: GroutInput = {
      area: 10,
      tileWidth: 300,
      tileHeight: 300,
      jointWidth: 3,
      tileDepth: 8,
      wastage: 10,
    };
    const result = calculateGrout(input);

    // Formula: ((300+300)/(300*300)) * 3 * 8 * 2.0 = 0.32 kg/m²
    // 10m² * 0.32 * 1.1 = 3.52 kg
    expect(result.kgPerM2).toBeCloseTo(0.32, 2);
    expect(result.kgNeeded).toBeCloseTo(3.52, 2);
    expect(result.bags5kg).toBe(1);     // ceil(3.52/5)
    expect(result.bags2_5kg).toBe(2);   // ceil(3.52/2.5)
  });

  it('calculates grout for large tiles with wide joints', () => {
    const input: GroutInput = {
      area: 20,
      tileWidth: 600,
      tileHeight: 600,
      jointWidth: 5,
      tileDepth: 10,
      wastage: 10,
    };
    const result = calculateGrout(input);

    // ((600+600)/(600*600)) * 5 * 10 * 2.0 = 0.3333 kg/m²
    // 20m² * 0.3333 * 1.1 = 7.333 kg
    expect(result.kgNeeded).toBeCloseTo(7.333, 3);
    expect(result.bags5kg).toBe(2);     // ceil(7.33/5)
    expect(result.bags2_5kg).toBe(3);   // ceil(7.33/2.5)
  });

  it('calculates grout for small mosaic tiles', () => {
    const input: GroutInput = {
      area: 5,
      tileWidth: 50,
      tileHeight: 50,
      jointWidth: 2,
      tileDepth: 4,
      wastage: 10,
    };
    const result = calculateGrout(input);

    // ((50+50)/(50*50)) * 2 * 4 * 2.0 = 0.64 kg/m²
    // 5m² * 0.64 * 1.1 = 3.52 kg
    expect(result.kgNeeded).toBeCloseTo(3.52, 2);
    expect(result.bags5kg).toBe(1);
    expect(result.bags2_5kg).toBe(2);
  });

  it('handles non-square tiles', () => {
    const input: GroutInput = {
      area: 10,
      tileWidth: 600,
      tileHeight: 300,
      jointWidth: 3,
      tileDepth: 8,
      wastage: 0,
    };
    const result = calculateGrout(input);

    // ((600+300)/(600*300)) * 3 * 8 * 2.0 = 0.24 kg/m²
    // 10m² * 0.24 * 1.0 = 2.4 kg
    expect(result.kgNeeded).toBeCloseTo(2.4, 2);
    expect(result.bags5kg).toBe(1);     // ceil(2.4/5)
    expect(result.bags2_5kg).toBe(1);   // ceil(2.4/2.5)
  });

  it('throws for zero area', () => {
    const input: GroutInput = {
      area: 0,
      tileWidth: 300,
      tileHeight: 300,
      jointWidth: 3,
      tileDepth: 8,
      wastage: 10,
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
    };

    expect(() => calculateGrout(input)).toThrow();
  });
});

// --- Phase 3: COMMON_JOINT_WIDTHS export ---

describe('COMMON_JOINT_WIDTHS', () => {
  it('exports an array of common joint widths', () => {
    expect(COMMON_JOINT_WIDTHS).toBeInstanceOf(Array);
    expect(COMMON_JOINT_WIDTHS.length).toBeGreaterThanOrEqual(4);
  });

  it('each entry has value and label', () => {
    for (const jw of COMMON_JOINT_WIDTHS) {
      expect(jw).toHaveProperty('value');
      expect(jw).toHaveProperty('label');
      expect(jw.value).toBeGreaterThan(0);
    }
  });

  it('includes standard joint widths: 2mm, 3mm, 5mm, 10mm', () => {
    const values = COMMON_JOINT_WIDTHS.map((jw: { value: number }) => jw.value);
    expect(values).toContain(2);
    expect(values).toContain(3);
    expect(values).toContain(5);
    expect(values).toContain(10);
  });
});
