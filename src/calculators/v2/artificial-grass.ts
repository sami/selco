/**
 * @file src/calculators/v2/artificial-grass.ts
 *
 * Artificial grass (astro turf) estimator, mapped to Selco's stocked range.
 *
 * Selco sells Luxigraze 30 Premium artificial grass as 2 m-wide Midi rolls
 * in fixed 4 m / 5 m / 6 m lengths (covering 8 / 10 / 12 m²), not cut to
 * length off a wide roll. So the engine plans 2 m strips running one way
 * (pile direction is constant), then chooses the roll LENGTHS that cover
 * each strip with the least waste. It tries both lawn orientations and
 * keeps whichever buys the least grass, then the fewest seams.
 *
 * Accessories follow the real SKUs: jointing tape (20 m roll), grass
 * adhesive (310 ml), fixing pins (pack of 10), Plantex weed membrane
 * (2 m × 25 m), and optional CORE EDGE lawn edging (5 m pack).
 */

import type { BillOfMaterials, BomLine } from './types';
import { fmtM2, units } from './types';

/** Luxigraze Midi roll lengths Selco stocks, 2 m wide. */
const ROLL_LENGTHS_M = [4, 5, 6] as const;
const ROLL_WIDTH_M = 2;

export interface GrassInput {
    /** Lawn width in metres. */
    widthM: number;
    /** Lawn length in metres. */
    lengthM: number;
    /** Include MOT Type 1 + sharp sand groundworks. */
    includeGroundworks: boolean;
    /** Include kiln-dried sand infill. */
    includeInfill: boolean;
    /** Include CORE EDGE perimeter lawn edging. */
    includeEdging: boolean;
}

/** One planned 2 m strip, made up of one or more whole rolls end-to-end. */
export interface GrassStrip {
    /** Offset across the lawn, metres. */
    offsetM: number;
    /** Strip width as laid (2 m, or a part-strip at the last edge). */
    widthM: number;
    /** Strip length as laid (the lawn's "along" dimension), metres. */
    lengthM: number;
    /** Roll lengths (4/5/6 m) making up this strip, in order. */
    rolls: number[];
}

export interface GrassPlan {
    /** True when strips run along the lawn's length dimension. */
    stripsRunAlongLength: boolean;
    strips: GrassStrip[];
    /** Seams between adjacent strips (run the strip length). */
    sideSeams: number;
    /** Seams where rolls join end-to-end within a strip (2 m long each). */
    crossSeams: number;
    /** Total linear metres of seam. */
    seamLengthM: number;
    /** Count of each roll length bought. */
    rollCounts: { len4: number; len5: number; len6: number };
    /** Grass bought, m² (whole 2 m × length rolls). */
    boughtM2: number;
    /** Lawn area actually covered, m². */
    lawnM2: number;
    /** Bought minus covered, m². */
    wasteM2: number;
}

/**
 * Choose the roll lengths (from {4,5,6}) that cover a strip of length L with
 * the least total grass, then the fewest rolls. Every value in [4n, 6n] is
 * reachable with n rolls, so the optimum is the smallest n with 6n ≥ L and
 * a buy of max(4n, ⌈L⌉) metres, decomposed back into 4/5/6 m rolls.
 */
export function rollsForLength(lengthM: number): number[] {
    const need = Math.max(1, Math.ceil(lengthM - 1e-9));
    const n = Math.max(1, Math.ceil(need / ROLL_LENGTHS_M[ROLL_LENGTHS_M.length - 1]));
    const target = Math.max(4 * n, need); // total metres to buy
    const rolls = new Array(n).fill(4);
    let extra = target - 4 * n; // metres to add by upgrading 4 m rolls
    for (let i = 0; i < n && extra >= 2; i++) {
        rolls[i] = 6;
        extra -= 2;
    }
    if (extra === 1) {
        const i = rolls.indexOf(4);
        rolls[i >= 0 ? i : 0] = 5;
    }
    return rolls;
}

/** Plan strips + rolls for one lawn orientation. */
function planOrientation(
    acrossM: number,
    alongM: number,
    stripsRunAlongLength: boolean,
): GrassPlan {
    const stripCount = Math.max(1, Math.ceil(acrossM / ROLL_WIDTH_M));
    const strips: GrassStrip[] = [];
    let crossSeams = 0;
    const rollCounts = { len4: 0, len5: 0, len6: 0 };
    let boughtM2 = 0;

    for (let i = 0; i < stripCount; i++) {
        const remaining = acrossM - i * ROLL_WIDTH_M;
        const rolls = rollsForLength(alongM);
        crossSeams += rolls.length - 1;
        for (const r of rolls) {
            if (r === 4) rollCounts.len4++;
            else if (r === 5) rollCounts.len5++;
            else rollCounts.len6++;
            boughtM2 += ROLL_WIDTH_M * r;
        }
        strips.push({
            offsetM: i * ROLL_WIDTH_M,
            widthM: Math.min(ROLL_WIDTH_M, remaining),
            lengthM: alongM,
            rolls,
        });
    }

    const sideSeams = stripCount - 1;
    const lawnM2 = acrossM * alongM;
    return {
        stripsRunAlongLength,
        strips,
        sideSeams,
        crossSeams,
        seamLengthM: sideSeams * alongM + crossSeams * ROLL_WIDTH_M,
        rollCounts,
        boughtM2,
        lawnM2,
        wasteM2: boughtM2 - lawnM2,
    };
}

/** Compare both orientations and pick the least-waste, then least-seam plan. */
export function planGrass(input: GrassInput): GrassPlan {
    const a = planOrientation(input.widthM, input.lengthM, true);
    const b = planOrientation(input.lengthM, input.widthM, false);
    const aSeams = a.sideSeams + a.crossSeams;
    const bSeams = b.sideSeams + b.crossSeams;
    if (a.boughtM2 !== b.boughtM2) return a.boughtM2 < b.boughtM2 ? a : b;
    return aSeams <= bSeams ? a : b;
}

export function calculateGrass(input: GrassInput): BillOfMaterials {
    const plan = planGrass(input);
    const lawnM2 = plan.lawnM2;
    const perimeterM = 2 * (input.widthM + input.lengthM);

    // Grass rolls, one BoM line per stocked size that's used.
    const ROLL_META: Array<{ key: 'len6' | 'len5' | 'len4'; len: number; cover: number }> = [
        { key: 'len6', len: 6, cover: 12 },
        { key: 'len5', len: 5, cover: 10 },
        { key: 'len4', len: 4, cover: 8 },
    ];
    const rollLines: BomLine[] = ROLL_META.filter((m) => plan.rollCounts[m.key] > 0).map((m) => ({
        id: `grass-${m.len}`,
        name: 'Luxigraze 30 Premium artificial grass',
        detail: `2 m × ${m.len} m Midi roll (covers ${m.cover} m²), 30 mm pile`,
        qty: plan.rollCounts[m.key],
        unit: 'rolls',
    }));

    // Membrane: Selco stocks two roll sizes; pick the cheaper-area mix.
    const membraneNeed = lawnM2 * 1.1;
    const big = Math.floor(membraneNeed / 50);
    const rem = membraneNeed - big * 50;
    const smalls = rem > 0 ? Math.ceil(rem / 14) : 0;
    // Three small rolls cost more area than one big one; consolidate.
    const membraneRolls =
        smalls >= 3 ? { big: big + 1, small: 0 } : { big, small: smalls };

    const fixingLines: BomLine[] = [
        ...(membraneRolls.big > 0
            ? [
                  {
                      id: 'membrane-big',
                      name: 'Plantex Professional weed control fabric',
                      detail: '2 m × 25 m roll (50 m²), laid under the grass',
                      qty: membraneRolls.big,
                      unit: 'rolls',
                  },
              ]
            : []),
        ...(membraneRolls.small > 0
            ? [
                  {
                      id: 'membrane-small',
                      name: 'TDP50 weed control fabric',
                      detail: '1 m × 14 m roll, laid under the grass',
                      qty: membraneRolls.small,
                      unit: 'rolls',
                  },
              ]
            : []),
        {
            id: 'pins',
            name: 'Luxigraze artificial grass fixing pins',
            detail: 'pack of 10, pinned ~400 mm around edges and seams',
            qty: units((perimeterM / 0.4 + plan.seamLengthM / 0.5) / 10),
            unit: 'packs',
        },
    ];

    if (plan.sideSeams + plan.crossSeams > 0) {
        fixingLines.push(
            {
                id: 'tape',
                name: 'Luxigraze artificial grass jointing tape',
                detail: '20 m roll, under every seam',
                qty: units(plan.seamLengthM / 20),
                unit: 'rolls',
            },
            {
                id: 'adhesive',
                name: 'Luxigraze artificial grass adhesive',
                detail: '310 ml cartridge, covers ~5 m of taped seam',
                qty: units(plan.seamLengthM / 5),
                unit: 'cartridges',
            },
        );
    }

    if (input.includeEdging) {
        fixingLines.push({
            id: 'edging',
            name: 'CORE EDGE 65 mm Black premium lawn edging',
            detail: 'pack of 5 (5 linear metres)',
            qty: units(perimeterM / 5),
            unit: 'packs',
        });
    }

    const groundLines: BomLine[] = input.includeGroundworks
        ? [
              {
                  id: 'mot',
                  name: 'MOT Type 1 Roadstone',
                  detail: 'Large Bag (~800 kg), 50 mm compacted',
                  qty: units((lawnM2 * 0.05 * 2200) / 850),
                  unit: 'bulk bags',
              },
              {
                  id: 'sharp-sand',
                  name: 'Concreting Sharp Sand',
                  detail: 'Large Bag (~800 kg), 25 mm laying course',
                  qty: units((lawnM2 * 0.025 * 1700) / 850),
                  unit: 'bulk bags',
              },
          ]
        : [];

    const finishLines: BomLine[] = input.includeInfill
        ? [
              {
                  id: 'infill',
                  name: 'Kiln Dried Sand 20 kg',
                  detail: '~5 kg per m² brushed into the pile',
                  qty: units((lawnM2 * 5) / 20),
                  unit: 'bags',
              },
          ]
        : [];

    const orientation = plan.stripsRunAlongLength ? 'along the length' : 'across the width';
    const totalSeams = plan.sideSeams + plan.crossSeams;
    const rollSummary = ROLL_META.filter((m) => plan.rollCounts[m.key] > 0)
        .map((m) => `${plan.rollCounts[m.key]} × ${m.len} m`)
        .join(' + ');

    return {
        facts: [
            { label: 'Lawn area', value: fmtM2(lawnM2) },
            { label: 'Roll plan', value: `${plan.strips.length} strips ${orientation}` },
            { label: 'Rolls', value: rollSummary || 'none' },
            { label: 'Seams', value: totalSeams === 0 ? 'none' : `${totalSeams} (${plan.seamLengthM.toFixed(1)} m)` },
        ],
        sections: [
            { title: 'Grass', lines: rollLines },
            { title: 'Membrane, pins & seams', lines: fixingLines },
            ...(groundLines.length ? [{ title: 'Groundworks', lines: groundLines }] : []),
            ...(finishLines.length ? [{ title: 'Finishing', lines: finishLines }] : []),
        ],
        tools: [
            'Sharp utility knife + spare blades, one fresh blade per 10 m of cut',
            'Turf cutter and wacker plate (hire) for the dig and compaction',
            'Landscaping rake and screed bar for the sand bed',
            'Stiff broom, brush the pile upright and work in the infill',
            'General-purpose silicone, seal any edging upstands',
            'Tape measure, string line and marking paint',
        ],
        notes: [
            'Grass comes in 2 m-wide rolls, lay every strip with the pile leaning the same way, towards the main viewpoint.',
            'Roll lengths chosen automatically to minimise waste, then seams; whole rolls are quoted, so trim the surplus on site.',
            input.includeGroundworks
                ? 'Build-up: 50 mm compacted MOT Type 1 + 25 mm sharp sand. Excavate ~75 mm.'
                : 'Groundworks excluded, assumes an existing prepared base.',
        ],
    };
}
