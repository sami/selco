/**
 * @file src/components/v2/FenceCalculator.tsx
 *
 * Fencing island — elevation view of the run: posts, panels, gravel boards,
 * ground line and post-fix concrete, with the burial depth called out.
 */

import { useMemo, useState } from 'react';
import { calculateFence, planFence, type FenceInput, type PostType } from '../../calculators/v2/fence';
import { BlueprintPanel, JobCard, NumberField, Segmented, ToggleRow } from './ui';
import MaterialsTicket from './MaterialsTicket';

const YELLOW = '#ffd407';
const TIMBER = '#b07d3f';
const TIMBER_DARK = '#8a5f2a';
const CONCRETE = '#b9c2cc';

function FencePreview({ input }: { input: FenceInput }) {
    const plan = useMemo(() => planFence(input), [input]);
    const W = 760;
    const H = 430;
    const PAD = 48;

    // Draw at most 6 bays; if the run is longer, show a break mark.
    const shownPanels = Math.min(plan.panels, 6);
    const truncated = plan.panels > shownPanels;

    const burialM = 0.6;
    const gravelM = input.includeGravelBoards ? 0.15 : 0;
    const totalHM = input.heightM + gravelM + burialM;
    const runM = shownPanels * 1.83 + (shownPanels + 1) * 0.075;
    const scale = Math.min((W - PAD * 2) / runM, (H - PAD * 2 - 30) / totalHM);

    const postWPx = Math.max(6, 0.075 * scale);
    const panelWPx = 1.83 * scale;
    const x0 = (W - (shownPanels * panelWPx + (shownPanels + 1) * postWPx)) / 2;
    const groundY = (H + (input.heightM + gravelM - burialM) * scale) / 2;
    const topY = groundY - (input.heightM + gravelM) * scale;

    const postColor = input.postType === 'concrete' ? CONCRETE : TIMBER_DARK;
    const spiked = plan.spikes > 0;

    return (
        <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-auto"
            role="img"
            aria-label={`Fence elevation: ${plan.panels} panels and ${plan.posts} posts`}
        >
            <defs>
                <pattern id="lap" width="8" height="9" patternUnits="userSpaceOnUse">
                    <rect width="8" height="9" fill={TIMBER} />
                    <line x1="0" y1="8" x2="8" y2="8" stroke={TIMBER_DARK} strokeWidth="1.6" />
                </pattern>
            </defs>

            {/* ground */}
            <rect x={0} y={groundY} width={W} height={H - groundY} fill="rgba(255,255,255,0.07)" />
            <line x1={0} y1={groundY} x2={W} y2={groundY} stroke="#fff" strokeWidth="2" strokeDasharray="10 6" />
            <text x={12} y={groundY + 18} fill="#fff" fontSize="11" opacity="0.85">
                ground level
            </text>

            {/* bays */}
            {Array.from({ length: shownPanels }).map((_, i) => {
                const px = x0 + i * (panelWPx + postWPx);
                return (
                    <g key={i}>
                        {/* post, set in postmix or on a drive-in spike */}
                        <rect x={px} y={topY} width={postWPx} height={(input.heightM + gravelM + (spiked ? 0 : burialM)) * scale} fill={postColor} stroke="#04204b" strokeWidth="0.5" />
                        {spiked ? (
                            <path
                                d={`M ${px + postWPx / 2 - 4} ${groundY} L ${px + postWPx / 2 + 4} ${groundY} L ${px + postWPx / 2} ${groundY + burialM * scale} Z`}
                                fill={CONCRETE}
                                stroke="#04204b"
                                strokeWidth="0.5"
                            />
                        ) : (
                            <path
                                d={`M ${px - 7} ${groundY + burialM * scale} L ${px + postWPx + 7} ${groundY + burialM * scale} L ${px + postWPx + 4} ${groundY + 4} L ${px - 4} ${groundY + 4} Z`}
                                fill="rgba(255,255,255,0.25)"
                            />
                        )}
                        {/* gravel board */}
                        {input.includeGravelBoards && (
                            <rect
                                x={px + postWPx}
                                y={groundY - gravelM * scale}
                                width={panelWPx}
                                height={gravelM * scale}
                                fill={input.postType === 'concrete' ? CONCRETE : TIMBER_DARK}
                                stroke="#04204b"
                                strokeWidth="0.5"
                            />
                        )}
                        {/* panel */}
                        <rect
                            x={px + postWPx}
                            y={topY}
                            width={panelWPx}
                            height={input.heightM * scale}
                            fill="url(#lap)"
                            stroke="#04204b"
                            strokeWidth="0.8"
                        />
                    </g>
                );
            })}
            {/* final post */}
            <rect
                x={x0 + shownPanels * (panelWPx + postWPx)}
                y={topY}
                width={postWPx}
                height={(input.heightM + gravelM + (spiked ? 0 : burialM)) * scale}
                fill={postColor}
                stroke="#04204b"
                strokeWidth="0.5"
            />

            {truncated && (
                <text x={W - PAD} y={topY + (input.heightM * scale) / 2} fill={YELLOW} fontSize="22" fontWeight="700" textAnchor="middle">
                    ⋯
                </text>
            )}

            {/* dimensions */}
            <g fill={YELLOW} fontSize="13" fontWeight="700">
                <line x1={x0 - 16} y1={topY} x2={x0 - 16} y2={groundY} stroke={YELLOW} strokeWidth="1" />
                <text x={x0 - 24} y={(topY + groundY) / 2} textAnchor="middle" transform={`rotate(-90 ${x0 - 24} ${(topY + groundY) / 2})`}>
                    {(input.heightM + gravelM).toFixed(2)} m
                </text>
                <line x1={x0 - 16} y1={groundY} x2={x0 - 16} y2={groundY + burialM * scale} stroke="#fff" strokeWidth="1" />
                <text x={x0 - 24} y={groundY + (burialM * scale) / 2} textAnchor="middle" fill="#fff" fontSize="10" transform={`rotate(-90 ${x0 - 24} ${groundY + (burialM * scale) / 2})`}>
                    600 mm
                </text>
            </g>

            <text x={W / 2} y={H - 10} fill="#fff" fontSize="11" textAnchor="middle" opacity="0.8">
                {`${truncated ? `Showing ${shownPanels} of ${plan.panels}` : plan.panels} bays at 1.83 m, every post ${spiked ? 'on a drive-in spike' : 'set in postmix'}`}
            </text>
        </svg>
    );
}

export default function FenceCalculator() {
    const [input, setInput] = useState<FenceInput>({
        runM: 12,
        heightM: 1.829,
        panelStyle: 'lap',
        postType: 'concrete',
        useSpikes: false,
        includeGravelBoards: true,
        corners: 0,
    });

    const bom = useMemo(() => calculateFence(input), [input]);
    const set = <K extends keyof FenceInput>(k: K, v: FenceInput[K]) =>
        setInput((s) => ({ ...s, [k]: v }));

    return (
        <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)] items-start">
            <JobCard title="Job details">
                <NumberField label="Fence run" value={input.runM} onChange={(v) => set('runM', v)} unit="m" min={1.83} max={100} />
                <Segmented
                    label="Panel style"
                    value={input.panelStyle}
                    onChange={(v) => set('panelStyle', v)}
                    options={[
                        { value: 'lap', label: 'Lap' },
                        { value: 'closeboard', label: 'Closeboard' },
                    ]}
                />
                <Segmented
                    label="Fence height"
                    value={String(input.heightM)}
                    onChange={(v) => set('heightM', Number(v))}
                    options={[
                        { value: '0.914', label: '3 ft' },
                        { value: '1.22', label: '4 ft' },
                        { value: '1.525', label: '5 ft' },
                        { value: '1.829', label: '6 ft' },
                    ]}
                />
                <Segmented<PostType>
                    label="Post type"
                    value={input.postType}
                    onChange={(v) => set('postType', v)}
                    options={[
                        { value: 'concrete', label: 'Concrete' },
                        { value: 'timber75', label: 'Timber 3"' },
                        { value: 'timber100', label: 'Timber 4"' },
                    ]}
                />
                {input.postType !== 'concrete' && (
                    <ToggleRow
                        label="Powapost drive-in spikes"
                        hint="No digging or postmix. Firm ground only"
                        checked={input.useSpikes}
                        onChange={(v) => set('useSpikes', v)}
                    />
                )}
                <NumberField label="Corners in the run" value={input.corners} onChange={(v) => set('corners', Math.round(v))} min={0} max={6} step={1} hint="Each 90° turn needs an extra post" />
                <ToggleRow
                    label="Gravel boards"
                    hint="Keep panels off wet ground"
                    checked={input.includeGravelBoards}
                    onChange={(v) => set('includeGravelBoards', v)}
                />
            </JobCard>

            <div className="space-y-6">
                <BlueprintPanel title="Elevation">
                    <FencePreview input={input} />
                </BlueprintPanel>
                <MaterialsTicket bom={bom} />
            </div>
        </div>
    );
}
