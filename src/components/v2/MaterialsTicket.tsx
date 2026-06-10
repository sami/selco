/**
 * @file src/components/v2/MaterialsTicket.tsx
 *
 * The "counter ticket" — renders any v2 BillOfMaterials as a trade-counter
 * style materials list with indicative pricing, a VAT toggle, and a
 * copy-to-clipboard action so the list can be pasted into a text or email.
 */

import { useState } from 'react';
import type { BillOfMaterials } from '../../calculators/v2/types';
import { bomTotal } from '../../calculators/v2/types';

const VAT_RATE = 0.2;

function gbp(n: number): string {
    return n.toLocaleString('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 2,
    });
}

function ticketAsText(bom: BillOfMaterials, incVat: boolean): string {
    const lines: string[] = ['MATERIALS LIST', ''];
    for (const f of bom.facts) lines.push(`${f.label}: ${f.value}`);
    lines.push('');
    for (const section of bom.sections) {
        lines.push(`-- ${section.title.toUpperCase()} --`);
        for (const l of section.lines) {
            lines.push(`${l.qty} ${l.unit}  ${l.name}${l.detail ? ` (${l.detail})` : ''}`);
        }
        lines.push('');
    }
    const total = bomTotal(bom) * (incVat ? 1 + VAT_RATE : 1);
    lines.push(`Estimated total ${incVat ? 'inc' : 'ex'} VAT: ${gbp(total)}`);
    lines.push('Indicative pricing — confirm at your local branch.');
    return lines.join('\n');
}

export default function MaterialsTicket({ bom }: { bom: BillOfMaterials }) {
    const [incVat, setIncVat] = useState(false);
    const [copied, setCopied] = useState(false);

    const exVat = bomTotal(bom);
    const shown = incVat ? exVat * (1 + VAT_RATE) : exVat;
    const vatFactor = incVat ? 1 + VAT_RATE : 1;

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(ticketAsText(bom, incVat));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Clipboard unavailable (permissions / non-secure context) — no-op.
        }
    };

    return (
        <section className="panel overflow-hidden shadow-sm bg-bg-section">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 px-5 py-3 bg-brand-yellow">
                <h2 className="text-sm font-extrabold uppercase tracking-[0.15em] text-brand-navy m-0">
                    Your materials list
                </h2>
                <button
                    type="button"
                    onClick={copy}
                    className="text-xs font-bold uppercase tracking-wider text-brand-navy border border-brand-navy/40 rounded-md px-3 py-1.5 hover:bg-brand-navy hover:text-white transition-colors cursor-pointer"
                >
                    {copied ? '✓ Copied' : 'Copy list'}
                </button>
            </div>

            {/* Facts strip */}
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border-default border-b border-border-default m-0">
                {bom.facts.map((f) => (
                    <div key={f.label} className="bg-bg-section px-4 py-3">
                        <dt className="text-[0.65rem] font-bold uppercase tracking-wider text-text-muted">
                            {f.label}
                        </dt>
                        <dd className="m-0 text-sm font-bold text-brand-navy">{f.value}</dd>
                    </div>
                ))}
            </dl>

            {/* Line items */}
            <div className="px-5 py-4">
                {bom.sections.map((section) => (
                    <div key={section.title} className="mb-4 last:mb-0">
                        <h3 className="text-[0.7rem] font-bold uppercase tracking-[0.15em] text-text-muted border-b border-dashed border-border-default pb-1.5 mb-1">
                            {section.title}
                        </h3>
                        <ul className="m-0 p-0 list-none divide-y divide-border-default/60">
                            {section.lines.map((l) => (
                                <li
                                    key={l.id}
                                    className="flex items-baseline justify-between gap-3 py-2"
                                >
                                    <div className="min-w-0">
                                        <span className="block text-sm font-semibold text-text-main">
                                            {l.name}
                                        </span>
                                        {l.detail && (
                                            <span className="block text-xs text-text-muted">
                                                {l.detail}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className="block text-sm font-bold text-brand-navy tabular-nums">
                                            {l.qty} {l.unit}
                                        </span>
                                        <span className="block text-xs text-text-muted tabular-nums">
                                            @ {gbp(l.unitPrice * vatFactor)} ·{' '}
                                            {gbp(l.qty * l.unitPrice * vatFactor)}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Total bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 bg-brand-navy">
                <button
                    type="button"
                    role="switch"
                    aria-checked={incVat}
                    onClick={() => setIncVat(!incVat)}
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                    <span
                        aria-hidden="true"
                        className={`relative w-9 h-5 rounded-full transition-colors ${
                            incVat ? 'bg-brand-yellow' : 'bg-white/25'
                        }`}
                    >
                        <span
                            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
                                incVat ? 'left-[18px]' : 'left-0.5'
                            }`}
                        />
                    </span>
                    {incVat ? 'Inc VAT' : 'Ex VAT'}
                </button>
                <div className="text-right">
                    <span className="block text-[0.65rem] font-bold uppercase tracking-wider text-white/70">
                        Estimated total ({incVat ? 'inc' : 'ex'} VAT)
                    </span>
                    <span className="block text-2xl font-extrabold text-brand-yellow tabular-nums leading-tight">
                        {gbp(shown)}
                    </span>
                </div>
            </div>

            {/* Notes */}
            {bom.notes.length > 0 && (
                <ul className="m-0 px-5 py-4 list-none space-y-1.5 bg-bg-page border-t border-border-default">
                    {bom.notes.map((n) => (
                        <li key={n} className="text-xs text-text-muted pl-4 relative">
                            <span
                                aria-hidden="true"
                                className="absolute left-0 top-1 w-2 h-2 rounded-sm bg-brand-yellow"
                            />
                            {n}
                        </li>
                    ))}
                    <li className="text-xs font-semibold text-brand-navy pl-4 relative">
                        <span
                            aria-hidden="true"
                            className="absolute left-0 top-1 w-2 h-2 rounded-sm bg-brand-navy"
                        />
                        Pricing is indicative, for concept demonstration only — confirm at
                        your local branch.
                    </li>
                </ul>
            )}
        </section>
    );
}
