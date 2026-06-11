/**
 * @file src/components/v2/WallpaperCalculator.tsx
 *
 * Wallpapering island — draws the wall as a row of numbered drops so the
 * pattern-repeat maths stops being abstract: you can see where every roll
 * goes and how much each drop wastes to the repeat.
 */

import { useMemo, useState } from 'react';
import { wallpapering } from '../../calculators/v2/specs/interiors';
import type { Values } from '../../calculators/v2/specs/spec-types';
import { BlueprintPanel, JobCard, NumberField, Segmented, ToggleRow } from './ui';
import MaterialsTicket from './MaterialsTicket';

const YELLOW = '#ffd407';
const ROLL_W = 0.53;

function WallpaperPreview({ v }: { v: Values }) {
    const W = 760;
    const H = 430;
    const PAD = 56;

    const perimeter = Number(v.perimeter) || 1;
    const height = Number(v.height) || 2.4;
    const repeatM = Number(v.repeat) / 100;
    const rawDrop = height + 0.1;
    const dropM = repeatM > 0 ? Math.ceil(rawDrop / repeatM) * repeatM : rawDrop;
    const dropsNeeded = Math.ceil(perimeter / ROLL_W);

    const shown = Math.min(dropsNeeded, 10);
    const truncated = dropsNeeded > shown;
    const scale = Math.min((W - PAD * 2) / (shown * ROLL_W), (H - PAD * 2 - 30) / height);
    const dw = ROLL_W * scale;
    const wh = height * scale;
    const x0 = (W - shown * dw) / 2;
    const y0 = (H - wh) / 2;

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={`${dropsNeeded} wallpaper drops`}>
            {/* drops */}
            {Array.from({ length: shown }).map((_, i) => (
                <g key={i}>
                    <rect
                        x={x0 + i * dw}
                        y={y0}
                        width={dw}
                        height={wh}
                        fill={i % 2 ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.18)'}
                        stroke="#fff"
                        strokeWidth="1"
                    />
                    {/* pattern motif rows at the repeat spacing */}
                    {repeatM > 0 &&
                        Array.from({ length: Math.floor(height / repeatM) + 1 }).map((_, r) => (
                            <circle
                                key={r}
                                cx={x0 + i * dw + dw / 2}
                                cy={y0 + (r * repeatM + (i % 2 ? 0 : repeatM / 2)) * scale}
                                r={Math.min(7, dw / 6)}
                                fill="none"
                                stroke="rgba(255,255,255,0.45)"
                                strokeWidth="1.2"
                            />
                        ))}
                    <text x={x0 + i * dw + dw / 2} y={y0 + wh + 18} fill="#fff" fontSize="10" textAnchor="middle" opacity="0.85">
                        {i + 1}
                    </text>
                </g>
            ))}

            {truncated && (
                <text x={x0 + shown * dw + 18} y={y0 + wh / 2} fill={YELLOW} fontSize="20" fontWeight="700">
                    ⋯
                </text>
            )}

            {/* first drop: cut length callout including the repeat allowance */}
            <g fill={YELLOW} fontSize="12" fontWeight="700">
                <line x1={x0 - 16} y1={y0} x2={x0 - 16} y2={y0 + dropM * scale} stroke={YELLOW} strokeWidth="1.5" />
                <text x={x0 - 24} y={y0 + (dropM * scale) / 2} textAnchor="middle" transform={`rotate(-90 ${x0 - 24} ${y0 + (dropM * scale) / 2})`}>
                    cut at {dropM.toFixed(2)} m
                </text>
            </g>
            {repeatM > 0 && (
                <text x={x0} y={y0 - 12} fill="#fff" fontSize="11" opacity="0.85">
                    motifs offset drop to drop, that is the repeat at work
                </text>
            )}

            <text x={W / 2} y={H - 10} fill="#fff" fontSize="11" textAnchor="middle" opacity="0.85">
                {truncated ? `Showing 10 of ${dropsNeeded} drops` : `${dropsNeeded} drops`} at 530 mm wide, hang from a plumb line
            </text>
        </svg>
    );
}

export default function WallpaperCalculator() {
    const [v, setV] = useState<Values>({ perimeter: 14, height: 2.4, repeat: '0', lining: false });
    const bom = useMemo(() => wallpapering.compute(v), [v]);
    const set = (k: string, val: Values[string]) => setV((s) => ({ ...s, [k]: val }));

    return (
        <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)] items-start">
            <JobCard title="Job details">
                <NumberField label="Wall run to paper" value={Number(v.perimeter)} onChange={(x) => set('perimeter', x)} unit="m" min={1} max={60} hint="Add up the width of every wall being papered" />
                <NumberField label="Wall height" value={Number(v.height)} onChange={(x) => set('height', x)} unit="m" min={2} max={4} />
                <Segmented
                    label="Pattern repeat"
                    value={String(v.repeat)}
                    onChange={(x) => set('repeat', x)}
                    options={[
                        { value: '0', label: 'Free match' },
                        { value: '32', label: '32 cm' },
                        { value: '64', label: '64 cm' },
                    ]}
                />
                <ToggleRow label="Cross-line first" hint="Lining paper hung horizontally, the pro finish" checked={v.lining === true} onChange={(x) => set('lining', x)} />
            </JobCard>

            <div className="space-y-6">
                <BlueprintPanel title="Your drops">
                    <WallpaperPreview v={v} />
                </BlueprintPanel>
                <MaterialsTicket bom={bom} />
            </div>
        </div>
    );
}
