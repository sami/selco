import type {
    BrickProduct, BlockProduct, CementProduct, SandProduct,
    WallTieProduct, DPCProduct, ConcreteLintelProduct, SteelLintelProduct,
    PadstoneProduct, CavityCloserProduct, CavityTrayProduct,
    WallStarterProduct,
} from '../calculators/types';

/**
 * Selco-stocked masonry products — product catalogue.
 *
 * B1–B8 data verified against selcobw.com — 18 March 2026.
 * B9–B13 lintel/closer/tray data scraped — 20 March 2026.
 * `lastVerified` records the date each entry was last audited.
 */

// ---------------------------------------------------------------------------
// B1 — Bricks (3 products — one per standard UK height)
// ---------------------------------------------------------------------------

export const BRICK_PRODUCTS: BrickProduct[] = [
    {
        id: 'lbc-london-brick-65',
        name: 'London Brick 65mm',
        brand: 'LBC',
        heightMm: 65,
        lengthMm: 215,
        widthMm: 102.5,
        bricksPerM2: 60,
        packSize: 400,
        tdsUrl: 'https://www.lbc.co.uk/products',
        lastVerified: '2026-03-18',
    },
    {
        id: 'ibstock-regent-68',
        name: 'Regent Imperial 68mm',
        brand: 'Ibstock',
        heightMm: 68,
        lengthMm: 215,
        widthMm: 102.5,
        bricksPerM2: 56,
        packSize: 400,
        tdsUrl: 'https://www.ibstock.co.uk/products',
        lastVerified: '2026-03-18',
    },
    {
        id: 'wienerberger-piatraforte-73',
        name: 'Piatraforte 73mm',
        brand: 'Wienerberger',
        heightMm: 73,
        lengthMm: 215,
        widthMm: 102.5,
        bricksPerM2: 50,
        packSize: 400,
        tdsUrl: 'https://www.wienerberger.co.uk/products',
        lastVerified: '2026-03-18',
    },
];

// ---------------------------------------------------------------------------
// B2 — Blocks (4 products — 100/215mm aerated, 100/140mm dense)
// ---------------------------------------------------------------------------

export const BLOCK_PRODUCTS: BlockProduct[] = [
    {
        id: 'thermalite-shield-100',
        name: 'Shield Aerated Block 100mm',
        brand: 'Thermalite',
        faceLengthMm: 440,
        faceHeightMm: 215,
        thicknessMm: 100,
        strengthNPerMm2: 3.6,
        blocksPerM2: 10,
        tdsUrl: 'https://www.thermalite.co.uk/products/shield',
        lastVerified: '2026-03-18',
    },
    {
        id: 'thermalite-shield-215',
        name: 'Shield Aerated Block 215mm',
        brand: 'Thermalite',
        faceLengthMm: 440,
        faceHeightMm: 215,
        thicknessMm: 215,
        strengthNPerMm2: 3.6,
        blocksPerM2: 10,
        tdsUrl: 'https://www.thermalite.co.uk/products/shield',
        lastVerified: '2026-03-21',
    },
    {
        id: 'dense-concrete-block-100',
        name: 'Dense Concrete Block 100mm 7N',
        brand: 'Generic Dense',
        faceLengthMm: 440,
        faceHeightMm: 215,
        thicknessMm: 100,
        strengthNPerMm2: 7.0,
        blocksPerM2: 10,
        lastVerified: '2026-03-18',
    },
    {
        id: 'dense-concrete-block-140',
        name: 'Dense Concrete Block 140mm 7.3N',
        brand: 'Generic Dense',
        faceLengthMm: 440,
        faceHeightMm: 215,
        thicknessMm: 140,
        strengthNPerMm2: 7.3,
        blocksPerM2: 10,
        lastVerified: '2026-03-18',
    },
];

// ---------------------------------------------------------------------------
// B3 — Sand (3 products — building large, building jumbo, sharp large)
// ---------------------------------------------------------------------------

export const SAND_PRODUCTS: SandProduct[] = [
    {
        id: 'building-sand-35kg',
        name: 'Building Sand Large Bag',
        packSizeKg: 35,
        type: 'building',
        lastVerified: '2026-03-18',
    },
    {
        id: 'building-sand-875kg',
        name: 'Building Sand Jumbo Bag',
        packSizeKg: 875,
        type: 'building',
        lastVerified: '2026-03-18',
    },
    {
        id: 'sharp-sand-35kg',
        name: 'Sharp Sand Large Bag',
        packSizeKg: 35,
        type: 'sharp',
        lastVerified: '2026-03-18',
    },
];

// ---------------------------------------------------------------------------
// B4 — Cement (4 products — 2 OPC + 2 pre-mixed)
// ---------------------------------------------------------------------------

export const CEMENT_PRODUCTS: CementProduct[] = [
    {
        id: 'rugby-premium-opc-25',
        name: 'Rugby Premium OPC',
        brand: 'Rugby',
        bagSizeKg: 25,
        type: 'opc',
        lastVerified: '2026-03-18',
    },
    {
        id: 'blue-circle-opc-25',
        name: 'Blue Circle OPC',
        brand: 'Blue Circle',
        bagSizeKg: 25,
        type: 'opc',
        lastVerified: '2026-03-18',
    },
    {
        id: 'carlton-mortar-mix-20',
        name: 'Carlton Mortar Mix',
        brand: 'Carlton',
        bagSizeKg: 20,
        type: 'pre-mixed',
        lastVerified: '2026-03-18',
    },
    {
        id: 'jetcem-premix-6',
        name: 'Jetcem Pre-Mixed Mortar',
        brand: 'Jetcem',
        bagSizeKg: 6,
        type: 'pre-mixed',
        lastVerified: '2026-03-18',
    },
];

// ---------------------------------------------------------------------------
// B5 — Wall ties (4 products — one per BS EN 1243 cavity range)
// ---------------------------------------------------------------------------

export const WALL_TIE_PRODUCTS: WallTieProduct[] = [
    {
        id: 'wall-tie-200-50-75',
        name: 'Type 4 Light Duty Wall Tie 200mm',
        tieLengthMm: 200,
        minCavityMm: 50,
        maxCavityMm: 75,
        type: 'type-4-light',
        packSizes: [50, 250],
        primaryPackSize: 250,
        lastVerified: '2026-03-18',
    },
    {
        id: 'wall-tie-225-75-100',
        name: 'Type 2 GP Wall Tie 225mm',
        tieLengthMm: 225,
        minCavityMm: 75,
        maxCavityMm: 100,
        type: 'type-2-gp',
        packSizes: [50, 250],
        primaryPackSize: 250,
        lastVerified: '2026-03-18',
    },
    {
        id: 'wall-tie-250-100-125',
        name: 'Type 2 GP Wall Tie 250mm',
        tieLengthMm: 250,
        minCavityMm: 100,
        maxCavityMm: 125,
        type: 'type-2-gp',
        packSizes: [50, 250],
        primaryPackSize: 250,
        lastVerified: '2026-03-18',
    },
    {
        id: 'wall-tie-275-125-150',
        name: 'Type 2 GP Wall Tie 275mm',
        tieLengthMm: 275,
        minCavityMm: 125,
        maxCavityMm: 150,
        type: 'type-2-gp',
        packSizes: [50, 250],
        primaryPackSize: 250,
        lastVerified: '2026-03-18',
    },
];

// ---------------------------------------------------------------------------
// B6 — DPC (4 products — 4 common widths, all 30m rolls)
// ---------------------------------------------------------------------------

export const DPC_PRODUCTS: DPCProduct[] = [
    {
        id: 'dpc-polythene-100mm-30m',
        name: 'DPC Polythene 100mm × 30m',
        widthMm: 100,
        rollLengthM: 30,
        material: 'polythene',
        lastVerified: '2026-03-18',
    },
    {
        id: 'dpc-polythene-112mm-30m',
        name: 'DPC Polythene 112mm × 30m',
        widthMm: 112,
        rollLengthM: 30,
        material: 'polythene',
        lastVerified: '2026-03-18',
    },
    {
        id: 'dpc-polythene-150mm-30m',
        name: 'DPC Polythene 150mm × 30m',
        widthMm: 150,
        rollLengthM: 30,
        material: 'polythene',
        lastVerified: '2026-03-18',
    },
    {
        id: 'dpc-polythene-225mm-30m',
        name: 'DPC Polythene 225mm × 30m',
        widthMm: 225,
        rollLengthM: 30,
        material: 'polythene',
        lastVerified: '2026-03-18',
    },
];

// ---------------------------------------------------------------------------
// B9 — Concrete lintels (3 products — Supreme, 100/140/215mm width)
// ---------------------------------------------------------------------------

const CONCRETE_LINTEL_LENGTHS = [600, 900, 1200, 1500, 1800, 2100, 2400, 2700, 3000];

export const CONCRETE_LINTEL_PRODUCTS: ConcreteLintelProduct[] = [
    {
        id: 'supreme-concrete-lintel-100',
        name: 'Supreme Prestressed Concrete Lintel 100mm',
        brand: 'Supreme',
        widthMm: 100,
        availableLengthsMm: CONCRETE_LINTEL_LENGTHS,
        minBearingMm: 150,
        wallType: 'single-leaf',
        tdsUrl: 'https://www.selcobw.com/products/building-materials/lintels/concrete-lintels',
        lastVerified: '2026-03-20',
    },
    {
        id: 'supreme-concrete-lintel-140',
        name: 'Supreme Prestressed Concrete Lintel 140mm',
        brand: 'Supreme',
        widthMm: 140,
        availableLengthsMm: CONCRETE_LINTEL_LENGTHS,
        minBearingMm: 150,
        wallType: 'single-leaf',
        tdsUrl: 'https://www.selcobw.com/products/building-materials/lintels/concrete-lintels',
        lastVerified: '2026-03-20',
    },
    {
        id: 'supreme-concrete-lintel-215',
        name: 'Supreme Prestressed Concrete Lintel 215mm',
        brand: 'Supreme',
        widthMm: 215,
        availableLengthsMm: CONCRETE_LINTEL_LENGTHS,
        minBearingMm: 150,
        wallType: 'solid',
        tdsUrl: 'https://www.selcobw.com/products/building-materials/lintels/concrete-lintels',
        lastVerified: '2026-03-20',
    },
];

// ---------------------------------------------------------------------------
// B10 — Steel lintels (5 products — IG brand)
// ---------------------------------------------------------------------------

export const STEEL_LINTEL_PRODUCTS: SteelLintelProduct[] = [
    {
        id: 'ig-single-leaf-internal-100',
        name: 'Single Leaf Internal Lintel 100mm',
        brand: 'IG',
        model: 'SL100',
        lintelType: 'single-leaf-internal',
        minBearingMm: 150,
        tdsUrl: 'https://www.selcobw.com/products/building-materials/lintels/steel-lintels',
        lastVerified: '2026-03-20',
    },
    {
        id: 'ig-l10-single-leaf-external',
        name: 'L10 Single Leaf External Lintel',
        brand: 'IG',
        model: 'L10',
        lintelType: 'single-leaf-external',
        minBearingMm: 150,
        tdsUrl: 'https://www.selcobw.com/products/building-materials/lintels/steel-lintels',
        lastVerified: '2026-03-20',
    },
    {
        id: 'ig-l9-solid-wall-external',
        name: 'L9 Solid Wall External Lintel',
        brand: 'IG',
        model: 'L9',
        lintelType: 'solid-wall-external',
        minBearingMm: 150,
        tdsUrl: 'https://www.selcobw.com/products/building-materials/lintels/steel-lintels',
        lastVerified: '2026-03-20',
    },
    {
        id: 'ig-l1-s75-cavity',
        name: 'L1/S75 Standard Cavity Lintel',
        brand: 'IG',
        model: 'L1/S75',
        lintelType: 'cavity',
        cavityWidthMm: 75,
        minBearingMm: 150,
        tdsUrl: 'https://www.selcobw.com/products/building-materials/lintels/steel-lintels',
        lastVerified: '2026-03-20',
    },
    {
        id: 'ig-l1-s100-cavity',
        name: 'L1/S100 Standard Cavity Lintel',
        brand: 'IG',
        model: 'L1/S100',
        lintelType: 'cavity',
        cavityWidthMm: 100,
        minBearingMm: 150,
        tdsUrl: 'https://www.selcobw.com/products/building-materials/lintels/steel-lintels',
        lastVerified: '2026-03-20',
    },
];

// ---------------------------------------------------------------------------
// B11 — Padstones (4 products — Supreme precast concrete)
// ---------------------------------------------------------------------------

export const PADSTONE_PRODUCTS: PadstoneProduct[] = [
    {
        id: 'supreme-padstone-215x140x102',
        name: 'Padstone 215 × 140 × 102mm',
        brand: 'Supreme',
        lengthMm: 215,
        widthMm: 140,
        heightMm: 102,
        tdsUrl: 'https://www.selcobw.com/products/building-materials/lintels/padstones',
        lastVerified: '2026-03-20',
    },
    {
        id: 'supreme-padstone-300x140x102',
        name: 'Padstone 300 × 140 × 102mm',
        brand: 'Supreme',
        lengthMm: 300,
        widthMm: 140,
        heightMm: 102,
        tdsUrl: 'https://www.selcobw.com/products/building-materials/lintels/padstones',
        lastVerified: '2026-03-20',
    },
    {
        id: 'supreme-padstone-440x140x102',
        name: 'Padstone 440 × 140 × 102mm',
        brand: 'Supreme',
        lengthMm: 440,
        widthMm: 140,
        heightMm: 102,
        tdsUrl: 'https://www.selcobw.com/products/building-materials/lintels/padstones',
        lastVerified: '2026-03-20',
    },
    {
        id: 'supreme-padstone-440x215x102',
        name: 'Padstone 440 × 215 × 102mm',
        brand: 'Supreme',
        lengthMm: 440,
        widthMm: 215,
        heightMm: 102,
        tdsUrl: 'https://www.selcobw.com/products/building-materials/lintels/padstones',
        lastVerified: '2026-03-20',
    },
];

// ---------------------------------------------------------------------------
// B12 — Cavity closers (2 products — Multicor insulated uPVC)
// ---------------------------------------------------------------------------

export const CAVITY_CLOSER_PRODUCTS: CavityCloserProduct[] = [
    {
        id: 'multicor-closer-50-100',
        name: 'Multicor Insulated Cavity Closer 50-100mm',
        brand: 'Multicor',
        minCavityMm: 50,
        maxCavityMm: 100,
        lengthM: 2.44,
        tdsUrl: 'https://www.selcobw.com/products/building-materials/lintels/cavity-trays-closers',
        lastVerified: '2026-03-20',
    },
    {
        id: 'multicor-closer-150',
        name: 'Multicor Insulated Cavity Closer 150mm',
        brand: 'Multicor',
        minCavityMm: 150,
        maxCavityMm: 150,
        lengthM: 2.4,
        tdsUrl: 'https://www.selcobw.com/products/building-materials/lintels/cavity-trays-closers',
        lastVerified: '2026-03-20',
    },
];

// ---------------------------------------------------------------------------
// B13 — Cavity trays (3 products — Manthorpe/Advantage)
// ---------------------------------------------------------------------------

export const CAVITY_TRAY_PRODUCTS: CavityTrayProduct[] = [
    {
        id: 'manthorpe-type-e',
        name: 'Type E Cavity Tray',
        brand: 'Manthorpe',
        trayType: 'type-e',
        tdsUrl: 'https://www.selcobw.com/products/building-materials/lintels/cavity-trays-closers',
        lastVerified: '2026-03-20',
    },
    {
        id: 'advantage-intermediate-left',
        name: 'Intermediate Cavity Tray Left Handed',
        brand: 'Advantage',
        trayType: 'intermediate-left',
        tdsUrl: 'https://www.selcobw.com/products/building-materials/lintels/cavity-trays-closers',
        lastVerified: '2026-03-20',
    },
    {
        id: 'advantage-catchment-left',
        name: 'Catchment Cavity Tray Left Handed',
        brand: 'Advantage',
        trayType: 'catchment-left',
        tdsUrl: 'https://www.selcobw.com/products/building-materials/lintels/cavity-trays-closers',
        lastVerified: '2026-03-20',
    },
];

// ---------------------------------------------------------------------------
// B7 — Wall Starters (1 product — Universal sliding-tie channel kit)
// ---------------------------------------------------------------------------

export const WALL_STARTER_PRODUCTS: WallStarterProduct[] = [
    {
        id: 'universal-wall-starter-kit-2-4m',
        name: 'Universal Wall Starter Kit 2.4m',
        brand: 'Universal',
        lengthM: 2.4,
        lastVerified: '2026-03-21',
    },
];
