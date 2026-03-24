/**
 * @file src/calculators/index.ts
 *
 * Barrel export — single entry point for all Layer 1 calculator modules.
 *
 * Import from this file rather than reaching into individual module paths.
 * If internal module layout changes, only this file needs updating.
 *
 * ⚠️  DENSITY naming note:
 *   Both constants.ts and conversions.ts export a symbol called `DENSITY`.
 *   They are different objects:
 *     • `MATERIAL_DENSITY` (re-exported from constants.ts) — 6 generic bulk
 *       densities for SLC, screed, concrete, and mortar calculations.
 *     • `DENSITY`          (re-exported from conversions.ts) — 10 specific
 *       material grades used by convertDensityToWeight().
 *   Import the one appropriate for your use case.
 */

// ---------------------------------------------------------------------------
// Shared utilities — pure math helpers
// ---------------------------------------------------------------------------

export * from './primitives';

// constants.ts re-exports DENSITY which conflicts with conversions.ts DENSITY.
// Alias it so both are accessible without a name collision.
export { WASTAGE, DENSITY as MATERIAL_DENSITY } from './constants';

// ---------------------------------------------------------------------------
// Shared types — input/output interfaces for tiling wizard sub-calculators
// ---------------------------------------------------------------------------

export * from './types';

// ---------------------------------------------------------------------------
// Tiling wizard — sub-calculators
// ---------------------------------------------------------------------------

export { COMMON_TILE_SIZES, calculateTiles } from './tiles';
export {
    ADHESIVE_PRODUCTS,
    GROUT_PRODUCTS,
    SPACER_PRODUCTS,
    BACKER_BOARD_PRODUCTS,
    TANKING_PRODUCTS,
    SLC_PRODUCTS,
    PRIMER_PRODUCTS,
} from '../data/tiling-products';
export {
    calculateAdhesive,
    calculateAdhesiveByBedDepth,
} from './adhesive';
export { COMMON_JOINT_WIDTHS, calculateGrout } from './grout';
export {
    SPACER_SIZES,
    SPACERS_PER_TILE_BY_PATTERN,
    calculateSpacers,
} from './spacers';
export { calculateBackerBoard } from './backer-board';
export { calculateTanking } from './tanking';
export { calculateSLC } from './slc';
export { calculatePrimer } from './primer';

// ---------------------------------------------------------------------------
// Masonry calculator
// ---------------------------------------------------------------------------

export {
    UNITS_PER_M2,
    MORTAR_PER_M2,
    WALL_TYPES,
    SAND_BAG_SIZES,
    calculateWallArea,
    calculateLintels,
    calculateMasonry,
} from './masonry';

export { calculateWallTies } from './wall-ties';
export { calculateDPC, recommendDPCProductId } from './dpc';
export { calculateAirBricks } from './air-bricks';
export { calculateLintel } from './lintels';
export { calculatePadstone } from './padstones';
export { calculateCavityCloser } from './cavity-closers';
export { calculateCavityTray } from './cavity-trays';
export { calculateMasonryProject } from './masonry-project';

export { calculateMortar } from './mortar';
export { calculateSand } from './sand';
export { calculateCement } from './cement';

export { calculateBricks } from './bricks';
export { calculateBlocks } from './blocks';

// ---------------------------------------------------------------------------
// Handy calculators — board coverage
// ---------------------------------------------------------------------------

export { BOARD_PRESETS, calculateBoardCoverage } from './board-coverage';
export { getPresetById, getBoardDimensions } from './board-presets';

// ---------------------------------------------------------------------------
// Handy calculators — board cutting optimiser (stub — not yet implemented)
// ---------------------------------------------------------------------------

export type {
    CutPart,
    BoardCuttingInput,
    PlacedPart,
    CutSheet,
    BoardCuttingResult,
} from './board-cutting';
export { calculateBoardCutting } from './board-cutting';

// ---------------------------------------------------------------------------
// Handy calculators — unit conversions
// ---------------------------------------------------------------------------

export type {
    LengthUnit,
    AreaUnit,
    WeightUnit,
    VolumeUnit,
    TemperatureUnit,
    DensityMaterial,
    ConversionFamily,
    ConversionInput,
    ConversionResult,
} from './conversions';
export {
    DENSITY,
    DENSITIES,
    UNITS,
    CONVERSION_FACTORS,
    convertLength,
    convertArea,
    convertWeight,
    convertVolume,
    convertTemperature,
    convertDensityToWeight,
    convertUnits,
    getUnitsForFamily,
    convert,
} from './conversions';

// ---------------------------------------------------------------------------
// Flooring calculator — live
// ---------------------------------------------------------------------------

export { calculateFlooring } from './flooring';
export { FLOORING_WASTAGE, DEFAULT_LAYING_PATTERN, VALID_PATTERNS } from './flooring-config';
export {
    estimateUnderlay,
    estimateFlooringAdhesive,
    estimateScotia,
    estimateThresholdStrips,
    estimateDPM,
} from './flooring-ancillary';
export {
    UNDERLAY_ROLL_SIZES,
    UNDERLAY_OVERLAP_PERCENT,
    FLOORING_ADHESIVE_M2_PER_LITRE,
    ADHESIVE_BUCKET_SIZES,
    SCOTIA_LENGTH_M,
    SCOTIA_WASTE_PERCENT,
    THRESHOLD_STRIP_LENGTH_MM,
    DPM_ROLL_SIZES,
    DPM_OVERLAP_PERCENT,
} from './flooring-constants';
export { calculateFlooringRoom } from './flooring-room';

// ---------------------------------------------------------------------------
// Coming-soon calculator stubs (not yet implemented)
// ---------------------------------------------------------------------------

export type { DeckingInput, DeckingResult } from './decking';
export { calculateDecking } from './decking';

export type { CladdingInput, CladdingResult } from './cladding';
export { calculateCladding } from './cladding';

// ---------------------------------------------------------------------------
// Calculator registry
// ---------------------------------------------------------------------------

export {
    CALCULATOR_REGISTRY,
    PROJECT_CALCULATORS,
    HANDY_CALCULATORS,
    LIVE_CALCULATORS,
    getCalculatorById,
} from './registry';
