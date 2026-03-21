import type { LayingPattern, CalculatorResult, MaterialQuantity } from '../types';

export type { LayingPattern, MaterialQuantity };

export type ApplicationContext = 'wall-dry' | 'wall-wet' | 'floor-dry' | 'floor-wet' | 'exterior';

export interface AdhesiveProduct {
    id: string;
    name: string;
    brand: string;
    enClass: string;
    bagSizeKg: number;
    coverageRates: Record<ApplicationContext, number>;
    /** kg/m²/mm — bed-depth scaling method (e.g. Keraflex Maxi S1). */
    perMmBedDepthKg?: number;
    /** Warn if any tile dimension exceeds this value (mm). */
    maxTileMm?: number;
    /** e.g. ['walls-only', 'internal-walls-only'] */
    restrictions?: string[];
    tdsUrl: string;
    lastVerified?: string;
}

export interface TileInput {
    roomLengthM: number;
    roomWidthM: number;
    tileLengthMm: number;
    tileWidthMm: number;
    gapWidthMm: number;           // grout joint in mm (0 = no gap)
    layingPattern: LayingPattern; // drives wastage % lookup from WASTAGE constant
    packSize: number;             // tiles per pack (pass 1 if packs not relevant)
    /** Optional area override — skips roomLengthM × roomWidthM. */
    areaM2?: number;
}

export interface TileResult extends CalculatorResult {
    tilesNeeded: number;
    tilesPerM2: number;     // rounded to 2 dp for display
    totalAreaM2: number;
    packsNeeded: number;
}

export interface AdhesiveInput {
    areaM2: number;
    tileLengthMm: number;
    tileWidthMm: number;
    productId: string;            // AdhesiveProduct.id
    applicationContext: ApplicationContext;
    /** If provided and product supports it, activates bed-depth scaling. */
    bedDepthMm?: number;
}

export interface AdhesiveResult {
    adhesiveKg: number;
    bagsNeeded: number;
    coverageRateUsed: number;     // kg/m² actually applied
    productName: string;
    materials: MaterialQuantity[];
    warnings: string[];
}

export interface GroutProduct {
    id: string;
    name: string;
    brand: string;
    enClass: string;          // e.g. 'CG2FWA'
    densityFactor: number;    // g/cm³ — 1.6 Mapei, 1.7 Dunlop standard
    minJointMm: number;       // minimum joint width (warn if below)
    maxJointMm: number;       // maximum joint width (warn if exceeded)
    bagSizes: number[];       // kg — all available sizes
    primaryBagSizeKg: number; // used for bagsNeeded in GroutResult
    restrictions?: string[];  // e.g. ['walls-only']
    tdsUrl: string;
    lastVerified?: string;
}

export interface SpacerProduct {
    id: string;
    sizeMm: number;
    packSizes: { quantity: number; packType: string }[];
}

export interface BackerBoardProduct {
    id: string;
    name: string;
    brand: string;
    boardLengthMm: number;
    boardWidthMm: number;
    thicknessMm: number;
    /** If undefined, product is sold individually. */
    boardsPerPack?: number;
    maxTileWeightKgM2?: number;
    /** e.g. ['Do NOT mechanically fix'] */
    notes?: string[];
    tdsUrl?: string;
    lastVerified?: string;
}

export interface TankingProduct {
    id: string;
    name: string;
    brand: string;
    coverageM2PerKit: number;
    coats: number;
    dryTimeHours: number;
    kitContentsDescription?: string;
    notes: string[];
    tdsUrl?: string;
    lastVerified?: string;
}

export interface SLCProduct {
    id: string;
    name: string;
    brand: string;
    bagSizeKg: number;
    /** Fixed density: 1.5 kg/litre for all standard SLC products. */
    densityKgPerL: number;
    tdsUrl?: string;
    lastVerified?: string;
}

export interface PrimerProduct {
    id: string;
    name: string;
    brand: string;
    /** Coverage at standard (undiluted/neat) application in m²/kg. */
    coverageM2PerKg: number;
    /** Coverage at diluted application (e.g. 1:1 with water) in m²/kg. */
    dilutedCoverageM2PerKg?: number;
    dilutionRatio?: string;     // e.g. '1:1'
    packSizes: number[];        // kg — all available sizes
    primaryPackSizeKg: number;
    notes?: string[];
    tdsUrl?: string;
    lastVerified?: string;
}

export interface GroutInput {
    areaM2: number;
    tileLengthMm: number;
    tileWidthMm: number;
    tileDepthMm: number;
    jointWidthMm: number;
    productId: string;
    /** Provide to trigger walls-only restriction check (defaults to wall context). */
    applicationContext?: ApplicationContext;
}

export interface GroutResult {
    groutKg: number;
    bagsNeeded: number;
    coverageRateKgPerM2: number;
    productName: string;
    materials: MaterialQuantity[];
    warnings: string[];
}

export interface SpacersInput {
    tilesNeeded: number;      // post-wastage count from tile calculator
    spacerSizeMm: number;     // 1, 2, 3, or 5
    layingPattern: LayingPattern;
    packSize: number;         // spacers per pack
}

export interface SpacersResult {
    spacersNeeded: number;
    packsNeeded: number;
    spacersPerTile: number;
    materials: MaterialQuantity[];
}

export type WallType = 'half-brick' | 'one-brick' | 'cavity' | 'blockwork';
export type MortarMixRatio = '1:3' | '1:4' | '1:5' | '1:6';
export type SandBagSize = 'jumbo' | 'large';

export interface WallSection {
    length: number;     // metres
    height: number;     // metres
}

export interface Opening {
    width: number;      // metres
    height: number;     // metres
}

export interface MasonryInput {
    wallType: WallType;
    walls: WallSection[];
    openings: Opening[];
    blockWidth: 100 | 140 | 215;    // mm — for cavity inner leaf & blockwork
    mixRatio: MortarMixRatio;
    unitWaste: number;              // percentage (e.g. 5)
    mortarWaste: number;            // percentage (e.g. 10)
    cavityWidth: number;            // mm — only used for cavity walls
    sandBagSize: SandBagSize;
}

export interface WallAreaResult {
    grossArea: number;      // m²
    openingArea: number;    // m²
    netArea: number;        // m²
}

export interface MortarResult {
    wetVolume: number;      // m³
    cementBags: number;
    sandTonnes: number;
    sandKg: number;
    sandBags: number;
    sandBagSizeKg: number;
}

export interface WallTiesResult {
    general: number;
    atOpenings: number;
    total: number;
}

export interface LintelResult {
    width: number;          // m — opening width
    lintelLength: number;   // mm
}

export interface DPCResult {
    length: number;         // metres
    widthMm: number;        // mm
}

export interface MasonryResult {
    area: WallAreaResult;
    bricks: number;
    blocks: number;
    mortar: MortarResult;
    wallTies: WallTiesResult;
    lintels: LintelResult[];
    dpc: DPCResult;
    /** One starter kit per wall section defined by the user. */
    starterKits: number;
    /** Gross wall area in m² — only for cavity walls. */
    insulationAreaM2?: number;
    /** Cavity width in mm — only for cavity walls where cavityWidth > 0. */
    insulationThicknessMm?: number;
}

// ---------------------------------------------------------------------------
// B7 — Wall Starters
// ---------------------------------------------------------------------------

export interface WallStarterProduct {
    id: string;
    name: string;
    brand: string;
    /** Length of the channel in metres (2.4m covers one storey). */
    lengthM: number;
    lastVerified: string;
}

// ---------------------------------------------------------------------------
// Adhesive — bed-depth model (wizard-style, product-agnostic)
// ---------------------------------------------------------------------------

/** Input for bed-depth-based adhesive calculation (used by project wizard). */
export interface AdhesiveBedDepthInput {
    areaM2: number;
    /** Bed depth in mm (e.g. 3, 6, 10). */
    bedDepthMm: number;
    /** Base coverage rate in kg/m² at a 3 mm bed. Typically 2.0. */
    baseCoverageKgPerM2: number;
    bagSizeKg: number;
    wastage: number;        // percentage (e.g. 10)
}

export interface AdhesiveBedDepthResult {
    /** Effective coverage rate after scaling for bed depth. */
    scaledCoverageKgPerM2: number;
    kgNeeded: number;
    kgWithWastage: number;
    bagsNeeded: number;
}

// ---------------------------------------------------------------------------
// Board coverage
// ---------------------------------------------------------------------------

export interface BoardCoverageInput {
    areaM2: number;
    boardLengthM: number;
    boardWidthM: number;
    wastage: number;        // percentage (e.g. 10)
}

export interface BoardCoverageResult {
    boardAreaM2: number;
    boardsNeeded: number;
    /** Total area covered by the boards ordered (boardsNeeded × boardAreaM2). */
    totalCoverageM2: number;
}

// ---------------------------------------------------------------------------
// Primer
// ---------------------------------------------------------------------------

export interface PrimerInput {
    areaM2: number;
    productId: string;
    /** Number of coats — defaults to 1 if omitted. */
    coats?: number;
    /** Apply diluted coverage rate (e.g. 1:1 with water) — defaults to false. */
    diluted?: boolean;
}

export interface PrimerResult {
    kgNeeded: number;
    packsNeeded: number;
    coverageRateUsed: number;   // m²/kg actually applied
    productName: string;
    materials: MaterialQuantity[];
}

// ---------------------------------------------------------------------------
// Backer board
// ---------------------------------------------------------------------------

export interface BackerBoardInput {
    areaM2: number;
    productId: string;
    /** Wastage percentage — defaults to 10 if omitted. */
    wastePercent?: number;
}

export interface BackerBoardResult {
    boardsNeeded: number;
    /** Only present for products sold in packs (e.g. Flexel ECOMAX). */
    packsNeeded?: number;
    boardAreaM2: number;
    productName: string;
    materials: MaterialQuantity[];
    warnings: string[];
}

// ---------------------------------------------------------------------------
// Tanking / waterproof membrane
// ---------------------------------------------------------------------------

export interface TankingInput {
    areaM2: number;
    productId: string;
}

export interface TankingResult {
    kitsNeeded: number;
    coveragePerKit: number;
    productName: string;
    materials: MaterialQuantity[];
    notes: string[];
}

// ---------------------------------------------------------------------------
// Self-levelling compound (SLC)
// ---------------------------------------------------------------------------

/** Fixed density constant used for all SLC products: 1.5 kg per litre. */
export const SLC_DENSITY_KG_PER_L = 1.5;

export interface SLCInput {
    areaM2: number;
    depthMm: number;
    /** Bag size in kg — defaults to 25 if omitted. */
    bagSizeKg?: number;
}

export interface SLCResult {
    /** Total kg of SLC required (no wastage — depth handles variation). */
    kgNeeded: number;
    bagsNeeded: number;
    /** Volume of compound in litres (areaM2 × depthMm). */
    volumeLitres: number;
    /** Coverage per bag in m² at the specified depth. */
    coverageAtDepthM2PerBag: number;
}

// ============================================================================
// Masonry product interfaces
// ============================================================================

export interface BrickProduct {
    id: string;
    name: string;
    brand: string;
    heightMm: number;
    lengthMm: number;
    widthMm: number;
    bricksPerM2: number;
    packSize: number;
    tdsUrl?: string;
    lastVerified: string;
}

export interface BlockProduct {
    id: string;
    name: string;
    brand: string;
    faceLengthMm: number;
    faceHeightMm: number;
    thicknessMm: number;
    strengthNPerMm2: number;
    blocksPerM2: number;
    tdsUrl?: string;
    lastVerified: string;
}

export interface CementProduct {
    id: string;
    name: string;
    brand: string;
    bagSizeKg: number;
    type: 'opc' | 'pre-mixed';
    tdsUrl?: string;
    lastVerified: string;
}

export interface SandProduct {
    id: string;
    name: string;
    packSizeKg: number;
    type: 'building' | 'sharp' | 'ballast';
    lastVerified: string;
}

export interface WallTieProduct {
    id: string;
    name: string;
    tieLengthMm: number;
    minCavityMm: number;
    maxCavityMm: number;
    type: 'type-4-light' | 'type-2-gp';
    packSizes: (50 | 250)[];
    primaryPackSize: 50 | 250;
    lastVerified: string;
}

export interface DPCProduct {
    id: string;
    name: string;
    widthMm: number;
    rollLengthM: number;
    material: 'polythene' | 'hdpe';
    lastVerified: string;
}

export interface ConcreteLintelProduct {
    id: string;
    name: string;
    brand: string;
    widthMm: number;
    availableLengthsMm: number[];
    minBearingMm: number;
    wallType: 'single-leaf' | 'internal' | 'solid';
    tdsUrl?: string;
    lastVerified: string;
}

export interface SteelLintelProduct {
    id: string;
    name: string;
    brand: string;
    model: string;
    lintelType: 'cavity' | 'single-leaf-internal' | 'single-leaf-external' | 'solid-wall-external';
    cavityWidthMm?: number;
    minBearingMm: number;
    tdsUrl?: string;
    lastVerified: string;
}

export interface PadstoneProduct {
    id: string;
    name: string;
    brand: string;
    lengthMm: number;
    widthMm: number;
    heightMm: number;
    tdsUrl?: string;
    lastVerified: string;
}

export interface CavityCloserProduct {
    id: string;
    name: string;
    brand: string;
    minCavityMm: number;
    maxCavityMm: number;
    lengthM: number;
    tdsUrl?: string;
    lastVerified: string;
}

export interface CavityTrayProduct {
    id: string;
    name: string;
    brand: string;
    trayType: 'type-e' | 'ridge' | 'intermediate-left' | 'intermediate-right' | 'catchment-left' | 'catchment-right';
    tdsUrl?: string;
    lastVerified: string;
}

// ---------------------------------------------------------------------------
// Masonry calculator I/O
// ---------------------------------------------------------------------------

export interface BricksInput {
    areaM2: number;
    productId: string;
    /** Default: 10 */
    wastagePercent?: number;
    /** Default: 'stretcher'. Affects warnings only — count is the same for all single-leaf bonds. */
    bondPattern?: 'stretcher' | 'flemish' | 'english' | 'stack';
}

export interface BricksResult {
    bricksNeeded: number;
    packsNeeded: number;
    bricksPerM2: number;
    productName: string;
    materials: MaterialQuantity[];
    warnings: string[];
}

export interface BlocksInput {
    areaM2: number;
    productId: string;
    /** Default: 5 */
    wastagePercent?: number;
}

export interface BlocksResult {
    blocksNeeded: number;
    blocksPerM2: number;
    productName: string;
    materials: MaterialQuantity[];
    warnings: string[];
}

// ---------------------------------------------------------------------------
// Mortar, sand, and cement calculator I/O
// ---------------------------------------------------------------------------

/** Input for the standalone mortar volume calculator. */
export interface MortarInput {
    areaM2: number;
    unitType: 'brick' | 'block';
    mixRatio: '1:3' | '1:4';
    /** Default: 10 */
    wastagePercent?: number;
}

/**
 * Result from calculateMortar() in mortar.ts.
 * Named MortarCalcResult to avoid collision with the legacy MortarResult
 * used by masonry.ts (which has fields: wetVolume, cementBags, sandTonnes, …).
 */
export interface MortarCalcResult {
    mortarVolumeM3: number;
    /** Total mortar mass approximation at sand density (1,600 kg/m³). */
    mortarWeightKg: number;
    sandKg: number;
    cementKg: number;
    materials: MaterialQuantity[];
    warnings: string[];
}

/** Input for the standalone sand packing calculator. */
export interface SandInput {
    sandKg: number;
    productId: string;
}

export interface SandResult {
    sandKg: number;
    bagsNeeded: number;
    packSizeKg: number;
    productName: string;
    materials: MaterialQuantity[];
}

/** Input for the standalone cement packing calculator. */
export interface CementInput {
    cementKg: number;
    productId: string;
}

export interface CementResult {
    cementKg: number;
    bagsNeeded: number;
    bagSizeKg: number;
    productName: string;
    materials: MaterialQuantity[];
}

// ---------------------------------------------------------------------------
// Wall ties, DPC, and air brick calculator I/O
// ---------------------------------------------------------------------------

/** Input for the standalone wall ties calculator. */
export interface WallTiesInput {
    areaM2: number;
    /** Cavity width in mm — used to auto-select the correct tie length. */
    cavityWidthMm: number;
    /**
     * Pack size to use for rounding. Defaults to product's primaryPackSize (250).
     * All wall tie products stock both 50 and 250 packs.
     */
    packSize?: 50 | 250;
}

/**
 * Result from calculateWallTies() in wall-ties.ts.
 * Named WallTiesCalcResult to avoid collision with the legacy WallTiesResult
 * used by masonry.ts (which has fields: general, atOpenings, total).
 */
export interface WallTiesCalcResult {
    tiesNeeded: number;
    packsNeeded: number;
    /** The pack size used in the calculation. */
    packSize: 50 | 250;
    tieLengthMm: number;
    productId: string;
    productName: string;
    materials: MaterialQuantity[];
    warnings: string[];
}

/** Input for the standalone DPC calculator. */
export interface DPCInput {
    wallLengthM: number;
    productId: string;
}

/**
 * Result from calculateDPC() in dpc.ts.
 * Named DPCCalcResult to avoid collision with the legacy DPCResult
 * used by masonry.ts (which has fields: length, widthMm).
 */
export interface DPCCalcResult {
    rollsNeeded: number;
    rollLengthM: number;
    widthMm: number;
    productName: string;
    materials: MaterialQuantity[];
}

/** Input for the standalone air bricks calculator. */
export interface AirBricksInput {
    wallLengthM: number;
}

export interface AirBricksResult {
    airBricksNeeded: number;
    materials: MaterialQuantity[];
}

// ---------------------------------------------------------------------------
// Lintel calculator I/O
// ---------------------------------------------------------------------------
export interface LintelInput {
    openingWidthMm: number;
    productId: string;
}
export interface LintelCalcResult {
    lintelLengthMm: number;
    productName: string;
    materials: MaterialQuantity[];
}

// ---------------------------------------------------------------------------
// Padstone calculator I/O
// ---------------------------------------------------------------------------
export interface PadstoneInput {
    productId: string;
    quantity: number;
}
export interface PadstoneResult {
    padstonesNeeded: number;
    productName: string;
    materials: MaterialQuantity[];
}

// ---------------------------------------------------------------------------
// Cavity closer calculator I/O
// ---------------------------------------------------------------------------
export interface CavityCloserInput {
    openingWidthMm: number;
    openingHeightMm: number;
    productId: string;
}
export interface CavityCloserResult {
    closersNeeded: number;
    perimeterM: number;
    productName: string;
    materials: MaterialQuantity[];
}

// ---------------------------------------------------------------------------
// Cavity tray calculator I/O
// ---------------------------------------------------------------------------
export interface CavityTrayInput {
    productId: string;
    quantity: number;
}
export interface CavityTrayResult {
    traysNeeded: number;
    productName: string;
    materials: MaterialQuantity[];
}

// ---------------------------------------------------------------------------
// Masonry project orchestrator I/O
// ---------------------------------------------------------------------------
export interface MasonryProjectInput {
    wallAreaM2: number;
    wallLengthM: number;
    wallType: 'brick' | 'block' | 'cavity';
    brickProductId?: string;
    blockProductId?: string;
    cementProductId?: string;
    sandProductId?: string;
    dpcProductId?: string;
    lintelProductId?: string;
    steelLintelProductId?: string;
    padstoneProductId?: string;
    cavityCloserProductId?: string;
    cavityTrayProductId?: string;
    mixRatio: '1:3' | '1:4';
    /** Default: 5 */
    wastagePercent?: number;
    cavityWidthMm?: number;
    includeDPC: boolean;
    includeAirBricks: boolean;
    openings: Array<{ widthMm: number; heightMm: number }>;
}
export interface MasonryProjectResult {
    materials: MaterialQuantity[];
    grossAreaM2: number;
    netAreaM2: number;
    openingAreaM2: number;
    totalOpenings: number;
    warnings: string[];
}
