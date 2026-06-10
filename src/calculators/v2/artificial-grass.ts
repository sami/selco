/**
 * @file src/calculators/v2/artificial-grass.ts
 *
 * Artificial grass (astro turf) estimator.
 *
 * Grass is sold off 2 m and 4 m wide rolls, cut to length. Strips must all
 * run the same way (pile direction), so the engine plans strip layout in
 * both orientations and both roll widths, then recommends the plan with the
 * least bought-but-wasted grass.
 *
 * Build-up assumed (typical domestic install on soil):
 *   - excavate ~75 mm
 *   - 50 mm MOT Type 1 sub-base, compacted
 *   - 25 mm sharp sand laying course
 *   - weed membrane
 *   - grass, jointed with tape + adhesive, pinned at edges
 *   - optional kiln-dried sand infill (~5 kg/m²)
 */

import type { BillOfMaterials, BomLine } from './types';
import { fmtM2, units } from './types';

export interface GrassInput {
    /** Lawn width in metres. */
    widthM: number;
    /** Lawn length in metres. */
    lengthM: number;
    /** Roll width preference. 'auto' compares 2 m and 4 m plans. */
    rollWidth: 2 | 4 | 'auto';
    /** Include MOT Type 1 + sharp sand groundworks. */
    includeGroundworks: boolean;
    /** Include kiln-dried sand infill. */
    includeInfill: boolean;
}

/** One planned strip of grass as cut from the roll. */
export interface GrassStrip {
    /** Offset across the lawn, metres. */
    offsetM: number;
    /** Strip width as laid (may be a part-roll edge strip), metres. */
    widthM: number;
    /** Strip length as laid, metres. */
    lengthM: number;
}

export interface GrassPlan {
    rollWidthM: 2 | 4;
    /** True when strips run along the lawn's length dimension. */
    stripsRunAlongLength: boolean;
    strips: GrassStrip[];
    /** Number of seams between strips. */
    joints: number;
    /** Total linear metres of seam. */
    jointLengthM: number;
    /** Grass bought, m² (whole strip widths off the roll). */
    boughtM2: number;
    /** Lawn area actually covered, m². */
    lawnM2: number;
    /** Bought minus used, m². */
    wasteM2: number;
}

const CUT_ALLOWANCE_M = 0.1; // trim allowance per strip end

/** Plan strips for one roll width / orientation combination. */
function planOrientation(
    acrossM: number,
    alongM: number,
    rollWidthM: 2 | 4,
    stripsRunAlongLength: boolean,
): GrassPlan {
    const stripCount = Math.max(1, Math.ceil(acrossM / rollWidthM));
    const strips: GrassStrip[] = [];
    for (let i = 0; i < stripCount; i++) {
        const remaining = acrossM - i * rollWidthM;
        strips.push({
            offsetM: i * rollWidthM,
            widthM: Math.min(rollWidthM, remaining),
            lengthM: alongM,
        });
    }
    const boughtM2 = stripCount * rollWidthM * (alongM + CUT_ALLOWANCE_M);
    const lawnM2 = acrossM * alongM;
    return {
        rollWidthM,
        stripsRunAlongLength,
        strips,
        joints: stripCount - 1,
        jointLengthM: (stripCount - 1) * alongM,
        boughtM2,
        lawnM2,
        wasteM2: boughtM2 - lawnM2,
    };
}

/** Compare candidate plans and pick the least wasteful. */
export function planGrass(input: GrassInput): GrassPlan {
    const { widthM, lengthM } = input;
    const rollWidths: Array<2 | 4> =
        input.rollWidth === 'auto' ? [2, 4] : [input.rollWidth];

    const candidates: GrassPlan[] = [];
    for (const rw of rollWidths) {
        // strips running along the length (laid across the width)
        candidates.push(planOrientation(widthM, lengthM, rw, true));
        // strips running along the width (laid across the length)
        candidates.push(planOrientation(lengthM, widthM, rw, false));
    }
    // Least waste wins; fewer joints breaks ties (joints are the failure
    // point of cheap installs, so they matter more than pennies of grass).
    candidates.sort(
        (a, b) => a.wasteM2 - b.wasteM2 || a.joints - b.joints,
    );
    return candidates[0];
}

export function calculateGrass(input: GrassInput): BillOfMaterials {
    const plan = planGrass(input);
    const lawnM2 = plan.lawnM2;
    const perimeterM = 2 * (input.widthM + input.lengthM);

    const grassLines: BomLine[] = [
        {
            id: 'grass',
            name: 'Artificial grass, 30 mm pile',
            detail: `${plan.rollWidthM} m roll — ${plan.strips.length} strip${plan.strips.length === 1 ? '' : 's'} cut to length`,
            qty: Math.ceil(plan.boughtM2 * 10) / 10,
            unit: 'm²',
        },
        {
            id: 'membrane',
            name: 'Weed control membrane',
            detail: '1 m × 15 m roll',
            qty: units((lawnM2 * 1.1) / 15),
            unit: 'rolls',
        },
        {
            id: 'pins',
            name: 'Galvanised turf fixing U-pins',
            detail: 'pack of 50 — one per 0.5 m of edge',
            qty: units(perimeterM / 0.5 / 50),
            unit: 'packs',
        },
    ];

    if (plan.joints > 0) {
        grassLines.push(
            {
                id: 'tape',
                name: 'Self-adhesive grass joining tape',
                detail: '150 mm × 10 m roll',
                qty: units(plan.jointLengthM / 10),
                unit: 'rolls',
            },
            {
                id: 'adhesive',
                name: 'Artificial grass seam adhesive',
                detail: '310 ml cartridge — covers ~3 m of seam',
                qty: units(plan.jointLengthM / 3),
                unit: 'tubes',
            },
        );
    }

    const groundLines: BomLine[] = input.includeGroundworks
        ? [
              {
                  id: 'mot',
                  name: 'MOT Type 1 sub-base',
                  detail: 'bulk bag (~850 kg) — 50 mm compacted',
                  // 50 mm at ~2.2 t/m³ compacted ≈ 110 kg per m²
                  qty: units((lawnM2 * 0.05 * 2200) / 850),
                  unit: 'bulk bags',
              },
              {
                  id: 'sharp-sand',
                  name: 'Sharp sand',
                  detail: 'bulk bag (~850 kg) — 25 mm bed',
                  // 25 mm at ~1.7 t/m³ ≈ 42.5 kg per m²
                  qty: units((lawnM2 * 0.025 * 1700) / 850),
                  unit: 'bulk bags',
              },
          ]
        : [];

    const finishLines: BomLine[] = input.includeInfill
        ? [
              {
                  id: 'infill',
                  name: 'Kiln-dried paving sand (infill)',
                  detail: '25 kg bag — ~5 kg per m²',
                  qty: units((lawnM2 * 5) / 25),
                  unit: 'bags',
              },
          ]
        : [];

    const orientation = plan.stripsRunAlongLength
        ? 'along the length'
        : 'across the width';

    return {
        facts: [
            { label: 'Lawn area', value: fmtM2(lawnM2) },
            { label: 'Roll plan', value: `${plan.strips.length} × ${plan.rollWidthM} m strips, ${orientation}` },
            { label: 'Seams', value: plan.joints === 0 ? 'none — single piece' : `${plan.joints} (${plan.jointLengthM.toFixed(1)} m)` },
            { label: 'Off-cut waste', value: fmtM2(plan.wasteM2) },
        ],
        sections: [
            { title: 'Grass & fixing', lines: grassLines },
            ...(groundLines.length ? [{ title: 'Groundworks', lines: groundLines }] : []),
            ...(finishLines.length ? [{ title: 'Finishing', lines: finishLines }] : []),
        ],
        tools: [
            'Sharp utility knife + spare blades — one fresh blade per 10 m of cut',
            'Turf cutter and wacker plate (hire) for the dig and compaction',
            'Landscaping rake and screed bar for the sand bed',
            'Stiff broom — brush the pile upright and work in the infill',
            'General-purpose silicone — seal any edging upstands',
            'Tape measure, string line and marking paint',
        ],
        notes: [
            'All strips laid with pile leaning the same way — towards the main viewpoint.',
            'Roll plan chosen automatically to minimise off-cut waste, then seams.',
            input.includeGroundworks
                ? 'Build-up: 50 mm compacted MOT Type 1 + 25 mm sharp sand. Excavate ~75 mm.'
                : 'Groundworks excluded — assumes an existing prepared base.',
        ],
    };
}
