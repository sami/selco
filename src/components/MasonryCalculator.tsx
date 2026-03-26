import React, { useState, useCallback } from 'react';
import CalculatorLayout, { type FieldGroup } from './CalculatorLayout';
import { NumberInput } from './ui/NumberInput';
import { FormField } from './ui/FormField';
import { ResultCard } from './ui/ResultCard';
import { calculateMasonry, WALL_TYPES, SAND_BAG_SIZES } from '../calculators/masonry';
import type { WallType, MortarMixRatio, SandBagSize, MasonryResult } from '../calculators/types';
import type { MaterialQuantity } from '../types';

const wallTypeOptions = WALL_TYPES.map((t) => ({ value: t.value, label: t.label }));

// Block width options vary by block type — aerated: 100/215mm; dense: 100/140mm
const aeratedWidthOptions = [
    { value: '100', label: '100 mm' },
    { value: '215', label: '215 mm' },
];

const denseWidthOptions = [
    { value: '100', label: '100 mm' },
    { value: '140', label: '140 mm' },
];

const blockTypeOptions = [
    { value: 'aerated', label: 'Aerated (Thermalite Shield)' },
    { value: 'dense', label: 'Dense Concrete' },
];

function getBlockLabel(type: 'aerated' | 'dense', widthMm: number): string {
    if (type === 'aerated') return `Thermalite Shield ${widthMm}mm`;
    return `Dense Concrete ${widthMm}mm`;
}

const mixRatioOptions = [
    { value: '1:3', label: '1:3 (strong)' },
    { value: '1:4', label: '1:4 (general purpose)' },
    { value: '1:5', label: '1:5 (internal)' },
    { value: '1:6', label: '1:6 (lightweight block)' },
];

const sandBagOptions = SAND_BAG_SIZES.map((s) => ({ value: s.value, label: s.label }));

/** Convert raw MasonryResult sub-results into a flat MaterialQuantity[] for ResultCard. */
function toMaterials(result: MasonryResult, blockLabel: string, sandBagSize: SandBagSize): MaterialQuantity[] {
    const materials: MaterialQuantity[] = [];

    if (result.bricks > 0) {
        materials.push({ material: 'Bricks', quantity: result.bricks, unit: 'bricks' });
    }
    if (result.blocks > 0) {
        materials.push({ material: `Blocks — ${blockLabel}`, quantity: result.blocks, unit: 'blocks' });
    }
    materials.push(
        { material: 'Cement (25 kg bags)', quantity: result.mortar.cementBags, unit: 'bags' },
        { material: `Sand (${sandBagSize === 'jumbo' ? 'Jumbo' : 'Large'} bags)`, quantity: result.mortar.sandBags, unit: 'bags' },
    );
    if (result.wallTies.total > 0) {
        materials.push({ material: 'Wall ties', quantity: result.wallTies.total, unit: 'ties' });
    }
    if (result.lintels.length > 0) {
        result.lintels.forEach(l => {
            materials.push({ material: `Lintel (${l.lintelLength} mm)`, quantity: 1, unit: 'lintel' });
        });
    }
    materials.push({ material: 'DPC', quantity: result.dpc.length, unit: 'm' });
    materials.push({ material: 'Wall starter kits', quantity: result.starterKits, unit: 'kits' });
    if (result.insulationAreaM2 !== undefined) {
        materials.push({
            material: `Cavity insulation (${result.insulationThicknessMm} mm)`,
            quantity: Math.round(result.insulationAreaM2 * 10) / 10,
            unit: 'm²',
        });
    }

    return materials;
}

export interface MasonryCalculatorProps {
    title?: string;
    description?: string;
    defaultWallType?: WallType;
    hideFields?: string[];
}

export default function MasonryCalculator({
    title = "Masonry Calculator",
    description = "Calculate bricks, blocks, mortar, and wall ties for any wall.",
    defaultWallType = "cavity",
    hideFields = [],
}: MasonryCalculatorProps) {
    const [wallType, setWallType] = useState<WallType>(defaultWallType);
    const [blockType, setBlockType] = useState<'aerated' | 'dense'>('aerated');
    const [blockWidth, setBlockWidth] = useState('100');
    const [walls, setWalls] = useState<Array<{ length: string; height: string }>>([{ length: '', height: '' }]);
    const [openings, setOpenings] = useState<Array<{ width: string; height: string }>>([]);
    const [mixRatio, setMixRatio] = useState<MortarMixRatio>('1:4');
    const [unitWaste, setUnitWaste] = useState('5');
    const [mortarWaste, setMortarWaste] = useState('10');
    const [cavityWidth, setCavityWidth] = useState('100');
    const [sandBagSize, setSandBagSize] = useState<SandBagSize>('jumbo');
    const [result, setResult] = useState<MasonryResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Visibility logic
    const showBlocks = (wallType === 'cavity' || wallType === 'blockwork') && !hideFields.includes('block-width');
    const showCavityWidth = wallType === 'cavity' && !hideFields.includes('cavity-width');

    // Dynamic width options — aerated: 100/215mm; dense: 100/140mm
    const blockWidthOptions = blockType === 'aerated' ? aeratedWidthOptions : denseWidthOptions;

    // Wall repeater logic
    const addWall = () => {
        setWalls([...walls, { length: '', height: '' }]);
        setError(null);
    };

    const removeWall = (index: number) => {
        if (walls.length > 1) {
            const newWalls = [...walls];
            newWalls.splice(index, 1);
            setWalls(newWalls);
            setError(null);
        }
    };

    const updateWall = (index: number, field: 'length' | 'height', value: string) => {
        setWalls(walls.map((wall, i) =>
            i === index ? { ...wall, [field]: value } : wall
        ));
        setError(null);
    };

    // Opening repeater logic
    const addOpening = () => {
        setOpenings([...openings, { width: '', height: '' }]);
        setError(null);
    };

    const removeOpening = (index: number) => {
        setOpenings(openings.filter((_, i) => i !== index));
        setError(null);
    };

    const updateOpening = (index: number, field: 'width' | 'height', value: string) => {
        setOpenings(openings.map((opening, i) =>
            i === index ? { ...opening, [field]: value } : opening
        ));
        setError(null);
    };

    const validateInputs = () => {
        // Validate walls
        for (const wall of walls) {
            const l = parseFloat(wall.length);
            const h = parseFloat(wall.height);
            if (isNaN(l) || l <= 0) return 'Wall length must be a valid number greater than 0.';
            if (isNaN(h) || h <= 0) return 'Wall height must be a valid number greater than 0.';
        }

        // Validate openings
        for (const opening of openings) {
            const w = parseFloat(opening.width);
            const h = parseFloat(opening.height);
            if (isNaN(w) || w <= 0) return 'Opening width must be a valid number greater than 0.';
            if (isNaN(h) || h <= 0) return 'Opening height must be a valid number greater than 0.';
        }

        const uw = parseFloat(unitWaste);
        const mw = parseFloat(mortarWaste);

        if (isNaN(uw) || uw < 0 || uw > 100) return 'Unit waste must be between 0 and 100%.';
        if (isNaN(mw) || mw < 0 || mw > 100) return 'Mortar waste must be between 0 and 100%.';

        return null;
    };

    const handleCalculate = useCallback(() => {
        setError(null);
        const validationError = validateInputs();
        if (validationError) {
            setError(validationError);
            setResult(null);
            return;
        }

        try {
            // Parse inputs
            const parsedWalls = walls.map(w => ({
                length: parseFloat(w.length),
                height: parseFloat(w.height),
            }));

            const parsedOpenings = openings.map(o => ({
                width: parseFloat(o.width),
                height: parseFloat(o.height),
            }));

            const r = calculateMasonry({
                wallType,
                walls: parsedWalls,
                openings: parsedOpenings,
                blockWidth: parseInt(blockWidth) as 100 | 140 | 215,
                mixRatio,
                unitWaste: parseFloat(unitWaste),
                mortarWaste: parseFloat(mortarWaste),
                cavityWidth: parseFloat(cavityWidth) || 0,
                sandBagSize,
            });

            setResult(r);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unexpected error occurred.');
            setResult(null);
        }
    }, [wallType, walls, openings, blockType, blockWidth, mixRatio, unitWaste, mortarWaste, cavityWidth, sandBagSize]);

    const handleReset = useCallback(() => {
        setWallType(defaultWallType);
        setBlockType('aerated');
        setBlockWidth('100');
        setWalls([{ length: '', height: '' }]);
        setOpenings([]);
        setMixRatio('1:4');
        setUnitWaste('5');
        setMortarWaste('10');
        setCavityWidth('100');
        setSandBagSize('jumbo');
        setResult(null);
        setError(null);
    }, [defaultWallType]);

    const fieldGroups: FieldGroup[] = [
        {
            legend: 'Wall type',
            children: (
                <div className="space-y-4">
                    <FormField
                        id="wall-type"
                        label="Type of wall"
                        type="select"
                        value={wallType}
                        onChange={(e) => { setWallType(e.target.value as WallType); setError(null); }}
                        options={wallTypeOptions}
                    />
                    {showBlocks && (
                        <>
                            <FormField
                                id="block-type"
                                label="Block type"
                                type="select"
                                value={blockType}
                                onChange={(e) => {
                                    setBlockType(e.target.value as 'aerated' | 'dense');
                                    setBlockWidth('100'); // reset — options differ by type
                                    setError(null);
                                }}
                                options={blockTypeOptions}
                            />
                            <FormField
                                id="block-width"
                                label="Block thickness"
                                type="select"
                                value={blockWidth}
                                onChange={(e) => { setBlockWidth(e.target.value); setError(null); }}
                                options={blockWidthOptions}
                            />
                        </>
                    )}
                </div>
            ),
        },
        {
            legend: 'Wall sections',
            children: (
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
            ),
        },
        {
            legend: 'Openings (optional)',
            children: (
                <div className="space-y-4">
                    {openings.map((opening, index) => (
                        <div key={index} className="space-y-2">
                            <div className="grid grid-cols-2 gap-4">
                                <NumberInput
                                    id={`opening-width-${index}`}
                                    label={`Width (Item ${index + 1})`}
                                    unit="m"
                                    value={opening.width}
                                    onChange={(v) => updateOpening(index, 'width', v)}
                                    placeholder="e.g. 1.2"
                                    min={0.1}
                                    step={0.01}
                                />
                                <NumberInput
                                    id={`opening-height-${index}`}
                                    label={`Height (Item ${index + 1})`}
                                    unit="m"
                                    value={opening.height}
                                    onChange={(v) => updateOpening(index, 'height', v)}
                                    placeholder="e.g. 2.1"
                                    min={0.1}
                                    step={0.01}
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
            ),
        },
        {
            legend: 'Materials & Waste',
            children: (
                <div className="space-y-4">
                    <FormField
                        id="sand-bag-size"
                        label="Sand bag size"
                        type="select"
                        value={sandBagSize}
                        onChange={(e) => { setSandBagSize(e.target.value as SandBagSize); setError(null); }}
                        options={sandBagOptions}
                    />
                    <FormField
                        id="mix-ratio"
                        label="Mortar mix ratio"
                        type="select"
                        value={mixRatio}
                        onChange={(e) => { setMixRatio(e.target.value as MortarMixRatio); setError(null); }}
                        options={mixRatioOptions}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <NumberInput
                            id="unit-waste"
                            label="Unit waste"
                            unit="%"
                            value={unitWaste}
                            onChange={(v) => { setUnitWaste(v); setError(null); }}
                            placeholder="e.g. 5"
                            min={0}
                            max={50}
                            step={1}
                        />
                        <NumberInput
                            id="mortar-waste"
                            label="Mortar waste"
                            unit="%"
                            value={mortarWaste}
                            onChange={(v) => { setMortarWaste(v); setError(null); }}
                            placeholder="e.g. 10"
                            min={0}
                            max={50}
                            step={1}
                        />
                    </div>
                    {showCavityWidth && (
                        <NumberInput
                            id="cavity-width"
                            label="Cavity width"
                            unit="mm"
                            value={cavityWidth}
                            onChange={(v) => { setCavityWidth(v); setError(null); }}
                            placeholder="e.g. 100"
                            min={50}
                            step={10}
                        />
                    )}
                </div>
            ),
        },
    ];

    return (
        <CalculatorLayout
            title={title}
            description={description}
            fieldGroups={fieldGroups}
            onCalculate={handleCalculate}
            onReset={handleReset}
            error={error}
            resultsSlot={result && (
                <ResultCard
                    title="Materials"
                    materials={toMaterials(result, getBlockLabel(blockType, parseInt(blockWidth)), sandBagSize)}
                />
            )}
        />
    );
}
