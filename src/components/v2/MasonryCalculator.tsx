/**
 * @file src/components/v2/MasonryCalculator.tsx
 *
 * Brick & block wall island — draws the wall elevation in stretcher bond
 * (real course pattern via an SVG pattern tile), with the DPC line marked.
 */

import { useMemo, useState } from 'react';
import { calculateMasonry, planMasonry, type MasonryInput, type WallConstruction } from '../../calculators/v2/masonry';
import { BlueprintPanel, JobCard, NumberField, Segmented, ToggleRow } from './ui';
import MaterialsTicket from './MaterialsTicket';

const YELLOW = '#ffd407';
const BRICK = '#b4543e';
const BRICK_DARK = '#8e4231';
const BLOCK = '#9aa6b0';
const BLOCK_DARK = '#7c8893';

function MasonryPreview({ input }: { input: MasonryInput }) {
    const W = 760;
    const H = 430;
    const PAD = 56;

    const scale = Math.min((W - PAD * 2) / input.lengthM, (H - PAD * 2) / input.heightM);
    const ww = input.lengthM * scale;
    const wh = input.heightM * scale;
    const x0 = (W - ww) / 2;
    const y0 = (H - wh) / 2;

    const isBlock = input.construction === 'block';
    // Pattern tile: two courses of stretcher bond.
    const unitW = (isBlock ? 0.45 : 0.225) * scale;
    const unitH = (isBlock ? 0.225 : 0.075) * scale;
    const face = isBlock ? BLOCK : BRICK;
    const joint = isBlock ? BLOCK_DARK : BRICK_DARK;

    const dpcY = y0 + wh - 0.15 * scale;

    return (
        <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-auto"
            role="img"
            aria-label={`Wall elevation in ${isBlock ? 'blockwork' : 'stretcher bond brickwork'}`}
        >
            <defs>
                <pattern id="bond" width={unitW} height={unitH * 2} patternUnits="userSpaceOnUse">
                    <rect width={unitW} height={unitH * 2} fill={joint} />
                    {/* course 1: full unit */}
                    <rect x={1} y={1} width={unitW - 2} height={unitH - 2} fill={face} />
                    {/* course 2: offset half-bond */}
                    <rect x={-unitW / 2 + 1} y={unitH + 1} width={unitW - 2} height={unitH - 2} fill={face} />
                    <rect x={unitW / 2 + 1} y={unitH + 1} width={unitW - 2} height={unitH - 2} fill={face} />
                </pattern>
            </defs>

            <rect x={x0} y={y0} width={ww} height={wh} fill="url(#bond)" stroke="#fff" strokeWidth="2.5" />

            {/* coping */}
            {input.includeCopings && (
                <rect x={x0 - 6} y={y0 - 9} width={ww + 12} height={9} fill="#cdd5dc" stroke="#04204b" strokeWidth="0.8" />
            )}

            {/* DPC line */}
            {input.includeDpc && (
                <>
                    <line x1={x0} y1={dpcY} x2={x0 + ww} y2={dpcY} stroke={YELLOW} strokeWidth="2.5" strokeDasharray="10 5" />
                    <text x={x0 + ww + 8} y={dpcY + 4} fill={YELLOW} fontSize="11" fontWeight="700">
                        DPC
                    </text>
                </>
            )}

            {/* ground line */}
            <line x1={0} y1={y0 + wh} x2={W} y2={y0 + wh} stroke="#fff" strokeWidth="1.5" strokeDasharray="10 6" opacity="0.7" />
            <text x={12} y={y0 + wh + 18} fill="#fff" fontSize="11" opacity="0.85">
                ground level
            </text>

            <g fill={YELLOW} fontSize="13" fontWeight="700">
                <line x1={x0} y1={y0 - 18} x2={x0 + ww} y2={y0 - 18} stroke={YELLOW} strokeWidth="1" />
                <text x={x0 + ww / 2} y={y0 - 26} textAnchor="middle">
                    {input.lengthM.toFixed(1)} m
                </text>
                <line x1={x0 - 18} y1={y0} x2={x0 - 18} y2={y0 + wh} stroke={YELLOW} strokeWidth="1" />
                <text x={x0 - 26} y={y0 + wh / 2} textAnchor="middle" transform={`rotate(-90 ${x0 - 26} ${y0 + wh / 2})`}>
                    {input.heightM.toFixed(1)} m
                </text>
            </g>

            <text x={W / 2} y={H - 12} fill="#fff" fontSize="11" textAnchor="middle" opacity="0.85">
                {isBlock ? '440 × 215 blocks' : '215 × 65 bricks'} in stretcher bond — 10 mm joints, 4 courses = 300 mm gauge
            </text>
        </svg>
    );
}

export default function MasonryCalculator() {
    const [input, setInput] = useState<MasonryInput>({
        lengthM: 6,
        heightM: 1.8,
        construction: 'half-brick',
        includeDpc: true,
        includeCopings: true,
    });

    const bom = useMemo(() => calculateMasonry(input), [input]);
    const plan = useMemo(() => planMasonry(input), [input]);
    const set = <K extends keyof MasonryInput>(k: K, v: MasonryInput[K]) =>
        setInput((s) => ({ ...s, [k]: v }));

    return (
        <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)] items-start">
            <JobCard title="Job details">
                <div className="grid grid-cols-2 gap-3">
                    <NumberField label="Wall length" value={input.lengthM} onChange={(v) => set('lengthM', v)} unit="m" min={0.5} max={30} />
                    <NumberField label="Wall height" value={input.heightM} onChange={(v) => set('heightM', v)} unit="m" min={0.3} max={4} />
                </div>
                <Segmented<WallConstruction>
                    label="Construction"
                    value={input.construction}
                    onChange={(v) => set('construction', v)}
                    options={[
                        { value: 'half-brick', label: '½ brick' },
                        { value: 'one-brick', label: '1 brick' },
                        { value: 'block', label: 'Block' },
                        { value: 'cavity', label: 'Cavity' },
                    ]}
                />
                <ToggleRow
                    label="DPC course"
                    hint="Damp-proof course 150 mm above ground"
                    checked={input.includeDpc}
                    onChange={(v) => set('includeDpc', v)}
                />
                <ToggleRow
                    label="Copings"
                    hint="Cap a freestanding wall against rain"
                    checked={input.includeCopings}
                    onChange={(v) => set('includeCopings', v)}
                />
                <p className="text-xs text-text-muted m-0">
                    {plan.bricks > 0 && `${plan.bricks} bricks`}
                    {plan.bricks > 0 && plan.blocks > 0 && ' + '}
                    {plan.blocks > 0 && `${plan.blocks} blocks`} at the current size.
                </p>
            </JobCard>

            <div className="space-y-6">
                <BlueprintPanel title="Elevation">
                    <MasonryPreview input={input} />
                </BlueprintPanel>
                <MaterialsTicket bom={bom} />
            </div>
        </div>
    );
}
