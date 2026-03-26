import React, { useState, useMemo } from 'react';
import { BOARD_PRESETS, calculateBoardCoverage } from '../../calculators/board-coverage';
import { NumberInput } from '../ui/NumberInput';
import { ResultCard } from '../ui/ResultCard';
import type { BoardCoverageResult } from '../../calculators/types';

const WASTAGE_OPTIONS = [0, 5, 10, 15];

// Default to most common plasterboard size
const DEFAULT_PRESET_ID = '2400-1200';

export default function CoverageCalculator() {
    const [areaStr, setAreaStr] = useState<string>('');
    const [selectedPresetId, setSelectedPresetId] = useState<string | null>(DEFAULT_PRESET_ID);

    // Custom dimensions state (entered in metres for familiarity)
    const [customLengthStr, setCustomLengthStr] = useState<string>('');
    const [customWidthStr, setCustomWidthStr] = useState<string>('');

    const [wastage, setWastage] = useState<number>(10);

    const parsedArea = parseFloat(areaStr);

    let boardAreaSqm = 0;
    let isBoardAreaValid = false;

    if (selectedPresetId !== null) {
        const preset = BOARD_PRESETS.find((p) => p.id === selectedPresetId);
        if (preset) {
            boardAreaSqm = preset.coverageM2;
            isBoardAreaValid = true;
        }
    } else {
        const l = parseFloat(customLengthStr);
        const w = parseFloat(customWidthStr);
        if (!isNaN(l) && l > 0 && !isNaN(w) && w > 0) {
            boardAreaSqm = l * w;
            isBoardAreaValid = true;
        }
    }

    const isValid = !isNaN(parsedArea) && parsedArea > 0 && isBoardAreaValid;

    const result = useMemo<BoardCoverageResult | null>(() => {
        if (!isValid) return null;
        const input = selectedPresetId !== null
            ? { areaM2: parsedArea, presetId: selectedPresetId, wastagePercent: wastage }
            : {
                areaM2: parsedArea,
                customLengthMm: parseFloat(customLengthStr) * 1000,
                customWidthMm: parseFloat(customWidthStr) * 1000,
                wastagePercent: wastage,
            };
        return calculateBoardCoverage(input);
    }, [isValid, parsedArea, selectedPresetId, wastage, customLengthStr, customWidthStr]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl mx-auto">
            {/* Left card: Inputs */}
            <div className="card">
                <h2 className="text-xl font-bold text-text-main mb-4">Input measurements</h2>

                <div className="space-y-6">
                    <NumberInput
                        id="area-input"
                        label="Total area to cover"
                        value={areaStr}
                        onChange={setAreaStr}
                        unit="m²"
                        placeholder="e.g. 15"
                        min={0}
                    />

                    <div className="p-4 bg-muted/10 rounded-xl border border-border-default space-y-4">
                        <label className="form-label mb-0">Board size</label>
                        <p className="field-description mb-3 mt-0">Select a standard UK board size or enter custom dimensions.</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                            {BOARD_PRESETS.map((preset) => (
                                <button
                                    key={preset.id}
                                    type="button"
                                    onClick={() => setSelectedPresetId(preset.id)}
                                    className={`text-left px-4 py-3 rounded-lg border transition-colors focus:focus-ring flex flex-col ${selectedPresetId === preset.id
                                        ? 'bg-primary/5 border-primary shadow-sm'
                                        : 'bg-bg-section border-border-default hover:border-primary/50'
                                        }`}
                                >
                                    <span className={`font-bold text-sm ${selectedPresetId === preset.id ? 'text-primary-dark' : 'text-text-main'}`}>
                                        {preset.label}
                                    </span>
                                    <span className="text-xs text-text-muted mt-0.5">{preset.description}</span>
                                </button>
                            ))}

                            <button
                                type="button"
                                onClick={() => setSelectedPresetId(null)}
                                className={`text-left px-4 py-3 rounded-lg border transition-colors focus:focus-ring flex flex-col ${selectedPresetId === null
                                    ? 'bg-primary/5 border-primary shadow-sm'
                                    : 'bg-bg-section border-border-default hover:border-primary/50'
                                    }`}
                            >
                                <span className={`font-bold text-sm ${selectedPresetId === null ? 'text-primary-dark' : 'text-text-main'}`}>
                                    Custom size
                                </span>
                                <span className="text-xs text-text-muted mt-0.5">Enter your own length and width</span>
                            </button>
                        </div>

                        {selectedPresetId === null && (
                            <div className="pt-3 border-t border-border-default/50">
                                <div className="grid grid-cols-2 gap-4">
                                    <NumberInput
                                        id="custom-length"
                                        label="Length"
                                        value={customLengthStr}
                                        onChange={setCustomLengthStr}
                                        unit="m"
                                        placeholder="e.g. 2.4"
                                        min={0}
                                    />
                                    <NumberInput
                                        id="custom-width"
                                        label="Width"
                                        value={customWidthStr}
                                        onChange={setCustomWidthStr}
                                        unit="m"
                                        placeholder="e.g. 1.2"
                                        min={0}
                                    />
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
                {result ? (
                    <div className="w-full text-left">
                        <h2 className="text-xl font-bold text-text-main mb-6">You will need to buy:</h2>
                        <div className="text-4xl md:text-5xl font-extrabold text-primary-dark mb-4">
                            {result.boardsNeeded} {result.boardsNeeded === 1 ? 'board' : 'boards'}
                        </div>
                        <ResultCard title="Materials" materials={result.materials} />
                        <div className="space-y-1 mt-4 border-t border-border-default pt-4 border-opacity-50">
                            {wastage > 0 && (
                                <p className="text-sm font-medium text-text-main">
                                    Includes {wastage}% wastage allowance.
                                </p>
                            )}
                            <p className="text-sm text-text-muted">
                                {result.boardsNeeded} {result.boardsNeeded === 1 ? 'board' : 'boards'} will cover up to <span className="font-semibold">{(result.boardsNeeded * result.coveragePerBoardM2).toFixed(2).replace(/\.00$/, '')} m²</span>.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="w-full text-left space-y-2">
                        <h2 className="text-xl font-bold text-text-main mb-2">Result</h2>
                        <p className="text-text-muted">
                            Enter your project area and select a board size to calculate how many you need.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
