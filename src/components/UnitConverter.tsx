import React, { useState } from 'react';
import { UNITS, convertUnits, type ConversionFamily } from '../calculators/conversions';

const FAMILY_OPTIONS: ConversionFamily[] = ['length', 'area', 'volume', 'weight', 'temperature'];

/** Human-readable labels for each conversion family. */
const FAMILY_LABELS: Record<ConversionFamily, string> = {
    length: 'Length',
    area: 'Area',
    volume: 'Volume',
    weight: 'Weight',
    temperature: 'Temperature',
};

/** Default from/to unit pairs when a family is first selected. */
const FAMILY_DEFAULTS: Record<ConversionFamily, { from: string; to: string }> = {
    length: { from: 'm', to: 'ft' },
    area: { from: 'm2', to: 'ft2' },
    volume: { from: 'm3', to: 'ft3' },
    weight: { from: 'kg', to: 'lb' },
    temperature: { from: 'C', to: 'F' },
};

export default function UnitConverter() {
    const [family, setFamily] = useState<ConversionFamily>('length');
    const [valueStr, setValueStr] = useState<string>('1');
    const [fromUnit, setFromUnit] = useState<string>(FAMILY_DEFAULTS.length.from);
    const [toUnit, setToUnit] = useState<string>(FAMILY_DEFAULTS.length.to);
    const [copied, setCopied] = useState(false);

    const handleFamilyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newFamily = e.target.value as ConversionFamily;
        setFamily(newFamily);
        setFromUnit(FAMILY_DEFAULTS[newFamily].from);
        setToUnit(FAMILY_DEFAULTS[newFamily].to);
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

    const currentUnits = UNITS[family] ?? [];

    const parsedValue = parseFloat(valueStr);
    const isValid = !isNaN(parsedValue);

    let resultStr = '';
    let fullResultText = '';

    if (isValid) {
        try {
            const resultValue = convertUnits(family, fromUnit, toUnit, parsedValue);

            const roundedResult = resultValue.toFixed(2);
            // Avoid showing 0.00 for very small values
            const finalResult = (resultValue > 0 && Math.abs(resultValue) < 0.005)
                ? resultValue.toPrecision(2)
                : roundedResult;

            resultStr = `${finalResult} ${toUnit}`;
            fullResultText = `${parsedValue} ${fromUnit} = ${resultStr}`;
        } catch {
            // Invalid unit combination — show nothing
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
                                <option key={fam} value={fam}>{FAMILY_LABELS[fam]}</option>
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
                                    <option key={u.value} value={u.value}>{u.label}</option>
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
                                    <option key={u.value} value={u.value}>{u.label}</option>
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
                            className="btn-ghost mt-6"
                        >
                            {copied ? 'Copied!' : 'Copy result'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
