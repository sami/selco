import type { AdhesiveInput, AdhesiveResult } from './types';

/** Selco-stocked adhesive products with manufacturer TDS coverage rates. */
export const ADHESIVE_PRODUCTS = [
    { value: 'dunlop-rx3000', label: 'Dunlop RX-3000 (15 kg tub)', bagSize: 15, dryWallRate: 2, wetAreaRate: 3 },
    { value: 'dunlop-cx24', label: 'Dunlop CX-24 Essential (20 kg bag)', bagSize: 20, dryWallRate: 2, wetAreaRate: 3.5 },
    { value: 'dunlop-cf03', label: 'Dunlop CF-03 Flexible Fast Set (20 kg bag)', bagSize: 20, dryWallRate: 2, wetAreaRate: 4 },
    { value: 'mapei-standard', label: 'Mapei Standard Set Plus (20 kg bag)', bagSize: 20, dryWallRate: 2, wetAreaRate: 4 },
];

/**
 * Calculate adhesive needed for a tiling project.
 *
 * The coverage rate and bag size are provided by the caller (looked up from
 * {@link ADHESIVE_PRODUCTS} based on the selected product and application type).
 * Uneven substrates add +20% to the effective coverage rate.
 *
 * @param input - Area, coverage rate, bag size, substrate type, and wastage.
 * @returns Kg needed and bags needed.
 * @throws If area or coverage rate is zero or negative.
 */
export function calculateAdhesive(input: AdhesiveInput): AdhesiveResult {
    const { area, coverageRate, bagSize, substrate, wastage } = input;

    if (area <= 0) {
        throw new Error('Area must be greater than zero.');
    }
    if (coverageRate <= 0) {
        throw new Error('Coverage rate must be greater than zero.');
    }
    if (wastage < 0 || wastage > 100) {
        throw new Error('Wastage must be between 0 and 100.');
    }

    const substrateMultiplier = substrate === 'uneven' ? 1.2 : 1;
    const kgNeeded = area * coverageRate * substrateMultiplier * (1 + wastage / 100);
    const bagsNeeded = Math.ceil(kgNeeded / bagSize);

    return { kgNeeded, bagsNeeded };
}
