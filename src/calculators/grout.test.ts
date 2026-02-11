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

    // Formula: ((300+300)/(300*300)) * 3 * 8 * 1.6 = 0.2560 kg/m²
    // 10m² * 0.256 * 1.1 = 2.816 kg
    expect(result.kgPerM2).toBeCloseTo(0.256, 2);
    expect(result.kgNeeded).toBeCloseTo(2.816, 1);
    expect(result.bags5kg).toBe(1);     // ceil(2.816/5)
    expect(result.bags2_5kg).toBe(2);   // ceil(2.816/2.5)
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

    // ((600+600)/(600*600)) * 5 * 10 * 1.6 = 0.2667 kg/m²
    // 20m² * 0.2667 * 1.1 = 5.867 kg
    expect(result.kgNeeded).toBeCloseTo(5.867, 1);
    expect(result.bags5kg).toBe(2);     // ceil(5.867/5)
    expect(result.bags2_5kg).toBe(3);   // ceil(5.867/2.5)
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

    // ((50+50)/(50*50)) * 2 * 4 * 1.6 = 0.512 kg/m²
    // 5m² * 0.512 * 1.1 = 2.816 kg
    expect(result.kgNeeded).toBeCloseTo(2.816, 1);
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

    // ((600+300)/(600*300)) * 3 * 8 * 1.6 = 0.192 kg/m²
    // 10m² * 0.192 * 1.0 = 1.92 kg
    expect(result.kgNeeded).toBeCloseTo(1.92, 1);
    expect(result.bags5kg).toBe(1);     // ceil(1.92/5)
    expect(result.bags2_5kg).toBe(1);   // ceil(1.92/2.5)
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
