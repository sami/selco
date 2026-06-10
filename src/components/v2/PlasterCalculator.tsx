/**
 * @file src/components/v2/PlasterCalculator.tsx
 *
 * Plastering island — cross-section diagram of the chosen system's build-up
 * (background → bonding → skim) with layer thicknesses called out.
 */

import { useMemo, useState } from 'react';
import { calculatePlaster, type PlasterInput, type PlasterJob } from '../../calculators/v2/plaster';
import { BlueprintPanel, JobCard, NumberField, Segmented, ToggleRow } from './ui';
import MaterialsTicket from './MaterialsTicket';

const YELLOW = '#ffd407';

function PlasterPreview({ input }: { input: PlasterInput }) {
    const W = 760;
    const H = 430;

    // Cross-section: layers drawn left→right from background to finish,
    // wildly out of scale on purpose (2 mm of skim must still be readable).
    const layers = [
        {
            id: 'background',
            label: input.boardedWork ? 'Plasterboard' : 'Masonry background',
            sub: input.boardedWork ? '12.5 mm board, scrimmed joints' : 'brick / block, keyed',
            w: 200,
            fill: 'rgba(255,255,255,0.10)',
            stroke: '#fff',
        },
        ...(input.includePva
            ? [
                  {
                      id: 'pva',
                      label: 'PVA',
                      sub: 'tacky coat',
                      w: 36,
                      fill: 'rgba(255,212,7,0.18)',
                      stroke: YELLOW,
                  },
              ]
            : []),
        ...(input.job === 'float-set'
            ? [
                  {
                      id: 'bonding',
                      label: 'Bonding coat',
                      sub: '11 mm, scratched up',
                      w: 150,
                      fill: 'rgba(255,255,255,0.22)',
                      stroke: '#fff',
                  },
              ]
            : []),
        {
            id: 'skim',
            label: 'Multi-finish skim',
            sub: '2 mm × 2 coats, trowelled up',
            w: 96,
            fill: 'rgba(255,212,7,0.55)',
            stroke: YELLOW,
        },
    ];

    const total = layers.reduce((s, l) => s + l.w, 0);
    const scale = (W - 160) / total;
    const y0 = 80;
    const h = 250;
    let x = 80;

    return (
        <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-auto"
            role="img"
            aria-label="Plaster system cross-section"
        >
            <text x={W / 2} y={40} fill="#fff" fontSize="13" fontWeight="700" textAnchor="middle" opacity="0.9">
                System build-up — wall cross-section (not to scale)
            </text>

            {layers.map((l) => {
                const lw = l.w * scale;
                const lx = x;
                x += lw;
                return (
                    <g key={l.id}>
                        <rect x={lx} y={y0} width={lw} height={h} fill={l.fill} stroke={l.stroke} strokeWidth="1.5" />
                        <text
                            x={lx + lw / 2}
                            y={y0 + h / 2}
                            fill={l.stroke}
                            fontSize="12"
                            fontWeight="700"
                            textAnchor="middle"
                            transform={lw < 70 ? `rotate(-90 ${lx + lw / 2} ${y0 + h / 2})` : undefined}
                        >
                            {l.label}
                        </text>
                        <text x={lx + lw / 2} y={y0 + h + 22} fill="#fff" fontSize="10" textAnchor="middle" opacity="0.85">
                            {lw >= 70 ? l.sub : ''}
                        </text>
                    </g>
                );
            })}

            {/* finished face arrow */}
            <g stroke={YELLOW} fill={YELLOW}>
                <line x1={x + 10} y1={y0 + h / 2} x2={x + 42} y2={y0 + h / 2} strokeWidth="2" />
                <path d={`M ${x + 14} ${y0 + h / 2 - 5} L ${x + 6} ${y0 + h / 2} L ${x + 14} ${y0 + h / 2 + 5} Z`} stroke="none" />
                <text x={x + 26} y={y0 + h / 2 - 12} fontSize="10" fontWeight="700" textAnchor="middle" stroke="none">
                    room
                </text>
            </g>
        </svg>
    );
}

export default function PlasterCalculator() {
    const [input, setInput] = useState<PlasterInput>({
        areaM2: 32,
        job: 'skim',
        includePva: true,
        boardedWork: false,
    });

    const bom = useMemo(() => calculatePlaster(input), [input]);
    const set = <K extends keyof PlasterInput>(k: K, v: PlasterInput[K]) =>
        setInput((s) => ({ ...s, [k]: v }));

    return (
        <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)] items-start">
            <JobCard title="Job details">
                <NumberField
                    label="Area to plaster"
                    value={input.areaM2}
                    onChange={(v) => set('areaM2', v)}
                    unit="m²"
                    min={1}
                    max={500}
                    step={0.5}
                    hint="Add wall and ceiling areas together"
                />
                <Segmented<PlasterJob>
                    label="Job type"
                    value={input.job}
                    onChange={(v) => set('job', v)}
                    options={[
                        { value: 'skim', label: 'Skim only' },
                        { value: 'float-set', label: 'Float & set' },
                    ]}
                />
                <ToggleRow
                    label="PVA priming"
                    hint="Painted or dusty backgrounds"
                    checked={input.includePva}
                    onChange={(v) => set('includePva', v)}
                />
                <ToggleRow
                    label="Boarded work"
                    hint="Adds scrim tape and angle beads"
                    checked={input.boardedWork}
                    onChange={(v) => set('boardedWork', v)}
                />
            </JobCard>

            <div className="space-y-6">
                <BlueprintPanel title="System build-up">
                    <PlasterPreview input={input} />
                </BlueprintPanel>
                <MaterialsTicket bom={bom} />
            </div>
        </div>
    );
}
