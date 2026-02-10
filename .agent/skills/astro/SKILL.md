---
name: astro-development
description: Building Astro pages, layouts, routing, and configuring islands architecture with React components.
---

# Astro Development

## Project Setup

- **Astro 5** with React integration and Tailwind v4 via Vite plugin.
- Site: `https://sami.github.io`, Base: `/selco`.
- Config: `astro.config.mjs`.

## Routing

Pages live in `src/pages/` and map directly to routes:

```
src/pages/index.astro           → /selco/
src/pages/calculators/index.astro → /selco/calculators/
src/pages/calculators/tiles.astro → /selco/calculators/tiles/
```

## Base URL

**Critical**: All internal links must use `import.meta.env.BASE_URL`. This resolves to `/selco` in production. Hardcoded paths break on GitHub Pages.

```astro
---
const base = import.meta.env.BASE_URL;
---
<a href={`${base}/calculators`}>Calculators</a>
```

## Islands Architecture

Use Astro for all static content. Only use React components where interactivity is needed (forms, calculators, dynamic UI).

```astro
---
import TileCalculator from '../../components/calculators/TileCalculator';
---
<!-- Static content rendered by Astro -->
<h1>Tile Calculator</h1>
<p>Calculate how many tiles you need.</p>

<!-- Interactive island hydrated by React -->
<TileCalculator client:load />
```

### Hydration Directives
- `client:load` — Hydrate immediately. Use for calculators (above the fold, interactive on load).
- `client:visible` — Hydrate when scrolled into view. Use for below-fold interactive content.
- `client:idle` — Hydrate when browser is idle. Use for non-urgent interactivity.

**Default to `client:load` for calculator components** since users visit the page to use them.

## Layout

All pages use `BaseLayout.astro` which provides:
- SEO head (via `SEOHead` component)
- Sticky header with navigation
- Main content area via `<slot />`
- Disclaimer and feedback footer

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
---
<BaseLayout title="Page Title" description="Page description for SEO.">
  <!-- page content -->
</BaseLayout>
```

## Passing Data to React

Pass data from Astro frontmatter to React components as props. Do NOT fetch data inside React components if it can be resolved at build time.

```astro
---
const base = import.meta.env.BASE_URL;
---
<Calculator baseUrl={base} client:load />
```
