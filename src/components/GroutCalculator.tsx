import React, { useState, useCallback } from 'react';
import CalculatorLayout, {
    FormInput,
    FormSelect,
    type ResultItem,
    type FieldGroup,
} from './CalculatorLayout';
import { calculateGrout, COMMON_JOINT_WIDTHS } from '../calculators/grout';

const CUSTOM_VALUE = 'custom';

const jointWidthOptions = [
    ...COMMON_JOINT_WIDTHS.map((j) => ({
        value: String(j.value),
        label: j.label,
    })),
    { value: CUSTOM_VALUE, label: 'Custom width…' },
];

export default function GroutCalculator() {
    const [area, setArea] = useState('');
    const [tileWidth, setTileWidth] = useState('300');
    const [tileHeight, setTileHeight] = useState('300');
    const [selectedJointWidth, setSelectedJointWidth] = useState('3');
    const [customJointWidth, setCustomJointWidth] = useState('');
    const [tileDepth, setTileDepth] = useState('8');
    const [wastage, setWastage] = useState('10');
    const [results, setResults] = useState<ResultItem[]>([]);
    const [hasResults, setHasResults] = useState(false);

    const isCustomJoint = selectedJointWidth === CUSTOM_VALUE;
    const effectiveJointWidth = isCustomJoint ? customJointWidth : selectedJointWidth;

    const handleCalculate = useCallback(() => {
        try {
            const result = calculateGrout({
                area: parseFloat(area),
                tileWidth: parseFloat(tileWidth),
                tileHeight: parseFloat(tileHeight),
                jointWidth: parseFloat(effectiveJointWidth),
                tileDepth: parseFloat(tileDepth),
                wastage: parseFloat(wastage),
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
                    label: 'Bags needed (5 kg)',
                    value: `${result.bags5kg} bags`,
                    primary: true,
                },
                {
                    iconPath: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z',
                    label: 'Bags needed (2.5 kg)',
                    value: `${result.bags2_5kg} bags`,
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
    }, [area, tileWidth, tileHeight, effectiveJointWidth, tileDepth, wastage]);

    const handleReset = useCallback(() => {
        setArea('');
        setTileWidth('300');
        setTileHeight('300');
        setSelectedJointWidth('3');
        setCustomJointWidth('');
        setTileDepth('8');
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
            legend: 'Joint & tile details',
            children: (
                <div className="space-y-4">
                    <FormSelect
                        id="joint-width-preset"
                        label="Joint width"
                        value={selectedJointWidth}
                        onChange={setSelectedJointWidth}
                        options={jointWidthOptions}
                    />
                    {isCustomJoint && (
                        <FormInput
                            id="joint-width-custom"
                            label="Custom joint width"
                            unit="mm"
                            value={customJointWidth}
                            onChange={setCustomJointWidth}
                            placeholder="e.g. 4"
                            min={0.5}
                            step={0.5}
                            required
                        />
                    )}
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
