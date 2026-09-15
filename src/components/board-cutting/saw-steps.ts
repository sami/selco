/**
 * Wording for the saw operator's plan: one line per numbered cut step, and offcut sizes.
 * Rendered on screen and on the printed cutting sheet.
 */
import type { CutStep, CuttingPlan, Offcut } from '../../calculators/board-cutting';

export function describeStep(step: CutStep, plan: CuttingPlan): string {
  switch (step.kind) {
    case 'strip':
      return `Cut strip ${step.strip} across the full ${plan.sheet.wMm} mm width at ${step.atMm} mm`;
    case 'piece': {
      const trim = step.trimToMm === null ? '' : `, then trim to ${step.trimToMm} mm`;
      return `From strip ${step.strip}, cut ${step.ref} at ${step.atMm} mm${trim}`;
    }
    case 'length':
      return `Cut ${step.ref} at ${step.atMm} mm`;
  }
}

/** Smallest size the customer gets, width × height as drawn. */
export function describeOffcut(o: Offcut): string {
  return `${o.wMm} × ${o.hMm}`;
}
