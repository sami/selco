/**
 * @file src/calculators/v2/french-drain.ts
 *
 * French drain estimator — mapped to Selco's stocked range.
 *
 * Selco doesn't stock perforated land drain coil, so the build here is the
 * classic stone-filled french drain: trench lined with Geotextile Fabric
 * GF609, filled with 20 mm clean limestone (never MOT — fines blind a
 * drain), wrapped over the top and capped. Options add a solid 110 mm
 * carrier pipe to take collected water to an outfall, and Core Water
 * soakaway crates where there's nowhere to discharge.
 */

import type { BillOfMaterials, BomLine } from './types';
import { units } from './types';

export interface FrenchDrainInput {
    /** Drain run in metres. */
    lengthM: number;
    /** Trench width in mm (300 or 450). */
    widthMm: number;
    /** Trench depth in mm. */
    depthMm: number;
    /** Solid 110 mm pipe from the drain to an outfall. */
    carrierPipe: boolean;
    /** Distance from drain end to the outfall/soakaway, metres. */
    carrierRunM: number;
    /** End the run in buried soakaway crates. */
    soakaway: boolean;
    /** Finish flush with decorative gravel instead of a topsoil cap. */
    gravelFinish: boolean;
}

export interface FrenchDrainPlan {
    stoneT: number;
    stoneBags: number;
    /** Geotextile linear metres of trench wrap (lining + top wrap). */
    wrapGirthM: number;
    crates: number;
}

const CAP_M = 0.15; // topsoil or decorative finish depth
const CRATE_M3 = 0.216; // Core Water crate 800 x 500 x 540

export function planFrenchDrain(input: FrenchDrainInput): FrenchDrainPlan {
    const widthM = input.widthMm / 1000;
    const depthM = input.depthMm / 1000;
    const stoneVolM3 = Math.max(0, input.lengthM * widthM * (depthM - CAP_M));
    const stoneT = stoneVolM3 * 1.6;
    return {
        stoneT,
        stoneBags: units((stoneT * 1000) / 800),
        wrapGirthM: widthM * 2 + depthM * 2 + 0.3,
        crates: input.soakaway ? Math.max(2, Math.ceil(1 / CRATE_M3 / 2)) : 0,
    };
}

export function calculateFrenchDrain(input: FrenchDrainInput): BillOfMaterials {
    const plan = planFrenchDrain(input);
    const len = input.lengthM;

    const lines: BomLine[] = [
        {
            id: 'geotextile',
            name: 'Geotextile Fabric GF609',
            detail: '4.5 × 11.1 m roll — line the trench, wrap over the top',
            qty: units((len * plan.wrapGirthM) / 49),
            unit: 'rolls',
        },
        {
            id: 'stone',
            name: '20 mm Grey Limestone',
            detail: 'Large Bag (~800 kg) — clean stone, never MOT',
            qty: plan.stoneBags,
            unit: 'Large Bags',
        },
    ];

    if (input.carrierPipe) {
        const pipes = units(input.carrierRunM / 3);
        lines.push(
            {
                id: 'pipe',
                name: 'FloPlast plain-ended underground pipe, 110 mm × 3 m',
                detail: 'solid carrier pipe from the drain to the outfall',
                qty: pipes,
                unit: 'lengths',
            },
            {
                id: 'couplers',
                name: 'Underground double socket coupler, 110 mm',
                detail: 'one per pipe joint',
                qty: Math.max(1, pipes - 1),
                unit: 'couplers',
            },
        );
    }

    if (input.soakaway) {
        lines.push({
            id: 'crates',
            name: 'Core Water soakaway crate with membrane',
            detail: '800 × 500 × 540 mm — wrapped, min 5 m from buildings',
            qty: 4,
            unit: 'crates',
        });
    }

    if (input.gravelFinish) {
        lines.push({
            id: 'finish',
            name: '20 mm Golden Gravel',
            detail: 'Large Bag — decorative flush finish over the wrap',
            qty: units((len * (input.widthMm / 1000) * CAP_M * 1600) / 800),
            unit: 'Large Bags',
        });
    }

    return {
        facts: [
            { label: 'Run', value: `${len.toFixed(1)} m` },
            { label: 'Trench', value: `${input.widthMm} × ${input.depthMm} mm` },
            { label: 'Stone', value: `${plan.stoneT.toFixed(1)} t` },
            { label: 'Fall', value: '1:100 min towards the outfall' },
        ],
        sections: [{ title: 'Drainage', lines }],
        tools: [
            'Trenching spade and mattock, or a micro digger (hire) past 10 m',
            'Wheelbarrow and scaffold boards to protect the lawn route',
            'Line level or laser for the 1:100 fall',
            'Cable avoidance tool before digging. Services love garden edges',
            'Heavy-duty gloves. Clean stone is sharp by design',
            'Skip or grab lorry for the spoil, a trench makes more than you think',
        ],
        notes: [
            'Clean stone only. MOT Type 1 has fines that blind a drain within a season.',
            'Wrap the geotextile right over the top of the stone before capping, that is what keeps silt out.',
            input.soakaway
                ? 'Soakaway crates sit wrapped in geotextile, at least 5 m from any building. Check ground soaks well first (a full bucket should drain in an hour).'
                : 'No soakaway selected. Make sure the run actually falls to somewhere water can go.',
            input.gravelFinish
                ? 'Gravel finish doubles as a soakaway strip for surface water.'
                : 'Cap with 150 mm of topsoil and turf if you want the lawn back over it.',
        ],
    };
}
