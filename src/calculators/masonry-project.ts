import type { MasonryProjectInput, MasonryProjectResult } from './types';
import type { MaterialQuantity } from '../types';
import { calculateBricks } from './bricks';
import { calculateBlocks } from './blocks';
import { calculateMortar } from './mortar';
import { calculateSand } from './sand';
import { calculateCement } from './cement';
import { calculateWallTies } from './wall-ties';
import { calculateDPC } from './dpc';
import { calculateAirBricks } from './air-bricks';
import { calculateLintel } from './lintels';
import { calculatePadstone } from './padstones';
import { calculateCavityCloser } from './cavity-closers';
import { calculateCavityTray } from './cavity-trays';

const DEFAULT_WASTAGE = 5;

export function calculateMasonryProject(input: MasonryProjectInput): MasonryProjectResult {
    const wastage = input.wastagePercent ?? DEFAULT_WASTAGE;
    const openings = input.openings ?? [];
    const materials: MaterialQuantity[] = [];
    const warnings: string[] = [];

    // Opening deduction — net area used for brick/block/mortar quantities
    const openingAreaM2 = openings.reduce(
        (sum, o) => sum + (o.widthMm * o.heightMm) / 1_000_000,
        0,
    );
    const netAreaM2 = Math.max(0, input.wallAreaM2 - openingAreaM2);

    // Outer leaf: bricks
    if ((input.wallType === 'brick' || input.wallType === 'cavity') && input.brickProductId) {
        const r = calculateBricks({ areaM2: netAreaM2, productId: input.brickProductId, wastagePercent: wastage });
        materials.push(...r.materials);
        warnings.push(...r.warnings);
    }

    // Inner leaf: blocks
    if ((input.wallType === 'block' || input.wallType === 'cavity') && input.blockProductId) {
        const r = calculateBlocks({ areaM2: netAreaM2, productId: input.blockProductId, wastagePercent: wastage });
        materials.push(...r.materials);
        warnings.push(...r.warnings);
    }

    // Mortar → sand + cement
    if (input.sandProductId && input.cementProductId) {
        let totalSandKg = 0;
        let totalCementKg = 0;

        if (input.wallType === 'brick' || input.wallType === 'cavity') {
            const m = calculateMortar({ areaM2: netAreaM2, unitType: 'brick', mixRatio: input.mixRatio, wastagePercent: wastage });
            totalSandKg += m.sandKg;
            totalCementKg += m.cementKg;
        }
        if (input.wallType === 'block' || input.wallType === 'cavity') {
            const m = calculateMortar({ areaM2: netAreaM2, unitType: 'block', mixRatio: input.mixRatio, wastagePercent: wastage });
            totalSandKg += m.sandKg;
            totalCementKg += m.cementKg;
        }

        materials.push(...calculateSand({ sandKg: totalSandKg, productId: input.sandProductId }).materials);
        materials.push(...calculateCement({ cementKg: totalCementKg, productId: input.cementProductId }).materials);
    }

    // Wall ties (cavity only) — uses GROSS area per BS EN 1243: ties span above/below openings too
    if (input.wallType === 'cavity' && input.cavityWidthMm !== undefined) {
        const r = calculateWallTies({ areaM2: input.wallAreaM2, cavityWidthMm: input.cavityWidthMm });
        materials.push(...r.materials);
        warnings.push(...r.warnings);
    }

    // DPC — doubled for cavity walls (one roll per leaf)
    if (input.includeDPC && input.dpcProductId) {
        const dpcResult = calculateDPC({ wallLengthM: input.wallLengthM, productId: input.dpcProductId });
        materials.push(...dpcResult.materials);
        if (input.wallType === 'cavity') {
            materials.push(...dpcResult.materials);
        }
    }

    // Air bricks
    if (input.includeAirBricks) {
        const r = calculateAirBricks({ wallLengthM: input.wallLengthM });
        materials.push(...r.materials);
    }

    // Per-opening items
    for (const opening of openings) {
        const lintelProductId = input.wallType === 'cavity'
            ? input.steelLintelProductId
            : input.lintelProductId;

        if (lintelProductId) {
            const r = calculateLintel({ openingWidthMm: opening.widthMm, productId: lintelProductId });
            materials.push(...r.materials);
        }

        // 2 padstones per opening (one each end of lintel)
        if (input.padstoneProductId) {
            const r = calculatePadstone({ productId: input.padstoneProductId, quantity: 2 });
            materials.push(...r.materials);
        }

        if (input.wallType === 'cavity') {
            if (input.cavityCloserProductId) {
                const r = calculateCavityCloser({
                    openingWidthMm: opening.widthMm,
                    openingHeightMm: opening.heightMm,
                    productId: input.cavityCloserProductId,
                });
                materials.push(...r.materials);
            }
            if (input.cavityTrayProductId) {
                const r = calculateCavityTray({ productId: input.cavityTrayProductId, quantity: 1 });
                materials.push(...r.materials);
            }
        }
    }

    return {
        materials,
        grossAreaM2: input.wallAreaM2,
        netAreaM2,
        openingAreaM2,
        totalOpenings: openings.length,
        warnings,
    };
}
