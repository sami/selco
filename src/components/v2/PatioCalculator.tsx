/**
 * @file src/components/v2/PatioCalculator.tsx
 *
 * Patio island — top-down slab grid showing full slabs vs cut edge pieces,
 * so the waste percentage has a visible meaning.
 */

import { useMemo, useState } from 'react';
import {
    calculatePatio,
    planPatio,
    SLAB_FORMATS,
    type PatioInput,
} from '../../calculators/v2/patio';
import { BlueprintPanel, JobCard, NumberField, Segmented, ToggleRow } from './ui';
import MaterialsTicket from './MaterialsTicket';

const YELLOW = '#ffd407';

function PatioPreview({ input }: { input: PatioInput }) {
    const plan = useMemo(() => planPatio(input), [input]);
    const W = 760;
    const H = 430;
    const PAD = 56;

    const scale = Math.min((W - PAD * 2) / input.widthM, (H - PAD * 2) / input.lengthM);
    const pw = input.widthM * scale;
    const ph = input.lengthM * scale;
    const x0 = (W - pw) / 2;
    const y0 = (H - ph) / 2;

    const moduleW = ((plan.slab.wMm + 10) / 1000) * scale;
    const moduleH = ((plan.slab.hMm + 10) / 1000) * scale;

    const cells: Array<{ x: number; y: number; w: number; h: number; cut: boolean }> = [];
    for (let r = 0; r < plan.rows; r++) {
        for (let c = 0; c < plan.cols; c++) {
            const x = x0 + c * moduleW;
            const y = y0 + r * moduleH;
            const w = Math.min(moduleW - 10 * (scale / 1000) * 1, x0 + pw - x);
            const h = Math.min(moduleH - 10 * (scale / 1000) * 1, y0 + ph - y);
            if (w <= 1 || h <= 1) continue;
            cells.push({
                x,
                y,
                w,
                h,
                cut: c === plan.cols - 1 ? w < moduleW * 0.92 : r === plan.rows - 1 ? h < moduleH * 0.92 : false,
            });
        }
    }

    return (
        <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-auto"
            role="img"
            aria-label={`Patio plan: ${plan.cols} by ${plan.rows} slab grid`}
        >
            {cells.map((cell, i) => (
                <rect
                    key={i}
                    x={cell.x + 1.5}
                    y={cell.y + 1.5}
                    width={Math.max(2, cell.w - 3)}
                    height={Math.max(2, cell.h - 3)}
                    fill={cell.cut ? 'rgba(255,212,7,0.3)' : 'rgba(255,255,255,0.16)'}
                    stroke={cell.cut ? YELLOW : '#fff'}
                    strokeWidth={cell.cut ? 1.4 : 1}
                    rx="1.5"
                />
            ))}

            {/* patio outline */}
            <rect x={x0} y={y0} width={pw} height={ph} fill="none" stroke="#fff" strokeWidth="2.5" />

            {/* dimensions */}
            <g fill={YELLOW} fontSize="13" fontWeight="700">
                <line x1={x0} y1={y0 - 18} x2={x0 + pw} y2={y0 - 18} stroke={YELLOW} strokeWidth="1" />
                <text x={x0 + pw / 2} y={y0 - 26} textAnchor="middle">
                    {input.widthM.toFixed(1)} m
                </text>
                <line x1={x0 - 18} y1={y0} x2={x0 - 18} y2={y0 + ph} stroke={YELLOW} strokeWidth="1" />
                <text x={x0 - 26} y={y0 + ph / 2} textAnchor="middle" transform={`rotate(-90 ${x0 - 26} ${y0 + ph / 2})`}>
                    {input.lengthM.toFixed(1)} m
                </text>
            </g>

            {/* legend */}
            <g transform={`translate(${x0}, ${H - 14})`} fontSize="11" fill="#fff">
                <rect x="0" y="-10" width="12" height="12" fill="rgba(255,255,255,0.16)" stroke="#fff" strokeWidth="1" rx="1.5" />
                <text x="18" y="0">full slab</text>
                <rect x="90" y="-10" width="12" height="12" fill="rgba(255,212,7,0.3)" stroke={YELLOW} strokeWidth="1.4" rx="1.5" />
                <text x="108" y="0">cut at edge</text>
            </g>
        </svg>
    );
}

export default function PatioCalculator() {
    const [input, setInput] = useState<PatioInput>({
        widthM: 4,
        lengthM: 5,
        slabId: 'concrete600',
        wastePct: 5,
        includeSubBase: true,
        includeEdging: false,
    });

    const bom = useMemo(() => calculatePatio(input), [input]);
    const set = <K extends keyof PatioInput>(k: K, v: PatioInput[K]) =>
        setInput((s) => ({ ...s, [k]: v }));

    return (
        <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)] items-start">
            <JobCard title="Job details">
                <div className="grid grid-cols-2 gap-3">
                    <NumberField label="Patio width" value={input.widthM} onChange={(v) => set('widthM', v)} unit="m" min={1} max={20} />
                    <NumberField label="Patio length" value={input.lengthM} onChange={(v) => set('lengthM', v)} unit="m" min={1} max={20} />
                </div>
                <Segmented
                    label="Slab format"
                    value={input.slabId}
                    onChange={(v) => set('slabId', v)}
                    options={SLAB_FORMATS.map((s) => ({
                        value: s.id,
                        label: s.label,
                    }))}
                />
                <Segmented
                    label="Cutting waste"
                    value={String(input.wastePct) as '5' | '10'}
                    onChange={(v) => set('wastePct', Number(v))}
                    options={[
                        { value: '5', label: '5% — simple' },
                        { value: '10', label: '10% — lots of cuts' },
                    ]}
                />
                <ToggleRow
                    label="Sub-base"
                    hint="100 mm MOT Type 1, compacted"
                    checked={input.includeSubBase}
                    onChange={(v) => set('includeSubBase', v)}
                />
                <ToggleRow
                    label="Edging stones"
                    hint="Concrete edging around the perimeter"
                    checked={input.includeEdging}
                    onChange={(v) => set('includeEdging', v)}
                />
            </JobCard>

            <div className="space-y-6">
                <BlueprintPanel title="Slab layout">
                    <PatioPreview input={input} />
                </BlueprintPanel>
                <MaterialsTicket bom={bom} />
            </div>
        </div>
    );
}
