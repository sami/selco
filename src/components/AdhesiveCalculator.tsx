import React, { useState, useCallback } from 'react';
import CalculatorLayout, {
    FormInput,
    type ResultItem,
    type FieldGroup,
} from './CalculatorLayout';
import { calculateAdhesive } from '../calculators/adhesive';

export default function AdhesiveCalculator() {
    const [area, setArea] = useState('');
    const [tileSize, setTileSize] = useState('300');
    const [wastage, setWastage] = useState('10');
    const [bagSize, setBagSize] = useState('20');
    const [results, setResults] = useState<ResultItem[]>([]);
    const [hasResults, setHasResults] = useState(false);

    const handleCalculate = useCallback(() => {
        try {
            const result = calculateAdhesive({
                area: parseFloat(area),
                tileSize: parseFloat(tileSize),
                wastage: parseFloat(wastage),
                bagSize: parseFloat(bagSize),
            });

            setResults([
                {
                    iconPath: 'M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z',
                    label: 'Adhesive needed',
                    value: `${result.kgNeeded.toFixed(1)} kg`,
                    primary: true,
                },
                {
                    iconPath: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z',
                    label: 'Bags required',
                    value: `${result.bagsNeeded} × ${bagSize} kg bags`,
                },
                {
                    iconPath: 'M2 20h20M5 20V8l7-5 7 5v12',
                    label: 'Coverage rate',
                    value: `${result.coverageRate} kg/m²`,
                },
            ]);
            setHasResults(true);
        } catch {
            // Invalid input — do nothing
        }
    }, [area, tileSize, wastage, bagSize]);

    const handleReset = useCallback(() => {
        setArea('');
        setTileSize('300');
        setWastage('10');
        setBagSize('20');
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
            legend: 'Tile details',
            children: (
                <FormInput
                    id="tile-size"
                    label="Largest tile edge"
                    unit="mm"
                    value={tileSize}
                    onChange={setTileSize}
                    placeholder="e.g. 300"
                    min={1}
                    step={1}
                    required
                />
            ),
        },
        {
            legend: 'Options',
            children: (
                <div className="grid grid-cols-2 gap-4">
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
                    <FormInput
                        id="bag-size"
                        label="Bag size"
                        unit="kg"
                        value={bagSize}
                        onChange={setBagSize}
                        placeholder="e.g. 20"
                        min={1}
                        step={1}
                    />
                </div>
            ),
        },
    ];

    return (
        <CalculatorLayout
            title="Adhesive Calculator"
            description="Estimate how much tile adhesive you need for your project."
            iconPath="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"
            fieldGroups={fieldGroups}
            results={results}
            hasResults={hasResults}
            onCalculate={handleCalculate}
            onReset={handleReset}
        />
    );
}
