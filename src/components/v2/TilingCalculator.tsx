/**
 * @file src/components/v2/TilingCalculator.tsx
 *
 * Tiling island, draws the tile grid as set out from the centre, with cut
 * tiles at the edges highlighted, plus the materials ticket.
 */

import { useMemo, useState } from 'react';
import { calculateTiling, planTiling, TILE_FORMATS, type TilingInput } from '../../calculators/v2/tiling';
import { BlueprintPanel, JobCard, NumberField, Segmented, ToggleRow } from './ui';
import MaterialsTicket from './MaterialsTicket';

const YELLOW = '#ffd407';

function TilingPreview({ input }: { input: TilingInput }) {
    const plan = useMemo(() => planTiling(input), [input]);
    const W = 760;
    const H = 430;
    const PAD = 56;

    const scale = Math.min((W - PAD * 2) / input.widthM, (H - PAD * 2) / input.heightM);
    const aw = input.widthM * scale;
    const ah = input.heightM * scale;
    const x0 = (W - aw) / 2;
    const y0 = (H - ah) / 2;

    const moduleW = ((plan.tile.wMm + plan.jointMm) / 1000) * scale;
    const moduleH = ((plan.tile.hMm + plan.jointMm) / 1000) * scale;

    const cells: Array<{ x: number; y: number; w: number; h: number; cut: boolean }> = [];
    for (let r = 0; r < plan.rows; r++) {
        for (let c = 0; c < plan.cols; c++) {
            const x = x0 + c * moduleW;
            const y = y0 + r * moduleH;
            const w = Math.min(moduleW, x0 + aw - x);
            const h = Math.min(moduleH, y0 + ah - y);
            if (w <= 1 || h <= 1) continue;
            cells.push({ x, y, w, h, cut: w < moduleW * 0.95 || h < moduleH * 0.95 });
        }
    }

    return (
        <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-auto"
            role="img"
            aria-label={`Tile layout: ${plan.cols} by ${plan.rows} grid`}
        >
            {cells.map((cell, i) => (
                <rect
                    key={i}
                    x={cell.x + 1}
                    y={cell.y + 1}
                    width={Math.max(2, cell.w - 2)}
                    height={Math.max(2, cell.h - 2)}
                    fill={cell.cut ? 'rgba(255,212,7,0.3)' : 'rgba(255,255,255,0.16)'}
                    stroke={cell.cut ? YELLOW : '#fff'}
                    strokeWidth={cell.cut ? 1.3 : 0.8}
                />
            ))}

            <rect x={x0} y={y0} width={aw} height={ah} fill="none" stroke="#fff" strokeWidth="2.5" />

            <g fill={YELLOW} fontSize="13" fontWeight="700">
                <line x1={x0} y1={y0 - 18} x2={x0 + aw} y2={y0 - 18} stroke={YELLOW} strokeWidth="1" />
                <text x={x0 + aw / 2} y={y0 - 26} textAnchor="middle">
                    {input.widthM.toFixed(1)} m
                </text>
                <line x1={x0 - 18} y1={y0} x2={x0 - 18} y2={y0 + ah} stroke={YELLOW} strokeWidth="1" />
                <text x={x0 - 26} y={y0 + ah / 2} textAnchor="middle" transform={`rotate(-90 ${x0 - 26} ${y0 + ah / 2})`}>
                    {input.heightM.toFixed(1)} m
                </text>
            </g>

            <g transform={`translate(${x0}, ${H - 14})`} fontSize="11" fill="#fff">
                <rect x="0" y="-10" width="12" height="12" fill="rgba(255,255,255,0.16)" stroke="#fff" strokeWidth="0.8" />
                <text x="18" y="0">full tile</text>
                <rect x="80" y="-10" width="12" height="12" fill="rgba(255,212,7,0.3)" stroke={YELLOW} strokeWidth="1.3" />
                <text x="98" y="0">cut at edge</text>
            </g>
        </svg>
    );
}

export default function TilingCalculator() {
    const [input, setInput] = useState<TilingInput>({
        widthM: 3,
        heightM: 2.4,
        tileId: '300x600',
        surface: 'wall',
        wastePct: 10,
        includeTrim: true,
        tanking: false,
        backerBoard: false,
        levelling: false,
    });

    const bom = useMemo(() => calculateTiling(input), [input]);
    const set = <K extends keyof TilingInput>(k: K, v: TilingInput[K]) =>
        setInput((s) => ({ ...s, [k]: v }));

    return (
        <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)] items-start">
            <JobCard title="Job details">
                <div className="grid grid-cols-2 gap-3">
                    <NumberField label="Area width" value={input.widthM} onChange={(v) => set('widthM', v)} unit="m" min={0.3} max={20} />
                    <NumberField label="Area height" value={input.heightM} onChange={(v) => set('heightM', v)} unit="m" min={0.3} max={20} />
                </div>
                <Segmented
                    label="Surface"
                    value={input.surface}
                    onChange={(v) => set('surface', v)}
                    options={[
                        { value: 'wall', label: 'Wall' },
                        { value: 'floor', label: 'Floor' },
                    ]}
                />
                <Segmented
                    label="Tile format"
                    value={input.tileId}
                    onChange={(v) => set('tileId', v)}
                    options={TILE_FORMATS.map((t) => ({ value: t.id, label: t.label }))}
                />
                <Segmented
                    label="Cutting waste"
                    value={String(input.wastePct) as '10' | '15'}
                    onChange={(v) => set('wastePct', Number(v))}
                    options={[
                        { value: '10', label: '10%, grid' },
                        { value: '15', label: '15%, pattern' },
                    ]}
                />
                <ToggleRow
                    label="Edge trims"
                    hint="Chrome / PVC trims on exposed edges"
                    checked={input.includeTrim}
                    onChange={(v) => set('includeTrim', v)}
                />
                <ToggleRow
                    label="Tank the wet zone"
                    hint="Waterproof matting behind showers and baths"
                    checked={input.tanking}
                    onChange={(v) => set('tanking', v)}
                />
                <ToggleRow
                    label="Cement backer board"
                    hint="The solid base for wet or heavy tiling"
                    checked={input.backerBoard}
                    onChange={(v) => set('backerBoard', v)}
                />
                {input.surface === 'floor' && (
                    <ToggleRow
                        label="Level the floor first"
                        hint="Self-levelling compound before tiling"
                        checked={input.levelling}
                        onChange={(v) => set('levelling', v)}
                    />
                )}
            </JobCard>

            <div className="space-y-6">
                <BlueprintPanel title="Tile layout">
                    <TilingPreview input={input} />
                </BlueprintPanel>
                <MaterialsTicket bom={bom} />
            </div>
        </div>
    );
}
