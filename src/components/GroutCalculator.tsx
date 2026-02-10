import React, { useState, useCallback } from 'react';
import CalculatorLayout, {
    FormInput,
    type ResultItem,
    type FieldGroup,
} from './CalculatorLayout';
import { calculateGrout } from '../calculators/grout';

export default function GroutCalculator() {
    const [area, setArea] = useState('');
    const [tileWidth, setTileWidth] = useState('300');
    const [tileHeight, setTileHeight] = useState('300');
    const [jointWidth, setJointWidth] = useState('3');
    const [tileDepth, setTileDepth] = useState('8');
    const [wastage, setWastage] = useState('10');
    const [bagSize, setBagSize] = useState('5');
    const [results, setResults] = useState<ResultItem[]>([]);
    const [hasResults, setHasResults] = useState(false);

    const handleCalculate = useCallback(() => {
        try {
            const result = calculateGrout({
                area: parseFloat(area),
                tileWidth: parseFloat(tileWidth),
                tileHeight: parseFloat(tileHeight),
                jointWidth: parseFloat(jointWidth),
                tileDepth: parseFloat(tileDepth),
                wastage: parseFloat(wastage),
                bagSize: parseFloat(bagSize),
            });

            setResults([
                {
                    iconPath: 'M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z',
                    label: 'Grout needed',
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
                    label: 'Usage rate',
                    value: `${result.kgPerM2.toFixed(3)} kg/m²`,
                },
            ]);
            setHasResults(true);
        } catch {
            // Invalid input — do nothing
        }
    }, [area, tileWidth, tileHeight, jointWidth, tileDepth, wastage, bagSize]);

    const handleReset = useCallback(() => {
        setArea('');
        setTileWidth('300');
        setTileHeight('300');
        setJointWidth('3');
        setTileDepth('8');
        setWastage('10');
        setBagSize('5');
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
            legend: 'Joint & tile details',
            children: (
                <div className="grid grid-cols-2 gap-4">
                    <FormInput
                        id="joint-width"
                        label="Joint/gap width"
                        unit="mm"
                        value={jointWidth}
                        onChange={setJointWidth}
                        placeholder="e.g. 3"
                        min={1}
                        step={0.5}
                        required
                    />
                    <FormInput
                        id="tile-depth"
                        label="Tile thickness"
                        unit="mm"
                        value={tileDepth}
                        onChange={setTileDepth}
                        placeholder="e.g. 8"
                        min={1}
                        step={1}
                        required
                    />
                </div>
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
                        placeholder="e.g. 5"
                        min={1}
                        step={1}
                    />
                </div>
            ),
        },
    ];

    return (
        <CalculatorLayout
            title="Grout Calculator"
            description="Work out how much grout you need for your tiling project."
            iconPath="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"
            fieldGroups={fieldGroups}
            results={results}
            hasResults={hasResults}
            onCalculate={handleCalculate}
            onReset={handleReset}
        />
    );
}
