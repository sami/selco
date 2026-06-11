/**
 * @file src/components/v2/FrenchDrainCalculator.tsx
 *
 * French drain island, trench cross-section showing the geotextile wrap,
 * clean stone fill, optional carrier pipe and the surface finish, plus a
 * little long-section showing the fall to the soakaway.
 */

import { useMemo, useState } from 'react';
import { calculateFrenchDrain, type FrenchDrainInput } from '../../calculators/v2/french-drain';
import { BlueprintPanel, JobCard, NumberField, Segmented, ToggleRow } from './ui';
import MaterialsTicket from './MaterialsTicket';

const YELLOW = '#ffd407';
const STONE = 'rgba(255,255,255,0.55)';

function DrainPreview({ input }: { input: FrenchDrainInput }) {
    const W = 760;
    const H = 430;

    // Cross-section (left): trench drawn to scale-ish, exaggerated width.
    const csX = 70;
    const csW = 240;
    const groundY = 120;
    const depthPx = Math.min(230, (input.depthMm / 1000) * 220);
    const capPx = Math.min(40, 0.15 * 220);
    const trenchW = input.widthMm === 450 ? csW : csW * 0.72;
    const tx = csX + (csW - trenchW) / 2;

    // Stone fill: rows of pebbles.
    const pebbles: Array<{ x: number; y: number; r: number }> = [];
    for (let y = groundY + capPx + 10; y < groundY + depthPx - 8; y += 16) {
        for (let x = tx + 10; x < tx + trenchW - 8; x += 17) {
            pebbles.push({ x: x + ((y / 16) % 2) * 7, y, r: 6 });
        }
    }

    // Long-section (right): fall to outfall/soakaway.
    const lsX = 410;
    const lsW = 290;
    const fallDrop = 26;

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="French drain cross-section and fall diagram">
            {/* ============ cross-section ============ */}
            <text x={csX + csW / 2} y={36} fill="#fff" fontSize="13" fontWeight="700" textAnchor="middle">
                Cross-section
            </text>

            {/* ground */}
            <line x1={20} y1={groundY} x2={370} y2={groundY} stroke="#fff" strokeWidth="2" strokeDasharray="10 6" />
            <text x={24} y={groundY - 8} fill="#fff" fontSize="10" opacity="0.85">
                ground level
            </text>

            {/* trench */}
            <rect x={tx} y={groundY} width={trenchW} height={depthPx} fill="rgba(0,0,0,0.3)" stroke="#fff" strokeWidth="1.5" />

            {/* geotextile lining + top wrap */}
            <path
                d={`M ${tx - 4} ${groundY + capPx} L ${tx + 6} ${groundY + capPx} L ${tx + 6} ${groundY + depthPx - 6} L ${tx + trenchW - 6} ${groundY + depthPx - 6} L ${tx + trenchW - 6} ${groundY + capPx} L ${tx + trenchW + 4} ${groundY + capPx}`}
                fill="none"
                stroke={YELLOW}
                strokeWidth="2.5"
            />
            <line x1={tx + 6} y1={groundY + capPx} x2={tx + trenchW - 6} y2={groundY + capPx} stroke={YELLOW} strokeWidth="2.5" strokeDasharray="6 4" />
            <text x={tx + trenchW + 10} y={groundY + capPx + 4} fill={YELLOW} fontSize="10" fontWeight="600">
                geotextile wrap
            </text>

            {/* stone fill */}
            {pebbles.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={p.r} fill="none" stroke={STONE} strokeWidth="1.4" />
            ))}

            {/* carrier pipe */}
            {input.carrierPipe && (
                <>
                    <circle cx={tx + trenchW / 2} cy={groundY + depthPx - 26} r="16" fill="#04204b" stroke="#fff" strokeWidth="2" />
                    <text x={tx + trenchW / 2} y={groundY + depthPx + 20} fill="#fff" fontSize="10" textAnchor="middle" opacity="0.85">
                        110 mm carrier pipe
                    </text>
                </>
            )}

            {/* cap */}
            <rect x={tx} y={groundY} width={trenchW} height={capPx} fill={input.gravelFinish ? 'rgba(255,212,7,0.25)' : 'rgba(96,160,80,0.45)'} stroke="none" />
            <text x={tx + trenchW / 2} y={groundY + capPx / 2 + 4} fill="#fff" fontSize="10" textAnchor="middle">
                {input.gravelFinish ? 'gravel finish' : 'topsoil + turf'}
            </text>

            {/* dimensions */}
            <g fill={YELLOW} fontSize="12" fontWeight="700">
                <line x1={tx - 18} y1={groundY} x2={tx - 18} y2={groundY + depthPx} stroke={YELLOW} strokeWidth="1" />
                <text x={tx - 26} y={groundY + depthPx / 2} textAnchor="middle" transform={`rotate(-90 ${tx - 26} ${groundY + depthPx / 2})`}>
                    {input.depthMm} mm
                </text>
                <line x1={tx} y1={groundY + depthPx + 14} x2={tx + trenchW} y2={groundY + depthPx + 14} stroke={YELLOW} strokeWidth="1" />
                <text x={tx + trenchW / 2} y={groundY + depthPx + 32} textAnchor="middle">
                    {input.widthMm} mm
                </text>
            </g>

            {/* ============ long-section ============ */}
            <text x={lsX + lsW / 2} y={36} fill="#fff" fontSize="13" fontWeight="700" textAnchor="middle">
                Fall to the outfall
            </text>

            <line x1={lsX} y1={groundY} x2={lsX + lsW} y2={groundY} stroke="#fff" strokeWidth="2" strokeDasharray="10 6" />

            {/* falling trench */}
            <path
                d={`M ${lsX} ${groundY + 36} L ${lsX + lsW - 70} ${groundY + 36 + fallDrop} L ${lsX + lsW - 70} ${groundY + 12 + fallDrop} L ${lsX} ${groundY + 12} Z`}
                fill={STONE}
                opacity="0.5"
            />
            <line x1={lsX} y1={groundY + 36} x2={lsX + lsW - 70} y2={groundY + 36 + fallDrop} stroke={YELLOW} strokeWidth="2" />
            <text x={lsX + (lsW - 70) / 2} y={groundY + 70 + fallDrop / 2} fill={YELLOW} fontSize="11" fontWeight="600" textAnchor="middle">
                1:100 fall ({input.lengthM.toFixed(1)} m run)
            </text>

            {/* soakaway */}
            {input.soakaway ? (
                <>
                    <rect x={lsX + lsW - 62} y={groundY + 30 + fallDrop} width={56} height={44} fill="rgba(255,255,255,0.15)" stroke="#fff" strokeWidth="1.5" />
                    <line x1={lsX + lsW - 62} y1={groundY + 44 + fallDrop} x2={lsX + lsW - 6} y2={groundY + 44 + fallDrop} stroke="#fff" strokeWidth="0.8" />
                    <line x1={lsX + lsW - 34} y1={groundY + 30 + fallDrop} x2={lsX + lsW - 34} y2={groundY + 74 + fallDrop} stroke="#fff" strokeWidth="0.8" />
                    <text x={lsX + lsW - 34} y={groundY + 94 + fallDrop} fill="#fff" fontSize="10" textAnchor="middle" opacity="0.85">
                        soakaway crates
                    </text>
                </>
            ) : (
                <text x={lsX + lsW - 34} y={groundY + 50 + fallDrop} fill="#fff" fontSize="16" textAnchor="middle">
                    →
                </text>
            )}

            <text x={W / 2} y={H - 12} fill="#fff" fontSize="11" textAnchor="middle" opacity="0.85">
                Water filters through the stone, silt stays outside the wrap
            </text>
        </svg>
    );
}

export default function FrenchDrainCalculator() {
    const [input, setInput] = useState<FrenchDrainInput>({
        lengthM: 10,
        widthMm: 300,
        depthMm: 600,
        carrierPipe: false,
        carrierRunM: 5,
        soakaway: false,
        gravelFinish: true,
    });

    const bom = useMemo(() => calculateFrenchDrain(input), [input]);
    const set = <K extends keyof FrenchDrainInput>(k: K, v: FrenchDrainInput[K]) =>
        setInput((s) => ({ ...s, [k]: v }));

    return (
        <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)] items-start">
            <JobCard title="Job details">
                <NumberField label="Drain run" value={input.lengthM} onChange={(v) => set('lengthM', v)} unit="m" min={1} max={60} />
                <Segmented
                    label="Trench width"
                    value={String(input.widthMm)}
                    onChange={(v) => set('widthMm', Number(v))}
                    options={[
                        { value: '300', label: '300 mm' },
                        { value: '450', label: '450 mm' },
                    ]}
                />
                <NumberField label="Trench depth" value={input.depthMm} onChange={(v) => set('depthMm', Math.round(v))} unit="mm" min={300} max={1200} step={50} />
                <ToggleRow
                    label="Carrier pipe to an outfall"
                    hint="Solid 110 mm pipe takes the water away"
                    checked={input.carrierPipe}
                    onChange={(v) => set('carrierPipe', v)}
                />
                {input.carrierPipe && (
                    <NumberField label="Pipe run to outfall" value={input.carrierRunM} onChange={(v) => set('carrierRunM', v)} unit="m" min={1} max={30} />
                )}
                <ToggleRow
                    label="Soakaway crates"
                    hint="Where there's nowhere to discharge"
                    checked={input.soakaway}
                    onChange={(v) => set('soakaway', v)}
                />
                <ToggleRow
                    label="Gravel finish"
                    hint="Flush decorative top instead of turf"
                    checked={input.gravelFinish}
                    onChange={(v) => set('gravelFinish', v)}
                />
            </JobCard>

            <div className="space-y-6">
                <BlueprintPanel title="How it goes together">
                    <DrainPreview input={input} />
                </BlueprintPanel>
                <MaterialsTicket bom={bom} />
            </div>
        </div>
    );
}
