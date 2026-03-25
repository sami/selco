import React, { useState, useCallback } from 'react';
import { WizardShell } from './ui/WizardShell';
import { NumberInput } from './ui/NumberInput';
import { FormField } from './ui/FormField';
import { ProductSelector } from './ui/ProductSelector';
import { ResultCard } from './ui/ResultCard';
import { calculateMasonryProject } from '../calculators/masonry-project';
import { BRICK_PRODUCTS, BLOCK_PRODUCTS } from '../data/masonry-products';
import type { MasonryProjectResult } from '../calculators/types';

const STEPS = [
    { label: 'Wall dimensions' },
    { label: 'Wall type & products' },
    { label: 'Openings', optional: true },
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

export default function MasonryProjectWizard() {
    const [currentStep, setCurrentStep] = useState(0);
    const [error, setError] = useState<string | null>(null);

    // Step 1: Wall dimensions
    const [walls, setWalls] = useState<{ length: string; height: string }[]>([
        { length: '', height: '' },
    ]);

    // Step 2: Wall type & products
    const [wallType, setWallType] = useState<'brick' | 'block' | 'cavity'>('cavity');
    const [brickProductId, setBrickProductId] = useState(BRICK_PRODUCTS[0].id);
    const [blockProductId, setBlockProductId] = useState(BLOCK_PRODUCTS[0].id);

    // Step 3: Openings
    const [openings, setOpenings] = useState<{ width: string; height: string }[]>([]);

    // Step 4: Mortar & options
    const [mixRatio, setMixRatio] = useState<'1:3' | '1:4'>('1:4');
    const [cavityWidth, setCavityWidth] = useState('100');
    const [wastage, setWastage] = useState('5');
    const [includeDPC, setIncludeDPC] = useState(true);
    const [includeAirBricks, setIncludeAirBricks] = useState(true);

    // Step 5: Results
    const [result, setResult] = useState<MasonryProjectResult | null>(null);

    // ── Wall repeater ──────────────────────────────────────────────────
    const addWall = () => {
        setWalls([...walls, { length: '', height: '' }]);
        setError(null);
    };

    const removeWall = (index: number) => {
        if (walls.length > 1) {
            const next = [...walls];
            next.splice(index, 1);
            setWalls(next);
            setError(null);
        }
    };

    const updateWall = (index: number, field: 'length' | 'height', value: string) => {
        setWalls(walls.map((w, i) => (i === index ? { ...w, [field]: value } : w)));
        setError(null);
    };

    // ── Opening repeater ───────────────────────────────────────────────
    const addOpening = () => {
        setOpenings([...openings, { width: '', height: '' }]);
        setError(null);
    };

    const removeOpening = (index: number) => {
        setOpenings(openings.filter((_, i) => i !== index));
        setError(null);
    };

    const updateOpening = (index: number, field: 'width' | 'height', value: string) => {
        setOpenings(openings.map((o, i) => (i === index ? { ...o, [field]: value } : o)));
        setError(null);
    };

    // ── Calculate ──────────────────────────────────────────────────────
    const handleCalculate = useCallback(() => {
        setError(null);

        try {
            // Parse walls
            const parsedWalls = walls.map((w) => ({
                length: parseFloat(w.length),
                height: parseFloat(w.height),
            }));

            for (const w of parsedWalls) {
                if (isNaN(w.length) || w.length <= 0)
                    throw new Error('Wall length must be greater than 0.');
                if (isNaN(w.height) || w.height <= 0)
                    throw new Error('Wall height must be greater than 0.');
            }

            const wallAreaM2 = parsedWalls.reduce((s, w) => s + w.length * w.height, 0);
            const wallLengthM = parsedWalls.reduce((s, w) => s + w.length, 0);

            // Parse openings
            const parsedOpenings = openings.map((o) => {
                const widthMm = parseFloat(o.width);
                const heightMm = parseFloat(o.height);
                if (isNaN(widthMm) || widthMm <= 0)
                    throw new Error('Opening width must be greater than 0.');
                if (isNaN(heightMm) || heightMm <= 0)
                    throw new Error('Opening height must be greater than 0.');
                return { widthMm, heightMm };
            });

            const w = parseFloat(wastage);
            if (isNaN(w) || w < 0 || w > 100)
                throw new Error('Wastage must be between 0 and 100%.');

            const r = calculateMasonryProject({
                wallAreaM2,
                wallLengthM,
                wallType,
                brickProductId: wallType !== 'block' ? brickProductId : undefined,
                blockProductId: wallType !== 'brick' ? blockProductId : undefined,
                mixRatio,
                wastagePercent: w,
                cavityWidthMm: wallType === 'cavity' ? parseFloat(cavityWidth) : undefined,
                includeDPC,
                includeAirBricks,
                openings: parsedOpenings,
            });

            setResult(r);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unexpected error occurred.');
            setResult(null);
        }
    }, [walls, openings, wallType, brickProductId, blockProductId, mixRatio, wastage, cavityWidth, includeDPC, includeAirBricks]);

    // ── Navigation ─────────────────────────────────────────────────────
    const goNext = () => {
        if (currentStep === STEPS.length - 2) {
            // Moving to the results step — calculate first
            handleCalculate();
        }
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const goBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
            setError(null);
        }
    };

    const onStartOver = () => {
        setCurrentStep(0);
        setResult(null);
        setError(null);
    };

    // ── Render steps ───────────────────────────────────────────────────
    const renderStep = () => {
        switch (currentStep) {
            // Step 1: Wall dimensions
            case 0:
                return (
                    <div className="space-y-4">
                        {walls.map((wall, index) => (
                            <div key={index} className="space-y-2">
                                <div className="grid grid-cols-2 gap-4">
                                    <NumberInput
                                        id={`wall-length-${index}`}
                                        label={`Length (Wall ${index + 1})`}
                                        unit="m"
                                        value={wall.length}
                                        onChange={(v) => updateWall(index, 'length', v)}
                                        placeholder="e.g. 5.0"
                                        min={0.1}
                                        step={0.01}
                                        required
                                    />
                                    <NumberInput
                                        id={`wall-height-${index}`}
                                        label={`Height (Wall ${index + 1})`}
                                        unit="m"
                                        value={wall.height}
                                        onChange={(v) => updateWall(index, 'height', v)}
                                        placeholder="e.g. 2.4"
                                        min={0.1}
                                        step={0.01}
                                        required
                                    />
                                </div>
                                {walls.length > 1 && (
                                    <div className="text-right">
                                        <button
                                            type="button"
                                            onClick={() => removeWall(index)}
                                            className="text-xs text-[--color-muted-foreground] hover:text-[--color-destructive]"
                                        >
                                            Remove section
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addWall}
                            className="text-sm text-[--color-brand-blue] hover:underline font-medium"
                        >
                            + Add wall section
                        </button>
                    </div>
                );

            // Step 2: Wall type & products
            case 1:
                return (
                    <div className="space-y-4">
                        <FormField
                            id="wall-type"
                            label="Type of wall"
                            type="select"
                            value={wallType}
                            onChange={(e) => {
                                setWallType(e.target.value as 'brick' | 'block' | 'cavity');
                                setError(null);
                            }}
                            options={WALL_TYPE_OPTIONS}
                        />

                        {(wallType === 'brick' || wallType === 'cavity') && (
                            <ProductSelector
                                id="brick-product"
                                label="Brick product"
                                products={BRICK_PRODUCTS}
                                value={brickProductId}
                                onChange={(e) => {
                                    setBrickProductId(e.target.value);
                                    setError(null);
                                }}
                            />
                        )}

                        {(wallType === 'block' || wallType === 'cavity') && (
                            <ProductSelector
                                id="block-product"
                                label="Block product"
                                products={BLOCK_PRODUCTS}
                                value={blockProductId}
                                onChange={(e) => {
                                    setBlockProductId(e.target.value);
                                    setError(null);
                                }}
                            />
                        )}
                    </div>
                );

            // Step 3: Openings
            case 2:
                return (
                    <div className="space-y-4">
                        {openings.length === 0 && (
                            <p className="text-sm text-text-muted">
                                No openings added yet. Add doors and windows to deduct from wall area.
                            </p>
                        )}
                        {openings.map((opening, index) => (
                            <div key={index} className="space-y-2">
                                <div className="grid grid-cols-2 gap-4">
                                    <NumberInput
                                        id={`opening-width-${index}`}
                                        label={`Width (Opening ${index + 1})`}
                                        unit="mm"
                                        value={opening.width}
                                        onChange={(v) => updateOpening(index, 'width', v)}
                                        placeholder="e.g. 1200"
                                        min={1}
                                        step={1}
                                    />
                                    <NumberInput
                                        id={`opening-height-${index}`}
                                        label={`Height (Opening ${index + 1})`}
                                        unit="mm"
                                        value={opening.height}
                                        onChange={(v) => updateOpening(index, 'height', v)}
                                        placeholder="e.g. 2100"
                                        min={1}
                                        step={1}
                                    />
                                </div>
                                <div className="text-right">
                                    <button
                                        type="button"
                                        onClick={() => removeOpening(index)}
                                        className="text-xs text-[--color-muted-foreground] hover:text-[--color-destructive]"
                                    >
                                        Remove opening
                                    </button>
                                </div>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addOpening}
                            className="text-sm text-[--color-brand-blue] hover:underline font-medium"
                        >
                            + Add opening
                        </button>
                    </div>
                );

            // Step 4: Mortar & options
            case 3:
                return (
                    <div className="space-y-4">
                        <FormField
                            id="mix-ratio"
                            label="Mortar mix ratio"
                            type="select"
                            value={mixRatio}
                            onChange={(e) => {
                                setMixRatio(e.target.value as '1:3' | '1:4');
                                setError(null);
                            }}
                            options={MIX_RATIO_OPTIONS}
                        />

                        <NumberInput
                            id="wastage"
                            label="Wastage"
                            unit="%"
                            value={wastage}
                            onChange={(v) => {
                                setWastage(v);
                                setError(null);
                            }}
                            placeholder="e.g. 5"
                            min={0}
                            max={50}
                            step={1}
                        />

                        {wallType === 'cavity' && (
                            <NumberInput
                                id="cavity-width"
                                label="Cavity width"
                                unit="mm"
                                value={cavityWidth}
                                onChange={(v) => {
                                    setCavityWidth(v);
                                    setError(null);
                                }}
                                placeholder="e.g. 100"
                                min={50}
                                step={10}
                            />
                        )}

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={includeDPC}
                                    onChange={(e) => setIncludeDPC(e.target.checked)}
                                />
                                Include DPC (damp-proof course)
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={includeAirBricks}
                                    onChange={(e) => setIncludeAirBricks(e.target.checked)}
                                />
                                Include air bricks
                            </label>
                        </div>
                    </div>
                );

            // Step 5: Results
            case 4:
                return (
                    <div>
                        {error && (
                            <p className="text-sm text-destructive mb-4">{error}</p>
                        )}
                        {result && (
                            <ResultCard
                                title="Masonry Materials"
                                materials={result.materials}
                                warnings={result.warnings}
                            />
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <WizardShell
            steps={STEPS}
            currentStep={currentStep}
            onNext={goNext}
            onBack={goBack}
            onStartOver={currentStep === STEPS.length - 1 ? onStartOver : undefined}
            onSkip={currentStep === 2 ? goNext : undefined}
        >
            {error && currentStep !== 4 && (
                <p className="text-sm text-destructive mb-4">{error}</p>
            )}
            {renderStep()}
        </WizardShell>
    );
}
