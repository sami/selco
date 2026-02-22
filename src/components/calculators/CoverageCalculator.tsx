import React, { useState } from 'react';

const WASTAGE_OPTIONS = [0, 5, 10, 15];

type InputMode = 'area' | 'dimensions';

export default function CoverageCalculator() {
    const [areaStr, setAreaStr] = useState<string>('');
    const [inputType, setInputType] = useState<InputMode>('area');
    const [coverageStr, setCoverageStr] = useState<string>('');
    const [unitLengthStr, setUnitLengthStr] = useState<string>('');
    const [unitWidthStr, setUnitWidthStr] = useState<string>('');
    const [wastage, setWastage] = useState<number>(10);

    const parsedArea = parseFloat(areaStr);

    let parsedCoverage: number;
    let isCoverageValid = false;

    if (inputType === 'area') {
        parsedCoverage = parseFloat(coverageStr);
        isCoverageValid = !isNaN(parsedCoverage) && parsedCoverage > 0;
    } else {
        const l = parseFloat(unitLengthStr);
        const w = parseFloat(unitWidthStr);
        if (!isNaN(l) && l > 0 && !isNaN(w) && w > 0) {
            parsedCoverage = l * w;
            isCoverageValid = true;
        } else {
            parsedCoverage = NaN;
        }
    }

    const isValid = !isNaN(parsedArea) && parsedArea > 0 && isCoverageValid;

    let units = 0;
    let maxArea = 0;
    let hasWastage = false;

    if (isValid) {
        const areaWithWastage = parsedArea * (1 + wastage / 100);
        units = Math.ceil(areaWithWastage / parsedCoverage);
        maxArea = units * parsedCoverage;
        hasWastage = wastage > 0;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl mx-auto">
            {/* Left card: Inputs */}
            <div className="card">
                <h2 className="text-xl font-bold text-text-main mb-4">Input measurements</h2>

                <div className="space-y-6">
                    <div>
                        <label htmlFor="area-input" className="form-label">Total area to cover (m²)</label>
                        <input
                            id="area-input"
                            type="number"
                            value={areaStr}
                            onChange={(e) => setAreaStr(e.target.value)}
                            placeholder="e.g. 15"
                            className="form-input"
                            min="0"
                            step="any"
                        />
                    </div>

                    <div className="p-4 bg-muted/10 rounded-xl border border-border-default space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <label className="form-label mb-0">Unit coverage</label>
                            <div className="flex bg-muted/20 p-1 rounded-lg self-start">
                                <button
                                    type="button"
                                    onClick={() => setInputType('area')}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${inputType === 'area' ? 'bg-white shadow-sm text-surface-foreground' : 'text-muted-foreground hover:text-surface-foreground'
                                        }`}
                                >
                                    Area per unit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setInputType('dimensions')}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${inputType === 'dimensions' ? 'bg-white shadow-sm text-surface-foreground' : 'text-muted-foreground hover:text-surface-foreground'
                                        }`}
                                >
                                    Dimensions
                                </button>
                            </div>
                        </div>

                        {inputType === 'area' ? (
                            <div>
                                <p className="field-description mb-2 mt-0">Enter the total square metres a single unit covers.</p>
                                <input
                                    id="coverage-input"
                                    type="number"
                                    value={coverageStr}
                                    onChange={(e) => setCoverageStr(e.target.value)}
                                    placeholder="e.g. 1.5"
                                    className="form-input"
                                    min="0"
                                    step="any"
                                />
                            </div>
                        ) : (
                            <div>
                                <p className="field-description mb-2 mt-0">Enter the dimensions of a single sheet, board, or roll.</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="length-input" className="form-label text-sm text-muted-foreground font-normal mb-1">Length (m)</label>
                                        <input
                                            id="length-input"
                                            type="number"
                                            value={unitLengthStr}
                                            onChange={(e) => setUnitLengthStr(e.target.value)}
                                            placeholder="e.g. 2.4"
                                            className="form-input"
                                            min="0"
                                            step="any"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="width-input" className="form-label text-sm text-muted-foreground font-normal mb-1">Width (m)</label>
                                        <input
                                            id="width-input"
                                            type="number"
                                            value={unitWidthStr}
                                            onChange={(e) => setUnitWidthStr(e.target.value)}
                                            placeholder="e.g. 1.2"
                                            className="form-input"
                                            min="0"
                                            step="any"
                                        />
                                    </div>
                                </div>
                                {isCoverageValid && (
                                    <p className="text-sm font-medium text-brand-blue mt-3">
                                        Calculated coverage: {parsedCoverage.toFixed(2).replace(/\.00$/, '')} m² per unit
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="form-label mb-2">Wastage allowance</label>
                        <div className="flex flex-wrap gap-2">
                            {WASTAGE_OPTIONS.map((w) => (
                                <button
                                    key={w}
                                    type="button"
                                    onClick={() => setWastage(w)}
                                    className={`px-4 py-2 rounded-lg border font-medium text-sm transition-colors focus:focus-ring ${wastage === w
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-bg-section text-text-main border-border-default hover:border-primary'
                                        }`}
                                >
                                    {w === 0 ? 'None' : `${w}%`}
                                </button>
                            ))}
                        </div>
                        <p className="field-description mt-2">
                            Always add wastage for offcuts and breakages. 10% is standard for most jobs.
                        </p>
                    </div>
                </div>

                <p className="field-description mt-6 border-t border-border-default pt-4">
                    Change the numbers – the result updates straight away.
                </p>
            </div>

            {/* Right card: Result */}
            <div className="card flex flex-col items-center justify-center min-h-[250px] bg-primary/5 border-primary/20 text-center">
                {!isValid ? (
                    <div className="w-full text-left space-y-2">
                        <h2 className="text-xl font-bold text-text-main mb-2">Result</h2>
                        <p className="text-text-muted">
                            Enter your area and unit coverage to see how many you need to buy.
                        </p>
                    </div>
                ) : (
                    <div className="w-full text-left">
                        <h2 className="text-xl font-bold text-text-main mb-6">You will need to buy:</h2>

                        <div className="text-4xl md:text-5xl font-extrabold text-primary-dark mb-4">
                            {units} {units === 1 ? 'unit' : 'units'}
                        </div>

                        <div className="space-y-1 mt-4 border-t border-border-default pt-4 border-opacity-50">
                            {hasWastage && (
                                <p className="text-sm font-medium text-text-main">
                                    Includes {wastage}% wastage allowance.
                                </p>
                            )}
                            <p className="text-sm text-text-muted">
                                {units} {units === 1 ? 'unit' : 'units'} will cover up to <span className="font-semibold">{maxArea.toFixed(2).replace(/\.00$/, '')} m²</span>.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
