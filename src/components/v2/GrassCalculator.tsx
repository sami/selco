/**
 * @file src/components/v2/GrassCalculator.tsx
 *
 * Artificial grass island, live inputs, a plan-view SVG showing the 2 m
 * roll strips, the side seams between them and the cross seams where rolls
 * join end-to-end, plus the materials ticket.
 */

import { useMemo, useState } from 'react';
import {
    calculateGrass,
    planGrass,
    type GrassInput,
} from '../../calculators/v2/artificial-grass';
import { BlueprintPanel, JobCard, NumberField, ToggleRow } from './ui';
import MaterialsTicket from './MaterialsTicket';

const NAVY = '#04204b';
const YELLOW = '#ffd407';
const GRASS = '#3e9d52';
const GRASS_DARK = '#2f7f41';

/** Cumulative roll boundaries within a strip (cross-seam positions). */
function rollBoundaries(rolls: number[]): number[] {
    const bs: number[] = [];
    let acc = 0;
    for (let k = 0; k < rolls.length - 1; k++) {
        acc += rolls[k];
        bs.push(acc);
    }
    return bs;
}

function GrassPreview({ input }: { input: GrassInput }) {
    const plan = useMemo(() => planGrass(input), [input]);
    const W = 760;
    const H = 430;
    const PAD = 56;

    const scale = Math.min((W - PAD * 2) / input.widthM, (H - PAD * 2) / input.lengthM);
    const lw = input.widthM * scale;
    const lh = input.lengthM * scale;
    const x0 = (W - lw) / 2;
    const y0 = (H - lh) / 2;
    const along = plan.stripsRunAlongLength;
    const totalSeams = plan.sideSeams + plan.crossSeams;

    const strips = plan.strips.map((s, i) =>
        along
            ? { i, x: x0 + s.offsetM * scale, y: y0, w: s.widthM * scale, h: lh, rolls: s.rolls }
            : { i, x: x0, y: y0 + s.offsetM * scale, w: lw, h: s.widthM * scale, rolls: s.rolls },
    );

    return (
        <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-auto"
            role="img"
            aria-label={`Lawn plan: ${plan.strips.length} grass strips with ${totalSeams} seams`}
        >
            <defs>
                <pattern id="pile" width="6" height="6" patternUnits="userSpaceOnUse">
                    <rect width="6" height="6" fill={GRASS} />
                    <path d="M0 6 L3 2 L6 6" stroke={GRASS_DARK} strokeWidth="1" fill="none" />
                </pattern>
            </defs>

            {/* strips */}
            {strips.map((s) => (
                <g key={s.i}>
                    <rect x={s.x} y={s.y} width={s.w} height={s.h} fill="url(#pile)" stroke={NAVY} strokeWidth="1" />
                    <text
                        x={s.x + s.w / 2}
                        y={s.y + s.h / 2}
                        fill="#fff"
                        fontSize="12"
                        fontWeight="700"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        transform={along ? `rotate(-90 ${s.x + s.w / 2} ${s.y + s.h / 2})` : undefined}
                        style={{ paintOrder: 'stroke', stroke: GRASS_DARK, strokeWidth: 3 }}
                    >
                        Strip {s.i + 1} · {s.rolls.join('+')} m
                    </text>
                </g>
            ))}

            {/* cross seams (rolls joined end-to-end within a strip) */}
            {strips.map((s) =>
                rollBoundaries(s.rolls).map((b, k) =>
                    along ? (
                        <line
                            key={`x-${s.i}-${k}`}
                            x1={s.x}
                            y1={y0 + b * scale}
                            x2={s.x + s.w}
                            y2={y0 + b * scale}
                            stroke={YELLOW}
                            strokeWidth="2"
                            strokeDasharray="5 4"
                        />
                    ) : (
                        <line
                            key={`x-${s.i}-${k}`}
                            x1={x0 + b * scale}
                            y1={s.y}
                            x2={x0 + b * scale}
                            y2={s.y + s.h}
                            stroke={YELLOW}
                            strokeWidth="2"
                            strokeDasharray="5 4"
                        />
                    ),
                ),
            )}

            {/* side seams (between strips) */}
            {strips.slice(1).map((s) =>
                along ? (
                    <line key={`s-${s.i}`} x1={s.x} y1={y0} x2={s.x} y2={y0 + lh} stroke={YELLOW} strokeWidth="2.5" strokeDasharray="8 5" />
                ) : (
                    <line key={`s-${s.i}`} x1={x0} y1={s.y} x2={x0 + lw} y2={s.y} stroke={YELLOW} strokeWidth="2.5" strokeDasharray="8 5" />
                ),
            )}

            {/* lawn outline */}
            <rect x={x0} y={y0} width={lw} height={lh} fill="none" stroke="#fff" strokeWidth="2" />

            {/* dimensions */}
            <g fill={YELLOW} fontSize="13" fontWeight="700">
                <line x1={x0} y1={y0 - 18} x2={x0 + lw} y2={y0 - 18} stroke={YELLOW} strokeWidth="1" />
                <text x={x0 + lw / 2} y={y0 - 26} textAnchor="middle">
                    {input.widthM.toFixed(1)} m
                </text>
                <line x1={x0 - 18} y1={y0} x2={x0 - 18} y2={y0 + lh} stroke={YELLOW} strokeWidth="1" />
                <text x={x0 - 26} y={y0 + lh / 2} textAnchor="middle" transform={`rotate(-90 ${x0 - 26} ${y0 + lh / 2})`}>
                    {input.lengthM.toFixed(1)} m
                </text>
            </g>

            {/* pile direction arrow */}
            <g transform={`translate(${x0 + lw + 14}, ${y0 + lh / 2})`} stroke="#fff" fill="#fff">
                <line x1="0" y1="-28" x2="0" y2="28" strokeWidth="2" />
                <path d="M-5 20 L0 30 L5 20 Z" stroke="none" />
                <text x="14" y="0" fontSize="11" fontWeight="600" stroke="none" textAnchor="middle" transform="rotate(-90 14 0)">
                    pile direction
                </text>
            </g>

            {/* legend */}
            <g transform={`translate(${PAD - 40}, ${H - 18})`} fontSize="11" fill="#fff">
                <line x1="0" y1="-4" x2="26" y2="-4" stroke={YELLOW} strokeWidth="2.5" strokeDasharray="8 5" />
                <text x="32" y="0">
                    taped &amp; glued seam ({totalSeams})
                </text>
            </g>
        </svg>
    );
}

export default function GrassCalculator() {
    const [input, setInput] = useState<GrassInput>({
        widthM: 5,
        lengthM: 7,
        includeGroundworks: true,
        includeInfill: true,
        includeEdging: false,
    });

    const bom = useMemo(() => calculateGrass(input), [input]);
    const set = <K extends keyof GrassInput>(k: K, v: GrassInput[K]) =>
        setInput((s) => ({ ...s, [k]: v }));

    return (
        <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)] items-start">
            <JobCard title="Job details">
                <NumberField label="Lawn width" value={input.widthM} onChange={(v) => set('widthM', v)} unit="m" min={0.5} max={40} />
                <NumberField label="Lawn length" value={input.lengthM} onChange={(v) => set('lengthM', v)} unit="m" min={0.5} max={40} />
                <ToggleRow
                    label="Include groundworks"
                    hint="MOT Type 1 + sharp sand build-up"
                    checked={input.includeGroundworks}
                    onChange={(v) => set('includeGroundworks', v)}
                />
                <ToggleRow
                    label="Kiln-dried sand infill"
                    hint="~5 kg/m², keeps pile upright"
                    checked={input.includeInfill}
                    onChange={(v) => set('includeInfill', v)}
                />
                <ToggleRow
                    label="CORE EDGE lawn edging"
                    hint="Perimeter edging restraint"
                    checked={input.includeEdging}
                    onChange={(v) => set('includeEdging', v)}
                />
            </JobCard>

            <div className="space-y-6">
                <BlueprintPanel title="Roll plan">
                    <GrassPreview input={input} />
                </BlueprintPanel>
                <MaterialsTicket bom={bom} />
            </div>
        </div>
    );
}
