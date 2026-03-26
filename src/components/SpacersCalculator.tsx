import React, { useState, useCallback } from 'react';
import CalculatorLayout, { type FieldGroup } from './CalculatorLayout';
import { NumberInput } from './ui/NumberInput';
import { FormField } from './ui/FormField';
import { ResultCard } from './ui/ResultCard';
import { calculateSpacers, SPACER_SIZES, SPACERS_PER_TILE_BY_PATTERN } from '../calculators/spacers';
import type { LayingPattern } from '../calculators/types';
import type { SpacersResult } from '../calculators/types';

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
    const [result, setResult] = useState<SpacersResult | null>(null);
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
        if (validationError) { setError(validationError); setResult(null); return; }

        try {
            const tw = parseFloat(tileWidth);
            const th = parseFloat(tileHeight);
            const tileAreaM2 = (tw / 1000) * (th / 1000);
            const wa = parseFloat(wastage);
            const tilesNeeded = Math.ceil((parseFloat(area) / tileAreaM2) * (1 + wa / 100));
            const ps = parseInt(packSize, 10);

            const r = calculateSpacers({
                tilesNeeded,
                spacerSizeMm: parseFloat(spacerSize),
                layingPattern: layout,
                packSize: ps > 0 ? ps : 250,
            });

            setResult(r);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unexpected error occurred.');
            setResult(null);
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
        setResult(null);
        setError(null);
    }, []);

    const fieldGroups: FieldGroup[] = [
        {
            legend: 'Area to cover',
            children: (
                <NumberInput
                    id="area"
                    label="Total area"
                    unit="m²"
                    value={area}
                    onChange={(v) => { setArea(v); setError(null); }}
                    placeholder="e.g. 12.5"
                    min={0.01}
                    step={0.01}
                    required
                />
            ),
        },
        {
            legend: 'Tile dimensions',
            children: (
                <div className="grid grid-cols-2 gap-4">
                    <NumberInput
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
                    <NumberInput
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
                    <FormField
                        id="spacer-size"
                        label="Spacer size"
                        type="select"
                        value={spacerSize}
                        onChange={(e) => setSpacerSize(e.target.value)}
                        options={spacerSizeOptions}
                    />
                    <FormField
                        id="layout"
                        label="Layout pattern"
                        type="select"
                        value={layout}
                        onChange={(e) => setLayout(e.target.value as LayingPattern)}
                        options={layoutOptions}
                    />
                </div>
            ),
        },
        {
            legend: 'Options',
            children: (
                <div className="space-y-4">
                    <NumberInput
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
                    <NumberInput
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
            resultsSlot={result && <ResultCard title="Spacers" materials={result.materials} />}
            onCalculate={handleCalculate}
            onReset={handleReset}
            error={error}
        />
    );
}
