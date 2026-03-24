/**
 * @file src/calculators/registry.ts
 *
 * Calculator registry — re-exports the single source of truth from
 * `src/projects/registry.ts` so that consumers can import from a single
 * canonical calculators path:
 *
 * ```ts
 * import { CALCULATOR_REGISTRY } from '../calculators/registry';
 * // or via the barrel:
 * import { CALCULATOR_REGISTRY } from '../calculators';
 * ```
 *
 * The actual registry data lives in `src/projects/registry.ts`.
 * Edit that file to add, remove, or update calculator entries.
 *
 * @see {@link ../../projects/registry.ts} for the authoritative registry
 */

export {
    CALCULATOR_REGISTRY,
    PROJECT_CALCULATORS,
    HANDY_CALCULATORS,
    LIVE_CALCULATORS,
    getCalculatorById,
} from '../projects/registry';
