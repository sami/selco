/**
 * @file src/calculators/v2/plaster.ts
 *
 * Plastering estimator.
 *
 * Two jobs covered:
 *   - skim: 2 mm × 2-coat multi-finish over sound board/backing
 *     (one 25 kg bag ≈ 10 m²)
 *   - float & set: 11 mm bonding/hardwall + skim
 *     (one 25 kg bonding bag ≈ 2.75 m² at 11 mm)
 */

import type { BillOfMaterials, BomLine } from './types';
import { fmtM2, units } from './types';

export type PlasterJob = 'skim' | 'float-set';

export interface PlasterInput {
    /** Total wall/ceiling area to plaster, m². */
    areaM2: number;
    job: PlasterJob;
    /** Needs PVA priming (painted/dusty backgrounds). */
    includePva: boolean;
    /** Add scrim tape + beads for boarded work. */
    boardedWork: boolean;
}

const SKIM_M2_PER_BAG = 10;
const BONDING_M2_PER_BAG = 2.75;

export function calculatePlaster(input: PlasterInput): BillOfMaterials {
    const a = Math.max(0, input.areaM2);

    const lines: BomLine[] = [];

    if (input.job === 'float-set') {
        lines.push({
            id: 'bonding',
            name: 'Bonding coat plaster',
            detail: `25 kg bag — ~${BONDING_M2_PER_BAG} m² at 11 mm`,
            qty: units(a / BONDING_M2_PER_BAG),
            unit: 'bags',
        });
    }

    lines.push({
        id: 'multi-finish',
        name: 'Multi-finish plaster',
        detail: `25 kg bag — ~${SKIM_M2_PER_BAG} m² at 2 mm, 2 coats`,
        qty: units(a / SKIM_M2_PER_BAG),
        unit: 'bags',
    });

    if (input.includePva) {
        lines.push({
            id: 'pva',
            name: 'PVA bonding agent',
            detail: '5 L — diluted 4:1 then 3:1',
            qty: units(a / 50),
            unit: 'bottles',
        });
    }

    if (input.boardedWork) {
        lines.push(
            {
                id: 'scrim',
                name: 'Self-adhesive scrim tape',
                detail: '48 mm × 90 m self-adhesive',
                qty: units(a / 30),
                unit: 'rolls',
            },
            {
                id: 'beads',
                name: 'Thin-coat galvanised angle bead',
                detail: '2.4 m galvanised',
                qty: units(a / 8),
                unit: 'lengths',
            },
        );
    }

    const bags = lines
        .filter((l) => l.unit === 'bags')
        .reduce((s, l) => s + l.qty, 0);

    return {
        facts: [
            { label: 'Area', value: fmtM2(a) },
            {
                label: 'System',
                value: input.job === 'skim' ? '2 mm two-coat skim' : '11 mm float + 2 mm set',
            },
            { label: 'Total bags', value: `${bags} × 25 kg` },
        ],
        sections: [{ title: 'Plastering', lines }],
        tools: [
            'Plastering trowel (stainless) and hawk',
            'Mixing drill + paddle and two clean buckets',
            'Speedskim or feather edge for flattening',
            'Water brush for the final trowel-up',
            'Tin snips for cutting beads',
            'Dust sheets — skimming is messier than it sounds',
        ],
        notes: [
            'Plaster has a shelf life — check bag dates at the counter; stale plaster sets fast.',
            input.job === 'float-set'
                ? 'Bonding coat scratched up before setting; skim follows once firm.'
                : 'Skim assumes a flat, sound background — fill chases and cracks first.',
            'A 25 kg bag mixes with roughly 11.5 L of clean water.',
        ],
    };
}
