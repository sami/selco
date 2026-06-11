/**
 * @file src/components/v2/FlooringCalculator.tsx
 *
 * Hard flooring island, draws the plank rows with the staggered end
 * joints a fitter would lay, plus the materials ticket.
 */

import { useMemo, useState } from 'react';
import {
    calculateFlooring,
    FLOOR_TYPES,
    planFlooring,
    resolveFloor,
    UNDERLAYS,
    type FlooringInput,
} from '../../calculators/v2/flooring';
import { BlueprintPanel, JobCard, NumberField, Segmented, ToggleRow } from './ui';
import MaterialsTicket from './MaterialsTicket';

const YELLOW = '#ffd407';
const PLANK_FILLS = ['rgba(255,255,255,0.20)', 'rgba(255,255,255,0.13)', 'rgba(255,255,255,0.26)'];

function FlooringPreview({ input }: { input: FlooringInput }) {
    const plan = useMemo(() => planFlooring(input), [input]);
    const W = 760;
    const H = 430;
    const PAD = 56;

    const scale = Math.min((W - PAD * 2) / input.lengthM, (H - PAD * 2) / input.widthM);
    // Drawn with the room length horizontal (planks run left-right).
    const rw = input.lengthM * scale;
    const rh = input.widthM * scale;
    const x0 = (W - rw) / 2;
    const y0 = (H - rh) / 2;

    const rowH = (plan.floor.plankMm.w / 1000) * scale;
    const plankL = (plan.floor.plankMm.l / 1000) * scale;

    const planks: Array<{ x: number; y: number; w: number; h: number; shade: number }> = [];
    for (let r = 0; r < plan.rows; r++) {
        const y = y0 + r * rowH;
        const h = Math.min(rowH, y0 + rh - y);
        if (h <= 1) continue;
        // Stagger: each row starts with an offcut offset of 1/3 plank cycling.
        const offset = ((r % 3) / 3) * plankL;
        let x = x0 - (offset === 0 ? 0 : plankL - offset);
        let i = 0;
        while (x < x0 + rw) {
            const start = Math.max(x, x0);
            const end = Math.min(x + plankL, x0 + rw);
            if (end - start > 1) {
                planks.push({ x: start, y, w: end - start, h, shade: (r + i) % 3 });
            }
            x += plankL;
            i++;
        }
    }

    return (
        <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-auto"
            role="img"
            aria-label={`Plank layout: ${plan.rows} rows with staggered joints`}
        >
            {planks.map((p, i) => (
                <rect
                    key={i}
                    x={p.x + 0.5}
                    y={p.y + 0.5}
                    width={Math.max(1, p.w - 1)}
                    height={Math.max(1, p.h - 1)}
                    fill={PLANK_FILLS[p.shade]}
                    stroke="#fff"
                    strokeWidth="0.7"
                />
            ))}

            <rect x={x0} y={y0} width={rw} height={rh} fill="none" stroke="#fff" strokeWidth="2.5" />
            {/* expansion gap callout */}
            <rect x={x0 - 5} y={y0 - 5} width={rw + 10} height={rh + 10} fill="none" stroke={YELLOW} strokeWidth="1.2" strokeDasharray="6 5" />

            <g fill={YELLOW} fontSize="13" fontWeight="700">
                <text x={x0 + rw / 2} y={y0 - 24} textAnchor="middle">
                    {input.lengthM.toFixed(1)} m
                </text>
                <text x={x0 - 26} y={y0 + rh / 2} textAnchor="middle" transform={`rotate(-90 ${x0 - 26} ${y0 + rh / 2})`}>
                    {input.widthM.toFixed(1)} m
                </text>
            </g>

            <text x={W / 2} y={H - 12} fill="#fff" fontSize="11" textAnchor="middle" opacity="0.85">
                Dashed line = 10 mm expansion gap all round · end joints staggered ⅓ plank
            </text>
        </svg>
    );
}

export default function FlooringCalculator() {
    const [input, setInput] = useState<FlooringInput>({
        widthM: 3.5,
        lengthM: 4.5,
        floorId: 'laminate8',
        underlay: 'foam',
        fixing: 'floating',
        concreteSubfloor: false,
        doorways: 1,
    });

    const bom = useMemo(() => calculateFlooring(input), [input]);
    const set = <K extends keyof FlooringInput>(k: K, v: FlooringInput[K]) =>
        setInput((s) => ({ ...s, [k]: v }));

    const floor = resolveFloor(input.floorId);
    const glued = input.fixing === 'glued' && floor.canGlue;

    return (
        <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)] items-start">
            <JobCard title="Job details">
                <div className="grid grid-cols-2 gap-3">
                    <NumberField label="Room width" value={input.widthM} onChange={(v) => set('widthM', v)} unit="m" min={0.5} max={15} />
                    <NumberField label="Room length" value={input.lengthM} onChange={(v) => set('lengthM', v)} unit="m" min={0.5} max={20} />
                </div>
                <div>
                    <label htmlFor="floor-type" className="form-label text-sm">
                        Floor type
                    </label>
                    <select id="floor-type" className="form-select" value={input.floorId} onChange={(e) => set('floorId', e.target.value)}>
                        {FLOOR_TYPES.map((f) => (
                            <option key={f.id} value={f.id}>
                                {f.label}
                            </option>
                        ))}
                    </select>
                    <span className="field-description">
                        Thickness sets the threshold height and door undercut, not how much floor you buy.
                    </span>
                </div>
                {floor.canGlue ? (
                    <Segmented
                        label="Fixing method"
                        value={input.fixing}
                        onChange={(v) => set('fixing', v)}
                        options={[
                            { value: 'floating', label: 'Floating (click)' },
                            { value: 'glued', label: 'Glue down' },
                        ]}
                    />
                ) : (
                    <p className="field-description">This floor is click-fit (floating) only — it isn’t glued down.</p>
                )}
                <div>
                    <label htmlFor="underlay" className="form-label text-sm">
                        Underlay
                    </label>
                    <select
                        id="underlay"
                        className="form-select"
                        value={glued ? 'none' : input.underlay}
                        onChange={(e) => set('underlay', e.target.value as FlooringInput['underlay'])}
                        disabled={glued}
                    >
                        {UNDERLAYS.map((u) => (
                            <option key={u.id} value={u.id}>
                                {u.label}
                            </option>
                        ))}
                    </select>
                    <span className="field-description">
                        {glued ? 'Glued floors bond straight down — no underlay.' : UNDERLAYS.find((u) => u.id === input.underlay)?.note}
                    </span>
                </div>
                <NumberField
                    label="Doorways"
                    value={input.doorways}
                    onChange={(v) => set('doorways', Math.round(v))}
                    min={0}
                    max={5}
                    step={1}
                    hint="Each needs a threshold bar"
                />
                <ToggleRow
                    label="Concrete subfloor"
                    hint="Prompts the vapour-barrier underlay"
                    checked={input.concreteSubfloor}
                    onChange={(v) => set('concreteSubfloor', v)}
                />
            </JobCard>

            <div className="space-y-6">
                <BlueprintPanel title="Plank layout">
                    <FlooringPreview input={input} />
                </BlueprintPanel>
                <MaterialsTicket bom={bom} />
            </div>
        </div>
    );
}
