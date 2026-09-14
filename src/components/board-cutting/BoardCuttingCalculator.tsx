import { useEffect, useId, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { flushSync } from 'react-dom';
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

type Field = keyof PieceRow;

interface Row extends PieceRow {
  key: number;
  /** Fields holding text the browser couldn't read as a number, which it reports as an empty value. */
  bad: Partial<Record<Field, boolean>>;
  /** Set once any of the row's inputs has lost focus. */
  touched: boolean;
}

interface RowStatus {
  ref: string;
  error: string | null;
  /** Input errors wait until both sizes are in or the row has lost focus; "too big" shows straight away. */
  shown: boolean;
  sizeInvalid: boolean;
  qtyInvalid: boolean;
}

const selectClass =
  'block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm bg-white focus:border-selco-navy focus:outline-none focus:ring-1 focus:ring-selco-navy text-neutral-grey-800';

const BLANK_ROW: PieceRow = { w: '', h: '', qty: '1' };

const formatNow = () => new Date().toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' });

const hasEntry = (r: Row, f: Field) => r[f].trim() !== '' || r.bad[f] === true;
/** A row with no width and no height yet hasn't been started, so it's ignored rather than flagged. */
const isBlank = (r: Row) => !hasEntry(r, 'w') && !hasEntry(r, 'h') && !r.bad.qty;
const toNumber = (r: Row, f: Field) => (r.bad[f] ? NaN : Number(r[f]));
const toPiece = (r: Row): PieceInput => ({ wMm: toNumber(r, 'w'), hMm: toNumber(r, 'h'), qty: toNumber(r, 'qty') });
const isWholeMm = (n: number) => Number.isInteger(n) && n > 0;
const isValidQty = (n: number) => Number.isInteger(n) && n >= 1 && n <= MAX_QTY;

let nextKey = 0;
const newRow = (r: PieceRow): Row => ({ ...r, key: nextKey++, bad: {}, touched: false });

interface Props {
  initialRows?: PieceRow[];
}

export function BoardCuttingCalculator({ initialRows = [BLANK_ROW] }: Props) {
  const uid = useId();
  const boardTypeId = `${uid}-board-type`;
  const printStatusId = `${uid}-print-status`;

  const [sheetId, setSheetId] = useState<SheetId>('sheet');
  const [allowRotation, setAllowRotation] = useState(true);
  const [rows, setRows] = useState<Row[]>(() => {
    const start = initialRows.slice(0, MAX_PIECES);
    return (start.length > 0 ? start : [BLANK_ROW]).map(newRow);
  });
  // Set after mount and again as the print dialog opens, never at build time.
  const [printedAt, setPrintedAt] = useState('');

  // The browser snapshots the page for print straight after beforeprint, so the stamp must be committed synchronously.
  const stampNow = () => flushSync(() => setPrintedAt(formatNow()));

  useEffect(() => {
    setPrintedAt(formatNow());
    const stamp = () => flushSync(() => setPrintedAt(formatNow()));
    window.addEventListener('beforeprint', stamp);
    return () => window.removeEventListener('beforeprint', stamp);
  }, []);

  const removeButtons = useRef(new Map<number, HTMLButtonElement>());
  const widthInputs = useRef(new Map<number, HTMLInputElement>());
  const pendingFocus = useRef<{ key: number; target: 'remove' | 'width' } | null>(null);

  useEffect(() => {
    const pending = pendingFocus.current;
    if (!pending) return;
    pendingFocus.current = null;
    const el = pending.target === 'remove' ? removeButtons.current.get(pending.key) : widthInputs.current.get(pending.key);
    el?.focus();
  }, [rows]);

  const { filledCount, plan, status } = useMemo(() => {
    const filled = rows.filter((r) => !isBlank(r));
    const pieces = filled.map(toPiece);
    const inputErrors = pieces.map(validatePiece);
    const plan =
      filled.length > 0 && inputErrors.every((e) => e === null)
        ? planCutting({ sheetId, pieces, allowRotation })
        : null;

    const status = new Map<number, RowStatus>();
    filled.forEach((r, i) => {
      const { wMm, hMm, qty } = pieces[i];
      const inputError = inputErrors[i];
      const tooBig = plan !== null && !plan.cutList[i].fits;
      const sizeWrong = !isWholeMm(wMm) || !isWholeMm(hMm);
      status.set(r.key, {
        ref: String.fromCharCode(65 + i),
        error: inputError ?? (tooBig ? 'Too big for this board' : null),
        shown: tooBig || (inputError !== null && ((hasEntry(r, 'w') && hasEntry(r, 'h')) || r.touched)),
        sizeInvalid: sizeWrong || tooBig,
        // The message names the size problem first, so quantity is only marked once the sizes are right.
        qtyInvalid: !sizeWrong && !isValidQty(qty),
      });
    });
    return { filledCount: filled.length, plan, status };
  }, [rows, sheetId, allowRotation]);

  const terms = useMemo(() => (plan ? buildCuttingTerms(plan) : null), [plan]);

  const sheet = SHEET_FORMATS.find((s) => s.id === sheetId)!;
  const errors = [...status.values()].filter((s) => s.error !== null);
  const printBlockedReason =
    filledCount === 0
      ? 'Add at least one piece before printing.'
      : errors.length === 0
        ? null
        : errors.some((s) => s.shown)
          ? 'Fix the highlighted pieces before printing.'
          : 'Finish entering the pieces before printing.';

  const orientationHelp = sheet.crossCutOnly
    ? `Width is the depth across the worktop, up to ${sheet.wMm} mm, and height is the length.`
    : `Width runs across the ${sheet.wMm} mm side and height along the ${sheet.hMm} mm side, as drawn.`;

  const edit = (key: number, field: Field) => (e: ChangeEvent<HTMLInputElement>) => {
    const { value, validity } = e.target;
    setRows((rs) =>
      rs.map((r) => (r.key === key ? { ...r, [field]: value, bad: { ...r.bad, [field]: validity.badInput } } : r)),
    );
  };
  const touch = (key: number) =>
    setRows((rs) =>
      rs.some((r) => r.key === key && !r.touched) ? rs.map((r) => (r.key === key ? { ...r, touched: true } : r)) : rs,
    );
  const remove = (key: number) => {
    const index = rows.findIndex((r) => r.key === key);
    const rest = rows.filter((r) => r.key !== key);
    if (rest.length === 0) {
      const fresh = newRow(BLANK_ROW);
      pendingFocus.current = { key: fresh.key, target: 'width' };
      setRows([fresh]);
    } else {
      pendingFocus.current = { key: rest[Math.min(index, rest.length - 1)].key, target: 'remove' };
      setRows(rest);
    }
  };
  const add = () => setRows((rs) => [...rs, newRow(BLANK_ROW)]);

  const piecesPlanned = plan ? plan.layouts.reduce((n, l) => n + l.pieces.length, 0) : 0;

  return (
    <div className="space-y-8">
      <div className="space-y-8 print:hidden">
        <form onSubmit={(e) => e.preventDefault()} noValidate className="card space-y-5" aria-label="Board cutting optimiser">
          <FormField id={boardTypeId} label="Board type" helperText={orientationHelp}>
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
                const s = status.get(row.key);
                const ref = s?.ref ?? '';
                const error = s?.shown ? s.error : null;
                const name = ref ? `piece ${ref}` : 'new piece';
                const errorId = `${uid}-piece-${row.key}-error`;
                const mark = (invalid: boolean) => ({ 'aria-invalid': invalid, 'aria-describedby': invalid ? errorId : undefined });
                const sizeMark = mark(error !== null && s!.sizeInvalid);
                const qtyMark = mark(error !== null && s!.qtyInvalid);
                return (
                  <li key={row.key}>
                    <div className="grid grid-cols-[1.5rem_1fr_1fr_4.5rem_2.75rem] gap-2 items-center">
                      <span className="font-bold text-brand-navy" aria-hidden="true">{ref}</span>
                      <NumberInput
                        ref={(el) => {
                          if (el) widthInputs.current.set(row.key, el);
                          else widthInputs.current.delete(row.key);
                        }}
                        aria-label={`Width of ${name}`}
                        unit="mm"
                        min="1"
                        step="1"
                        value={row.w}
                        onChange={edit(row.key, 'w')}
                        onBlur={() => touch(row.key)}
                        {...sizeMark}
                      />
                      <NumberInput aria-label={`Height of ${name}`} unit="mm" min="1" step="1" value={row.h} onChange={edit(row.key, 'h')} onBlur={() => touch(row.key)} {...sizeMark} />
                      <NumberInput aria-label={`Quantity of ${name}`} min="1" max={MAX_QTY} step="1" value={row.qty} onChange={edit(row.key, 'qty')} onBlur={() => touch(row.key)} {...qtyMark} />
                      <button
                        ref={(el) => {
                          if (el) removeButtons.current.set(row.key, el);
                          else removeButtons.current.delete(row.key);
                        }}
                        type="button"
                        aria-label={`Remove ${name}`}
                        onClick={() => remove(row.key)}
                        className="btn-ghost !min-w-0 !px-0"
                      >
                        ×
                      </button>
                    </div>
                    {/* Always rendered so screen readers pick up the error when it appears. */}
                    <p id={errorId} aria-live="polite" className={`text-sm text-error-red font-medium m-0 ${error ? 'mt-1' : ''}`}>
                      {error}
                    </p>
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
            aria-describedby={printBlockedReason ? printStatusId : undefined}
            onClick={() => {
              stampNow();
              window.print();
            }}
          >
            Print cutting sheet
          </button>
          {/* Always rendered so screen readers pick up the reason when it changes. */}
          <p id={printStatusId} aria-live="polite" className="text-sm text-text-muted m-0">
            {printBlockedReason}
          </p>
        </div>
      </div>

      {plan && terms && printBlockedReason === null ? (
        <PrintableCuttingSheet plan={plan} terms={terms} printedAt={printedAt} />
      ) : (
        <p className="hidden print:block">{printBlockedReason}</p>
      )}
    </div>
  );
}
