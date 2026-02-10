export interface TileInput {
    areaWidth: number;    // metres
    areaHeight: number;   // metres
    tileWidth: number;    // millimetres
    tileHeight: number;   // millimetres
    wastage: number;      // percentage (e.g. 10)
}

export interface TileResult {
    tilesNeeded: number;
    coverageArea: number;   // square metres
    wastageAmount: number;  // extra tiles for wastage
}

export interface AdhesiveInput {
    area: number;       // square metres
    tileSize: number;   // longest tile edge in mm
    wastage: number;    // percentage
    bagSize: number;    // kg per bag (default 20)
}

export interface AdhesiveResult {
    kgNeeded: number;
    bagsNeeded: number;
    coverageRate: number;  // kg per m²
}

export interface GroutInput {
    area: number;        // square metres
    tileWidth: number;   // mm
    tileHeight: number;  // mm
    jointWidth: number;  // mm
    tileDepth: number;   // mm
    wastage: number;     // percentage
    bagSize: number;     // kg per bag (default 5)
}

export interface GroutResult {
    kgNeeded: number;
    bagsNeeded: number;
    kgPerM2: number;
}

export interface SpacersInput {
    numberOfTiles: number;
    pattern: 'grid' | 'brick';
    wastage: number;     // percentage
}

export interface SpacersResult {
    spacersNeeded: number;
    spacersPerTile: number;
}
