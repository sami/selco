/**
 * @file src/components/v2/MasonryCalculator.tsx
 *
 * Brick & block wall island, stretcher-bond elevation with openings and
 * their lintels drawn in, engineering-brick courses below DPC, air bricks
 * along the base and copings on top.
 */

import { useMemo, useState } from 'react';
import {
    calculateMasonry,
    planMasonry,
    type BlockType,
    type BrickType,
    type CopingStyle,
    type LintelType,
    type OuterLeaf,
    type MasonryInput,
    type WallConstruction,
} from '../../calculators/v2/masonry';
import { BlueprintPanel, JobCard, NumberField, Segmented, ToggleRow } from './ui';
import MaterialsTicket from './MaterialsTicket';

const YELLOW = '#ffd407';
const BRICK = '#b4543e';
const BRICK_DARK = '#8e4231';
const ENG = '#5a4a8a';
const ENG_DARK = '#463a6e';
const BLOCK = '#9aa6b0';
const BLOCK_DARK = '#7c8893';

function MasonryPreview({ input }: { input: MasonryInput }) {
    const plan = useMemo(() => planMasonry(input), [input]);
    const W = 760;
    const H = 430;
    const PAD = 56;

    const scale = Math.min((W - PAD * 2) / input.lengthM, (H - PAD * 2) / input.heightM);
    const ww = input.lengthM * scale;
    const wh = input.heightM * scale;
    const x0 = (W - ww) / 2;
    const y0 = (H - wh) / 2;

    const isBlock =
        input.construction === 'block' ||
        (input.construction === 'cavity' && input.outerLeaf === 'block');
    const engineering = input.brickType === 'engineering' && !isBlock;
    const unitW = (isBlock ? 0.45 : 0.225) * scale;
    const unitH = (isBlock ? 0.225 : 0.075) * scale;
    const face = isBlock ? BLOCK : engineering ? ENG : BRICK;
    const joint = isBlock ? BLOCK_DARK : engineering ? ENG_DARK : BRICK_DARK;

    // DPC sits two courses up when engineering courses are on.
    const dpcCoursesPx = input.dpcCourses ? 2 * 0.075 * scale : 0;
    const dpcY = y0 + wh - dpcCoursesPx;

    // Openings spaced evenly, each drawn at its own width.
    const openings = input.openings.filter((o) => o.widthMm > 0);
    const openHpx = Math.min(1.2 * scale, wh * 0.6);
    const slot = ww / (openings.length + 1);

    return (
        <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-auto"
            role="img"
            aria-label={`Wall elevation: ${plan.spec.label} with ${openings.length} openings`}
        >
            <defs>
                <pattern id="bond" width={unitW} height={unitH * 2} patternUnits="userSpaceOnUse">
                    <rect width={unitW} height={unitH * 2} fill={joint} />
                    <rect x={1} y={1} width={unitW - 2} height={unitH - 2} fill={face} />
                    <rect x={-unitW / 2 + 1} y={unitH + 1} width={unitW - 2} height={unitH - 2} fill={face} />
                    <rect x={unitW / 2 + 1} y={unitH + 1} width={unitW - 2} height={unitH - 2} fill={face} />
                </pattern>
                <pattern id="eng-bond" width={0.225 * scale} height={0.15 * scale} patternUnits="userSpaceOnUse">
                    <rect width={0.225 * scale} height={0.15 * scale} fill={ENG_DARK} />
                    <rect x={1} y={1} width={0.225 * scale - 2} height={0.075 * scale - 2} fill={ENG} />
                    <rect x={-0.1125 * scale + 1} y={0.075 * scale + 1} width={0.225 * scale - 2} height={0.075 * scale - 2} fill={ENG} />
                    <rect x={0.1125 * scale + 1} y={0.075 * scale + 1} width={0.225 * scale - 2} height={0.075 * scale - 2} fill={ENG} />
                </pattern>
            </defs>

            {/* wall */}
            <rect x={x0} y={y0} width={ww} height={wh - dpcCoursesPx} fill="url(#bond)" stroke="#fff" strokeWidth="2.5" />

            {/* engineering courses below DPC */}
            {input.dpcCourses && (
                <rect x={x0} y={dpcY} width={ww} height={dpcCoursesPx} fill="url(#eng-bond)" stroke="#fff" strokeWidth="1" />
            )}

            {/* openings + lintels, each at its own width */}
            {openings.map((o, i) => {
                const openWpx = (o.widthMm / 1000) * scale;
                const cx = x0 + slot * (i + 1);
                const ox = cx - openWpx / 2;
                const oy = y0 + wh * 0.18;
                return (
                    <g key={o.id}>
                        <rect x={ox} y={oy} width={openWpx} height={openHpx} fill="#04204b" stroke="#fff" strokeWidth="1.5" />
                        {/* lintel */}
                        <rect
                            x={ox - 0.15 * scale}
                            y={oy - 10}
                            width={openWpx + 0.3 * scale}
                            height={10}
                            fill={YELLOW}
                            stroke="#04204b"
                            strokeWidth="1"
                        />
                        <text x={cx} y={oy - 16} fill={YELLOW} fontSize="10" fontWeight="700" textAnchor="middle">
                            {plan.openingLintels[i]} mm
                        </text>
                    </g>
                );
            })}

            {/* air bricks along the base */}
            {plan.airBrickCount > 0 &&
                Array.from({ length: Math.min(plan.airBrickCount, 12) }).map((_, i) => {
                    const ax = x0 + (ww / (Math.min(plan.airBrickCount, 12) + 1)) * (i + 1);
                    return (
                        <g key={`ab-${i}`}>
                            <rect x={ax - 0.11 * scale} y={dpcY - 0.075 * scale} width={0.225 * scale} height={0.075 * scale} fill="#04204b" stroke={YELLOW} strokeWidth="1.2" />
                            <line x1={ax - 0.07 * scale} y1={dpcY - 0.0375 * scale} x2={ax + 0.07 * scale} y2={dpcY - 0.0375 * scale} stroke={YELLOW} strokeWidth="1" />
                        </g>
                    );
                })}

            {/* coping */}
            {input.includeCopings && (
                <rect x={x0 - 6} y={y0 - 9} width={ww + 12} height={9} fill="#cdd5dc" stroke="#04204b" strokeWidth="0.8" />
            )}

            {/* DPC line */}
            {input.dpcCourses && (
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

            {/* dimensions */}
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
                {isBlock ? '440 × 215 blocks' : '215 × 65 bricks'} in stretcher bond, 10 mm joints, 4 courses = 300 mm
            </text>
        </svg>
    );
}

export default function MasonryCalculator() {
    const [input, setInput] = useState<MasonryInput>({
        lengthM: 6,
        heightM: 2.4,
        construction: 'cavity',
        outerLeaf: 'brick',
        outerBlockThicknessMm: 100,
        brickType: 'facing',
        blockType: 'thermalite',
        blockThicknessMm: 100,
        openings: [{ id: 'o1', widthMm: 1200 }],
        lintelType: 'steel',
        beams: 0,
        joinsExisting: 1,
        dpcCourses: true,
        cavityInsulation: true,
        airBricks: false,
        includeCopings: false,
        copingStyle: 'twice',
    });

    const bom = useMemo(() => calculateMasonry(input), [input]);
    const set = <K extends keyof MasonryInput>(k: K, v: MasonryInput[K]) =>
        setInput((s) => ({ ...s, [k]: v }));

    const hasBricks = input.construction !== 'block';
    const hasBlocks = input.construction === 'block' || input.construction === 'cavity';

    return (
        <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)] items-start">
            <JobCard title="Job details">
                <div className="grid grid-cols-2 gap-3">
                    <NumberField label="Wall length" value={input.lengthM} onChange={(v) => set('lengthM', v)} unit="m" min={0.5} max={30} />
                    <NumberField label="Wall height" value={input.heightM} onChange={(v) => set('heightM', v)} unit="m" min={0.3} max={6} />
                </div>
                <Segmented<WallConstruction>
                    label="Wall type"
                    value={input.construction}
                    onChange={(v) => set('construction', v)}
                    options={[
                        { value: 'half-brick', label: 'Single leaf' },
                        { value: 'one-brick', label: 'Double leaf' },
                        { value: 'block', label: 'Block' },
                        { value: 'cavity', label: 'Cavity' },
                    ]}
                />
                {input.construction === 'cavity' && (
                    <>
                        <Segmented<OuterLeaf>
                            label="Outer leaf"
                            value={input.outerLeaf}
                            onChange={(v) => set('outerLeaf', v)}
                            options={[
                                { value: 'brick', label: 'Facing brick' },
                                { value: 'block', label: 'Block (render)' },
                            ]}
                        />
                        {input.outerLeaf === 'block' && (
                            <Segmented
                                label="Outer block thickness"
                                value={String(input.outerBlockThicknessMm)}
                                onChange={(v) => set('outerBlockThicknessMm', Number(v))}
                                options={[
                                    { value: '100', label: '100 mm' },
                                    { value: '140', label: '140 mm' },
                                ]}
                            />
                        )}
                    </>
                )}
                {hasBricks && !(input.construction === 'cavity' && input.outerLeaf === 'block') && (
                    <Segmented<BrickType>
                        label="Brick"
                        value={input.brickType}
                        onChange={(v) => set('brickType', v)}
                        options={[
                            { value: 'facing', label: 'Facing' },
                            { value: 'engineering', label: 'Engineering' },
                        ]}
                    />
                )}
                {hasBlocks && (
                    <>
                        <Segmented<BlockType>
                            label={input.construction === 'cavity' ? 'Inner leaf' : 'Block'}
                            value={input.blockType}
                            onChange={(v) =>
                                setInput((s) => ({ ...s, blockType: v, blockThicknessMm: 100 }))
                            }
                            options={[
                                { value: 'dense', label: 'Dense 7N' },
                                { value: 'thermalite', label: 'Thermalite' },
                            ]}
                        />
                        <Segmented
                            label="Block thickness"
                            value={String(input.blockThicknessMm)}
                            onChange={(v) => set('blockThicknessMm', Number(v))}
                            options={
                                input.blockType === 'dense'
                                    ? [
                                          { value: '100', label: '100 mm' },
                                          { value: '140', label: '140 mm' },
                                      ]
                                    : [
                                          { value: '100', label: '100 mm' },
                                          { value: '215', label: '215 party wall' },
                                      ]
                            }
                        />
                    </>
                )}
                <div>
                    <span className="form-label text-sm">Openings (doors / windows)</span>
                    <ul className="m-0 p-0 list-none space-y-2">
                        {input.openings.map((o, i) => (
                            <li key={o.id} className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <input
                                        type="number"
                                        aria-label={`Opening ${i + 1} width in millimetres`}
                                        className="form-input !h-10 pr-12"
                                        value={o.widthMm || ''}
                                        min={450}
                                        max={2700}
                                        step={50}
                                        onChange={(e) => {
                                            const w = Math.min(2700, Math.max(0, Math.round(parseFloat(e.target.value) || 0)));
                                            setInput((s) => ({
                                                ...s,
                                                openings: s.openings.map((x) => (x.id === o.id ? { ...x, widthMm: w } : x)),
                                            }));
                                        }}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-text-muted pointer-events-none">
                                        mm
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    aria-label={`Remove opening ${i + 1}`}
                                    onClick={() => setInput((s) => ({ ...s, openings: s.openings.filter((x) => x.id !== o.id) }))}
                                    className="h-10 w-9 rounded-md border border-border-default text-text-muted hover:text-destructive hover:border-destructive transition-colors cursor-pointer"
                                >
                                    ×
                                </button>
                            </li>
                        ))}
                    </ul>
                    {input.openings.length < 4 && (
                        <button
                            type="button"
                            onClick={() =>
                                setInput((s) => ({
                                    ...s,
                                    openings: [...s.openings, { id: `o${Date.now() % 100000}`, widthMm: 900 }],
                                }))
                            }
                            className="btn-ghost w-full mt-2 !min-h-[38px] text-sm"
                        >
                            + Add an opening
                        </button>
                    )}
                    <span className="field-description">Each opening gets its own stocked lintel with 150 mm bearings</span>
                </div>
                <NumberField label="Steel beams" value={input.beams} onChange={(v) => set('beams', Math.round(v))} min={0} max={4} step={1} hint="Padstones under each" />
                {input.openings.length > 0 && (
                    <Segmented<LintelType>
                        label="Lintels"
                        value={input.lintelType}
                        onChange={(v) => set('lintelType', v)}
                        options={[
                            { value: 'concrete', label: 'Concrete' },
                            { value: 'steel', label: 'Steel' },
                        ]}
                    />
                )}
                <NumberField
                    label="Joins an existing wall"
                    value={input.joinsExisting}
                    onChange={(v) => set('joinsExisting', Math.round(v))}
                    min={0}
                    max={2}
                    step={1}
                    hint="Wall starter kits per junction"
                />
                <ToggleRow
                    label="Engineering bricks below DPC"
                    hint="Two dense courses + the DPC itself"
                    checked={input.dpcCourses}
                    onChange={(v) => set('dpcCourses', v)}
                />
                <ToggleRow
                    label="Air bricks"
                    hint="Ventilates a suspended timber floor"
                    checked={input.airBricks}
                    onChange={(v) => set('airBricks', v)}
                />
                {input.construction === 'cavity' && (
                    <ToggleRow
                        label="Cavity insulation"
                        hint="Full-fill batts built in as the wall rises"
                        checked={input.cavityInsulation}
                        onChange={(v) => set('cavityInsulation', v)}
                    />
                )}
                <ToggleRow
                    label="Copings"
                    hint="Caps a freestanding garden wall"
                    checked={input.includeCopings}
                    onChange={(v) => set('includeCopings', v)}
                />
                {input.includeCopings && (
                    <Segmented<CopingStyle>
                        label="Coping style"
                        value={input.copingStyle}
                        onChange={(v) => set('copingStyle', v)}
                        options={[
                            { value: 'once', label: 'Once weathered' },
                            { value: 'twice', label: 'Twice weathered' },
                        ]}
                    />
                )}
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
