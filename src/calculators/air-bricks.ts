import type { AirBricksInput, AirBricksResult } from './types';
import type { MaterialQuantity } from '../types';

/** BS 5250: 1 air brick per 450mm of external wall at DPC level. */
const AIR_BRICK_SPACING_MM = 450;
const AIR_BRICK_DESCRIPTION = 'Air Brick 204 × 60mm';

export function calculateAirBricks(input: AirBricksInput): AirBricksResult {
    const wallLengthMm = input.wallLengthM * 1000;
    const airBricksNeeded = Math.ceil(wallLengthMm / AIR_BRICK_SPACING_MM);

    const materials: MaterialQuantity[] = [
        {
            material: AIR_BRICK_DESCRIPTION,
            quantity: airBricksNeeded,
            unit: 'each',
        },
    ];

    return { airBricksNeeded, materials };
}
