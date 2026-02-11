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
    tileSize: number;       // longest tile edge in mm
    substrate: 'even' | 'uneven';
    wastage: number;        // percentage (e.g. 10)
}

export interface AdhesiveResult {
    kgNeeded: number;
    bags20kg: number;
    bags10kg: number;
    coverageRate: number;   // base kg per m² (before substrate adjustment)
    bedThickness: number;   // mm
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
