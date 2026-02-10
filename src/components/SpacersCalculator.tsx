import React, { useState, useCallback } from 'react';
import CalculatorLayout, {
    FormInput,
    FormSelect,
    type ResultItem,
    type FieldGroup,
} from './CalculatorLayout';
import { calculateSpacers } from '../calculators/spacers';

export default function SpacersCalculator() {
    const [numberOfTiles, setNumberOfTiles] = useState('');
    const [pattern, setPattern] = useState('grid');
    const [wastage, setWastage] = useState('10');
    const [results, setResults] = useState<ResultItem[]>([]);
    const [hasResults, setHasResults] = useState(false);

    const handleCalculate = useCallback(() => {
        try {
            const result = calculateSpacers({
                numberOfTiles: parseFloat(numberOfTiles),
                pattern: pattern as 'grid' | 'brick',
                wastage: parseFloat(wastage),
            });

            setResults([
                {
                    iconPath: 'M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z',
                    label: 'Spacers needed',
                    value: `${result.spacersNeeded} spacers`,
                    primary: true,
                },
                {
                    iconPath: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
                    label: 'Spacers per tile',
                    value: `${result.spacersPerTile} per tile (${pattern === 'brick' ? 'brick' : 'grid'} pattern)`,
                },
            ]);
            setHasResults(true);
        } catch {
            // Invalid input — do nothing
        }
    }, [numberOfTiles, pattern, wastage]);

    const handleReset = useCallback(() => {
        setNumberOfTiles('');
        setPattern('grid');
        setWastage('10');
        setResults([]);
        setHasResults(false);
    }, []);

    const fieldGroups: FieldGroup[] = [
        {
            legend: 'Tile count',
            children: (
                <FormInput
                    id="number-of-tiles"
                    label="Number of tiles"
                    unit="tiles"
                    value={numberOfTiles}
                    onChange={setNumberOfTiles}
                    placeholder="e.g. 88"
                    min={1}
                    step={1}
                    required
                />
            ),
        },
        {
            legend: 'Layout',
            children: (
                <FormSelect
                    id="pattern"
                    label="Laying pattern"
                    value={pattern}
                    onChange={setPattern}
                    options={[
                        { value: 'grid', label: 'Grid (straight)' },
                        { value: 'brick', label: 'Brick / offset' },
                    ]}
                />
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
