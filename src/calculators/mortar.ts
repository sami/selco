import type { MortarInput, MortarCalcResult } from './types';
import type { MaterialQuantity } from '../types';
import { applyWaste } from './primitives';

const MORTAR_RATES_M3_PER_M2: Record<'brick' | 'block', number> = {
    brick: 0.012,  // 65mm bricks, 10mm joints
    block: 0.007,  // 440×215mm blocks, 10mm joints
};

const SAND_DENSITY_KG_PER_M3 = 1600;   // BS EN 12620:2002+A1:2008
const CEMENT_DENSITY_KG_PER_M3 = 1500; // BS EN 197-1:2011
const DEFAULT_WASTAGE = 10;

export function calculateMortar(input: MortarInput): MortarCalcResult {
    const { areaM2, unitType, mixRatio, wastagePercent = DEFAULT_WASTAGE } = input;

    const rate = MORTAR_RATES_M3_PER_M2[unitType];
    const mortarVolumeM3 = applyWaste(areaM2 * rate, wastagePercent);

    // Parse '1:3' → cement:sand by volume
    const [cementPart, sandPart] = mixRatio.split(':').map(Number);
    const totalParts = cementPart + sandPart;

    const sandFraction = sandPart / totalParts;
    const cementFraction = cementPart / totalParts;

    const mortarWeightKg = mortarVolumeM3 * SAND_DENSITY_KG_PER_M3;
    const sandKg = mortarVolumeM3 * sandFraction * SAND_DENSITY_KG_PER_M3;
    const cementKg = mortarVolumeM3 * cementFraction * CEMENT_DENSITY_KG_PER_M3;

    const materials: MaterialQuantity[] = [
        {
            material: 'Building Sand',
            quantity: sandKg,
            unit: 'kg',
        },
        {
            material: 'Portland Cement (OPC)',
            quantity: cementKg,
            unit: 'kg',
        },
    ];

    return {
        mortarVolumeM3,
        mortarWeightKg,
        sandKg,
        cementKg,
        materials,
        warnings: [],
    };
}
