/**
 * @file src/components/v2/KitchenPlanner.tsx
 *
 * Kitchen layout editor. The rules engine deals a starting layout, then
 * the customer takes over: click any unit on the plan to select it,
 * nudge it along the run, send it to another wall, remove it, or add
 * units from the palette. Wall units draw as a dashed band over the base
 * run, talls draw bold, and the work triangle keeps score the whole time.
 */

import { useMemo, useState } from 'react';
import {
    calculateKitchen,
    defaultLayout,
    PALETTE,
    planKitchen,
    SINK_COMBOS,
    wallsFor,
    type CornerUnitType,
    type FridgeType,
    type KitchenInput,
    type KitchenShape,
    type LayoutItem,
    type PlacedUnit,
    type SinkUnder,
    type UnitKind,
    type WallId,
} from '../../calculators/v2/kitchen';
import { BlueprintPanel, JobCard, NumberField, Segmented, ToggleRow } from './ui';
import MaterialsTicket from './MaterialsTicket';

const YELLOW = '#ffd407';
const DEPTH = 600;
const WALL_UNIT_DEPTH = 350;

function unitRect(u: PlacedUnit, wallAMm: number, wallBMm: number) {
    if (u.wall === 'A') return { x: u.offsetMm, y: 0, w: u.widthMm, h: DEPTH, vertical: false };
    if (u.wall === 'B') return { x: wallAMm - DEPTH, y: u.offsetMm, w: DEPTH, h: u.widthMm, vertical: true };
    return { x: wallAMm - u.offsetMm - u.widthMm, y: wallBMm - DEPTH, w: u.widthMm, h: DEPTH, vertical: false };
}

const KIND_STYLE: Record<UnitKind, { fill: string; stroke: string; dash?: string }> = {
    base: { fill: 'rgba(255,255,255,0.14)', stroke: '#fff' },
    corner: { fill: 'rgba(255,212,7,0.22)', stroke: YELLOW },
    sink: { fill: 'rgba(255,212,7,0.85)', stroke: YELLOW },
    cooker: { fill: 'rgba(255,255,255,0.32)', stroke: '#fff' },
    dishwasher: { fill: 'rgba(255,255,255,0.32)', stroke: '#fff' },
    'washing-machine': { fill: 'rgba(255,255,255,0.32)', stroke: '#fff' },
    fridge: { fill: 'rgba(255,255,255,0.45)', stroke: '#fff' },
    larder: { fill: 'rgba(255,255,255,0.45)', stroke: '#fff' },
    drawers: { fill: 'rgba(255,212,7,0.28)', stroke: '#fff' },
    wine: { fill: 'rgba(255,255,255,0.22)', stroke: '#fff' },
    pullout: { fill: 'rgba(255,255,255,0.22)', stroke: '#fff' },
    filler: { fill: 'none', stroke: 'rgba(255,255,255,0.6)', dash: '4 4' },
};

function KitchenPreview({
    input,
    selectedId,
    onSelect,
}: {
    input: KitchenInput;
    selectedId: string | null;
    onSelect: (id: string | null) => void;
}) {
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

    const tri = ['sink', 'cooker', 'fridge']
        .map((k) => plan.placed.find((p) => p.kind === (k as UnitKind)))
        .filter((u): u is PlacedUnit => !!u)
        .map((u) => {
            const r = unitRect(u, wallAMm, wallBMm);
            return { kind: u.kind, x: x0 + (r.x + r.w / 2) * scale, y: y0 + (r.y + r.h / 2) * scale };
        });
    const showTriangle = tri.length === 3 && plan.triangle;

    // Wall-unit band rectangles per wall (dashed, 350 deep).
    const bands = input.includeWallUnits
        ? plan.walls.map((w, i) => {
              const len = w.lengthMm - (i < plan.walls.length - 1 ? DEPTH : 0);
              if (w.id === 'A') return { x: x0, y: y0, w: len * scale, h: WALL_UNIT_DEPTH * scale };
              if (w.id === 'B')
                  return { x: x0 + (wallAMm - WALL_UNIT_DEPTH) * scale, y: y0, w: WALL_UNIT_DEPTH * scale, h: len * scale };
              return {
                  x: x0 + (wallAMm - len) * scale,
                  y: y0 + (wallBMm - WALL_UNIT_DEPTH) * scale,
                  w: len * scale,
                  h: WALL_UNIT_DEPTH * scale,
              };
          })
        : [];

    return (
        <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-auto"
            role="img"
            aria-label={`Editable kitchen plan, ${plan.baseUnitCount} base units, tap a unit to select it`}
            onClick={() => onSelect(null)}
        >
            {/* wall-unit band */}
            {bands.map((b, i) => (
                <rect key={`band-${i}`} x={b.x} y={b.y} width={b.w} height={b.h} fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.5)" strokeWidth="1" strokeDasharray="6 4" />
            ))}

            {/* placed units */}
            {plan.placed.map((u, i) => {
                const r = unitRect(u, wallAMm, wallBMm);
                const style = KIND_STYLE[u.kind];
                const cx = x0 + (r.x + r.w / 2) * scale;
                const cy = y0 + (r.y + r.h / 2) * scale;
                const isSink = u.kind === 'sink';
                const selected = u.itemId !== null && u.itemId === selectedId;
                return (
                    <g
                        key={i}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (u.itemId) onSelect(u.itemId);
                        }}
                        style={{ cursor: u.itemId ? 'pointer' : 'default' }}
                    >
                        <rect
                            x={x0 + r.x * scale}
                            y={y0 + r.y * scale}
                            width={r.w * scale}
                            height={r.h * scale}
                            fill={style.fill}
                            stroke={selected ? YELLOW : style.stroke}
                            strokeWidth={selected ? 3.5 : u.tall ? 2.2 : 1.4}
                            strokeDasharray={style.dash}
                            rx="2"
                        />
                        {isSink && (
                            <>
                                <circle cx={cx - 10} cy={cy} r="6" fill="none" stroke="#04204b" strokeWidth="1.5" />
                                <circle cx={cx + 10} cy={cy} r="6" fill="none" stroke="#04204b" strokeWidth="1.5" />
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
                                transform={r.vertical ? `rotate(-90 ${cx} ${cy})` : undefined}
                            >
                                {u.label}
                            </text>
                        )}
                        {u.kind === 'filler' && u.widthMm >= 150 && (
                            <text x={cx} y={cy} fill="rgba(255,255,255,0.7)" fontSize="9" textAnchor="middle" dominantBaseline="middle" transform={r.vertical ? `rotate(-90 ${cx} ${cy})` : undefined}>
                                {u.label}
                            </text>
                        )}
                    </g>
                );
            })}

            {/* work triangle */}
            {showTriangle && (
                <g pointerEvents="none">
                    {tri.map((p, i) => {
                        const q = tri[(i + 1) % 3];
                        const leg = plan.triangle!.legs[i];
                        return (
                            <g key={i}>
                                <line x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={YELLOW} strokeWidth="2" strokeDasharray="7 5" opacity="0.9" />
                                <text x={(p.x + q.x) / 2} y={(p.y + q.y) / 2 - 6} fill={YELLOW} fontSize="11" fontWeight="700" textAnchor="middle" style={{ paintOrder: 'stroke', stroke: '#04204b', strokeWidth: 4 }}>
                                    {leg.lengthM.toFixed(1)} m
                                </text>
                            </g>
                        );
                    })}
                    {tri.map((p) => (
                        <circle key={p.kind} cx={p.x} cy={p.y} r="5" fill={YELLOW} stroke="#04204b" strokeWidth="1.5" />
                    ))}
                    <text x={W - 16} y={22} textAnchor="end" fill={plan.triangle!.ok ? '#7ee2a0' : YELLOW} fontSize="12" fontWeight="700">
                        {plan.triangle!.ok ? '✓' : '⚠'} work triangle {plan.triangle!.totalM.toFixed(1)} m
                    </text>
                </g>
            )}

            {/* wall lines */}
            <g stroke="#fff" strokeWidth="3" strokeLinecap="square" pointerEvents="none">
                <line x1={x0} y1={y0} x2={x0 + wallAMm * scale} y2={y0} />
                {input.shape !== 'galley' && <line x1={x0 + wallAMm * scale} y1={y0} x2={x0 + wallAMm * scale} y2={y0 + wallBMm * scale} />}
                {input.shape === 'u-shape' && (
                    <line x1={x0 + wallAMm * scale} y1={y0 + wallBMm * scale} x2={x0 + (wallAMm - input.wallCM * 1000) * scale} y2={y0 + wallBMm * scale} />
                )}
            </g>

            <g fill={YELLOW} fontSize="13" fontWeight="700" pointerEvents="none">
                <text x={x0 + (wallAMm * scale) / 2} y={y0 - 12} textAnchor="middle">
                    Wall A, {(wallAMm / 1000).toFixed(1)} m
                </text>
                {input.shape !== 'galley' && (
                    <text x={x0 + wallAMm * scale + 14} y={y0 + (wallBMm * scale) / 2} textAnchor="middle" transform={`rotate(90 ${x0 + wallAMm * scale + 14} ${y0 + (wallBMm * scale) / 2})`}>
                        Wall B, {(wallBMm / 1000).toFixed(1)} m
                    </text>
                )}
                {input.shape === 'u-shape' && (
                    <text x={x0 + (wallAMm - (input.wallCM * 1000) / 2) * scale} y={y0 + wallBMm * scale + 20} textAnchor="middle">
                        Wall C, {input.wallCM.toFixed(1)} m
                    </text>
                )}
            </g>

            <text x={16} y={H - 12} fill="#fff" fontSize="10" opacity="0.75" pointerEvents="none">
                Tap a unit to select it, then use the toolbar to move it. Dashed band = wall units over the worktop.
            </text>
        </svg>
    );
}

let addCounter = 1000;

export default function KitchenPlanner() {
    const [setup, setSetup] = useState({
        shape: 'l-shape' as KitchenShape,
        doorStyle: 'handleless' as const,
        wallAM: 3.6,
        wallBM: 3.0,
        wallCM: 2.4,
        cornerType: 'l935' as CornerUnitType,
        sinkUnder: 'dw500' as SinkUnder,
        fridgeType: 'freestanding' as FridgeType,
        ovenHousing: true,
        includeWallUnits: true,
        includeCornice: true,
    });
    const [layout, setLayout] = useState<Record<WallId, LayoutItem[]>>(() =>
        defaultLayout({ ...setupDefaults(), shape: 'l-shape' } as KitchenInput),
    );
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [paletteIdx, setPaletteIdx] = useState(3); // Base 600
    const [addWall, setAddWall] = useState<WallId>('A');

    function setupDefaults(): KitchenInput {
        return { ...setup, layout: { A: [], B: [], C: [] } };
    }

    const input: KitchenInput = useMemo(() => ({ ...setup, layout }), [setup, layout]);
    const bom = useMemo(() => calculateKitchen(input), [input]);
    const walls = useMemo(() => wallsFor(input), [input]);

    const setS = <K extends keyof typeof setup>(k: K, v: (typeof setup)[K]) => {
        setSetup((s) => {
            const next = { ...s, [k]: v };
            if (k === 'shape') {
                setLayout(defaultLayout({ ...next, layout: { A: [], B: [], C: [] } } as KitchenInput));
                setSelectedId(null);
            }
            return next;
        });
    };

    const findSelected = (): { wall: WallId; index: number; item: LayoutItem } | null => {
        if (!selectedId) return null;
        for (const w of ['A', 'B', 'C'] as WallId[]) {
            const idx = layout[w].findIndex((x) => x.id === selectedId);
            if (idx >= 0) return { wall: w, index: idx, item: layout[w][idx] };
        }
        return null;
    };
    const sel = findSelected();

    const nudge = (dir: -1 | 1) => {
        if (!sel) return;
        const arr = [...layout[sel.wall]];
        const j = sel.index + dir;
        if (j < 0 || j >= arr.length) return;
        [arr[sel.index], arr[j]] = [arr[j], arr[sel.index]];
        setLayout({ ...layout, [sel.wall]: arr });
    };
    const sendToWall = (target: WallId) => {
        if (!sel || target === sel.wall) return;
        const from = layout[sel.wall].filter((x) => x.id !== sel.item.id);
        setLayout({ ...layout, [sel.wall]: from, [target]: [...layout[target], sel.item] });
    };
    const removeSelected = () => {
        if (!sel) return;
        setLayout({ ...layout, [sel.wall]: layout[sel.wall].filter((x) => x.id !== sel.item.id) });
        setSelectedId(null);
    };
    const addUnit = () => {
        const p = PALETTE[paletteIdx];
        const it: LayoutItem = { id: `a${addCounter++}`, kind: p.kind, widthMm: p.widthMm };
        setLayout({ ...layout, [addWall]: [...layout[addWall], it] });
        setSelectedId(it.id);
    };
    const reset = () => {
        setLayout(defaultLayout(input));
        setSelectedId(null);
    };

    return (
        <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)] items-start">
            <JobCard title="Room & choices">
                <Segmented<KitchenShape>
                    label="Layout"
                    value={setup.shape}
                    onChange={(v) => setS('shape', v)}
                    options={[
                        { value: 'galley', label: 'Galley' },
                        { value: 'l-shape', label: 'L-shape' },
                        { value: 'u-shape', label: 'U-shape' },
                    ]}
                />
                <NumberField label="Wall A length" value={setup.wallAM} onChange={(v) => setS('wallAM', v)} unit="m" min={1.2} max={8} />
                {setup.shape !== 'galley' && <NumberField label="Wall B length" value={setup.wallBM} onChange={(v) => setS('wallBM', v)} unit="m" min={1.2} max={8} />}
                {setup.shape === 'u-shape' && <NumberField label="Wall C length" value={setup.wallCM} onChange={(v) => setS('wallCM', v)} unit="m" min={1.2} max={8} />}
                <Segmented
                    label="Door style"
                    value={setup.doorStyle}
                    onChange={(v) => setS('doorStyle', v as typeof setup.doorStyle)}
                    options={[
                        { value: 'handled', label: 'With handles' },
                        { value: 'handleless', label: 'Handleless' },
                    ]}
                />
                {setup.shape !== 'galley' && (
                    <Segmented<CornerUnitType>
                        label="Corner unit"
                        value={setup.cornerType}
                        onChange={(v) => setS('cornerType', v)}
                        options={[
                            { value: 'l935', label: '935 L-shape' },
                            { value: 'c1000', label: '1000 corner' },
                        ]}
                    />
                )}
                <div>
                    <label htmlFor="sink-under" className="form-label text-sm">
                        Under the sink
                    </label>
                    <select
                        id="sink-under"
                        className="form-select"
                        value={setup.sinkUnder}
                        onChange={(e) => setS('sinkUnder', e.target.value as SinkUnder)}
                    >
                        {SINK_COMBOS.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.label} — zone {c.widthMm} mm
                            </option>
                        ))}
                    </select>
                    <span className="field-description">
                        The bowl needs at least 500 mm of base under it. The sink zone grows with your choice.
                    </span>
                </div>
                <Segmented<FridgeType>
                    label="Fridge freezer"
                    value={setup.fridgeType}
                    onChange={(v) => setS('fridgeType', v)}
                    options={[
                        { value: 'freestanding', label: 'Freestanding' },
                        { value: 'integrated', label: 'Integrated' },
                    ]}
                />
                <ToggleRow label="Built-under oven housing" hint="Behind the cooker slot" checked={setup.ovenHousing} onChange={(v) => setS('ovenHousing', v)} />
                <ToggleRow label="Wall units" hint="Drawn as the dashed band on the plan" checked={setup.includeWallUnits} onChange={(v) => setS('includeWallUnits', v)} />
                {setup.includeWallUnits && (
                    <ToggleRow label="Cornice & pelmet" hint="One 2745 mm profile does both jobs" checked={setup.includeCornice} onChange={(v) => setS('includeCornice', v)} />
                )}
            </JobCard>

            <div className="space-y-6">
                <BlueprintPanel title="Arrange your kitchen">
                    <KitchenPreview input={input} selectedId={selectedId} onSelect={setSelectedId} />
                </BlueprintPanel>

                {/* layout toolbar */}
                <section className="panel bg-bg-section shadow-sm p-4 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[0.7rem] font-bold uppercase tracking-[0.15em] text-text-muted mr-1">
                            {sel ? `Selected: ${sel.item.kind === 'base' ? `Base ${sel.item.widthMm}` : sel.item.kind === 'drawers' ? `Drawers ${sel.item.widthMm}` : sel.item.kind}` : 'Tap a unit on the plan'}
                        </span>
                        <button type="button" disabled={!sel} onClick={() => nudge(-1)} className="btn-ghost !min-h-[36px] !px-3 text-sm disabled:opacity-40" aria-label="Move unit earlier in the run">
                            ◀ Slide
                        </button>
                        <button type="button" disabled={!sel} onClick={() => nudge(1)} className="btn-ghost !min-h-[36px] !px-3 text-sm disabled:opacity-40" aria-label="Move unit later in the run">
                            Slide ▶
                        </button>
                        {walls.length > 1 &&
                            walls.map((w) => (
                                <button
                                    key={w.id}
                                    type="button"
                                    disabled={!sel || sel.wall === w.id}
                                    onClick={() => sendToWall(w.id)}
                                    className="btn-ghost !min-h-[36px] !px-3 text-sm disabled:opacity-40"
                                >
                                    → Wall {w.id}
                                </button>
                            ))}
                        <button type="button" disabled={!sel} onClick={removeSelected} className="btn-ghost !min-h-[36px] !px-3 text-sm disabled:opacity-40 !border-destructive !text-destructive hover:!bg-destructive/10">
                            ✕ Remove
                        </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <select className="form-select !h-10 flex-1 min-w-[180px]" value={paletteIdx} onChange={(e) => setPaletteIdx(Number(e.target.value))} aria-label="Unit to add">
                            {PALETTE.map((p, i) => (
                                <option key={`${p.kind}-${p.widthMm}`} value={i}>
                                    {p.label}
                                </option>
                            ))}
                        </select>
                        {walls.length > 1 && (
                            <select className="form-select !h-10 !w-28" value={addWall} onChange={(e) => setAddWall(e.target.value as WallId)} aria-label="Wall to add the unit to">
                                {walls.map((w) => (
                                    <option key={w.id} value={w.id}>
                                        Wall {w.id}
                                    </option>
                                ))}
                            </select>
                        )}
                        <button type="button" onClick={addUnit} className="btn-accent !min-h-[40px] !px-4 text-sm">
                            + Add unit
                        </button>
                        <button type="button" onClick={reset} className="btn-ghost !min-h-[40px] !px-4 text-sm">
                            Re-deal layout
                        </button>
                    </div>
                </section>

                <MaterialsTicket bom={bom} />
            </div>
        </div>
    );
}
