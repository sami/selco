# Architecture

This document describes the structural conventions of the Trade Materials
Calculator codebase. It complements [`README.md`](README.md) (how to run
the app) and [`PROJECT_HISTORY.md`](PROJECT_HISTORY.md) (how the codebase
came to look the way it does).

## At a glance

The application is a single npm package — not a monorepo. It is built
with [Astro 5](https://astro.build) for static-site generation and
[React 19](https://react.dev) for interactive islands. The architectural
discipline lives in a deliberate three-layer split inside `src/`.

```
                ┌─────────────────────────────────┐
   Astro page   │  Layer 3 — Presentation         │
   request ──▶  │  src/components, src/pages,     │  ──▶ static HTML
                │  src/layouts                    │
                └────────────────┬────────────────┘
                                 │ derives steps from
                                 ▼
                ┌─────────────────────────────────┐
                │  Layer 2 — Project orchestration│
                │  src/projects                   │
                │  step descriptors, shared inputs│
                └────────────────┬────────────────┘
                                 │ delegates to
                                 ▼
                ┌─────────────────────────────────┐
                │  Layer 1 — Pure logic           │
                │  src/calculators                │
                │  calculate*() functions, types  │
                └─────────────────────────────────┘
```

Information flows downward (presentation calls orchestration calls
logic), and dependencies follow the same direction — Layer 1 modules
never import from Layer 2 or 3, Layer 2 modules never import from Layer 3.

## Layer 1 — Pure logic (`src/calculators/`)

Every quantifiable thing the app calculates lives here as a pure
TypeScript module. The contract for each module is small and consistent:

- One file per material or quantity (e.g. `tiles.ts`, `mortar.ts`,
  `wall-ties.ts`, `decking-fixings.ts`).
- Exports a `calculate*` function plus its `Input` and `Result` interfaces.
- Pure: no React imports, no DOM access, no I/O, no global state.
- Tested in isolation under `src/calculators/__tests__/` with Vitest.

A handful of files in the same folder support the calculators rather
than being calculators themselves: `types.ts` for shared shapes,
`constants.ts` for invariants, `primitives.ts` for low-level helpers
(`packsNeeded`, etc.), and `registry.ts` which re-exports the canonical
calculator catalogue from Layer 2 for convenience.

Cross-reference orchestrators — `masonry-project.ts` and
`decking-project.ts` — also live in Layer 1. They compose other Layer 1
modules but introduce no new arithmetic.

### TDD convention

New calculators land RED-then-GREEN: a `test(...): TC1–TCn (RED)` commit
introducing the failing tests, immediately followed by a
`feat(...): implement (TDD GREEN)` commit with the implementation. The
masonry rebuild on 2026-03-21 (visible in `git log`) is the canonical
example.

## Layer 2 — Project orchestration (`src/projects/`)

Multi-step project wizards are described declaratively here, not coded
imperatively in React. A Layer 2 module is a config: it lists the steps,
which Layer 1 calculator each step delegates to, the labels shown in the
progress bar, and which inputs are shared between steps.

| File | Calculator |
|------|------------|
| `tiling.json` | Tiling project |
| `masonry.ts` | Brick & block wall |
| `flooring.ts` | Hard flooring |
| `decking.ts` | Decking |
| `conversions.json` | Unit converter category data |
| `registry.ts` | Canonical catalogue (homepage, sidebar, breadcrumbs) |

Layer 2 contains no arithmetic. The motivation is that adding a project
calculator should not require a new wizard component — it requires a new
Layer 1 module, a new Layer 2 step descriptor, and a route. The shared
`WizardShell` component reads the descriptor and renders the wizard.

### The registry is the single source of truth

`src/projects/registry.ts` defines `CALCULATOR_REGISTRY` — the catalogue
that the homepage grid, sidebar navigation, and breadcrumb component all
derive from. The two-category split (`category: 'project' | 'handy'`)
and the live-vs-coming-soon flag (`status: 'live' | 'coming-soon'`)
both live in the registry and nowhere else.

When a calculator is shipped or hidden, the change is a one-line registry
edit; the navigation surfaces update automatically.

## Layer 3 — Presentation (`src/components/`, `src/pages/`, `src/layouts/`)

The presentation layer follows Astro's islands model:

- **`src/pages/`** — Astro routes. Pages are static HTML at build time;
  interactive content is delegated to React islands hydrated with
  `client:load` or `client:visible`.
- **`src/layouts/`** — shared chrome. `SelcoLayout.astro` provides the
  SELCO header, sidebar, info bar, and footer; pages slot their content
  into it.
- **`src/components/`** — React and Astro components.
  - `src/components/ui/` is the shared primitive library —
    `FormField`, `NumberInput`, `MaterialsList`, `ResultCard`,
    `ProductSelector`, and `WizardShell`. Project wizards compose these
    rather than rolling their own inputs.
  - Wizard components such as `DeckingProjectWizard.tsx` consume their
    Layer 2 step descriptor and render `WizardShell` with the
    appropriate slot content.
  - `src/components/calculators/` holds older single-purpose React
    calculators that have not migrated to the wizard pattern (currently
    only `CoverageCalculator.tsx`).

## Styling

Tailwind CSS 4 with the `@theme` directive is the single source of truth
for colour, type, spacing, radius, and shadow tokens. The token file is
at `src/styles/global.css`. There are no inline styles, no CSS modules,
and no per-component CSS files.

A CI lint guard (`scripts/lint-css-tokens.mjs`, run as `npm run
lint:tokens`) walks the source tree and fails if a CSS file references
a custom property that has not been declared in the canonical `@theme`
block. The guard exists because three competing token systems and
twelve undefined `--color-*` references invisibly broke buttons and
focus rings in the original prototype; it is documented in
`docs/audit/redesign-decisions.html`.

## Testing strategy

- **Layer 1** has full unit-test coverage. Each calculator has a paired
  `*.test.ts` file under `src/calculators/__tests__/` exercising its
  formula across documented test cases (often labelled `TC1`, `TC2`, …
  in commit messages).
- **Layer 2** has light coverage for non-trivial logic — see
  `src/projects/tiling-suggestions.test.ts`.
- **Layer 3** has component tests under `src/components/ui/__tests__/`
  and `src/components/__tests__/` for the shared primitives and the
  legacy `SpacersCalculator`.

The full suite runs in around 20 seconds on a developer laptop. There is
no end-to-end test layer — the app is small enough that a manual smoke
check after `npm run build && npm run preview` is sufficient.

## Routing and base path

The site is deployed at `https://sami.github.io/selco/` — under the
`/selco` subpath. `astro.config.mjs` sets `base: '/selco'` and `site:
'https://sami.github.io'` accordingly. Internal links must use
`import.meta.env.BASE_URL` so they resolve correctly under the subpath
in production while remaining navigable in dev (`http://localhost:4321/selco/`).

## What lives outside the app

| Path | Contents |
|------|----------|
| `docs/audit/` | TMA 02 prototype audit, UX evaluation, redesign decisions |
| `docs/plans/` | Dated implementation plans (architectural decisions before they were coded) |
| `docs/evidence/` | Decision-trace evidence: design tokens and masonry engine figures |
| `docs/tds/` | Manufacturer technical data sheets backing the product catalogues |
| `scripts/` | Build-time scripts including the CSS token lint guard |
| `public/` | Static assets served at the site root (favicons, hero images) |

These directories are not imported by the application. They are
preserved as evidence for the TM470 capstone report and as references
for future calculator additions.
