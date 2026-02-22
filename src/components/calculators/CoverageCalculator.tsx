import React, { useState } from 'react';

const WASTAGE_OPTIONS = [0, 5, 10, 15];

const BOARD_PRESETS = [
    { label: '2440 x 1220mm', length: 2.44, width: 1.22, description: 'Standard Plywood / MDF' },
    { label: '2400 x 1200mm', length: 2.4, width: 1.2, description: 'Standard Plasterboard' },
    { label: '1800 x 900mm', length: 1.8, width: 0.9, description: 'Small Plasterboard' },
    { label: '1200 x 800mm', length: 1.2, width: 0.8, description: 'Tile Backer Board' },
    { label: '1200 x 600mm', length: 1.2, width: 0.6, description: 'Tile Backer / Insulation' },
];

export default function CoverageCalculator() {
    const [areaStr, setAreaStr] = useState<string>('');
    const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(1); // Default to 2400x1200

    // Custom dimensions state
    const [customLengthStr, setCustomLengthStr] = useState<string>('');
    const [customWidthStr, setCustomWidthStr] = useState<string>('');

    const [wastage, setWastage] = useState<number>(10);

    const parsedArea = parseFloat(areaStr);

    let boardAreaSqm = 0;
    let isBoardAreaValid = false;

    if (selectedPresetIndex !== -1) {
        const preset = BOARD_PRESETS[selectedPresetIndex];
        boardAreaSqm = preset.length * preset.width;
        isBoardAreaValid = true;
    } else {
        const l = parseFloat(customLengthStr);
        const w = parseFloat(customWidthStr);
        if (!isNaN(l) && l > 0 && !isNaN(w) && w > 0) {
            boardAreaSqm = l * w;
            isBoardAreaValid = true;
        }
    }

    const isValid = !isNaN(parsedArea) && parsedArea > 0 && isBoardAreaValid;

    let boards = 0;
    let maxAreaSqm = 0;
    let hasWastage = false;

    if (isValid) {
        const areaWithWastageSqm = parsedArea * (1 + wastage / 100);
        boards = Math.ceil(areaWithWastageSqm / boardAreaSqm);
        maxAreaSqm = boards * boardAreaSqm;
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
                        <label className="form-label mb-0">Board size</label>
                        <p className="field-description mb-3 mt-0">Select a standard UK board size or enter custom dimensions.</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                            {BOARD_PRESETS.map((preset, index) => (
                                <button
                                    key={preset.label}
                                    type="button"
                                    onClick={() => setSelectedPresetIndex(index)}
                                    className={`text-left px-4 py-3 rounded-lg border transition-colors focus:focus-ring flex flex-col ${selectedPresetIndex === index
                                            ? 'bg-primary/5 border-primary shadow-sm'
                                            : 'bg-bg-section border-border-default hover:border-primary/50'
                                        }`}
                                >
                                    <span className={`font-bold text-sm ${selectedPresetIndex === index ? 'text-primary-dark' : 'text-text-main'}`}>
                                        {preset.label}
                                    </span>
                                    <span className="text-xs text-text-muted mt-0.5">{preset.description}</span>
                                </button>
                            ))}

                            <button
                                type="button"
                                onClick={() => setSelectedPresetIndex(-1)}
                                className={`text-left px-4 py-3 rounded-lg border transition-colors focus:focus-ring flex flex-col ${selectedPresetIndex === -1
                                        ? 'bg-primary/5 border-primary shadow-sm'
                                        : 'bg-bg-section border-border-default hover:border-primary/50'
                                    }`}
                            >
                                <span className={`font-bold text-sm ${selectedPresetIndex === -1 ? 'text-primary-dark' : 'text-text-main'}`}>
                                    Custom size
                                </span>
                                <span className="text-xs text-text-muted mt-0.5">Enter your own length and width</span>
                            </button>
                        </div>

                        {selectedPresetIndex === -1 && (
                            <div className="pt-3 border-t border-border-default/50">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="custom-length" className="form-label text-sm text-text-muted font-normal mb-1">Length (m)</label>
                                        <input
                                            id="custom-length"
                                            type="number"
                                            value={customLengthStr}
                                            onChange={(e) => setCustomLengthStr(e.target.value)}
                                            placeholder="e.g. 2.4"
                                            className="form-input"
                                            min="0"
                                            step="any"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="custom-width" className="form-label text-sm text-text-muted font-normal mb-1">Width (m)</label>
                                        <input
                                            id="custom-width"
                                            type="number"
                                            value={customWidthStr}
                                            onChange={(e) => setCustomWidthStr(e.target.value)}
                                            placeholder="e.g. 1.2"
                                            className="form-input"
                                            min="0"
                                            step="any"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {isBoardAreaValid && (
                            <p className="text-sm font-medium text-primary mt-3">
                                Calculated coverage: {boardAreaSqm.toFixed(2).replace(/\.00$/, '')} m² per board
                            </p>
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
                            Enter your project area and select a board size to calculate how many you need.
                        </p>
                    </div>
                ) : (
                    <div className="w-full text-left">
                        <h2 className="text-xl font-bold text-text-main mb-6">You will need to buy:</h2>

                        <div className="text-4xl md:text-5xl font-extrabold text-primary-dark mb-4">
                            {boards} {boards === 1 ? 'board' : 'boards'}
                        </div>

                        <div className="space-y-1 mt-4 border-t border-border-default pt-4 border-opacity-50">
                            {hasWastage && (
                                <p className="text-sm font-medium text-text-main">
                                    Includes {wastage}% wastage allowance.
                                </p>
                            )}
                            <p className="text-sm text-text-muted">
                                {boards} {boards === 1 ? 'board' : 'boards'} will cover up to <span className="font-semibold">{maxAreaSqm.toFixed(2).replace(/\.00$/, '')} m²</span>.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
