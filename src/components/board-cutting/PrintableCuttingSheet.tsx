import type { CuttingPlan } from '../../calculators/board-cutting';
import { CutListTable } from './CutListTable';
import { CuttingTerms } from './CuttingTerms';
import { SawPlan } from './SawPlan';
import { SHEET_FOOTER, SIGN_OFF_STATEMENT, type Term } from './cutting-terms';

interface Props {
  plan: CuttingPlan;
  terms: Term[];
  printedAt: string;
}

/** Only visible in print. Rendered only when the plan is printable. */
export function PrintableCuttingSheet({ plan, terms, printedAt }: Props) {
  return (
    <section aria-label="Printable cutting sheet" className="hidden print:block text-black bg-white">
      <h1 className="text-2xl font-bold mb-3">Board cutting sheet</h1>

      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm mb-5">
        <dt className="font-bold">Board</dt>
        <dd className="m-0">{plan.sheet.label}</dd>
        <dt className="font-bold">Boards needed</dt>
        <dd className="m-0">{plan.layouts.length}</dd>
        <dt className="font-bold">Pieces may be turned</dt>
        <dd className="m-0">{plan.rotationAllowed ? 'Yes' : 'No'}</dd>
        <dt className="font-bold">Printed on</dt>
        <dd className="m-0">{printedAt}</dd>
      </dl>

      <SawPlan plan={plan} />

      <h2 className="text-lg font-bold mt-6 mb-2 break-after-avoid">Cut list</h2>
      <CutListTable plan={plan} />

      <h2 className="text-lg font-bold mt-6 mb-2 break-after-avoid">Please read before signing</h2>
      <CuttingTerms terms={terms} />

      <div className="break-inside-avoid mt-8 border-t border-black pt-4">
        <p className="font-bold text-sm">{SIGN_OFF_STATEMENT}</p>
        <div className="grid grid-cols-2 gap-8 mt-10 text-sm">
          <p className="m-0">Customer signature ______________________________</p>
          <p className="m-0">Date and time signed ____ / ____ / ______ ____ : ____</p>
        </div>
      </div>

      <p className="mt-8 text-xs">{SHEET_FOOTER}</p>
    </section>
  );
}
