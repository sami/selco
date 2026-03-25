import React, { useState, useCallback, useMemo } from 'react';
import CalculatorLayout, { type FieldGroup } from './CalculatorLayout';
import { NumberInput } from './ui/NumberInput';
import { FormField } from './ui/FormField';
import { ResultCard } from './ui/ResultCard';
import { calculateGrout, COMMON_JOINT_WIDTHS } from '../calculators/grout';
import { GROUT_PRODUCTS } from '../data/tiling-products';
import type { GroutResult } from '../calculators/types';

const CUSTOM_VALUE = 'custom';

const jointWidthOptions = [
    ...COMMON_JOINT_WIDTHS.map((j) => ({
        value: String(j.value),
        label: j.label,
    })),
    { value: CUSTOM_VALUE, label: 'Custom width…' },
];

const productOptions = GROUT_PRODUCTS.map((p) => ({
    value: p.id,
    label: `${p.brand} ${p.name}`,
}));

export default function GroutCalculator() {
    const [selectedProduct, setSelectedProduct] = useState(GROUT_PRODUCTS[0].id);
    const [area, setArea] = useState('');
    const [tileWidth, setTileWidth] = useState('300');
    const [tileHeight, setTileHeight] = useState('300');
    const [selectedJointWidth, setSelectedJointWidth] = useState('3');
    const [customJointWidth, setCustomJointWidth] = useState('');
    const [tileDepth, setTileDepth] = useState('8');
    const [result, setResult] = useState<GroutResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const isCustomJoint = selectedJointWidth === CUSTOM_VALUE;
    const effectiveJointWidth = isCustomJoint ? customJointWidth : selectedJointWidth;

    const product = useMemo(
        () => GROUT_PRODUCTS.find(p => p.id === selectedProduct) ?? GROUT_PRODUCTS[0],
        [selectedProduct],
    );

    const validateInputs = () => {
        const a = parseFloat(area);
        const tw = parseFloat(tileWidth);
        const th = parseFloat(tileHeight);
        const jw = parseFloat(effectiveJointWidth);
        const td = parseFloat(tileDepth);

        if (isNaN(a) || a <= 0) return 'Total area must be a valid number greater than 0.';
        if (isNaN(tw) || tw <= 0) return 'Tile width must be a valid number greater than 0.';
        if (isNaN(th) || th <= 0) return 'Tile height must be a valid number greater than 0.';
        if (isNaN(jw) || jw <= 0) return 'Joint width must be a valid number greater than 0.';
        if (isNaN(td) || td <= 0) return 'Tile thickness must be a valid number greater than 0.';
        return null;
    };

    const handleCalculate = useCallback(() => {
        setError(null);
        const validationError = validateInputs();
        if (validationError) { setError(validationError); setResult(null); return; }

        try {
            const r = calculateGrout({
                areaM2: parseFloat(area),
                tileLengthMm: parseFloat(tileWidth),
                tileWidthMm: parseFloat(tileHeight),
                tileDepthMm: parseFloat(tileDepth),
                jointWidthMm: parseFloat(effectiveJointWidth),
                productId: selectedProduct,
            });
            setResult(r);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unexpected error occurred.');
            setResult(null);
        }
    }, [area, tileWidth, tileHeight, effectiveJointWidth, tileDepth, selectedProduct, product]);

    const handleReset = useCallback(() => {
        setSelectedProduct(GROUT_PRODUCTS[0].id);
        setArea('');
        setTileWidth('300');
        setTileHeight('300');
        setSelectedJointWidth('3');
        setCustomJointWidth('');
        setTileDepth('8');
        setResult(null);
        setError(null);
    }, []);

    const fieldGroups: FieldGroup[] = [
        {
            legend: 'Product',
            children: (
                <FormField
                    id="grout-product"
                    label="Grout product"
                    type="select"
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    options={productOptions}
                />
            ),
        },
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
            legend: 'Joint & tile details',
            children: (
                <div className="space-y-4">
                    <FormField
                        id="joint-width-preset"
                        label="Joint width"
                        type="select"
                        value={selectedJointWidth}
                        onChange={(e) => setSelectedJointWidth(e.target.value)}
                        options={jointWidthOptions}
                    />
                    {isCustomJoint && (
                        <NumberInput
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
                    <NumberInput
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
    ];

    return (
        <CalculatorLayout
            title="Grout Calculator"
            description="Work out how much grout you need for your tiling project."
            fieldGroups={fieldGroups}
            resultsSlot={result && <ResultCard title="Grout" materials={result.materials} warnings={result.warnings} />}
            onCalculate={handleCalculate}
            onReset={handleReset}
            error={error}
        />
    );
}
