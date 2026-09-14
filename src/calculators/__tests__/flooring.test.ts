import { describe, it, expect } from 'vitest';
import { calculateFlooring, type FlooringInput, type FlooringResult } from '../flooring';
import { FLOOR_TYPES, UNDERLAYS } from '../../data/flooring-products';

// A 3.5m × 4.5m room (15.75 m²) with one doorway, 8 mm laminate floated on foam.
const job = (over: Partial<FlooringInput> = {}): FlooringInput =>
  ({
    widthM: 3.5,
    lengthM: 4.5,
    floorId: 'laminate8',
    fixing: 'floating',
    underlay: 'foam',
    doorways: 1,
    concreteSubfloor: false,
    ...over,
  }) as FlooringInput;

const line = (result: FlooringResult, id: string) => result.lines.find((l) => l.id === id);

describe('flooring catalogue', () => {
  it('only real-timber floors can be glued down', () => {
    const canGlue = Object.fromEntries(FLOOR_TYPES.map((f) => [f.id, f.canGlue]));
    expect(canGlue).toEqual({ laminate8: false, laminate12: false, lvt: false, engineered: true, solid: true });
  });

  it('offers integrated underlay alongside the stocked underlays', () => {
    expect(UNDERLAYS.map((u) => u.id)).toEqual(['foam', 'vapour', 'fibreboard', 'acoustic', 'integrated']);
  });
});

describe('calculateFlooring — floating laminate', () => {
  const result = calculateFlooring(job());

  it('quotes the floor as m² to buy, with 8% cutting waste, rounded up to 2 dp', () => {
    expect(result.areaM2).toBe(15.75);
    expect(result.coverM2).toBe(17.01); // 15.75 × 1.08 = 17.01
    expect(line(result, 'floor')).toMatchObject({ quantity: 17.01, unit: 'm²' });
  });

  it('adds the chosen underlay at 5% overlap', () => {
    // 15.75 × 1.05 = 16.5375 → 16.54
    expect(line(result, 'underlay')).toMatchObject({ name: 'White foam flooring underlay', quantity: 16.54, unit: 'm²' });
  });

  it('counts scotia beading round the perimeter, less the doorways', () => {
    // (2 × (3.5 + 4.5) − 0.8) / 2.4 = 6.33 → 7 lengths
    expect(line(result, 'beading')).toMatchObject({ quantity: 7, unit: '2.4m lengths' });
  });

  it('adds a threshold bar per doorway and a fitting kit for the click joints', () => {
    expect(line(result, 'thresholds')?.quantity).toBe(1);
    expect(line(result, 'spacers')?.quantity).toBe(1);
    expect(line(result, 'adhesive')).toBeUndefined();
  });

  it('plank thickness does not change the area to buy', () => {
    expect(calculateFlooring(job({ floorId: 'laminate12' })).coverM2).toBe(result.coverM2);
  });
});

describe('calculateFlooring — options', () => {
  it('integrated underlay adds no underlay line', () => {
    expect(line(calculateFlooring(job({ underlay: 'integrated' })), 'underlay')).toBeUndefined();
  });

  it('no doorways means no threshold bars', () => {
    expect(line(calculateFlooring(job({ doorways: 0 })), 'thresholds')).toBeUndefined();
  });

  it('glued engineered wood takes adhesive instead of underlay and fitting kit, but keeps the beading', () => {
    const result = calculateFlooring(job({ floorId: 'engineered', fixing: 'glued' }));
    expect(line(result, 'adhesive')).toMatchObject({ name: 'SikaBond-54 wood floor adhesive', quantity: 15.75, unit: 'm² to bond' });
    expect(line(result, 'underlay')).toBeUndefined();
    expect(line(result, 'spacers')).toBeUndefined();
    expect(line(result, 'beading')).toBeDefined();
  });

  it('warns when a floating floor over concrete has no vapour barrier', () => {
    const foam = calculateFlooring(job({ concreteSubfloor: true }));
    const vapour = calculateFlooring(job({ concreteSubfloor: true, underlay: 'vapour' }));
    expect(foam.notes.some((n) => /vapour/i.test(n))).toBe(true);
    expect(vapour.notes.some((n) => /vapour/i.test(n))).toBe(false);
  });
});

describe('calculateFlooring — invalid input is rejected, never corrected', () => {
  it('refuses to glue a floor that can only float', () => {
    expect(() => calculateFlooring(job({ floorId: 'lvt', fixing: 'glued' }))).toThrow('LVT / SPC 5 mm can only be laid floating');
  });

  it('rejects non-positive room sizes', () => {
    expect(() => calculateFlooring(job({ widthM: 0 }))).toThrow('Room dimensions must be positive');
  });

  it('rejects part or negative doorways', () => {
    expect(() => calculateFlooring(job({ doorways: -1 }))).toThrow('Doorways must be a whole number, 0 or more');
    expect(() => calculateFlooring(job({ doorways: 1.5 }))).toThrow('Doorways must be a whole number, 0 or more');
  });

  it('rejects an unknown floor type', () => {
    expect(() => calculateFlooring(job({ floorId: 'carpet' as FlooringInput['floorId'] }))).toThrow('Unknown floor type: carpet');
  });
});
