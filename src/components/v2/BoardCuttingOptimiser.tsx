/**
 * @file src/components/v2/BoardCuttingOptimiser.tsx
 *
 * Board cutting optimiser island — a dynamic parts list on the left, and
 * the actual sheet-by-sheet cutting plan drawn on the blueprint: every
 * part placed, labelled and shaded, waste left dark.
 */

import { useMemo, useState } from 'react';
import {
    calculateCutting,
    PANEL_SAW,
    planCutting,
    SHEET_FORMATS,
    type CuttingInput,
    type RequiredPart,
} from '../../calculators/v2/board-cutting';
import { BlueprintPanel, JobCard, ToggleRow } from './ui';
import MaterialsTicket from './MaterialsTicket';

const YELLOW = '#ffd407';
const PART_FILLS = ['rgba(255,255,255,0.22)', 'rgba(255,255,255,0.15)', 'rgba(255,212,7,0.25)', 'rgba(255,255,255,0.30)'];

function CuttingPreview({ input }: { input: CuttingInput }) {
    const plan = useMemo(() => planCutting(input), [input]);
    const shown = plan.layouts.slice(0, 6);
    const more = plan.layouts.length - shown.length;

    if (plan.layouts.length === 0) {
        return (
            <p className="text-sm text-white/80 text-center py-10 m-0">
                Add at least one part below the sheet size to see a cutting plan.
            </p>
        );
    }

    // Sheets drawn side by side; viewBox scales to the row.
    const sheetW = plan.sheet.wMm;
    const sheetH = plan.sheet.hMm;
    const GAP = sheetW * 0.14;
    const totalW = shown.length * sheetW + (shown.length - 1) * GAP;
    const PADX = totalW * 0.04 + 60;
    const PADY = sheetH * 0.12;
    const W = totalW + PADX * 2;
    const H = sheetH + PADY * 2.4;
    const fontL = sheetW / 11;

    return (
        <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-auto"
            role="img"
            aria-label={`Cutting plan across ${plan.layouts.length} sheets`}
        >
            {shown.map((layout, si) => {
                const x0 = PADX + si * (sheetW + GAP);
                const y0 = PADY;
                return (
                    <g key={si}>
                        <rect x={x0} y={y0} width={sheetW} height={sheetH} fill="rgba(0,0,0,0.25)" stroke="#fff" strokeWidth={sheetW / 200} />
                        {layout.parts.map((p, pi) => (
                            <g key={pi}>
                                {/* cross-cut-only: the saw pass runs the full width */}
                                {plan.sheet.crossCutOnly && (
                                    <line
                                        x1={x0}
                                        y1={y0 + p.yMm + p.hMm}
                                        x2={x0 + sheetW}
                                        y2={y0 + p.yMm + p.hMm}
                                        stroke="#fff"
                                        strokeWidth={sheetW / 150}
                                        strokeDasharray={`${sheetW / 40} ${sheetW / 60}`}
                                    />
                                )}
                                <rect
                                    x={x0 + p.xMm}
                                    y={y0 + p.yMm}
                                    width={p.wMm}
                                    height={p.hMm}
                                    fill={PART_FILLS[pi % PART_FILLS.length]}
                                    stroke={YELLOW}
                                    strokeWidth={sheetW / 300}
                                />
                                {p.wMm > sheetW / 5 && p.hMm > sheetH / 14 && (
                                    <text
                                        x={x0 + p.xMm + p.wMm / 2}
                                        y={y0 + p.yMm + p.hMm / 2}
                                        fill="#fff"
                                        fontSize={fontL}
                                        fontWeight="600"
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        transform={
                                            p.hMm > p.wMm * 1.6
                                                ? `rotate(-90 ${x0 + p.xMm + p.wMm / 2} ${y0 + p.yMm + p.hMm / 2})`
                                                : undefined
                                        }
                                    >
                                        {p.label}
                                        {p.rotated ? ' ↻' : ''}
                                        {(p.belowMin || p.needsRip) && plan.sheet.sawEligible ? ' ⚠' : ''}
                                    </text>
                                )}
                            </g>
                        ))}
                        <text x={x0 + sheetW / 2} y={y0 + sheetH + fontL * 1.8} fill={YELLOW} fontSize={fontL} fontWeight="700" textAnchor="middle">
                            Sheet {si + 1} — {Math.round(layout.utilisation * 100)}% used
                        </text>
                    </g>
                );
            })}
            {more > 0 && (
                <text x={W - PADX / 2} y={PADY + sheetH / 2} fill={YELLOW} fontSize={fontL * 2} fontWeight="700" textAnchor="middle">
                    +{more}
                </text>
            )}
        </svg>
    );
}

let nextId = 100;

export default function BoardCuttingOptimiser() {
    const [sheetId, setSheetId] = useState('plywood');
    const [allowRotation, setAllowRotation] = useState(true);
    const [parts, setParts] = useState<RequiredPart[]>([
        { id: 'p1', wMm: 800, hMm: 600, qty: 4 },
        { id: 'p2', wMm: 1200, hMm: 400, qty: 2 },
        { id: 'p3', wMm: 600, hMm: 400, qty: 6 },
    ]);

    const input: CuttingInput = useMemo(
        () => ({ sheetId, parts, allowRotation }),
        [sheetId, parts, allowRotation],
    );
    const bom = useMemo(() => calculateCutting(input), [input]);

    const updatePart = (id: string, patch: Partial<RequiredPart>) =>
        setParts((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    const removePart = (id: string) => setParts((ps) => ps.filter((p) => p.id !== id));
    const addPart = () =>
        setParts((ps) => [...ps, { id: `p${nextId++}`, wMm: 600, hMm: 400, qty: 1 }]);

    const clamp = (v: number, max: number) =>
        Number.isFinite(v) ? Math.min(max, Math.max(0, Math.round(v))) : 0;

    const sheet = SHEET_FORMATS.find((s) => s.id === sheetId) ?? SHEET_FORMATS[0];

    return (
        <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)] items-start">
            <JobCard title="Sheet & parts">
                <div>
                    <label htmlFor="sheet-type" className="form-label text-sm">
                        Sheet material
                    </label>
                    <select
                        id="sheet-type"
                        className="form-select"
                        value={sheetId}
                        onChange={(e) => setSheetId(e.target.value)}
                    >
                        {SHEET_FORMATS.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* In-store cutting service banner */}
                <div
                    className={`flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-xs leading-relaxed border ${
                        sheet.sawEligible
                            ? 'bg-brand-navy text-white/90 border-brand-navy'
                            : 'bg-brand-yellow/20 text-brand-navy border-brand-yellow'
                    }`}
                >
                    <i
                        className={`fas ${sheet.sawEligible ? 'fa-circle-check text-brand-yellow' : 'fa-circle-exclamation'} mt-0.5`}
                        aria-hidden="true"
                    ></i>
                    <span>
                        {sheet.crossCutOnly ? (
                            <>
                                <strong>Cross-cuts to length only</strong> — worktops are cut
                                across the width in store ({PANEL_SAW.kerfMm} mm kerf). No
                                lengthways rips: narrower pieces are trimmed at home.
                            </>
                        ) : sheet.sawEligible ? (
                            <>
                                <strong>Cut in store</strong> on our vertical panel saw —
                                straight cuts, {PANEL_SAW.kerfMm} mm kerf, min part{' '}
                                {PANEL_SAW.minLMm} × {PANEL_SAW.minHFittedMm} mm.
                            </>
                        ) : (
                            <>
                                <strong>Not cut in store</strong> — plasterboard is score &amp;
                                snap at home. We cut sheet materials like ply, MDF, OSB,
                                chipboard and worktops.
                            </>
                        )}
                    </span>
                </div>

                {!sheet.crossCutOnly && (
                    <ToggleRow
                        label="Allow rotation"
                        hint="Turn off when grain / face direction matters"
                        checked={allowRotation}
                        onChange={setAllowRotation}
                    />
                )}

                <div>
                    <div className="grid grid-cols-[1fr_1fr_72px_32px] gap-2 items-center mb-1.5">
                        <span className="text-[0.65rem] font-bold uppercase tracking-wider text-text-muted">Width mm</span>
                        <span className="text-[0.65rem] font-bold uppercase tracking-wider text-text-muted">Height mm</span>
                        <span className="text-[0.65rem] font-bold uppercase tracking-wider text-text-muted">Qty</span>
                        <span />
                    </div>
                    <ul className="m-0 p-0 list-none space-y-2">
                        {parts.map((p) => (
                            <li key={p.id} className="grid grid-cols-[1fr_1fr_72px_32px] gap-2 items-center">
                                <input
                                    type="number"
                                    aria-label="Part width in millimetres"
                                    className="form-input !h-10 !px-2"
                                    value={p.wMm || ''}
                                    min={10}
                                    max={3000}
                                    onChange={(e) => updatePart(p.id, { wMm: clamp(parseFloat(e.target.value), 3000) })}
                                />
                                <input
                                    type="number"
                                    aria-label="Part height in millimetres"
                                    className="form-input !h-10 !px-2"
                                    value={p.hMm || ''}
                                    min={10}
                                    max={3000}
                                    onChange={(e) => updatePart(p.id, { hMm: clamp(parseFloat(e.target.value), 3000) })}
                                />
                                <input
                                    type="number"
                                    aria-label="Part quantity"
                                    className="form-input !h-10 !px-2"
                                    value={p.qty || ''}
                                    min={1}
                                    max={50}
                                    onChange={(e) => updatePart(p.id, { qty: clamp(parseFloat(e.target.value), 50) })}
                                />
                                <button
                                    type="button"
                                    aria-label={`Remove ${p.wMm} by ${p.hMm} part`}
                                    onClick={() => removePart(p.id)}
                                    className="h-10 rounded-md border border-border-default text-text-muted hover:text-destructive hover:border-destructive transition-colors cursor-pointer"
                                >
                                    ×
                                </button>
                            </li>
                        ))}
                    </ul>
                    <button type="button" onClick={addPart} className="btn-ghost w-full mt-3 !min-h-[40px] text-sm">
                        + Add another part
                    </button>
                </div>
            </JobCard>

            <div className="space-y-6">
                <BlueprintPanel title="Cutting plan">
                    <CuttingPreview input={input} />
                </BlueprintPanel>
                <MaterialsTicket bom={bom} />
            </div>
        </div>
    );
}
