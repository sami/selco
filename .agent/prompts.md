# Project Implementation Prompts

---

# Selco BW Demo - Project Lists Page

## Overview
Create a demo "Project Lists Explained" page styled to match Selco Builders Warehouse branding. This page showcases what a help/info section could look like on selcobw.com, featuring an embedded calculator for creating project material lists.

## Design System

**Colors:**
- Selco Yellow: `#FFCD00`
- Selco Blue: `#004B8D` (main branding)
- Selco Dark Blue: `#00264d` (top bar & footer)
- Selco Nav Blue: `#1b3a6e` (navigation bar)

**Typography:**
- Font stack: 'Open Sans', Helvetica, Arial, sans-serif
- Heavy headings: 'Arial Black' for page titles

---

## Prompt 1: Selco Layout Components

**Target Files:**
- `src/components/selco/SelcoHeader.astro`
- `src/components/selco/SelcoNav.astro`
- `src/components/selco/SelcoFooter.astro`
- `src/layouts/SelcoLayout.astro`

**Task:**
Create reusable Selco BW-branded layout components:

1. **SelcoHeader.astro**: Yellow header with logo, search bar, branches link, login button
2. **SelcoNav.astro**: Dark blue navigation bar with product categories (Building Materials, Timber & Joinery, etc.)
3. **SelcoFooter.astro**: Dark blue footer with links grid and prominent demo disclaimer
4. **SelcoLayout.astro**: Base layout combining all components with top bar, breadcrumbs support

**Requirements:**
- Responsive design (mobile-first)
- Non-functional nav links (demo only)
- Prominent "DEMO - Not affiliated with Selco BW" disclaimer in footer
- Match color scheme from design system

---

## Prompt 2: Project Lists Calculator Component

**Target File:** `src/components/selco/ProjectListsCalculator.tsx`

**Context:**
Interactive React component for the embedded project lists calculator with Selco branding.

**Features:**
- Yellow banner hero with calculator icon
- Add items with name, quantity, price
- Display items in table format
- Calculate and show running total
- Remove items functionality
- Styled with Selco colors

**State:**
```typescript
interface ListItem {
  name: string;
  qty: number;
  price: number;
  total: number;
}
```

---

## Prompt 3: Project Lists Page

**Target File:** `src/pages/info/help/project-lists.astro`

**Context:**
Main content page explaining Project Lists feature with embedded calculator.

**Structure:**
- Breadcrumbs: Home / Help Section / Project Lists
- Page Title: "PROJECT LISTS" (uppercase, heavy font)
- Sidebar: Customer Services menu with Project Lists active
- Main content:
  - Embedded calculator component
  - Hero text explaining the feature
  - "How do I create a Project List?" section
  - "What happens next?" section
  - "So, why use Project Lists?" bullet points
  - "Get Started" CTA button

**Layout:** Use SelcoLayout with sidebar support

---

## Prompt 4: Demo Disclaimer

**Requirements:**
Add prominent disclaimer to Selco-styled pages:

- Location: Above footer, in yellow promo section OR in footer
- Message: "⚠️ DEMO ONLY – Not affiliated with Selco Builders Warehouse. This is a demonstration calculator application."
- Styling: Amber/yellow background, dark text, border, prominent placement
- Ensure visibility on all screen sizes

---

# Masonry Calculator Implementation Prompts

## Prompt 1: Types & Interfaces

**Target File:** `src/calculators/types.ts`

**Context:**
We are implementing a masonry calculator. We need to update the types to support sand bag sizes and the new calculator inputs.

**Task:**
Update `src/calculators/types.ts` to include:
1. `SandBagSize` type alias.
2. Update `MasonryInput` to include `sandBagSize`.
3. Update `MortarResult` to include `sandKg`, `sandBags`, and `sandBagSizeKg`.

**Specification:**
```typescript
export type SandBagSize = 'jumbo' | 'large';

// Update MasonryInput
export interface MasonryInput {
    // ... existing fields ...
    sandBagSize: SandBagSize;
}

// Update MortarResult
export interface MortarResult {
    wetVolume: number;      // m³
    cementBags: number;
    sandTonnes: number;     // Keep for backward compatibility/reference
    sandKg: number;         // New
    sandBags: number;       // New: Math.ceil(sandKg / bagSizeKg)
    sandBagSizeKg: number;  // New: 875 or 35
}
```

**Validation:**
- `SandBagSize` should be exported.
- `MasonryInput` and `MortarResult` should strictly match the specification.

---

## Prompt 2: Wall Area

**Target File:** `src/calculators/masonry.ts`

**Context:**
Implement `calculateWallArea`.

**Function:**
```typescript
export function calculateWallArea(walls: WallSection[], openings: Opening[]): WallAreaResult
```

**Logic:**
1. `grossArea` = sum of (length * height) for all wall sections.
2. `openingArea` = sum of (width * height) for all openings.
3. `netArea` = max(0, `grossArea` - `openingArea`).

**Edge Cases:**
- Zero walls or empty array checks are handled by validation (but function should handle empty array gracefully or assume valid input based on types).
- Net area cannot be negative (use max(0, ...)).

**Example:**
Wall 5x2.4m (12m²). Opening 1.2x2.1m (2.52m²).
Gross = 12. Opening = 2.52. Net = 9.48.

---

## Prompt 3: Bricks

**Target File:** `src/calculators/masonry.ts`

**Context:**
Implement `calculateBricks`.

**Function:**
```typescript
export function calculateBricks(netArea: number, wallType: WallType, wastage: number): number
```

**Constants:**
- `unitsPerM2`:
    - 'half-brick': 60
    - 'one-brick': 120
    - 'cavity': 60 (outer leaf only)
    - 'blockwork': 0

**Logic:**
1. `baseBricks` = `netArea` * `unitsPerM2[wallType]`
2. `totalBricks` = `baseBricks` * (1 + `wastage` / 100)
3. Return `Math.ceil(totalBricks)`

**Example:**
Area 10m², half-brick (60/m²), 5% waste.
600 * 1.05 = 630.

---

## Prompt 4: Blocks

**Target File:** `src/calculators/masonry.ts`

**Context:**
Implement `calculateBlocks`.

**Function:**
```typescript
export function calculateBlocks(netArea: number, wallType: WallType, blockWidth: number, wastage: number): number
```

**Constants:**
- `blocksPerM2`:
    - 'blockwork': 10
    - 'cavity': 10 (inner leaf only)
    - 'half-brick': 0
    - 'one-brick': 0

**Logic:**
1. `baseBlocks` = `netArea` * `blocksPerM2[wallType]`
2. `totalBlocks` = `baseBlocks` * (1 + `wastage` / 100)
3. Return `Math.ceil(totalBlocks)`

**Example:**
Area 10m², blockwork, 5% waste.
100 * 1.05 = 105.

---

## Prompt 5: Mortar

**Target File:** `src/calculators/masonry.ts`

**Context:**
Implement `calculateMortar`. Note validation rule for sand bag size.

**Function:**
```typescript
// Update signature if needed to match usage
export function calculateMortar(netArea: number, wallType: WallType, mixRatio: MortarMixRatio, wastage: number, sandBagSize: SandBagSize): MortarResult
```
*Note to AI: You need to update the function signature in `masonry.ts` to accept `sandBagSize`.*

**Constants:**
- `MORTAR_PER_M2` (m³ wet mortar per m² wall) - **Update these values to match Spec:**
    - 'half-brick': 0.043
    - 'one-brick': 0.086
    - 'blockwork': 0.011 (assuming 100mm)
    - 'cavity': 0.054 (0.043 for brick + 0.011 for block)

**Logic:**
1. Determine `rate` per m2 based on `wallType`.
2. `wetVolume` = `netArea` * `rate` * (1 + `wastage`/100).
3. `dryVolume` = `wetVolume` * 1.33.
4. `ratio` parts: e.g. 1:4 -> 1 cement, 4 sand. Total parts = 5.
    - `cementVol` = `dryVolume` * (1/5).
    - `sandVol` = `dryVolume` * (4/5).
5. `cementKg` = `cementVol` * 1440. `cementBags` = ceil(`cementKg` / 25).
6. `sandKg` = `sandVol` * 1600.
7. `sandBagSizeKg` = `sandBagSize` === 'jumbo' ? 875 : 35.
8. `sandBags` = ceil(`sandKg` / `sandBagSizeKg`).
9. `sandTonnes` = `sandKg` / 1000.

**Example:**
10m2 half-brick (0.043 rate), 10% waste, 1:4 mix.
Wet = 10 * 0.043 * 1.1 = 0.473 m3.
Dry = 0.473 * 1.33 = 0.62909 m3.
Sand Vol = 0.62909 * 0.8 = 0.503272 m3.
Sand Kg = 0.503272 * 1600 = 805.2352 kg.
Jumbo bags = ceil(805/875) = 1.
Large bags = ceil(805/35) = 24. (23.006 -> 24).
Cement Vol = 0.125818 m3.
Cement Kg = 0.125818 * 1440 = 181.17 kg.
Cement Bags = ceil(181.17 / 25) = 8.

---

## Prompt 6: Wall Ties

**Target File:** `src/calculators/masonry.ts`

**Context:**
Implement `calculateWallTies`.

**Function:**
```typescript
export function calculateWallTies(netArea: number, openings: Opening[]): WallTiesResult
```
*Note: This helper only calculates the raw numbers based on area/openings. The caller (calculateMasonry) should invoke this only if wallType is cavity.* (Wait, prompt 6 in plan said "return 0 for others". Let's stick to the prompt being smart or the caller being smart. Plan Prompt 6 said: "If wallType !== cavity return 0". But the signature has no wallType! The caller must handle it or pass wallType. Let's update signature to include wallType or let Orchestrator handle logic).
*Decision*: Orchestrator handles the "is cavity" check. `calculateWallTies` just does the math. The inputs are NetArea and Openings.

**Logic:**
1. `tiesGeneral` = `Math.ceil(netArea * 2.5)`.
2. `tiesOpenings`:
    - For each opening, `perimeter` = 2 * (width + height).
    - `ties` = `Math.ceil(perimeter / 0.3)`. // 300mm spacing
    - Sum them up.
3. `total` = `tiesGeneral` + `tiesOpenings`.

**Example:**
10m2 net. 1 opening (1.2w x 2.1h).
General = ceil(25) = 25.
Opening perim = 2*(3.3) = 6.6m.
Opening ties = ceil(6.6 / 0.3) = 22.
Total = 47.

---

## Prompt 7: Lintels

**Target File:** `src/calculators/masonry.ts`

**Context:**
Implement `calculateLintels`.

**Function:**
```typescript
export function calculateLintels(openings: Opening[]): LintelResult[]
```

**Logic:**
Map each opening:
- `lintelLength` = `opening.width` * 1000 + 300. (150mm bearing each side).
- Return array of `{ width: opening.width, lintelLength }`.

---

## Prompt 8: DPC

**Target File:** `src/calculators/masonry.ts`

**Context:**
Implement `calculateDPC`.

**Function:**
```typescript
export function calculateDPC(walls: WallSection[], wallType: WallType, cavityWidth: number): DPCResult
```

**Logic:**
1. `length` = sum of `wall.length`.
2. `widthMm`:
    - 'half-brick': 102.5
    - 'one-brick': 215
    - 'blockwork': 100
    - 'cavity': 102.5 + cavityWidth + 100 (Total width: 202.5 + cavity)

---

## Prompt 9: Orchestrator

**Target File:** `src/calculators/masonry.ts`

**Context:**
Implement `calculateMasonry` orchestrator.

**Function:**
```typescript
export function calculateMasonry(input: MasonryInput): MasonryResult
```

**Logic:**
1. Validate inputs (waste 0-100, valid dimensions).
2. Call `calculateWallArea`.
3. Call `calculateBricks`.
4. Call `calculateBlocks` (pass blockWidth).
5. Call `calculateMortar` (pass sandBagSize).
6. Call `calculateWallTies` ONLY if wallType is cavity (or pass params so it returns 0? Prefer orchestrator check).
   - If wallType != 'cavity', ties = {0,0,0}.
   - Else call `calculateWallTies`.
7. Call `calculateLintels`.
8. Call `calculateDPC`.
9. Construct and return `MasonryResult`.

**Constants:**
- Export `SAND_BAG_SIZES` constant array:
```typescript
export const SAND_BAG_SIZES = [
  { value: 'jumbo', label: 'Jumbo Bag (875 kg)', kg: 875 },
  { value: 'large', label: 'Large Bag (35 kg)', kg: 35 },
];
```

---

## Prompt 10: React Component

**Target File:** `src/components/MasonryCalculator.tsx`

**Context:**
Update the React component to use the new inputs and display results.

**Task:**
- Add `Sand Bag Size` selector (Jumbo/Large).
- Update inputs to match `MasonryInput` type.
- Call `calculateMasonry` with inputs.
- Display results in the result card.
    - Show `sandBags` count and `sandBagSizeKg` in the label (e.g. "Building Soft Sand: 4 Jumbo Bags (0.41 tonnes)").
    - Show other results.
- Use Selco product names (e.g. "Building Soft Sand", "Cavity Wall Ties").

**Validation:**
- User can switch bag size and see result update.
- Inputs trigger recalculation.