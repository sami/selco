import React, { useState } from 'react';

const WASTAGE_OPTIONS = [0, 5, 10, 15];

type InputMode = 'area' | 'dimensions';
type AreaUnit = 'm²' | 'sq ft';
type LengthUnit = 'm' | 'cm' | 'mm' | 'in';

const AREA_MULTIPLIERS: Record<AreaUnit, number> = {
    'm²': 1,
    'sq ft': 0.092903,
};

const LENGTH_MULTIPLIERS: Record<LengthUnit, number> = {
    'm': 1,
    'cm': 0.01,
    'mm': 0.001,
    'in': 0.0254,
};

export default function CoverageCalculator() {
    const [areaStr, setAreaStr] = useState<string>('');
    const [areaUnit, setAreaUnit] = useState<AreaUnit>('m²');

    const [inputType, setInputType] = useState<InputMode>('area');

    const [coverageStr, setCoverageStr] = useState<string>('');
    const [coverageUnit, setCoverageUnit] = useState<AreaUnit>('m²');

    const [unitLengthStr, setUnitLengthStr] = useState<string>('');
    const [unitLengthUnit, setUnitLengthUnit] = useState<LengthUnit>('m');

    const [unitWidthStr, setUnitWidthStr] = useState<string>('');
    const [unitWidthUnit, setUnitWidthUnit] = useState<LengthUnit>('m');

    const [wastage, setWastage] = useState<number>(10);

    const parsedAreaInput = parseFloat(areaStr);
    const parsedAreaInSqm = parsedAreaInput * AREA_MULTIPLIERS[areaUnit];

    let parsedCoverageInSqm = 0;
    let isCoverageValid = false;

    if (inputType === 'area') {
        const parsedCoverageInput = parseFloat(coverageStr);
        if (!isNaN(parsedCoverageInput) && parsedCoverageInput > 0) {
            parsedCoverageInSqm = parsedCoverageInput * AREA_MULTIPLIERS[coverageUnit];
            isCoverageValid = true;
        }
    } else {
        const l = parseFloat(unitLengthStr);
        const w = parseFloat(unitWidthStr);
        if (!isNaN(l) && l > 0 && !isNaN(w) && w > 0) {
            const lengthInMeters = l * LENGTH_MULTIPLIERS[unitLengthUnit];
            const widthInMeters = w * LENGTH_MULTIPLIERS[unitWidthUnit];
            parsedCoverageInSqm = lengthInMeters * widthInMeters;
            isCoverageValid = true;
        }
    }

    const isValid = !isNaN(parsedAreaInSqm) && parsedAreaInSqm > 0 && isCoverageValid;

    let units = 0;
    let maxAreaInSqm = 0;
    let hasWastage = false;

    if (isValid) {
        const areaWithWastageSqm = parsedAreaInSqm * (1 + wastage / 100);
        units = Math.ceil(areaWithWastageSqm / parsedCoverageInSqm);
        maxAreaInSqm = units * parsedCoverageInSqm;
        hasWastage = wastage > 0;
    }

    // A helper to display the selected max area unit properly
    const maxAreaDisplay = Number(maxAreaInSqm / AREA_MULTIPLIERS[areaUnit]).toFixed(2).replace(/\.00$/, '');

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl mx-auto">
            {/* Left card: Inputs */}
            <div className="card">
                <h2 className="text-xl font-bold text-text-main mb-4">Input measurements</h2>

                <div className="space-y-6">
                    <div>
                        <label className="form-label">Total area to cover</label>
                        <div className="flex shadow-sm rounded-lg">
                            <input
                                type="number"
                                value={areaStr}
                                onChange={(e) => setAreaStr(e.target.value)}
                                placeholder="e.g. 15"
                                className="form-input rounded-r-none border-r-0 focus:z-10 w-full"
                                min="0"
                                step="any"
                            />
                            <select
                                className="form-select w-auto min-w-[80px] rounded-l-none border-l-border-default focus:z-10 bg-gray-50 text-text-main font-medium cursor-pointer"
                                value={areaUnit}
                                onChange={(e) => setAreaUnit(e.target.value as AreaUnit)}
                            >
                                <option value="m²">m²</option>
                                <option value="sq ft">sq ft</option>
                            </select>
                        </div>
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
                                <p className="field-description mb-2 mt-0">Enter the total area a single unit covers.</p>
                                <div className="flex shadow-sm rounded-lg">
                                    <input
                                        type="number"
                                        value={coverageStr}
                                        onChange={(e) => setCoverageStr(e.target.value)}
                                        placeholder="e.g. 1.5"
                                        className="form-input rounded-r-none border-r-0 focus:z-10 w-full"
                                        min="0"
                                        step="any"
                                    />
                                    <select
                                        className="form-select w-auto min-w-[80px] rounded-l-none border-l-border-default focus:z-10 bg-gray-50 text-text-main font-medium cursor-pointer"
                                        value={coverageUnit}
                                        onChange={(e) => setCoverageUnit(e.target.value as AreaUnit)}
                                    >
                                        <option value="m²">m²</option>
                                        <option value="sq ft">sq ft</option>
                                    </select>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <p className="field-description mb-2 mt-0">Enter the dimensions of a single sheet, board, or roll.</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="form-label text-sm text-muted-foreground font-normal mb-1">Length</label>
                                        <div className="flex shadow-sm rounded-lg">
                                            <input
                                                type="number"
                                                value={unitLengthStr}
                                                onChange={(e) => setUnitLengthStr(e.target.value)}
                                                placeholder="e.g. 2.4"
                                                className="form-input rounded-r-none border-r-0 focus:z-10 w-full"
                                                min="0"
                                                step="any"
                                            />
                                            <select
                                                className="form-select w-[70px] rounded-l-none border-l-border-default focus:z-10 bg-gray-50 text-text-main font-medium px-2 cursor-pointer"
                                                value={unitLengthUnit}
                                                onChange={(e) => setUnitLengthUnit(e.target.value as LengthUnit)}
                                            >
                                                <option value="m">m</option>
                                                <option value="cm">cm</option>
                                                <option value="mm">mm</option>
                                                <option value="in">in</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="form-label text-sm text-muted-foreground font-normal mb-1">Width</label>
                                        <div className="flex shadow-sm rounded-lg">
                                            <input
                                                type="number"
                                                value={unitWidthStr}
                                                onChange={(e) => setUnitWidthStr(e.target.value)}
                                                placeholder="e.g. 1.2"
                                                className="form-input rounded-r-none border-r-0 focus:z-10 w-full"
                                                min="0"
                                                step="any"
                                            />
                                            <select
                                                className="form-select w-[70px] rounded-l-none border-l-border-default focus:z-10 bg-gray-50 text-text-main font-medium px-2 cursor-pointer"
                                                value={unitWidthUnit}
                                                onChange={(e) => setUnitWidthUnit(e.target.value as LengthUnit)}
                                            >
                                                <option value="m">m</option>
                                                <option value="cm">cm</option>
                                                <option value="mm">mm</option>
                                                <option value="in">in</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                {isCoverageValid && (
                                    <p className="text-sm font-medium text-primary mt-3">
                                        Calculated coverage: {(parsedCoverageInSqm / AREA_MULTIPLIERS[areaUnit]).toFixed(2).replace(/\.00$/, '')} {areaUnit} per unit
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
                                {units} {units === 1 ? 'unit' : 'units'} will cover up to <span className="font-semibold">{maxAreaDisplay} {areaUnit}</span>.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
