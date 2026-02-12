export interface TileInput {
    areaWidth: number;      // metres
    areaHeight: number;     // metres
    tileWidth: number;      // millimetres
    tileHeight: number;     // millimetres
    wastage: number;        // percentage (e.g. 10)
    packSize?: number;      // tiles per pack
}

export interface TileResult {
    tilesNeeded: number;
    coverageArea: number;   // square metres
    wastageAmount: number;  // extra tiles for wastage
    packsNeeded?: number;
}

export interface AdhesiveInput {
    area: number;           // square metres
    coverageRate: number;   // kg/m² (from product TDS data)
    bagSize: number;        // kg per bag/tub (from product data)
    substrate: 'even' | 'uneven';
    wastage: number;        // percentage (e.g. 10)
}

export interface AdhesiveResult {
    kgNeeded: number;
    bagsNeeded: number;
}

export interface GroutInput {
    area: number;           // square metres
    tileWidth: number;      // mm
    tileHeight: number;     // mm
    jointWidth: number;     // mm
    tileDepth: number;      // mm
    wastage: number;        // percentage
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
