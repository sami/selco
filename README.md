# Trade Materials Calculator

A web app that estimates trade materials for common building projects —
tiling, flooring, masonry, decking, and more — using product data sourced
from SELCO Builders Warehouse and manufacturer technical data sheets.

**Live:** [https://sami.github.io/selco/](https://sami.github.io/selco/)

## What it does

The app combines two complementary tools:

- **Project calculators** — multi-step wizards that walk through a complete
  project (room or wall measurements, substrate choices, product
  selection) and return a single bill of materials covering every required
  item.
- **Handy calculators** — single-purpose utilities for unit conversion and
  board-coverage estimation.

Six calculators are live and two more are planned. The full catalogue is
maintained in [`src/projects/registry.ts`](src/projects/registry.ts) — the
homepage grid, sidebar navigation, and breadcrumbs all derive from it, so
the registry stays the single source of truth for what is shipped.

## Tech stack

- **[Astro 5](https://astro.build)** — static-site generation; pages are
  rendered ahead of time and served from GitHub Pages.
- **[React 19](https://react.dev)** — interactive islands hydrated as
  needed (`client:load`, `client:visible`).
- **[Tailwind CSS 4](https://tailwindcss.com)** — `@theme`-driven token
  system with a CI lint guard against undefined custom properties.
- **[Vitest 4](https://vitest.dev)** + React Testing Library + jsdom —
  unit and component tests, currently 51 files / 500 cases on `src/`.
- **TypeScript 5** in strict mode across all source.

## Project layout

The codebase is a single npm package with a deliberate three-layer split.
[`ARCHITECTURE.md`](ARCHITECTURE.md) covers the rationale and conventions
in detail.

```
src/
  calculators/   Layer 1 — pure-TS calculation engines (no React)
  projects/      Layer 2 — wizard step descriptors composing Layer 1
  components/    Layer 3 — React islands and shared `ui/` primitives
  layouts/       Layer 3 — Astro layouts and SELCO chrome
  pages/         Layer 3 — Astro routes
  data/          product catalogues consumed by Layer 1
  styles/        Tailwind entry and `@theme` tokens
docs/
  audit/         TMA 02 audit and redesign decisions
  plans/         dated implementation plans
  evidence/      decision-trace evidence (design tokens, masonry engine)
  tds/           manufacturer technical data sheets
PROJECT_HISTORY.md   factual narrative of the codebase by era
```

## Running locally

```sh
npm install
npm run dev
```

The dev server starts at `http://localhost:4321/selco/`.

## Testing

```sh
npm test                # watch mode
npm test -- --run       # single pass
npm run test:coverage   # single pass with v8 coverage report in coverage/
```

Coverage output is written to `coverage/` and is git-ignored.

## Build and preview

```sh
npm run build           # static output to dist/
npm run preview         # serve dist/ locally for verification
```

## Deploy

The app deploys to GitHub Pages on push to `main` via the workflow in
`.github/workflows/`. The base path is `/selco`, configured in
[`astro.config.mjs`](astro.config.mjs). All internal links must use
`import.meta.env.BASE_URL` so they resolve correctly under the subpath.

## Background

Trade Materials Calculator is the project deliverable for **TM470 — The
Computing and IT Project**, an Open University capstone module. The
project history, including era-by-era development phases and the
decisions log, is documented in
[`PROJECT_HISTORY.md`](PROJECT_HISTORY.md).

## License

[MIT](LICENSE) — see the licence file for the full text.
