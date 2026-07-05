export interface MasonryInput {
  length: number;
  height: number;
}

export interface MasonryResult {
  bricks: number;
  mortarBags: number;
  sandTonnes: number;
}

/**
 * Calculates the required materials for a masonry wall.
 * Based on Build Spec §3 standard coverage rates:
 * - Bricks: 51 bricks per m² (standard facing brick with 10mm joint)
 * - Wastage: 5% recommended for bricks
 * - Mortar: 0.8 bags of cement per m²
 * - Sand: 0.0408 tonnes per m²
 */
export function calculateMasonry({ length, height }: MasonryInput): MasonryResult {
  // 1. Calculate the total wall area in square metres
  const area = length * height;
  
  // 2. Calculate bricks: 51 bricks per m² + 5% wastage
  const baseBricks = area * 51;
  const bricksWithWastage = baseBricks * 1.05;
  const bricks = Math.round(bricksWithWastage);
  
  // 3. Calculate cement/mortar bags: 0.8 bags per m²
  const mortarBags = Math.round(area * 0.8);
  
  // 4. Calculate sand tonnage: 0.0408 tonnes per m², rounded to 2 decimal places
  const sandTonnes = Number((area * 0.0408).toFixed(2));

  return {
    bricks,
    mortarBags,
    sandTonnes
  };
}
