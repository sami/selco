/**
 * @file src/components/v2/FenceCalculator.tsx
 *
 * Fencing island, elevation view of the run. The face pattern follows the
 * build: lap panels, featheredge boards on arris rails, or slatted
 * screening battens. Gates draw with their diagonal brace, and the post
 * callout shows the stocked length and how deep it goes.
 */

import { useMemo, useState } from 'react';
import {
    calculateFence,
    planFence,
    type FenceInput,
    type FenceStyle,
    type PostType,
} from '../../calculators/v2/fence';
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

    const gates = Math.round(input.gates);
    // Draw at most 5 fence bays plus the gate bay; longer runs get a break mark.
    const shownBays = Math.min(plan.bays, gates > 0 ? 4 : 6);
    const truncated = plan.bays > shownBays;
    const drawnBays = shownBays + (gates > 0 ? 1 : 0); // gate drawn as an extra bay

    const burialM = plan.spikes > 0 ? 0 : plan.burialMm / 1000;
    const gravelM = input.includeGravelBoards && input.style !== 'screening' ? 0.15 : 0;
    const totalHM = input.heightM + gravelM + Math.max(burialM, 0.6);
    const runM = drawnBays * plan.bayWidthM + (drawnBays + 1) * 0.075;
    const scale = Math.min((W - PAD * 2) / runM, (H - PAD * 2 - 30) / totalHM);

    const postWPx = Math.max(6, 0.075 * scale);
    const bayWPx = plan.bayWidthM * scale;
    const x0 = (W - (drawnBays * bayWPx + (drawnBays + 1) * postWPx)) / 2;
    const groundY = (H + (input.heightM + gravelM - Math.max(burialM, 0.6)) * scale) / 2;
    const topY = groundY - (input.heightM + gravelM) * scale;
    const spiked = plan.spikes > 0;
    const postColor = input.postType === 'concrete' ? CONCRETE : TIMBER_DARK;

    const faceFill =
        input.style === 'panels'
            ? 'url(#lap)'
            : input.style === 'featheredge'
              ? 'url(#feather)'
              : 'url(#slats)';

    const postH = (input.heightM + gravelM + (spiked ? 0 : burialM)) * scale;

    const bayLabel =
        input.style === 'panels'
            ? `${plan.bays} panels at 1.83 m`
            : input.style === 'featheredge'
              ? `${plan.bays} bays, ${plan.railsPerBay} arris rails each, boards lapped 25 mm`
              : `${plan.bays} bays, ${plan.battenRows} batten rows, 12 mm gaps`;

    return (
        <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-auto"
            role="img"
            aria-label={`Fence elevation: ${plan.bays} bays and ${plan.posts} posts`}
        >
            <defs>
                <pattern id="lap" width="8" height="9" patternUnits="userSpaceOnUse">
                    <rect width="8" height="9" fill={TIMBER} />
                    <line x1="0" y1="8" x2="8" y2="8" stroke={TIMBER_DARK} strokeWidth="1.6" />
                </pattern>
                <pattern id="feather" width="10" height="8" patternUnits="userSpaceOnUse">
                    <rect width="10" height="8" fill={TIMBER} />
                    <line x1="9" y1="0" x2="9" y2="8" stroke={TIMBER_DARK} strokeWidth="2" />
                </pattern>
                <pattern id="slats" width="8" height="10" patternUnits="userSpaceOnUse">
                    <rect width="8" height="7" fill={TIMBER} />
                    <rect y="7" width="8" height="3" fill="#04204b" />
                </pattern>
            </defs>

            {/* ground */}
            <rect x={0} y={groundY} width={W} height={H - groundY} fill="rgba(255,255,255,0.07)" />
            <line x1={0} y1={groundY} x2={W} y2={groundY} stroke="#fff" strokeWidth="2" strokeDasharray="10 6" />
            <text x={12} y={groundY + 18} fill="#fff" fontSize="11" opacity="0.85">
                ground level
            </text>

            {/* bays (last drawn bay is the gate when gates > 0) */}
            {Array.from({ length: drawnBays }).map((_, i) => {
                const px = x0 + i * (bayWPx + postWPx);
                const isGate = gates > 0 && i === drawnBays - 1;
                const gateWPx = 0.915 * scale;
                return (
                    <g key={i}>
                        {/* post */}
                        <rect x={px} y={topY} width={postWPx} height={postH} fill={postColor} stroke="#04204b" strokeWidth="0.5" />
                        {spiked && !isGate ? (
                            <path
                                d={`M ${px + postWPx / 2 - 4} ${groundY} L ${px + postWPx / 2 + 4} ${groundY} L ${px + postWPx / 2} ${groundY + 0.6 * scale} Z`}
                                fill={CONCRETE}
                                stroke="#04204b"
                                strokeWidth="0.5"
                            />
                        ) : (
                            <path
                                d={`M ${px - 7} ${groundY + Math.max(burialM, 0.6) * scale} L ${px + postWPx + 7} ${groundY + Math.max(burialM, 0.6) * scale} L ${px + postWPx + 4} ${groundY + 4} L ${px - 4} ${groundY + 4} Z`}
                                fill="rgba(255,255,255,0.25)"
                            />
                        )}

                        {isGate ? (
                            <g>
                                {/* gate leaf with diagonal brace */}
                                <rect x={px + postWPx + 4} y={topY + 2} width={gateWPx - 8} height={Math.min(1.75, input.heightM) * scale} fill="url(#feather)" stroke="#04204b" strokeWidth="1.2" />
                                <line
                                    x1={px + postWPx + 8}
                                    y1={topY + Math.min(1.75, input.heightM) * scale - 6}
                                    x2={px + postWPx + gateWPx - 12}
                                    y2={topY + 8}
                                    stroke={TIMBER_DARK}
                                    strokeWidth="4"
                                />
                                {/* hinges + latch */}
                                <rect x={px + postWPx} y={topY + 12} width={14} height={6} fill={YELLOW} />
                                <rect x={px + postWPx} y={topY + Math.min(1.75, input.heightM) * scale - 24} width={14} height={6} fill={YELLOW} />
                                <circle cx={px + postWPx + gateWPx - 10} cy={topY + (Math.min(1.75, input.heightM) * scale) / 2} r="4" fill={YELLOW} />
                                <text x={px + postWPx + gateWPx / 2} y={topY - 8} fill={YELLOW} fontSize="10" fontWeight="700" textAnchor="middle">
                                    gate 915 mm
                                </text>
                            </g>
                        ) : (
                            <g>
                                {/* gravel board */}
                                {gravelM > 0 && (
                                    <rect
                                        x={px + postWPx}
                                        y={groundY - gravelM * scale}
                                        width={bayWPx}
                                        height={gravelM * scale}
                                        fill={input.postType === 'concrete' ? CONCRETE : TIMBER_DARK}
                                        stroke="#04204b"
                                        strokeWidth="0.5"
                                    />
                                )}
                                {/* fence face */}
                                <rect
                                    x={px + postWPx}
                                    y={topY}
                                    width={bayWPx}
                                    height={input.heightM * scale}
                                    fill={faceFill}
                                    stroke="#04204b"
                                    strokeWidth="0.8"
                                />
                                {/* arris rails on featheredge */}
                                {input.style === 'featheredge' &&
                                    Array.from({ length: plan.railsPerBay }).map((_, r) => (
                                        <rect
                                            key={r}
                                            x={px + postWPx}
                                            y={topY + ((r + 0.5) / plan.railsPerBay) * input.heightM * scale - 3}
                                            width={bayWPx}
                                            height={6}
                                            fill={TIMBER_DARK}
                                            opacity="0.55"
                                        />
                                    ))}
                            </g>
                        )}
                    </g>
                );
            })}
            {/* final post */}
            <rect
                x={x0 + drawnBays * (bayWPx + postWPx)}
                y={topY}
                width={postWPx}
                height={postH}
                fill={postColor}
                stroke="#04204b"
                strokeWidth="0.5"
            />

            {truncated && (
                <text x={W - PAD / 2} y={topY + (input.heightM * scale) / 2} fill={YELLOW} fontSize="22" fontWeight="700" textAnchor="middle">
                    ⋯
                </text>
            )}

            {/* dimensions */}
            <g fill={YELLOW} fontSize="13" fontWeight="700">
                <line x1={x0 - 16} y1={topY} x2={x0 - 16} y2={groundY} stroke={YELLOW} strokeWidth="1" />
                <text x={x0 - 24} y={(topY + groundY) / 2} textAnchor="middle" transform={`rotate(-90 ${x0 - 24} ${(topY + groundY) / 2})`}>
                    {(input.heightM + gravelM).toFixed(2)} m
                </text>
                {!spiked && (
                    <>
                        <line x1={x0 - 16} y1={groundY} x2={x0 - 16} y2={groundY + burialM * scale} stroke="#fff" strokeWidth="1" />
                        <text x={x0 - 24} y={groundY + (burialM * scale) / 2} textAnchor="middle" fill="#fff" fontSize="10" transform={`rotate(-90 ${x0 - 24} ${groundY + (burialM * scale) / 2})`}>
                            {plan.burialMm} mm
                        </text>
                    </>
                )}
            </g>

            {/* post length callout */}
            <text x={12} y={22} fill="#fff" fontSize="11" opacity="0.9">
                posts: {plan.postLengthM.toFixed(1)} m stocked length
            </text>

            <text x={W / 2} y={H - 10} fill="#fff" fontSize="11" textAnchor="middle" opacity="0.8">
                {`${truncated ? `Showing ${shownBays} of ${plan.bays} bays. ` : ''}${bayLabel}, posts ${spiked ? 'on drive-in spikes' : 'set in postmix'}`}
            </text>
        </svg>
    );
}

export default function FenceCalculator() {
    const [input, setInput] = useState<FenceInput>({
        runM: 12,
        heightM: 1.829,
        style: 'panels',
        panelStyle: 'lap',
        postType: 'concrete',
        useSpikes: false,
        includeGravelBoards: true,
        corners: 0,
        gates: 0,
    });

    const bom = useMemo(() => calculateFence(input), [input]);
    const set = <K extends keyof FenceInput>(k: K, v: FenceInput[K]) =>
        setInput((s) => ({ ...s, [k]: v }));

    return (
        <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)] items-start">
            <JobCard title="Job details">
                <NumberField label="Fence run" value={input.runM} onChange={(v) => set('runM', v)} unit="m" min={1.83} max={100} />
                <Segmented<FenceStyle>
                    label="Build"
                    value={input.style}
                    onChange={(v) => set('style', v)}
                    options={[
                        { value: 'panels', label: 'Panels' },
                        { value: 'featheredge', label: 'Featheredge' },
                        { value: 'screening', label: 'Screening' },
                    ]}
                />
                {input.style === 'panels' && (
                    <Segmented
                        label="Panel style"
                        value={input.panelStyle}
                        onChange={(v) => set('panelStyle', v)}
                        options={[
                            { value: 'lap', label: 'Lap' },
                            { value: 'closeboard', label: 'Closeboard' },
                        ]}
                    />
                )}
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
                <div className="grid grid-cols-2 gap-3">
                    <NumberField label="Gates" value={input.gates} onChange={(v) => set('gates', Math.round(v))} min={0} max={3} step={1} hint="915 mm closeboard" />
                    <NumberField label="Corners" value={input.corners} onChange={(v) => set('corners', Math.round(v))} min={0} max={6} step={1} hint="One post per turn" />
                </div>
                <ToggleRow
                    label="Gravel boards"
                    hint="Keep the timber off wet ground"
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
