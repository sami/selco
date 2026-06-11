/**
 * @file src/components/v2/KitchenPlanner.tsx
 *
 * Kitchen planner island — packs cabinets along the chosen layout and draws
 * a top-down plan view: wall A across the top, wall B down the right, wall C
 * along the bottom (matching the engine's corner-allocation order).
 */

import { useMemo, useState } from 'react';
import {
    calculateKitchen,
    planKitchen,
    type KitchenInput,
    type KitchenShape,
    type PlacedUnit,
} from '../../calculators/v2/kitchen';
import { BlueprintPanel, JobCard, NumberField, Segmented, ToggleRow } from './ui';
import MaterialsTicket from './MaterialsTicket';

const YELLOW = '#ffd407';
const DEPTH = 600;

/** Map a placed unit to a plan-view rectangle in millimetre space. */
function unitRect(
    u: PlacedUnit,
    wallAMm: number,
    wallBMm: number,
): { x: number; y: number; w: number; h: number; vertical: boolean } {
    if (u.wall === 'A') {
        return { x: u.offsetMm, y: 0, w: u.widthMm, h: DEPTH, vertical: false };
    }
    if (u.wall === 'B') {
        return {
            x: wallAMm - DEPTH,
            y: u.offsetMm,
            w: DEPTH,
            h: u.widthMm,
            vertical: true,
        };
    }
    // Wall C runs right→left along the bottom, starting from wall B's end.
    return {
        x: wallAMm - u.offsetMm - u.widthMm,
        y: wallBMm - DEPTH,
        w: u.widthMm,
        h: DEPTH,
        vertical: false,
    };
}

const KIND_STYLE: Record<
    PlacedUnit['kind'],
    { fill: string; stroke: string; dash?: string }
> = {
    base: { fill: 'rgba(255,255,255,0.14)', stroke: '#fff' },
    corner: { fill: 'rgba(255,212,7,0.22)', stroke: YELLOW },
    sink: { fill: 'rgba(255,212,7,0.85)', stroke: YELLOW },
    cooker: { fill: 'rgba(255,255,255,0.32)', stroke: '#fff' },
    dishwasher: { fill: 'rgba(255,255,255,0.32)', stroke: '#fff' },
    'washing-machine': { fill: 'rgba(255,255,255,0.32)', stroke: '#fff' },
    fridge: { fill: 'rgba(255,255,255,0.32)', stroke: '#fff' },
    filler: { fill: 'none', stroke: 'rgba(255,255,255,0.6)', dash: '4 4' },
};

function KitchenPreview({ input }: { input: KitchenInput }) {
    const plan = useMemo(() => planKitchen(input), [input]);
    const wallAMm = plan.walls[0].lengthMm;
    const wallBMm = plan.walls.find((w) => w.id === 'B')?.lengthMm ?? DEPTH;
    const heightMm = input.shape === 'galley' ? DEPTH : wallBMm;

    const W = 760;
    const H = 430;
    const PAD = 52;
    const scale = Math.min((W - PAD * 2) / wallAMm, (H - PAD * 2) / heightMm);
    const x0 = (W - wallAMm * scale) / 2;
    const y0 = (H - heightMm * scale) / 2;

    return (
        <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-auto"
            role="img"
            aria-label={`Kitchen plan with ${plan.baseUnitCount} base units`}
        >
            {/* placed units */}
            {plan.placed.map((u, i) => {
                const r = unitRect(u, wallAMm, wallBMm);
                const style = KIND_STYLE[u.kind];
                const cx = x0 + (r.x + r.w / 2) * scale;
                const cy = y0 + (r.y + r.h / 2) * scale;
                const isSink = u.kind === 'sink';
                return (
                    <g key={i}>
                        <rect
                            x={x0 + r.x * scale}
                            y={y0 + r.y * scale}
                            width={r.w * scale}
                            height={r.h * scale}
                            fill={style.fill}
                            stroke={style.stroke}
                            strokeWidth="1.4"
                            strokeDasharray={style.dash}
                            rx="2"
                        />
                        {isSink && (
                            <>
                                <circle cx={cx - 9} cy={cy} r="6" fill="none" stroke="#04204b" strokeWidth="1.5" />
                                <circle cx={cx + 9} cy={cy} r="6" fill="none" stroke="#04204b" strokeWidth="1.5" />
                            </>
                        )}
                        {u.kind !== 'filler' && !isSink && (
                            <text
                                x={cx}
                                y={cy}
                                fill={u.kind === 'corner' ? YELLOW : '#fff'}
                                fontSize="10"
                                fontWeight="600"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                transform={
                                    r.vertical ? `rotate(-90 ${cx} ${cy})` : undefined
                                }
                            >
                                {u.label}
                            </text>
                        )}
                    </g>
                );
            })}

            {/* wall lines */}
            <g stroke="#fff" strokeWidth="3" strokeLinecap="square">
                <line x1={x0} y1={y0} x2={x0 + wallAMm * scale} y2={y0} />
                {input.shape !== 'galley' && (
                    <line
                        x1={x0 + wallAMm * scale}
                        y1={y0}
                        x2={x0 + wallAMm * scale}
                        y2={y0 + wallBMm * scale}
                    />
                )}
                {input.shape === 'u-shape' && (
                    <line
                        x1={x0 + wallAMm * scale}
                        y1={y0 + wallBMm * scale}
                        x2={x0 + (wallAMm - input.wallCM * 1000) * scale}
                        y2={y0 + wallBMm * scale}
                    />
                )}
            </g>

            {/* wall dimension labels */}
            <g fill={YELLOW} fontSize="13" fontWeight="700">
                <text x={x0 + (wallAMm * scale) / 2} y={y0 - 12} textAnchor="middle">
                    Wall A — {(wallAMm / 1000).toFixed(1)} m
                </text>
                {input.shape !== 'galley' && (
                    <text
                        x={x0 + wallAMm * scale + 14}
                        y={y0 + (wallBMm * scale) / 2}
                        textAnchor="middle"
                        transform={`rotate(90 ${x0 + wallAMm * scale + 14} ${y0 + (wallBMm * scale) / 2})`}
                    >
                        Wall B — {(wallBMm / 1000).toFixed(1)} m
                    </text>
                )}
                {input.shape === 'u-shape' && (
                    <text
                        x={x0 + (wallAMm - (input.wallCM * 1000) / 2) * scale}
                        y={y0 + wallBMm * scale + 20}
                        textAnchor="middle"
                    >
                        Wall C — {input.wallCM.toFixed(1)} m
                    </text>
                )}
            </g>
        </svg>
    );
}

export default function KitchenPlanner() {
    const [input, setInput] = useState<KitchenInput>({
        shape: 'l-shape',
        doorStyle: 'handled',
        includeCornice: true,
        wallAM: 3.6,
        wallBM: 2.7,
        wallCM: 2.4,
        appliances: {
            cooker: true,
            dishwasher: true,
            washingMachine: false,
            fridgeFreezer: true,
        },
        includeWallUnits: true,
    });

    const bom = useMemo(() => calculateKitchen(input), [input]);
    const set = <K extends keyof KitchenInput>(k: K, v: KitchenInput[K]) =>
        setInput((s) => ({ ...s, [k]: v }));
    const setAppliance = (k: keyof KitchenInput['appliances'], v: boolean) =>
        setInput((s) => ({ ...s, appliances: { ...s.appliances, [k]: v } }));

    return (
        <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)] items-start">
            <JobCard title="Job details">
                <Segmented<KitchenShape>
                    label="Layout"
                    value={input.shape}
                    onChange={(v) => set('shape', v)}
                    options={[
                        { value: 'galley', label: 'Galley' },
                        { value: 'l-shape', label: 'L-shape' },
                        { value: 'u-shape', label: 'U-shape' },
                    ]}
                />
                <NumberField
                    label="Wall A length"
                    value={input.wallAM}
                    onChange={(v) => set('wallAM', v)}
                    unit="m"
                    min={1.2}
                    max={8}
                />
                {input.shape !== 'galley' && (
                    <NumberField
                        label="Wall B length"
                        value={input.wallBM}
                        onChange={(v) => set('wallBM', v)}
                        unit="m"
                        min={1.2}
                        max={8}
                    />
                )}
                {input.shape === 'u-shape' && (
                    <NumberField
                        label="Wall C length"
                        value={input.wallCM}
                        onChange={(v) => set('wallCM', v)}
                        unit="m"
                        min={1.2}
                        max={8}
                    />
                )}
                <div className="space-y-2">
                    <span className="form-label text-sm">Appliance slots</span>
                    <ToggleRow
                        label="Cooker"
                        hint="600 mm gap"
                        checked={input.appliances.cooker}
                        onChange={(v) => setAppliance('cooker', v)}
                    />
                    <ToggleRow
                        label="Dishwasher"
                        hint="600 mm integrated"
                        checked={input.appliances.dishwasher}
                        onChange={(v) => setAppliance('dishwasher', v)}
                    />
                    <ToggleRow
                        label="Washing machine"
                        hint="600 mm integrated"
                        checked={input.appliances.washingMachine}
                        onChange={(v) => setAppliance('washingMachine', v)}
                    />
                    <ToggleRow
                        label="Fridge freezer"
                        hint="600 mm tall unit"
                        checked={input.appliances.fridgeFreezer}
                        onChange={(v) => setAppliance('fridgeFreezer', v)}
                    />
                </div>
                <Segmented
                    label="Door style"
                    value={input.doorStyle}
                    onChange={(v) => set('doorStyle', v)}
                    options={[
                        { value: 'handled', label: 'With handles' },
                        { value: 'handleless', label: 'Handleless' },
                    ]}
                />
                <ToggleRow
                    label="Wall units"
                    hint="Uppers over ~70% of the run"
                    checked={input.includeWallUnits}
                    onChange={(v) => set('includeWallUnits', v)}
                />
                <ToggleRow
                    label="Cornice & pelmet"
                    hint="Trims over and under the wall units"
                    checked={input.includeCornice}
                    onChange={(v) => set('includeCornice', v)}
                />
            </JobCard>

            <div className="space-y-6">
                <BlueprintPanel title="Plan view">
                    <KitchenPreview input={input} />
                </BlueprintPanel>
                <MaterialsTicket bom={bom} />
            </div>
        </div>
    );
}
