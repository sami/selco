# Trade Materials Calculator

Estimating tools for trade sales assistants — masonry, flooring, tiling,
decking and more. Put in the size of a customer's job and get a materials
list rounded up to whole packs, based on common UK builders' merchant
ranges and manufacturer technical data sheets.

This is an independent project. It is not affiliated with or endorsed by
any builders' merchant or manufacturer, and product names belong to their
owners.

**Live:** [https://sami.github.io/selco/](https://sami.github.io/selco/)

## What it does

The site root is a catalogue of 35 project calculators, sorted by trade.
Behind it sit two kinds of page:

- **Rebuilt calculators** — written by hand and test-first since the
  1 July reset, in `src/`. Each takes the job's measurements and returns a
  materials list rounded up to whole packs of stocked products. Live now:
  - **Masonry Wall** (`/projects/masonry-wall/`) — bricks or blocks with
    wastage, then cement, sand and wall ties.
  - **Hard Flooring** (`/projects/hard-flooring/`) — area to buy, underlay
    or adhesive, scotia beading and threshold bars.
- **Concept exhibit** — the remaining calculators from the earlier concept
  demonstrator, frozen as prebuilt static pages in `public/`. They are
  replaced card by card as each calculator is rebuilt in `src/`.

The rebuilt calculators are listed in
[`src/projects/registry.ts`](src/projects/registry.ts); their pages take
their titles and blurbs from it.

## Tech stack

- **[Astro 5](https://astro.build)** — static-site generation; pages are
  rendered ahead of time and served from GitHub Pages.
- **[React 19](https://react.dev)** — interactive calculator islands.
- **[Tailwind CSS 4](https://tailwindcss.com)** — `@theme`-driven token
  system with a lint guard against undefined custom properties.
- **[Vitest 4](https://vitest.dev)** + React Testing Library + jsdom —
  unit and component tests, currently 11 files / 80 cases.
- **TypeScript 5** in strict mode across all source.

## Project layout

[`ARCHITECTURE.md`](ARCHITECTURE.md) covers the layering rationale.

```
src/
  calculators/   pure-TS engines (no React); packs.ts holds shared pack maths
  data/          product catalogues consumed by the engines
  projects/      registry of rebuilt calculators
  components/    React calculator islands and shared ui/ primitives
  layouts/       Astro layout and SELCO chrome
  pages/         Astro routes (.astro files only)
  styles/        Tailwind entry and @theme tokens
public/          frozen concept exhibit, catalogue (index.html) and vendored assets
docs/
  audit/         TMA 02 audit and redesign decisions
  plans/         dated implementation plans
  tds/           manufacturer technical data sheets
PROJECT_HISTORY.md   factual narrative of the codebase by era
```

## Running locally

Node 22 is required; Vitest does not run on Node 18.

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
npm run lint:tokens     # check for undefined CSS custom properties
npx astro check         # type check
```

## Build and preview

```sh
npm run build           # static output to dist/
npm run preview         # serve dist/ locally for verification
```

`package.json` pins Vite to 6 via `overrides`, matching the version Astro 5
ships with, so the Tailwind and Vitest plugins type-check against the same
Vite as Astro.

## Deploy

The app deploys to GitHub Pages on push to `main` via the workflow in
`.github/workflows/`. The base path is `/selco`, configured in
[`astro.config.mjs`](astro.config.mjs). Internal links in `src/` must use
`import.meta.env.BASE_URL` so they resolve correctly under the subpath.

## Background

Trade Materials Calculator is the project deliverable for **TM470 — The
Computing and IT Project**, an Open University capstone module. The
project history, including era-by-era development phases and the
decisions log, is documented in
[`PROJECT_HISTORY.md`](PROJECT_HISTORY.md).

## License

[MIT](LICENSE) — see the licence file for the full text.
