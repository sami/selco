import { CEMENT_PRODUCTS, SAND_PRODUCTS, WALL_TIE_PRODUCTS } from '../data/masonry-products';

export interface MasonryInput {
  length: number;
  height: number;
  wallType?: 'brick' | 'block';
  /** Wastage percentage (default 5). Passed as an integer, e.g. 10 = 10 %. */
  wastage?: number;
}

export interface MasonryResult {
  bricks?: number;
  blocks?: number;
  mortar: string;
  sand: string;
  ties: string;
}

/** Coverage rates per m² (Build Spec §3). */
const BRICKS_PER_M2 = 51;
const BLOCKS_PER_M2 = 10;
const MORTAR_BAGS_PER_M2 = 0.8;
const SAND_KG_PER_M2 = 40.8; // 0.0408 tonnes = 40.8 kg
const WALL_TIES_PER_M2 = 2.5;

/** Default products for pack-rounding. */
const CEMENT = CEMENT_PRODUCTS[1];  // Blue Circle OPC 25 kg
const SAND = SAND_PRODUCTS[1];      // Building Sand Jumbo Bag 875 kg
const TIE = WALL_TIE_PRODUCTS[0];   // Type 4 Light Duty 200 mm

/**
 * Calculates the required materials for a masonry wall.
 *
 * Coverage rates from Build Spec §3:
 * - Bricks: 51 per m² (standard facing brick, 10 mm joint)
 * - Blocks: 10 per m² (standard 440 × 215 mm face)
 * - Mortar: 0.8 bags cement per m²
 * - Sand: 40.8 kg per m²
 * - Wall ties: 2.5 per m² (BS EN 1996, 450 × 900 mm centres)
 * - Wastage: 5 % default
 *
 * Results are pack-rounded to real SELCO products using Math.ceil.
 */
export function calculateMasonry({ length, height, wallType = 'brick', wastage = 5 }: MasonryInput): MasonryResult {
  if (length <= 0 || height <= 0) {
    throw new Error('Wall dimensions must be positive');
  }

  const area = length * height;

  // Unit count: bricks or blocks depending on wall type
  const ratePerM2 = wallType === 'block' ? BLOCKS_PER_M2 : BRICKS_PER_M2;
  const units = Math.ceil(area * ratePerM2 * (1 + wastage / 100));

  // Cement: bags needed at 0.8 bags/m²
  const cementBags = Math.ceil(area * MORTAR_BAGS_PER_M2);
  const mortar = `${cementBags} × ${CEMENT.bagSizeKg}kg bags of ${CEMENT.name}`;

  // Sand: total kg, rounded up to nearest full jumbo bag
  const sandKg = area * SAND_KG_PER_M2;
  const sandBags = Math.ceil(sandKg / SAND.packSizeKg);
  const sand = `${sandBags} × ${SAND.name}`;

  // Wall ties: raw count, rounded up to nearest full box
  const rawTies = Math.ceil(area * WALL_TIES_PER_M2);
  const tieBoxes = Math.ceil(rawTies / TIE.primaryPackSize);
  const ties = `${tieBoxes} × ${TIE.name} (Box of ${TIE.primaryPackSize})`;

  return {
    ...(wallType === 'block' ? { blocks: units } : { bricks: units }),
    mortar,
    sand,
    ties,
  };
}
