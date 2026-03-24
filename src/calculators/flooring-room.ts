/**
 * @file src/calculators/flooring-room.ts
 *
 * Room-level flooring orchestrator.
 *
 * Chains: room dimensions → flooring coverage → ancillary estimates
 * into a single function call.
 *
 * Supports rectangular and L-shaped rooms. The L-shape is modelled as
 * two adjoining rectangles with a shared internal wall deducted from
 * the perimeter calculation.
 *
 * Pure function: no DOM, no React, no side effects.
 */

import { calculateFlooring } from './flooring';
import {
    estimateUnderlay,
    estimateFlooringAdhesive,
    estimateScotia,
    estimateThresholdStrips,
    estimateDPM,
} from './flooring-ancillary';
import type {
    FlooringRoomInput,
    FlooringRoomResult,
    FlooringAncillaryEstimate,
    MaterialQuantity,
} from './types';

// ---------------------------------------------------------------------------
// Geometry helpers
// ---------------------------------------------------------------------------

function calculateRoomArea(room: FlooringRoomInput['room']): number {
    const mainArea = room.lengthM * room.widthM;
    const extArea = (room.secondLengthM ?? 0) * (room.secondWidthM ?? 0);
    return mainArea + extArea;
}

function calculatePerimeter(room: FlooringRoomInput['room']): number {
    const hasExtension = room.secondLengthM && room.secondWidthM;

    if (!hasExtension) {
        return 2 * (room.lengthM + room.widthM);
    }

    // L-shape perimeter: sum of all outer edges.
    // Main rectangle: lengthM × widthM
    // Extension: secondLengthM × secondWidthM
    // The shared internal wall (secondWidthM) is deducted.
    const mainPerimeter = 2 * (room.lengthM + room.widthM);
    const extPerimeter = 2 * (room.secondLengthM! + room.secondWidthM!);
    // Deduct the shared wall twice (once from each rectangle's perimeter)
    return mainPerimeter + extPerimeter - 2 * room.secondWidthM!;
}

// ---------------------------------------------------------------------------
// Ancillary default resolution
// ---------------------------------------------------------------------------

interface AncillaryDefaults {
    underlay: boolean;
    adhesive: boolean;
    scotia: boolean;
    dpm: boolean;
    thresholds: boolean;
}

function resolveAncillaryDefaults(input: FlooringRoomInput): AncillaryDefaults {
    const { flooringType, installMethod = 'floating' } = input;

    const isSolidWoodGlueDown = flooringType === 'solid-wood' && installMethod === 'glue-down';

    const defaults: AncillaryDefaults = {
        underlay: flooringType !== 'lvt' && !isSolidWoodGlueDown,
        adhesive: isSolidWoodGlueDown,
        scotia: true,
        dpm: false,
        thresholds: true,
    };

    // Apply user overrides
    if (input.includeUnderlay !== undefined) defaults.underlay = input.includeUnderlay;
    if (input.includeAdhesive !== undefined) defaults.adhesive = input.includeAdhesive;
    if (input.includeScotia !== undefined) defaults.scotia = input.includeScotia;
    if (input.includeDPM !== undefined) defaults.dpm = input.includeDPM;
    if (input.includeThresholds !== undefined) defaults.thresholds = input.includeThresholds;

    return defaults;
}

// ---------------------------------------------------------------------------
// Orchestrator
// ---------------------------------------------------------------------------

/**
 * Calculate flooring packs and ancillary materials for a room.
 *
 * @param input - Room dimensions, flooring type, coverage per pack, and options.
 * @returns Floor area, perimeter, flooring result, ancillaries, total materials, and warnings.
 */
export function calculateFlooringRoom(input: FlooringRoomInput): FlooringRoomResult {
    const { room, flooringType, coveragePerPackM2, layingPattern, doorwayCount = 1 } = input;

    // 1. Calculate floor area and perimeter
    const floorAreaM2 = calculateRoomArea(room);
    const perimeterM = calculatePerimeter(room);

    // 2. Run core flooring calculator
    const flooringResult = calculateFlooring({
        areaM2: floorAreaM2,
        flooringType,
        coveragePerPackM2,
        layingPattern,
    });

    // 3. Resolve ancillary defaults
    const defaults = resolveAncillaryDefaults(input);

    // 4. Run applicable ancillary estimators
    const ancillaries: FlooringAncillaryEstimate[] = [];

    if (defaults.underlay) {
        ancillaries.push(estimateUnderlay(floorAreaM2));
    }
    if (defaults.adhesive) {
        ancillaries.push(estimateFlooringAdhesive(floorAreaM2));
    }
    if (defaults.scotia) {
        ancillaries.push(estimateScotia(perimeterM));
    }
    if (defaults.thresholds) {
        ancillaries.push(estimateThresholdStrips(doorwayCount));
    }
    if (defaults.dpm) {
        ancillaries.push(estimateDPM(floorAreaM2));
    }

    // 5. Merge into totalMaterials
    const totalMaterials: MaterialQuantity[] = [
        ...flooringResult.materials,
        ...ancillaries.map(a => ({
            material: a.material,
            quantity: a.packsNeeded,
            unit: a.unit,
            packSize: a.packSize,
            packsNeeded: a.packsNeeded,
        })),
    ];

    // 6. Warnings
    const warnings: string[] = [];
    const hasExtension = room.secondLengthM && room.secondWidthM;
    if (hasExtension) {
        warnings.push('L-shaped rooms: verify perimeter measurement on site.');
    }

    return {
        floorAreaM2,
        perimeterM,
        flooringResult,
        ancillaries,
        totalMaterials,
        warnings,
    };
}
