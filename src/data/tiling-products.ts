import type {
    AdhesiveProduct, GroutProduct, SpacerProduct,
    BackerBoardProduct, TankingProduct, SLCProduct, PrimerProduct,
} from '../calculators/types';

/**
 * Selco-stocked tiling products — product catalogue.
 *
 * All data verified against selcobw.com and manufacturer TDS — 18 March 2026.
 * `lastVerified` records the date each product entry was last audited.
 *
 * coverageRates (adhesives) in kg/m²:
 *   wall-dry  = dry internal wall, tile ≤ 300mm (lower rate)
 *   wall-wet  = shower/wet room wall
 *   floor-dry = internal floor (higher rate)
 *   floor-wet = wet room floor or exterior (highest rate)
 *   exterior  = outdoor / frost-rated
 */

// ---------------------------------------------------------------------------
// Adhesives — 5 Mapei + 8 Dunlop = 13 products
// ---------------------------------------------------------------------------

export const ADHESIVE_PRODUCTS: AdhesiveProduct[] = [
    // -----------------------------------------------------------------------
    // MAPEI (5 products)
    // -----------------------------------------------------------------------
    {
        id: 'mapei-keraflex-maxi-s1',
        name: 'Keraflex Maxi S1',
        brand: 'Mapei',
        enClass: 'C2TES1',
        bagSizeKg: 20,
        coverageRates: { 'wall-dry': 4, 'wall-wet': 6, 'floor-dry': 6, 'floor-wet': 7, exterior: 7 },
        perMmBedDepthKg: 1.2,
        tdsUrl: 'https://www.mapei.com/gb/en/products-and-solutions/products/gluing/adhesives/cementitious-adhesives/keraflex-maxi-s1',
        lastVerified: '2026-03-18',
    },
    {
        id: 'mapei-adesilex-p9',
        name: 'Adesilex P9',
        brand: 'Mapei',
        enClass: 'C2TE',
        bagSizeKg: 20,
        coverageRates: { 'wall-dry': 2.5, 'wall-wet': 3, 'floor-dry': 4, 'floor-wet': 4, exterior: 4 },
        tdsUrl: 'https://www.mapei.com/gb/en/products-and-solutions/products/gluing/adhesives/cementitious-adhesives/adesilex-p9',
        lastVerified: '2026-03-18',
    },
    {
        id: 'mapei-standard-set-plus',
        name: 'Standard Set Plus',
        brand: 'Mapei',
        enClass: 'C2TE',
        bagSizeKg: 20,
        coverageRates: { 'wall-dry': 2.5, 'wall-wet': 3, 'floor-dry': 4, 'floor-wet': 4, exterior: 4 },
        tdsUrl: 'https://www.mapei.com/gb/en/products-and-solutions/products/gluing/adhesives/cementitious-adhesives/standard-set-plus',
        lastVerified: '2026-03-18',
    },
    {
        id: 'mapei-fast-set-plus',
        name: 'Fast Set Plus',
        brand: 'Mapei',
        enClass: 'C1F',
        bagSizeKg: 20,
        coverageRates: { 'wall-dry': 2.5, 'wall-wet': 4, 'floor-dry': 4, 'floor-wet': 5, exterior: 5 },
        maxTileMm: 330,
        tdsUrl: 'https://www.mapei.com/gb/en/products-and-solutions/products/gluing/adhesives/cementitious-adhesives/fast-set-plus',
        lastVerified: '2026-03-18',
    },
    {
        id: 'mapei-ultralite-d2',
        name: 'Ultralite D2',
        brand: 'Mapei',
        enClass: 'D2TE',
        bagSizeKg: 12.5,
        coverageRates: {
            'wall-dry': 1.04,
            'wall-wet': 1.56,
            'floor-dry': 1.56,
            'floor-wet': 1.56,
            exterior: 1.56,
        },
        maxTileMm: 350,
        restrictions: ['internal-walls-only'],
        tdsUrl: 'https://www.mapei.com/gb/en/products-and-solutions/products/gluing/adhesives/dispersion-adhesives/ultralite-d2',
        lastVerified: '2026-03-18',
    },

    // -----------------------------------------------------------------------
    // DUNLOP (8 products)
    // -----------------------------------------------------------------------
    {
        id: 'dunlop-cx24',
        name: 'CX-24 Essential',
        brand: 'Dunlop',
        enClass: 'C1T',
        bagSizeKg: 20,
        coverageRates: { 'wall-dry': 2, 'wall-wet': 3.5, 'floor-dry': 3.5, 'floor-wet': 3.5, exterior: 3.5 },
        tdsUrl: 'https://www.dunloptrade.com/products/cx-24-essential',
        lastVerified: '2026-03-18',
    },
    {
        id: 'dunlop-cf24',
        name: 'CF-24 Flexible',
        brand: 'Dunlop',
        enClass: 'C2TE',
        bagSizeKg: 20,
        coverageRates: { 'wall-dry': 2, 'wall-wet': 4, 'floor-dry': 4, 'floor-wet': 4, exterior: 4 },
        tdsUrl: 'https://www.dunloptrade.com/products/cf-24-flexible',
        lastVerified: '2026-03-18',
    },
    {
        id: 'dunlop-cf03',
        name: 'CF-03 Flexible Fast Set',
        brand: 'Dunlop',
        enClass: 'C2F',
        bagSizeKg: 20,
        coverageRates: { 'wall-dry': 2, 'wall-wet': 4, 'floor-dry': 4, 'floor-wet': 4, exterior: 4 },
        tdsUrl: 'https://www.dunloptrade.com/products/cf-03-flexible-fast-set',
        lastVerified: '2026-03-18',
    },
    {
        id: 'dunlop-cx03',
        name: 'CX-03 Fast Set',
        brand: 'Dunlop',
        enClass: 'C1F',
        bagSizeKg: 20,
        coverageRates: { 'wall-dry': 2, 'wall-wet': 3.5, 'floor-dry': 3.5, 'floor-wet': 3.5, exterior: 3.5 },
        tdsUrl: 'https://www.dunloptrade.com/products/cx-03-fast-set',
        lastVerified: '2026-03-18',
    },
    {
        id: 'dunlop-cs1-12',
        name: 'CS1-12 S1 Ultra Flexible',
        brand: 'Dunlop',
        enClass: 'C2TES1',
        bagSizeKg: 20,
        coverageRates: { 'wall-dry': 2, 'wall-wet': 4, 'floor-dry': 4, 'floor-wet': 4, exterior: 4 },
        tdsUrl: 'https://www.dunloptrade.com/products/cs1-12-ultra-flexible',
        lastVerified: '2026-03-18',
    },
    {
        id: 'dunlop-rx3000',
        name: 'RX-3000 Waterproof Wall',
        brand: 'Dunlop',
        enClass: 'D2TE',
        bagSizeKg: 15,
        coverageRates: { 'wall-dry': 2, 'wall-wet': 3, 'floor-dry': 3, 'floor-wet': 3, exterior: 3 },
        maxTileMm: 300,
        restrictions: ['walls-only'],
        tdsUrl: 'https://www.dunloptrade.com/products/rx-3000-waterproof',
        lastVerified: '2026-03-18',
    },
    {
        id: 'dunlop-rx2000',
        name: 'RX-2000 Showerproof Wall',
        brand: 'Dunlop',
        enClass: 'D1TE',
        bagSizeKg: 15,
        coverageRates: { 'wall-dry': 2, 'wall-wet': 3, 'floor-dry': 3, 'floor-wet': 3, exterior: 3 },
        maxTileMm: 300,
        restrictions: ['walls-only'],
        tdsUrl: 'https://www.dunloptrade.com/products/rx-2000-showerproof',
        lastVerified: '2026-03-18',
    },
    {
        id: 'dunlop-rx1000',
        name: 'RX-1000 Non-Slip Wall',
        brand: 'Dunlop',
        enClass: 'D1T',
        bagSizeKg: 15,
        coverageRates: { 'wall-dry': 2, 'wall-wet': 3, 'floor-dry': 3, 'floor-wet': 3, exterior: 3 },
        maxTileMm: 300,
        restrictions: ['walls-only'],
        tdsUrl: 'https://www.dunloptrade.com/products/rx-1000-non-slip',
        lastVerified: '2026-03-18',
    },
];

// ---------------------------------------------------------------------------
// Grout — 2 Mapei + 2 Dunlop = 4 products
// ---------------------------------------------------------------------------

export const GROUT_PRODUCTS: GroutProduct[] = [
    {
        id: 'mapei-ultracolor-plus',
        name: 'Ultracolor Plus',
        brand: 'Mapei',
        enClass: 'CG2FWA',
        densityFactor: 1.6,
        minJointMm: 1,
        maxJointMm: 20,
        bagSizes: [2, 5, 23],
        primaryBagSizeKg: 5,
        tdsUrl: 'https://www.mapei.com/gb/en/products-and-solutions/products/grouting/cementitious-grouts/ultracolor-plus',
        lastVerified: '2026-03-18',
    },
    {
        id: 'mapei-flexible-wall-floor-grout',
        name: 'Flexible Wall and Floor Grout',
        brand: 'Mapei',
        enClass: 'CG2WA',
        densityFactor: 1.6,
        minJointMm: 1,
        maxJointMm: 6,
        bagSizes: [2.5],
        primaryBagSizeKg: 2.5,
        tdsUrl: 'https://www.mapei.com/gb/en/products-and-solutions/products/grouting/cementitious-grouts/flexible-wall-and-floor-grout',
        lastVerified: '2026-03-18',
    },
    {
        id: 'dunlop-gx500',
        name: 'GX-500 Flexible Grout',
        brand: 'Dunlop',
        enClass: 'CG2',
        densityFactor: 1.7,
        minJointMm: 2,
        maxJointMm: 12,
        bagSizes: [3.5],
        primaryBagSizeKg: 3.5,
        tdsUrl: 'https://www.dunloptrade.com/products/gx-500-flexible-grout',
        lastVerified: '2026-03-18',
    },
    {
        id: 'dunlop-wall-tile-grout',
        name: 'Wall Tile Grout',
        brand: 'Dunlop',
        enClass: 'CG1',
        densityFactor: 1.7,
        minJointMm: 1,
        maxJointMm: 3,
        bagSizes: [3.5, 10],
        primaryBagSizeKg: 3.5,
        restrictions: ['walls-only'],
        tdsUrl: 'https://www.dunloptrade.com/products/wall-tile-grout',
        lastVerified: '2026-03-18',
    },
];

// ---------------------------------------------------------------------------
// Spacers — 4 sizes with pack variants
// ---------------------------------------------------------------------------

export const SPACER_PRODUCTS: SpacerProduct[] = [
    { id: 'spacer-1mm', sizeMm: 1, packSizes: [{ quantity: 500,  packType: 'bag' }] },
    { id: 'spacer-2mm', sizeMm: 2, packSizes: [{ quantity: 250,  packType: 'bag' }, { quantity: 1000, packType: 'hollow' }, { quantity: 1500, packType: 'bag' }] },
    { id: 'spacer-3mm', sizeMm: 3, packSizes: [{ quantity: 100,  packType: 'floor' }, { quantity: 250, packType: 'bag' }, { quantity: 1500, packType: 'bag' }] },
    { id: 'spacer-5mm', sizeMm: 5, packSizes: [{ quantity: 250,  packType: 'bag' }] },
];

// ---------------------------------------------------------------------------
// Backer board — 2 HardieBacker + 2 Jackoboard + 2 Flexel = 6 products
// ---------------------------------------------------------------------------

export const BACKER_BOARD_PRODUCTS: BackerBoardProduct[] = [
    {
        id: 'hardiebacker-6mm',
        name: 'HardieBacker 6mm',
        brand: 'James Hardie',
        boardLengthMm: 1200,
        boardWidthMm: 800,
        thicknessMm: 6,
        maxTileWeightKgM2: 200,
        tdsUrl: 'https://www.jameshardie.co.uk/products/hardiebacker',
        lastVerified: '2026-03-18',
    },
    {
        id: 'hardiebacker-12mm',
        name: 'HardieBacker 12mm',
        brand: 'James Hardie',
        boardLengthMm: 1200,
        boardWidthMm: 800,
        thicknessMm: 12,
        maxTileWeightKgM2: 200,
        tdsUrl: 'https://www.jameshardie.co.uk/products/hardiebacker',
        lastVerified: '2026-03-18',
    },
    {
        id: 'jackoboard-plano-6mm',
        name: 'Jackoboard Plano 6mm',
        brand: 'Jackon',
        boardLengthMm: 1200,
        boardWidthMm: 600,
        thicknessMm: 6,
        maxTileWeightKgM2: 100,
        tdsUrl: 'https://www.jackon.com/products/jackoboard-plano/',
        lastVerified: '2026-03-18',
    },
    {
        id: 'jackoboard-plano-12mm',
        name: 'Jackoboard Plano 12mm',
        brand: 'Jackon',
        boardLengthMm: 1200,
        boardWidthMm: 600,
        thicknessMm: 12,
        maxTileWeightKgM2: 100,
        tdsUrl: 'https://www.jackon.com/products/jackoboard-plano/',
        lastVerified: '2026-03-18',
    },
    {
        id: 'flexel-ecomax-6mm',
        name: 'Flexel ECOMAX 6mm',
        brand: 'Flexel',
        boardLengthMm: 1200,
        boardWidthMm: 600,
        thicknessMm: 6,
        boardsPerPack: 6,
        notes: ['Do NOT mechanically fix — bond only'],
        tdsUrl: 'https://www.flexeluk.co.uk/product/ecomax-tile-backer-board/',
        lastVerified: '2026-03-18',
    },
    {
        id: 'flexel-ecomax-10mm',
        name: 'Flexel ECOMAX 10mm',
        brand: 'Flexel',
        boardLengthMm: 1200,
        boardWidthMm: 600,
        thicknessMm: 10,
        boardsPerPack: 6,
        notes: ['Do NOT mechanically fix — bond only'],
        tdsUrl: 'https://www.flexeluk.co.uk/product/ecomax-tile-backer-board/',
        lastVerified: '2026-03-18',
    },
];

// ---------------------------------------------------------------------------
// Tanking / waterproof membrane — 1 Mapei + 1 Dunlop = 2 kits
// ---------------------------------------------------------------------------

export const TANKING_PRODUCTS: TankingProduct[] = [
    {
        id: 'mapei-mapegum-wps',
        name: 'Mapegum WPS Kit',
        brand: 'Mapei',
        coverageM2PerKit: 4,
        coats: 2,
        dryTimeHours: 2,
        kitContentsDescription: 'Primer 0.5kg + membrane 5kg + tape 10m',
        notes: ['2 coats required', 'Allow 2h between coats', 'Tile after 12–24h'],
        tdsUrl: 'https://www.mapei.com/gb/en/products-and-solutions/products/waterproofing/waterproofing-membranes/mapegum-wps',
        lastVerified: '2026-03-18',
    },
    {
        id: 'dunlop-shower-waterproofing-kit',
        name: 'Shower Waterproofing Kit',
        brand: 'Dunlop',
        coverageM2PerKit: 3.5,
        coats: 2,
        dryTimeHours: 3,
        notes: ['2 coats required', 'Allow 3h between coats', 'Tile after 24h'],
        tdsUrl: 'https://www.dunloptrade.com/products/shower-waterproofing-kit',
        lastVerified: '2026-03-18',
    },
];

// ---------------------------------------------------------------------------
// Self-levelling compound — 1 Mapei + 1 Dunlop = 2 products
// ---------------------------------------------------------------------------

export const SLC_PRODUCTS: SLCProduct[] = [
    {
        id: 'mapei-ultraplan',
        name: 'Ultraplan',
        brand: 'Mapei',
        bagSizeKg: 25,
        densityKgPerL: 1.5,
        tdsUrl: 'https://www.mapei.com/gb/en/products-and-solutions/products/floor-preparation/self-levelling-compounds/ultraplan',
        lastVerified: '2026-03-18',
    },
    {
        id: 'dunlop-level-it',
        name: 'Level IT',
        brand: 'Dunlop',
        bagSizeKg: 25,
        densityKgPerL: 1.5,
        tdsUrl: 'https://www.dunloptrade.com/products/level-it-self-levelling-compound',
        lastVerified: '2026-03-18',
    },
];

// ---------------------------------------------------------------------------
// Primer — 1 Mapei + 2 Dunlop = 3 products
// ---------------------------------------------------------------------------

export const PRIMER_PRODUCTS: PrimerProduct[] = [
    {
        id: 'mapei-primer-g',
        name: 'Primer G',
        brand: 'Mapei',
        coverageM2PerKg: 5,
        packSizes: [1, 5],
        primaryPackSizeKg: 5,
        tdsUrl: 'https://www.mapei.com/gb/en/products-and-solutions/products/floor-preparation/primers/primer-g',
        lastVerified: '2026-03-18',
    },
    {
        id: 'dunlop-multi-purpose-primer',
        name: 'Multi-Purpose Primer',
        brand: 'Dunlop',
        coverageM2PerKg: 10,
        dilutedCoverageM2PerKg: 20,
        dilutionRatio: '1:1',
        packSizes: [1],
        primaryPackSizeKg: 1,
        notes: ['Can be diluted 1:1 with water for non-porous substrates'],
        tdsUrl: 'https://www.dunloptrade.com/products/multi-purpose-primer',
        lastVerified: '2026-03-18',
    },
    {
        id: 'dunlop-universal-bonding-agent',
        name: 'Universal Bonding Agent',
        brand: 'Dunlop',
        coverageM2PerKg: 12,
        dilutedCoverageM2PerKg: 3,
        dilutionRatio: 'neat:slurry',
        packSizes: [5],
        primaryPackSizeKg: 5,
        notes: ['Slurry application: mix 1:1 with water + cement for 3 m²/kg'],
        tdsUrl: 'https://www.dunloptrade.com/products/universal-bonding-agent',
        lastVerified: '2026-03-18',
    },
];
