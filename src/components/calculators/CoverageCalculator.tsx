import React, { useState } from 'react';

const WASTAGE_OPTIONS = [0, 5, 10, 15];

export default function CoverageCalculator() {
    const [areaStr, setAreaStr] = useState<string>('');
    const [coverageStr, setCoverageStr] = useState<string>('');
    const [wastage, setWastage] = useState<number>(10);

    const parsedArea = parseFloat(areaStr);
    const parsedCoverage = parseFloat(coverageStr);

    const isValid = !isNaN(parsedArea) && parsedArea > 0 && !isNaN(parsedCoverage) && parsedCoverage > 0;

    let packs = 0;
    let maxArea = 0;
    let hasWastage = false;

    if (isValid) {
        const areaWithWastage = parsedArea * (1 + wastage / 100);
        packs = Math.ceil(areaWithWastage / parsedCoverage);
        maxArea = packs * parsedCoverage;
        hasWastage = wastage > 0;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl mx-auto">
            {/* Left card: Inputs */}
            <div className="card">
                <h2 className="text-xl font-bold text-text-main mb-4">Input measurements</h2>

                <div className="space-y-4">
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

                    <div>
                        <label htmlFor="coverage-input" className="form-label">Unit coverage (m²)</label>
                        <p className="field-description mb-1.5 mt-0">Check the product label for how many square metres a single unit (pack, sheet, roll) covers.</p>
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

                    <div>
                        <label className="form-label mb-2">Wastage allowance</label>
                        <div className="flex flex-wrap gap-2">
                            {WASTAGE_OPTIONS.map((w) => (
                                <button
                                    key={w}
                                    type="button"
                                    onClick={() => setWastage(w)}
                                    className={`px-4 py-2 rounded-lg border font-medium text-sm transition-colors focus-ring ${wastage === w
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
                            {packs} {packs === 1 ? 'unit' : 'units'}
                        </div>

                        <div className="space-y-1 mt-4 border-t border-border-default pt-4 border-opacity-50">
                            {hasWastage && (
                                <p className="text-sm font-medium text-text-main">
                                    Includes {wastage}% wastage allowance.
                                </p>
                            )}
                            <p className="text-sm text-text-muted">
                                {packs} {packs === 1 ? 'unit' : 'units'} will cover up to <span className="font-semibold">{maxArea.toFixed(2).replace(/\.00$/, '')} m²</span>.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
