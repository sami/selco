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

    const handleCalculate = useCallback(() => {
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
                    iconPath: 'M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z',
                    label: 'Spacers needed',
                    value: `${result.spacersNeeded} × ${spacerSize} mm spacers`,
                    primary: true,
                },
                {
                    iconPath: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z',
                    label: 'Packs of 100',
                    value: `${result.packs100} packs`,
                    primary: true,
                },
                {
                    iconPath: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z',
                    label: 'Packs of 250',
                    value: `${result.packs250} packs`,
                },
            ]);
            setHasResults(true);
        } catch {
            // Invalid input — do nothing
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
                    onChange={setArea}
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
                        onChange={setTileWidth}
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
                        onChange={setTileHeight}
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
                    onChange={setWastage}
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
            iconPath="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"
            fieldGroups={fieldGroups}
            results={results}
            hasResults={hasResults}
            onCalculate={handleCalculate}
            onReset={handleReset}
        />
    );
}
