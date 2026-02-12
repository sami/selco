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
    'half-brick': 0.024,
    'one-brick': 0.048,
    'blockwork': 0.009,
};

export const WALL_TYPES: { value: WallType; label: string }[] = [
    { value: 'half-brick', label: 'Single Skin Brick (102.5mm)' },
    { value: 'one-brick', label: 'Double Skin Brick (215mm)' },
    { value: 'cavity', label: 'Cavity Wall (Brick & Block)' },
    { value: 'blockwork', label: 'Single Skin Blockwork' },
];

export function calculateWallArea(walls: WallSection[], openings: Opening[]): WallAreaResult {
    // Stub implementation
    return { grossArea: 0, openingArea: 0, netArea: 0 };
}

export function calculateBricks(netArea: number, wallType: WallType, wastage: number): number {
    // Stub implementation
    return 0;
}

export function calculateBlocks(netArea: number, wallType: WallType, blockWidth: number, wastage: number): number {
    // Stub implementation
    return 0;
}

export function calculateMortar(netArea: number, wallType: WallType, mixRatio: MortarMixRatio, wastage: number): MortarResult {
    // Stub implementation
    return { wetVolume: 0, cementBags: 0, sandTonnes: 0 };
}

export function calculateWallTies(netArea: number, openings: Opening[]): WallTiesResult {
    // Stub implementation
    return { general: 0, atOpenings: 0, total: 0 };
}

export function calculateLintels(openings: Opening[]): LintelResult[] {
    // Stub implementation
    return [];
}

export function calculateDPC(walls: WallSection[], wallType: WallType): DPCResult {
    // Stub implementation
    return { length: 0, widthMm: 0 };
}

export function calculateMasonry(input: MasonryInput): MasonryResult {
    // Stub implementation
    return {
        area: { grossArea: 0, openingArea: 0, netArea: 0 },
        bricks: 0,
        blocks: 0,
        mortar: { wetVolume: 0, cementBags: 0, sandTonnes: 0 },
        wallTies: { general: 0, atOpenings: 0, total: 0 },
        lintels: [],
        dpc: { length: 0, widthMm: 0 },
    };
}
