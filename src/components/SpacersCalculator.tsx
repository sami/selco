import React, { useState, useCallback } from 'react';
import CalculatorLayout, {
    FormInput,
    FormSelect,
    type ResultItem,
    type FieldGroup,
} from './CalculatorLayout';
import { calculateSpacers, SPACER_SIZES } from '../calculators/spacers';

const spacerSizeOptions = SPACER_SIZES.map((s) => ({
    value: String(s.value),
    label: s.label,
}));

const layoutOptions = [
    { value: 'cross', label: 'Cross (straight grid) — 4 per tile' },
    { value: 't-junction', label: 'T-junction (brick bond / offset) — 3 per tile' },
];

export default function SpacersCalculator() {
    const [area, setArea] = useState('');
    const [tileWidth, setTileWidth] = useState('300');
    const [tileHeight, setTileHeight] = useState('300');
    const [spacerSize, setSpacerSize] = useState('3');
    const [layout, setLayout] = useState('cross');
    const [wastage, setWastage] = useState('10');
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
        if (validationError) {
            setError(validationError);
            setHasResults(false);
            return;
        }

        try {
            const result = calculateSpacers({
                areaM2: parseFloat(area),
                tileWidthMm: parseFloat(tileWidth),
                tileHeightMm: parseFloat(tileHeight),
                layout: layout as 'cross' | 't-junction',
                wastage: parseFloat(wastage),
            });

            setResults([
                {
                    label: 'Spacers needed',
                    value: `${result.spacersNeeded} × ${spacerSize} mm spacers`,
                    primary: true,
                },
                {
                    label: 'Packs of 100',
                    value: `${result.packs100} packs`,
                    primary: true,
                },
                {
                    label: 'Packs of 250',
                    value: `${result.packs250} packs`,
                },
            ]);
            setHasResults(true);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unexpected error occurred.');
            setHasResults(false);
        }
    }, [area, tileWidth, tileHeight, layout, wastage, spacerSize]);

    const handleReset = useCallback(() => {
        setArea('');
        setTileWidth('300');
        setTileHeight('300');
        setSpacerSize('3');
        setLayout('cross');
        setWastage('10');
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
                        onChange={setLayout}
                        options={layoutOptions}
                    />
                </div>
            ),
        },
        {
            legend: 'Options',
            children: (
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
