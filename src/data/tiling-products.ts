import type { AdhesiveProduct } from '../calculators/types';

/**
 * Selco-stocked adhesive products with manufacturer TDS coverage rates.
 * Data verified against selcobw.com — 18 March 2026.
 *
 * coverageRates in kg/m²:
 *   wall-dry  = dry internal wall, tile ≤ 300mm (lower rate)
 *   wall-wet  = shower/wet room wall
 *   floor-dry = internal floor (higher rate)
 *   floor-wet = wet room floor or exterior (highest rate)
 *   exterior  = outdoor / frost-rated
 */
export const ADHESIVE_PRODUCTS: AdhesiveProduct[] = [
    // -----------------------------------------------------------------------
    // MAPEI
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
    },
    {
        id: 'mapei-adesilex-p9',
        name: 'Adesilex P9',
        brand: 'Mapei',
        enClass: 'C2TE',
        bagSizeKg: 20,
        coverageRates: { 'wall-dry': 2.5, 'wall-wet': 3, 'floor-dry': 4, 'floor-wet': 4, exterior: 4 },
        tdsUrl: 'https://www.mapei.com/gb/en/products-and-solutions/products/gluing/adhesives/cementitious-adhesives/adesilex-p9',
    },
    {
        id: 'mapei-standard-set-plus',
        name: 'Standard Set Plus',
        brand: 'Mapei',
        enClass: 'C2TE',
        bagSizeKg: 20,
        coverageRates: { 'wall-dry': 2.5, 'wall-wet': 3, 'floor-dry': 4, 'floor-wet': 4, exterior: 4 },
        tdsUrl: 'https://www.mapei.com/gb/en/products-and-solutions/products/gluing/adhesives/cementitious-adhesives/standard-set-plus',
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
    },

    // -----------------------------------------------------------------------
    // DUNLOP
    // -----------------------------------------------------------------------
    {
        id: 'dunlop-cx24',
        name: 'CX-24 Essential',
        brand: 'Dunlop',
        enClass: 'C1T',
        bagSizeKg: 20,
        coverageRates: { 'wall-dry': 2, 'wall-wet': 3.5, 'floor-dry': 3.5, 'floor-wet': 3.5, exterior: 3.5 },
        tdsUrl: 'https://www.dunloptrade.com/products/cx-24-essential',
    },
    {
        id: 'dunlop-cf24',
        name: 'CF-24 Flexible',
        brand: 'Dunlop',
        enClass: 'C2TE',
        bagSizeKg: 20,
        coverageRates: { 'wall-dry': 2, 'wall-wet': 4, 'floor-dry': 4, 'floor-wet': 4, exterior: 4 },
        tdsUrl: 'https://www.dunloptrade.com/products/cf-24-flexible',
    },
    {
        id: 'dunlop-cf03',
        name: 'CF-03 Flexible Fast Set',
        brand: 'Dunlop',
        enClass: 'C2F',
        bagSizeKg: 20,
        coverageRates: { 'wall-dry': 2, 'wall-wet': 4, 'floor-dry': 4, 'floor-wet': 4, exterior: 4 },
        tdsUrl: 'https://www.dunloptrade.com/products/cf-03-flexible-fast-set',
    },
    {
        id: 'dunlop-cx03',
        name: 'CX-03 Fast Set',
        brand: 'Dunlop',
        enClass: 'C1F',
        bagSizeKg: 20,
        coverageRates: { 'wall-dry': 2, 'wall-wet': 3.5, 'floor-dry': 3.5, 'floor-wet': 3.5, exterior: 3.5 },
        tdsUrl: 'https://www.dunloptrade.com/products/cx-03-fast-set',
    },
    {
        id: 'dunlop-cs1-12',
        name: 'CS1-12 S1 Ultra Flexible',
        brand: 'Dunlop',
        enClass: 'C2TES1',
        bagSizeKg: 20,
        coverageRates: { 'wall-dry': 2, 'wall-wet': 4, 'floor-dry': 4, 'floor-wet': 4, exterior: 4 },
        tdsUrl: 'https://www.dunloptrade.com/products/cs1-12-ultra-flexible',
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
    },
];
