import { useEffect, useState } from 'react';
import {
  MAX_PIECES,
  MAX_QTY,
  PANEL_SAW,
  SHEET_FORMATS,
  planCutting,
  validatePiece,
  type PieceInput,
  type SheetId,
} from '../../calculators/board-cutting';
import { FormField } from '../ui/FormField';
import { NumberInput } from '../ui/NumberInput';
import { ResultCard } from '../ui/ResultCard';
import { CutListTable } from './CutListTable';
import { CuttingPlanDrawing } from './CuttingPlanDrawing';
import { CuttingTerms } from './CuttingTerms';
import { PrintableCuttingSheet } from './PrintableCuttingSheet';
import { buildCuttingTerms } from './cutting-terms';

export interface PieceRow {
  w: string;
  h: string;
  qty: string;
}

interface Row extends PieceRow {
  key: number;
}

const selectClass =
  'block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm bg-white focus:border-selco-navy focus:outline-none focus:ring-1 focus:ring-selco-navy text-neutral-grey-800';

const formatNow = () => new Date().toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' });

/** A row with no width and no height yet hasn't been started, so it's ignored rather than flagged. */
const isBlank = (r: PieceRow) => r.w.trim() === '' && r.h.trim() === '';
const toPiece = (r: PieceRow): PieceInput => ({ wMm: Number(r.w), hMm: Number(r.h), qty: Number(r.qty) });

let nextKey = 0;
const withKey = (r: PieceRow): Row => ({ ...r, key: nextKey++ });

interface Props {
  initialRows?: PieceRow[];
}

export function BoardCuttingCalculator({ initialRows = [{ w: '', h: '', qty: '1' }] }: Props) {
  const [sheetId, setSheetId] = useState<SheetId>('sheet');
  const [allowRotation, setAllowRotation] = useState(true);
  const [rows, setRows] = useState<Row[]>(() => initialRows.map(withKey));
  // Set after mount and again as the print dialog opens, never at build time.
  const [printedAt, setPrintedAt] = useState('');

  useEffect(() => {
    const stamp = () => setPrintedAt(formatNow());
    stamp();
    window.addEventListener('beforeprint', stamp);
    return () => window.removeEventListener('beforeprint', stamp);
  }, []);

  const sheet = SHEET_FORMATS.find((s) => s.id === sheetId)!;
  const filled = rows.filter((r) => !isBlank(r));
  const inputError = new Map(filled.map((r) => [r.key, validatePiece(toPiece(r))]));
  const inputsValid = filled.every((r) => inputError.get(r.key) === null);

  const plan = inputsValid && filled.length > 0
    ? planCutting({ sheetId, pieces: filled.map(toPiece), allowRotation })
    : null;

  const refOf = (row: Row) => {
    const i = filled.indexOf(row);
    return i === -1 ? '' : String.fromCharCode(65 + i);
  };
  const rowError = (row: Row): string | null => {
    const i = filled.indexOf(row);
    if (i === -1) return null;
    return inputError.get(row.key) ?? (plan && !plan.cutList[i].fits ? 'Too big for this board' : null);
  };

  const hasErrors = filled.some((r) => rowError(r) !== null);
  const printBlockedReason =
    filled.length === 0
      ? 'Add at least one piece before printing.'
      : hasErrors
        ? 'Fix the highlighted pieces before printing.'
        : null;
  const terms = plan ? buildCuttingTerms(plan) : null;

  const orientationHelp = sheet.crossCutOnly
    ? `Width is the depth across the worktop, up to ${sheet.wMm} mm, and height is the length.`
    : `Width runs across the ${sheet.wMm} mm side and height along the ${sheet.hMm} mm side, as drawn.`;

  const update = (key: number, patch: Partial<PieceRow>) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const remove = (key: number) => setRows((rs) => rs.filter((r) => r.key !== key));
  const add = () => setRows((rs) => [...rs, withKey({ w: '', h: '', qty: '1' })]);

  const piecesPlanned = plan ? plan.layouts.reduce((n, l) => n + l.pieces.length, 0) : 0;

  return (
    <div className="space-y-8">
      <div className="space-y-8 print:hidden">
        <form onSubmit={(e) => e.preventDefault()} noValidate className="card space-y-5" aria-label="Board cutting optimiser">
          <FormField id="board-type" label="Board type" helperText={orientationHelp}>
            <select value={sheetId} onChange={(e) => setSheetId(e.target.value as SheetId)} className={selectClass}>
              {SHEET_FORMATS.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </FormField>

          <p className="text-sm text-text-muted m-0">
            {`Straight cuts on a vertical panel saw with a ${PANEL_SAW.kerfMm} mm blade. The smallest piece it can cut is ${PANEL_SAW.minLongMm} × ${PANEL_SAW.minShortMm} mm.`}
          </p>

          {sheet.crossCutOnly ? (
            <p className="text-sm text-text-muted m-0">Worktops are cut to length only, never along their length.</p>
          ) : (
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-selco-navy">
                <input type="checkbox" checked={allowRotation} onChange={(e) => setAllowRotation(e.target.checked)} />
                Pieces may be turned to fit
              </label>
              <p className="text-sm text-gray-500 m-0 mt-1">Untick if grain or pattern direction matters.</p>
            </div>
          )}

          <fieldset className="space-y-3">
            <legend className="text-sm font-bold text-selco-navy mb-2">Pieces (mm)</legend>
            <ul className="list-none m-0 p-0 space-y-3">
              {rows.map((row) => {
                const ref = refOf(row);
                const error = rowError(row);
                const name = ref ? `piece ${ref}` : 'new piece';
                const errorId = `piece-${row.key}-error`;
                const invalid = { 'aria-invalid': error !== null, 'aria-describedby': error ? errorId : undefined };
                return (
                  <li key={row.key}>
                    <div className="grid grid-cols-[1.5rem_1fr_1fr_4.5rem_2.75rem] gap-2 items-center">
                      <span className="font-bold text-brand-navy" aria-hidden="true">{ref}</span>
                      <NumberInput aria-label={`Width of ${name}`} unit="mm" min="1" step="1" value={row.w} onChange={(e) => update(row.key, { w: e.target.value })} {...invalid} />
                      <NumberInput aria-label={`Height of ${name}`} unit="mm" min="1" step="1" value={row.h} onChange={(e) => update(row.key, { h: e.target.value })} {...invalid} />
                      <NumberInput aria-label={`Quantity of ${name}`} min="1" max={MAX_QTY} step="1" value={row.qty} onChange={(e) => update(row.key, { qty: e.target.value })} {...invalid} />
                      <button type="button" aria-label={`Remove ${name}`} onClick={() => remove(row.key)} className="btn-ghost !min-w-0 !px-0">
                        ×
                      </button>
                    </div>
                    {error && (
                      <p id={errorId} className="text-sm text-error-red font-medium m-0 mt-1">{error}</p>
                    )}
                  </li>
                );
              })}
            </ul>
            <button type="button" onClick={add} disabled={rows.length >= MAX_PIECES} className="btn-ghost">
              Add another piece
            </button>
          </fieldset>
        </form>

        {plan && (
          <section aria-label="Cutting plan" className="space-y-6">
            <ResultCard
              title="Estimated boards needed"
              quantity={plan.layouts.length}
              unit={sheet.crossCutOnly ? 'worktops' : 'sheets'}
              detail={`${piecesPlanned} pieces planned with a ${PANEL_SAW.kerfMm} mm blade allowance between cuts`}
            />
            <div className="card text-brand-navy">
              <CuttingPlanDrawing plan={plan} />
            </div>
            <div className="card overflow-x-auto">
              <CutListTable plan={plan} />
            </div>
          </section>
        )}

        {terms && (
          <section aria-label="Terms the customer signs" className="card space-y-3">
            <h2 className="text-lg font-bold text-brand-navy m-0">Terms the customer signs</h2>
            <p className="text-sm text-text-muted m-0">Go through these with the customer before printing.</p>
            <CuttingTerms terms={terms} />
          </section>
        )}

        <div className="space-y-2">
          <button
            type="button"
            className="btn-accent"
            disabled={printBlockedReason !== null}
            aria-describedby={printBlockedReason ? 'print-status' : undefined}
            onClick={() => window.print()}
          >
            Print cutting sheet
          </button>
          {printBlockedReason && (
            <p id="print-status" className="text-sm text-text-muted m-0">{printBlockedReason}</p>
          )}
        </div>
      </div>

      {plan && terms && printBlockedReason === null ? (
        <PrintableCuttingSheet plan={plan} terms={terms} printedAt={printedAt} />
      ) : (
        <p className="hidden print:block">Fix the pieces on screen before printing this sheet.</p>
      )}
    </div>
  );
}
