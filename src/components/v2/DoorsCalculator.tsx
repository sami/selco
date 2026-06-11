/**
 * @file src/components/v2/DoorsCalculator.tsx
 *
 * Doors & linings island, a door elevation with the ironmongery marked
 * where it actually goes: three hinges, latch at 990 mm, and the fire kit
 * drawn per use. A domestic FD30 keeps its lever handles; a fire exit or
 * public door swaps them for a panic bar and picks up the closer, smoke
 * seals and signage. The bit people get wrong is the hardware, so the
 * drawing makes it explicit.
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

    const use = String(v.doorUse);
    const fire = use !== 'standard';
    const exit = use === 'exit';
    const closers = exit || (fire && v.closers === true);
    const doorType = String(v.doorType);
    const widthMm = Number(String(v.doorSize)) || 762;
    // Door 1981 high, drawn at fixed scale.
    const scale = 0.165;
    const dh = 1981 * scale;
    const dw = widthMm * scale;
    const x0 = 180;
    const y0 = (H - dh) / 2 + 8;
    const face = doorType === 'oak' ? OAK : doorType === 'primed' ? PANEL : '#cdc4b4';

    const liningLabel = fire
        ? 'Firecheck lining, 38 mm'
        : String(v.lining).startsWith('mdf')
          ? `Primed MDF lining, 25 × ${String(v.lining) === 'mdf108' ? 108 : 132} mm`
          : `Softwood lining, 32 × ${String(v.lining) === 'sw115' ? 115 : 138} mm`;

    const hinges = [
        { y: 150, label: '150 mm down' },
        { y: 1981 / 2, label: 'centre' },
        { y: 1981 - 230, label: '230 mm up' },
    ];

    // Panic bar sits between 900 and 1100 mm off the floor; drawn at 1000.
    const barY = y0 + (1981 - 1000) * scale;
    const latchY = y0 + (1981 - 990) * scale;

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Door elevation with hinge, latch and fire hardware positions">
            {/* lining */}
            <rect x={x0 - 14} y={y0 - 14} width={dw + 28} height={dh + 14} fill="none" stroke="#fff" strokeWidth="6" />
            <text x={x0 + dw / 2} y={y0 - 26} fill="#fff" fontSize="11" textAnchor="middle" opacity="0.9">
                {liningLabel}
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
                        {exit ? 'intumescent strip + FD30S smoke seal, all three sides' : 'intumescent strip + smoke seal, all three sides'}
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

            {/* latch + handle, or panic bar on escape doors */}
            {exit ? (
                <>
                    <rect x={x0 + 8} y={barY - 5} width={dw - 16} height={10} rx="5" fill={YELLOW} stroke="#04204b" strokeWidth="1.5" />
                    <line x1={x0 + dw - 8} y1={barY} x2={x0 + dw + 50} y2={barY} stroke={YELLOW} strokeWidth="1" />
                    <text x={x0 + dw + 56} y={barY + 4} fill={YELLOW} fontSize="10" fontWeight="600">
                        panic bar at 900-1100 mm
                    </text>
                </>
            ) : (
                <>
                    <circle cx={x0 + dw - 28} cy={latchY} r="7" fill="none" stroke="#04204b" strokeWidth="2" />
                    <line x1={x0 + dw - 21} y1={latchY} x2={x0 + dw + 50} y2={latchY} stroke={YELLOW} strokeWidth="1" />
                    <text x={x0 + dw + 56} y={latchY + 4} fill={YELLOW} fontSize="10" fontWeight="600">
                        latch + lever at 990 mm
                    </text>
                </>
            )}

            {/* closer */}
            {closers && (
                <>
                    <rect x={x0 + 18} y={y0 + 12} width={64} height={16} rx="4" fill="#04204b" stroke={YELLOW} strokeWidth="1.5" />
                    <line x1={x0 + 82} y1={y0 + 20} x2={x0 + dw + 50} y2={y0 + 20} stroke={YELLOW} strokeWidth="1" />
                    <text x={x0 + dw + 56} y={y0 + 24} fill={YELLOW} fontSize="10" fontWeight="600">
                        {exit ? 'overhead closer, mandatory' : 'overhead closer'}
                    </text>
                </>
            )}

            {/* fire door signage */}
            {exit && (
                <>
                    <circle cx={x0 + dw / 2} cy={y0 + 56} r="13" fill="#1d4ed8" stroke="#fff" strokeWidth="2" />
                    <line x1={x0 + dw / 2 + 13} y1={y0 + 56} x2={x0 + dw + 50} y2={y0 + 56} stroke={YELLOW} strokeWidth="1" />
                    <text x={x0 + dw + 56} y={y0 + 60} fill={YELLOW} fontSize="10" fontWeight="600">
                        sign both faces: fire door keep shut
                    </text>
                </>
            )}

            {/* gaps note */}
            <text x={x0 + dw / 2} y={y0 + dh + (fire ? 44 : 24)} fill="#fff" fontSize="10" textAnchor="middle" opacity="0.85">
                2-3 mm gap at sides and top, {fire ? 'max 4 mm' : '6 mm'} at the floor
            </text>

            {/* spec panel */}
            <g transform={`translate(${x0 + dw + 150}, ${y0 + 200})`} fill="#fff" fontSize="11">
                <text fontWeight="700" fontSize="13" fill={YELLOW}>
                    {exit ? 'Fire exit / public door' : fire ? 'FD30 fire door' : 'Standard internal'}
                </text>
                <text y="24">1981 × {widthMm} × {fire ? 44 : 35} mm</text>
                <text y="44">{fire ? 'Fire-rated grade 11 hinges, 100 mm' : 'Ball bearing hinges, 75 mm'}</text>
                <text y="64">{exit ? 'Push bar to open, EN 1125' : fire ? 'Fire-rated latch, lever handles' : 'Tubular latch, lever handles'}</text>
                <text y="84" opacity="0.8">
                    {exit ? 'One push opens it, no key' : fire ? 'Never trim past 3-6 mm per edge' : 'Plane edges evenly, both stiles'}
                </text>
            </g>
        </svg>
    );
}

export default function DoorsCalculator() {
    const [v, setV] = useState<Values>({
        doors: 3,
        doorUse: 'standard',
        doorType: 'oak',
        doorSize: '762',
        lining: 'sw138',
        closers: false,
        newLinings: true,
    });
    const bom = useMemo(() => doorsLinings.compute(v), [v]);
    const set = (k: string, val: Values[string]) => setV((s) => ({ ...s, [k]: val }));

    const use = String(v.doorUse);
    const fire = use !== 'standard';
    const sizeOptions = doorsLinings.fields.find((f) => f.id === 'doorSize');
    const liningOptions = doorsLinings.fields.find((f) => f.id === 'lining');

    return (
        <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)] items-start">
            <JobCard title="Job details">
                <NumberField label="Number of doors" value={Number(v.doors)} onChange={(x) => set('doors', Math.round(x))} min={1} max={12} step={1} />
                <div>
                    <Segmented
                        label="What are the doors for?"
                        value={use}
                        onChange={(x) => set('doorUse', x)}
                        options={[
                            { value: 'standard', label: 'Standard' },
                            { value: 'fd30', label: 'FD30 internal' },
                            { value: 'exit', label: 'Fire exit / public' },
                        ]}
                    />
                    <span className="field-description">
                        {use === 'standard'
                            ? 'Everyday internal doors, 35 mm leaf.'
                            : use === 'fd30'
                              ? 'FD30 at home: garages, lofts, three storeys. Lever handles are fine.'
                              : 'Escape and public doors: panic bar, closer, smoke seals and signage.'}
                    </span>
                </div>
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
                {sizeOptions?.kind === 'choice' && (
                    <div>
                        <label htmlFor="door-size" className="form-label text-sm">Door size</label>
                        <select id="door-size" className="form-select" value={String(v.doorSize)} onChange={(e) => set('doorSize', e.target.value)}>
                            {sizeOptions.options.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                        <span className="field-description">All 1981 mm (6'6") high; the width is the door size.</span>
                    </div>
                )}
                {liningOptions?.kind === 'choice' && (
                    <div>
                        <label htmlFor="lining" className="form-label text-sm">Lining</label>
                        <select id="lining" className="form-select" value={String(v.lining)} onChange={(e) => set('lining', e.target.value)} disabled={v.newLinings !== true}>
                            {liningOptions.options.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                        <span className="field-description">
                            {fire
                                ? 'Fire doors swap to a Firecheck 38 mm pack at the nearest width automatically.'
                                : 'Match the lining depth to the finished wall thickness.'}
                        </span>
                    </div>
                )}
                {use === 'fd30' && (
                    <ToggleRow label="Add self-closers" hint="Needed in flats, HMOs and rented homes" checked={v.closers === true} onChange={(x) => set('closers', x)} />
                )}
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
