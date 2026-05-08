/**
 * @file src/data/decking-products.ts
 *
 * Decking product catalogue — common sizes and types available
 * from UK builders merchants.
 *
 * Product data is generic (not brand-specific). Dimensions reflect the
 * standard sizes stocked across the trade range: composite boards at
 * 135 mm wide, treated softwood at 120–150 mm wide, and easi-deck
 * boards at 100 mm wide.
 *
 * All dimensions are nominal (as-sold). Finished sizes may be slightly
 * smaller after planing.
 */

// ---------------------------------------------------------------------------
// Board products
// ---------------------------------------------------------------------------

export interface DeckingBoardProduct {
    id: string;
    name: string;
    /** Board type category. */
    type: 'composite' | 'treated-softwood' | 'hardwood';
    /** Nominal board width in mm. */
    widthMm: number;
    /** Nominal board thickness in mm. */
    thicknessMm: number;
    /** Available lengths in mm. */
    lengthsMm: number[];
    /** Default recommended gap between boards in mm. */
    defaultGapMm: number;
    /** Default recommended joist spacing in mm. */
    recommendedJoistSpacingMm: number;
    /** Recommended fixing method. */
    recommendedFixing: 'face-fix-screws' | 'hidden-clips';
    /** Boards per pack (1 = sold individually). */
    packSize: number;
}

/** Common decking board sizes available from UK trade merchants. */
export const DECKING_BOARD_PRODUCTS: DeckingBoardProduct[] = [
    // --- Composite boards ---
    {
        id: 'composite-135-25-3600',
        name: 'Composite deck board 25 × 135 × 3600 mm',
        type: 'composite',
        widthMm: 135,
        thicknessMm: 25,
        lengthsMm: [3600],
        defaultGapMm: 5,
        recommendedJoistSpacingMm: 400,
        recommendedFixing: 'hidden-clips',
        packSize: 1,
    },
    {
        id: 'composite-135-25-4800',
        name: 'Composite deck board 25 × 135 × 4800 mm',
        type: 'composite',
        widthMm: 135,
        thicknessMm: 25,
        lengthsMm: [4800],
        defaultGapMm: 5,
        recommendedJoistSpacingMm: 400,
        recommendedFixing: 'hidden-clips',
        packSize: 1,
    },
    {
        id: 'composite-135-22-3600',
        name: 'Composite deck board 22 × 135 × 3600 mm',
        type: 'composite',
        widthMm: 135,
        thicknessMm: 22,
        lengthsMm: [3600],
        defaultGapMm: 5,
        recommendedJoistSpacingMm: 400,
        recommendedFixing: 'hidden-clips',
        packSize: 1,
    },

    // --- Treated softwood boards ---
    {
        id: 'softwood-120-32-3600',
        name: 'Treated softwood deck board 32 × 120 × 3600 mm',
        type: 'treated-softwood',
        widthMm: 120,
        thicknessMm: 32,
        lengthsMm: [3600],
        defaultGapMm: 6,
        recommendedJoistSpacingMm: 400,
        recommendedFixing: 'face-fix-screws',
        packSize: 1,
    },
    {
        id: 'softwood-120-32-4800',
        name: 'Treated softwood deck board 32 × 120 × 4800 mm',
        type: 'treated-softwood',
        widthMm: 120,
        thicknessMm: 32,
        lengthsMm: [4800],
        defaultGapMm: 6,
        recommendedJoistSpacingMm: 400,
        recommendedFixing: 'face-fix-screws',
        packSize: 1,
    },
    {
        id: 'softwood-150-32-3600',
        name: 'Treated softwood deck board 32 × 150 × 3600 mm',
        type: 'treated-softwood',
        widthMm: 150,
        thicknessMm: 32,
        lengthsMm: [3600],
        defaultGapMm: 6,
        recommendedJoistSpacingMm: 400,
        recommendedFixing: 'face-fix-screws',
        packSize: 1,
    },
    {
        id: 'softwood-125-38-3600',
        name: 'Grooved treated deck board 38 × 125 × 3600 mm',
        type: 'treated-softwood',
        widthMm: 125,
        thicknessMm: 38,
        lengthsMm: [3600, 4800],
        defaultGapMm: 6,
        recommendedJoistSpacingMm: 450,
        recommendedFixing: 'face-fix-screws',
        packSize: 1,
    },

    // --- Easi deck board (narrow) ---
    {
        id: 'easi-100-32-3600',
        name: 'Easi deck board 32 × 100 × 3600 mm',
        type: 'treated-softwood',
        widthMm: 100,
        thicknessMm: 32,
        lengthsMm: [3600],
        defaultGapMm: 5,
        recommendedJoistSpacingMm: 400,
        recommendedFixing: 'face-fix-screws',
        packSize: 1,
    },
];

// ---------------------------------------------------------------------------
// Joist products
// ---------------------------------------------------------------------------

export interface JoistProduct {
    id: string;
    name: string;
    /** Cross-section width in mm (e.g. 47). */
    widthMm: number;
    /** Cross-section depth in mm (e.g. 100, 150). */
    depthMm: number;
    /** Available stock lengths in mm. */
    lengthsMm: number[];
}

/** Common joist sizes for decking subframes. */
export const JOIST_PRODUCTS: JoistProduct[] = [
    {
        id: 'joist-47x100-2400',
        name: 'Treated joist 47 × 100 mm',
        widthMm: 47,
        depthMm: 100,
        lengthsMm: [2400, 3000, 3600, 4800],
    },
    {
        id: 'joist-47x150-3600',
        name: 'Treated joist 47 × 150 mm',
        widthMm: 47,
        depthMm: 150,
        lengthsMm: [2400, 3000, 3600, 4800],
    },
];

// ---------------------------------------------------------------------------
// Fixing products
// ---------------------------------------------------------------------------

export interface FixingProduct {
    id: string;
    name: string;
    type: 'face-fix-screws' | 'hidden-clips';
    /** Screw/clip length or size descriptor. */
    sizeMm: number;
    /** Units per pack. */
    packSize: number;
}

/** Common decking fixings. */
export const FIXING_PRODUCTS: FixingProduct[] = [
    {
        id: 'deck-screws-75-200',
        name: 'Decking screws 75 mm (pack of 200)',
        type: 'face-fix-screws',
        sizeMm: 75,
        packSize: 200,
    },
    {
        id: 'deck-screws-75-600',
        name: 'Decking screws 75 mm (pack of 600)',
        type: 'face-fix-screws',
        sizeMm: 75,
        packSize: 600,
    },
    {
        id: 'hidden-clips-100',
        name: 'Hidden fixing clips (pack of 100)',
        type: 'hidden-clips',
        sizeMm: 0,
        packSize: 100,
    },
];

// ---------------------------------------------------------------------------
// Deck block / support products
// ---------------------------------------------------------------------------

export interface DeckBlockProduct {
    id: string;
    name: string;
    /** Material type. */
    material: 'concrete' | 'plastic';
}

/** Deck blocks for ground-level builds. */
export const DECK_BLOCK_PRODUCTS: DeckBlockProduct[] = [
    {
        id: 'concrete-deck-block',
        name: 'Concrete deck block',
        material: 'concrete',
    },
    {
        id: 'plastic-deck-block',
        name: 'Plastic adjustable deck support',
        material: 'plastic',
    },
];

// ---------------------------------------------------------------------------
// Common board presets for wizard dropdowns
// ---------------------------------------------------------------------------

/** Preset board sizes for quick selection in the wizard. */
export const BOARD_PRESETS = DECKING_BOARD_PRODUCTS.map(p => ({
    value: p.id,
    label: p.name,
    widthMm: p.widthMm,
    thicknessMm: p.thicknessMm,
    lengthMm: p.lengthsMm[0],
    gapMm: p.defaultGapMm,
    joistSpacingMm: p.recommendedJoistSpacingMm,
    fixingMethod: p.recommendedFixing,
    packSize: p.packSize,
}));
