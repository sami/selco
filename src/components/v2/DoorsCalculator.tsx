/**
 * @file src/components/v2/DoorsCalculator.tsx
 *
 * Doors & linings island — a door elevation with the ironmongery marked
 * where it actually goes: three hinges, latch at 990 mm, and the fire kit
 * (intumescent strips, closer) highlighted when FD30 is on. The bit people
 * get wrong is the hardware, so the drawing makes it explicit.
 */

import { useMemo, useState } from 'react';
import { doorsLinings } from '../../calculators/v2/specs/interiors';
import type { Values } from '../../calculators/v2/specs/spec-types';
import { BlueprintPanel, JobCard, NumberField, Segmented, ToggleRow } from './ui';
import MaterialsTicket from './MaterialsTicket';

const YELLOW = '#ffd407';
const OAK = '#b08a4f';
const PANEL = '#e8e4dc';

function DoorPreview({ v }: { v: Values }) {
    const W = 760;
    const H = 430;

    const fire = v.fire === true;
    const doorType = String(v.doorType);
    // Door 1981 x 762, drawn at fixed scale.
    const scale = 0.165;
    const dh = 1981 * scale;
    const dw = 762 * scale;
    const x0 = 180;
    const y0 = (H - dh) / 2 + 8;
    const face = doorType === 'oak' ? OAK : doorType === 'primed' ? PANEL : '#cdc4b4';

    const hinges = [
        { y: 150, label: '150 mm down' },
        { y: 1981 / 2, label: 'centre' },
        { y: 1981 - 230, label: '230 mm up' },
    ];

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Door elevation with hinge and latch positions">
            {/* lining */}
            <rect x={x0 - 14} y={y0 - 14} width={dw + 28} height={dh + 14} fill="none" stroke="#fff" strokeWidth="6" />
            <text x={x0 + dw / 2} y={y0 - 26} fill="#fff" fontSize="11" textAnchor="middle" opacity="0.9">
                {fire ? 'Firecheck lining, 38 × 138 mm' : 'door lining pack, 32 × 138 mm'}
            </text>

            {/* leaf */}
            <rect x={x0} y={y0} width={dw} height={dh} fill={face} stroke="#04204b" strokeWidth="1.5" />
            {/* simple 4-panel suggestion */}
            {doorType !== 'primed' &&
                [0, 1].map((c) =>
                    [0, 1].map((r) => (
                        <rect
                            key={`${c}${r}`}
                            x={x0 + 14 + c * (dw / 2)}
                            y={y0 + 16 + r * (dh / 2)}
                            width={dw / 2 - 28}
                            height={dh / 2 - 32}
                            fill="none"
                            stroke="#04204b"
                            strokeWidth="1"
                            opacity="0.45"
                        />
                    )),
                )}

            {/* intumescent strip */}
            {fire && (
                <>
                    <rect x={x0 - 7} y={y0 - 7} width={dw + 14} height={dh + 7} fill="none" stroke={YELLOW} strokeWidth="3" strokeDasharray="14 7" />
                    <text x={x0 + dw / 2} y={y0 + dh + 24} fill={YELLOW} fontSize="11" fontWeight="700" textAnchor="middle">
                        intumescent strip + smoke seal in the lining, all three sides
                    </text>
                </>
            )}

            {/* hinges */}
            {hinges.map((h, i) => (
                <g key={i}>
                    <rect x={x0 - 5} y={y0 + h.y * scale - 9} width={10} height={18} fill={YELLOW} stroke="#04204b" strokeWidth="1" />
                    <line x1={x0 - 5} y1={y0 + h.y * scale} x2={x0 - 60} y2={y0 + h.y * scale} stroke={YELLOW} strokeWidth="1" />
                    <text x={x0 - 66} y={y0 + h.y * scale + 4} fill={YELLOW} fontSize="10" fontWeight="600" textAnchor="end">
                        {h.label}
                    </text>
                </g>
            ))}
            <text x={x0 - 66} y={y0 + dh + 4} fill="#fff" fontSize="10" textAnchor="end" opacity="0.9">
                3 hinges{fire ? ', fire-rated' : ''}
            </text>

            {/* latch + handle */}
            <circle cx={x0 + dw - 28} cy={y0 + (1981 - 990) * scale} r="7" fill="none" stroke="#04204b" strokeWidth="2" />
            <line x1={x0 + dw - 21} y1={y0 + (1981 - 990) * scale} x2={x0 + dw + 50} y2={y0 + (1981 - 990) * scale} stroke={YELLOW} strokeWidth="1" />
            <text x={x0 + dw + 56} y={y0 + (1981 - 990) * scale + 4} fill={YELLOW} fontSize="10" fontWeight="600">
                latch + lever at 990 mm
            </text>

            {/* closer */}
            {fire && (
                <>
                    <rect x={x0 + 18} y={y0 + 12} width={64} height={16} rx="4" fill="#04204b" stroke={YELLOW} strokeWidth="1.5" />
                    <line x1={x0 + 82} y1={y0 + 20} x2={x0 + dw + 50} y2={y0 + 20} stroke={YELLOW} strokeWidth="1" />
                    <text x={x0 + dw + 56} y={y0 + 24} fill={YELLOW} fontSize="10" fontWeight="600">
                        overhead closer (public / HMO)
                    </text>
                </>
            )}

            {/* gaps note */}
            <text x={x0 + dw / 2} y={y0 + dh + (fire ? 44 : 24)} fill="#fff" fontSize="10" textAnchor="middle" opacity="0.85">
                2-3 mm gap at sides and top, {fire ? 'max 4 mm' : '6 mm'} at the floor
            </text>

            {/* spec panel */}
            <g transform={`translate(${x0 + dw + 150}, ${y0 + 60})`} fill="#fff" fontSize="11">
                <text fontWeight="700" fontSize="13" fill={YELLOW}>
                    {fire ? 'FD30 fire door' : 'Standard internal'}
                </text>
                <text y="24">1981 × 762 × {fire ? 44 : 35} mm</text>
                <text y="44">{fire ? 'Fire-rated grade 11 hinges' : 'Ball bearing hinges, 75 mm'}</text>
                <text y="64">{fire ? 'Fire-rated tubular latch' : 'Tubular latch, 75 mm'}</text>
                <text y="84" opacity="0.8">
                    {fire ? 'Never trim past 3-6 mm per edge' : 'Plane edges evenly, both stiles'}
                </text>
            </g>
        </svg>
    );
}

export default function DoorsCalculator() {
    const [v, setV] = useState<Values>({ doors: 3, doorType: 'oak', fire: false, newLinings: true });
    const bom = useMemo(() => doorsLinings.compute(v), [v]);
    const set = (k: string, val: Values[string]) => setV((s) => ({ ...s, [k]: val }));

    return (
        <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)] items-start">
            <JobCard title="Job details">
                <NumberField label="Number of doors" value={Number(v.doors)} onChange={(x) => set('doors', Math.round(x))} min={1} max={12} step={1} />
                <Segmented
                    label="Door type"
                    value={String(v.doorType)}
                    onChange={(x) => set('doorType', x)}
                    options={[
                        { value: 'panel', label: 'Moulded' },
                        { value: 'oak', label: 'Oak veneer' },
                        { value: 'primed', label: 'Primed' },
                    ]}
                />
                <ToggleRow label="FD30 fire doors" hint="Garages, lofts, HMOs. Adds the fire kit" checked={v.fire === true} onChange={(x) => set('fire', x)} />
                <ToggleRow label="New linings" hint="Off = hanging into existing frames" checked={v.newLinings === true} onChange={(x) => set('newLinings', x)} />
            </JobCard>

            <div className="space-y-6">
                <BlueprintPanel title="How it hangs">
                    <DoorPreview v={v} />
                </BlueprintPanel>
                <MaterialsTicket bom={bom} />
            </div>
        </div>
    );
}
