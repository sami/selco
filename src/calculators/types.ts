/**
 * @file src/calculators/types.ts
 *
 * Shared type definitions for masonry product catalogues and calculator I/O.
 * Imported by src/data/masonry-products.ts and (later) by the masonry engine
 * for pack-rounding.
 */

// ---------------------------------------------------------------------------
// B1 — Bricks
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// B2 — Blocks
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// B3 — Sand
// ---------------------------------------------------------------------------

export interface SandProduct {
  id: string;
  name: string;
  packSizeKg: number;
  type: 'building' | 'sharp';
  lastVerified: string;
}

// ---------------------------------------------------------------------------
// B4 — Cement
// ---------------------------------------------------------------------------

export interface CementProduct {
  id: string;
  name: string;
  brand: string;
  bagSizeKg: number;
  type: 'opc' | 'pre-mixed';
  lastVerified: string;
}

// ---------------------------------------------------------------------------
// B5 — Wall ties
// ---------------------------------------------------------------------------

export interface WallTieProduct {
  id: string;
  name: string;
  tieLengthMm: number;
  minCavityMm: number;
  maxCavityMm: number;
  type: 'type-4-light' | 'type-2-gp';
  packSizes: number[];
  primaryPackSize: number;
  lastVerified: string;
}

// ---------------------------------------------------------------------------
// B6 — DPC (damp-proof course)
// ---------------------------------------------------------------------------

export interface DPCProduct {
  id: string;
  name: string;
  widthMm: number;
  rollLengthM: number;
  material: 'polythene';
  lastVerified: string;
}

// ---------------------------------------------------------------------------
// B9 — Concrete lintels
// ---------------------------------------------------------------------------

export interface ConcreteLintelProduct {
  id: string;
  name: string;
  brand: string;
  widthMm: number;
  availableLengthsMm: number[];
  minBearingMm: number;
  wallType: 'single-leaf' | 'solid';
  tdsUrl: string;
  lastVerified: string;
}

// ---------------------------------------------------------------------------
// B10 — Steel lintels
// ---------------------------------------------------------------------------

export interface SteelLintelProduct {
  id: string;
  name: string;
  brand: string;
  model: string;
  lintelType: 'single-leaf-internal' | 'single-leaf-external' | 'solid-wall-external' | 'cavity';
  cavityWidthMm?: number;
  minBearingMm: number;
  tdsUrl: string;
  lastVerified: string;
}

// ---------------------------------------------------------------------------
// B11 — Padstones
// ---------------------------------------------------------------------------

export interface PadstoneProduct {
  id: string;
  name: string;
  brand: string;
  lengthMm: number;
  widthMm: number;
  heightMm: number;
  tdsUrl: string;
  lastVerified: string;
}

// ---------------------------------------------------------------------------
// B12 — Cavity closers
// ---------------------------------------------------------------------------

export interface CavityCloserProduct {
  id: string;
  name: string;
  brand: string;
  minCavityMm: number;
  maxCavityMm: number;
  lengthM: number;
  tdsUrl: string;
  lastVerified: string;
}

// ---------------------------------------------------------------------------
// B13 — Cavity trays
// ---------------------------------------------------------------------------

export interface CavityTrayProduct {
  id: string;
  name: string;
  brand: string;
  trayType: 'type-e' | 'intermediate-left' | 'catchment-left';
  tdsUrl: string;
  lastVerified: string;
}

// ---------------------------------------------------------------------------
// B7 — Wall starters
// ---------------------------------------------------------------------------

export interface WallStarterProduct {
  id: string;
  name: string;
  brand: string;
  lengthM: number;
  lastVerified: string;
}
