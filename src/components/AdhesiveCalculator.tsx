import React, { useState, useCallback, useMemo } from 'react';
import CalculatorLayout, { type FieldGroup } from './CalculatorLayout';
import { NumberInput } from './ui/NumberInput';
import { FormField } from './ui/FormField';
import { ResultCard } from './ui/ResultCard';
import { calculateAdhesive } from '../calculators/adhesive';
import { ADHESIVE_PRODUCTS } from '../data/tiling-products';
import type { AdhesiveResult } from '../calculators/types';

type ApplicationType = 'dry' | 'wet';

const productOptions = ADHESIVE_PRODUCTS.map((p) => ({
    value: p.id,
    label: `${p.brand} ${p.name}`,
}));

const substrateOptions = [
    { value: 'even', label: 'Even (prepared substrate)' },
    { value: 'uneven', label: 'Uneven (+20% adhesive)' },
];

export default function AdhesiveCalculator() {
    const [selectedProduct, setSelectedProduct] = useState(ADHESIVE_PRODUCTS[0].id);
    const [applicationType, setApplicationType] = useState<ApplicationType>('dry');
    const [area, setArea] = useState('');
    const [substrate, setSubstrate] = useState('even');
    const [wastage, setWastage] = useState('10');
    const [result, setResult] = useState<AdhesiveResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const product = useMemo(
        () => ADHESIVE_PRODUCTS.find((p) => p.id === selectedProduct) ?? ADHESIVE_PRODUCTS[0],
        [selectedProduct],
    );

    const coverageRate = applicationType === 'dry'
        ? product.coverageRates['wall-dry']
        : product.coverageRates['floor-wet'];

    const validateInputs = () => {
        const a = parseFloat(area);
        if (isNaN(a) || a <= 0) return 'Total area must be a valid number greater than 0.';
        return null;
    };

    const handleCalculate = useCallback(() => {
        setError(null);
        const validationError = validateInputs();
        if (validationError) {
            setError(validationError);
            setResult(null);
            return;
        }

        try {
            const applicationContext = applicationType === 'dry' ? 'wall-dry' : 'floor-wet';
            setResult(calculateAdhesive({
                areaM2: parseFloat(area),
                tileLengthMm: 300,
                tileWidthMm: 300,
                productId: selectedProduct,
                applicationContext,
            }));
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unexpected error occurred.');
            setResult(null);
        }
    }, [area, applicationType, selectedProduct, product]);

    const handleReset = useCallback(() => {
        setSelectedProduct(ADHESIVE_PRODUCTS[0].id);
        setApplicationType('dry');
        setArea('');
        setSubstrate('even');
        setWastage('10');
        setResult(null);
        setError(null);
    }, []);

    const fieldGroups: FieldGroup[] = [
        {
            legend: 'Product',
            children: (
                <div className="space-y-4">
                    <FormField
                        id="adhesive-product"
                        label="Adhesive product"
                        type="select"
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                        options={productOptions}
                    />
                    <div>
                        <label className="block text-sm font-medium text-surface-foreground mb-2" id="app-type-label">Application type</label>
                        <div className="flex gap-2" role="radiogroup" aria-labelledby="app-type-label">
                            <button
                                type="button"
                                role="radio"
                                aria-checked={applicationType === 'dry'}
                                onClick={() => setApplicationType('dry')}
                                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 focus:focus-ring ${applicationType === 'dry'
                                    ? 'bg-brand-blue text-white shadow-sm'
                                    : 'bg-muted/30 text-muted-foreground hover:bg-muted/50 border border-border'
                                    }`}
                            >
                                Dry Wall
                            </button>
                            <button
                                type="button"
                                role="radio"
                                aria-checked={applicationType === 'wet'}
                                onClick={() => setApplicationType('wet')}
                                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 focus:focus-ring ${applicationType === 'wet'
                                    ? 'bg-brand-blue text-white shadow-sm'
                                    : 'bg-muted/30 text-muted-foreground hover:bg-muted/50 border border-border'
                                    }`}
                            >
                                Floor &amp; Wet Areas
                            </button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1.5">
                            Coverage rate: {coverageRate} kg/m² ({product.bagSizeKg} kg per unit)
                        </p>
                    </div>
                </div>
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
            legend: 'Options',
            children: (
                <div className="space-y-4">
                    <FormField
                        id="substrate"
                        label="Substrate condition"
                        type="select"
                        value={substrate}
                        onChange={(e) => setSubstrate(e.target.value)}
                        options={substrateOptions}
                    />
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
                </div>
            ),
        },
    ];

    return (
        <CalculatorLayout
            title="Adhesive Calculator"
            description="Estimate how much tile adhesive you need for your project."
            fieldGroups={fieldGroups}
            resultsSlot={result && <ResultCard title="Adhesive" materials={result.materials} warnings={result.warnings} />}
            onCalculate={handleCalculate}
            onReset={handleReset}
            error={error}
        />
    );
}
