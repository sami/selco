/**
 * @file src/components/v2/BoardCoverageCalculator.tsx
 *
 * Board & sheet coverage island — sheet grid over the area with cut sheets
 * highlighted, orientation toggle, plus the materials ticket.
 */

import { useMemo, useState } from 'react';
import { BOARD_FORMATS, calculateBoards, planBoards, type BoardsInput } from '../../calculators/v2/boards';
import { BlueprintPanel, JobCard, NumberField, Segmented, ToggleRow } from './ui';
import MaterialsTicket from './MaterialsTicket';

const YELLOW = '#ffd407';

function BoardsPreview({ input }: { input: BoardsInput }) {
    const plan = useMemo(() => planBoards(input), [input]);
    const W = 760;
    const H = 430;
    const PAD = 56;

    const scale = Math.min((W - PAD * 2) / input.widthM, (H - PAD * 2) / input.heightM);
    const aw = input.widthM * scale;
    const ah = input.heightM * scale;
    const x0 = (W - aw) / 2;
    const y0 = (H - ah) / 2;

    const sw = plan.sheetW * scale;
    const sh = plan.sheetH * scale;

    const cells: Array<{ x: number; y: number; w: number; h: number; cut: boolean }> = [];
    for (let r = 0; r < plan.rows; r++) {
        for (let c = 0; c < plan.cols; c++) {
            const x = x0 + c * sw;
            const y = y0 + r * sh;
            const w = Math.min(sw, x0 + aw - x);
            const h = Math.min(sh, y0 + ah - y);
            if (w <= 1 || h <= 1) continue;
            cells.push({ x, y, w, h, cut: w < sw * 0.97 || h < sh * 0.97 });
        }
    }

    return (
        <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-auto"
            role="img"
            aria-label={`Sheet layout: ${plan.cols} by ${plan.rows} grid`}
        >
            {cells.map((cell, i) => (
                <g key={i}>
                    <rect
                        x={cell.x + 1.5}
                        y={cell.y + 1.5}
                        width={Math.max(2, cell.w - 3)}
                        height={Math.max(2, cell.h - 3)}
                        fill={cell.cut ? 'rgba(255,212,7,0.28)' : 'rgba(255,255,255,0.15)'}
                        stroke={cell.cut ? YELLOW : '#fff'}
                        strokeWidth={cell.cut ? 1.3 : 1}
                    />
                    {/* diagonal tick marks sheets, like chalk on site */}
                    {!cell.cut && cell.w > 30 && cell.h > 30 && (
                        <line
                            x1={cell.x + cell.w * 0.3}
                            y1={cell.y + cell.h * 0.6}
                            x2={cell.x + cell.w * 0.7}
                            y2={cell.y + cell.h * 0.4}
                            stroke="rgba(255,255,255,0.35)"
                            strokeWidth="1"
                        />
                    )}
                </g>
            ))}

            <rect x={x0} y={y0} width={aw} height={ah} fill="none" stroke="#fff" strokeWidth="2.5" />

            <g fill={YELLOW} fontSize="13" fontWeight="700">
                <line x1={x0} y1={y0 - 18} x2={x0 + aw} y2={y0 - 18} stroke={YELLOW} strokeWidth="1" />
                <text x={x0 + aw / 2} y={y0 - 26} textAnchor="middle">
                    {input.widthM.toFixed(1)} m
                </text>
                <line x1={x0 - 18} y1={y0} x2={x0 - 18} y2={y0 + ah} stroke={YELLOW} strokeWidth="1" />
                <text x={x0 - 26} y={y0 + ah / 2} textAnchor="middle" transform={`rotate(-90 ${x0 - 26} ${y0 + ah / 2})`}>
                    {input.heightM.toFixed(1)} m
                </text>
            </g>

            <text x={W / 2} y={H - 12} fill="#fff" fontSize="11" textAnchor="middle" opacity="0.85">
                {plan.board.label} {plan.board.wMm} × {plan.board.hMm} mm, laid {input.landscape ? 'landscape' : 'portrait'} — stagger joints between rows
            </text>
        </svg>
    );
}

export default function BoardCoverageCalculator() {
    const [input, setInput] = useState<BoardsInput>({
        widthM: 4.8,
        heightM: 2.4,
        boardId: 'plasterboard',
        landscape: false,
    });

    const bom = useMemo(() => calculateBoards(input), [input]);
    const set = <K extends keyof BoardsInput>(k: K, v: BoardsInput[K]) =>
        setInput((s) => ({ ...s, [k]: v }));

    return (
        <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)] items-start">
            <JobCard title="Job details">
                <div className="grid grid-cols-2 gap-3">
                    <NumberField label="Area width" value={input.widthM} onChange={(v) => set('widthM', v)} unit="m" min={0.3} max={20} />
                    <NumberField label="Area height" value={input.heightM} onChange={(v) => set('heightM', v)} unit="m" min={0.3} max={20} />
                </div>
                <Segmented
                    label="Board type"
                    value={input.boardId as 'plasterboard' | 'plywood' | 'osb' | 'backer'}
                    onChange={(v) => set('boardId', v)}
                    options={BOARD_FORMATS.map((b) => ({
                        value: b.id as 'plasterboard' | 'plywood' | 'osb' | 'backer',
                        label: b.label,
                    }))}
                />
                <ToggleRow
                    label="Lay landscape"
                    hint="Long edge horizontal — fewer joints on low walls"
                    checked={input.landscape}
                    onChange={(v) => set('landscape', v)}
                />
            </JobCard>

            <div className="space-y-6">
                <BlueprintPanel title="Sheet layout">
                    <BoardsPreview input={input} />
                </BlueprintPanel>
                <MaterialsTicket bom={bom} />
            </div>
        </div>
    );
}
