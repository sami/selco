import type { TileInput, TileResult } from './types';
import type { MaterialQuantity } from '../types';
import { packsNeeded } from './primitives';
import { WASTAGE } from './constants';

/** Common UK tile sizes for dropdown presets. Values in mm. */
export const COMMON_TILE_SIZES = [
    { width: 100,  height: 100,  label: '100 × 100 mm (mosaic)' },
    { width: 150,  height: 150,  label: '150 × 150 mm' },
    { width: 200,  height: 200,  label: '200 × 200 mm' },
    { width: 250,  height: 250,  label: '250 × 250 mm' },
    { width: 300,  height: 300,  label: '300 × 300 mm' },
    { width: 300,  height: 600,  label: '300 × 600 mm' },
    { width: 450,  height: 450,  label: '450 × 450 mm' },
    { width: 600,  height: 600,  label: '600 × 600 mm' },
];

/**
 * Calculate tile quantity for a given room and tile size.
 *
 * **Formula (BS 5385:2021 / RIBA Good Practice Guide 2019):**
 * 1. effectiveAreaMm2 = (tileLengthMm + gapWidthMm) × (tileWidthMm + gapWidthMm)
 * 2. tilesPerM²       = 1,000,000 / effectiveAreaMm2
 * 3. rawTiles         = roomAreaM² × tilesPerM²
 * 4. withWaste        = rawTiles × (1 + wastePercent / 100)
 * 5. tilesNeeded      = Math.ceil(withWaste)   [safe IEEE 754 ceil]
 * 6. packsNeeded      = Math.ceil(tilesNeeded / packSize)
 *
 * Wastage % is looked up from the WASTAGE constant (src/calculators/constants.ts):
 *   straight=10, brick-bond=12, diagonal=15, herringbone=15
 * Source: RIBA Good Practice Guide (2019); British Ceramic Tile (2021).
 *
 * @example
 * calculateTiles({ roomLengthM: 3, roomWidthM: 4, tileLengthMm: 300, tileWidthMm: 300,
 *   gapWidthMm: 3, layingPattern: 'straight', packSize: 9 })
 * // → { tilesNeeded: 144, packsNeeded: 16, tilesPerM2: 10.89, totalAreaM2: 12 }
 *
 * @throws If room area is zero/negative (or areaM2 override is zero/negative).
 * @throws If tile dimensions are zero or negative.
 */
export function calculateTiles(input: TileInput): TileResult {
    const {
        roomLengthM, roomWidthM, areaM2: override,
        tileLengthMm, tileWidthMm, gapWidthMm,
        layingPattern, packSize,
    } = input;

    // --- Validation ---
    if (override !== undefined) {
        if (override <= 0) throw new Error('areaM2 override must be greater than zero.');
    } else {
        if (roomLengthM * roomWidthM <= 0)
            throw new Error('Room area must be greater than zero.');
    }
    if (tileLengthMm <= 0 || tileWidthMm <= 0)
        throw new Error('Tile dimensions must be greater than zero.');

    // --- Core calculation ---
    const totalAreaM2 = override ?? (roomLengthM * roomWidthM);
    const wastePercent = WASTAGE[layingPattern];

    const effectiveAreaMm2 = (tileLengthMm + gapWidthMm) * (tileWidthMm + gapWidthMm);
    const tilesPerM2Raw = 1_000_000 / effectiveAreaMm2;
    const tilesPerM2 = Math.round(tilesPerM2Raw * 100) / 100;    // 2 dp for display

    const rawTiles = totalAreaM2 * tilesPerM2Raw;
    const withWaste = rawTiles * (1 + wastePercent / 100);

    // Avoid IEEE 754 ceiling artefacts (e.g. 35.000000000001 → should be 35, not 36)
    const safeCeil = (n: number) => Math.ceil(Math.round(n * 1e10) / 1e10);

    const tilesNeeded = safeCeil(withWaste);
    const packs = safeCeil(tilesNeeded / packSize);

    const materials: MaterialQuantity[] = [{
        material: 'Floor/wall tiles',
        quantity: tilesNeeded,
        unit: 'tiles',
        packSize,
        packsNeeded: packs,
    }];

    return { tilesNeeded, tilesPerM2, totalAreaM2, wastePercent, packsNeeded: packs, materials };
}
