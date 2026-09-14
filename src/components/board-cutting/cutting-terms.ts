/**
 * The wording a customer signs on the board cutting sheet. Screen and print
 * both render from here, so what the TSA reads out is what gets signed.
 *
 * Plain English, not legal advice: check against the employer's terms of sale.
 */
import { PANEL_SAW, TOLERANCE_MM, type CutListEntry, type CuttingPlan } from '../../calculators/board-cutting';

export interface Term {
  id: string;
  title: string;
  text: string;
}

export const SIGN_OFF_STATEMENT = "I've checked the sizes, the cutting plan and the boards, and I agree to the terms above.";
export const SHEET_FOOTER = 'Produced with Trade Materials Calculator, an independent estimating tool.';

/** "A", "A and C", "A, B and D". */
export function formatRefs(refs: string[]): string {
  if (refs.length <= 1) return refs.join('');
  return `${refs.slice(0, -1).join(', ')} and ${refs[refs.length - 1]}`;
}

function pieceGroup(refs: string[]) {
  const one = refs.length === 1;
  return { subject: `${one ? 'Piece' : 'Pieces'} ${formatRefs(refs)} ${one ? 'is' : 'are'}`, them: one ? 'it' : 'them' };
}

function trimText(plan: CuttingPlan): string | null {
  const parts: string[] = [];
  if (plan.belowMinRefs.length > 0) {
    const g = pieceGroup(plan.belowMinRefs);
    parts.push(
      `${g.subject} below the saw's ${PANEL_SAW.minLongMm} × ${PANEL_SAW.minShortMm} mm minimum. We'll cut ${g.them} oversize and you'll need to trim ${g.them} yourself.`,
    );
  }
  if (plan.trimToWidthRefs.length > 0) {
    const g = pieceGroup(plan.trimToWidthRefs);
    parts.push(
      `${g.subject} narrower than the ${plan.sheet.wMm} mm worktop. Worktops are cut to length only, so you'll need to trim ${g.them} to width yourself.`,
    );
  }
  return parts.length > 0 ? parts.join(' ') : null;
}

export function buildCuttingTerms(plan: CuttingPlan): Term[] {
  const trim = trimText(plan);
  return [
    { id: 'sizes', title: 'Sizes', text: "We cut to the sizes in the cut list above. Check every line before you sign, because we can't change a size once it's been cut." },
    { id: 'tolerance', title: 'Tolerance', text: `Each cut piece can be up to ${TOLERANCE_MM} mm over or under the size listed. Allow for this in your fitting, for example with a small gap or by scribing to fit.` },
    { id: 'blade', title: 'Blade width', text: `The saw removes about ${PANEL_SAW.kerfMm} mm with every cut. The plan already allows for it, so leftover pieces will be slightly smaller than they look on paper.` },
    { id: 'board-choice', title: 'Board choice', text: "Our staff chose these boards. By signing, you confirm you've seen them and are happy they're free of damage or bowing before cutting starts." },
    { id: 'cut-edges', title: 'Cut edges', text: "Coated boards such as melamine or laminate can chip along a cut. Cut edges aren't finished and may need edging tape or a light sand." },
    {
      id: 'grain',
      title: 'Grain and pattern',
      text: plan.rotationAllowed
        ? 'Pieces may be turned on the sheet to save board. If grain or pattern direction matters, tell us before signing.'
        : 'Pieces are cut in the direction shown on the plan.',
    },
    ...(trim ? [{ id: 'trim', title: "Pieces we can't cut to size", text: trim }] : []),
    { id: 'once-cut', title: 'Once cut', text: 'Boards can move slightly with changes in temperature and humidity, so store cut pieces flat and dry.' },
    { id: 'returns', title: 'Returns', text: "Cut boards and offcuts can't be returned or refunded. This doesn't affect your rights if a board is faulty." },
    { id: 'estimate', title: 'Estimate', text: 'Sheet counts and layouts are worked out from the sizes given and are an estimate. Board sizes can vary slightly between batches.' },
  ];
}

/** Notes column for one cut list line. */
export function notesFor(entry: CutListEntry, rotationAllowed: boolean): string[] {
  if (!entry.fits) return ['Too big for this board'];
  const notes: string[] = [];
  if (rotationAllowed && entry.wMm !== entry.hMm) notes.push('May be turned to fit');
  if (entry.belowMin) notes.push('Below saw minimum: cut oversize, trim at home');
  if (entry.trimToWidth) notes.push('Cut to length only: trim to width at home');
  return notes;
}
