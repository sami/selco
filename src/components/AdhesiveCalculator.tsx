import React, { useState, useCallback, useMemo } from 'react';
import CalculatorLayout, {
    FormInput,
    FormSelect,
    type ResultItem,
    type FieldGroup,
} from './CalculatorLayout';
import { calculateAdhesive, ADHESIVE_PRODUCTS } from '../calculators/adhesive';

type ApplicationType = 'dry' | 'wet';

const productOptions = ADHESIVE_PRODUCTS.map((p) => ({
    value: p.value,
    label: p.label,
}));

const substrateOptions = [
    { value: 'even', label: 'Even (prepared substrate)' },
    { value: 'uneven', label: 'Uneven (+20% adhesive)' },
];

export default function AdhesiveCalculator() {
    const [selectedProduct, setSelectedProduct] = useState(ADHESIVE_PRODUCTS[0].value);
    const [applicationType, setApplicationType] = useState<ApplicationType>('dry');
    const [area, setArea] = useState('');
    const [substrate, setSubstrate] = useState('even');
    const [wastage, setWastage] = useState('10');
    const [results, setResults] = useState<ResultItem[]>([]);
    const [hasResults, setHasResults] = useState(false);

    const product = useMemo(
        () => ADHESIVE_PRODUCTS.find((p) => p.value === selectedProduct) ?? ADHESIVE_PRODUCTS[0],
        [selectedProduct],
    );

    const coverageRate = applicationType === 'dry' ? product.dryWallRate : product.wetAreaRate;

    const handleCalculate = useCallback(() => {
        try {
            const result = calculateAdhesive({
                area: parseFloat(area),
                coverageRate,
                bagSize: product.bagSize,
                substrate: substrate as 'even' | 'uneven',
                wastage: parseFloat(wastage),
            });

            const isUneven = substrate === 'uneven';
            const effectiveRate = isUneven ? coverageRate * 1.2 : coverageRate;
            const bagLabel = product.bagSize >= 20 ? `${product.bagSize} kg bag` : `${product.bagSize} kg tub`;

            const items: ResultItem[] = [
                {
                    label: 'Adhesive needed',
                    value: `${result.kgNeeded.toFixed(1)} kg`,
                    primary: true,
                },
                {
                    label: `Bags needed (${bagLabel})`,
                    value: `${result.bagsNeeded} bags`,
                    primary: true,
                },
                {
                    label: 'Coverage rate used',
                    value: `${effectiveRate} kg/m²${isUneven ? ' (incl. +20% uneven)' : ''}`,
                },
            ];

            setResults(items);
            setHasResults(true);
        } catch {
            // Invalid input — do nothing
        }
    }, [area, coverageRate, product, substrate, wastage]);

    const handleReset = useCallback(() => {
        setSelectedProduct(ADHESIVE_PRODUCTS[0].value);
        setApplicationType('dry');
        setArea('');
        setSubstrate('even');
        setWastage('10');
        setResults([]);
        setHasResults(false);
    }, []);

    const fieldGroups: FieldGroup[] = [
        {
            legend: 'Product',
            children: (
                <div className="space-y-4">
                    <FormSelect
                        id="adhesive-product"
                        label="Adhesive product"
                        value={selectedProduct}
                        onChange={setSelectedProduct}
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
                                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 focus-ring ${applicationType === 'dry'
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
                                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 focus-ring ${applicationType === 'wet'
                                        ? 'bg-brand-blue text-white shadow-sm'
                                        : 'bg-muted/30 text-muted-foreground hover:bg-muted/50 border border-border'
                                    }`}
                            >
                                Floor &amp; Wet Areas
                            </button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1.5">
                            Coverage rate: {coverageRate} kg/m² ({product.bagSize} kg per unit)
                        </p>
                    </div>
                </div>
            ),
        },
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
            legend: 'Options',
            children: (
                <div className="space-y-4">
                    <FormSelect
                        id="substrate"
                        label="Substrate condition"
                        value={substrate}
                        onChange={setSubstrate}
                        options={substrateOptions}
                    />
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
                </div>
            ),
        },
    ];

    return (
        <CalculatorLayout
            title="Adhesive Calculator"
            description="Estimate how much tile adhesive you need for your project."
            fieldGroups={fieldGroups}
            results={results}
            hasResults={hasResults}
            onCalculate={handleCalculate}
            onReset={handleReset}
        />
    );
}
