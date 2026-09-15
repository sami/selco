import { memo } from 'react';
import type { CuttingPlan, Offcut, PlacedPiece, SheetFormat } from '../../calculators/board-cutting';
import { describeOffcut, describeStep } from './saw-steps';

/** Rough width of one character as a share of the font size, for fitting labels inside a shape. */
const CHAR_W = 0.6;

interface LabelLine {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  rotate?: boolean;
}

/** Board units per label unit: labels are sized in mm on the board, so they scale with the drawing. */
function labelLimits(sheet: SheetFormat) {
  return {
    max: Math.min(sheet.wMm, sheet.hMm) / 5,
    // Below this a label can't be read at the drawn size, so it's left off.
    min: sheet.hMm / 40,
  };
}

/** Letter in bold, plus the cut size underneath when the piece is big enough to read it. */
function pieceLabels(p: PlacedPiece, sheet: SheetFormat): { letter: LabelLine; size: LabelLine | null } {
  const { max, min } = labelLimits(sheet);
  const cx = p.xMm + p.wMm / 2;
  const cy = p.yMm + p.hMm / 2;
  const letterSize = Math.min(max, p.wMm * 0.6, p.hMm * 0.6);
  const sizeText = `${p.wMm} × ${p.hMm}`;
  const sizeFont = Math.min(max * 0.45, (p.wMm * 0.9) / (sizeText.length * CHAR_W), p.hMm * 0.25);
  const letterWithSize = Math.min(letterSize, p.hMm * 0.9 - sizeFont * 1.2);

  if (sizeFont < min || letterWithSize < min) {
    return { letter: { text: p.ref, x: cx, y: cy, fontSize: letterSize }, size: null };
  }
  const total = letterWithSize + sizeFont * 1.2;
  const top = cy - total / 2;
  return {
    letter: { text: p.ref, x: cx, y: top + letterWithSize / 2, fontSize: letterWithSize },
    size: { text: sizeText, x: cx, y: top + letterWithSize + sizeFont * 0.2 + sizeFont / 2, fontSize: sizeFont },
  };
}

/** "Offcut W × H" on one line, turned to run along a tall offcut if that reads bigger, or left off. */
function offcutLabel(o: Offcut, sheet: SheetFormat): LabelLine | null {
  const { max, min } = labelLimits(sheet);
  const text = `Offcut ${describeOffcut(o)}`;
  const fit = (along: number, across: number) => Math.min(max * 0.4, (along * 0.9) / (text.length * CHAR_W), across * 0.6);
  const flat = fit(o.wMm, o.hMm);
  const turned = fit(o.hMm, o.wMm);
  const fontSize = Math.max(flat, turned);
  if (fontSize < min) return null;
  return { text, x: o.xMm + o.wMm / 2, y: o.yMm + o.hMm / 2, fontSize, rotate: turned > flat };
}

function SvgLabel({ line, bold = false }: { line: LabelLine; bold?: boolean }) {
  return (
    <text
      x={line.x}
      y={line.y}
      fill="currentColor"
      fontSize={line.fontSize}
      fontWeight={bold ? 700 : 400}
      textAnchor="middle"
      dominantBaseline="central"
      transform={line.rotate ? `rotate(-90 ${line.x} ${line.y})` : undefined}
    >
      {line.text}
    </text>
  );
}

/** The saw operator's plan: per board, a labelled drawing beside the numbered cuts with tick boxes and the offcuts. */
export const SawPlan = memo(function SawPlan({ plan }: { plan: CuttingPlan }) {
  const { sheet, layouts } = plan;
  const boardName = sheet.crossCutOnly ? 'Worktop' : 'Sheet';
  const line = sheet.wMm / 240;

  return (
    <div className="flex flex-col gap-8 print:gap-6">
      {layouts.map((layout, i) => {
        const letters = [...new Set(layout.pieces.map((p) => p.ref))].join(', ');
        const offcutCount = `${layout.offcuts.length} ${layout.offcuts.length === 1 ? 'offcut' : 'offcuts'}`;
        return (
          <figure key={i} className="break-inside-avoid grid gap-x-6 gap-y-3 items-start sm:grid-cols-[auto_1fr] print:grid-cols-[auto_1fr]">
            <figcaption className="text-sm font-bold sm:col-span-2 print:col-span-2">
              {`${boardName} ${i + 1} of ${layouts.length}, ${Math.round(layout.utilisation * 100)}% of board used`}
            </figcaption>

            <svg
              viewBox={`0 0 ${sheet.wMm} ${sheet.hMm}`}
              className="block h-80 w-auto justify-self-center sm:justify-self-start print:h-[95mm]"
              role="img"
              aria-label={`${boardName} ${i + 1}: pieces ${letters}, ${offcutCount}`}
            >
              {layout.offcuts.map((o, j) => {
                const label = offcutLabel(o, sheet);
                return (
                  <g key={`o${j}`}>
                    <rect
                      x={o.xMm}
                      y={o.yMm}
                      width={o.wMm}
                      height={o.hMm}
                      fill="currentColor"
                      fillOpacity={0.03}
                      stroke="currentColor"
                      strokeOpacity={0.6}
                      strokeWidth={line}
                      strokeDasharray={`${line * 5} ${line * 4}`}
                    />
                    {label && <SvgLabel line={label} />}
                  </g>
                );
              })}
              {layout.pieces.map((p, j) => {
                const { letter, size } = pieceLabels(p, sheet);
                return (
                  <g key={`p${j}`}>
                    <rect x={p.xMm} y={p.yMm} width={p.wMm} height={p.hMm} fill="currentColor" fillOpacity={0.14} stroke="currentColor" strokeWidth={line} />
                    <SvgLabel line={letter} bold />
                    {size && <SvgLabel line={size} />}
                  </g>
                );
              })}
              <rect x={0} y={0} width={sheet.wMm} height={sheet.hMm} fill="none" stroke="currentColor" strokeWidth={line * 2} />
            </svg>

            <div className="flex flex-col gap-3 min-w-0 text-sm">
              {layout.cuts.length > 0 ? (
                <ol className="list-decimal pl-6 flex flex-col gap-1.5 leading-snug">
                  {layout.cuts.map((step) => (
                    <li key={step.step} className="break-inside-avoid pl-1">
                      <span
                        aria-hidden="true"
                        className="inline-block size-[0.9rem] mr-2 align-[-0.15rem] border border-current print:border-black"
                      />
                      {describeStep(step, plan)}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="m-0">No cuts needed for this board.</p>
              )}
              <p className="m-0">
                {layout.offcuts.length > 0
                  ? `Offcuts, at least: ${layout.offcuts.map(describeOffcut).join(', ')}`
                  : 'No usable offcuts.'}
              </p>
            </div>
          </figure>
        );
      })}
    </div>
  );
});
