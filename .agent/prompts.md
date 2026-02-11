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
> **4. Conversion type pills too close together**
>
> In `src/components/ConversionsCalculator.tsx` (around line 122), the conversion type tabs (Length / Area / Weight) use `gap-2` (8px). Change to `gap-4` (16px) so the pill buttons have breathing room between them.
>
> After fixing all four, run `npm run build` and verify no links point to pages that don't exist.

---

# Phase 3 — SEO Content & Calculator Logic Upgrades

Test files have been updated with the new specifications. SEO content is in `.agent/content/*.md`. The tests define the expected API — implement to make them pass.

---

## Prompt 17 — Update Shared Types for Phase 3

> Update `src/calculators/types.ts` with the following changes. Do NOT modify any test files.
>
> **TileInput** — add optional `packSize?: number` (tiles per pack)
> **TileResult** — add optional `packsNeeded?: number`
>
> **AdhesiveInput** — replace the current interface entirely:
> ```typescript
> export interface AdhesiveInput {
>   area: number;           // square metres
>   coverageRate: number;   // kg/m² (from product TDS data)
>   bagSize: number;        // kg per bag/tub (from product data)
>   substrate: 'even' | 'uneven';
>   wastage: number;        // percentage (e.g. 10)
> }
> ```
>
> **AdhesiveResult** — replace entirely:
> ```typescript
> export interface AdhesiveResult {
>   kgNeeded: number;
>   bagsNeeded: number;
> }
> ```
>
> **GroutInput** — remove `bagSize` field. Keep all other fields.
>
> **GroutResult** — replace entirely:
> ```typescript
> export interface GroutResult {
>   kgNeeded: number;
>   bags5kg: number;
>   bags2_5kg: number;
>   kgPerM2: number;
> }
> ```
>
> **SpacersInput** — replace entirely:
> ```typescript
> export interface SpacersInput {
>   areaM2: number;           // square metres
>   tileWidthMm: number;      // mm
>   tileHeightMm: number;     // mm
>   layout: 'cross' | 't-junction';
>   wastage: number;           // percentage
> }
> ```
>
> **SpacersResult** — replace entirely:
> ```typescript
> export interface SpacersResult {
>   spacersNeeded: number;
>   packs100: number;
>   packs250: number;
> }
> ```

---

## Prompt 18 — Update Conversions Calculator Logic

> Update `src/calculators/conversions.ts` to add three new conversion categories and supporting exports. Tests are in `src/calculators/conversions.test.ts`.
>
> **Add:**
> - `VolumeUnit` type: `'m3' | 'litres' | 'ft3' | 'yd3' | 'gallons_uk'`
> - `TemperatureUnit` type: `'C' | 'F'`
> - `DensityMaterial` type: `'concrete' | 'hardcore' | 'sand' | 'gravel' | 'ballast'`
> - `convertVolume(value, from, to)` — base unit m³. Factors: litres=0.001, ft3=0.0283168, yd3=0.764555, gallons_uk=0.00454609
> - `convertTemperature(value, from, to)` — C→F: `(C * 9/5) + 32`, F→C: `(F - 32) * 5/9`, same unit returns value unchanged
> - `DENSITY` constant: `{ concrete: 2.4, hardcore: 2.1, sand: 1.6, gravel: 1.8, ballast: 1.8 }` (t/m³)
> - `convertDensityToWeight(volumeM3, material)` — returns `volumeM3 * DENSITY[material]` in tonnes
> - `UNITS` object with arrays of `{ value, label }` for length, area, volume, weight, temperature
> - Add `'tonnes'` to `WeightUnit` type with factor 1000 (1 tonne = 1000 kg)
>
> **Export** all new types, functions, and constants. Keep all existing exports unchanged.
>
> Run `npm test -- --run src/calculators/conversions.test.ts` — all tests must pass. Do NOT modify the test file.

---

## Prompt 19 — Update Tiles Calculator Logic

> Update `src/calculators/tiles.ts` to support pack sizes. Tests in `src/calculators/tiles.test.ts`.
>
> **Changes:**
> - Import the updated `TileInput` and `TileResult` from `./types` (which now include `packSize?` and `packsNeeded?`)
> - If `input.packSize` is provided and > 0, set `packsNeeded = Math.ceil(tilesNeeded / packSize)` in the result
> - If `packSize` is not provided, omit `packsNeeded` from the result (leave it `undefined`)
> - Export a `COMMON_TILE_SIZES` array with at least these entries:
>   ```typescript
>   export const COMMON_TILE_SIZES = [
>     { width: 300, height: 300, label: '300 x 300 mm' },
>     { width: 600, height: 300, label: '600 x 300 mm' },
>     { width: 200, height: 100, label: '200 x 100 mm (metro)' },
>     { width: 600, height: 600, label: '600 x 600 mm' },
>   ];
>   ```
>
> Run `npm test -- --run src/calculators/tiles.test.ts` — all tests must pass. Do NOT modify the test file.

---

## Prompt 20 — Rewrite Adhesive Calculator Logic

> Rewrite `src/calculators/adhesive.ts` to use product-based coverage rates from manufacturer TDS data. Tests in `src/calculators/adhesive.test.ts`.
>
> **The pure function** takes `coverageRate` and `bagSize` as inputs (the UI will look these up from `ADHESIVE_PRODUCTS` based on the selected product and application type).
>
> **Substrate adjustment:** if `substrate === 'uneven'`, multiply the coverage rate by 1.2 (+20%)
>
> **Formula:** `kgNeeded = area * coverageRate * substrateMultiplier * (1 + wastage/100)`, `bagsNeeded = Math.ceil(kgNeeded / bagSize)`
>
> **Return:** `{ kgNeeded, bagsNeeded }`
>
> **Export** `ADHESIVE_PRODUCTS` array with Selco-stocked manufacturer data:
> ```typescript
> export const ADHESIVE_PRODUCTS = [
>   { value: 'dunlop-rx3000', label: 'Dunlop RX-3000 (15 kg tub)', bagSize: 15, dryWallRate: 2, wetAreaRate: 3 },
>   { value: 'dunlop-cx24', label: 'Dunlop CX-24 Essential (20 kg bag)', bagSize: 20, dryWallRate: 2, wetAreaRate: 3.5 },
>   { value: 'dunlop-cf03', label: 'Dunlop CF-03 Flexible Fast Set (20 kg bag)', bagSize: 20, dryWallRate: 2, wetAreaRate: 4 },
>   { value: 'mapei-standard', label: 'Mapei Standard Set Plus (20 kg bag)', bagSize: 20, dryWallRate: 2, wetAreaRate: 4 },
> ];
> ```
>
> Throw for zero/negative area or coverage rate. Import types from `./types`.
>
> Run `npm test -- --run src/calculators/adhesive.test.ts` — all tests must pass. Do NOT modify the test file.

---

## Prompt 21 — Update Grout Calculator Logic

> Update `src/calculators/grout.ts` to remove `bagSize` input and return dual bag sizes. Tests in `src/calculators/grout.test.ts`.
>
> **Changes:**
> - Remove `bagSize` from destructured input (it's been removed from `GroutInput`)
> - Return `bags5kg: Math.ceil(kgNeeded / 5)` and `bags2_5kg: Math.ceil(kgNeeded / 2.5)` instead of `bagsNeeded`
> - Keep `kgPerM2` in the result (same formula as before)
> - Export `COMMON_JOINT_WIDTHS` array:
>   ```typescript
>   export const COMMON_JOINT_WIDTHS = [
>     { value: 2, label: '2 mm — Rectified tiles' },
>     { value: 3, label: '3 mm — Standard wall tiles' },
>     { value: 5, label: '5 mm — Standard floor tiles' },
>     { value: 10, label: '10 mm — Rustic/handmade tiles' },
>   ];
>   ```
>
> Run `npm test -- --run src/calculators/grout.test.ts` — all tests must pass. Do NOT modify the test file.

---

## Prompt 22 — Rewrite Spacers Calculator Logic

> Rewrite `src/calculators/spacers.ts` to use area-based input and return pack counts. Tests in `src/calculators/spacers.test.ts`.
>
> **New logic:**
> 1. Calculate tiles: `tiles = Math.ceil(areaM2 / ((tileWidthMm / 1000) * (tileHeightMm / 1000)))`
> 2. Spacers per tile: cross = 4, t-junction = 3
> 3. `spacersNeeded = Math.ceil(tiles * spacersPerTile * (1 + wastage / 100))`
> 4. `packs100 = Math.ceil(spacersNeeded / 100)`, `packs250 = Math.ceil(spacersNeeded / 250)`
>
> Throw for zero/negative area or tile dimensions.
>
> **Export** `SPACER_SIZES` array:
> ```typescript
> export const SPACER_SIZES = [
>   { value: 1, label: '1 mm' },
>   { value: 1.5, label: '1.5 mm' },
>   { value: 2, label: '2 mm' },
>   { value: 3, label: '3 mm' },
>   { value: 4, label: '4 mm' },
>   { value: 5, label: '5 mm' },
> ];
> ```
>
> Import types from `./types`. Run `npm test -- --run src/calculators/spacers.test.ts` — all tests must pass. Do NOT modify the test file.

---

## Prompt 23 — Verify All Calculator Tests Pass

> Run the full test suite: `npm test -- --run`
>
> All tests must pass with zero failures. If any test fails, fix the **implementation code** (not the test files). The test files define the correct behaviour.
>
> After tests pass, run `npm run build` to verify the project still builds.

---

## Prompt 24 — Rebuild Conversions Page with SEO Content

> Rebuild `src/pages/calculators/conversions/index.astro` with full SEO content. Use the content from `.agent/content/conversions-seo.md` **verbatim**.
>
> **Page structure:**
> 1. SEO head metadata (title, description, canonical, OG tags)
> 2. Breadcrumbs: Home > Calculators > Unit Conversions
> 3. H1, intro paragraph, disclaimer callout (yellow background)
> 4. Guidance section ("Why Conversions Matter in Building")
> 5. How to use section (3 steps)
> 6. **React island**: Update `ConversionsCalculator.tsx` to add Volume, Temperature, and Density tabs (import the new functions and types from `../calculators/conversions`). The density tab should have a volume input, material dropdown, and show weight in tonnes.
> 7. Reference tables (6 small tables, one per category)
> 8. Quick reference table ("Common Trade Conversions")
> 9. Context section ("When You Need These Conversions") with 4 subsections
> 10. Related calculators (link cards)
> 11. FAQ section (5 questions as toggle blocks)
> 12. `FAQPage` JSON-LD structured data in a `<script type="application/ld+json">` tag
> 13. Sources & further reading
>
> Use Tailwind CSS. Use Lucide icons. British English. All internal links must use `import.meta.env.BASE_URL`.

---

## Prompt 25 — Rebuild Tiles Page with SEO Content

> Rebuild `src/pages/calculators/tiles/index.astro` with full SEO content. Use the content from `.agent/content/tiles-seo.md` **verbatim**.
>
> **Page structure:**
> 1. SEO head metadata
> 2. Breadcrumbs: Home > Calculators > Tile Quantity
> 3. H1, intro, disclaimer callout
> 4. Guidance section ("How to Calculate Tiles") with waste allowance table
> 5. **React island**: Update `TileCalculator.tsx` to add:
>    - Common tile size selector (import `COMMON_TILE_SIZES` from tiles module) with a custom size option
>    - Pack size input (optional)
>    - Show packs needed in results when pack size is provided
> 6. Tips section ("Tiling Tips") with 4 subsections
> 7. Related calculators
> 8. FAQ section (5 questions as toggle blocks) with `FAQPage` JSON-LD
> 9. Sources & further reading
>
> Use Tailwind CSS. Use Lucide icons. British English. All internal links must use `import.meta.env.BASE_URL`.

---

## Prompt 26 — Rebuild Adhesive Page with SEO Content

> Rebuild `src/pages/calculators/adhesive/index.astro` with full SEO content. Use the content from `.agent/content/adhesive-seo.md` **verbatim**.
>
> **Page structure:**
> 1. SEO head metadata
> 2. Breadcrumbs: Home > Calculators > Adhesive
> 3. H1, intro, disclaimer callout
> 4. Guidance section ("Choosing the Right Tile Adhesive") with 3 adhesive types
> 5. Bed thickness section with table
> 6. **React island**: Update `AdhesiveCalculator.tsx` to use the product-based API:
>    - Product dropdown (import `ADHESIVE_PRODUCTS` from adhesive module) — shows product name and bag size
>    - Application type toggle: "Dry Wall" / "Floor & Wet Areas" — selects dryWallRate or wetAreaRate from the product
>    - Area input (m²)
>    - Substrate dropdown (Even / Uneven)
>    - Wastage input (%, default 10)
>    - The component looks up coverageRate and bagSize from the selected product and passes them to `calculateAdhesive()`
>    - Results: kg needed, bags needed (showing bag size from product), coverage rate used
>    - Show "+20% for uneven substrate" note in results when applicable
> 7. Tips section with 4 subsections
> 8. Related calculators
> 9. FAQ section (5 questions) with `FAQPage` JSON-LD
> 10. Sources & further reading
>
> Use Tailwind CSS. Use Lucide icons. British English. All internal links must use `import.meta.env.BASE_URL`.

---

## Prompt 27 — Rebuild Grout Page with SEO Content

> Rebuild `src/pages/calculators/grout/index.astro` with full SEO content. Use the content from `.agent/content/grout-seo.md` **verbatim**.
>
> **Page structure:**
> 1. SEO head metadata
> 2. Breadcrumbs: Home > Calculators > Grout
> 3. H1, intro, disclaimer callout
> 4. Guidance section ("How Much Grout Do You Need?") with joint width guide table
> 5. Formula section with equation block
> 6. **React island**: Update `GroutCalculator.tsx` to:
>    - Remove bag size input
>    - Add joint width presets dropdown (import `COMMON_JOINT_WIDTHS`) with custom option
>    - Show bags for both 5 kg and 2.5 kg in results
>    - Show kg/m² rate in results
> 7. Tips section ("Grouting Tips") with 4 subsections
> 8. Related calculators
> 9. FAQ section (5 questions) with `FAQPage` JSON-LD
> 10. Sources & further reading
>
> Use Tailwind CSS. Use Lucide icons. British English. All internal links must use `import.meta.env.BASE_URL`.

---

## Prompt 28 — Rebuild Spacers Page with SEO Content

> Rebuild `src/pages/calculators/spacers/index.astro` with full SEO content. Use the content from `.agent/content/spacers-seo.md` **verbatim**.
>
> **Page structure:**
> 1. SEO head metadata
> 2. Breadcrumbs: Home > Calculators > Spacers
> 3. H1, intro, disclaimer callout
> 4. Guidance section ("Tile Spacers: Which Size and How Many?") with spacer size guide table
> 5. How it works section (2 paragraphs)
> 6. **React island**: Update `SpacerCalculator.tsx` (or create `SpacersCalculator.tsx`) to use the new area-based API:
>    - Area input (m²)
>    - Tile width and height inputs (mm)
>    - Spacer size dropdown (import `SPACER_SIZES`) — for display/info only, doesn't affect count
>    - Layout dropdown (Cross / T-junction)
>    - Wastage input (%, default 10)
>    - Results: spacers needed, packs of 100, packs of 250
> 7. Tips section with 4 subsections
> 8. Related calculators
> 9. FAQ section (5 questions) with `FAQPage` JSON-LD
> 10. Sources & further reading
>
> Use Tailwind CSS. Use Lucide icons. British English. All internal links must use `import.meta.env.BASE_URL`.

---

## Prompt 29 — Full Build & Verification

> Run the full test suite and build:
>
> 1. `npm test -- --run` — all tests must pass with zero failures
> 2. `npm run build` — must succeed with no errors
> 3. Verify all pages exist in the build output:
>    - `/index.html`
>    - `/calculators/index.html`
>    - `/calculators/tiles/index.html`
>    - `/calculators/adhesive/index.html`
>    - `/calculators/grout/index.html`
>    - `/calculators/spacers/index.html`
>    - `/calculators/conversions/index.html`
> 4. Verify each calculator page includes:
>    - `FAQPage` JSON-LD `<script>` tag
>    - Breadcrumb navigation
>    - Related calculators section
>    - Sources section
> 5. Verify no internal links point to pages that don't exist
>
> Fix any issues found. Do NOT modify test files.

---

# Phase 4 — Tiling Project Wizard

SEO content is in `.agent/content/tiling-project-seo.md`. Test file exists at `src/projects/tiling-suggestions.test.ts`. The tests define the expected data shape — implement to make them pass.

---

## Prompt 30 — Create Tiling Suggestions Data Module

> Create `src/projects/tiling-suggestions.ts`. Test file already exists at `src/projects/tiling-suggestions.test.ts`.
>
> **Export** a `TILING_SUGGESTIONS` array with this shape:
>
> ```typescript
> export interface TilingSuggestion {
>     item: string;
>     description: string;
> }
>
> export const TILING_SUGGESTIONS: TilingSuggestion[] = [
>     { item: 'Tile cutter (manual or electric)', description: 'Manual scores for straight cuts on ceramics. Electric wet cutter for porcelain, curves, and L-cuts.' },
>     { item: 'Spirit level', description: 'Check substrate is flat before tiling. BS 5385-3:2015 specifies max 3 mm deviation over 2 m for floors.' },
>     { item: 'Notched trowel', description: 'Applies adhesive at consistent depth. Notch size must match tile size (see adhesive step).' },
>     { item: 'Grout float', description: 'Rubber float pushes grout into joints at 45-degree angle.' },
>     { item: 'Sponge and bucket', description: 'Clean excess grout within 15–20 minutes before it hardens.' },
>     { item: 'Knee pads', description: 'Essential for floor tiling — you will be kneeling for hours.' },
>     { item: 'Tile primer', description: 'Required on dusty, porous, or painted substrates to ensure adhesive bonds. BAL and Mapei both recommend priming plasterboard.' },
>     { item: 'Waterproofing membrane', description: 'Tanking kit for shower enclosures, wet rooms, behind baths. Prevents water reaching the substrate.' },
>     { item: 'Silicone sealant', description: 'Flexible seal at perimeter joints (wall-to-floor, wall-to-bath). Movement joints must not be grouted — BS 5385-1:2009.' },
>     { item: 'Tile trim / edging strips', description: 'Finished edge where tiles meet walls, worktops, or change in flooring. Chrome, brushed steel, or PVC.' },
> ];
> ```
>
> Run `npm test -- --run src/projects/tiling-suggestions.test.ts` — all tests must pass. Do NOT modify the test file.

---

## Prompt 31 — Create TilingWizard React Component

> Create `src/components/TilingWizard.tsx` — a multi-step wizard that chains tiles → adhesive → grout → spacers with shared area input. Each step has guidance content above the calculator inputs. Use the content from `.agent/content/tiling-project-seo.md` for all guidance text.
>
> **Imports needed:**
> ```typescript
> import React, { useState, useCallback, useMemo } from 'react';
> import { FormInput, FormSelect } from './CalculatorLayout';
> import { calculateTiles, COMMON_TILE_SIZES } from '../calculators/tiles';
> import { calculateAdhesive, ADHESIVE_PRODUCTS } from '../calculators/adhesive';
> import { calculateGrout, COMMON_JOINT_WIDTHS } from '../calculators/grout';
> import { calculateSpacers, SPACER_SIZES } from '../calculators/spacers';
> import { TILING_SUGGESTIONS } from '../projects/tiling-suggestions';
> import type { TileResult, AdhesiveResult, GroutResult, SpacersResult } from '../calculators/types';
> ```
>
> **State model:**
> ```typescript
> // Navigation
> const [currentStep, setCurrentStep] = useState(1); // 1-6
>
> // Step 1 — Area
> const [roomLength, setRoomLength] = useState('');   // metres
> const [roomWidth, setRoomWidth] = useState('');     // metres
>
> // Step 2 — Tiles
> const [selectedTileSize, setSelectedTileSize] = useState('300x300');
> const [tileWidth, setTileWidth] = useState('300');   // mm
> const [tileHeight, setTileHeight] = useState('300'); // mm
> const [tileWastage, setTileWastage] = useState('10');
> const [packSize, setPackSize] = useState('');
>
> // Step 3 — Adhesive
> const [selectedProduct, setSelectedProduct] = useState(ADHESIVE_PRODUCTS[0].value);
> const [applicationType, setApplicationType] = useState<'dry' | 'wet'>('dry');
> const [substrate, setSubstrate] = useState('even');
> const [adhesiveWastage, setAdhesiveWastage] = useState('10');
>
> // Step 4 — Grout
> const [selectedJointWidth, setSelectedJointWidth] = useState('3');
> const [customJointWidth, setCustomJointWidth] = useState('');
> const [tileDepth, setTileDepth] = useState('8');
> const [groutWastage, setGroutWastage] = useState('10');
>
> // Step 5 — Spacers
> const [spacerSize, setSpacerSize] = useState('3');
> const [layout, setLayout] = useState('cross');
> const [spacerWastage, setSpacerWastage] = useState('10');
>
> // Results
> const [tileResult, setTileResult] = useState<TileResult | null>(null);
> const [adhesiveResult, setAdhesiveResult] = useState<AdhesiveResult | null>(null);
> const [groutResult, setGroutResult] = useState<GroutResult | null>(null);
> const [spacersResult, setSpacersResult] = useState<SpacersResult | null>(null);
> ```
>
> **Derived values:**
> ```typescript
> const area = useMemo(() => {
>     const l = parseFloat(roomLength);
>     const w = parseFloat(roomWidth);
>     return (l > 0 && w > 0) ? l * w : 0;
> }, [roomLength, roomWidth]);
>
> const product = useMemo(
>     () => ADHESIVE_PRODUCTS.find(p => p.value === selectedProduct) ?? ADHESIVE_PRODUCTS[0],
>     [selectedProduct],
> );
>
> const isCustomTileSize = selectedTileSize === 'custom';
> const isCustomJointWidth = selectedJointWidth === 'custom';
> const effectiveJointWidth = isCustomJointWidth ? customJointWidth : selectedJointWidth;
> ```
>
> **Tile size preset handler** (same pattern as TileCalculator):
> ```typescript
> function handleTileSizeChange(value: string) {
>     setSelectedTileSize(value);
>     if (value !== 'custom') {
>         const [w, h] = value.split('x');
>         setTileWidth(w);
>         setTileHeight(h);
>     }
> }
> ```
>
> **Step navigation:**
> - "Next" button calculates the current step and advances.
> - "Back" button goes to previous step (no recalculation).
> - When going back and changing values, downstream results are NOT automatically cleared — they recalculate when "Next" is clicked on that step again.
>
> **Step calculation on "Next":**
>
> ```typescript
> function handleNext() {
>     try {
>         if (currentStep === 1) {
>             // Just validate area > 0
>             if (area <= 0) return;
>         } else if (currentStep === 2) {
>             const ps = parseFloat(packSize);
>             const result = calculateTiles({
>                 areaWidth: parseFloat(roomLength),
>                 areaHeight: parseFloat(roomWidth),
>                 tileWidth: parseFloat(tileWidth),
>                 tileHeight: parseFloat(tileHeight),
>                 wastage: parseFloat(tileWastage),
>                 ...(ps > 0 ? { packSize: ps } : {}),
>             });
>             setTileResult(result);
>         } else if (currentStep === 3) {
>             const coverageRate = applicationType === 'dry' ? product.dryWallRate : product.wetAreaRate;
>             const result = calculateAdhesive({
>                 area,
>                 coverageRate,
>                 bagSize: product.bagSize,
>                 substrate: substrate as 'even' | 'uneven',
>                 wastage: parseFloat(adhesiveWastage),
>             });
>             setAdhesiveResult(result);
>         } else if (currentStep === 4) {
>             const result = calculateGrout({
>                 area,
>                 tileWidth: parseFloat(tileWidth),
>                 tileHeight: parseFloat(tileHeight),
>                 jointWidth: parseFloat(effectiveJointWidth),
>                 tileDepth: parseFloat(tileDepth),
>                 wastage: parseFloat(groutWastage),
>             });
>             setGroutResult(result);
>         } else if (currentStep === 5) {
>             const result = calculateSpacers({
>                 areaM2: area,
>                 tileWidthMm: parseFloat(tileWidth),
>                 tileHeightMm: parseFloat(tileHeight),
>                 layout: layout as 'cross' | 't-junction',
>                 wastage: parseFloat(spacerWastage),
>             });
>             setSpacersResult(result);
>         }
>         setCurrentStep((s) => Math.min(s + 1, 6));
>     } catch {
>         // Invalid input — stay on current step
>     }
> }
>
> function handleBack() {
>     setCurrentStep((s) => Math.max(s - 1, 1));
> }
> ```
>
> **UI structure:**
>
> ```tsx
> <div className="space-y-8">
>     {/* Step indicator */}
>     <div className="flex items-center gap-2">
>         {[1,2,3,4,5,6].map(step => (
>             <div key={step} className={`flex-1 h-2 rounded-full transition-colors ${
>                 step <= currentStep ? 'bg-brand-blue' : 'bg-muted/40'
>             }`} />
>         ))}
>     </div>
>     <p className="text-sm text-muted-foreground">
>         Step {currentStep} of 6 — {stepLabels[currentStep - 1]}
>     </p>
>
>     {/* Current step content */}
>     {currentStep === 1 && <StepArea />}
>     {currentStep === 2 && <StepTiles />}
>     {currentStep === 3 && <StepAdhesive />}
>     {currentStep === 4 && <StepGrout />}
>     {currentStep === 5 && <StepSpacers />}
>     {currentStep === 6 && <StepResults />}
>
>     {/* Navigation buttons */}
>     <div className="flex items-center gap-4 pt-4 border-t border-border">
>         {currentStep > 1 && (
>             <button type="button" onClick={handleBack}
>                 className="px-6 h-11 text-sm font-medium text-muted-foreground hover:text-surface-foreground border border-border rounded-[--radius-button] hover:bg-muted/30 transition-all focus-ring">
>                 Back
>             </button>
>         )}
>         {currentStep < 6 && (
>             <button type="button" onClick={handleNext}
>                 className="px-8 h-11 text-sm font-bold bg-brand-yellow text-brand-blue rounded-[--radius-button] shadow-sm hover:brightness-105 active:scale-[0.98] transition-all focus-ring ml-auto">
>                 Next
>             </button>
>         )}
>     </div>
> </div>
> ```
>
> **Step labels array:**
> ```typescript
> const stepLabels = ['Your area', 'Tiles', 'Adhesive', 'Grout', 'Spacers', 'Materials list'];
> ```
>
> **Each step structure:**
> Each step is rendered inline (not as separate components — keep it all in one file for simplicity). Each step has:
> 1. **Guidance section** — H2 heading, explanatory paragraphs with trade guidance. Use the verbatim text from `.agent/content/tiling-project-seo.md` for each step's guidance. Render as JSX with Tailwind classes. Use `<h2>`, `<p>`, `<strong>`, and `<ul>`/`<li>` as appropriate. Style guidance text with `text-muted-foreground text-sm leading-relaxed` for body, `text-surface-foreground font-semibold` for subheadings.
> 2. **Calculator form** — form inputs using `FormInput` and `FormSelect` from `CalculatorLayout`. Wrap in a card: `bg-white rounded-2xl border border-border shadow-sm p-6`. Auto-fill area (display as read-only info line) and tile dimensions where applicable.
>
> **Step 1 — Area:**
> - Guidance: H2 "Measuring Your Tiling Area" + paragraphs from content file
> - Form: two `FormInput` fields — Room length (metres) and Room width (metres) in a 2-column grid
> - Below form: show computed area as a prominent read-only display: `"{area.toFixed(2)} m²"`
>
> **Step 2 — Tiles:**
> - Guidance: H2 "Choosing the Right Tiles" + paragraphs from content file (floor vs wall, sizes, wastage, porcelain vs ceramic)
> - Form: Tile size preset `FormSelect` (COMMON_TILE_SIZES + Custom option), custom width/height when custom selected, wastage `FormInput`, pack size `FormInput` (optional)
> - Show auto-filled area as info line: "Area from Step 1: {area.toFixed(2)} m²"
>
> **Step 3 — Adhesive:**
> - Guidance: H2 "How Much Tile Adhesive Do You Need?" + paragraphs from content file
> - Form: Product `FormSelect` (ADHESIVE_PRODUCTS), application type toggle buttons (Dry Wall / Floor & Wet Areas — same pattern as AdhesiveCalculator.tsx), substrate `FormSelect` (Even/Uneven), wastage `FormInput`
> - Show: "Area: {area.toFixed(2)} m²", "Coverage rate: {rate} kg/m² ({product.bagSize} kg per unit)"
>
> **Step 4 — Grout:**
> - Guidance: H2 "How Much Grout Do You Need?" + paragraphs from content file
> - Form: Joint width `FormSelect` (COMMON_JOINT_WIDTHS + Custom option), custom joint width when custom selected, tile thickness `FormInput`, wastage `FormInput`
> - Show: "Area: {area.toFixed(2)} m²", "Tile size: {tileWidth} x {tileHeight} mm"
>
> **Step 5 — Spacers:**
> - Guidance: H2 "How Many Tile Spacers Do You Need?" + paragraphs from content file
> - Form: Spacer size `FormSelect` (SPACER_SIZES, display only), layout `FormSelect` (Cross/T-junction), wastage `FormInput`
> - Show: "Area: {area.toFixed(2)} m²", "Tile size: {tileWidth} x {tileHeight} mm"
>
> **Step 6 — Results Summary:**
> - H2 "Your Complete Tiling Materials List"
> - 4 result cards in a 2-column grid (mobile: 1 column). Each card:
>   - Icon (inline SVG), material name, quantities
>   - Tiles: "{tilesNeeded} tiles" + packs if applicable
>   - Adhesive: "{kgNeeded.toFixed(1)} kg — {bagsNeeded} x {product.bagSize} kg bags"
>   - Grout: "{kgNeeded.toFixed(1)} kg — {bags5kg} x 5 kg bags"
>   - Spacers: "{spacersNeeded} spacers — {packs100} packs of 100"
> - Below cards: "You might also need" section
>   - H3: "You Might Also Need"
>   - Render `TILING_SUGGESTIONS` as a styled list or table. Each row: item name (bold) + description. Use a clean card layout with alternating subtle backgrounds or a simple bordered table.
> - "Start over" button that resets all state and goes to Step 1
>
> **Styling:**
> - Use Tailwind CSS utilities matching the existing design system (brand-blue, brand-yellow, muted-foreground, surface-foreground, border, etc.)
> - Guidance sections: `space-y-3` with `text-sm text-muted-foreground leading-relaxed`
> - Cards: `bg-white rounded-2xl border border-border shadow-sm`
> - Use `focus-ring` utility class on all interactive elements
> - No emojis anywhere. Use Lucide-style inline SVG icons where needed.
>
> **Do NOT** create separate files for step sub-components. Keep everything in `TilingWizard.tsx`. Do NOT modify any test files or existing calculator logic files. Do NOT modify `CalculatorLayout.tsx`.

---

## Prompt 32 — Create Tiling Project Astro Page

> Create `src/pages/projects/tiling/index.astro`. This is the SEO-focused page wrapper for the tiling wizard. Use the content from `.agent/content/tiling-project-seo.md` **verbatim** for all copy.
>
> **Frontmatter:**
> ```astro
> ---
> import BaseLayout from '../../../layouts/BaseLayout.astro';
> import TilingWizard from '../../../components/TilingWizard';
>
> const base = import.meta.env.BASE_URL.replace(/\/$/, '') + '/';
>
> const faqs = [
>   {
>     question: 'How much tile adhesive do I need per square metre?',
>     answer: 'It depends on tile size and trowel notch depth. For small tiles (up to 300 x 300 mm) with a 6 mm notch, allow approximately 5 kg/m². For large format tiles (600 x 600 mm and above) with a 10–12 mm notch, allow 7–8 kg/m². Our calculator uses coverage rates from Selco-stocked products including Dunlop and Mapei.',
>   },
>   {
>     question: 'What is the difference between floor tiles and wall tiles?',
>     answer: 'Floor tiles are thicker, denser, and rated for foot traffic and slip resistance per BS 5385-3:2015. Wall tiles are thinner, lighter, and not designed to bear weight. Never use wall-only tiles on floors.',
>   },
>   {
>     question: 'What size spacers should I use?',
>     answer: 'Match your spacer size to the joint width you want. Use 2 mm for rectified tiles, 3 mm for standard wall tiles, 5 mm for floor tiles, and 10 mm for rustic or handmade tiles. BS 5385-1:2009 specifies minimum joint widths by tile type.',
>   },
>   {
>     question: 'How much wastage should I allow for tiling?',
>     answer: 'Allow 10% for straight layouts and up to 15% for diagonal or herringbone patterns. This covers cuts at edges, breakages during installation, and a few spares for future repairs. BS 5385-1:2009 recommends never ordering exact quantities.',
>   },
>   {
>     question: 'Do I need to prime before tiling?',
>     answer: 'Yes, in most cases. Priming ensures the adhesive bonds properly to the substrate. It is especially important on dusty, porous, or painted surfaces. Both BAL and Mapei recommend priming plasterboard before tiling.',
>   },
> ];
>
> const faqJsonLd = {
>   '@context': 'https://schema.org',
>   '@type': 'FAQPage',
>   mainEntity: faqs.map((faq) => ({
>     '@type': 'Question',
>     name: faq.question,
>     acceptedAnswer: { '@type': 'Answer', text: faq.answer },
>   })),
> };
>
> const howToJsonLd = {
>   '@context': 'https://schema.org',
>   '@type': 'HowTo',
>   name: 'How to Calculate Everything You Need for a Tiling Project',
>   description: 'Step-by-step guide to calculating tiles, adhesive, grout, and spacers for a floor or wall tiling project.',
>   step: [
>     { '@type': 'HowToStep', name: 'Measure your area', text: 'Measure the length and width of your room in metres and multiply to get the total area in square metres.' },
>     { '@type': 'HowToStep', name: 'Choose your tiles', text: 'Select your tile size and laying pattern. Add 10% waste for straight lay or 15% for diagonal patterns.' },
>     { '@type': 'HowToStep', name: 'Calculate adhesive', text: 'Choose your adhesive product and application type. Coverage rates are based on manufacturer technical data sheets.' },
>     { '@type': 'HowToStep', name: 'Calculate grout', text: 'Set your joint width and tile thickness to work out how many kilograms of grout you need.' },
>     { '@type': 'HowToStep', name: 'Calculate spacers', text: 'Choose your layout pattern (grid or brick bond) to calculate the number of spacers and packs needed.' },
>     { '@type': 'HowToStep', name: 'Review your materials list', text: 'See a complete summary of all materials with quantities, pack sizes, and suggestions for tools and accessories.' },
>   ],
> };
> ---
> ```
>
> **Page structure (inside `<BaseLayout>`):**
>
> 1. **JSON-LD** — Two `<script type="application/ld+json">` tags: one for `faqJsonLd`, one for `howToJsonLd`
>
> 2. **Container** — `<div class="container mx-auto px-4 pt-6 md:pt-10 pb-16">`
>
> 3. **Breadcrumbs** — `Home > Projects > Tiling` (same pattern as calculator pages):
>    ```html
>    Home / Projects / Tiling
>    ```
>    Links: Home → `{base}`, Projects → `{base}projects/`
>
> 4. **H1 & intro** — heading "Everything You Need for a Tiling Project", two intro paragraphs from the content file, then the "What you'll calculate" ordered list (6 items with bold step names), then the "Before you start" checklist (unordered list with 5 items)
>
> 5. **Disclaimer callout** — yellow background card with disclaimer text (same pattern as calculator pages)
>
> 6. **React island** — `<TilingWizard client:load />`
>
> 7. **FAQ section** — H2 "Frequently Asked Questions", then 5 `<details>/<summary>` toggle blocks using the `faqs` array. Same styling as existing calculator pages.
>
> 8. **Industry standards** — H2 "Industry Standards Referenced", bulleted list of BS 5385-1:2009, BS 5385-3:2015, BS EN 12004, BS EN ISO 10545-3 with descriptions
>
> 9. **Sources** — H2 "Sources & Further Reading", bulleted list: Mapei Technical Data Sheets, BAL Technical Guides, British Standards Institution, Tile Association
>
> **BaseLayout props:**
> ```
> title="Tiling Calculator | Everything You Need for a Tiling Project"
> description="Free tiling project calculator. Work out how many tiles, how much adhesive, grout, and spacers you need in one go. Includes wastage, pack sizes, and a full materials list."
> ```
>
> **Style all sections** to match the existing calculator pages (tiles, adhesive, etc.) — same typography, spacing, card styles, and Tailwind classes. Use British English. All internal links must use `import.meta.env.BASE_URL`. Do NOT modify any other files.

---

## Prompt 33 — Update Homepage & Projects Page Links

> Two link updates now that the tiling project page exists:
>
> **1. Homepage spotlight card** (`src/pages/index.astro`, around line 118-119)
>
> Change the spotlight `<a>` href from `${base}calculators/tiles/` to `${base}projects/tiling/`. Change the CTA text from "Start calculating" back to "Start project".
>
> **2. Projects page** (`src/pages/projects/index.astro`)
>
> Add a tiling project card above the empty state. The card should link to `${base}projects/tiling/` and look like:
> - Lucide `Layers` icon (same as homepage spotlight)
> - Title: "Tiling Project"
> - Description: "Calculate tiles, adhesive, grout, and spacers in one go."
> - Arrow icon on the right indicating a link
> - Card styling: `bg-surface rounded-[--radius-card] border border-border card-shadow hover:border-brand-blue/40` (same as homepage calculator cards)
>
> Keep the empty state section below but update its heading to "More projects coming soon" and description to "We're working on calculators for plumbing, painting, and more."
>
> Use `import.meta.env.BASE_URL` for all links. Only modify `index.astro` and `projects/index.astro`.

---

## Prompt 34 — Full Build & Verification

> Run the full test suite and build:
>
> 1. `npm test -- --run` — all tests must pass with zero failures (including the new `tiling-suggestions.test.ts`)
> 2. `npm run build` — must succeed with no errors
> 3. Verify the new page exists in the build output:
>    - `/projects/tiling/index.html`
> 4. Verify existing pages still exist:
>    - `/index.html`
>    - `/projects/index.html`
>    - `/calculators/index.html`
>    - `/calculators/tiles/index.html`
>    - `/calculators/adhesive/index.html`
>    - `/calculators/grout/index.html`
>    - `/calculators/spacers/index.html`
>    - `/calculators/conversions/index.html`
> 5. Verify the new tiling page includes:
>    - `HowTo` JSON-LD `<script>` tag
>    - `FAQPage` JSON-LD `<script>` tag
>    - Breadcrumb navigation
>    - FAQ toggle blocks
>    - Sources section
> 6. Verify the homepage spotlight links to `/selco/projects/tiling/`
> 7. Verify no internal links point to pages that don't exist
>
> Fix any issues found. Do NOT modify test files.
