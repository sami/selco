import { getCalculatorById } from '../../calculators/registry';

interface CalculatorPageHeaderProps {
    /** Registry id of the calculator whose banner to render (e.g. `'tiling'`). */
    calculatorId: string;
}

/**
 * Shared navy page banner shown at the top of every calculator page.
 *
 * Reads the title, one-line blurb, and inline SVG icon from
 * `CALCULATOR_REGISTRY` — it never hardcodes per-page text — and renders the
 * title as the page's single `<h1>` with a decorative (`aria-hidden`)
 * SELCO-yellow icon and a yellow accent on a navy background. Adding a new
 * registry entry with title, blurb, and icon yields a correct banner with no
 * page-level code. Built to the "SELCO Calculator — UI Conventions" note.
 *
 * Rendered statically in Astro pages (no client directive → no hydration).
 */
export function CalculatorPageHeader({ calculatorId }: CalculatorPageHeaderProps) {
    const meta = getCalculatorById(calculatorId);
    if (!meta) return null;

    return (
        <header className="rounded-card border-l-4 border-selco-yellow bg-selco-navy px-6 py-6 md:px-8 md:py-7">
            <div className="flex items-center gap-4">
                <span
                    aria-hidden="true"
                    className="h-10 w-10 shrink-0 text-selco-yellow [&>svg]:h-full [&>svg]:w-full"
                    dangerouslySetInnerHTML={{ __html: meta.icon ?? '' }}
                />
                <div className="min-w-0">
                    <h1 className="text-2xl font-bold text-white md:text-3xl">{meta.name}</h1>
                    <p className="mt-1 text-sm text-white/80 md:text-base">{meta.description}</p>
                </div>
            </div>
        </header>
    );
}
