import { memo } from 'react';
import type { CuttingPlan } from '../../calculators/board-cutting';

export const CuttingPlanDrawing = memo(function CuttingPlanDrawing({ plan }: { plan: CuttingPlan }) {
  const { sheet, layouts } = plan;
  const boardName = sheet.crossCutOnly ? 'Worktop' : 'Sheet';
  const maxLabel = Math.min(sheet.wMm, sheet.hMm) / 5;

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 print:grid-cols-3">
      {layouts.map((layout, i) => (
        <figure key={i} className="m-0 break-inside-avoid">
          <svg
            viewBox={`0 0 ${sheet.wMm} ${sheet.hMm}`}
            className="block h-72 w-auto mx-auto print:h-[85mm]"
            role="img"
            aria-label={`${boardName} ${i + 1}: pieces ${[...new Set(layout.pieces.map((p) => p.ref))].join(', ')}`}
          >
            <rect x={0} y={0} width={sheet.wMm} height={sheet.hMm} fill="none" stroke="currentColor" strokeWidth={sheet.wMm / 120} />
            {layout.pieces.map((p, j) => (
              <g key={j}>
                <rect
                  x={p.xMm}
                  y={p.yMm}
                  width={p.wMm}
                  height={p.hMm}
                  fill="currentColor"
                  fillOpacity={0.12}
                  stroke="currentColor"
                  strokeWidth={sheet.wMm / 240}
                />
                <text
                  x={p.xMm + p.wMm / 2}
                  y={p.yMm + p.hMm / 2}
                  fill="currentColor"
                  fontSize={Math.min(maxLabel, p.wMm * 0.6, p.hMm * 0.6)}
                  fontWeight={700}
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  {p.ref}
                </text>
              </g>
            ))}
          </svg>
          <figcaption className="mt-2 text-center text-xs font-bold">
            {`${boardName} ${i + 1} of ${layouts.length}, ${Math.round(layout.utilisation * 100)}% of board used`}
          </figcaption>
        </figure>
      ))}
    </div>
  );
});
