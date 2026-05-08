# Phase 3.2 & 3.3 — MasonryProjectWizard & FlooringProjectWizard



**Goal:** Build two new project wizard React components using `WizardShell`, `NumberInput`, `FormField`, `ProductSelector`, and `ResultCard` — wiring to the existing `calculateMasonryProject()` and `calculateFlooringRoom()` engines.

**Architecture:** Each wizard is a single React component that owns its form state via `useState`, renders step content conditionally based on `currentStep`, and delegates navigation to `WizardShell`. Calculation runs when the user reaches the final step. Results display via `ResultCard` consuming the engine's `MaterialQuantity[]` output.

**Tech Stack:** React 18, TypeScript, Vitest + Testing Library, Tailwind v4

**Branch:** `wt/pedantic-hypatia`

---

### Task 1: Build MasonryProjectWizard

**Files:**
- Create: `src/components/MasonryProjectWizard.tsx`
- Create: `src/components/__tests__/MasonryProjectWizard.test.tsx`

**Step 1: Create the component file with imports and state**

```tsx
import React, { useState, useCallback } from 'react';
import { WizardShell } from './ui/WizardShell';
import { NumberInput } from './ui/NumberInput';
import { FormField } from './ui/FormField';
import { ProductSelector } from './ui/ProductSelector';
import { ResultCard } from './ui/ResultCard';
import { calculateMasonryProject } from '../calculators/masonry-project';
import {
    BRICK_PRODUCTS, BLOCK_PRODUCTS, CEMENT_PRODUCTS, SAND_PRODUCTS,
    DPC_PRODUCTS, CONCRETE_LINTEL_PRODUCTS,
} from '../data/masonry-products';
import type { MasonryProjectResult } from '../calculators/types';

const STEPS = [
    { label: 'Wall dimensions' },
    { label: 'Wall type & products' },
    { label: 'Openings' },
    { label: 'Mortar & options' },
    { label: 'Results' },
];

const WALL_TYPE_OPTIONS = [
    { value: 'brick', label: 'Brick wall (single leaf)' },
    { value: 'block', label: 'Block wall (single leaf)' },
    { value: 'cavity', label: 'Cavity wall (brick + block)' },
];

const MIX_RATIO_OPTIONS = [
    { value: '1:3', label: '1:3 (strong)' },
    { value: '1:4', label: '1:4 (general purpose)' },
];
```

State (all string-based for form inputs):
```tsx
export default function MasonryProjectWizard() {
    const [currentStep, setCurrentStep] = useState(0);
    const [error, setError] = useState<string | null>(null);

    // Step 1: Wall dimensions — repeater
    const [walls, setWalls] = useState<Array<{ length: string; height: string }>>([{ length: '', height: '' }]);

    // Step 2: Wall type & products
    const [wallType, setWallType] = useState<'brick' | 'block' | 'cavity'>('cavity');
    const [brickProductId, setBrickProductId] = useState(BRICK_PRODUCTS[0].id);
    const [blockProductId, setBlockProductId] = useState(BLOCK_PRODUCTS[0].id);

    // Step 3: Openings — repeater
    const [openings, setOpenings] = useState<Array<{ width: string; height: string }>>([]);

    // Step 4: Mortar & options
    const [mixRatio, setMixRatio] = useState<'1:3' | '1:4'>('1:4');
    const [cavityWidth, setCavityWidth] = useState('100');
    const [wastage, setWastage] = useState('5');
    const [includeDPC, setIncludeDPC] = useState(true);
    const [includeAirBricks, setIncludeAirBricks] = useState(true);

    // Step 5: Results
    const [result, setResult] = useState<MasonryProjectResult | null>(null);
```

**Step 2: Implement repeater helpers**

Wall repeater (same pattern as existing MasonryCalculator):
```tsx
const addWall = () => { setWalls([...walls, { length: '', height: '' }]); setError(null); };
const removeWall = (i: number) => { if (walls.length > 1) { setWalls(walls.filter((_, idx) => idx !== i)); setError(null); } };
const updateWall = (i: number, field: 'length' | 'height', value: string) => {
    setWalls(walls.map((w, idx) => idx === i ? { ...w, [field]: value } : w));
    setError(null);
};

const addOpening = () => { setOpenings([...openings, { width: '', height: '' }]); setError(null); };
const removeOpening = (i: number) => { setOpenings(openings.filter((_, idx) => idx !== i)); setError(null); };
const updateOpening = (i: number, field: 'width' | 'height', value: string) => {
    setOpenings(openings.map((o, idx) => idx === i ? { ...o, [field]: value } : o));
    setError(null);
};
```

**Step 3: Implement handleCalculate**

```tsx
const handleCalculate = useCallback(() => {
    setError(null);
    try {
        // Parse walls → compute total area and length
        const parsedWalls = walls.map(w => ({
            length: parseFloat(w.length),
            height: parseFloat(w.height),
        }));
        for (const w of parsedWalls) {
            if (isNaN(w.length) || w.length <= 0) { setError('Wall length must be greater than 0.'); return; }
            if (isNaN(w.height) || w.height <= 0) { setError('Wall height must be greater than 0.'); return; }
        }
        const wallAreaM2 = parsedWalls.reduce((sum, w) => sum + w.length * w.height, 0);
        const wallLengthM = parsedWalls.reduce((sum, w) => sum + w.length, 0);

        // Parse openings
        const parsedOpenings = openings.map(o => ({
            widthMm: parseFloat(o.width),
            heightMm: parseFloat(o.height),
        }));
        for (const o of parsedOpenings) {
            if (isNaN(o.widthMm) || o.widthMm <= 0) { setError('Opening width must be greater than 0.'); return; }
            if (isNaN(o.heightMm) || o.heightMm <= 0) { setError('Opening height must be greater than 0.'); return; }
        }

        const r = calculateMasonryProject({
            wallAreaM2,
            wallLengthM,
            wallType,
            brickProductId: (wallType === 'brick' || wallType === 'cavity') ? brickProductId : undefined,
            blockProductId: (wallType === 'block' || wallType === 'cavity') ? blockProductId : undefined,
            mixRatio,
            wastagePercent: parseFloat(wastage) || 5,
            cavityWidthMm: wallType === 'cavity' ? parseFloat(cavityWidth) || 100 : undefined,
            includeDPC,
            includeAirBricks,
            openings: parsedOpenings,
        });
        setResult(r);
    } catch (e) {
        setError(e instanceof Error ? e.message : 'Calculation error.');
    }
}, [walls, openings, wallType, brickProductId, blockProductId, mixRatio, wastage, cavityWidth, includeDPC, includeAirBricks]);
```

**Step 4: Implement the render with WizardShell and step content**

```tsx
const goNext = () => {
    if (currentStep === STEPS.length - 2) {
        // Moving to results step → calculate
        handleCalculate();
    }
    setCurrentStep(s => Math.min(s + 1, STEPS.length - 1));
};
const goBack = () => setCurrentStep(s => Math.max(s - 1, 0));

return (
    <WizardShell
        steps={STEPS}
        currentStep={currentStep}
        onNext={goNext}
        onBack={goBack}
        onStartOver={() => { setCurrentStep(0); setResult(null); }}
    >
        {error && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium mb-4">
                {error}
            </div>
        )}

        {/* Step 1: Wall dimensions */}
        {currentStep === 0 && (
            <div className="space-y-6">
                <div className="card space-y-4">
                    <h3 className="text-sm font-semibold">Wall sections</h3>
                    {walls.map((wall, i) => (
                        <div key={i} className="space-y-2">
                            <div className="grid grid-cols-2 gap-4">
                                <NumberInput id={`wall-len-${i}`} label={`Length (Wall ${i+1})`} value={wall.length} onChange={v => updateWall(i, 'length', v)} unit="m" placeholder="e.g. 5.0" min={0.1} />
                                <NumberInput id={`wall-ht-${i}`} label={`Height (Wall ${i+1})`} value={wall.height} onChange={v => updateWall(i, 'height', v)} unit="m" placeholder="e.g. 2.4" min={0.1} />
                            </div>
                            {walls.length > 1 && (
                                <div className="text-right">
                                    <button type="button" onClick={() => removeWall(i)} className="text-xs text-muted-foreground hover:text-destructive">Remove</button>
                                </div>
                            )}
                        </div>
                    ))}
                    <button type="button" onClick={addWall} className="text-sm text-brand-blue hover:underline font-medium">+ Add wall section</button>
                </div>
            </div>
        )}

        {/* Step 2: Wall type & products */}
        {currentStep === 1 && (
            <div className="space-y-6">
                <div className="card space-y-4">
                    <FormField id="wall-type" label="Wall type" type="select" value={wallType} onChange={e => setWallType(e.target.value as 'brick' | 'block' | 'cavity')} options={WALL_TYPE_OPTIONS} />
                    {(wallType === 'brick' || wallType === 'cavity') && (
                        <ProductSelector id="brick-product" label="Brick product" products={BRICK_PRODUCTS} value={brickProductId} onChange={e => setBrickProductId(e.target.value)} />
                    )}
                    {(wallType === 'block' || wallType === 'cavity') && (
                        <ProductSelector id="block-product" label="Block product" products={BLOCK_PRODUCTS} value={blockProductId} onChange={e => setBlockProductId(e.target.value)} />
                    )}
                </div>
            </div>
        )}

        {/* Step 3: Openings */}
        {currentStep === 2 && (
            <div className="space-y-6">
                <div className="card space-y-4">
                    <h3 className="text-sm font-semibold">Doors & windows</h3>
                    {openings.length === 0 && <p className="text-sm text-muted-foreground">No openings added. Click below to add doors or windows.</p>}
                    {openings.map((o, i) => (
                        <div key={i} className="space-y-2">
                            <div className="grid grid-cols-2 gap-4">
                                <NumberInput id={`opening-w-${i}`} label={`Width (${i+1})`} value={o.width} onChange={v => updateOpening(i, 'width', v)} unit="mm" placeholder="e.g. 1200" min={1} />
                                <NumberInput id={`opening-h-${i}`} label={`Height (${i+1})`} value={o.height} onChange={v => updateOpening(i, 'height', v)} unit="mm" placeholder="e.g. 2100" min={1} />
                            </div>
                            <div className="text-right">
                                <button type="button" onClick={() => removeOpening(i)} className="text-xs text-muted-foreground hover:text-destructive">Remove</button>
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={addOpening} className="text-sm text-brand-blue hover:underline font-medium">+ Add opening</button>
                </div>
            </div>
        )}

        {/* Step 4: Mortar & options */}
        {currentStep === 3 && (
            <div className="space-y-6">
                <div className="card space-y-4">
                    <FormField id="mix-ratio" label="Mortar mix ratio" type="select" value={mixRatio} onChange={e => setMixRatio(e.target.value as '1:3' | '1:4')} options={MIX_RATIO_OPTIONS} />
                    <NumberInput id="wastage" label="Wastage allowance" value={wastage} onChange={setWastage} unit="%" min={0} max={50} placeholder="e.g. 5" />
                    {wallType === 'cavity' && (
                        <NumberInput id="cavity-width" label="Cavity width" value={cavityWidth} onChange={setCavityWidth} unit="mm" min={50} placeholder="e.g. 100" />
                    )}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={includeDPC} onChange={e => setIncludeDPC(e.target.checked)} className="rounded" />
                            Include DPC (damp proof course)
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={includeAirBricks} onChange={e => setIncludeAirBricks(e.target.checked)} className="rounded" />
                            Include air bricks
                        </label>
                    </div>
                </div>
            </div>
        )}

        {/* Step 5: Results */}
        {currentStep === 4 && result && (
            <ResultCard title="Masonry Materials" materials={result.materials} warnings={result.warnings} />
        )}
    </WizardShell>
);
```

**Step 5: Create smoke tests**

```tsx
// src/components/__tests__/MasonryProjectWizard.test.tsx
import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MasonryProjectWizard from '../MasonryProjectWizard';

test('renders wizard with wall dimensions step', () => {
    render(<MasonryProjectWizard />);
    expect(screen.getByText('Step 1 of 5 — Wall dimensions')).toBeInTheDocument();
    expect(screen.getByLabelText(/length.*wall 1/i)).toBeInTheDocument();
});

test('renders wall type step after Next', async () => {
    render(<MasonryProjectWizard />);
    // Fill in wall dimensions first
    const lengthInput = screen.getByLabelText(/length.*wall 1/i);
    const heightInput = screen.getByLabelText(/height.*wall 1/i);
    await import('@testing-library/user-event').then(m => m.default.setup().type(lengthInput, '5'));
    await import('@testing-library/user-event').then(m => m.default.setup().type(heightInput, '2.4'));
    screen.getByText('Next').click();
    expect(screen.getByText(/wall type/i)).toBeInTheDocument();
});
```

**Step 6: Run tests**

Run: `npx vitest run src/components/__tests__/MasonryProjectWizard.test.tsx`
Expected: PASS

**Step 7: Commit**

```bash
git add src/components/MasonryProjectWizard.tsx src/components/__tests__/MasonryProjectWizard.test.tsx
git commit -m "feat(masonry-wizard): build MasonryProjectWizard using WizardShell + design system"
```

---

### Task 2: Build FlooringProjectWizard

**Files:**
- Create: `src/components/FlooringProjectWizard.tsx`
- Create: `src/components/__tests__/FlooringProjectWizard.test.tsx`

**Step 1: Create the component with imports and state**

```tsx
import React, { useState, useCallback } from 'react';
import { WizardShell } from './ui/WizardShell';
import { NumberInput } from './ui/NumberInput';
import { FormField } from './ui/FormField';
import { ResultCard } from './ui/ResultCard';
import { calculateFlooringRoom } from '../calculators/flooring-room';
import type { FlooringRoomResult, FlooringType, LayingPattern } from '../calculators/types';

const STEPS = [
    { label: 'Room dimensions' },
    { label: 'Flooring type' },
    { label: 'Ancillaries' },
    { label: 'Results' },
];

const FLOORING_TYPE_OPTIONS = [
    { value: 'engineered', label: 'Engineered wood' },
    { value: 'laminate', label: 'Laminate' },
    { value: 'solid-wood', label: 'Solid wood' },
    { value: 'lvt', label: 'Luxury vinyl tile (LVT)' },
];

const PATTERN_OPTIONS = [
    { value: 'straight', label: 'Straight (5% waste)' },
    { value: 'brick-bond', label: 'Brick bond (10% waste)' },
    { value: 'diagonal', label: 'Diagonal (15% waste)' },
    { value: 'herringbone', label: 'Herringbone (15% waste)' },
];

const INSTALL_METHOD_OPTIONS = [
    { value: 'floating', label: 'Floating' },
    { value: 'glue-down', label: 'Glue-down' },
];

export default function FlooringProjectWizard() {
    const [currentStep, setCurrentStep] = useState(0);
    const [error, setError] = useState<string | null>(null);

    // Step 1: Room dimensions
    const [roomLength, setRoomLength] = useState('');
    const [roomWidth, setRoomWidth] = useState('');
    const [secondLength, setSecondLength] = useState('');
    const [secondWidth, setSecondWidth] = useState('');
    const [hasLShape, setHasLShape] = useState(false);

    // Step 2: Flooring type
    const [flooringType, setFlooringType] = useState<FlooringType>('laminate');
    const [coveragePerPack, setCoveragePerPack] = useState('2.0');
    const [layingPattern, setLayingPattern] = useState<LayingPattern>('brick-bond');
    const [installMethod, setInstallMethod] = useState<'floating' | 'glue-down'>('floating');

    // Step 3: Ancillaries
    const [includeUnderlay, setIncludeUnderlay] = useState(true);
    const [includeAdhesive, setIncludeAdhesive] = useState(false);
    const [includeDPM, setIncludeDPM] = useState(false);
    const [includeScotia, setIncludeScotia] = useState(true);
    const [includeThresholds, setIncludeThresholds] = useState(true);
    const [doorwayCount, setDoorwayCount] = useState('1');

    // Step 4: Results
    const [result, setResult] = useState<FlooringRoomResult | null>(null);
```

**Step 2: Implement handleCalculate**

```tsx
const handleCalculate = useCallback(() => {
    setError(null);
    try {
        const length = parseFloat(roomLength);
        const width = parseFloat(roomWidth);
        if (isNaN(length) || length <= 0) { setError('Room length must be greater than 0.'); return; }
        if (isNaN(width) || width <= 0) { setError('Room width must be greater than 0.'); return; }

        const coverage = parseFloat(coveragePerPack);
        if (isNaN(coverage) || coverage <= 0) { setError('Coverage per pack must be greater than 0.'); return; }

        const room: { lengthM: number; widthM: number; secondLengthM?: number; secondWidthM?: number } = {
            lengthM: length,
            widthM: width,
        };
        if (hasLShape) {
            const sl = parseFloat(secondLength);
            const sw = parseFloat(secondWidth);
            if (!isNaN(sl) && sl > 0 && !isNaN(sw) && sw > 0) {
                room.secondLengthM = sl;
                room.secondWidthM = sw;
            }
        }

        const r = calculateFlooringRoom({
            room,
            flooringType,
            coveragePerPackM2: coverage,
            layingPattern,
            doorwayCount: parseInt(doorwayCount) || 1,
            installMethod: flooringType === 'solid-wood' ? installMethod : undefined,
            includeUnderlay,
            includeAdhesive: flooringType === 'solid-wood' && installMethod === 'glue-down' ? includeAdhesive : false,
            includeDPM,
            includeScotia,
            includeThresholds,
        });
        setResult(r);
    } catch (e) {
        setError(e instanceof Error ? e.message : 'Calculation error.');
    }
}, [roomLength, roomWidth, secondLength, secondWidth, hasLShape, flooringType, coveragePerPack, layingPattern, installMethod, doorwayCount, includeUnderlay, includeAdhesive, includeDPM, includeScotia, includeThresholds]);
```

**Step 3: Implement the render**

```tsx
const goNext = () => {
    if (currentStep === STEPS.length - 2) handleCalculate();
    setCurrentStep(s => Math.min(s + 1, STEPS.length - 1));
};
const goBack = () => setCurrentStep(s => Math.max(s - 1, 0));

return (
    <WizardShell
        steps={STEPS}
        currentStep={currentStep}
        onNext={goNext}
        onBack={goBack}
        onStartOver={() => { setCurrentStep(0); setResult(null); }}
    >
        {error && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium mb-4">
                {error}
            </div>
        )}

        {/* Step 1: Room dimensions */}
        {currentStep === 0 && (
            <div className="space-y-6">
                <div className="card space-y-4">
                    <h3 className="text-sm font-semibold">Room size</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <NumberInput id="room-length" label="Length" value={roomLength} onChange={setRoomLength} unit="m" placeholder="e.g. 5.0" min={0.1} />
                        <NumberInput id="room-width" label="Width" value={roomWidth} onChange={setRoomWidth} unit="m" placeholder="e.g. 4.0" min={0.1} />
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={hasLShape} onChange={e => setHasLShape(e.target.checked)} className="rounded" />
                        L-shaped room (add extension)
                    </label>
                    {hasLShape && (
                        <div className="grid grid-cols-2 gap-4">
                            <NumberInput id="second-length" label="Extension length" value={secondLength} onChange={setSecondLength} unit="m" placeholder="e.g. 2.0" min={0.1} />
                            <NumberInput id="second-width" label="Extension width" value={secondWidth} onChange={setSecondWidth} unit="m" placeholder="e.g. 1.5" min={0.1} />
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* Step 2: Flooring type */}
        {currentStep === 1 && (
            <div className="space-y-6">
                <div className="card space-y-4">
                    <FormField id="flooring-type" label="Flooring type" type="select" value={flooringType} onChange={e => setFlooringType(e.target.value as FlooringType)} options={FLOORING_TYPE_OPTIONS} />
                    <NumberInput id="coverage" label="Coverage per pack" value={coveragePerPack} onChange={setCoveragePerPack} unit="m²" placeholder="e.g. 2.0" min={0.1} step={0.1} />
                    <FormField id="laying-pattern" label="Laying pattern" type="select" value={layingPattern} onChange={e => setLayingPattern(e.target.value as LayingPattern)} options={PATTERN_OPTIONS} />
                    {flooringType === 'solid-wood' && (
                        <FormField id="install-method" label="Install method" type="select" value={installMethod} onChange={e => setInstallMethod(e.target.value as 'floating' | 'glue-down')} options={INSTALL_METHOD_OPTIONS} />
                    )}
                </div>
            </div>
        )}

        {/* Step 3: Ancillaries */}
        {currentStep === 2 && (
            <div className="space-y-6">
                <div className="card space-y-4">
                    <h3 className="text-sm font-semibold">Additional materials</h3>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={includeUnderlay} onChange={e => setIncludeUnderlay(e.target.checked)} className="rounded" />
                            Underlay
                        </label>
                        {flooringType === 'solid-wood' && installMethod === 'glue-down' && (
                            <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={includeAdhesive} onChange={e => setIncludeAdhesive(e.target.checked)} className="rounded" />
                                Flooring adhesive
                            </label>
                        )}
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={includeDPM} onChange={e => setIncludeDPM(e.target.checked)} className="rounded" />
                            DPM (damp proof membrane)
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={includeScotia} onChange={e => setIncludeScotia(e.target.checked)} className="rounded" />
                            Scotia beading (edge trim)
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={includeThresholds} onChange={e => setIncludeThresholds(e.target.checked)} className="rounded" />
                            Threshold strips
                        </label>
                    </div>
                    <NumberInput id="doorway-count" label="Number of doorways" value={doorwayCount} onChange={setDoorwayCount} min={0} step={1} placeholder="e.g. 1" />
                </div>
            </div>
        )}

        {/* Step 4: Results */}
        {currentStep === 3 && result && (
            <ResultCard title="Flooring Materials" materials={result.totalMaterials} warnings={result.warnings} />
        )}
    </WizardShell>
);
```

**Step 4: Create smoke tests**

```tsx
// src/components/__tests__/FlooringProjectWizard.test.tsx
import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FlooringProjectWizard from '../FlooringProjectWizard';

test('renders wizard with room dimensions step', () => {
    render(<FlooringProjectWizard />);
    expect(screen.getByText('Step 1 of 4 — Room dimensions')).toBeInTheDocument();
    expect(screen.getByLabelText(/length/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/width/i)).toBeInTheDocument();
});
```

**Step 5: Run tests**

Run: `npx vitest run src/components/__tests__/FlooringProjectWizard.test.tsx`
Expected: PASS

**Step 6: Commit**

```bash
git add src/components/FlooringProjectWizard.tsx src/components/__tests__/FlooringProjectWizard.test.tsx
git commit -m "feat(flooring-wizard): build FlooringProjectWizard using WizardShell + design system"
```

---

### Task 3: Run full test suite and verify

**Step 1: Run full test suite**

Run: `npx vitest run`
Expected: all pass

**Step 2: Run type check**

Run: `npx tsc --noEmit`
Expected: no new errors

---

## Summary

| File | Action | Notes |
|------|--------|-------|
| `src/components/MasonryProjectWizard.tsx` | Create | 5-step wizard, wall repeater, opening repeater, ProductSelector for bricks/blocks |
| `src/components/__tests__/MasonryProjectWizard.test.tsx` | Create | Smoke tests |
| `src/components/FlooringProjectWizard.tsx` | Create | 4-step wizard, L-shape support, ancillary checkboxes |
| `src/components/__tests__/FlooringProjectWizard.test.tsx` | Create | Smoke tests |
