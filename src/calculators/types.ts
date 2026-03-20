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

export interface GroutInput {
    area: number;           // square metres
    tileWidth: number;      // mm
    tileHeight: number;     // mm
    jointWidth: number;     // mm
    tileDepth: number;      // mm
    wastage: number;        // percentage
    /** Grout density in kg/m³. Defaults to 2000 (BS EN 13888:2009). Use 1700 for lighter grouts. */
    densityKgPerM3?: number;
}

export interface GroutResult {
    kgNeeded: number;
    bags5kg: number;
    bags2_5kg: number;
    kgPerM2: number;
}

export interface SpacersInput {
    areaM2: number;           // square metres
    tileWidthMm: number;      // mm
    tileHeightMm: number;     // mm
    layout: 'cross' | 't-junction';
    wastage: number;          // percentage
}

export interface SpacersResult {
    spacersNeeded: number;
    packs100: number;
    packs250: number;
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
    blockWidth: 100 | 140;          // mm — for cavity inner leaf & blockwork
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
    /** Coverage rate in m² per litre. */
    coverageRateM2PerL: number;
    bottleSizeL: number;
    coats: number;
}

export interface PrimerResult {
    litresNeeded: number;
    bottlesNeeded: number;
}

// ---------------------------------------------------------------------------
// Backer board
// ---------------------------------------------------------------------------

export interface BackerBoardInput {
    areaM2: number;
    boardWidthMm: number;
    boardHeightMm: number;
    wastage: number;        // percentage (e.g. 10)
}

export interface BackerBoardResult {
    boardAreaM2: number;
    boardsNeeded: number;
}

// ---------------------------------------------------------------------------
// Tanking / waterproof membrane
// ---------------------------------------------------------------------------

export interface TankingInput {
    areaM2: number;
    /** Coverage rate in kg per m² per coat. */
    coverageRateKgPerM2PerCoat: number;
    coats: number;
    tubSizeKg: number;
}

export interface TankingResult {
    kgNeeded: number;
    tubsNeeded: number;
}

// ---------------------------------------------------------------------------
// Self-levelling compound (SLC)
// ---------------------------------------------------------------------------

export interface SLCInput {
    areaM2: number;
    /** Average pour depth in mm. */
    averageDepthMm: number;
    /** Coverage rate in kg per m² per mm of depth. */
    coverageRateKgPerM2PerMm: number;
    bagSizeKg: number;
    wastage: number;        // percentage (e.g. 10)
}

export interface SLCResult {
    kgNeeded: number;
    kgWithWastage: number;
    bagsNeeded: number;
}

// ---------------------------------------------------------------------------
// Spacers — pattern-based model (wizard-style)
// ---------------------------------------------------------------------------

/** Tile laying pattern — determines spacers per tile. */
export type TilePattern = 'grid' | 'brick_bond' | 'diagonal' | 'herringbone';

/** Input for pattern-based spacer calculation (used by project wizard). */
export interface SpacersByCountInput {
    /** Total tile count, already including wastage allowance. */
    tileCount: number;
    pattern: TilePattern;
    /** Number of spacers per pack. */
    packSize: number;
}

export interface SpacersByCountResult {
    spacersPerTile: number;
    totalSpacers: number;
    packsNeeded: number;
}
