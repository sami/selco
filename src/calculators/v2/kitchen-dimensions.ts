/**
 * @file src/calculators/v2/kitchen-dimensions.ts
 *
 * Real Selco self-assembly carcass, fascia and decor-panel dimensions,
 * read off the range dimension sheets (corner cabinets; larder, oven and
 * fridge tall units; base, wall, drawer and display units; and the 18 mm
 * plant-on decor end panels). The kitchen engine quotes these on the bill
 * so a customer can check a unit fits the wall and order the matching end
 * panel without a second trip to the counter.
 *
 * Millimetres throughout. All the self-assembly ranges (Verona, Paris,
 * Capri, Lisbon) share these sizes.
 */

/**
 * Carcass heights and depths common to the self-assembly ranges.
 *   - base: 704 mm door front over a 166 mm plinth, 870 mm to the worktop
 *     underside, 565 mm deep
 *   - wall: 700 mm high, 330 mm deep
 *   - tall: 1952 mm of fascia over a 166 mm plinth, 2118 mm overall,
 *     565 mm deep
 */
export const CARCASS = {
    base: { doorFrontMm: 704, plinthMm: 166, toWorktopMm: 870, depthMm: 565 },
    wall: { heightMm: 700, depthMm: 330 },
    tall: { fasciaMm: 1952, plinthMm: 166, overallMm: 2118, depthMm: 565 },
} as const;

/**
 * 18 mm plant-on decor end panels, one per exposed run end. Sizes differ
 * by run height: a base end is short, a tall end runs floor to top.
 */
export const END_PANELS = {
    base: { widthMm: 615, heightMm: 915 },
    wall: { widthMm: 585, heightMm: 748 },
    tall: { widthMm: 615, heightMm: 2143 },
} as const;

export type EndPanelKind = keyof typeof END_PANELS;

/**
 * Corner units: footprints and fascia splits.
 *   - l935: 935 × 935 mm L-shape, 635 + 300 mm fascia, two packs
 *   - c1000: 935 mm door face plus a 135 mm blanking panel
 *   - wall635: 635 × 635 mm L-shape corner wall unit
 *   - wall600: 735 mm face, 435 + 300 mm fascia, 236 mm return
 */
export const CORNER = {
    l935: {
        footprintMm: 935,
        fasciaSplit: [635, 300] as const,
        note: 'some ranges use larger fascias and no corner post for a contemporary look',
    },
    c1000: { doorFaceMm: 935, blankingPanelMm: 135 },
    wall635: { footprintMm: 635 },
    wall600: { faceMm: 735, fasciaSplit: [435, 300] as const, returnMm: 236 },
} as const;

/** Drawer-unit front splits, top to bottom (mm). */
export const DRAWER_FRONTS: Record<number, readonly number[]> = {
    500: [124, 124, 124, 316], // four-drawer
    600: [124, 252, 316], // three-drawer
    800: [124, 252, 316], // three-drawer
};

/**
 * Tall appliance housings, all 600 mm wide and 2118 mm tall unless noted.
 *   - larder300: a 300 mm wide larder, the narrow tall unit
 *   - larder600: two doors, 1244 + 700 mm
 *   - singleOven: a 572 mm oven aperture with a 92 mm trim above it
 *   - doubleOven: 444 mm top door, 92 mm trim, 572 mm lower aperture
 *   - fridge5050: 50:50 fascia split, 1052 + 892 mm
 *   - fridge7030: 70:30 fascia split, 1244 + 700 mm
 */
export const TALL_UNITS = {
    larder300: { widthMm: 300, fasciaMm: 1952, overallMm: 2118, depthMm: 565 },
    larder600: { widthMm: 600, doorsMm: [1244, 700] as const },
    singleOven: { widthMm: 600, apertureMm: 572, trimMm: 92 },
    doubleOven: { widthMm: 600, topDoorMm: 444, trimMm: 92, lowerApertureMm: 572 },
    fridge5050: { widthMm: 600, splitMm: [1052, 892] as const },
    fridge7030: { widthMm: 600, splitMm: [1244, 700] as const },
} as const;

/** The 600 mm built-under oven unit: a 92 mm drawer over the oven aperture. */
export const BUILT_UNDER_OVEN = { widthMm: 600, topDrawerMm: 92 } as const;

/** Format a panel/footprint as "W × H mm". */
export function fmtSize(s: { widthMm: number; heightMm: number }): string {
    return `${s.widthMm} × ${s.heightMm} mm`;
}

/** Format a fascia / drawer-front split as "a / b / c mm". */
export function fmtSplit(parts: readonly number[]): string {
    return `${parts.join(' / ')} mm`;
}
