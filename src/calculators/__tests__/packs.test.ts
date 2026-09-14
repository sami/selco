import { describe, it, expect } from 'vitest';
import { roundUp, splitPacks } from '../packs';

describe('roundUp', () => {
  it('rounds a fractional requirement up to the next whole unit', () => {
    expect(roundUp(6.7)).toBe(7);
  });

  it('does not tip an exact whole number over because of float noise', () => {
    // 700 × 0.01 === 7.000000000000001 in IEEE 754
    expect(roundUp(700 * 0.01)).toBe(7);
  });

  it('never returns a negative count', () => {
    expect(roundUp(-3)).toBe(0);
  });
});

describe('splitPacks', () => {
  // Building sand: 875 kg jumbo bags topped up with 35 kg large bags,
  // switching to another jumbo once more than 10 large bags would be needed.
  const sand = { largeSize: 875, smallSize: 35, maxSmall: 10 };

  it('buys only small packs for a small requirement', () => {
    expect(splitPacks(273.7, sand)).toEqual({ large: 0, small: 8 });
  });

  it('takes a large pack once the small packs would exceed the limit', () => {
    expect(splitPacks(569.5, sand)).toEqual({ large: 1, small: 0 });
  });

  it('tops whole large packs up with small packs', () => {
    // 875 + 100 kg → 1 jumbo + ceil(100 / 35) = 3 large bags
    expect(splitPacks(975, sand)).toEqual({ large: 1, small: 3 });
  });

  it('returns nothing for a zero requirement', () => {
    expect(splitPacks(0, sand)).toEqual({ large: 0, small: 0 });
  });

  it('works for boxed items such as wall ties (250s and 50s)', () => {
    const ties = { largeSize: 250, smallSize: 50, maxSmall: 4 };
    expect(splitPacks(32, ties)).toEqual({ large: 0, small: 1 });
    expect(splitPacks(240, ties)).toEqual({ large: 1, small: 0 });
    expect(splitPacks(300, ties)).toEqual({ large: 1, small: 1 });
  });
});
