import type { BoardCoverageInput, BoardPreset } from './types';

/**
 * Common UK board/sheet sizes. Only the 2D footprint matters for coverage —
 * a 2400×1200 board covers 2.88 m² whether it's plasterboard, insulation,
 * or anything else. Thickness is irrelevant.
 */
export const BOARD_PRESETS: BoardPreset[] = [
    {
        id: '2440-1220',
        label: '2440 × 1220 mm',
        description: 'Standard sheet (plywood, OSB, MDF)',
        lengthMm: 2440, widthMm: 1220,
        coverageM2: 2440 * 1220 / 1_000_000,   // 2.9768
    },
    {
        id: '2400-1200',
        label: '2400 × 1200 mm',
        description: 'Standard plasterboard',
        lengthMm: 2400, widthMm: 1200,
        coverageM2: 2400 * 1200 / 1_000_000,   // 2.88
    },
    {
        id: '2440-600',
        label: '2440 × 600 mm',
        description: 'T&G flooring (chipboard)',
        lengthMm: 2440, widthMm: 600,
        coverageM2: 2440 * 600 / 1_000_000,    // 1.464
    },
    {
        id: '1200-600',
        label: '1200 × 600 mm',
        description: 'Insulation slab / tile backer',
        lengthMm: 1200, widthMm: 600,
        coverageM2: 1200 * 600 / 1_000_000,    // 0.72
    },
];

export function getPresetById(id: string): BoardPreset | undefined {
    return BOARD_PRESETS.find((p) => p.id === id);
}

export function getBoardDimensions(input: BoardCoverageInput): {
    lengthMm: number;
    widthMm: number;
    coverageM2: number;
    label: string;
} {
    if (input.presetId !== undefined) {
        const preset = getPresetById(input.presetId);
        if (!preset) throw new Error(`Unknown board preset: ${input.presetId}`);
        return {
            lengthMm: preset.lengthMm,
            widthMm: preset.widthMm,
            coverageM2: preset.coverageM2,
            label: preset.label,
        };
    }

    const L = input.customLengthMm ?? 0;
    const W = input.customWidthMm ?? 0;
    const coverageM2 = L * W / 1_000_000;
    const label = input.customLabel ?? `Custom ${L}×${W}mm`;
    return { lengthMm: L, widthMm: W, coverageM2, label };
}
