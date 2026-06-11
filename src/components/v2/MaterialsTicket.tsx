/**
 * @file src/components/v2/MaterialsTicket.tsx
 *
 * The "counter ticket" — renders any v2 BillOfMaterials as a trade-counter
 * style materials list: quantities of named products, a tick-off tools and
 * consumables checklist, and a copy-to-clipboard action so the list can be
 * pasted into a text or email.
 *
 * Deliberately price-free: quantities first, product mapping and live
 * branch pricing are a later phase.
 */

import { useState } from 'react';
import type { BillOfMaterials } from '../../calculators/v2/types';
import { bomLineCount } from '../../calculators/v2/types';

function ticketAsText(bom: BillOfMaterials): string {
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
    if (bom.tools.length) {
        lines.push('-- TOOLS & CONSUMABLES --');
        for (const t of bom.tools) lines.push(`[ ] ${t}`);
        lines.push('');
    }
    if (bom.notes.length) {
        lines.push('-- NOTES --');
        for (const n of bom.notes) lines.push(`- ${n}`);
        lines.push('');
    }
    lines.push('Quantities are estimates. Check coverage and site conditions before ordering.');
    return lines.join('\n');
}

export default function MaterialsTicket({ bom }: { bom: BillOfMaterials }) {
    const [copied, setCopied] = useState(false);
    const [ticked, setTicked] = useState<Set<string>>(new Set());

    const toggleTool = (t: string) =>
        setTicked((prev) => {
            const next = new Set(prev);
            if (next.has(t)) next.delete(t);
            else next.add(t);
            return next;
        });

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(ticketAsText(bom));
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
                                    <span className="shrink-0 text-sm font-bold text-brand-navy tabular-nums">
                                        {l.qty} {l.unit}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Tools & consumables checklist */}
            {bom.tools.length > 0 && (
                <div className="px-5 py-4 bg-brand-navy">
                    <h3 className="flex items-center gap-2 text-[0.7rem] font-bold uppercase tracking-[0.15em] text-brand-yellow mb-2">
                        <i className="fas fa-toolbox" aria-hidden="true"></i>
                        Tools &amp; consumables — don't get caught short
                    </h3>
                    <ul className="m-0 p-0 list-none space-y-1">
                        {bom.tools.map((t) => {
                            const done = ticked.has(t);
                            return (
                                <li key={t}>
                                    <button
                                        type="button"
                                        onClick={() => toggleTool(t)}
                                        aria-pressed={done}
                                        className="w-full flex items-start gap-2.5 py-1.5 text-left cursor-pointer group"
                                    >
                                        <span
                                            aria-hidden="true"
                                            className={`mt-0.5 shrink-0 w-4 h-4 rounded-sm border flex items-center justify-center text-[0.6rem] font-bold transition-colors ${
                                                done
                                                    ? 'bg-brand-yellow border-brand-yellow text-brand-navy'
                                                    : 'border-white/40 text-transparent group-hover:border-brand-yellow'
                                            }`}
                                        >
                                            ✓
                                        </span>
                                        <span
                                            className={`text-xs leading-relaxed transition-colors ${
                                                done ? 'text-white/45 line-through' : 'text-white/85'
                                            }`}
                                        >
                                            {t}
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}

            {/* Summary bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 bg-bg-page border-t border-border-default">
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                    {bomLineCount(bom)} order lines · {bom.tools.length} checklist items
                </span>
                <span className="text-xs text-text-muted">
                    Take this list to your local branch or Click &amp; Deliver
                </span>
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
                        Quantities are estimates — verify product coverage and site
                        conditions before ordering.
                    </li>
                </ul>
            )}
        </section>
    );
}
