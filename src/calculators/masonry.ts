import type {
    MasonryInput,
    MasonryResult,
    WallSection,
    Opening,
    WallType,
    MortarMixRatio,
    WallAreaResult,
    MortarResult,
    WallTiesResult,
    LintelResult,
    DPCResult,
} from './types';

export const UNITS_PER_M2 = {
    bricks: {
        'half-brick': 60,
        'one-brick': 120,
        'cavity': 60, // outer leaf only
        'blockwork': 0,
    },
    blocks: {
        'blockwork': 10,
        'cavity': 10, // inner leaf only
        'half-brick': 0,
        'one-brick': 0,
    },
};

export const MORTAR_PER_M2 = {
    'half-brick': 0.043,
    'one-brick': 0.086,
    'blockwork': 0.011,
    'cavity': 0.054, // 0.043 (brick) + 0.011 (block)
};

export const WALL_TYPES: { value: WallType; label: string }[] = [
    { value: 'half-brick', label: 'Single Skin Brick (102.5mm)' },
    { value: 'one-brick', label: 'Double Skin Brick (215mm)' },
    { value: 'cavity', label: 'Cavity Wall (Brick & Block)' },
    { value: 'blockwork', label: 'Single Skin Blockwork' },
];

export const SAND_BAG_SIZES = [
    { value: 'jumbo', label: 'Jumbo Bag (875 kg)', kg: 875 },
    { value: 'large', label: 'Large Bag (35 kg)', kg: 35 },
];

export function calculateWallArea(walls: WallSection[], openings: Opening[]): WallAreaResult {
    if (!walls || walls.length === 0) {
        throw new Error('At least one wall section is required.');
    }

    let grossArea = 0;
    for (const wall of walls) {
        if (wall.length <= 0 || wall.height <= 0) {
            throw new Error('Wall dimensions must be greater than zero.');
        }
        grossArea += wall.length * wall.height;
    }

    let openingArea = 0;
    for (const opening of openings) {
        if (opening.width < 0 || opening.height < 0) {
            throw new Error('Opening dimensions must not be negative.');
        }
        openingArea += opening.width * opening.height;
    }

    const netArea = Math.max(0, grossArea - openingArea);

    return { grossArea, openingArea, netArea };
}

export function calculateBricks(netArea: number, wallType: WallType, wastage: number): number {
    const bricksPerM2 = UNITS_PER_M2.bricks[wallType];
    const baseBricks = netArea * bricksPerM2;
    const totalBricks = baseBricks * (1 + wastage / 100);
    return Math.ceil(totalBricks);
}

export function calculateBlocks(netArea: number, wallType: WallType, blockWidth: number, wastage: number): number {
    const blocksPerM2 = UNITS_PER_M2.blocks[wallType];
    const baseBlocks = netArea * blocksPerM2;
    const totalBlocks = baseBlocks * (1 + wastage / 100);
    return Math.ceil(totalBlocks);
}

export function calculateMortar(
    netArea: number,
    wallType: WallType,
    mixRatio: MortarMixRatio,
    wastage: number,
    sandBagSize: 'jumbo' | 'large'
): MortarResult {
    const rate = MORTAR_PER_M2[wallType];
    const wetVolume = netArea * rate * (1 + wastage / 100);
    const dryVolume = wetVolume * 1.33;

    // Parse mix ratio (e.g. "1:4")
    const parts = parseInt(mixRatio.split(':')[1], 10) + 1;
    const sandRatio = (parts - 1) / parts;
    const cementRatio = 1 / parts;

    const cementVolume = dryVolume * cementRatio;
    const sandVolume = dryVolume * sandRatio;

    const cementKg = cementVolume * 1440;
    const cementBags = Math.ceil(cementKg / 25);

    const sandKg = sandVolume * 1600;
    const sandBagSizeKg = sandBagSize === 'jumbo' ? 875 : 35;
    const sandBags = Math.ceil(sandKg / sandBagSizeKg);
    const sandTonnes = sandKg / 1000;

    return {
        wetVolume,
        cementBags,
        sandTonnes,
        sandKg,
        sandBags,
        sandBagSizeKg,
    };
}

export function calculateWallTies(netArea: number, openings: Opening[]): WallTiesResult {
    const general = Math.ceil(netArea * 2.5);

    let atOpenings = 0;
    for (const opening of openings) {
        const perimeter = (opening.width + opening.height) * 2;
        atOpenings += Math.ceil(perimeter / 0.3);
    }

    const total = general + atOpenings;

    return { general, atOpenings, total };
}

export function calculateLintels(openings: Opening[]): LintelResult[] {
    return openings.map((opening) => ({
        width: opening.width,
        lintelLength: opening.width * 1000 + 300,
    }));
}

export function calculateDPC(walls: WallSection[], wallType: WallType): DPCResult {
    let length = 0;
    for (const wall of walls) {
        length += wall.length;
    }

    let widthMm = 0;
    if (wallType === 'half-brick') {
        widthMm = 112.5; // Standard 112.5mm DPC
    } else if (wallType === 'cavity' || wallType === 'one-brick') {
        widthMm = 225; // Standard 225mm DPC
    } else {
        widthMm = 100; // Default for blockwork or unknown
    }

    return { length, widthMm };
}

export function calculateMasonry(input: MasonryInput): MasonryResult {
    // Stub implementation
    return {
        area: { grossArea: 0, openingArea: 0, netArea: 0 },
        bricks: 0,
        blocks: 0,
        mortar: { wetVolume: 0, cementBags: 0, sandTonnes: 0, sandKg: 0, sandBags: 0, sandBagSizeKg: 0 },
        wallTies: { general: 0, atOpenings: 0, total: 0 },
        lintels: [],
        dpc: { length: 0, widthMm: 0 },
    };
}
