import React, { useState, useMemo } from 'react';
import {
    convertLength,
    convertArea,
    convertWeight,
    convertVolume,
    convertTemperature,
    convertDensityToWeight,
    DENSITY,
    UNITS,
    type LengthUnit,
    type AreaUnit,
    type WeightUnit,
    type VolumeUnit,
    type TemperatureUnit,
    type DensityMaterial,
} from '../calculators/conversions';

// ---------------------------------------------------------------------------
// Tab configuration
// ---------------------------------------------------------------------------

type ConversionType = 'length' | 'area' | 'volume' | 'weight' | 'temperature' | 'density';

interface TabConfig {
    key: ConversionType;
    label: string;
    defaultFrom: string;
    defaultTo: string;
}

const tabs: TabConfig[] = [
    { key: 'length', label: 'Length', defaultFrom: 'm', defaultTo: 'ft' },
    { key: 'area', label: 'Area', defaultFrom: 'm2', defaultTo: 'ft2' },
    { key: 'volume', label: 'Volume', defaultFrom: 'm3', defaultTo: 'litres' },
    { key: 'weight', label: 'Weight', defaultFrom: 'kg', defaultTo: 'lb' },
    { key: 'temperature', label: 'Temperature', defaultFrom: 'C', defaultTo: 'F' },
    { key: 'density', label: 'Density', defaultFrom: 'concrete', defaultTo: '' },
];

const materialOptions: { value: DensityMaterial; label: string }[] = [
    { value: 'concrete', label: 'Concrete (2.4 t/m³)' },
    { value: 'hardcore', label: 'Hardcore / MOT Type 1 (2.1 t/m³)' },
    { value: 'sand', label: 'Building / Soft Sand (1.6 t/m³)' },
    { value: 'sharp_sand', label: 'Sharp Sand (1.7 t/m³)' },
    { value: 'plastering_sand', label: 'Plastering / Fine Sand (1.5 t/m³)' },
    { value: 'gravel_10mm', label: 'Gravel 10 mm (1.8 t/m³)' },
    { value: 'gravel_20mm', label: 'Gravel 20 mm (1.8 t/m³)' },
    { value: 'ballast_20mm', label: 'Ballast 20 mm (1.8 t/m³)' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ConversionsCalculator() {
    const [conversionType, setConversionType] = useState<ConversionType>('length');
    const [inputValue, setInputValue] = useState('1');
    const [fromUnit, setFromUnit] = useState('m');
    const [toUnit, setToUnit] = useState('ft');
    const [densityMaterial, setDensityMaterial] = useState<DensityMaterial>('concrete');

    function handleTypeChange(tab: TabConfig) {
        setConversionType(tab.key);
        setInputValue('1');
        setFromUnit(tab.defaultFrom);
        setToUnit(tab.defaultTo);
        if (tab.key === 'density') {
            setDensityMaterial('concrete');
        }
    }

    function handleSwap() {
        setFromUnit(toUnit);
        setToUnit(fromUnit);
    }

    // Get options for current type (not used for density)
    const options = useMemo(() => {
        switch (conversionType) {
            case 'length': return UNITS.length;
            case 'area': return UNITS.area;
            case 'volume': return UNITS.volume;
            case 'weight': return UNITS.weight;
            case 'temperature': return UNITS.temperature;
            default: return [];
        }
    }, [conversionType]);

    // Calculate result
    const result = useMemo(() => {
        const val = parseFloat(inputValue);
        if (isNaN(val)) return null;

        try {
            switch (conversionType) {
                case 'length':
                    return convertLength(val, fromUnit as LengthUnit, toUnit as LengthUnit);
                case 'area':
                    return convertArea(val, fromUnit as AreaUnit, toUnit as AreaUnit);
                case 'volume':
                    return convertVolume(val, fromUnit as VolumeUnit, toUnit as VolumeUnit);
                case 'weight':
                    return convertWeight(val, fromUnit as WeightUnit, toUnit as WeightUnit);
                case 'temperature':
                    return convertTemperature(val, fromUnit as TemperatureUnit, toUnit as TemperatureUnit);
                case 'density':
                    return convertDensityToWeight(val, densityMaterial);
                default:
                    return null;
            }
        } catch {
            return null;
        }
    }, [inputValue, fromUnit, toUnit, conversionType, densityMaterial]);

    const fromLabel = options.find((o) => o.value === fromUnit)?.label ?? fromUnit;
    const toLabel = options.find((o) => o.value === toUnit)?.label ?? toUnit;

    const formatResult = (r: number) =>
        r < 0.01 && r > 0
            ? r.toExponential(4)
            : r.toLocaleString('en-GB', { maximumFractionDigits: 6 });

    // Density tab has a distinct UI
    const isDensity = conversionType === 'density';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl md:text-3xl font-bold text-surface-foreground">Unit Converter</h2>
                <p className="text-sm text-muted-foreground">Convert between metric and imperial measurements.</p>
            </div>

            {/* Type tabs */}
            <div className="flex flex-wrap gap-2 md:gap-4" role="tablist" aria-label="Conversion type">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        role="tab"
                        aria-selected={conversionType === tab.key}
                        onClick={() => handleTypeChange(tab)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 focus:focus-ring ${conversionType === tab.key
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
                {isDensity ? (
                    /* Density-specific UI */
                    <>
                        <div>
                            <label htmlFor="density-volume" className="block text-sm font-medium text-surface-foreground mb-1.5">
                                Volume (m³)
                            </label>
                            <input
                                id="density-volume"
                                type="number"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Enter volume in cubic metres"
                                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-surface-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all"
                                min={0}
                                step="any"
                            />
                        </div>
                        <div>
                            <label htmlFor="density-material" className="block text-sm font-medium text-surface-foreground mb-1.5">
                                Material
                            </label>
                            <select
                                id="density-material"
                                value={densityMaterial}
                                onChange={(e) => setDensityMaterial(e.target.value as DensityMaterial)}
                                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-surface-foreground focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all"
                            >
                                {materialOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </>
                ) : (
                    /* Standard conversion UI */
                    <>
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
                                className="w-10 h-10 rounded-lg border border-border bg-muted/30 flex items-center justify-center hover:bg-muted transition-colors focus:focus-ring mb-0.5 text-sm font-medium text-muted-foreground"
                                aria-label="Swap units"
                            >
                                ⇄
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
                    </>
                )}

                {/* Result */}
                {result !== null ? (
                    <div className="pt-3 border-t border-border">
                        <p className="text-sm text-muted-foreground mb-2">Result</p>
                        <p className="text-2xl font-bold text-surface-foreground">
                            {formatResult(result)}
                            <span className="text-base font-normal text-muted-foreground ml-2">
                                {isDensity ? 'tonnes' : toLabel}
                            </span>
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            {isDensity
                                ? `${inputValue} m³ of ${densityMaterial} ≈ ${formatResult(result)} tonnes`
                                : `${inputValue} ${fromLabel} = ${formatResult(result)} ${toLabel}`
                            }
                        </p>
                    </div>
                ) : inputValue && (
                    <div className="pt-3 border-t border-border">
                        <p className="text-sm text-[--color-destructive]">Please enter a valid number.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
