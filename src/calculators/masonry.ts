import { CEMENT_PRODUCTS, SAND_PRODUCTS, WALL_TIE_PRODUCTS } from '../data/masonry-products';
import { roundUp, splitPacks, type MaterialLine, type PackSizes } from './packs';

export type UnitKind = 'bricks' | 'blocks';

export interface MasonryInput {
  length: number;
  height: number;
  wallType?: 'brick' | 'block';
  /** Wastage percentage (default 5). Passed as an integer, e.g. 10 = 10 %. */
  wastage?: number;
}

export interface MasonryResult {
  areaM2: number;
  unitKind: UnitKind;
  /** Bricks or blocks to buy, wastage included. */
  unitCount: number;
  /** Cement, sand and ties, pack-rounded, in counter order. */
  lines: MaterialLine[];
}

/** Coverage rates per m² (Build Spec §3). */
const UNITS_PER_M2: Record<UnitKind, number> = { bricks: 51, blocks: 10 };
const WALL_TIES_PER_M2 = 2.5;

/**
 * Mortar per laid unit, carried over from the pre-reset v2 engine: a 25 kg
 * bag of cement lays about 100 bricks or 40 blocks (100 mm), with 0.85 kg
 * and 2.1 kg of building sand respectively. Counting per unit means
 * wastage reaches the mortar too, and blocks stop borrowing the brick rate.
 */
const MORTAR_PER_UNIT: Record<UnitKind, { cementBags: number; sandKg: number }> = {
  bricks: { cementBags: 0.01, sandKg: 0.85 },
  blocks: { cementBags: 0.025, sandKg: 2.1 },
};

/** Default products for pack-rounding. */
const CEMENT = CEMENT_PRODUCTS[1];     // Blue Circle OPC 25 kg
const SAND_LARGE = SAND_PRODUCTS[0];   // Building Sand Large Bag 35 kg
const SAND_JUMBO = SAND_PRODUCTS[1];   // Building Sand Jumbo Bag 875 kg
const TIE = WALL_TIE_PRODUCTS[0];      // Type 4 Light Duty 200 mm, boxes of 50 or 250

/** More than ten 35 kg bags and a jumbo bag is the better buy. */
const SAND_PACKS: PackSizes = { largeSize: SAND_JUMBO.packSizeKg, smallSize: SAND_LARGE.packSizeKg, maxSmall: 10 };

const TIE_LARGE = Math.max(...TIE.packSizes);
const TIE_SMALL = Math.min(...TIE.packSizes);
/** Once the small boxes would add up to a large one, take the large box. */
const TIE_PACKS: PackSizes = { largeSize: TIE_LARGE, smallSize: TIE_SMALL, maxSmall: TIE_LARGE / TIE_SMALL - 1 };

/**
 * Calculates the required materials for a masonry wall.
 *
 * - Bricks 51/m², blocks 10/m², plus wastage (5 % default)
 * - Cement and sand counted per laid unit, so wastage carries through
 * - Sand in 35 kg large bags, or 875 kg jumbo bags past ten large bags
 * - Wall ties 2.5/m² (BS EN 1996, 450 × 900 mm centres), boxed in 50s or 250s
 */
export function calculateMasonry({ length, height, wallType = 'brick', wastage = 5 }: MasonryInput): MasonryResult {
  if (length <= 0 || height <= 0) {
    throw new Error('Wall dimensions must be positive');
  }
  if (wastage < 0 || wastage > 100) {
    throw new Error('Wastage must be between 0 and 100%');
  }

  const areaM2 = length * height;
  const unitKind: UnitKind = wallType === 'block' ? 'blocks' : 'bricks';
  const unitCount = roundUp(areaM2 * UNITS_PER_M2[unitKind] * (1 + wastage / 100));

  const mortar = MORTAR_PER_UNIT[unitKind];
  const sand = splitPacks(unitCount * mortar.sandKg, SAND_PACKS);
  const ties = splitPacks(roundUp(areaM2 * WALL_TIES_PER_M2), TIE_PACKS);

  const lines: MaterialLine[] = [
    { id: 'cement', name: CEMENT.name, quantity: roundUp(unitCount * mortar.cementBags), unit: `${CEMENT.bagSizeKg}kg bags` },
    { id: 'sand-jumbo', name: SAND_JUMBO.name, quantity: sand.large, unit: `${SAND_JUMBO.packSizeKg}kg bags` },
    { id: 'sand-large', name: SAND_LARGE.name, quantity: sand.small, unit: `${SAND_LARGE.packSizeKg}kg bags` },
    { id: 'ties-large', name: TIE.name, quantity: ties.large, unit: `boxes of ${TIE_LARGE}` },
    { id: 'ties-small', name: TIE.name, quantity: ties.small, unit: `boxes of ${TIE_SMALL}` },
  ];

  return { areaM2, unitKind, unitCount, lines: lines.filter((l) => l.quantity > 0) };
}
