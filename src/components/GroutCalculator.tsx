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
    const [error, setError] = useState<string | null>(null);

    const isCustomJoint = selectedJointWidth === CUSTOM_VALUE;
    const effectiveJointWidth = isCustomJoint ? customJointWidth : selectedJointWidth;

    const validateInputs = () => {
        const a = parseFloat(area);
        const w = parseFloat(wastage);
        const tw = parseFloat(tileWidth);
        const th = parseFloat(tileHeight);
        const jw = parseFloat(effectiveJointWidth);
        const td = parseFloat(tileDepth);

        if (isNaN(a) || a <= 0) return 'Total area must be a valid number greater than 0.';
        if (isNaN(tw) || tw <= 0) return 'Tile width must be a valid number greater than 0.';
        if (isNaN(th) || th <= 0) return 'Tile height must be a valid number greater than 0.';
        if (isNaN(jw) || jw <= 0) return 'Joint width must be a valid number greater than 0.';
        if (isNaN(td) || td <= 0) return 'Tile thickness must be a valid number greater than 0.';
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
                    label: 'Grout needed',
                    value: `${result.kgNeeded.toFixed(1)} kg`,
                    primary: true,
                },
                {
                    label: 'Bags needed (5 kg)',
                    value: `${result.bags5kg} bags`,
                    primary: true,
                },
                {
                    label: 'Bags needed (2.5 kg)',
                    value: `${result.bags2_5kg} bags`,
                },
                {
                    label: 'Usage rate',
                    value: `${result.kgPerM2.toFixed(3)} kg/m²`,
                },
            ]);
            setHasResults(true);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unexpected error occurred.');
            setHasResults(false);
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
                            onChange={(v) => { setCustomJointWidth(v); setError(null); }}
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
                        onChange={(v) => { setTileDepth(v); setError(null); }}
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
            title="Grout Calculator"
            description="Work out how much grout you need for your tiling project."
            fieldGroups={fieldGroups}
            results={results}
            hasResults={hasResults}
            onCalculate={handleCalculate}
            onReset={handleReset}
            error={error}
        />
    );
}
