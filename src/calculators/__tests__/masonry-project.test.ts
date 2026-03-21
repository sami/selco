import { describe, it, expect } from 'vitest';
import type { MaterialQuantity } from '../../types';
import { calculateMasonryProject } from '../masonry-project';

function sumMaterialQty(materials: MaterialQuantity[], nameFragment: string): number {
    return materials
        .filter(m => m.material.toLowerCase().includes(nameFragment.toLowerCase()))
        .reduce((sum, m) => sum + m.quantity, 0);
}

function countMaterialEntries(materials: MaterialQuantity[], nameFragment: string): number {
    return materials.filter(m => m.material.toLowerCase().includes(nameFragment.toLowerCase())).length;
}

// ---------------------------------------------------------------------------
// Scenario A — 6m × 1.8m brick wall, no openings
// ibstock-regent-68: 56 bricks/m²  →  ceil(10.8 × 56 × 1.05) = 636
// DPC: ceil(6/30) = 1 roll
// ---------------------------------------------------------------------------
describe('Scenario A — brick wall, no openings', () => {
    const result = calculateMasonryProject({
        wallAreaM2: 10.8,
        wallLengthM: 6,
        wallType: 'brick',
        brickProductId: 'ibstock-regent-68',
        sandProductId: 'building-sand-35kg',
        cementProductId: 'rugby-premium-opc-25',
        dpcProductId: 'dpc-polythene-100mm-30m',
        mixRatio: '1:3',
        wastagePercent: 5,
        includeDPC: true,
        includeAirBricks: false,
        openings: [],
    });

    it('A1: netAreaM2 = grossAreaM2 when no openings', () => {
        expect(result.netAreaM2).toBeCloseTo(10.8, 2);
        expect(result.grossAreaM2).toBeCloseTo(10.8, 2);
        expect(result.openingAreaM2).toBe(0);
        expect(result.totalOpenings).toBe(0);
    });

    it('A2: bricks = ceil(10.8 × 56 × 1.05) = 636', () => {
        expect(sumMaterialQty(result.materials, 'ibstock')).toBe(636);
    });

    it('A3: DPC = 1 entry for outer leaf (6m of DPC required)', () => {
        expect(countMaterialEntries(result.materials, 'dpc')).toBe(1);
        expect(sumMaterialQty(result.materials, 'dpc')).toBe(6);
    });
});

// ---------------------------------------------------------------------------
// Scenario B — 10m × 2.4m cavity wall (75mm), no openings
// Bricks: ceil(24 × 56 × 1.05) = 1412
// Blocks: ceil(24 × 10 × 1.05) = 252
// Wall ties: ceil(24 × 2.5) = 60
// DPC: 2 rolls total (one per leaf, each ceil(10/30)=1)
// Air bricks: ceil(10000/450) = 23
// ---------------------------------------------------------------------------
describe('Scenario B — cavity wall, no openings', () => {
    const result = calculateMasonryProject({
        wallAreaM2: 24,
        wallLengthM: 10,
        wallType: 'cavity',
        brickProductId: 'ibstock-regent-68',
        blockProductId: 'thermalite-shield-100',
        sandProductId: 'building-sand-35kg',
        cementProductId: 'rugby-premium-opc-25',
        dpcProductId: 'dpc-polythene-100mm-30m',
        mixRatio: '1:3',
        wastagePercent: 5,
        cavityWidthMm: 75,
        includeDPC: true,
        includeAirBricks: true,
        openings: [],
    });

    it('B1: bricks = ceil(24 × 56 × 1.05) = 1412', () => {
        expect(sumMaterialQty(result.materials, 'ibstock')).toBe(1412);
    });

    it('B2: blocks = ceil(24 × 10 × 1.05) = 252', () => {
        expect(sumMaterialQty(result.materials, 'block')).toBe(252);
    });

    it('B3: wall ties = ceil(24 × 2.5) = 60', () => {
        expect(sumMaterialQty(result.materials, 'wall tie')).toBe(60);
    });

    it('B4: DPC = 2 entries total (one per leaf, 10m each)', () => {
        expect(countMaterialEntries(result.materials, 'dpc')).toBe(2);
        expect(sumMaterialQty(result.materials, 'dpc')).toBe(20);
    });

    it('B5: air bricks = ceil(10000/450) = 23', () => {
        expect(sumMaterialQty(result.materials, 'air brick')).toBe(23);
    });
});

// ---------------------------------------------------------------------------
// Scenario C — 4m × 2.4m block wall, no openings
// Blocks: ceil(9.6 × 10 × 1.05) = 101
// No DPC, no air bricks
// ---------------------------------------------------------------------------
describe('Scenario C — block wall, no openings', () => {
    const result = calculateMasonryProject({
        wallAreaM2: 9.6,
        wallLengthM: 4,
        wallType: 'block',
        blockProductId: 'thermalite-shield-100',
        sandProductId: 'building-sand-35kg',
        cementProductId: 'rugby-premium-opc-25',
        mixRatio: '1:3',
        wastagePercent: 5,
        includeDPC: false,
        includeAirBricks: false,
        openings: [],
    });

    it('C1: blocks = ceil(9.6 × 10 × 1.05) = 101', () => {
        expect(sumMaterialQty(result.materials, 'block')).toBe(101);
    });

    it('C2: no DPC materials', () => {
        expect(countMaterialEntries(result.materials, 'dpc')).toBe(0);
    });

    it('C3: no air brick materials', () => {
        expect(countMaterialEntries(result.materials, 'air brick')).toBe(0);
    });
});

// ---------------------------------------------------------------------------
// Scenario D — 10m × 2.4m cavity (75mm), 2 × 1200×1200 openings
// openingAreaM2 = 2 × (1.2 × 1.2) = 2.88
// netAreaM2 = 24 − 2.88 = 21.12
// Bricks: ceil(21.12 × 56 × 1.05) = 1242
// Blocks: ceil(21.12 × 10 × 1.05) = 222
// Wall ties: ceil(24 × 2.5) = 60 (GROSS area)
// DPC: 2 rolls, Air bricks: 23
// Per opening: 1 steel lintel, 2 padstones, 2 cavity closers, 1 tray
// Totals: 2 lintels, 4 padstones, 4 closers, 2 trays
// ---------------------------------------------------------------------------
describe('Scenario D — cavity wall, 2 × 1200×1200 openings', () => {
    const result = calculateMasonryProject({
        wallAreaM2: 24,
        wallLengthM: 10,
        wallType: 'cavity',
        brickProductId: 'ibstock-regent-68',
        blockProductId: 'thermalite-shield-100',
        sandProductId: 'building-sand-35kg',
        cementProductId: 'rugby-premium-opc-25',
        dpcProductId: 'dpc-polythene-100mm-30m',
        steelLintelProductId: 'ig-l1-s75-cavity',
        padstoneProductId: 'supreme-padstone-215x140x102',
        cavityCloserProductId: 'multicor-closer-50-100',
        cavityTrayProductId: 'manthorpe-type-e',
        mixRatio: '1:3',
        wastagePercent: 5,
        cavityWidthMm: 75,
        includeDPC: true,
        includeAirBricks: true,
        openings: [
            { widthMm: 1200, heightMm: 1200 },
            { widthMm: 1200, heightMm: 1200 },
        ],
    });

    it('D1: openingAreaM2 = 2.88, netAreaM2 = 21.12', () => {
        expect(result.openingAreaM2).toBeCloseTo(2.88, 3);
        expect(result.netAreaM2).toBeCloseTo(21.12, 2);
        expect(result.totalOpenings).toBe(2);
    });

    it('D2: bricks = ceil(21.12 × 56 × 1.05) = 1242', () => {
        expect(sumMaterialQty(result.materials, 'ibstock')).toBe(1242);
    });

    it('D3: blocks = ceil(21.12 × 10 × 1.05) = 222', () => {
        expect(sumMaterialQty(result.materials, 'block')).toBe(222);
    });

    it('D4: wall ties use GROSS area = ceil(24 × 2.5) = 60', () => {
        expect(sumMaterialQty(result.materials, 'wall tie')).toBe(60);
    });

    it('D5: 2 lintels (one per opening)', () => {
        expect(sumMaterialQty(result.materials, 'lintel')).toBe(2);
    });

    it('D6: 4 padstones (2 per opening)', () => {
        expect(sumMaterialQty(result.materials, 'padstone')).toBe(4);
    });

    it('D7: 4 cavity closers total (2 per opening)', () => {
        expect(sumMaterialQty(result.materials, 'closer')).toBe(4);
    });

    it('D8: 2 cavity trays (1 per opening)', () => {
        expect(sumMaterialQty(result.materials, 'tray')).toBe(2);
    });
});
