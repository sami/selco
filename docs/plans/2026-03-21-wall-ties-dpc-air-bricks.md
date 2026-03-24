# Wall Ties, DPC & Air Bricks Calculators — TDD Build

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extract standalone `calculateWallTies`, `calculateDPC`, and `calculateAirBricks` calculators into dedicated modules following the product-ID lookup pattern, with tests written first.

**Architecture:** Same pattern as mortar/sand/cement (Prompt 3). Old `masonry.ts` implementations stay untouched (used by `calculateMasonry()`). New standalone modules in `src/calculators/`. Barrel (`index.ts`) re-routed to standalone versions.

**Tech Stack:** TypeScript, Vitest, product catalogues in `src/data/masonry-products.ts`.

---

## Naming Constraints

`types.ts` already exports:
- `WallTiesResult` — used by `masonry.ts` (fields: `general`, `atOpenings`, `total`)
- `DPCResult` — used by `masonry.ts` (fields: `length`, `widthMm`)

New standalone result types must avoid collision:
- New: `WallTiesCalcResult` (not `WallTiesResult`)
- New: `DPCCalcResult` (not `DPCResult`)

## Existing Products (already in masonry-products.ts)

**WALL_TIE_PRODUCTS (BS EN 1243):**
| id | tieLengthMm | minCavityMm | maxCavityMm | packSizes | primaryPackSize |
|---|---|---|---|---|---|
| `wall-tie-200-50-75` | 200 | 50 | 75 | [50, 250] | 250 |
| `wall-tie-225-75-100` | 225 | 75 | 100 | [50, 250] | 250 |
| `wall-tie-250-100-125` | 250 | 100 | 125 | [50, 250] | 250 |
| `wall-tie-275-125-150` | 275 | 125 | 150 | [50, 250] | 250 |

**DPC_PRODUCTS (all polythene, 30m rolls):**
| id | widthMm | rollLengthM |
|---|---|---|
| `dpc-polythene-100mm-30m` | 100 | 30 |
| `dpc-polythene-112mm-30m` | 112 | 30 |
| `dpc-polythene-150mm-30m` | 150 | 30 |
| `dpc-polythene-225mm-30m` | 225 | 30 |

No air brick products exist — `calculateAirBricks` is product-agnostic.

## Pre-Computed Test Expectations

### Wall Ties (2.5 ties/m², BS EN 1243)
| TC | areaM2 | cavityMm | packSize | tiesNeeded | packsNeeded | tieLengthMm |
|---|---|---|---|---|---|---|
| TC1 | 24 | 75 | default | **60** (24×2.5) | 1 (60/250) | **225** |
| TC2 | 10 | 50 | default | **25** (10×2.5) | 1 (25/250) | **200** |
| TC3a | 24 | 75 | 50 | 60 | **2** (⌈60/50⌉) | — |
| TC3b | 24 | 75 | 250 | 60 | **1** (⌈60/250⌉) | — |
| TC4 | any | 50 | — | — | — | productId=`wall-tie-200-50-75` |
| TC5 | any | 200 | — | throws: cavity 200mm |

### DPC (30m rolls)
| TC | wallLengthM | productId | rollsNeeded | widthMm |
|---|---|---|---|---|
| TC1 | 20 | `dpc-polythene-112mm-30m` | **1** (⌈20/30⌉) | 112 |
| TC2 | 35 | `dpc-polythene-112mm-30m` | **2** (⌈35/30⌉) | 112 |
| TC3 | `recommendDPCProductId(102.5)` | — | → `dpc-polythene-112mm-30m` |

### Air Bricks (1 per 450mm of wall, no product catalogue)
| TC | wallLengthM | airBricksNeeded |
|---|---|---|
| TC1 | 10 | **23** (⌈10000/450⌉) |
| TC2 | 4.5 | **10** (⌈4500/450⌉ = 10.0 exactly) |
| TC3 | 0 | **0** |

---

## Task 0 — Add 6 I/O types to src/calculators/types.ts

Append after the `CementResult` interface (the last entry added in Prompt 3). No import changes needed — `MaterialQuantity` is already in scope.

```typescript
// ---------------------------------------------------------------------------
// Wall ties, DPC, and air brick calculator I/O
// ---------------------------------------------------------------------------

/** Input for the standalone wall ties calculator. */
export interface WallTiesInput {
    areaM2: number;
    /** Cavity width in mm — used to auto-select the correct tie length. */
    cavityWidthMm: number;
    /**
     * Pack size to use for rounding. Defaults to product's primaryPackSize (250).
     * All wall tie products stock both 50 and 250 packs.
     */
    packSize?: 50 | 250;
}

/**
 * Result from calculateWallTies() in wall-ties.ts.
 * Named WallTiesCalcResult to avoid collision with the legacy WallTiesResult
 * used by masonry.ts (which has fields: general, atOpenings, total).
 */
export interface WallTiesCalcResult {
    tiesNeeded: number;
    packsNeeded: number;
    /** The pack size used in the calculation. */
    packSize: number;
    tieLengthMm: number;
    productId: string;
    productName: string;
    materials: MaterialQuantity[];
    warnings: string[];
}

/** Input for the standalone DPC calculator. */
export interface DPCInput {
    wallLengthM: number;
    productId: string;
}

/**
 * Result from calculateDPC() in dpc.ts.
 * Named DPCCalcResult to avoid collision with the legacy DPCResult
 * used by masonry.ts (which has fields: length, widthMm).
 */
export interface DPCCalcResult {
    rollsNeeded: number;
    rollLengthM: number;
    widthMm: number;
    productName: string;
    materials: MaterialQuantity[];
}

/** Input for the standalone air bricks calculator. */
export interface AirBricksInput {
    wallLengthM: number;
}

export interface AirBricksResult {
    airBricksNeeded: number;
    materials: MaterialQuantity[];
}
```

**Verification:** `npx tsc --noEmit` — 0 new errors.

**Commit:** `feat(masonry): add WallTiesInput/CalcResult, DPCInput/CalcResult, AirBricksInput/Result to types.ts`

---

## Task 1 — Create src/calculators/__tests__/wall-ties.test.ts (test-first)

```typescript
import { describe, it, expect } from 'vitest';
import { calculateWallTies } from '../wall-ties';

describe('calculateWallTies()', () => {
    // TC1 — 24 m² wall, 75mm cavity → 60 ties, 225mm tie
    it('TC1: 24 m² wall, 75mm cavity → 60 ties, 225mm tie', () => {
        const r = calculateWallTies({ areaM2: 24, cavityWidthMm: 75 });
        expect(r.tiesNeeded).toBe(60);
        expect(r.tieLengthMm).toBe(225);
    });

    // TC2 — 10 m² wall, 50mm cavity → 25 ties, 200mm tie
    it('TC2: 10 m² wall, 50mm cavity → 25 ties, 200mm tie', () => {
        const r = calculateWallTies({ areaM2: 10, cavityWidthMm: 50 });
        expect(r.tiesNeeded).toBe(25);
        expect(r.tieLengthMm).toBe(200);
    });

    // TC3 — pack rounding (same 60 ties, different pack sizes)
    it('TC3: 60 ties, pack of 50 → 2 packs; pack of 250 → 1 pack', () => {
        const r50 = calculateWallTies({ areaM2: 24, cavityWidthMm: 75, packSize: 50 });
        expect(r50.packsNeeded).toBe(2);
        const r250 = calculateWallTies({ areaM2: 24, cavityWidthMm: 75, packSize: 250 });
        expect(r250.packsNeeded).toBe(1);
    });

    // TC4 — product-ID lookup by cavity width
    it('TC4: cavity 50mm → wall-tie-200-50-75; cavity 100mm → wall-tie-250-100-125', () => {
        const r50 = calculateWallTies({ areaM2: 10, cavityWidthMm: 50 });
        expect(r50.productId).toBe('wall-tie-200-50-75');
        const r100 = calculateWallTies({ areaM2: 10, cavityWidthMm: 100 });
        expect(r100.productId).toBe('wall-tie-250-100-125');
    });

    // TC5 — invalid cavity width
    it('TC5: cavity 200mm → throws descriptive error', () => {
        expect(() =>
            calculateWallTies({ areaM2: 10, cavityWidthMm: 200 })
        ).toThrow('No wall tie product found for cavity width 200mm');
    });

    // TC6 — MaterialQuantity shape
    it('TC6: materials has 1 entry with correct shape', () => {
        const r = calculateWallTies({ areaM2: 24, cavityWidthMm: 75 });
        expect(r.materials).toHaveLength(1);
        const m = r.materials[0];
        expect(m.unit).toBe('each');
        expect(m.quantity).toBe(60);
        expect(m.packSize).toBe(250);   // default pack (primaryPackSize)
        expect(m.packsNeeded).toBe(1);  // ceil(60/250) = 1
    });
});
```

**Confirm RED:** `node node_modules/.bin/vitest run src/calculators/__tests__/wall-ties.test.ts 2>&1 | tail -5` → `1 failed`

**Commit:** `test(wall-ties): add TDD test suite — TC1–TC6 (RED)`

---

## Task 2 — Implement src/calculators/wall-ties.ts

```typescript
import type { WallTiesInput, WallTiesCalcResult } from './types';
import type { MaterialQuantity } from '../types';
import { WALL_TIE_PRODUCTS } from '../data/masonry-products';
import { packsNeeded } from './primitives';

/** BS EN 1243: standard tie density for cavity walls. */
const TIES_PER_M2 = 2.5;

export function calculateWallTies(input: WallTiesInput): WallTiesCalcResult {
    const { areaM2, cavityWidthMm, packSize } = input;

    const product = WALL_TIE_PRODUCTS.find(
        p => cavityWidthMm >= p.minCavityMm && cavityWidthMm <= p.maxCavityMm
    );

    if (!product) {
        throw new Error(
            `No wall tie product found for cavity width ${cavityWidthMm}mm. ` +
            `Supported range: 50–150mm.`
        );
    }

    const selectedPackSize = packSize ?? product.primaryPackSize;
    const tiesNeeded = Math.ceil(areaM2 * TIES_PER_M2);
    const packs = packsNeeded(tiesNeeded, selectedPackSize);

    const materials: MaterialQuantity[] = [
        {
            material: product.name,
            quantity: tiesNeeded,
            unit: 'each',
            packSize: selectedPackSize,
            packsNeeded: packs,
        },
    ];

    return {
        tiesNeeded,
        packsNeeded: packs,
        packSize: selectedPackSize,
        tieLengthMm: product.tieLengthMm,
        productId: product.id,
        productName: product.name,
        materials,
        warnings: [],
    };
}
```

**Verification:** `node node_modules/.bin/vitest run src/calculators/__tests__/wall-ties.test.ts 2>&1 | tail -5` → `6 passed`

**Commit:** `feat(wall-ties): implement calculateWallTies with cavity-width product lookup (TDD GREEN)`

---

## Task 3 — Create src/calculators/__tests__/dpc.test.ts (test-first)

```typescript
import { describe, it, expect } from 'vitest';
import { calculateDPC, recommendDPCProductId } from '../dpc';

describe('calculateDPC()', () => {
    // TC1 — 20m wall, 112mm DPC → 1 roll (20 ≤ 30)
    it('TC1: 20m wall, 112mm DPC → 1 roll', () => {
        const r = calculateDPC({ wallLengthM: 20, productId: 'dpc-polythene-112mm-30m' });
        expect(r.rollsNeeded).toBe(1);
        expect(r.widthMm).toBe(112);
    });

    // TC2 — 35m wall → 2 rolls (35 > 30, ceil(35/30) = 2)
    it('TC2: 35m wall, 112mm DPC → 2 rolls', () => {
        const r = calculateDPC({ wallLengthM: 35, productId: 'dpc-polythene-112mm-30m' });
        expect(r.rollsNeeded).toBe(2);
    });

    // TC3 — width selection: 102.5mm brick leaf → 112mm is the next available width
    it('TC3: 102.5mm brick leaf → recommend dpc-polythene-112mm-30m', () => {
        const productId = recommendDPCProductId(102.5);
        expect(productId).toBe('dpc-polythene-112mm-30m');
    });

    // TC4 — MaterialQuantity shape
    it('TC4: materials has 1 entry with correct shape', () => {
        const r = calculateDPC({ wallLengthM: 20, productId: 'dpc-polythene-112mm-30m' });
        expect(r.materials).toHaveLength(1);
        const m = r.materials[0];
        expect(m.unit).toBe('m');
        expect(m.quantity).toBe(20);
        expect(m.packSize).toBe(30);
        expect(m.packsNeeded).toBe(1);
    });
});
```

**Confirm RED:** `node node_modules/.bin/vitest run src/calculators/__tests__/dpc.test.ts 2>&1 | tail -5` → `1 failed`

**Commit:** `test(dpc): add TDD test suite — TC1–TC4 (RED)`

---

## Task 4 — Implement src/calculators/dpc.ts

```typescript
import type { DPCInput, DPCCalcResult } from './types';
import type { MaterialQuantity } from '../types';
import { DPC_PRODUCTS } from '../data/masonry-products';
import { packsNeeded } from './primitives';

/**
 * Recommend the narrowest DPC product whose width covers the given leaf width.
 * Standard 102.5mm brick leaf → 112mm DPC (next width up from 100mm).
 */
export function recommendDPCProductId(leafWidthMm: number): string {
    const match = [...DPC_PRODUCTS]
        .sort((a, b) => a.widthMm - b.widthMm)
        .find(p => p.widthMm >= leafWidthMm);

    if (!match) {
        throw new Error(
            `No DPC product wide enough for ${leafWidthMm}mm leaf. ` +
            `Widest available: ${Math.max(...DPC_PRODUCTS.map(p => p.widthMm))}mm.`
        );
    }

    return match.id;
}

export function calculateDPC(input: DPCInput): DPCCalcResult {
    const { wallLengthM, productId } = input;

    const product = DPC_PRODUCTS.find(p => p.id === productId);
    if (!product) {
        throw new Error(
            `Unknown DPC product ID: "${productId}". Check DPC_PRODUCTS catalogue.`
        );
    }

    const rolls = packsNeeded(wallLengthM, product.rollLengthM);

    const materials: MaterialQuantity[] = [
        {
            material: product.name,
            quantity: wallLengthM,
            unit: 'm',
            packSize: product.rollLengthM,
            packsNeeded: rolls,
        },
    ];

    return {
        rollsNeeded: rolls,
        rollLengthM: product.rollLengthM,
        widthMm: product.widthMm,
        productName: product.name,
        materials,
    };
}
```

**Verification:** `node node_modules/.bin/vitest run src/calculators/__tests__/dpc.test.ts 2>&1 | tail -5` → `4 passed`

**Commit:** `feat(dpc): implement calculateDPC with product-ID lookup and recommendDPCProductId (TDD GREEN)`

---

## Task 5 — Create src/calculators/__tests__/air-bricks.test.ts (test-first)

```typescript
import { describe, it, expect } from 'vitest';
import { calculateAirBricks } from '../air-bricks';

describe('calculateAirBricks()', () => {
    // TC1 — 10m wall → ceil(10000 / 450) = ceil(22.22) = 23
    it('TC1: 10m wall → 23 air bricks', () => {
        const r = calculateAirBricks({ wallLengthM: 10 });
        expect(r.airBricksNeeded).toBe(23);
    });

    // TC2 — 4.5m wall → ceil(4500 / 450) = ceil(10.0) = 10 (exact)
    it('TC2: 4.5m wall → 10 air bricks', () => {
        const r = calculateAirBricks({ wallLengthM: 4.5 });
        expect(r.airBricksNeeded).toBe(10);
    });

    // TC3 — zero length → 0
    it('TC3: zero wall length → 0 air bricks', () => {
        const r = calculateAirBricks({ wallLengthM: 0 });
        expect(r.airBricksNeeded).toBe(0);
    });

    // TC4 — MaterialQuantity shape
    it('TC4: materials has 1 entry with correct shape', () => {
        const r = calculateAirBricks({ wallLengthM: 10 });
        expect(r.materials).toHaveLength(1);
        const m = r.materials[0];
        expect(m.unit).toBe('each');
        expect(m.quantity).toBe(23);
    });
});
```

**Confirm RED:** `node node_modules/.bin/vitest run src/calculators/__tests__/air-bricks.test.ts 2>&1 | tail -5` → `1 failed`

**Commit:** `test(air-bricks): add TDD test suite — TC1–TC4 (RED)`

---

## Task 6 — Implement src/calculators/air-bricks.ts

```typescript
import type { AirBricksInput, AirBricksResult } from './types';
import type { MaterialQuantity } from '../types';

/** BS 5250: 1 air brick per 450mm of external wall at DPC level. */
const AIR_BRICK_SPACING_MM = 450;
const AIR_BRICK_DESCRIPTION = 'Air Brick 204 × 60mm';

export function calculateAirBricks(input: AirBricksInput): AirBricksResult {
    const wallLengthMm = input.wallLengthM * 1000;
    const airBricksNeeded = Math.ceil(wallLengthMm / AIR_BRICK_SPACING_MM);

    const materials: MaterialQuantity[] = [
        {
            material: AIR_BRICK_DESCRIPTION,
            quantity: airBricksNeeded,
            unit: 'each',
        },
    ];

    return { airBricksNeeded, materials };
}
```

**Verification:** `node node_modules/.bin/vitest run src/calculators/__tests__/air-bricks.test.ts 2>&1 | tail -5` → `4 passed`

**Commit:** `feat(air-bricks): implement calculateAirBricks — 1 per 450mm wall (TDD GREEN)`

---

## Task 7 — Update src/calculators/index.ts barrel

Find the masonry re-export block and remove `calculateWallTies` and `calculateDPC` from it. Then add the three new standalone exports.

**Before:**
```typescript
export {
    UNITS_PER_M2,
    MORTAR_PER_M2,
    WALL_TYPES,
    SAND_BAG_SIZES,
    calculateWallArea,
    calculateWallTies,
    calculateLintels,
    calculateDPC,
    calculateMasonry,
} from './masonry';
```

**After:**
```typescript
export {
    UNITS_PER_M2,
    MORTAR_PER_M2,
    WALL_TYPES,
    SAND_BAG_SIZES,
    calculateWallArea,
    calculateLintels,
    calculateMasonry,
} from './masonry';

export { calculateWallTies } from './wall-ties';
export { calculateDPC, recommendDPCProductId } from './dpc';
export { calculateAirBricks } from './air-bricks';
```

**⚠ Risk check before editing:** `grep -r "import.*calculateWallTies\|import.*calculateDPC" src --include="*.ts" --include="*.tsx" -l`
Expected: no consumer imports these from the barrel (masonry.test.ts imports directly from `'./masonry'`). Safe to re-route.

**Verification:** `npx tsc --noEmit 2>&1 | grep "error TS"` — no new errors.

**Commit:** `refactor(masonry): route calculateWallTies, calculateDPC barrel to standalone modules; add calculateAirBricks`

---

## Task 8 — Final Verification

```bash
npx tsc --noEmit 2>&1 | grep "error TS"
node node_modules/.bin/vitest run 2>&1 | tail -6
```

**Expected:**
- 0 new TypeScript errors (2 pre-existing in `astro.config.mjs` + `vitest.config.ts` are normal)
- Previous: 322 tests
- New: +6 (wall-ties) + 4 (dpc) + 4 (air-bricks) = **336 tests**

---

## Files Created / Modified

| File | Action |
|---|---|
| `src/calculators/types.ts` | **Append** 6 new interfaces |
| `src/calculators/__tests__/wall-ties.test.ts` | **Create** — 6 TCs |
| `src/calculators/wall-ties.ts` | **Create** |
| `src/calculators/__tests__/dpc.test.ts` | **Create** — 4 TCs |
| `src/calculators/dpc.ts` | **Create** |
| `src/calculators/__tests__/air-bricks.test.ts` | **Create** — 4 TCs |
| `src/calculators/air-bricks.ts` | **Create** |
| `src/calculators/index.ts` | **Update** barrel |
| `src/calculators/masonry.ts` | **No change** |
