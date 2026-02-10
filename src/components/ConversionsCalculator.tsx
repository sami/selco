import React, { useState, useMemo } from 'react';
import {
    convertLength,
    convertArea,
    convertWeight,
    type LengthUnit,
    type AreaUnit,
    type WeightUnit,
} from '../calculators/conversions';

// ---------------------------------------------------------------------------
// Unit option data
// ---------------------------------------------------------------------------

const lengthOptions: { value: LengthUnit; label: string }[] = [
    { value: 'mm', label: 'Millimetres (mm)' },
    { value: 'cm', label: 'Centimetres (cm)' },
    { value: 'm', label: 'Metres (m)' },
    { value: 'in', label: 'Inches (in)' },
    { value: 'ft', label: 'Feet (ft)' },
    { value: 'yd', label: 'Yards (yd)' },
];

const areaOptions: { value: AreaUnit; label: string }[] = [
    { value: 'mm2', label: 'mm²' },
    { value: 'cm2', label: 'cm²' },
    { value: 'm2', label: 'm²' },
    { value: 'ft2', label: 'ft²' },
    { value: 'yd2', label: 'yd²' },
];

const weightOptions: { value: WeightUnit; label: string }[] = [
    { value: 'g', label: 'Grams (g)' },
    { value: 'kg', label: 'Kilograms (kg)' },
    { value: 'oz', label: 'Ounces (oz)' },
    { value: 'lb', label: 'Pounds (lb)' },
];

type ConversionType = 'length' | 'area' | 'weight';

const tabs: { key: ConversionType; label: string }[] = [
    { key: 'length', label: 'Length' },
    { key: 'area', label: 'Area' },
    { key: 'weight', label: 'Weight' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ConversionsCalculator() {
    const [conversionType, setConversionType] = useState<ConversionType>('length');
    const [inputValue, setInputValue] = useState('1');
    const [fromUnit, setFromUnit] = useState('m');
    const [toUnit, setToUnit] = useState('ft');

    // Reset units when switching type
    function handleTypeChange(type: ConversionType) {
        setConversionType(type);
        setInputValue('1');
        if (type === 'length') { setFromUnit('m'); setToUnit('ft'); }
        if (type === 'area') { setFromUnit('m2'); setToUnit('ft2'); }
        if (type === 'weight') { setFromUnit('kg'); setToUnit('lb'); }
    }

    function handleSwap() {
        setFromUnit(toUnit);
        setToUnit(fromUnit);
    }

    const options = conversionType === 'length'
        ? lengthOptions
        : conversionType === 'area'
            ? areaOptions
            : weightOptions;

    const result = useMemo(() => {
        const val = parseFloat(inputValue);
        if (isNaN(val)) return null;

        try {
            if (conversionType === 'length') {
                return convertLength(val, fromUnit as LengthUnit, toUnit as LengthUnit);
            }
            if (conversionType === 'area') {
                return convertArea(val, fromUnit as AreaUnit, toUnit as AreaUnit);
            }
            return convertWeight(val, fromUnit as WeightUnit, toUnit as WeightUnit);
        } catch {
            return null;
        }
    }, [inputValue, fromUnit, toUnit, conversionType]);

    const fromLabel = options.find((o) => o.value === fromUnit)?.label ?? fromUnit;
    const toLabel = options.find((o) => o.value === toUnit)?.label ?? toUnit;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-1">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            className="text-brand-blue"
                        >
                            <path d="M8 3 4 7l4 4" />
                            <path d="M4 7h16" />
                            <path d="m16 21 4-4-4-4" />
                            <path d="M20 17H4" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-surface-foreground">Unit Converter</h1>
                        <p className="text-sm text-muted-foreground">Convert between metric and imperial measurements.</p>
                    </div>
                </div>
            </div>

            {/* Type tabs */}
            <div className="flex gap-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => handleTypeChange(tab.key)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 focus-ring ${conversionType === tab.key
                                ? 'bg-brand-blue/10 text-brand-blue font-semibold'
                                : 'text-muted-foreground hover:bg-muted/50 hover:text-surface-foreground'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Converter card */}
            <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-5">
                {/* Input value */}
                <div>
                    <label htmlFor="convert-value" className="block text-sm font-medium text-surface-foreground mb-1.5">
                        Value
                    </label>
                    <input
                        id="convert-value"
                        type="number"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Enter a value"
                        className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-surface-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all"
                        min={0}
                        step="any"
                    />
                </div>

                {/* From / Swap / To */}
                <div className="flex items-end gap-3">
                    <div className="flex-1">
                        <label htmlFor="from-unit" className="block text-sm font-medium text-surface-foreground mb-1.5">
                            From
                        </label>
                        <select
                            id="from-unit"
                            value={fromUnit}
                            onChange={(e) => setFromUnit(e.target.value)}
                            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-surface-foreground focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all"
                        >
                            {options.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="button"
                        onClick={handleSwap}
                        className="w-10 h-10 rounded-lg border border-border bg-muted/30 flex items-center justify-center hover:bg-muted transition-colors focus-ring mb-0.5"
                        aria-label="Swap units"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            className="text-muted-foreground"
                        >
                            <path d="M8 3 4 7l4 4" />
                            <path d="M4 7h16" />
                            <path d="m16 21 4-4-4-4" />
                            <path d="M20 17H4" />
                        </svg>
                    </button>

                    <div className="flex-1">
                        <label htmlFor="to-unit" className="block text-sm font-medium text-surface-foreground mb-1.5">
                            To
                        </label>
                        <select
                            id="to-unit"
                            value={toUnit}
                            onChange={(e) => setToUnit(e.target.value)}
                            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-surface-foreground focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all"
                        >
                            {options.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Result */}
                {result !== null && (
                    <div className="pt-3 border-t border-border">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                    className="text-green-600"
                                >
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>
                            <span className="text-sm text-muted-foreground">Result</span>
                        </div>
                        <p className="text-2xl font-bold text-surface-foreground">
                            {result < 0.01 && result > 0
                                ? result.toExponential(4)
                                : result.toLocaleString('en-GB', { maximumFractionDigits: 6 })}
                            <span className="text-base font-normal text-muted-foreground ml-2">{toLabel}</span>
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            {inputValue} {fromLabel} = {result < 0.01 && result > 0
                                ? result.toExponential(4)
                                : result.toLocaleString('en-GB', { maximumFractionDigits: 6 })} {toLabel}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
