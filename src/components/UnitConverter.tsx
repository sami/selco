import React, { useState, useMemo } from 'react';

type UnitFamily = 'Length' | 'Area' | 'Volume' | 'Weight';

interface UnitDef {
    id: string;
    label: string;
    factor: number; // Factor relative to the base unit of the family
}

const UNIT_FAMILIES: Record<UnitFamily, UnitDef[]> = {
    Length: [
        { id: 'mm', label: 'Millimetres (mm)', factor: 0.001 },
        { id: 'cm', label: 'Centimetres (cm)', factor: 0.01 },
        { id: 'm', label: 'Metres (m)', factor: 1 },
        { id: 'in', label: 'Inches (in)', factor: 0.0254 },
        { id: 'ft', label: 'Feet (ft)', factor: 0.3048 },
        { id: 'yd', label: 'Yards (yd)', factor: 0.9144 },
    ],
    Area: [
        { id: 'mm2', label: 'Square millimetres (mm²)', factor: 0.000001 },
        { id: 'm2', label: 'Square metres (m²)', factor: 1 },
        { id: 'ft2', label: 'Square feet (ft²)', factor: 0.09290304 },
        { id: 'yd2', label: 'Square yards (yd²)', factor: 0.83612736 },
    ],
    Volume: [
        { id: 'ml', label: 'Millilitres (ml)', factor: 0.001 },
        { id: 'L', label: 'Litres (L)', factor: 1 },
        { id: 'm3', label: 'Cubic metres (m³)', factor: 1000 },
        { id: 'ft3', label: 'Cubic feet (ft³)', factor: 28.316846592 },
    ],
    Weight: [
        { id: 'g', label: 'Grams (g)', factor: 0.001 },
        { id: 'kg', label: 'Kilograms (kg)', factor: 1 },
        { id: 't', label: 'Tonnes (t)', factor: 1000 },
        { id: 'lb', label: 'Pounds (lb)', factor: 0.45359237 },
        { id: 'st', label: 'Stones (st)', factor: 6.35029318 },
    ]
};

const FAMILY_OPTIONS: UnitFamily[] = ['Length', 'Area', 'Volume', 'Weight'];

export default function UnitConverter() {
    const [family, setFamily] = useState<UnitFamily>('Length');
    const [valueStr, setValueStr] = useState<string>('1');
    const [fromUnit, setFromUnit] = useState<string>('m');
    const [toUnit, setToUnit] = useState<string>('ft');
    const [copied, setCopied] = useState(false);

    // When family changes, reset default units
    const handleFamilyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newFamily = e.target.value as UnitFamily;
        setFamily(newFamily);

        // Set sensible defaults. e.g. first two items.
        const units = UNIT_FAMILIES[newFamily];
        if (units && units.length > 1) {
            setFromUnit(units[1].id); // Usually a standard metric unit
            setToUnit(units[units.length - 2].id); // Usually an imperial unit
        }
        setCopied(false);
    };

    const handleCopy = (text: string) => {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            });
        }
    };

    const currentUnits = UNIT_FAMILIES[family] || [];

    // Try to parse the input value
    const parsedValue = parseFloat(valueStr);
    const isValid = !isNaN(parsedValue);

    let resultStr = '';
    let fullResultText = '';

    if (isValid) {
        const fromDef = currentUnits.find(u => u.id === fromUnit);
        const toDef = currentUnits.find(u => u.id === toUnit);

        if (fromDef && toDef) {
            // Calculation: (inputValue * fromFactor) / toFactor
            const baseValue = parsedValue * fromDef.factor;
            const resultValue = baseValue / toDef.factor;

            const roundedResult = resultValue.toFixed(2);
            // Check if it's very small and we shouldn't just show 0.00
            const finalResult = (resultValue > 0 && Math.abs(resultValue) < 0.005)
                ? resultValue.toPrecision(2)
                : roundedResult;

            resultStr = `${finalResult} ${toDef.id}`;
            fullResultText = `${parsedValue} ${fromDef.id} = ${resultStr}`;
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl mx-auto">
            {/* Left card: inputs */}
            <div className="card">
                <h2 className="text-xl font-bold text-text-main mb-4">Input measurements</h2>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="family-select" className="form-label">What are you converting?</label>
                        <select
                            id="family-select"
                            value={family}
                            onChange={handleFamilyChange}
                            className="form-select"
                        >
                            {FAMILY_OPTIONS.map(fam => (
                                <option key={fam} value={fam}>{fam}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="value-input" className="form-label">Value</label>
                        <input
                            id="value-input"
                            type="number"
                            value={valueStr}
                            onChange={(e) => { setValueStr(e.target.value); setCopied(false); }}
                            placeholder="e.g. 10"
                            className="form-input"
                            min="0"
                            step="any"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="from-select" className="form-label">From unit</label>
                            <select
                                id="from-select"
                                value={fromUnit}
                                onChange={(e) => { setFromUnit(e.target.value); setCopied(false); }}
                                className="form-select"
                            >
                                {currentUnits.map(u => (
                                    <option key={u.id} value={u.id}>{u.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="to-select" className="form-label">To unit</label>
                            <select
                                id="to-select"
                                value={toUnit}
                                onChange={(e) => { setToUnit(e.target.value); setCopied(false); }}
                                className="form-select"
                            >
                                {currentUnits.map(u => (
                                    <option key={u.id} value={u.id}>{u.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <p className="field-description mt-5">
                    Change the family, units or value – the result updates straight away.
                </p>
            </div>

            {/* Right card: result */}
            <div className="card flex flex-col items-start justify-center min-h-[250px] bg-primary/5 border-primary/20">
                <h2 className="text-xl font-bold text-text-main mb-4 w-full">Result</h2>

                {!isValid ? (
                    <p className="text-text-muted">
                        Please enter a numerical value to see the conversion.
                    </p>
                ) : (
                    <div className="w-full">
                        <div className="text-2xl md:text-3xl font-extrabold text-primary-dark mb-2 break-words">
                            {fullResultText}
                        </div>
                        <p className="field-description">
                            Rounded to 2 decimal places.
                        </p>

                        <button
                            onClick={() => handleCopy(fullResultText)}
                            className="btn-secondary mt-6"
                        >
                            {copied ? 'Copied!' : 'Copy result'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
