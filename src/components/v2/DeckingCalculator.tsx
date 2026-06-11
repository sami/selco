/**
 * @file src/components/v2/DeckingCalculator.tsx
 *
 * Decking island, plan view showing the joist grid (dashed, beneath) and
 * the board rows over the top, with supports marked.
 */

import { useMemo, useState } from 'react';
import { calculateDecking, planDecking, type DeckingInput } from '../../calculators/v2/decking';
import { BlueprintPanel, JobCard, NumberField, ToggleRow, Segmented } from './ui';
import MaterialsTicket from './MaterialsTicket';

const YELLOW = '#ffd407';
const TIMBER = '#b07d3f';
const COMPOSITE = '#7d7268';

function DeckingPreview({ input }: { input: DeckingInput }) {
    const plan = useMemo(() => planDecking(input), [input]);
    const W = 760;
    const H = 430;
    const PAD = 56;

    const scale = Math.min((W - PAD * 2) / input.lengthM, (H - PAD * 2) / input.widthM);
    const dw = input.lengthM * scale; // drawn horizontal = deck length
    const dh = input.widthM * scale;
    const x0 = (W - dw) / 2;
    const y0 = (H - dh) / 2;

    const boardFill = input.composite ? COMPOSITE : TIMBER;
    const rowH = 0.15 * scale;
    const joistSpacing = 0.4 * scale;
    const supportSpacing = 1.2 * scale;

    return (
        <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-auto"
            role="img"
            aria-label={`Deck plan: ${plan.rows} board rows over ${plan.joistCount} joists`}
        >
            {/* joists (dashed, under) */}
            {Array.from({ length: plan.joistCount }).map((_, i) => {
                const x = Math.min(x0 + i * joistSpacing, x0 + dw);
                return <line key={i} x1={x} y1={y0} x2={x} y2={y0 + dh} stroke={YELLOW} strokeWidth="2" strokeDasharray="5 6" opacity="0.65" />;
            })}

            {/* boards */}
            {Array.from({ length: plan.rows }).map((_, r) => {
                const y = y0 + r * rowH;
                const h = Math.min(rowH - 1.5, y0 + dh - y);
                if (h <= 0.5) return null;
                return (
                    <rect
                        key={r}
                        x={x0}
                        y={y}
                        width={dw}
                        height={h}
                        fill={boardFill}
                        opacity={r % 2 ? 0.78 : 0.92}
                        stroke="#04204b"
                        strokeWidth="0.6"
                    />
                );
            })}

            {/* supports */}
            {Array.from({ length: Math.ceil(input.lengthM / 1.2) + 1 }).map((_, i) =>
                Array.from({ length: Math.ceil(input.widthM / 1.2) + 1 }).map((_, j) => (
                    <circle
                        key={`${i}-${j}`}
                        cx={Math.min(x0 + i * supportSpacing, x0 + dw)}
                        cy={Math.min(y0 + j * supportSpacing, y0 + dh)}
                        r="4"
                        fill="#fff"
                        stroke="#04204b"
                        strokeWidth="1"
                    />
                )),
            )}

            <rect x={x0} y={y0} width={dw} height={dh} fill="none" stroke="#fff" strokeWidth="2.5" />

            <g fill={YELLOW} fontSize="13" fontWeight="700">
                <text x={x0 + dw / 2} y={y0 - 24} textAnchor="middle">
                    {input.lengthM.toFixed(1)} m
                </text>
                <text x={x0 - 26} y={y0 + dh / 2} textAnchor="middle" transform={`rotate(-90 ${x0 - 26} ${y0 + dh / 2})`}>
                    {input.widthM.toFixed(1)} m
                </text>
            </g>

            <g transform={`translate(${x0}, ${H - 14})`} fontSize="11" fill="#fff">
                <line x1="0" y1="-4" x2="24" y2="-4" stroke={YELLOW} strokeWidth="2" strokeDasharray="5 6" />
                <text x="30" y="0">joists @ 400 mm</text>
                <circle cx="150" cy="-4" r="4" fill="#fff" stroke="#04204b" strokeWidth="1" />
                <text x="160" y="0">supports @ 1.2 m grid</text>
            </g>
        </svg>
    );
}

export default function DeckingCalculator() {
    const [input, setInput] = useState<DeckingInput>({
        widthM: 3.6,
        lengthM: 4.8,
        composite: false,
        raised: false,
    });

    const bom = useMemo(() => calculateDecking(input), [input]);
    const set = <K extends keyof DeckingInput>(k: K, v: DeckingInput[K]) =>
        setInput((s) => ({ ...s, [k]: v }));

    return (
        <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)] items-start">
            <JobCard title="Job details">
                <div className="grid grid-cols-2 gap-3">
                    <NumberField label="Deck width" value={input.widthM} onChange={(v) => set('widthM', v)} unit="m" min={1} max={12} />
                    <NumberField label="Deck length" value={input.lengthM} onChange={(v) => set('lengthM', v)} unit="m" min={1} max={15} />
                </div>
                <Segmented
                    label="Board material"
                    value={input.composite ? 'composite' : 'timber'}
                    onChange={(v) => set('composite', v === 'composite')}
                    options={[
                        { value: 'timber', label: 'Treated timber' },
                        { value: 'composite', label: 'Composite' },
                    ]}
                />
                <ToggleRow
                    label="Raised deck"
                    hint="Posts in post-fix concrete instead of deck blocks"
                    checked={input.raised}
                    onChange={(v) => set('raised', v)}
                />
            </JobCard>

            <div className="space-y-6">
                <BlueprintPanel title="Frame & board plan">
                    <DeckingPreview input={input} />
                </BlueprintPanel>
                <MaterialsTicket bom={bom} />
            </div>
        </div>
    );
}
