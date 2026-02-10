# Project Architecture

## Directory Structure

```
src/
├── calculators/          # Pure TypeScript calculator logic (NO React imports)
│   ├── tiles.ts          # Tile calculation functions
│   ├── tiles.test.ts     # Tests for tile calculations
│   ├── adhesive.ts       # Adhesive calculation functions
│   ├── grout.ts          # Grout calculation functions
│   ├── spacers.ts        # Spacer calculation functions
│   ├── conversions.ts    # Unit conversion functions
│   └── types.ts          # Shared types/interfaces for all calculators
├── components/           # UI components
│   ├── calculators/      # React calculator UI components (interactive islands)
│   │   ├── TileCalculator.tsx
│   │   └── ...
│   ├── SEOHead.astro     # SEO metadata
│   ├── Disclaimer.astro  # Disclaimer notice
│   └── FeedbackFooter.astro
├── layouts/
│   └── BaseLayout.astro  # Master layout (header, nav, footer)
├── pages/                # Astro file-based routing
│   ├── index.astro       # Home page
│   ├── calculators/
│   │   ├── index.astro   # Calculator listing
│   │   ├── tiles.astro   # Tile calculator page
│   │   └── ...
│   └── projects/
│       └── index.astro   # Saved projects (future)
├── styles/
│   └── global.css        # Tailwind v4 theme and base styles
└── test/
    └── setup.ts          # Vitest setup (jest-dom matchers, cleanup)
```

## Data Flow

```
[Calculator Logic]  →  [React Island Component]  →  [Astro Page]
   (pure TS)            (state + UI)                 (static shell)
```

1. **Calculator logic** (`src/calculators/`): Pure functions that take measurements and return results. No side effects, no React, no DOM. Fully unit-testable.

2. **React components** (`src/components/calculators/`): Interactive forms that collect user input, call calculator functions, and display results. Hydrated as Astro islands.

3. **Astro pages** (`src/pages/`): Static page shells that import the React component and render it with `client:load`. Handle SEO, layout, and routing.

## Calculator Function Pattern

Each calculator module exports pure functions:

```typescript
// src/calculators/tiles.ts
export interface TileInput {
  areaWidth: number;   // metres
  areaHeight: number;  // metres
  tileWidth: number;   // millimetres
  tileHeight: number;  // millimetres
  gapSize: number;     // millimetres
  wastage: number;     // percentage (e.g. 10)
}

export interface TileResult {
  tilesNeeded: number;
  coverageArea: number; // square metres
}

export function calculateTiles(input: TileInput): TileResult {
  // pure logic, no side effects
}
```

## React Island Pattern

```typescript
// src/components/calculators/TileCalculator.tsx
import { useState } from 'react';
import { calculateTiles } from '../../calculators/tiles';
import type { TileInput, TileResult } from '../../calculators/tiles';

export default function TileCalculator() {
  const [input, setInput] = useState<TileInput>({...});
  const [result, setResult] = useState<TileResult | null>(null);
  // form + results UI
}
```

## Astro Page Pattern

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import TileCalculator from '../../components/calculators/TileCalculator';
---
<BaseLayout title="Tile Calculator" description="...">
  <TileCalculator client:load />
</BaseLayout>
```

## Base URL

The app is deployed to `https://sami.github.io/selco` (not the root). All internal links must use the base path:

```astro
---
const base = import.meta.env.BASE_URL;
---
<a href={`${base}/calculators`}>Calculators</a>
```

In React components, pass the base URL as a prop from the Astro page if needed.

## Key Config Files

| File | Purpose |
|------|---------|
| `astro.config.mjs` | Site URL, base path, React integration, Tailwind Vite plugin |
| `global.css` | Tailwind v4 theme tokens (`@theme`), base styles, custom utilities |
| `vitest.config.ts` | Test config using Astro's `getViteConfig` wrapper |
| `tsconfig.json` | Strict TypeScript, React JSX |

> **Note:** `tailwind.config.mjs` exists but is likely unused. Tailwind v4 uses CSS-first configuration via `@theme` in `global.css`. Design tokens should be defined in `global.css` only.
