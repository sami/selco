# TDD Rebuild: Ancillary Tiling Calculators (Backer Board, Tanking, SLC, Primer)

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix 20 outstanding TypeScript errors from the grout/spacers rebuild, then TDD rebuild backer-board, tanking, SLC, and primer calculators with product-ID lookup and manufacturer-accurate data.

**Architecture:** Each calculator follows the product-ID lookup pattern from adhesive/grout. Product data lives in `src/data/tiling-products.ts`. SLC is the parametric exception — depth + bag size inputs, fixed density constant. Consumer components are migrated to the new interfaces in the final task.

**Tech Stack:** TypeScript, Vitest, Astro + React (no DOM in Layer 1 calculators).

---

## Context

The grout/spacers TDD rebuild (Prompt 2) completed Layer 1 (calculators + tests), but Tasks 7–9 were deferred. There are currently **20 TypeScript errors** across:
- `src/calculators/index.ts` — exports deleted `calculateSpacersByCount`
- `src/components/GroutCalculator.tsx` — uses old `GroutInput/Result` fields
- `src/components/SpacersCalculator.tsx` — uses old `SpacersInput/Result` fields
- `src/components/TilingWizard.tsx` — uses old grout + spacers interfaces
- `src/components/TilingProjectWizard.tsx` — uses old grout interface + deleted `calculateSpacersByCount`

These must be fixed before the build can pass. This plan fixes them in Task 1, then adds the 4 new calculators in Tasks 2–7.

---

## Test Case Reference

### Backer Board
| TC | Product | Area | Waste | Board area | Boards | Packs |
|----|---------|------|-------|------------|--------|-------|
| 1 | HardieBacker 6mm | 12m² | 10% | 0.96m² | `ceil(13.2/0.96)=14` | — (sold individually) |
| 2 | Jackoboard Plano 6mm | 12m² | 10% | 0.72m² | `ceil(13.2/0.72)=19` | — |
| 3 | Flexel ECOMAX 6mm | 12m² | 10% | 0.72m² | 19 | `ceil(19/6)=4` |
| 4 | HardieBacker 12mm | 4m² | 5% | 0.96m² | `ceil(4.2/0.96)=5` | — |

### Tanking
| TC | Product | Area | kitsNeeded |
|----|---------|------|------------|
| 1 | Dunlop Shower Kit | 3.5m² | `ceil(3.5/3.5)=1` |
| 2 | Dunlop Shower Kit | 5m² | `ceil(5/3.5)=2` |
| 3 | Mapei Mapegum WPS | 3m² | `ceil(3/4)=1` |
| 4 | Mapei Mapegum WPS | 8m² | `ceil(8/4)=2` |

### SLC (density = 1.5 kg/litre; volumeLitres = areaM2 × depthMm)
| TC | Area | Depth | kgNeeded | bagsNeeded (25kg default) |
|----|------|-------|----------|--------------------------|
| 1 | 12m² | 3mm | 12×3×1.5=54 | `ceil(54/25)=3` |
| 2 | 5m² | 10mm | 5×10×1.5=75 | `ceil(75/25)=3` |
| 3 | 20m² | 1mm | 20×1×1.5=30 | `ceil(30/25)=2` |
| 4 | 0m² | 3mm | 0 | 0 (**no throw** — 0 is valid for UI) |

### Primer
| TC | Product | Area | Diluted | kgNeeded | packsNeeded |
|----|---------|------|---------|----------|-------------|
| 1 | Dunlop Multi-Purpose | 12m² | false (10 m²/kg) | 1.2 | `ceil(1.2/1)=2×1kg` |
| 2 | Dunlop Multi-Purpose | 12m² | true (20 m²/kg) | 0.6 | `ceil(0.6/1)=1×1kg` |
| 3 | Dunlop Bonding Agent | 20m² | false (12 m²/kg) | 1.667 | `ceil(1.667/5)=1×5kg` |
| 4 | Mapei Primer G | 12m² | false (5 m²/kg) | 2.4 | `ceil(2.4/5)=1×5kg` |

---

## Task 1: Fix grout/spacers integration (20 TypeScript errors)

**Files:**
- Modify: `src/calculators/index.ts`
- Modify: `src/components/GroutCalculator.tsx`
- Modify: `src/components/SpacersCalculator.tsx`
- Modify: `src/components/TilingWizard.tsx`
- Modify: `src/components/TilingProjectWizard.tsx`

### Step 1: Fix index.ts

Replace the spacers export block:
```typescript
// REMOVE:
export {
    SPACER_SIZES,
    SPACERS_PER_TILE_BY_PATTERN,
    calculateSpacers,
    calculateSpacersByCount,   // ← deleted from spacers.ts
} from './spacers';

// REPLACE WITH:
export {
    SPACER_SIZES,
    SPACERS_PER_TILE_BY_PATTERN,
    calculateSpacers,
} from './spacers';
```

Also add GROUT_PRODUCTS and SPACER_PRODUCTS re-exports (after the ADHESIVE_PRODUCTS line):
```typescript
export { ADHESIVE_PRODUCTS, GROUT_PRODUCTS, SPACER_PRODUCTS } from '../data/tiling-products';
```

### Step 2: Fix GroutCalculator.tsx

Full replacement of `src/components/GroutCalculator.tsx`:

```tsx
import React, { useState, useCallback, useMemo } from 'react';
import CalculatorLayout, {
    FormInput,
    FormSelect,
    type ResultItem,
    type FieldGroup,
} from './CalculatorLayout';
import { calculateGrout, COMMON_JOINT_WIDTHS } from '../calculators/grout';
import { GROUT_PRODUCTS } from '../data/tiling-products';

const CUSTOM_VALUE = 'custom';

const jointWidthOptions = [
    ...COMMON_JOINT_WIDTHS.map((j) => ({
        value: String(j.value),
        label: j.label,
    })),
    { value: CUSTOM_VALUE, label: 'Custom width…' },
];

const productOptions = GROUT_PRODUCTS.map((p) => ({
    value: p.id,
    label: `${p.brand} ${p.name}`,
}));

export default function GroutCalculator() {
    const [selectedProduct, setSelectedProduct] = useState(GROUT_PRODUCTS[0].id);
    const [area, setArea] = useState('');
    const [tileWidth, setTileWidth] = useState('300');
    const [tileHeight, setTileHeight] = useState('300');
    const [selectedJointWidth, setSelectedJointWidth] = useState('3');
    const [customJointWidth, setCustomJointWidth] = useState('');
    const [tileDepth, setTileDepth] = useState('8');
    const [results, setResults] = useState<ResultItem[]>([]);
    const [hasResults, setHasResults] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isCustomJoint = selectedJointWidth === CUSTOM_VALUE;
    const effectiveJointWidth = isCustomJoint ? customJointWidth : selectedJointWidth;

    const product = useMemo(
        () => GROUT_PRODUCTS.find(p => p.id === selectedProduct) ?? GROUT_PRODUCTS[0],
        [selectedProduct],
    );

    const validateInputs = () => {
        const a = parseFloat(area);
        const tw = parseFloat(tileWidth);
        const th = parseFloat(tileHeight);
        const jw = parseFloat(effectiveJointWidth);
        const td = parseFloat(tileDepth);

        if (isNaN(a) || a <= 0) return 'Total area must be a valid number greater than 0.';
        if (isNaN(tw) || tw <= 0) return 'Tile width must be a valid number greater than 0.';
        if (isNaN(th) || th <= 0) return 'Tile height must be a valid number greater than 0.';
        if (isNaN(jw) || jw <= 0) return 'Joint width must be a valid number greater than 0.';
        if (isNaN(td) || td <= 0) return 'Tile thickness must be a valid number greater than 0.';
        return null;
    };

    const handleCalculate = useCallback(() => {
        setError(null);
        const validationError = validateInputs();
        if (validationError) { setError(validationError); setHasResults(false); return; }

        try {
            const result = calculateGrout({
                areaM2: parseFloat(area),
                tileLengthMm: parseFloat(tileWidth),
                tileWidthMm: parseFloat(tileHeight),
                tileDepthMm: parseFloat(tileDepth),
                jointWidthMm: parseFloat(effectiveJointWidth),
                productId: selectedProduct,
            });
            const bagLabel = `${product.primaryBagSizeKg} kg bag`;
            setResults([
                { label: 'Grout needed', value: `${result.groutKg.toFixed(1)} kg`, primary: true },
                { label: `Bags needed (${bagLabel})`, value: `${result.bagsNeeded} bags`, primary: true },
                { label: 'Usage rate', value: `${result.coverageRateKgPerM2.toFixed(3)} kg/m²` },
                ...result.warnings.map(w => ({ label: '⚠ Note', value: w })),
            ]);
            setHasResults(true);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unexpected error occurred.');
            setHasResults(false);
        }
    }, [area, tileWidth, tileHeight, effectiveJointWidth, tileDepth, selectedProduct, product]);

    const handleReset = useCallback(() => {
        setSelectedProduct(GROUT_PRODUCTS[0].id);
        setArea('');
        setTileWidth('300');
        setTileHeight('300');
        setSelectedJointWidth('3');
        setCustomJointWidth('');
        setTileDepth('8');
        setResults([]);
        setHasResults(false);
        setError(null);
    }, []);

    const fieldGroups: FieldGroup[] = [
        {
            legend: 'Product',
            children: (
                <FormSelect
                    id="grout-product"
                    label="Grout product"
                    value={selectedProduct}
                    onChange={setSelectedProduct}
                    options={productOptions}
                />
            ),
        },
        {
            legend: 'Area to cover',
            children: (
                <FormInput
                    id="area"
                    label="Total area"
                    unit="m²"
                    value={area}
                    onChange={(v) => { setArea(v); setError(null); }}
                    placeholder="e.g. 12.5"
                    min={0.01}
                    step="0.01"
                    required
                />
            ),
        },
        {
            legend: 'Tile dimensions',
            children: (
                <div className="grid grid-cols-2 gap-4">
                    <FormInput
                        id="tile-width"
                        label="Tile width"
                        unit="mm"
                        value={tileWidth}
                        onChange={(v) => { setTileWidth(v); setError(null); }}
                        placeholder="e.g. 300"
                        min={1}
                        step={1}
                        required
                    />
                    <FormInput
                        id="tile-height"
                        label="Tile height"
                        unit="mm"
                        value={tileHeight}
                        onChange={(v) => { setTileHeight(v); setError(null); }}
                        placeholder="e.g. 300"
                        min={1}
                        step={1}
                        required
                    />
                </div>
            ),
        },
        {
            legend: 'Joint & tile details',
            children: (
                <div className="space-y-4">
                    <FormSelect
                        id="joint-width-preset"
                        label="Joint width"
                        value={selectedJointWidth}
                        onChange={setSelectedJointWidth}
                        options={jointWidthOptions}
                    />
                    {isCustomJoint && (
                        <FormInput
                            id="joint-width-custom"
                            label="Custom joint width"
                            unit="mm"
                            value={customJointWidth}
                            onChange={(v) => { setCustomJointWidth(v); setError(null); }}
                            placeholder="e.g. 4"
                            min={0.5}
                            step={0.5}
                            required
                        />
                    )}
                    <FormInput
                        id="tile-depth"
                        label="Tile thickness"
                        unit="mm"
                        value={tileDepth}
                        onChange={(v) => { setTileDepth(v); setError(null); }}
                        placeholder="e.g. 8"
                        min={1}
                        step={1}
                        required
                    />
                </div>
            ),
        },
    ];

    return (
        <CalculatorLayout
            title="Grout Calculator"
            description="Work out how much grout you need for your tiling project."
            fieldGroups={fieldGroups}
            results={results}
            hasResults={hasResults}
            onCalculate={handleCalculate}
            onReset={handleReset}
            error={error}
        />
    );
}
```

### Step 3: Fix SpacersCalculator.tsx

Full replacement of `src/components/SpacersCalculator.tsx`:

```tsx
import React, { useState, useCallback } from 'react';
import CalculatorLayout, {
    FormInput,
    FormSelect,
    type ResultItem,
    type FieldGroup,
} from './CalculatorLayout';
import { calculateSpacers, SPACER_SIZES, SPACERS_PER_TILE_BY_PATTERN } from '../calculators/spacers';
import type { LayingPattern } from '../calculators/types';

const spacerSizeOptions = SPACER_SIZES.map((s) => ({
    value: String(s.value),
    label: s.label,
}));

const layoutOptions: { value: LayingPattern; label: string }[] = [
    { value: 'straight',    label: `Straight — ${SPACERS_PER_TILE_BY_PATTERN['straight']} per tile` },
    { value: 'brick-bond',  label: `Brick bond — ${SPACERS_PER_TILE_BY_PATTERN['brick-bond']} per tile` },
    { value: 'diagonal',    label: `Diagonal — ${SPACERS_PER_TILE_BY_PATTERN['diagonal']} per tile` },
    { value: 'herringbone', label: `Herringbone — ${SPACERS_PER_TILE_BY_PATTERN['herringbone']} per tile` },
];

export default function SpacersCalculator() {
    const [area, setArea] = useState('');
    const [tileWidth, setTileWidth] = useState('300');
    const [tileHeight, setTileHeight] = useState('300');
    const [spacerSize, setSpacerSize] = useState('3');
    const [layout, setLayout] = useState<LayingPattern>('straight');
    const [wastage, setWastage] = useState('10');
    const [packSize, setPackSize] = useState('250');
    const [results, setResults] = useState<ResultItem[]>([]);
    const [hasResults, setHasResults] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const validateInputs = () => {
        const a = parseFloat(area);
        const w = parseFloat(wastage);
        const tw = parseFloat(tileWidth);
        const th = parseFloat(tileHeight);

        if (isNaN(a) || a <= 0) return 'Total area must be a valid number greater than 0.';
        if (isNaN(tw) || tw <= 0) return 'Tile width must be a valid number greater than 0.';
        if (isNaN(th) || th <= 0) return 'Tile height must be a valid number greater than 0.';
        if (isNaN(w) || w < 0 || w > 100) return 'Wastage must be between 0 and 100%.';
        return null;
    };

    const handleCalculate = useCallback(() => {
        setError(null);
        const validationError = validateInputs();
        if (validationError) { setError(validationError); setHasResults(false); return; }

        try {
            const tw = parseFloat(tileWidth);
            const th = parseFloat(tileHeight);
            const tileAreaM2 = (tw / 1000) * (th / 1000);
            const wa = parseFloat(wastage);
            const tilesNeeded = Math.ceil((parseFloat(area) / tileAreaM2) * (1 + wa / 100));
            const ps = parseInt(packSize, 10);

            const result = calculateSpacers({
                tilesNeeded,
                spacerSizeMm: parseFloat(spacerSize),
                layingPattern: layout,
                packSize: ps > 0 ? ps : 250,
            });

            setResults([
                { label: 'Spacers needed', value: `${result.spacersNeeded} × ${spacerSize} mm spacers`, primary: true },
                { label: `Packs needed (${packSize} per pack)`, value: `${result.packsNeeded} packs`, primary: true },
                { label: 'Per tile', value: `${result.spacersPerTile} spacers per tile` },
            ]);
            setHasResults(true);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unexpected error occurred.');
            setHasResults(false);
        }
    }, [area, tileWidth, tileHeight, layout, wastage, spacerSize, packSize]);

    const handleReset = useCallback(() => {
        setArea('');
        setTileWidth('300');
        setTileHeight('300');
        setSpacerSize('3');
        setLayout('straight');
        setWastage('10');
        setPackSize('250');
        setResults([]);
        setHasResults(false);
        setError(null);
    }, []);

    const fieldGroups: FieldGroup[] = [
        {
            legend: 'Area to cover',
            children: (
                <FormInput
                    id="area"
                    label="Total area"
                    unit="m²"
                    value={area}
                    onChange={(v) => { setArea(v); setError(null); }}
                    placeholder="e.g. 12.5"
                    min={0.01}
                    step="0.01"
                    required
                />
            ),
        },
        {
            legend: 'Tile dimensions',
            children: (
                <div className="grid grid-cols-2 gap-4">
                    <FormInput
                        id="tile-width"
                        label="Tile width"
                        unit="mm"
                        value={tileWidth}
                        onChange={(v) => { setTileWidth(v); setError(null); }}
                        placeholder="e.g. 300"
                        min={1}
                        step={1}
                        required
                    />
                    <FormInput
                        id="tile-height"
                        label="Tile height"
                        unit="mm"
                        value={tileHeight}
                        onChange={(v) => { setTileHeight(v); setError(null); }}
                        placeholder="e.g. 300"
                        min={1}
                        step={1}
                        required
                    />
                </div>
            ),
        },
        {
            legend: 'Spacer & layout',
            children: (
                <div className="space-y-4">
                    <FormSelect
                        id="spacer-size"
                        label="Spacer size"
                        value={spacerSize}
                        onChange={setSpacerSize}
                        options={spacerSizeOptions}
                    />
                    <FormSelect
                        id="layout"
                        label="Layout pattern"
                        value={layout}
                        onChange={(v) => setLayout(v as LayingPattern)}
                        options={layoutOptions}
                    />
                </div>
            ),
        },
        {
            legend: 'Options',
            children: (
                <div className="space-y-4">
                    <FormInput
                        id="wastage"
                        label="Wastage allowance"
                        unit="%"
                        value={wastage}
                        onChange={(v) => { setWastage(v); setError(null); }}
                        placeholder="e.g. 10"
                        min={0}
                        max={50}
                        step={1}
                    />
                    <FormInput
                        id="pack-size"
                        label="Pack size"
                        unit="spacers"
                        value={packSize}
                        onChange={(v) => { setPackSize(v); setError(null); }}
                        placeholder="e.g. 250"
                        min={1}
                        step={1}
                    />
                </div>
            ),
        },
    ];

    return (
        <CalculatorLayout
            title="Spacers Calculator"
            description="Calculate how many tile spacers you need for your project."
            fieldGroups={fieldGroups}
            results={results}
            hasResults={hasResults}
            onCalculate={handleCalculate}
            onReset={handleReset}
            error={error}
        />
    );
}
```

### Step 4: Fix TilingWizard.tsx

Make these targeted edits (do NOT rewrite the whole file):

**a) Add GROUT_PRODUCTS import** (add to existing import line 5):
```typescript
import { ADHESIVE_PRODUCTS, GROUT_PRODUCTS } from '../data/tiling-products';
```

**b) Add selectedGroutProduct state** (after the groutWastage state, ~line 48):
```typescript
const [selectedGroutProduct, setSelectedGroutProduct] = useState(GROUT_PRODUCTS[0].id);
```

**c) Replace the grout call** (lines 114–122):
```typescript
} else if (currentStep === 4) {
    const result = calculateGrout({
        areaM2: area,
        tileLengthMm: parseFloat(tileWidth),
        tileWidthMm: parseFloat(tileHeight),
        tileDepthMm: parseFloat(tileDepth),
        jointWidthMm: parseFloat(effectiveJointWidth),
        productId: selectedGroutProduct,
    });
    setGroutResult(result);
```

**d) Replace the spacers call** (lines 123–132):
```typescript
} else if (currentStep === 5) {
    const result = calculateSpacers({
        tilesNeeded: tileResult?.tilesNeeded ?? 0,
        spacerSizeMm: parseFloat(spacerSize),
        layingPattern: layout === 'cross' ? 'straight' : 'brick-bond' as import('../calculators/types').LayingPattern,
        packSize: 250,
    });
    setSpacersResult(result);
```

**e) Fix grout display** (line 499):
```typescript
<p className="text-2xl font-bold text-surface-foreground mt-1">{groutResult?.groutKg.toFixed(1)} kg</p>
```

**f) Fix grout bags display** (line 504):
```typescript
{groutResult?.bagsNeeded} bags
```

**g) Fix spacers packs display** (line 516):
```typescript
{spacersResult?.packsNeeded} x packs
```

**h) Add selectedGroutProduct to dependency array** (~line 140):
Add `selectedGroutProduct` to the handleNext `useCallback` deps array.

**i) Add selectedGroutProduct to handleReset** (~line 148):
```typescript
setSelectedGroutProduct(GROUT_PRODUCTS[0].id);
```

**j) Add grout product selector to Step 4 JSX** (before the joint width selector):
The exact JSX location requires reading the file to find the step 4 section. After the step 4 heading, add:
```tsx
<FormSelect
    id="grout-product"
    label="Grout product"
    value={selectedGroutProduct}
    onChange={setSelectedGroutProduct}
    options={GROUT_PRODUCTS.map(p => ({ value: p.id, label: `${p.brand} ${p.name}` }))}
/>
```

### Step 5: Fix TilingProjectWizard.tsx

Make these targeted edits:

**a) Fix imports** (line 6):
```typescript
// REMOVE:
import { calculateSpacersByCount } from '../calculators/spacers';
// ADD:
import { calculateSpacers } from '../calculators/spacers';
// ADD after line 11:
import { GROUT_PRODUCTS } from '../data/tiling-products';
```

**b) Add selectedGroutProduct state** (after groutWastage state ~line 98):
```typescript
const [selectedGroutProduct, setSelectedGroutProduct] = useState(GROUT_PRODUCTS[0].id);
```

**c) Replace groutMetrics useMemo** (lines 251–279):
```typescript
const groutMetrics = useMemo(() => {
    const wastage = toNumber(groutWastage);
    const bag = toNumber(groutBagSize);
    if (areaM2 <= 0 || toNumber(tileWidth) <= 0 || toNumber(tileHeight) <= 0 ||
        toNumber(gapWidth) <= 0 || toNumber(tileDepth) <= 0) {
        return { kgNeeded: 0, kgWithWastage: 0, bagsNeeded: 0, kgPerSqm: 0 };
    }
    try {
        const result = calculateGrout({
            areaM2,
            tileLengthMm: toNumber(tileWidth),
            tileWidthMm: toNumber(tileHeight),
            tileDepthMm: toNumber(tileDepth),
            jointWidthMm: toNumber(gapWidth),
            productId: selectedGroutProduct,
            applicationContext: application === 'floor' ? 'floor-dry' : 'wall-dry',
        });
        const kgWithWastage = wastage > 0 ? result.groutKg * (1 + wastage / 100) : result.groutKg;
        return {
            kgPerSqm: result.coverageRateKgPerM2,
            kgNeeded: result.groutKg,
            kgWithWastage,
            bagsNeeded: bag > 0 ? Math.ceil(kgWithWastage / bag) : result.bagsNeeded,
        };
    } catch {
        return { kgNeeded: 0, kgWithWastage: 0, bagsNeeded: 0, kgPerSqm: 0 };
    }
}, [tileWidth, tileHeight, gapWidth, tileDepth, groutBagSize, groutWastage, areaM2, selectedGroutProduct, application]);
```

**d) Replace spacerMetrics useMemo** (lines 281–295):
```typescript
const spacerMetrics = useMemo(() => {
    const perPack = toNumber(spacersPerPack);
    if (tileMetrics.tilesWithWastage <= 0 || perPack <= 0) {
        return { totalSpacers: 0, packsNeeded: 0, spacersPerTile: 0 };
    }
    try {
        const result = calculateSpacers({
            tilesNeeded: tileMetrics.tilesWithWastage,
            spacerSizeMm: 3,
            layingPattern: PATTERN_TO_LAYING[pattern],
            packSize: perPack,
        });
        return {
            totalSpacers: result.spacersNeeded,
            packsNeeded: result.packsNeeded,
            spacersPerTile: result.spacersPerTile,
        };
    } catch {
        return { totalSpacers: 0, packsNeeded: 0, spacersPerTile: 0 };
    }
}, [spacersPerPack, pattern, tileMetrics.tilesWithWastage]);
```

### Step 6: Run tsc to verify zero errors

```bash
/usr/local/bin/node node_modules/.bin/tsc --noEmit 2>&1 | grep "error TS" | grep -v "astro.config\|vitest.config"
```
Expected: no output.

### Step 7: Commit

```bash
git add src/calculators/index.ts \
  src/components/GroutCalculator.tsx \
  src/components/SpacersCalculator.tsx \
  src/components/TilingWizard.tsx \
  src/components/TilingProjectWizard.tsx
git commit -m "fix(grout/spacers): migrate consumer components + fix index.ts exports (Tasks 7–8 of grout plan)"
```

---

## Task 2: Add product types + data for 4 ancillary calculators

**Files:**
- Modify: `src/calculators/types.ts`
- Modify: `src/data/tiling-products.ts`

### Step 1: Add 4 product interfaces to types.ts (after SpacerProduct, ~line 79)

```typescript
export interface BackerBoardProduct {
    id: string;
    name: string;
    brand: string;
    boardLengthMm: number;
    boardWidthMm: number;
    thicknessMm: number;
    /** If undefined, product is sold individually. */
    boardsPerPack?: number;
    maxTileWeightKgM2?: number;
    /** e.g. ['Do NOT mechanically fix'] */
    notes?: string[];
}

export interface TankingProduct {
    id: string;
    name: string;
    brand: string;
    coverageM2PerKit: number;
    coats: number;
    dryTimeHours: number;
    kitContentsDescription?: string;
    notes: string[];
}

export interface SLCProduct {
    id: string;
    name: string;
    brand: string;
    bagSizeKg: number;
    /** Fixed density: 1.5 kg/litre for all standard SLC products. */
    densityKgPerL: number;
}

export interface PrimerProduct {
    id: string;
    name: string;
    brand: string;
    /** Coverage at standard (undiluted/neat) application in m²/kg. */
    coverageM2PerKg: number;
    /** Coverage at diluted application (e.g. 1:1 with water) in m²/kg. */
    dilutedCoverageM2PerKg?: number;
    dilutionRatio?: string;     // e.g. '1:1'
    packSizes: number[];        // kg — all available sizes
    primaryPackSizeKg: number;
    notes?: string[];
}
```

### Step 2: Update BackerBoardInput/Result, TankingInput/Result, SLCInput/Result, PrimerInput/Result in types.ts

**Replace BackerBoardInput + BackerBoardResult** (~lines 186–200):
```typescript
export interface BackerBoardInput {
    areaM2: number;
    productId: string;
    /** Wastage percentage — defaults to 10 if omitted. */
    wastePercent?: number;
}

export interface BackerBoardResult {
    boardsNeeded: number;
    /** Only present for products sold in packs (e.g. Flexel ECOMAX). */
    packsNeeded?: number;
    boardAreaM2: number;
    productName: string;
    materials: MaterialQuantity[];
    warnings: string[];
}
```

**Replace TankingInput + TankingResult** (~lines 235–250):
```typescript
export interface TankingInput {
    areaM2: number;
    productId: string;
}

export interface TankingResult {
    kitsNeeded: number;
    coveragePerKit: number;
    productName: string;
    materials: MaterialQuantity[];
    notes: string[];
}
```

**Replace SLCInput + SLCResult** (~lines 252–270):
```typescript
/** Fixed density constant used for all SLC products: 1.5 kg per litre. */
export const SLC_DENSITY_KG_PER_L = 1.5;

export interface SLCInput {
    areaM2: number;
    depthMm: number;
    /** Bag size in kg — defaults to 25 if omitted. */
    bagSizeKg?: number;
}

export interface SLCResult {
    /** Total kg of SLC required (no wastage — depth handles variation). */
    kgNeeded: number;
    bagsNeeded: number;
    /** Volume of compound in litres (areaM2 × depthMm). */
    volumeLitres: number;
    /** Coverage per bag in m² at the specified depth. */
    coverageAtDepthM2PerBag: number;
}
```

**Replace PrimerInput + PrimerResult** (~lines 202–215):
```typescript
export interface PrimerInput {
    areaM2: number;
    productId: string;
    /** Number of coats — defaults to 1 if omitted. */
    coats?: number;
    /** Apply diluted coverage rate (e.g. 1:1 with water) — defaults to false. */
    diluted?: boolean;
}

export interface PrimerResult {
    kgNeeded: number;
    packsNeeded: number;
    coverageRateUsed: number;   // m²/kg actually applied
    productName: string;
    materials: MaterialQuantity[];
}
```

### Step 3: Add 4 product arrays to tiling-products.ts

Append at end of file (after SPACER_PRODUCTS):

```typescript
import type { AdhesiveProduct, GroutProduct, SpacerProduct,
  BackerBoardProduct, TankingProduct, SLCProduct, PrimerProduct } from '../calculators/types';

// ... (existing ADHESIVE_PRODUCTS, GROUT_PRODUCTS, SPACER_PRODUCTS) ...

export const BACKER_BOARD_PRODUCTS: BackerBoardProduct[] = [
    {
        id: 'hardiebacker-6mm',
        name: 'HardieBacker 6mm',
        brand: 'James Hardie',
        boardLengthMm: 1200,
        boardWidthMm: 800,
        thicknessMm: 6,
        maxTileWeightKgM2: 200,
    },
    {
        id: 'hardiebacker-12mm',
        name: 'HardieBacker 12mm',
        brand: 'James Hardie',
        boardLengthMm: 1200,
        boardWidthMm: 800,
        thicknessMm: 12,
        maxTileWeightKgM2: 200,
    },
    {
        id: 'jackoboard-plano-6mm',
        name: 'Jackoboard Plano 6mm',
        brand: 'Jackon',
        boardLengthMm: 1200,
        boardWidthMm: 600,
        thicknessMm: 6,
        maxTileWeightKgM2: 100,
    },
    {
        id: 'jackoboard-plano-12mm',
        name: 'Jackoboard Plano 12mm',
        brand: 'Jackon',
        boardLengthMm: 1200,
        boardWidthMm: 600,
        thicknessMm: 12,
        maxTileWeightKgM2: 100,
    },
    {
        id: 'flexel-ecomax-6mm',
        name: 'Flexel ECOMAX 6mm',
        brand: 'Flexel',
        boardLengthMm: 1200,
        boardWidthMm: 600,
        thicknessMm: 6,
        boardsPerPack: 6,
        notes: ['Do NOT mechanically fix — bond only'],
    },
    {
        id: 'flexel-ecomax-10mm',
        name: 'Flexel ECOMAX 10mm',
        brand: 'Flexel',
        boardLengthMm: 1200,
        boardWidthMm: 600,
        thicknessMm: 10,
        boardsPerPack: 6,
        notes: ['Do NOT mechanically fix — bond only'],
    },
];

export const TANKING_PRODUCTS: TankingProduct[] = [
    {
        id: 'mapei-mapegum-wps',
        name: 'Mapegum WPS Kit',
        brand: 'Mapei',
        coverageM2PerKit: 4,
        coats: 2,
        dryTimeHours: 2,
        kitContentsDescription: 'Primer 0.5kg + membrane 5kg + tape 10m',
        notes: ['2 coats required', 'Allow 2h between coats', 'Tile after 12–24h'],
    },
    {
        id: 'dunlop-shower-waterproofing-kit',
        name: 'Shower Waterproofing Kit',
        brand: 'Dunlop',
        coverageM2PerKit: 3.5,
        coats: 2,
        dryTimeHours: 3,
        notes: ['2 coats required', 'Allow 3h between coats', 'Tile after 24h'],
    },
];

export const SLC_PRODUCTS: SLCProduct[] = [
    {
        id: 'mapei-ultraplan',
        name: 'Ultraplan',
        brand: 'Mapei',
        bagSizeKg: 25,
        densityKgPerL: 1.5,
    },
    {
        id: 'dunlop-level-it',
        name: 'Level IT',
        brand: 'Dunlop',
        bagSizeKg: 25,
        densityKgPerL: 1.5,
    },
];

export const PRIMER_PRODUCTS: PrimerProduct[] = [
    {
        id: 'mapei-primer-g',
        name: 'Primer G',
        brand: 'Mapei',
        coverageM2PerKg: 5,
        packSizes: [1, 5],
        primaryPackSizeKg: 5,
    },
    {
        id: 'dunlop-multi-purpose-primer',
        name: 'Multi-Purpose Primer',
        brand: 'Dunlop',
        coverageM2PerKg: 10,
        dilutedCoverageM2PerKg: 20,
        dilutionRatio: '1:1',
        packSizes: [1],
        primaryPackSizeKg: 1,
        notes: ['Can be diluted 1:1 with water for non-porous substrates'],
    },
    {
        id: 'dunlop-universal-bonding-agent',
        name: 'Universal Bonding Agent',
        brand: 'Dunlop',
        coverageM2PerKg: 12,
        dilutedCoverageM2PerKg: 3,
        dilutionRatio: 'neat:slurry',
        packSizes: [5],
        primaryPackSizeKg: 5,
        notes: ['Slurry application: mix 1:1 with water + cement for 3 m²/kg'],
    },
];
```

Note: Update the import line at the top of tiling-products.ts to include the 4 new types.

### Step 4: Run tsc — expect errors (calculators + TilingProjectWizard use old interfaces)

```bash
/usr/local/bin/node node_modules/.bin/tsc --noEmit 2>&1 | grep "error TS" | grep -v "astro.config\|vitest.config" | head -20
```

Expected: errors in `backer-board.ts`, `tanking.ts`, `slc.ts`, `primer.ts`, and `TilingProjectWizard.tsx`.

### Step 5: Commit

```bash
git add src/calculators/types.ts src/data/tiling-products.ts
git commit -m "feat(tiling): add BackerBoard/Tanking/SLC/Primer product types + catalogue data"
```

---

## Task 3: TDD rebuild backer-board (RED → GREEN)

**Files:**
- Delete: `src/calculators/backer-board.test.ts`
- Create: `src/calculators/__tests__/backer-board.test.ts`
- Replace: `src/calculators/backer-board.ts`

### Step 1: Delete old test file

```bash
rm src/calculators/backer-board.test.ts
```

### Step 2: Create new test file (RED)

Create `src/calculators/__tests__/backer-board.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { calculateBackerBoard } from '../backer-board';
import type { BackerBoardInput } from '../types';

// Formula: boardsNeeded = ceil(areaM2 × (1 + wastePercent/100) / boardAreaM2)
// packsNeeded = ceil(boardsNeeded / boardsPerPack)  — Flexel only (boardsPerPack=6)
// Default wastePercent = 10

describe('calculateBackerBoard — spec test cases', () => {

    it('TC1: HardieBacker 6mm, 12m², 10% waste → 14 boards (sold individually)', () => {
        // areaWithWaste = 12 × 1.1 = 13.2
        // boardArea = 1.2 × 0.8 = 0.96 m²
        // boards = ceil(13.2 / 0.96) = ceil(13.75) = 14
        const r = calculateBackerBoard({ areaM2: 12, productId: 'hardiebacker-6mm', wastePercent: 10 });
        expect(r.boardsNeeded).toBe(14);
        expect(r.boardAreaM2).toBeCloseTo(0.96, 4);
        expect(r.productName).toBe('HardieBacker 6mm');
        expect(r.packsNeeded).toBeUndefined();
        expect(r.warnings).toHaveLength(0);
        expect(r.materials).toHaveLength(1);
    });

    it('TC2: Jackoboard Plano 6mm, 12m², 10% waste → 19 boards', () => {
        // boardArea = 1.2 × 0.6 = 0.72 m²
        // boards = ceil(13.2 / 0.72) = ceil(18.33) = 19
        const r = calculateBackerBoard({ areaM2: 12, productId: 'jackoboard-plano-6mm', wastePercent: 10 });
        expect(r.boardsNeeded).toBe(19);
        expect(r.boardAreaM2).toBeCloseTo(0.72, 4);
        expect(r.packsNeeded).toBeUndefined();
    });

    it('TC3: Flexel ECOMAX 6mm, 12m², 10% waste → 19 boards → 4 packs', () => {
        // boards = ceil(13.2 / 0.72) = 19
        // packs = ceil(19 / 6) = ceil(3.167) = 4
        const r = calculateBackerBoard({ areaM2: 12, productId: 'flexel-ecomax-6mm', wastePercent: 10 });
        expect(r.boardsNeeded).toBe(19);
        expect(r.packsNeeded).toBe(4);
    });

    it('TC4: HardieBacker 12mm, 4m², 5% waste → 5 boards', () => {
        // areaWithWaste = 4 × 1.05 = 4.2
        // boards = ceil(4.2 / 0.96) = ceil(4.375) = 5
        const r = calculateBackerBoard({ areaM2: 4, productId: 'hardiebacker-12mm', wastePercent: 5 });
        expect(r.boardsNeeded).toBe(5);
    });

    it('default wastePercent = 10 when omitted', () => {
        const explicit = calculateBackerBoard({ areaM2: 12, productId: 'hardiebacker-6mm', wastePercent: 10 });
        const defaulted = calculateBackerBoard({ areaM2: 12, productId: 'hardiebacker-6mm' });
        expect(defaulted.boardsNeeded).toBe(explicit.boardsNeeded);
    });

    it('Flexel warnings include "Do NOT mechanically fix"', () => {
        const r = calculateBackerBoard({ areaM2: 5, productId: 'flexel-ecomax-6mm' });
        expect(r.warnings.length).toBeGreaterThan(0);
        expect(r.warnings[0].toLowerCase()).toContain('fix');
    });
});

describe('calculateBackerBoard — validation', () => {
    const base: BackerBoardInput = { areaM2: 10, productId: 'hardiebacker-6mm' };

    it('throws for unknown productId', () => {
        expect(() => calculateBackerBoard({ ...base, productId: 'does-not-exist' })).toThrow();
    });

    it('throws for zero area', () => {
        expect(() => calculateBackerBoard({ ...base, areaM2: 0 })).toThrow();
    });

    it('throws for negative area', () => {
        expect(() => calculateBackerBoard({ ...base, areaM2: -1 })).toThrow();
    });
});
```

### Step 3: Run to confirm RED

```bash
/usr/local/bin/node node_modules/.bin/vitest run src/calculators/__tests__/backer-board.test.ts 2>&1 | tail -6
```
Expected: `FAIL` — 9 failing tests.

### Step 4: Implement new backer-board.ts

Replace `src/calculators/backer-board.ts` with:

```typescript
import type { BackerBoardInput, BackerBoardResult } from './types';
import type { MaterialQuantity } from '../types';
import { packsNeeded } from './primitives';
import { BACKER_BOARD_PRODUCTS } from '../data/tiling-products';

/**
 * Calculate the number of tile backer boards (and packs) needed for a project.
 *
 * **Formula:**
 *   boardsNeeded = ceil(areaM2 × (1 + wastePercent/100) / boardAreaM2)
 *   packsNeeded  = ceil(boardsNeeded / product.boardsPerPack)   [Flexel only]
 *
 * Products sold individually (HardieBacker, Jackoboard) do not return packsNeeded.
 * Flexel ECOMAX is sold in packs of 6 — packsNeeded is always returned for these.
 *
 * Source: Selco product listings verified 18 March 2026.
 *
 * @throws If `productId` not found or `areaM2 ≤ 0`.
 *
 * @example
 * calculateBackerBoard({ areaM2: 12, productId: 'hardiebacker-6mm', wastePercent: 10 })
 * // → { boardsNeeded: 14, boardAreaM2: 0.96, productName: 'HardieBacker 6mm', warnings: [] }
 */
export function calculateBackerBoard(input: BackerBoardInput): BackerBoardResult {
    const { areaM2, productId, wastePercent = 10 } = input;

    const product = BACKER_BOARD_PRODUCTS.find(p => p.id === productId);
    if (!product) {
        throw new Error(`Unknown backer board product ID: "${productId}". Check BACKER_BOARD_PRODUCTS catalogue.`);
    }
    if (areaM2 <= 0) throw new Error('Area must be greater than zero.');

    const warnings: string[] = [...(product.notes ?? [])];
    const boardAreaM2 = (product.boardLengthMm / 1000) * (product.boardWidthMm / 1000);
    const areaWithWaste = areaM2 * (1 + wastePercent / 100);
    const boards = packsNeeded(areaWithWaste, boardAreaM2);  // ceil(area / boardArea)

    const packs = product.boardsPerPack !== undefined
        ? packsNeeded(boards, product.boardsPerPack)
        : undefined;

    const materials: MaterialQuantity[] = [{
        material: `${product.brand} ${product.name}`,
        quantity: boards,
        unit: 'boards',
        packSize: product.boardsPerPack ?? 1,
        packsNeeded: packs ?? boards,
    }];

    return {
        boardsNeeded: boards,
        packsNeeded: packs,
        boardAreaM2,
        productName: product.name,
        materials,
        warnings,
    };
}
```

### Step 5: Run to confirm GREEN

```bash
/usr/local/bin/node node_modules/.bin/vitest run src/calculators/__tests__/backer-board.test.ts 2>&1 | tail -6
```
Expected: `9 passed`.

### Step 6: Commit

```bash
git add src/calculators/__tests__/backer-board.test.ts src/calculators/backer-board.ts
git commit -m "feat(backer-board): TDD rebuild — product-ID lookup, boardsPerPack for Flexel"
```

---

## Task 4: TDD rebuild tanking (RED → GREEN)

**Files:**
- Delete: `src/calculators/tanking.test.ts`
- Create: `src/calculators/__tests__/tanking.test.ts`
- Replace: `src/calculators/tanking.ts`

### Step 1: Delete old test file

```bash
rm src/calculators/tanking.test.ts
```

### Step 2: Create new test file (RED)

Create `src/calculators/__tests__/tanking.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { calculateTanking } from '../tanking';
import type { TankingInput } from '../types';

describe('calculateTanking — spec test cases', () => {

    it('TC1: Dunlop kit, 3.5m² → 1 kit', () => {
        // ceil(3.5 / 3.5) = 1
        const r = calculateTanking({ areaM2: 3.5, productId: 'dunlop-shower-waterproofing-kit' });
        expect(r.kitsNeeded).toBe(1);
        expect(r.coveragePerKit).toBeCloseTo(3.5);
        expect(r.productName).toBe('Shower Waterproofing Kit');
        expect(r.notes.length).toBeGreaterThan(0);
        expect(r.materials).toHaveLength(1);
    });

    it('TC2: Dunlop kit, 5m² → 2 kits', () => {
        // ceil(5 / 3.5) = ceil(1.428) = 2
        const r = calculateTanking({ areaM2: 5, productId: 'dunlop-shower-waterproofing-kit' });
        expect(r.kitsNeeded).toBe(2);
    });

    it('TC3: Mapei Mapegum WPS, 3m² → 1 kit', () => {
        // ceil(3 / 4) = 1
        const r = calculateTanking({ areaM2: 3, productId: 'mapei-mapegum-wps' });
        expect(r.kitsNeeded).toBe(1);
        expect(r.coveragePerKit).toBeCloseTo(4);
        expect(r.productName).toBe('Mapegum WPS Kit');
    });

    it('TC4: Mapei kit, 8m² → 2 kits', () => {
        // ceil(8 / 4) = 2
        const r = calculateTanking({ areaM2: 8, productId: 'mapei-mapegum-wps' });
        expect(r.kitsNeeded).toBe(2);
    });

    it('notes include "2 coats"', () => {
        const r = calculateTanking({ areaM2: 5, productId: 'mapei-mapegum-wps' });
        expect(r.notes.some(n => n.toLowerCase().includes('coat'))).toBe(true);
    });
});

describe('calculateTanking — validation', () => {
    const base: TankingInput = { areaM2: 5, productId: 'mapei-mapegum-wps' };

    it('throws for unknown productId', () => {
        expect(() => calculateTanking({ ...base, productId: 'does-not-exist' })).toThrow();
    });

    it('throws for zero area', () => {
        expect(() => calculateTanking({ ...base, areaM2: 0 })).toThrow();
    });
});
```

### Step 3: Confirm RED

```bash
/usr/local/bin/node node_modules/.bin/vitest run src/calculators/__tests__/tanking.test.ts 2>&1 | tail -6
```
Expected: `FAIL` — 7 failing.

### Step 4: Implement new tanking.ts

Replace `src/calculators/tanking.ts`:

```typescript
import type { TankingInput, TankingResult } from './types';
import type { MaterialQuantity } from '../types';
import { packsNeeded } from './primitives';
import { TANKING_PRODUCTS } from '../data/tiling-products';

/**
 * Calculate the number of tanking kits needed to waterproof a wet area.
 *
 * **Formula:** kitsNeeded = ceil(areaM2 / product.coverageM2PerKit)
 *
 * Coverage is per kit as stated on the manufacturer's product datasheet.
 * Kit contents (primer, membrane, tape) are in the product catalogue.
 *
 * Source: Mapei Mapegum WPS TDS; Dunlop Shower Waterproofing Kit TDS — 18 March 2026.
 *
 * @throws If `productId` not found or `areaM2 ≤ 0`.
 *
 * @example
 * calculateTanking({ areaM2: 3, productId: 'mapei-mapegum-wps' })
 * // → { kitsNeeded: 1, coveragePerKit: 4, notes: ['2 coats required', ...] }
 */
export function calculateTanking(input: TankingInput): TankingResult {
    const { areaM2, productId } = input;

    const product = TANKING_PRODUCTS.find(p => p.id === productId);
    if (!product) {
        throw new Error(`Unknown tanking product ID: "${productId}". Check TANKING_PRODUCTS catalogue.`);
    }
    if (areaM2 <= 0) throw new Error('Area must be greater than zero.');

    const kits = packsNeeded(areaM2, product.coverageM2PerKit);

    const materials: MaterialQuantity[] = [{
        material: `${product.brand} ${product.name}`,
        quantity: kits,
        unit: 'kits',
        packSize: 1,
        packsNeeded: kits,
    }];

    return {
        kitsNeeded: kits,
        coveragePerKit: product.coverageM2PerKit,
        productName: product.name,
        materials,
        notes: product.notes,
    };
}
```

### Step 5: Confirm GREEN

```bash
/usr/local/bin/node node_modules/.bin/vitest run src/calculators/__tests__/tanking.test.ts 2>&1 | tail -6
```
Expected: `7 passed`.

### Step 6: Commit

```bash
git add src/calculators/__tests__/tanking.test.ts src/calculators/tanking.ts
git commit -m "feat(tanking): TDD rebuild — product-ID lookup, kit-based formula"
```

---

## Task 5: TDD rebuild SLC (RED → GREEN)

**Files:**
- Delete: `src/calculators/slc.test.ts`
- Create: `src/calculators/__tests__/slc.test.ts`
- Replace: `src/calculators/slc.ts`

### Step 1: Delete old test file

```bash
rm src/calculators/slc.test.ts
```

### Step 2: Create new test file (RED)

Create `src/calculators/__tests__/slc.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { calculateSLC } from '../slc';
import type { SLCInput } from '../types';

// Density: 1.5 kg/litre (fixed constant — same for all standard SLC products)
// Formula: volumeLitres = areaM2 × depthMm
//          kgNeeded     = volumeLitres × 1.5
//          bagsNeeded   = ceil(kgNeeded / bagSizeKg)  [bagSizeKg default = 25]
// TC4: 0m² returns 0 kg, 0 bags — does NOT throw

describe('calculateSLC — spec test cases', () => {

    it('TC1: 12m² at 3mm depth, 25kg bags → 54kg, 3 bags', () => {
        // volume = 12 × 3 = 36L, kg = 36 × 1.5 = 54, bags = ceil(54/25) = 3
        const r = calculateSLC({ areaM2: 12, depthMm: 3 });
        expect(r.kgNeeded).toBeCloseTo(54);
        expect(r.bagsNeeded).toBe(3);
        expect(r.volumeLitres).toBeCloseTo(36);
    });

    it('TC2: 5m² at 10mm depth, default 25kg bags → 75kg, 3 bags', () => {
        // volume = 5 × 10 = 50L, kg = 50 × 1.5 = 75, bags = ceil(75/25) = 3
        const r = calculateSLC({ areaM2: 5, depthMm: 10 });
        expect(r.kgNeeded).toBeCloseTo(75);
        expect(r.bagsNeeded).toBe(3);
        expect(r.volumeLitres).toBeCloseTo(50);
    });

    it('TC3: 20m² at 1mm depth → 30kg, 2 bags', () => {
        // volume = 20L, kg = 30, bags = ceil(30/25) = 2
        const r = calculateSLC({ areaM2: 20, depthMm: 1 });
        expect(r.kgNeeded).toBeCloseTo(30);
        expect(r.bagsNeeded).toBe(2);
    });

    it('TC4: 0m² → 0 kg, 0 bags (no throw)', () => {
        const r = calculateSLC({ areaM2: 0, depthMm: 3 });
        expect(r.kgNeeded).toBe(0);
        expect(r.bagsNeeded).toBe(0);
        expect(r.volumeLitres).toBe(0);
    });

    it('coverageAtDepthM2PerBag — 25kg bag at 3mm = 5.556 m²/bag', () => {
        // 25 / (3 × 1.5) = 5.556
        const r = calculateSLC({ areaM2: 12, depthMm: 3 });
        expect(r.coverageAtDepthM2PerBag).toBeCloseTo(5.556, 2);
    });

    it('custom bagSizeKg — 20kg bags at 3mm, 12m² → ceil(54/20) = 3 bags', () => {
        const r = calculateSLC({ areaM2: 12, depthMm: 3, bagSizeKg: 20 });
        expect(r.kgNeeded).toBeCloseTo(54);
        expect(r.bagsNeeded).toBe(3);
    });
});

describe('calculateSLC — validation', () => {
    it('throws for negative depth', () => {
        expect(() => calculateSLC({ areaM2: 10, depthMm: -1 })).toThrow();
    });

    it('throws for zero depth', () => {
        expect(() => calculateSLC({ areaM2: 10, depthMm: 0 })).toThrow();
    });

    it('throws for negative bag size', () => {
        expect(() => calculateSLC({ areaM2: 10, depthMm: 3, bagSizeKg: -5 })).toThrow();
    });
});
```

### Step 3: Confirm RED

```bash
/usr/local/bin/node node_modules/.bin/vitest run src/calculators/__tests__/slc.test.ts 2>&1 | tail -6
```
Expected: `FAIL` — 9 failing.

### Step 4: Implement new slc.ts

Replace `src/calculators/slc.ts`:

```typescript
import type { SLCInput, SLCResult } from './types';
import { packsNeeded } from './primitives';

/** Fixed density for all standard SLC products (powder mixed). 1 litre = 1 m² × 1 mm. */
const SLC_DENSITY_KG_PER_L = 1.5;

/** Default bag size for standard SLC products (Mapei Ultraplan, Dunlop Level IT). */
const DEFAULT_BAG_SIZE_KG = 25;

/**
 * Calculate self-levelling compound (SLC) quantity for a floor preparation.
 *
 * **Formula:**
 *   volumeLitres          = areaM2 × depthMm          (1 m² × 1 mm = 1 litre exactly)
 *   kgNeeded              = volumeLitres × 1.5         (SLC density: 1.5 kg/litre)
 *   bagsNeeded            = ceil(kgNeeded / bagSizeKg)
 *   coverageAtDepthM2PerBag = bagSizeKg / (depthMm × 1.5)
 *
 * Zero area returns zero quantities rather than throwing — this is intentional for
 * UI calculators where the user may not have entered an area yet.
 *
 * Source: Mapei Ultraplan TDS; Dunlop Level IT TDS — 18 March 2026.
 *
 * @throws If `depthMm ≤ 0` or `bagSizeKg ≤ 0`.
 *
 * @example
 * calculateSLC({ areaM2: 12, depthMm: 3 })
 * // → { kgNeeded: 54, bagsNeeded: 3, volumeLitres: 36, coverageAtDepthM2PerBag: 5.556 }
 */
export function calculateSLC(input: SLCInput): SLCResult {
    const { areaM2, depthMm, bagSizeKg = DEFAULT_BAG_SIZE_KG } = input;

    if (depthMm <= 0) throw new Error('Depth must be greater than zero.');
    if (bagSizeKg <= 0) throw new Error('Bag size must be greater than zero.');

    if (areaM2 <= 0) {
        return { kgNeeded: 0, bagsNeeded: 0, volumeLitres: 0, coverageAtDepthM2PerBag: 0 };
    }

    const volumeLitres = areaM2 * depthMm;
    const kgNeeded = volumeLitres * SLC_DENSITY_KG_PER_L;
    const bags = packsNeeded(kgNeeded, bagSizeKg);
    const coverageAtDepthM2PerBag = bagSizeKg / (depthMm * SLC_DENSITY_KG_PER_L);

    return { kgNeeded, bagsNeeded: bags, volumeLitres, coverageAtDepthM2PerBag };
}
```

### Step 5: Confirm GREEN

```bash
/usr/local/bin/node node_modules/.bin/vitest run src/calculators/__tests__/slc.test.ts 2>&1 | tail -6
```
Expected: `9 passed`.

### Step 6: Commit

```bash
git add src/calculators/__tests__/slc.test.ts src/calculators/slc.ts
git commit -m "feat(slc): TDD rebuild — simplified parametric interface, 0-area short-circuit"
```

---

## Task 6: TDD rebuild primer (RED → GREEN)

**Files:**
- Delete: `src/calculators/primer.test.ts`
- Create: `src/calculators/__tests__/primer.test.ts`
- Replace: `src/calculators/primer.ts`

### Step 1: Delete old test file

```bash
rm src/calculators/primer.test.ts
```

### Step 2: Create new test file (RED)

Create `src/calculators/__tests__/primer.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { calculatePrimer } from '../primer';
import type { PrimerInput } from '../types';

// Formula: coverageRate = product.coverageM2PerKg (or dilutedCoverageM2PerKg if diluted=true)
//          kgNeeded     = areaM2 / coverageRate × coats
//          packsNeeded  = ceil(kgNeeded / product.primaryPackSizeKg)

describe('calculatePrimer — spec test cases', () => {

    it('TC1: Dunlop Multi-Purpose, 12m², undiluted, 1 coat → 1.2kg, 2×1kg packs', () => {
        // 12 / 10 × 1 = 1.2kg → ceil(1.2 / 1) = 2 packs
        const r = calculatePrimer({ areaM2: 12, productId: 'dunlop-multi-purpose-primer' });
        expect(r.kgNeeded).toBeCloseTo(1.2, 2);
        expect(r.packsNeeded).toBe(2);
        expect(r.coverageRateUsed).toBe(10);
        expect(r.productName).toBe('Multi-Purpose Primer');
        expect(r.materials).toHaveLength(1);
    });

    it('TC2: Dunlop Multi-Purpose, 12m², diluted, 1 coat → 0.6kg, 1×1kg pack', () => {
        // 12 / 20 × 1 = 0.6kg → ceil(0.6 / 1) = 1 pack
        const r = calculatePrimer({ areaM2: 12, productId: 'dunlop-multi-purpose-primer', diluted: true });
        expect(r.kgNeeded).toBeCloseTo(0.6, 2);
        expect(r.packsNeeded).toBe(1);
        expect(r.coverageRateUsed).toBe(20);
    });

    it('TC3: Dunlop Bonding Agent, 20m², neat, 1 coat → 1.667kg, 1×5kg pack', () => {
        // 20 / 12 × 1 = 1.667kg → ceil(1.667 / 5) = 1 pack
        const r = calculatePrimer({ areaM2: 20, productId: 'dunlop-universal-bonding-agent' });
        expect(r.kgNeeded).toBeCloseTo(1.667, 2);
        expect(r.packsNeeded).toBe(1);
        expect(r.coverageRateUsed).toBe(12);
    });

    it('TC4: Mapei Primer G, 12m², 1 coat → 2.4kg, 1×5kg pack', () => {
        // 12 / 5 × 1 = 2.4kg → ceil(2.4 / 5) = 1 pack
        const r = calculatePrimer({ areaM2: 12, productId: 'mapei-primer-g' });
        expect(r.kgNeeded).toBeCloseTo(2.4, 2);
        expect(r.packsNeeded).toBe(1);
        expect(r.coverageRateUsed).toBe(5);
    });

    it('default coats=1, diluted=false', () => {
        const explicit = calculatePrimer({ areaM2: 12, productId: 'dunlop-multi-purpose-primer', coats: 1, diluted: false });
        const defaulted = calculatePrimer({ areaM2: 12, productId: 'dunlop-multi-purpose-primer' });
        expect(defaulted.kgNeeded).toBeCloseTo(explicit.kgNeeded);
    });

    it('coats multiplier — 2 coats doubles kg', () => {
        const r1 = calculatePrimer({ areaM2: 12, productId: 'mapei-primer-g', coats: 1 });
        const r2 = calculatePrimer({ areaM2: 12, productId: 'mapei-primer-g', coats: 2 });
        expect(r2.kgNeeded).toBeCloseTo(r1.kgNeeded * 2, 5);
    });

    it('diluted=true on product without diluted rate falls back to standard rate', () => {
        // Mapei Primer G has no dilutedCoverageM2PerKg — should use standard rate
        const r = calculatePrimer({ areaM2: 12, productId: 'mapei-primer-g', diluted: true });
        expect(r.coverageRateUsed).toBe(5);  // standard rate, not 0
    });
});

describe('calculatePrimer — validation', () => {
    const base: PrimerInput = { areaM2: 12, productId: 'mapei-primer-g' };

    it('throws for unknown productId', () => {
        expect(() => calculatePrimer({ ...base, productId: 'does-not-exist' })).toThrow();
    });

    it('throws for zero area', () => {
        expect(() => calculatePrimer({ ...base, areaM2: 0 })).toThrow();
    });
});
```

### Step 3: Confirm RED

```bash
/usr/local/bin/node node_modules/.bin/vitest run src/calculators/__tests__/primer.test.ts 2>&1 | tail -6
```
Expected: `FAIL` — 9 failing.

### Step 4: Implement new primer.ts

Replace `src/calculators/primer.ts`:

```typescript
import type { PrimerInput, PrimerResult } from './types';
import type { MaterialQuantity } from '../types';
import { packsNeeded } from './primitives';
import { PRIMER_PRODUCTS } from '../data/tiling-products';

/**
 * Calculate primer quantity using product-ID lookup.
 *
 * **Formula:**
 *   coverageRate = product.coverageM2PerKg
 *                  (or product.dilutedCoverageM2PerKg if diluted=true and available)
 *   kgNeeded     = areaM2 / coverageRate × coats
 *   packsNeeded  = ceil(kgNeeded / product.primaryPackSizeKg)
 *
 * If `diluted=true` but the product has no `dilutedCoverageM2PerKg`, the standard
 * (undiluted) rate is used as a safe fallback.
 *
 * Source: Mapei Primer G TDS; Dunlop Multi-Purpose Primer TDS; Dunlop Universal
 * Bonding Agent TDS — 18 March 2026.
 *
 * @throws If `productId` not found or `areaM2 ≤ 0`.
 *
 * @example
 * calculatePrimer({ areaM2: 12, productId: 'mapei-primer-g' })
 * // → { kgNeeded: 2.4, packsNeeded: 1, coverageRateUsed: 5, productName: 'Primer G' }
 */
export function calculatePrimer(input: PrimerInput): PrimerResult {
    const { areaM2, productId, coats = 1, diluted = false } = input;

    const product = PRIMER_PRODUCTS.find(p => p.id === productId);
    if (!product) {
        throw new Error(`Unknown primer product ID: "${productId}". Check PRIMER_PRODUCTS catalogue.`);
    }
    if (areaM2 <= 0) throw new Error('Area must be greater than zero.');

    const coverageRateUsed = (diluted && product.dilutedCoverageM2PerKg != null)
        ? product.dilutedCoverageM2PerKg
        : product.coverageM2PerKg;

    const kgNeeded = (areaM2 / coverageRateUsed) * coats;
    const packs = packsNeeded(kgNeeded, product.primaryPackSizeKg);

    const materials: MaterialQuantity[] = [{
        material: `${product.brand} ${product.name}`,
        quantity: kgNeeded,
        unit: 'kg',
        packSize: product.primaryPackSizeKg,
        packsNeeded: packs,
    }];

    return { kgNeeded, packsNeeded: packs, coverageRateUsed, productName: product.name, materials };
}
```

### Step 5: Confirm GREEN

```bash
/usr/local/bin/node node_modules/.bin/vitest run src/calculators/__tests__/primer.test.ts 2>&1 | tail -6
```
Expected: `9 passed`.

### Step 6: Run full suite to catch regressions

```bash
/usr/local/bin/node node_modules/.bin/vitest run 2>&1 | tail -5
```
Expected: all tests pass.

### Step 7: Commit

```bash
git add src/calculators/__tests__/primer.test.ts src/calculators/primer.ts
git commit -m "feat(primer): TDD rebuild — product-ID lookup, diluted rate, kg-based output"
```

---

## Task 7: Migrate TilingProjectWizard + update index.ts, then final verification

**Files:**
- Modify: `src/calculators/index.ts`
- Modify: `src/components/TilingProjectWizard.tsx`

### Step 1: Update index.ts

Add BACKER_BOARD_PRODUCTS, TANKING_PRODUCTS, SLC_PRODUCTS, PRIMER_PRODUCTS to the tiling-products re-export:

```typescript
// Change line 41 from:
export { ADHESIVE_PRODUCTS, GROUT_PRODUCTS, SPACER_PRODUCTS } from '../data/tiling-products';
// To:
export {
    ADHESIVE_PRODUCTS,
    GROUT_PRODUCTS,
    SPACER_PRODUCTS,
    BACKER_BOARD_PRODUCTS,
    TANKING_PRODUCTS,
    SLC_PRODUCTS,
    PRIMER_PRODUCTS,
} from '../data/tiling-products';
```

### Step 2: Update TilingProjectWizard.tsx imports

Add at top (after line 10):
```typescript
import {
    BACKER_BOARD_PRODUCTS,
    TANKING_PRODUCTS,
    PRIMER_PRODUCTS,
} from '../data/tiling-products';
```

Change line 7 (primer):
```typescript
// REMOVE: import { calculatePrimer } from '../calculators/primer';
// ADD:
import { calculatePrimer } from '../calculators/primer';
```
(keep as-is — calculatePrimer still needed)

### Step 3: Replace the 4 state blocks with product-ID states

**Replace backer board state** (~lines 106–108):
```typescript
// REMOVE:
const [boardWidth, setBoardWidth] = useState('1200');
const [boardHeight, setBoardHeight] = useState('800');
const [boardWastage, setBoardWastage] = useState('10');
// ADD:
const [selectedBackerProduct, setSelectedBackerProduct] = useState(BACKER_BOARD_PRODUCTS[0].id);
const [boardWastePercent, setBoardWastePercent] = useState('10');
```

**Replace tanking state** (~lines 110–112):
```typescript
// REMOVE:
const [tankingCoverage, setTankingCoverage] = useState('0.7');
const [tankingCoats, setTankingCoats] = useState('2');
const [tankingTubSize, setTankingTubSize] = useState('5');
// ADD:
const [selectedTankingProduct, setSelectedTankingProduct] = useState(TANKING_PRODUCTS[0].id);
```

**Replace SLC state** (~lines 114–117):
```typescript
// REMOVE:
const [slcCoverage, setSlcCoverage] = useState('1.7');
const [slcDepth, setSlcDepth] = useState('3');
const [slcBagSize, setSlcBagSize] = useState('20');
const [slcWastage, setSlcWastage] = useState('10');
// ADD:
const [slcDepth, setSlcDepth] = useState('3');
const [slcBagSize, setSlcBagSize] = useState('25');
```

**Replace primer state** (~lines 102–104):
```typescript
// REMOVE:
const [primerCoverage, setPrimerCoverage] = useState('5');
const [primerBottleSize, setPrimerBottleSize] = useState('5');
const [primerCoats, setPrimerCoats] = useState('1');
// ADD:
const [selectedPrimerProduct, setSelectedPrimerProduct] = useState(PRIMER_PRODUCTS[0].id);
const [primerCoats, setPrimerCoats] = useState('1');
const [primerDiluted, setPrimerDiluted] = useState(false);
```

### Step 4: Update the 4 metrics useMemos

**Replace backerMetrics** (~lines 317–333):
```typescript
const backerMetrics = useMemo(() => {
    if (areaM2 <= 0) return { boards: 0, boardArea: 0, packs: undefined as number | undefined };
    try {
        const result = calculateBackerBoard({
            areaM2,
            productId: selectedBackerProduct,
            wastePercent: toNumber(boardWastePercent),
        });
        return { boards: result.boardsNeeded, boardArea: result.boardAreaM2, packs: result.packsNeeded };
    } catch {
        return { boards: 0, boardArea: 0, packs: undefined };
    }
}, [selectedBackerProduct, boardWastePercent, areaM2]);
```

**Replace tankingMetrics** (~lines 335–353):
```typescript
const tankingMetrics = useMemo(() => {
    if (areaM2 <= 0) return { kits: 0, notes: [] as string[] };
    try {
        const result = calculateTanking({ areaM2, productId: selectedTankingProduct });
        return { kits: result.kitsNeeded, notes: result.notes };
    } catch {
        return { kits: 0, notes: [] };
    }
}, [selectedTankingProduct, areaM2]);
```

**Replace slcMetrics** (~lines 355–375):
```typescript
const slcMetrics = useMemo(() => {
    const depth = toNumber(slcDepth);
    const bag = toNumber(slcBagSize);
    if (depth <= 0 || bag <= 0 || areaM2 <= 0) {
        return { kg: 0, bags: 0 };
    }
    try {
        const result = calculateSLC({ areaM2, depthMm: depth, bagSizeKg: bag });
        return { kg: result.kgNeeded, bags: result.bagsNeeded };
    } catch {
        return { kg: 0, bags: 0 };
    }
}, [slcDepth, slcBagSize, areaM2]);
```

**Replace primerMetrics** (~lines 297–315):
```typescript
const primerMetrics = useMemo(() => {
    const coats = toNumber(primerCoats);
    if (coats <= 0 || areaM2 <= 0) return { kg: 0, packs: 0 };
    try {
        const result = calculatePrimer({
            areaM2,
            productId: selectedPrimerProduct,
            coats,
            diluted: primerDiluted,
        });
        return { kg: result.kgNeeded, packs: result.packsNeeded };
    } catch {
        return { kg: 0, packs: 0 };
    }
}, [selectedPrimerProduct, primerCoats, primerDiluted, areaM2]);
```

### Step 5: Update JSX display references

Find and update the display section of TilingProjectWizard.tsx where metric values are referenced:
- `tankingMetrics.kg` → `tankingMetrics.kits` (kit count, not kg)
- `tankingMetrics.tubs` → `tankingMetrics.kits`
- `primerMetrics.litres` → `primerMetrics.kg`
- `primerMetrics.bottles` → `primerMetrics.packs`
- `backerMetrics.boards` → `backerMetrics.boards` (unchanged)
- `slcMetrics.kgWithWastage` → `slcMetrics.kg`

Also update JSX inputs for the wizard steps to replace the old inputs with product dropdowns.

> **Note:** The exact JSX edits in this step require reading the full render section of TilingProjectWizard.tsx (look for `currentStep?.id === 'primer'`, `currentStep?.id === 'backer'`, `currentStep?.id === 'tanking'`, `currentStep?.id === 'slc'`). Each step's form inputs need updating to use FormSelect for product selection and remove the old numeric inputs that are now derived from the product catalogue.

### Step 6: Run tsc — expect zero errors

```bash
/usr/local/bin/node node_modules/.bin/tsc --noEmit 2>&1 | grep "error TS" | grep -v "astro.config\|vitest.config"
```
Expected: no output.

### Step 7: Run full test suite

```bash
/usr/local/bin/node node_modules/.bin/vitest run 2>&1 | tail -5
```
Expected: all tests pass (284 existing + 36 new = ~320 tests).

### Step 8: Run astro build

```bash
/usr/local/bin/node node_modules/.bin/astro build 2>&1 | tail -3
```
Expected: `[build] Complete!`

### Step 9: Final commit

```bash
git add -u
git commit -m "$(cat <<'EOF'
feat(tiling): TDD rebuild — backer board, tanking, SLC, primer calculators complete

- backer-board.ts: product-ID lookup, boardsPerPack for Flexel, wastePercent default 10%
- tanking.ts: product-ID lookup, kit-based formula, notes from product catalogue
- slc.ts: simplified parametric (depth + bagSizeKg), 0-area short-circuit, no wastage param
- primer.ts: product-ID lookup, diluted flag, kg-based output (replaces litre-based)
- 36 new tests pass (9+7+9+9+2 validation)
- TilingProjectWizard migrated to all new interfaces
- index.ts updated with new product exports
EOF
)"
```

---

## Product Catalogue Summary

| Calculator | Products | Key data |
|------------|----------|----------|
| Backer board | HardieBacker 6mm/12mm (0.96m²), Jackoboard Plano 6mm/12mm (0.72m²), Flexel ECOMAX 6mm/10mm (0.72m², 6/pack) | 6 products |
| Tanking | Mapei Mapegum WPS (4m²/kit), Dunlop Shower Kit (3.5m²/kit) | 2 products |
| SLC | Mapei Ultraplan (25kg), Dunlop Level IT (25kg) — both ρ=1.5 kg/L | 2 products |
| Primer | Mapei Primer G (5m²/kg, 5kg pack), Dunlop Multi-Purpose (10/20m²/kg, 1kg), Dunlop Bonding Agent (12/3m²/kg, 5kg) | 3 products |
