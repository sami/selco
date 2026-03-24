# Masonry Orchestrator Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build `calculateMasonryProject` orchestrator plus 4 sub-calculators (lintels, padstones, cavity-closers, cavity-trays) using TDD, with 4-scenario cross-reference validation tests.

**Architecture:** New file `masonry-project.ts` (NOT modifying `masonry.ts`) avoids API naming collision. The orchestrator chains all sub-calculators, deducts opening areas from net area, uses gross area for wall ties, and doubles DPC for cavity walls.

**Tech Stack:** TypeScript, Vitest, existing product-ID lookup pattern from `bricks.ts`/`blocks.ts`.

---

## Pre-Computed Test Values

### Scenario A — 6m × 1.8m brick wall, no openings
- `wallAreaM2 = 6 × 1.8 = 10.8`, `netAreaM2 = 10.8`
- Bricks: `ceil(10.8 × 60 × 1.05) = ceil(680.4) = 681`
- DPC: `ceil(6/30) = 1` roll

### Scenario B — 10m × 2.4m cavity wall (75mm), no openings
- `wallAreaM2 = 24`, `netAreaM2 = 24`
- Bricks: `ceil(24 × 60 × 1.05) = ceil(1512) = 1512`
- Blocks: `ceil(24 × 10 × 1.05) = ceil(252) = 252`
- Wall ties: `ceil(24 × 2.5) = 60`
- DPC: 2 rolls (one per leaf)
- Air bricks: `ceil(10000/450) = ceil(22.22) = 23`

### Scenario C — 4m × 2.4m block wall, no openings
- `wallAreaM2 = 9.6`, `netAreaM2 = 9.6`
- Blocks: `ceil(9.6 × 10 × 1.05) = ceil(100.8) = 101`
- No DPC, no air bricks, no wall ties

### Scenario D — 10m × 2.4m cavity wall (75mm), 2 × 1200×1200 windows
- `openingAreaM2 = 2 × (1.2 × 1.2) = 2.88`
- `netAreaM2 = 24 − 2.88 = 21.12`
- Bricks: `ceil(21.12 × 60 × 1.05) = ceil(1330.56) = 1331`
- Blocks: `ceil(21.12 × 10 × 1.05) = ceil(221.76) = 222`
- Wall ties: `ceil(24 × 2.5) = 60` (gross area)
- DPC: 2 rolls, Air bricks: 23
- Per opening (1200mm): 1 steel lintel (1500mm), 2 padstones, 2 cavity closers, 1 cavity tray
- Total: 2 lintels, 4 padstones, 4 closers, 2 trays

### Cavity closer verification (1200×1200)
- `perimeterM = 2 × ((1200+1200)/1000) = 4.8m`
- Product `multicor-closer-50-100`: lengthM = 2.44m
- `ceil(4.8 / 2.44) = ceil(1.967) = 2` ✓

---

## Task 0 — Add 10 new I/O interfaces to src/calculators/types.ts

**Files:**
- Modify: `src/calculators/types.ts`

**Step 1: Append interfaces after `AirBricksResult`**

```typescript
// ---------------------------------------------------------------------------
// Lintel calculator I/O
// ---------------------------------------------------------------------------
export interface LintelInput {
    openingWidthMm: number;
    productId: string;
}
export interface LintelCalcResult {
    lintelLengthMm: number;
    productName: string;
    materials: MaterialQuantity[];
}

// ---------------------------------------------------------------------------
// Padstone calculator I/O
// ---------------------------------------------------------------------------
export interface PadstoneInput {
    productId: string;
    quantity: number;
}
export interface PadstoneResult {
    padstonesNeeded: number;
    productName: string;
    materials: MaterialQuantity[];
}

// ---------------------------------------------------------------------------
// Cavity closer calculator I/O
// ---------------------------------------------------------------------------
export interface CavityCloserInput {
    openingWidthMm: number;
    openingHeightMm: number;
    productId: string;
}
export interface CavityCloserResult {
    closersNeeded: number;
    perimeterM: number;
    productName: string;
    materials: MaterialQuantity[];
}

// ---------------------------------------------------------------------------
// Cavity tray calculator I/O
// ---------------------------------------------------------------------------
export interface CavityTrayInput {
    productId: string;
    quantity: number;
}
export interface CavityTrayResult {
    traysNeeded: number;
    productName: string;
    materials: MaterialQuantity[];
}

// ---------------------------------------------------------------------------
// Masonry project orchestrator I/O
// ---------------------------------------------------------------------------
export interface MasonryProjectInput {
    wallAreaM2: number;
    wallLengthM: number;
    wallType: 'brick' | 'block' | 'cavity';
    brickProductId?: string;
    blockProductId?: string;
    cementProductId?: string;
    sandProductId?: string;
    dpcProductId?: string;
    lintelProductId?: string;
    steelLintelProductId?: string;
    padstoneProductId?: string;
    cavityCloserProductId?: string;
    cavityTrayProductId?: string;
    mixRatio: '1:3' | '1:4';
    /** Default: 5 */
    wastagePercent?: number;
    cavityWidthMm?: number;
    includeDPC: boolean;
    includeAirBricks: boolean;
    openings: Array<{ widthMm: number; heightMm: number }>;
}
export interface MasonryProjectResult {
    materials: MaterialQuantity[];
    grossAreaM2: number;
    netAreaM2: number;
    openingAreaM2: number;
    totalOpenings: number;
    warnings: string[];
}
```

**Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: 0 errors.

**Step 3: Commit**

```bash
git add src/calculators/types.ts
git commit -m "feat(masonry): add LintelInput/CalcResult, PadstoneInput/Result, CavityCloserInput/Result, CavityTrayInput/Result, MasonryProjectInput/Result to types.ts"
```

---

## Task 1 — Lintels calculator (TDD)

**Files:**
- Create: `src/calculators/__tests__/lintels.test.ts`
- Create: `src/calculators/lintels.ts`

**Step 1: Write failing tests**

```typescript
// src/calculators/__tests__/lintels.test.ts
import { describe, it, expect } from 'vitest';
import { calculateLintel } from '../lintels';

describe('calculateLintel()', () => {
    // TC1 — concrete lintel: 1200mm opening + 150mm bearing each side → 1500mm
    it('TC1: 1200mm opening, concrete lintel-100 → lintelLengthMm=1500', () => {
        const r = calculateLintel({ openingWidthMm: 1200, productId: 'supreme-concrete-lintel-100' });
        expect(r.lintelLengthMm).toBe(1500);
    });

    // TC2 — steel lintel: IG L1/S75 cavity, same 1200mm → 1500mm (cut to order)
    it('TC2: 1200mm opening, IG L1/S75 steel cavity → lintelLengthMm=1500', () => {
        const r = calculateLintel({ openingWidthMm: 1200, productId: 'ig-l1-s75-cavity' });
        expect(r.lintelLengthMm).toBe(1500);
    });

    // TC3 — unknown productId throws
    it('TC3: unknown productId → throws descriptive error', () => {
        expect(() =>
            calculateLintel({ openingWidthMm: 1200, productId: 'unknown-lintel' })
        ).toThrow('Unknown lintel product ID: "unknown-lintel"');
    });

    // TC4 — materials shape
    it('TC4: materials has 1 entry, unit=each, quantity=1', () => {
        const r = calculateLintel({ openingWidthMm: 1200, productId: 'supreme-concrete-lintel-100' });
        expect(r.materials).toHaveLength(1);
        expect(r.materials[0].unit).toBe('each');
        expect(r.materials[0].quantity).toBe(1);
    });
});
```

**Step 2: Run tests to confirm RED**

```bash
npx vitest run src/calculators/__tests__/lintels.test.ts
```
Expected: FAIL (module not found).

**Step 3: Commit RED**

```bash
git add src/calculators/__tests__/lintels.test.ts
git commit -m "test(lintels): add TDD test suite — TC1–TC4 (RED)"
```

**Step 4: Implement lintels.ts**

```typescript
// src/calculators/lintels.ts
import type { LintelInput, LintelCalcResult } from './types';
import type { MaterialQuantity } from '../types';
import { CONCRETE_LINTEL_PRODUCTS, STEEL_LINTEL_PRODUCTS } from '../data/masonry-products';

export function calculateLintel(input: LintelInput): LintelCalcResult {
    const { openingWidthMm, productId } = input;

    const concreteProduct = CONCRETE_LINTEL_PRODUCTS.find(p => p.id === productId);
    if (concreteProduct) {
        const requiredLengthMm = openingWidthMm + 2 * concreteProduct.minBearingMm;
        const sorted = [...concreteProduct.availableLengthsMm].sort((a, b) => a - b);
        const lintelLengthMm = sorted.find(l => l >= requiredLengthMm);
        if (lintelLengthMm === undefined) {
            throw new Error(`No concrete lintel long enough for ${openingWidthMm}mm opening with product "${productId}".`);
        }
        const materials: MaterialQuantity[] = [
            { material: concreteProduct.name, quantity: 1, unit: 'each' },
        ];
        return { lintelLengthMm, productName: concreteProduct.name, materials };
    }

    const steelProduct = STEEL_LINTEL_PRODUCTS.find(p => p.id === productId);
    if (steelProduct) {
        const lintelLengthMm = openingWidthMm + 2 * steelProduct.minBearingMm;
        const materials: MaterialQuantity[] = [
            { material: `${steelProduct.brand} ${steelProduct.name}`, quantity: 1, unit: 'each' },
        ];
        return { lintelLengthMm, productName: steelProduct.name, materials };
    }

    throw new Error(
        `Unknown lintel product ID: "${productId}". Check CONCRETE_LINTEL_PRODUCTS and STEEL_LINTEL_PRODUCTS catalogues.`
    );
}
```

**Step 5: Run tests to confirm GREEN**

```bash
npx vitest run src/calculators/__tests__/lintels.test.ts
```
Expected: 4/4 PASS.

**Step 6: TypeScript check**

```bash
npx tsc --noEmit
```

**Step 7: Commit GREEN**

```bash
git add src/calculators/lintels.ts
git commit -m "feat(lintels): implement calculateLintel — concrete + steel product lookup (TDD GREEN)"
```

---

## Task 2 — Padstones calculator (TDD)

**Files:**
- Create: `src/calculators/__tests__/padstones.test.ts`
- Create: `src/calculators/padstones.ts`

**Step 1: Write failing tests**

```typescript
// src/calculators/__tests__/padstones.test.ts
import { describe, it, expect } from 'vitest';
import { calculatePadstone } from '../padstones';

describe('calculatePadstone()', () => {
    // TC1 — standard engineering brick padstone
    it('TC1: quantity=2, engineering-brick-padstone-215x102 → padstonesNeeded=2', () => {
        const r = calculatePadstone({ productId: 'engineering-brick-padstone-215x102', quantity: 2 });
        expect(r.padstonesNeeded).toBe(2);
    });

    // TC2 — unknown productId throws
    it('TC2: unknown productId → throws descriptive error', () => {
        expect(() =>
            calculatePadstone({ productId: 'unknown-padstone', quantity: 1 })
        ).toThrow('Unknown padstone product ID: "unknown-padstone"');
    });

    // TC3 — materials shape
    it('TC3: materials has 1 entry, unit=each, quantity matches input', () => {
        const r = calculatePadstone({ productId: 'engineering-brick-padstone-215x102', quantity: 4 });
        expect(r.materials).toHaveLength(1);
        expect(r.materials[0].unit).toBe('each');
        expect(r.materials[0].quantity).toBe(4);
    });
});
```

**Step 2: Run to confirm RED, then commit**

```bash
npx vitest run src/calculators/__tests__/padstones.test.ts
git add src/calculators/__tests__/padstones.test.ts
git commit -m "test(padstones): add TDD test suite — TC1–TC3 (RED)"
```

**Step 3: Implement padstones.ts**

```typescript
// src/calculators/padstones.ts
import type { PadstoneInput, PadstoneResult } from './types';
import type { MaterialQuantity } from '../types';
import { PADSTONE_PRODUCTS } from '../data/masonry-products';

export function calculatePadstone(input: PadstoneInput): PadstoneResult {
    const { productId, quantity } = input;

    const product = PADSTONE_PRODUCTS.find(p => p.id === productId);
    if (!product) {
        throw new Error(
            `Unknown padstone product ID: "${productId}". Check PADSTONE_PRODUCTS catalogue.`
        );
    }

    const materials: MaterialQuantity[] = [
        { material: product.name, quantity, unit: 'each' },
    ];

    return { padstonesNeeded: quantity, productName: product.name, materials };
}
```

**Step 4: Run GREEN + tsc + commit**

```bash
npx vitest run src/calculators/__tests__/padstones.test.ts
npx tsc --noEmit
git add src/calculators/padstones.ts
git commit -m "feat(padstones): implement calculatePadstone with product-ID lookup (TDD GREEN)"
```

---

## Task 3 — Cavity closers calculator (TDD)

**Files:**
- Create: `src/calculators/__tests__/cavity-closers.test.ts`
- Create: `src/calculators/cavity-closers.ts`

**Step 1: Write failing tests**

```typescript
// src/calculators/__tests__/cavity-closers.test.ts
import { describe, it, expect } from 'vitest';
import { calculateCavityCloser } from '../cavity-closers';

describe('calculateCavityCloser()', () => {
    // TC1 — 1200×1200 opening: perimeter=4.8m, closer=2.44m → ceil(4.8/2.44)=2
    it('TC1: 1200×1200 opening, multicor-closer-50-100 → closersNeeded=2', () => {
        const r = calculateCavityCloser({ openingWidthMm: 1200, openingHeightMm: 1200, productId: 'multicor-closer-50-100' });
        expect(r.closersNeeded).toBe(2);
        expect(r.perimeterM).toBeCloseTo(4.8, 2);
    });

    // TC2 — unknown productId throws
    it('TC2: unknown productId → throws descriptive error', () => {
        expect(() =>
            calculateCavityCloser({ openingWidthMm: 1200, openingHeightMm: 1200, productId: 'unknown-closer' })
        ).toThrow('Unknown cavity closer product ID: "unknown-closer"');
    });

    // TC3 — materials shape
    it('TC3: materials has 1 entry, unit=each, quantity=closersNeeded', () => {
        const r = calculateCavityCloser({ openingWidthMm: 1200, openingHeightMm: 1200, productId: 'multicor-closer-50-100' });
        expect(r.materials).toHaveLength(1);
        expect(r.materials[0].unit).toBe('each');
        expect(r.materials[0].quantity).toBe(r.closersNeeded);
    });
});
```

**Step 2: Commit RED**

```bash
npx vitest run src/calculators/__tests__/cavity-closers.test.ts
git add src/calculators/__tests__/cavity-closers.test.ts
git commit -m "test(cavity-closers): add TDD test suite — TC1–TC3 (RED)"
```

**Step 3: Implement cavity-closers.ts**

`packsNeeded(quantity, packSize)` from `./primitives` computes `Math.ceil(quantity / packSize)` — perfect for length-based packing.

```typescript
// src/calculators/cavity-closers.ts
import type { CavityCloserInput, CavityCloserResult } from './types';
import type { MaterialQuantity } from '../types';
import { CAVITY_CLOSER_PRODUCTS } from '../data/masonry-products';
import { packsNeeded } from './primitives';

export function calculateCavityCloser(input: CavityCloserInput): CavityCloserResult {
    const { openingWidthMm, openingHeightMm, productId } = input;

    const product = CAVITY_CLOSER_PRODUCTS.find(p => p.id === productId);
    if (!product) {
        throw new Error(
            `Unknown cavity closer product ID: "${productId}". Check CAVITY_CLOSER_PRODUCTS catalogue.`
        );
    }

    const perimeterM = 2 * ((openingWidthMm + openingHeightMm) / 1000);
    const closersNeeded = packsNeeded(perimeterM, product.lengthM);

    const materials: MaterialQuantity[] = [
        { material: product.name, quantity: closersNeeded, unit: 'each' },
    ];

    return { closersNeeded, perimeterM, productName: product.name, materials };
}
```

**Step 4: Run GREEN + tsc + commit**

```bash
npx vitest run src/calculators/__tests__/cavity-closers.test.ts
npx tsc --noEmit
git add src/calculators/cavity-closers.ts
git commit -m "feat(cavity-closers): implement calculateCavityCloser — perimeter packing (TDD GREEN)"
```

---

## Task 4 — Cavity trays calculator (TDD)

**Files:**
- Create: `src/calculators/__tests__/cavity-trays.test.ts`
- Create: `src/calculators/cavity-trays.ts`

**Step 1: Write failing tests**

```typescript
// src/calculators/__tests__/cavity-trays.test.ts
import { describe, it, expect } from 'vitest';
import { calculateCavityTray } from '../cavity-trays';

describe('calculateCavityTray()', () => {
    // TC1 — standard tray, quantity=1
    it('TC1: quantity=1, cavity-tray-standard → traysNeeded=1', () => {
        const r = calculateCavityTray({ productId: 'cavity-tray-standard', quantity: 1 });
        expect(r.traysNeeded).toBe(1);
    });

    // TC2 — quantity=3
    it('TC2: quantity=3 → traysNeeded=3', () => {
        const r = calculateCavityTray({ productId: 'cavity-tray-standard', quantity: 3 });
        expect(r.traysNeeded).toBe(3);
    });

    // TC3 — unknown productId throws
    it('TC3: unknown productId → throws descriptive error', () => {
        expect(() =>
            calculateCavityTray({ productId: 'unknown-tray', quantity: 1 })
        ).toThrow('Unknown cavity tray product ID: "unknown-tray"');
    });

    // TC4 — materials shape
    it('TC4: materials has 1 entry, unit=each, quantity=traysNeeded', () => {
        const r = calculateCavityTray({ productId: 'cavity-tray-standard', quantity: 2 });
        expect(r.materials).toHaveLength(1);
        expect(r.materials[0].unit).toBe('each');
        expect(r.materials[0].quantity).toBe(2);
    });
});
```

**Step 2: Commit RED**

```bash
npx vitest run src/calculators/__tests__/cavity-trays.test.ts
git add src/calculators/__tests__/cavity-trays.test.ts
git commit -m "test(cavity-trays): add TDD test suite — TC1–TC4 (RED)"
```

**Step 3: Implement cavity-trays.ts**

```typescript
// src/calculators/cavity-trays.ts
import type { CavityTrayInput, CavityTrayResult } from './types';
import type { MaterialQuantity } from '../types';
import { CAVITY_TRAY_PRODUCTS } from '../data/masonry-products';

export function calculateCavityTray(input: CavityTrayInput): CavityTrayResult {
    const { productId, quantity } = input;

    const product = CAVITY_TRAY_PRODUCTS.find(p => p.id === productId);
    if (!product) {
        throw new Error(
            `Unknown cavity tray product ID: "${productId}". Check CAVITY_TRAY_PRODUCTS catalogue.`
        );
    }

    const materials: MaterialQuantity[] = [
        { material: product.name, quantity, unit: 'each' },
    ];

    return { traysNeeded: quantity, productName: product.name, materials };
}
```

**Step 4: Run GREEN + tsc + commit**

```bash
npx vitest run src/calculators/__tests__/cavity-trays.test.ts
npx tsc --noEmit
git add src/calculators/cavity-trays.ts
git commit -m "feat(cavity-trays): implement calculateCavityTray with product-ID lookup (TDD GREEN)"
```

---

## Task 5 — Masonry project orchestrator (TDD)

**Files:**
- Create: `src/calculators/__tests__/masonry-project.test.ts`
- Create: `src/calculators/masonry-project.ts`

### Step 1: Write failing scenario tests

```typescript
// src/calculators/__tests__/masonry-project.test.ts
import { describe, it, expect } from 'vitest';
import type { MaterialQuantity } from '../../types';
import { calculateMasonryProject } from '../masonry-project';

function sumMaterialQty(materials: MaterialQuantity[], nameFragment: string): number {
    return materials
        .filter(m => m.material.toLowerCase().includes(nameFragment.toLowerCase()))
        .reduce((sum, m) => sum + m.quantity, 0);
}

function countMaterialEntries(materials: MaterialQuantity[], nameFragment: string): number {
    return materials.filter(m => m.material.toLowerCase().includes(nameFragment.toLowerCase())).length;
}

// --- Scenario A: 6m × 1.8m brick wall, no openings ---
describe('Scenario A — brick wall, no openings', () => {
    const result = calculateMasonryProject({
        wallAreaM2: 10.8,
        wallLengthM: 6,
        wallType: 'brick',
        brickProductId: 'ibstock-common-brick',
        sandProductId: 'building-sand-35kg',
        cementProductId: 'rugby-premium-opc-25',
        dpcProductId: 'visqueen-dpc-30m',
        mixRatio: '1:3',
        wastagePercent: 5,
        includeDPC: true,
        includeAirBricks: false,
        openings: [],
    });

    it('A1: netAreaM2 = grossAreaM2 when no openings', () => {
        expect(result.netAreaM2).toBeCloseTo(10.8, 2);
        expect(result.grossAreaM2).toBeCloseTo(10.8, 2);
        expect(result.openingAreaM2).toBe(0);
    });

    it('A2: bricks = ceil(10.8 × 60 × 1.05) = 681', () => {
        expect(sumMaterialQty(result.materials, 'brick')).toBe(681);
    });

    it('A3: DPC = 1 roll (ceil(6/30))', () => {
        expect(sumMaterialQty(result.materials, 'dpc')).toBe(1);
    });
});

// --- Scenario B: 10m × 2.4m cavity wall (75mm), no openings ---
describe('Scenario B — cavity wall, no openings', () => {
    const result = calculateMasonryProject({
        wallAreaM2: 24,
        wallLengthM: 10,
        wallType: 'cavity',
        brickProductId: 'ibstock-common-brick',
        blockProductId: 'thermalite-shield-block-100',
        sandProductId: 'building-sand-35kg',
        cementProductId: 'rugby-premium-opc-25',
        dpcProductId: 'visqueen-dpc-30m',
        mixRatio: '1:3',
        wastagePercent: 5,
        cavityWidthMm: 75,
        includeDPC: true,
        includeAirBricks: true,
        openings: [],
    });

    it('B1: bricks = ceil(24 × 60 × 1.05) = 1512', () => {
        expect(sumMaterialQty(result.materials, 'brick')).toBe(1512);
    });

    it('B2: blocks = ceil(24 × 10 × 1.05) = 252', () => {
        expect(sumMaterialQty(result.materials, 'block')).toBe(252);
    });

    it('B3: wall ties = ceil(24 × 2.5) = 60', () => {
        expect(sumMaterialQty(result.materials, 'wall tie')).toBe(60);
    });

    it('B4: DPC = 2 rolls total (one per leaf)', () => {
        expect(sumMaterialQty(result.materials, 'dpc')).toBe(2);
    });

    it('B5: air bricks = ceil(10000/450) = 23', () => {
        expect(sumMaterialQty(result.materials, 'air brick')).toBe(23);
    });
});

// --- Scenario C: 4m × 2.4m block wall, no openings ---
describe('Scenario C — block wall, no openings', () => {
    const result = calculateMasonryProject({
        wallAreaM2: 9.6,
        wallLengthM: 4,
        wallType: 'block',
        blockProductId: 'thermalite-shield-block-100',
        sandProductId: 'building-sand-35kg',
        cementProductId: 'rugby-premium-opc-25',
        mixRatio: '1:3',
        wastagePercent: 5,
        includeDPC: false,
        includeAirBricks: false,
        openings: [],
    });

    it('C1: blocks = ceil(9.6 × 10 × 1.05) = 101', () => {
        expect(sumMaterialQty(result.materials, 'block')).toBe(101);
    });

    it('C2: no DPC materials', () => {
        expect(countMaterialEntries(result.materials, 'dpc')).toBe(0);
    });

    it('C3: no air brick materials', () => {
        expect(countMaterialEntries(result.materials, 'air brick')).toBe(0);
    });
});

// --- Scenario D: 10m × 2.4m cavity, 2 × 1200×1200 openings ---
describe('Scenario D — cavity wall, 2 windows', () => {
    const result = calculateMasonryProject({
        wallAreaM2: 24,
        wallLengthM: 10,
        wallType: 'cavity',
        brickProductId: 'ibstock-common-brick',
        blockProductId: 'thermalite-shield-block-100',
        sandProductId: 'building-sand-35kg',
        cementProductId: 'rugby-premium-opc-25',
        dpcProductId: 'visqueen-dpc-30m',
        steelLintelProductId: 'ig-l1-s75-cavity',
        padstoneProductId: 'engineering-brick-padstone-215x102',
        cavityCloserProductId: 'multicor-closer-50-100',
        cavityTrayProductId: 'cavity-tray-standard',
        mixRatio: '1:3',
        wastagePercent: 5,
        cavityWidthMm: 75,
        includeDPC: true,
        includeAirBricks: true,
        openings: [
            { widthMm: 1200, heightMm: 1200 },
            { widthMm: 1200, heightMm: 1200 },
        ],
    });

    it('D1: openingAreaM2 = 2.88, netAreaM2 = 21.12', () => {
        expect(result.openingAreaM2).toBeCloseTo(2.88, 3);
        expect(result.netAreaM2).toBeCloseTo(21.12, 2);
    });

    it('D2: bricks = ceil(21.12 × 60 × 1.05) = 1331', () => {
        expect(sumMaterialQty(result.materials, 'brick')).toBe(1331);
    });

    it('D3: blocks = ceil(21.12 × 10 × 1.05) = 222', () => {
        expect(sumMaterialQty(result.materials, 'block')).toBe(222);
    });

    it('D4: wall ties use GROSS area = ceil(24 × 2.5) = 60', () => {
        expect(sumMaterialQty(result.materials, 'wall tie')).toBe(60);
    });

    it('D5: 2 lintels (one per opening)', () => {
        expect(sumMaterialQty(result.materials, 'lintel')).toBe(2);
    });

    it('D6: 4 padstones (2 per opening)', () => {
        expect(sumMaterialQty(result.materials, 'padstone')).toBe(4);
    });

    it('D7: 4 cavity closers total (2 per opening)', () => {
        expect(sumMaterialQty(result.materials, 'closer')).toBe(4);
    });

    it('D8: 2 cavity trays (1 per opening)', () => {
        expect(sumMaterialQty(result.materials, 'tray')).toBe(2);
    });
});
```

**Step 2: Commit RED**

```bash
git add src/calculators/__tests__/masonry-project.test.ts
git commit -m "test(masonry-project): add cross-reference validation — Scenarios A–D (RED)"
```

### Step 3: Implement masonry-project.ts

```typescript
// src/calculators/masonry-project.ts
import type { MasonryProjectInput, MasonryProjectResult } from './types';
import type { MaterialQuantity } from '../types';
import { calculateBricks } from './bricks';
import { calculateBlocks } from './blocks';
import { calculateMortar } from './mortar';
import { calculateSand } from './sand';
import { calculateCement } from './cement';
import { calculateWallTies } from './wall-ties';
import { calculateDPC } from './dpc';
import { calculateAirBricks } from './air-bricks';
import { calculateLintel } from './lintels';
import { calculatePadstone } from './padstones';
import { calculateCavityCloser } from './cavity-closers';
import { calculateCavityTray } from './cavity-trays';

const DEFAULT_WASTAGE = 5;

export function calculateMasonryProject(input: MasonryProjectInput): MasonryProjectResult {
    const wastage = input.wastagePercent ?? DEFAULT_WASTAGE;
    const openings = input.openings ?? [];
    const materials: MaterialQuantity[] = [];
    const warnings: string[] = [];

    // Opening deduction
    const openingAreaM2 = openings.reduce(
        (sum, o) => sum + (o.widthMm * o.heightMm) / 1_000_000,
        0
    );
    const netAreaM2 = Math.max(0, input.wallAreaM2 - openingAreaM2);

    // Outer leaf: bricks
    if ((input.wallType === 'brick' || input.wallType === 'cavity') && input.brickProductId) {
        const r = calculateBricks({ areaM2: netAreaM2, productId: input.brickProductId, wastagePercent: wastage });
        materials.push(...r.materials);
        warnings.push(...r.warnings);
    }

    // Inner leaf: blocks
    if ((input.wallType === 'block' || input.wallType === 'cavity') && input.blockProductId) {
        const r = calculateBlocks({ areaM2: netAreaM2, productId: input.blockProductId, wastagePercent: wastage });
        materials.push(...r.materials);
        warnings.push(...r.warnings);
    }

    // Mortar → sand + cement
    if (input.sandProductId && input.cementProductId) {
        let totalSandKg = 0;
        let totalCementKg = 0;

        if (input.wallType === 'brick' || input.wallType === 'cavity') {
            const m = calculateMortar({ areaM2: netAreaM2, unitType: 'brick', mixRatio: input.mixRatio, wastagePercent: wastage });
            totalSandKg += m.sandKg;
            totalCementKg += m.cementKg;
        }
        if (input.wallType === 'block' || input.wallType === 'cavity') {
            const m = calculateMortar({ areaM2: netAreaM2, unitType: 'block', mixRatio: input.mixRatio, wastagePercent: wastage });
            totalSandKg += m.sandKg;
            totalCementKg += m.cementKg;
        }

        materials.push(...calculateSand({ sandKg: totalSandKg, productId: input.sandProductId }).materials);
        materials.push(...calculateCement({ cementKg: totalCementKg, productId: input.cementProductId }).materials);
    }

    // Wall ties (cavity only, GROSS area to cover ties above/below openings)
    if (input.wallType === 'cavity' && input.cavityWidthMm !== undefined) {
        const r = calculateWallTies({ areaM2: input.wallAreaM2, cavityWidthMm: input.cavityWidthMm });
        materials.push(...r.materials);
        warnings.push(...r.warnings);
    }

    // DPC (doubled for cavity: one roll per leaf)
    if (input.includeDPC && input.dpcProductId) {
        const dpcResult = calculateDPC({ wallLengthM: input.wallLengthM, productId: input.dpcProductId });
        materials.push(...dpcResult.materials);
        if (input.wallType === 'cavity') {
            materials.push(...dpcResult.materials);
        }
    }

    // Air bricks
    if (input.includeAirBricks) {
        const r = calculateAirBricks({ wallLengthM: input.wallLengthM });
        materials.push(...r.materials);
    }

    // Per-opening items
    for (const opening of openings) {
        // Lintel
        const lintelProductId = input.wallType === 'cavity'
            ? input.steelLintelProductId
            : input.lintelProductId;
        if (lintelProductId) {
            const r = calculateLintel({ openingWidthMm: opening.widthMm, productId: lintelProductId });
            materials.push(...r.materials);
        }

        // Padstones (2 per opening: one each end of lintel)
        if (input.padstoneProductId) {
            const r = calculatePadstone({ productId: input.padstoneProductId, quantity: 2 });
            materials.push(...r.materials);
        }

        // Cavity-only items
        if (input.wallType === 'cavity') {
            if (input.cavityCloserProductId) {
                const r = calculateCavityCloser({
                    openingWidthMm: opening.widthMm,
                    openingHeightMm: opening.heightMm,
                    productId: input.cavityCloserProductId,
                });
                materials.push(...r.materials);
            }
            if (input.cavityTrayProductId) {
                const r = calculateCavityTray({ productId: input.cavityTrayProductId, quantity: 1 });
                materials.push(...r.materials);
            }
        }
    }

    return {
        materials,
        grossAreaM2: input.wallAreaM2,
        netAreaM2,
        openingAreaM2,
        totalOpenings: openings.length,
        warnings,
    };
}
```

**Step 4: Run GREEN + tsc + commit**

```bash
npx vitest run src/calculators/__tests__/masonry-project.test.ts
npx tsc --noEmit
git add src/calculators/masonry-project.ts
git commit -m "feat(masonry-project): implement calculateMasonryProject orchestrator — opening deduction, DPC doubled for cavity (TDD GREEN)"
```

---

## Task 6 — Update registry: brick-wall → live

**Files:**
- Modify: `src/projects/registry.ts`

**Step 1: Change status**

Find the `brick-wall` entry and update:
```typescript
// Before:
status: 'coming-soon', comingSoon: true,
// After:
status: 'live',
// (remove comingSoon property entirely)
```

**Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add src/projects/registry.ts
git commit -m "feat(registry): mark brick-wall calculator as live"
```

---

## Task 7 — Update barrel exports

**Files:**
- Modify: `src/calculators/index.ts`

**Step 1: Add exports**

Append at the end of the existing exports:
```typescript
export { calculateLintel } from './lintels';
export { calculatePadstone } from './padstones';
export { calculateCavityCloser } from './cavity-closers';
export { calculateCavityTray } from './cavity-trays';
export { calculateMasonryProject } from './masonry-project';
```

**Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add src/calculators/index.ts
git commit -m "feat(masonry): export calculateLintel, calculatePadstone, calculateCavityCloser, calculateCavityTray, calculateMasonryProject from barrel"
```

---

## Task 8 — Final Verification

**Step 1: Full test suite**

```bash
npx vitest run
```
Expected: 336 (previous) + 4 + 3 + 3 + 4 + 18 = **368 tests**, all passing.

**Step 2: Coverage**

```bash
npx vitest run --coverage
```
Expected: ≥95% statement, 100% function for masonry modules.

**Step 3: TypeScript**

```bash
npx tsc --noEmit
```
Expected: 0 errors.

**Step 4: Astro build**

```bash
npx astro build
```
Expected: build succeeds.

---

## Summary of Files

| File | Action |
|---|---|
| `src/calculators/types.ts` | **Modify** — append 10 interfaces |
| `src/calculators/__tests__/lintels.test.ts` | **Create** — 4 TCs |
| `src/calculators/lintels.ts` | **Create** |
| `src/calculators/__tests__/padstones.test.ts` | **Create** — 3 TCs |
| `src/calculators/padstones.ts` | **Create** |
| `src/calculators/__tests__/cavity-closers.test.ts` | **Create** — 3 TCs |
| `src/calculators/cavity-closers.ts` | **Create** |
| `src/calculators/__tests__/cavity-trays.test.ts` | **Create** — 4 TCs |
| `src/calculators/cavity-trays.ts` | **Create** |
| `src/calculators/__tests__/masonry-project.test.ts` | **Create** — 18 TCs (4 scenarios) |
| `src/calculators/masonry-project.ts` | **Create** |
| `src/projects/registry.ts` | **Modify** — brick-wall: coming-soon → live |
| `src/calculators/index.ts` | **Modify** — 5 new exports |
