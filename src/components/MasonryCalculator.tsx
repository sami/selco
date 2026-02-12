import React, { useState, useCallback } from 'react';
import CalculatorLayout, {
    FormInput,
    FormSelect,
    type ResultItem,
    type FieldGroup,
} from './CalculatorLayout';
import { calculateMasonry, WALL_TYPES } from '../calculators/masonry';
import type { WallType, MortarMixRatio } from '../calculators/types';

const wallTypeOptions = WALL_TYPES.map((t) => ({ value: t.value, label: t.label }));

const blockWidthOptions = [
    { value: '100', label: '100 mm' },
    { value: '140', label: '140 mm' },
];

const mixRatioOptions = [
    { value: '1:3', label: '1:3 (strong)' },
    { value: '1:4', label: '1:4 (general purpose)' },
    { value: '1:5', label: '1:5 (internal)' },
    { value: '1:6', label: '1:6 (lightweight block)' },
];

export default function MasonryCalculator() {
    const [wallType, setWallType] = useState<WallType>('cavity');
    const [blockWidth, setBlockWidth] = useState('100');
    const [walls, setWalls] = useState<Array<{ length: string; height: string }>>([{ length: '', height: '' }]);
    const [openings, setOpenings] = useState<Array<{ width: string; height: string }>>([]);
    const [mixRatio, setMixRatio] = useState<MortarMixRatio>('1:4');
    const [unitWaste, setUnitWaste] = useState('5');
    const [mortarWaste, setMortarWaste] = useState('10');
    const [cavityWidth, setCavityWidth] = useState('100');
    const [results, setResults] = useState<ResultItem[]>([]);
    const [hasResults, setHasResults] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Visibility logic
    const showBlocks = wallType === 'cavity' || wallType === 'blockwork';
    const showCavityWidth = wallType === 'cavity';

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
        const newWalls = [...walls];
        newWalls[index][field] = value;
        setWalls(newWalls);
        setError(null);
    };

    // Opening repeater logic
    const addOpening = () => {
        setOpenings([...openings, { width: '', height: '' }]);
        setError(null);
    };

    const removeOpening = (index: number) => {
        const newOpenings = [...openings];
        newOpenings.splice(index, 1);
        setOpenings(newOpenings);
        setError(null);
    };

    const updateOpening = (index: number, field: 'width' | 'height', value: string) => {
        const newOpenings = [...openings];
        newOpenings[index][field] = value;
        setOpenings(newOpenings);
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
            setHasResults(false);
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

            const result = calculateMasonry({
                wallType,
                walls: parsedWalls,
                openings: parsedOpenings,
                blockWidth: parseInt(blockWidth) as 100 | 140,
                mixRatio,
                unitWaste: parseFloat(unitWaste),
                mortarWaste: parseFloat(mortarWaste),
                cavityWidth: parseFloat(cavityWidth),
            });

            const items: ResultItem[] = [];

            if (result.bricks > 0) {
                items.push({
                    label: 'Bricks',
                    value: `${result.bricks} bricks`,
                    primary: true,
                });
            }

            if (result.blocks > 0) {
                items.push({
                    label: 'Blocks',
                    value: `${result.blocks} blocks`,
                    primary: true,
                });
            }

            items.push(
                { label: 'Cement', value: `${result.mortar.cementBags} × 25 kg bags` },
                { label: 'Sand', value: `${result.mortar.sandTonnes} tonnes` },
                { label: 'Mortar volume', value: `${result.mortar.wetVolume} m³` },
            );

            if (result.wallTies.total > 0) {
                items.push({ label: 'Wall ties', value: `${result.wallTies.total} ties` });
            }

            if (result.lintels.length > 0) {
                items.push({
                    label: 'Lintels',
                    value: result.lintels.map(l => `${l.lintelLength} mm`).join(', '),
                });
            }

            items.push(
                { label: 'DPC', value: `${result.dpc.length} m × ${result.dpc.widthMm} mm` },
                { label: 'Gross area', value: `${result.area.grossArea} m²` },
                { label: 'Net area', value: `${result.area.netArea} m²` },
            );

            setResults(items);
            setHasResults(true);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unexpected error occurred.');
            setHasResults(false);
        }
    }, [wallType, walls, openings, blockWidth, mixRatio, unitWaste, mortarWaste, cavityWidth]);

    const handleReset = useCallback(() => {
        setWallType('cavity');
        setBlockWidth('100');
        setWalls([{ length: '', height: '' }]);
        setOpenings([]);
        setMixRatio('1:4');
        setUnitWaste('5');
        setMortarWaste('10');
        setCavityWidth('100');
        setResults([]);
        setHasResults(false);
        setError(null);
    }, []);

    const fieldGroups: FieldGroup[] = [
        {
            legend: 'Wall type',
            children: (
                <div className="space-y-4">
                    <FormSelect
                        id="wall-type"
                        label="Type of wall"
                        value={wallType}
                        onChange={(v) => { setWallType(v as WallType); setError(null); }}
                        options={wallTypeOptions}
                    />
                    {showBlocks && (
                        <FormSelect
                            id="block-width"
                            label="Block thickness"
                            value={blockWidth}
                            onChange={(v) => { setBlockWidth(v); setError(null); }}
                            options={blockWidthOptions}
                        />
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
                                <FormInput
                                    id={`wall-length-${index}`}
                                    label={`Length (Wall ${index + 1})`}
                                    unit="m"
                                    value={wall.length}
                                    onChange={(v) => updateWall(index, 'length', v)}
                                    placeholder="e.g. 5.0"
                                    min={0.1}
                                    step="0.01"
                                    required
                                />
                                <FormInput
                                    id={`wall-height-${index}`}
                                    label={`Height (Wall ${index + 1})`}
                                    unit="m"
                                    value={wall.height}
                                    onChange={(v) => updateWall(index, 'height', v)}
                                    placeholder="e.g. 2.4"
                                    min={0.1}
                                    step="0.01"
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
                                <FormInput
                                    id={`opening-width-${index}`}
                                    label={`Width (Item ${index + 1})`}
                                    unit="m"
                                    value={opening.width}
                                    onChange={(v) => updateOpening(index, 'width', v)}
                                    placeholder="e.g. 1.2"
                                    min={0.1}
                                    step="0.01"
                                />
                                <FormInput
                                    id={`opening-height-${index}`}
                                    label={`Height (Item ${index + 1})`}
                                    unit="m"
                                    value={opening.height}
                                    onChange={(v) => updateOpening(index, 'height', v)}
                                    placeholder="e.g. 2.1"
                                    min={0.1}
                                    step="0.01"
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
            legend: 'Mortar & waste',
            children: (
                <div className="space-y-4">
                    <FormSelect
                        id="mix-ratio"
                        label="Mortar mix ratio"
                        value={mixRatio}
                        onChange={(v) => { setMixRatio(v as MortarMixRatio); setError(null); }}
                        options={mixRatioOptions}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
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
                        <FormInput
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
                        <FormInput
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
            title="Masonry Calculator"
            description="Calculate bricks, blocks, mortar, and wall ties for any wall."
            fieldGroups={fieldGroups}
            results={results}
            hasResults={hasResults}
            onCalculate={handleCalculate}
            onReset={handleReset}
            error={error}
        />
    );
}
