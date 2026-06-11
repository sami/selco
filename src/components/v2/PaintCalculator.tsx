/**
 * @file src/components/v2/PaintCalculator.tsx
 *
 * Paint & decorating island, draws the room's walls "unwrapped" into one
 * elevation strip so the wall run being painted is visible at a glance.
 * Doors and windows are not deducted: you cut in around them and paint the
 * reveals, so the wall area is taken in full.
 */

import { useMemo, useState } from 'react';
import { calculatePaint, paintAreas, type PaintInput } from '../../calculators/v2/paint';
import { BlueprintPanel, JobCard, NumberField, Segmented, ToggleRow } from './ui';
import MaterialsTicket from './MaterialsTicket';

const YELLOW = '#ffd407';
const WALL_FILL = 'rgba(255,255,255,0.14)';

function PaintPreview({ input }: { input: PaintInput }) {
    const W = 760;
    const H = 430;
    const PAD = 56;

    const walls = [
        { label: 'Wall 1', lenM: input.lengthM },
        { label: 'Wall 2', lenM: input.widthM },
        { label: 'Wall 3', lenM: input.lengthM },
        { label: 'Wall 4', lenM: input.widthM },
    ];
    const totalM = walls.reduce((s, w) => s + w.lenM, 0);
    const scale = Math.min((W - PAD * 2) / totalM, (H - PAD * 2 - 40) / input.heightM);
    const stripW = totalM * scale;
    const stripH = input.heightM * scale;
    const x0 = (W - stripW) / 2;
    const y0 = (H - stripH) / 2 + 10;

    let acc = 0;
    const wallXs = walls.map((w) => {
        const x = acc;
        acc += w.lenM;
        return { ...w, xM: x };
    });

    return (
        <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-auto"
            role="img"
            aria-label="Unwrapped wall elevation"
        >
            {/* wall strip */}
            <rect x={x0} y={y0} width={stripW} height={stripH} fill={WALL_FILL} stroke="#fff" strokeWidth="2" />

            {/* wall separators + labels */}
            {wallXs.map((w, i) => (
                <g key={w.label}>
                    {i > 0 && (
                        <line
                            x1={x0 + w.xM * scale}
                            y1={y0}
                            x2={x0 + w.xM * scale}
                            y2={y0 + stripH}
                            stroke="#fff"
                            strokeWidth="1"
                            strokeDasharray="5 5"
                            opacity="0.7"
                        />
                    )}
                    <text
                        x={x0 + (w.xM + w.lenM / 2) * scale}
                        y={y0 - 10}
                        fill="#fff"
                        fontSize="11"
                        fontWeight="600"
                        textAnchor="middle"
                    >
                        {w.label} · {w.lenM.toFixed(1)} m
                    </text>
                </g>
            ))}

            {/* height dimension */}
            <g fill={YELLOW} fontSize="13" fontWeight="700">
                <line x1={x0 - 16} y1={y0} x2={x0 - 16} y2={y0 + stripH} stroke={YELLOW} strokeWidth="1" />
                <text
                    x={x0 - 24}
                    y={y0 + stripH / 2}
                    textAnchor="middle"
                    transform={`rotate(-90 ${x0 - 24} ${y0 + stripH / 2})`}
                >
                    {input.heightM.toFixed(1)} m
                </text>
            </g>

            {/* footer note */}
            <text x={W / 2} y={H - 12} fill="#fff" fontSize="11" textAnchor="middle" opacity="0.8">
                Room unwrapped, {totalM.toFixed(1)} m of wall painted in full (openings not deducted)
            </text>
        </svg>
    );
}

export default function PaintCalculator() {
    const [input, setInput] = useState<PaintInput>({
        lengthM: 4.5,
        widthM: 3.5,
        heightM: 2.4,
        coats: 2,
        paintWalls: true,
        paintCeiling: true,
        paintWoodwork: false,
        barePlaster: false,
    });

    const bom = useMemo(() => calculatePaint(input), [input]);
    const areas = useMemo(() => paintAreas(input), [input]);
    const set = <K extends keyof PaintInput>(k: K, v: PaintInput[K]) =>
        setInput((s) => ({ ...s, [k]: v }));

    return (
        <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)] items-start">
            <JobCard title="Job details">
                <div className="grid grid-cols-2 gap-3">
                    <NumberField label="Room length" value={input.lengthM} onChange={(v) => set('lengthM', v)} unit="m" min={1} max={15} />
                    <NumberField label="Room width" value={input.widthM} onChange={(v) => set('widthM', v)} unit="m" min={1} max={15} />
                </div>
                <NumberField label="Ceiling height" value={input.heightM} onChange={(v) => set('heightM', v)} unit="m" min={2} max={4} />
                <Segmented
                    label="Coats"
                    value={String(input.coats) as '1' | '2' | '3'}
                    onChange={(v) => set('coats', Number(v))}
                    options={[
                        { value: '1', label: '1 coat' },
                        { value: '2', label: '2 coats' },
                        { value: '3', label: '3 coats' },
                    ]}
                />
                <div className="space-y-2">
                    <ToggleRow label="Walls" hint={`${areas.wallM2.toFixed(1)} m² of wall`} checked={input.paintWalls} onChange={(v) => set('paintWalls', v)} />
                    <ToggleRow label="Ceiling" hint={`${areas.ceilingM2.toFixed(1)} m²`} checked={input.paintCeiling} onChange={(v) => set('paintCeiling', v)} />
                    <ToggleRow label="Woodwork" hint="Undercoat + gloss for frames & skirting" checked={input.paintWoodwork} onChange={(v) => set('paintWoodwork', v)} />
                    <ToggleRow label="Bare plaster" hint="Adds mist coat allowance (+20%)" checked={input.barePlaster} onChange={(v) => set('barePlaster', v)} />
                </div>
            </JobCard>

            <div className="space-y-6">
                <BlueprintPanel title="Wall elevation">
                    <PaintPreview input={input} />
                </BlueprintPanel>
                <MaterialsTicket bom={bom} />
            </div>
        </div>
    );
}
