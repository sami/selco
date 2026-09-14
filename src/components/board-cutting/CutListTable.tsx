import type { CuttingPlan } from '../../calculators/board-cutting';
import { notesFor } from './cutting-terms';

const cell = 'px-3 py-2 text-left align-top border-b border-border-default print:border-black';

export function CutListTable({ plan }: { plan: CuttingPlan }) {
  return (
    <table className="min-w-full text-sm border-collapse">
      <caption className="sr-only">Cut list</caption>
      <thead>
        <tr>
          {['Ref', 'Size (mm)', 'Qty', 'Notes'].map((h) => (
            <th key={h} scope="col" className={`${cell} font-bold`}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {plan.cutList.map((entry) => (
          <tr key={entry.ref} className="break-inside-avoid">
            <td className={`${cell} font-bold`}>{entry.ref}</td>
            <td className={cell}>{`${entry.wMm} × ${entry.hMm}`}</td>
            <td className={cell}>{entry.qty}</td>
            <td className={cell}>{notesFor(entry, plan.rotationAllowed).join('; ')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
