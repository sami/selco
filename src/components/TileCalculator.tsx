import React, { useState, useCallback } from 'react';
import CalculatorLayout, { type FieldGroup } from './CalculatorLayout';
import { NumberInput } from './ui/NumberInput';
import { FormField } from './ui/FormField';
import { ResultCard } from './ui/ResultCard';
import { calculateTiles, COMMON_TILE_SIZES } from '../calculators/tiles';
import type { TileResult } from '../calculators/types';

const CUSTOM_VALUE = 'custom';

const tileSizeOptions = [
    ...COMMON_TILE_SIZES.map((s) => ({
        value: `${s.width}x${s.height}`,
        label: s.label,
    })),
    { value: CUSTOM_VALUE, label: 'Custom size…' },
];

export default function TileCalculator() {
    const [roomWidth, setRoomWidth] = useState('');
    const [roomHeight, setRoomHeight] = useState('');
    const [selectedSize, setSelectedSize] = useState('300x300');
    const [tileWidth, setTileWidth] = useState('300');
    const [tileHeight, setTileHeight] = useState('300');
    const [wastage, setWastage] = useState('10');
    const [packSize, setPackSize] = useState('');
    const [result, setResult] = useState<TileResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const isCustom = selectedSize === CUSTOM_VALUE;

    function handleSizeChange(value: string) {
        setSelectedSize(value);
        if (value !== CUSTOM_VALUE) {
            const [w, h] = value.split('x');
            setTileWidth(w);
            setTileHeight(h);
        }
        setError(null);
    }

    const validateInputs = () => {
        const w = parseFloat(roomWidth);
        const h = parseFloat(roomHeight);
        const tw = parseFloat(tileWidth);
        const th = parseFloat(tileHeight);
        const wa = parseFloat(wastage);

        if (isNaN(w) || w <= 0) return 'Room width must be a valid number greater than 0.';
        if (isNaN(h) || h <= 0) return 'Room height must be a valid number greater than 0.';
        if (isNaN(tw) || tw <= 0) return 'Tile width must be a valid number greater than 0.';
        if (isNaN(th) || th <= 0) return 'Tile height must be a valid number greater than 0.';
        if (isNaN(wa) || wa < 0 || wa > 100) return 'Wastage must be between 0 and 100%.';

        return null;
    };

    const handleCalculate = useCallback(() => {
        setError(null);
        const validationError = validateInputs();
        if (validationError) {
            setError(validationError);
            setResult(null);
            return;
        }

        try {
            const ps = parseFloat(packSize);
            const calcResult = calculateTiles({
                roomLengthM: parseFloat(roomWidth),
                roomWidthM: parseFloat(roomHeight),
                tileLengthMm: parseFloat(tileWidth),
                tileWidthMm: parseFloat(tileHeight),
                gapWidthMm: 0,
                layingPattern: 'straight',
                packSize: ps > 0 ? ps : 1,
            });

            setResult(calcResult);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unexpected error occurred.');
            setResult(null);
        }
    }, [roomWidth, roomHeight, tileWidth, tileHeight, wastage, packSize]);

    const handleReset = useCallback(() => {
        setRoomWidth('');
        setRoomHeight('');
        setSelectedSize('300x300');
        setTileWidth('300');
        setTileHeight('300');
        setWastage('10');
        setPackSize('');
        setResult(null);
        setError(null);
    }, []);

    const fieldGroups: FieldGroup[] = [
        {
            legend: 'Room dimensions',
            children: (
                <div className="grid grid-cols-2 gap-4">
                    <NumberInput
                        id="room-width"
                        label="Width"
                        unit="metres"
                        value={roomWidth}
                        onChange={(v) => { setRoomWidth(v); setError(null); }}
                        placeholder="e.g. 3.5"
                        min={0.01}
                        step={0.01}
                        required
                    />
                    <NumberInput
                        id="room-height"
                        label="Height / Length"
                        unit="metres"
                        value={roomHeight}
                        onChange={(v) => { setRoomHeight(v); setError(null); }}
                        placeholder="e.g. 2.4"
                        min={0.01}
                        step={0.01}
                        required
                    />
                </div>
            ),
        },
        {
            legend: 'Tile size',
            children: (
                <div className="space-y-4">
                    <FormField
                        id="tile-size-preset"
                        type="select"
                        label="Common tile sizes"
                        value={selectedSize}
                        onChange={(e) => handleSizeChange(e.target.value)}
                        options={tileSizeOptions}
                    />
                    {isCustom && (
                        <div className="grid grid-cols-2 gap-4">
                            <NumberInput
                                id="tile-width"
                                label="Tile width"
                                unit="mm"
                                value={tileWidth}
                                onChange={(v) => { setTileWidth(v); setError(null); }}
                                placeholder="e.g. 300"
                                min={1}
                                step={1}
                                required
                            />
                            <NumberInput
                                id="tile-height"
                                label="Tile height"
                                unit="mm"
                                value={tileHeight}
                                onChange={(v) => { setTileHeight(v); setError(null); }}
                                placeholder="e.g. 300"
                                min={1}
                                step={1}
                                required
                            />
                        </div>
                    )}
                </div>
            ),
        },
        {
            legend: 'Options',
            children: (
                <div className="space-y-4">
                    <NumberInput
                        id="wastage"
                        label="Wastage allowance"
                        unit="%"
                        value={wastage}
                        onChange={(v) => { setWastage(v); setError(null); }}
                        placeholder="e.g. 10"
                        min={0}
                        max={50}
                        step={1}
                    />
                    <NumberInput
                        id="pack-size"
                        label="Pack size (optional)"
                        unit="tiles/pack"
                        value={packSize}
                        onChange={(v) => { setPackSize(v); setError(null); }}
                        placeholder="e.g. 10"
                        min={1}
                        step={1}
                    />
                </div>
            ),
        },
    ];

    return (
        <CalculatorLayout
            title="Tile Calculator"
            description="Work out how many tiles you need for your wall or floor."
            fieldGroups={fieldGroups}
            resultsSlot={result && <ResultCard title="Tiles" materials={result.materials} warnings={result.warnings} />}
            onCalculate={handleCalculate}
            onReset={handleReset}
            error={error}
        />
    );
}
