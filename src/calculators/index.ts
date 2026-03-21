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
    calculateWallTies,
    calculateLintels,
    calculateDPC,
    calculateMasonry,
} from './masonry';

export { calculateMortar } from './mortar';
export { calculateSand } from './sand';
export { calculateCement } from './cement';

export { calculateBricks } from './bricks';
export { calculateBlocks } from './blocks';

// ---------------------------------------------------------------------------
// Handy calculators — board coverage
// ---------------------------------------------------------------------------

export { BOARD_PRESETS, calculateBoardCoverage } from './board-coverage';

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
// Coming-soon calculator stubs (not yet implemented)
// ---------------------------------------------------------------------------

export type { FlooringInput, FlooringResult } from './flooring';
export { calculateFlooring } from './flooring';

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
