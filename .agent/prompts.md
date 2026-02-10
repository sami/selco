# AI Prompts

Prompts for the Antigravity coding agent. Copy and paste one at a time.

---

## Prompt 1 — Design System & Layout Foundation

> Redesign the BaseLayout and global styles for SELCO Calculator — a web-based trade materials calculator app. The current design is too generic and template-like. Create a friendly, approachable, and warm design that feels like a helpful tool rather than a corporate marketing site.
>
> **Brand colours:** Blue `#003087`, Yellow `#FFD100`. Use these as anchors but soften the overall palette — add warm greys, soft blue tints for backgrounds, and use yellow sparingly for CTAs and highlights only. The page background should NOT be plain white — use a very subtle warm grey or light blue-grey.
>
> **Design language:**
> - Rounded corners (12–16px on cards, 8px on buttons and inputs)
> - Soft, layered shadows (not harsh drop-shadows)
> - Generous whitespace and padding — the UI should breathe
> - Friendly, readable typography — system sans-serif stack, with clear size hierarchy (not oversized hero text)
> - Icons from Lucide (`https://lucide.dev/`) — use them consistently for navigation, calculator categories, and UI affordances. No emojis anywhere.
>
> **Sticky header:**
> - White or very light background with a subtle bottom border (not solid blue)
> - SELCO logo/wordmark in brand blue on the left
> - Navigation links: Home, Calculators, My Projects — in a clean horizontal row
> - Active page indicator: a subtle pill-shaped highlight or underline in brand yellow
> - Mobile: hamburger menu icon (Lucide `Menu`) that opens a slide-down panel
> - The header should feel lightweight, not heavy
>
> **Footer:**
> - Minimal — disclaimer text, feedback link, copyright
> - Light background, small text, not visually heavy
>
> **Overall feel:** Think of apps like Notion, Linear, or Raycast — clean, functional, friendly, with personality in the details. Not a landing page template. This is a tool people use, not a brochure.
>
> Use Tailwind CSS utility classes. Use Lucide icons via inline SVG or the `lucide` npm package. Keep the existing Astro + React architecture — this is styling only.

---

## Prompt 2 — Home Page

> Redesign the home page for SELCO Calculator. The current page has a generic hero section, a cliché "how it works" 1-2-3 section, a card grid, and a marketing banner. Replace all of it.
>
> **Page structure (top to bottom):**
>
> 1. **Welcome section** (not a "hero") — short, warm heading like "What are you working on today?" with a brief subtitle. No giant text. Keep it conversational. Below the text, show a search/filter input (placeholder: "Search calculators...") with a subtle border and a Lucide `Search` icon. This lets users jump straight to what they need.
>
> 2. **Calculator quick-access grid** — the main feature of the page. Show all available calculators in a 2-column (mobile) / 3-column (desktop) grid of cards. Each card has:
>    - A Lucide icon (e.g. `Grid3x3` for tiles, `Droplets` for adhesive, `Sparkles` for grout, `Ruler` for spacers, `ArrowLeftRight` for conversions)
>    - Calculator name (bold)
>    - One-line description
>    - Subtle hover effect (lift + border colour change to brand blue)
>    - Cards should feel clickable and inviting — rounded, with soft shadow
>
> 3. **Tiling project spotlight** — a single, friendly callout card (not a full-width marketing banner). Use a warm gradient or soft brand blue background. Lucide `Layers` icon. Heading: "Planning a tiling project?" Description: "Calculate tiles, adhesive, grout, and spacers in one go." CTA button in brand yellow. Keep it compact — not a billboard.
>
> 4. **Recently used / Quick tip** — (optional, can be placeholder for now) a small section for "Pick up where you left off" or a helpful tip. Keeps the page feeling alive and useful.
>
> **What to avoid:**
> - No "how it works" step sections
> - No oversized hero text
> - No emoji icons
> - No "View all →" links that feel like filler
> - No full-width colour block sections
>
> Use Tailwind CSS. Use Lucide icons. Keep British English in all copy.

---

## Prompt 3 — Calculators Index Page

> Redesign the calculators listing page. Currently it's a placeholder with "coming soon." Make it a proper browsing page.
>
> **Layout:**
> - Page heading: "Calculators" with a brief subtitle like "Estimate materials for your next project."
> - Below the heading: a filter/search bar (same style as home page) — lets users type to filter calculators.
> - Calculator grid: same card style as home page but slightly larger cards with more description. Each card shows:
>   - Lucide icon
>   - Calculator name
>   - 2-line description of what it calculates
>   - A subtle tag/badge showing category (e.g. "Tiling", "General")
> - Group calculators by category if there are enough (e.g. "Tiling" group contains Tiles, Adhesive, Grout, Spacers; "General" contains Conversions)
>
> **Calculators to list:**
> - Conversions (Lucide `ArrowLeftRight`) — Convert between metric and imperial measurements
> - Tiles (Lucide `Grid3x3`) — Calculate how many tiles you need for walls and floors
> - Adhesive (Lucide `Droplets`) — Estimate adhesive coverage and bags required
> - Grout (Lucide `Sparkles`) — Work out how much grout you need
> - Spacers (Lucide `Ruler`) — Calculate the number of spacers for your tiling job
>
> Use Tailwind CSS. Lucide icons. British English.

---

## Prompt 4 — Calculator Page Template

> Design a reusable calculator page layout. This is the page users will spend the most time on — it must be clear, easy to use, and not overwhelming.
>
> **Layout (two-column on desktop, stacked on mobile):**
>
> **Left column — Input form:**
> - Page title with Lucide icon (e.g. "Tile Calculator" with `Grid3x3`)
> - Brief description of what this calculator does
> - Form fields in a clean vertical stack:
>   - Each input has a visible `<label>` above it
>   - Inputs are large enough to tap easily on mobile (min 44px height)
>   - Use appropriate input types (`number`, with `step`, `min`, `max` where relevant)
>   - Group related inputs with subtle fieldset borders or section labels (e.g. "Room dimensions", "Tile size", "Options")
>   - Include unit labels inside or next to inputs (e.g. "metres", "mm", "%")
> - "Calculate" button — prominent, brand yellow background, full-width on mobile
> - Below the button: a "Reset" text link (not a button — secondary action)
>
> **Right column — Results panel:**
> - Initially shows a friendly empty state: "Enter your measurements to see results" with a Lucide `Calculator` icon
> - After calculation, shows results in a clean card:
>   - Primary result large and bold (e.g. "93 tiles needed")
>   - Secondary details below (e.g. "Coverage area: 7.2 m²", "Including 10% wastage")
>   - Each result line has a Lucide icon
> - Results card has a subtle success-tinted border (green) when populated
> - Optional: "Save to project" button below results (for future feature)
>
> **Below both columns:**
> - Disclaimer component (already exists)
>
> **Design notes:**
> - The form should NOT look like a boring government form — soft borders, good spacing, rounded inputs
> - Results should feel rewarding — the transition from empty to populated should feel like progress
> - On mobile, inputs come first, results below
>
> Use Tailwind CSS. Lucide icons. British English. This is a React component (interactive island) embedded in an Astro page.

---

## Prompt 5 — My Projects Page

> Design the "My Projects" page. This is where users will save and revisit their calculator estimates. For now, it just needs an empty state since the feature isn't built yet.
>
> **Empty state (current):**
> - Centred on the page, vertically offset (not dead centre — slightly above middle)
> - Lucide `FolderOpen` icon, large but not oversized (48px), in muted grey
> - Heading: "No saved projects yet"
> - Description: "When you save calculator results to a project, they'll appear here."
> - CTA button: "Browse calculators" — links to /calculators, brand yellow button
>
> **Future state (design for this but implement as placeholder):**
> - Project cards in a grid, each showing:
>   - Project name (user-defined)
>   - Date created
>   - List of calculators used (with Lucide icons)
>   - "Open" and "Delete" actions
>
> Use Tailwind CSS. Lucide icons. British English.

---

## Prompt 6 — Fix Header: Logo Padding & Nav Spacing

> Fix two issues in the Header component (`src/components/Header.astro`):
>
> 1. **Logo needs padding** — The logo link (the "S" icon + "SELCO Calculator" text) has no breathing room. Add `p-1.5` or `p-2` to the `<a>` wrapper so the focus ring and hover state don't sit flush against the content.
>
> 2. **Navigation links are too crowded** — The desktop nav currently uses `gap-1` between links. Increase to `gap-2` so the pill-shaped links don't feel jammed together. The overall header should feel spacious, not packed.
>
> Only touch the Header component. Don't change anything else.

---

## Prompt 7 — Fix GitHub Pages: Switch to Actions deployment

> GitHub Pages is returning 404 because the repo is configured to deploy from the branch directly (`build_type: "legacy"`) instead of from the GitHub Actions workflow output.
>
> Run this command to switch the Pages source to GitHub Actions:
>
> ```bash
> gh api repos/sami/selco/pages -X PUT -f build_type=workflow
> ```
>
> Then trigger a redeploy by pushing a commit or running:
>
> ```bash
> gh workflow run "Deploy to GitHub Pages"
> ```
>
> Verify the site loads at `https://sami.github.io/selco/` after the workflow completes.

---

## Prompt 8 — Fix Header: Revert to pill nav with proper spacing (ALL PAGES)

> **IMPORTANT: The navigation lives in a SINGLE shared component: `src/components/Header.astro`. This component is used by `src/layouts/BaseLayout.astro`, which is used by EVERY page. You MUST edit `src/components/Header.astro` — do NOT duplicate or inline navigation code in any page file.**
>
> The previous change broke the desktop navigation by replacing pill-shaped links with plain text+underline links. Revert to pills with proper spacing.
>
> **Edit ONLY `src/components/Header.astro` — the desktop nav `<nav>` element:**
> - `rounded-full` with `px-4 py-2` on each link
> - Active state: `bg-brand-blue/10 text-brand-blue font-semibold` (no shadow-sm)
> - Inactive state: `text-muted-foreground hover:bg-muted/50 hover:text-surface-foreground`
> - Nav gap: `gap-4` (16px between pills)
>
> **After making the change, verify it works on ALL pages by running `npm run build` and checking the output.** The same header must appear on:
> - `/selco/` (Home active)
> - `/selco/projects/` (Projects active)
> - `/selco/calculators/` (Calculators active)
> - `/selco/calculators/tiles/` (Calculators active — sub-page match)
>
> Do NOT touch any file other than `src/components/Header.astro`.

---

# Phase 2 — Build All Calculators with Tests

---

## Prompt 9 — Project Setup: Test Script & Dependencies

> Add the missing test infrastructure:
>
> 1. Add `"test": "vitest"` to the `scripts` section of `package.json`
> 2. Install `@testing-library/user-event` as a dev dependency: `npm install -D @testing-library/user-event`
> 3. Verify the setup works by running `npm test -- --run`. It will fail because the test files reference modules that don't exist yet — that's expected and correct (TDD red phase).

---

## Prompt 10 — Create Shared Types & Extract Tiles Calculator Logic

> The tile calculation logic is currently inlined in `src/components/TileCalculator.tsx`. Extract it to a standalone pure TypeScript module per the project architecture rules.
>
> **Step 1: Create `src/calculators/types.ts`** with shared interfaces:
>
> ```typescript
> export interface TileInput {
>   areaWidth: number;    // metres
>   areaHeight: number;   // metres
>   tileWidth: number;    // millimetres
>   tileHeight: number;   // millimetres
>   wastage: number;      // percentage (e.g. 10)
> }
>
> export interface TileResult {
>   tilesNeeded: number;
>   coverageArea: number;   // square metres
>   wastageAmount: number;  // extra tiles for wastage
> }
>
> export interface AdhesiveInput {
>   area: number;       // square metres
>   tileSize: number;   // longest tile edge in mm
>   wastage: number;    // percentage
>   bagSize: number;    // kg per bag (default 20)
> }
>
> export interface AdhesiveResult {
>   kgNeeded: number;
>   bagsNeeded: number;
>   coverageRate: number;  // kg per m²
> }
>
> export interface GroutInput {
>   area: number;        // square metres
>   tileWidth: number;   // mm
>   tileHeight: number;  // mm
>   jointWidth: number;  // mm
>   tileDepth: number;   // mm
>   wastage: number;     // percentage
>   bagSize: number;     // kg per bag (default 5)
> }
>
> export interface GroutResult {
>   kgNeeded: number;
>   bagsNeeded: number;
>   kgPerM2: number;
> }
>
> export interface SpacersInput {
>   numberOfTiles: number;
>   pattern: 'grid' | 'brick';
>   wastage: number;     // percentage
> }
>
> export interface SpacersResult {
>   spacersNeeded: number;
>   spacersPerTile: number;
> }
> ```
>
> **Step 2: Create `src/calculators/tiles.ts`** — move the `calculateTiles` function from `TileCalculator.tsx` into this file. Refactor it to:
> - Accept a `TileInput` object (not individual params)
> - Return a `TileResult` object
> - **Throw an error** for invalid inputs (zero or negative dimensions) instead of returning null
> - Keep the same calculation logic: `coverageArea = areaWidth * areaHeight`, `tileSizeM2 = (tileWidth/1000) * (tileHeight/1000)`, `rawTiles = coverageArea / tileSizeM2`, apply wastage with `Math.ceil`
>
> **Step 3: Update `src/components/TileCalculator.tsx`** — import `calculateTiles` and types from `../../calculators/tiles` and `../../calculators/types`. Remove the inlined function.
>
> **Step 4: Run `npm test -- --run src/calculators/tiles.test.ts`** — all tests must pass.
>
> Do NOT modify the test file. The tests define the expected behaviour.

---

## Prompt 11 — Implement Adhesive Calculator

> Build the adhesive calculator end-to-end. Test file already exists at `src/calculators/adhesive.test.ts`.
>
> **Step 1: Create `src/calculators/adhesive.ts`**
>
> Export a `calculateAdhesive(input: AdhesiveInput): AdhesiveResult` function.
>
> Coverage rate logic based on largest tile edge:
> - `tileSize <= 200mm` → 2.0 kg/m²
> - `tileSize <= 400mm` → 3.5 kg/m²
> - `tileSize <= 600mm` → 5.0 kg/m²
> - `tileSize > 600mm` → 5.5 kg/m²
>
> Formula: `kgNeeded = area * coverageRate * (1 + wastage/100)`, `bagsNeeded = Math.ceil(kgNeeded / bagSize)`
>
> Throw for invalid inputs (zero/negative area or tile size).
>
> **Step 2: Run `npm test -- --run src/calculators/adhesive.test.ts`** — all tests must pass.
>
> **Step 3: Create `src/components/AdhesiveCalculator.tsx`**
>
> Use the same pattern as `TileCalculator.tsx` — import `calculateAdhesive` from the logic module, use `CalculatorLayout` for the UI. Form fields:
> - Area to cover (m²)
> - Largest tile edge (mm)
> - Wastage allowance (%, default 10)
> - Bag size (kg, default 20)
>
> Results: kg needed (primary), bags needed, coverage rate used.
>
> **Step 4: Create `src/pages/calculators/adhesive/index.astro`**
>
> Same pattern as the tiles page — import `AdhesiveCalculator` with `client:load` inside `BaseLayout`.
>
> Do NOT modify any test files.

---

## Prompt 12 — Implement Grout Calculator

> Build the grout calculator. Test file exists at `src/calculators/grout.test.ts`.
>
> **Step 1: Create `src/calculators/grout.ts`**
>
> Export a `calculateGrout(input: GroutInput): GroutResult` function.
>
> Formula (industry standard):
> ```
> kgPerM2 = ((tileWidth + tileHeight) / (tileWidth * tileHeight)) * jointWidth * tileDepth * 1.6
> kgNeeded = area * kgPerM2 * (1 + wastage/100)
> bagsNeeded = Math.ceil(kgNeeded / bagSize)
> ```
> Where 1.6 is the grout density constant (kg/L).
>
> Throw for invalid inputs (zero/negative dimensions).
>
> **Step 2: Run `npm test -- --run src/calculators/grout.test.ts`** — all tests must pass.
>
> **Step 3: Create `src/components/GroutCalculator.tsx`**
>
> Use `CalculatorLayout`. Form fields:
> - Area to cover (m²)
> - Tile width (mm)
> - Tile height (mm)
> - Joint/gap width (mm, default 3)
> - Tile depth/thickness (mm, default 8)
> - Wastage allowance (%, default 10)
> - Bag size (kg, default 5)
>
> Results: kg needed (primary), bags needed, kg per m² rate.
>
> **Step 4: Create `src/pages/calculators/grout/index.astro`**
>
> Do NOT modify any test files.

---

## Prompt 13 — Implement Spacers Calculator

> Build the spacers calculator. Test file exists at `src/calculators/spacers.test.ts`.
>
> **Step 1: Create `src/calculators/spacers.ts`**
>
> Export a `calculateSpacers(input: SpacersInput): SpacersResult` function.
>
> Logic:
> - Grid pattern: 4 spacers per tile
> - Brick/offset pattern: 3 spacers per tile
> - `spacersNeeded = Math.ceil(numberOfTiles * spacersPerTile * (1 + wastage/100))`
>
> Throw for invalid inputs (zero/negative tile count).
>
> **Step 2: Run `npm test -- --run src/calculators/spacers.test.ts`** — all tests must pass.
>
> **Step 3: Create `src/components/SpacersCalculator.tsx`**
>
> Use `CalculatorLayout`. Form fields:
> - Number of tiles
> - Layout pattern (dropdown: Grid / Brick-offset)
> - Wastage allowance (%, default 10)
>
> Results: spacers needed (primary), spacers per tile used.
>
> **Step 4: Create `src/pages/calculators/spacers/index.astro`**
>
> Do NOT modify any test files.

---

## Prompt 14 — Implement Conversions Calculator

> Build the unit conversions calculator. Test file exists at `src/calculators/conversions.test.ts`.
>
> **Step 1: Create `src/calculators/conversions.ts`**
>
> Export three functions:
>
> `convertLength(value: number, from: LengthUnit, to: LengthUnit): number`
> - Units: `'mm' | 'cm' | 'm' | 'in' | 'ft' | 'yd'`
> - Convert via a base unit (metres): define each unit's factor to metres, convert input to metres then to target unit
>
> `convertArea(value: number, from: AreaUnit, to: AreaUnit): number`
> - Units: `'mm2' | 'cm2' | 'm2' | 'ft2' | 'yd2'`
> - Same base-unit pattern (square metres)
>
> `convertWeight(value: number, from: WeightUnit, to: WeightUnit): number`
> - Units: `'g' | 'kg' | 'oz' | 'lb'`
> - Base unit: kilograms
>
> Export the unit type aliases (`LengthUnit`, `AreaUnit`, `WeightUnit`).
>
> **Step 2: Run `npm test -- --run src/calculators/conversions.test.ts`** — all tests must pass.
>
> **Step 3: Create `src/components/ConversionsCalculator.tsx`**
>
> This is different from other calculators — it's a converter, not an estimator. Layout:
> - Tab or toggle to select conversion type: Length / Area / Weight
> - Input value field
> - "From" unit dropdown
> - "To" unit dropdown
> - Result updates live as the user types (no "Calculate" button needed — use `useMemo` or calculate on every render)
> - Show the conversion result prominently
> - Include a "Swap" button (Lucide `ArrowLeftRight`) to swap from/to units
>
> Use `CalculatorLayout` if it fits, or build a custom layout for this one since the UX is different.
>
> **Step 4: Create `src/pages/calculators/conversions/index.astro`**
>
> Do NOT modify any test files.

---

## Prompt 15 — Run Full Test Suite & Verify All Pages

> Run the full test suite and verify everything works:
>
> 1. `npm test -- --run` — all tests must pass with zero failures
> 2. `npm run build` — build must succeed with no errors
> 3. Verify all calculator pages exist by checking the build output:
>    - `/calculators/index.html`
>    - `/calculators/tiles/index.html`
>    - `/calculators/adhesive/index.html`
>    - `/calculators/grout/index.html`
>    - `/calculators/spacers/index.html`
>    - `/calculators/conversions/index.html`
>
> Fix any issues found. Do NOT modify test files — fix the implementation code.

---

## Prompt 16 — Fix Broken Links: Tiling Project & Favicon

> Two links across the site produce 404 errors. Fix both:
>
> **1. `/selco/projects/tiling/` — page doesn't exist**
>
> The homepage (`src/pages/index.astro`, around line 119) links to `${base}projects/tiling/` in the "Planning a tiling project?" spotlight card. This page was never created.
>
> **Fix:** Change the link to point to `${base}calculators/tiles/` instead (the tile calculator is the closest existing page). Update the CTA text from "Start project" to "Start calculating" since it's no longer a project page.
>
> **2. `/favicon.svg` — missing base URL prefix**
>
> In `src/components/SEOHead.astro` (line 20), the favicon link is hardcoded as `/favicon.svg`. On GitHub Pages this resolves to `https://sami.github.io/favicon.svg` instead of `https://sami.github.io/selco/favicon.svg`.
>
> **Fix:** Change it to use the base URL:
> ```astro
> <link rel="icon" type="image/svg+xml" href={`${import.meta.env.BASE_URL}/favicon.svg`} />
> ```
>
> **3. Feedback link in Footer uses wrong URL**
>
> In `src/components/Footer.astro` (around line 13), the Feedback link uses `mailto:contact@sami.codes`. Change it to link to the Notion feedback form instead:
>
> ```
> https://madebysami.notion.site/2fe361401cd480fc9fcfdf4871d199b1?pvs=105
> ```
>
> Keep the link text as "Feedback". Add `target="_blank"` and `rel="noopener noreferrer"` since it's an external link.
>
> After fixing all three, run `npm run build` and verify no links point to pages that don't exist.
