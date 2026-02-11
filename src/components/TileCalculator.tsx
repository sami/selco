import React, { useState, useCallback } from 'react';
import CalculatorLayout, {
    FormInput,
    FormSelect,
    type ResultItem,
    type FieldGroup,
} from './CalculatorLayout';
import { calculateTiles, COMMON_TILE_SIZES } from '../calculators/tiles';

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
    const [results, setResults] = useState<ResultItem[]>([]);
    const [hasResults, setHasResults] = useState(false);

    const isCustom = selectedSize === CUSTOM_VALUE;

    function handleSizeChange(value: string) {
        setSelectedSize(value);
        if (value !== CUSTOM_VALUE) {
            const [w, h] = value.split('x');
            setTileWidth(w);
            setTileHeight(h);
        }
    }

    const handleCalculate = useCallback(() => {
        try {
            const ps = parseFloat(packSize);
            const result = calculateTiles({
                areaWidth: parseFloat(roomWidth),
                areaHeight: parseFloat(roomHeight),
                tileWidth: parseFloat(tileWidth),
                tileHeight: parseFloat(tileHeight),
                wastage: parseFloat(wastage),
                ...(ps > 0 ? { packSize: ps } : {}),
            });

            const items: ResultItem[] = [
                {
                    iconPath: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
                    label: 'Tiles needed',
                    value: `${result.tilesNeeded} tiles`,
                    primary: true,
                },
                {
                    iconPath: 'M3 3h18v18H3z',
                    label: 'Coverage area',
                    value: `${result.coverageArea.toFixed(2)} m²`,
                },
                {
                    iconPath: 'M12 2v20M2 12h20',
                    label: `Extra for wastage (${wastage}%)`,
                    value: `${result.wastageAmount} tiles`,
                },
            ];

            if (result.packsNeeded !== undefined) {
                items.push({
                    iconPath: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z',
                    label: `Packs needed (${packSize} per pack)`,
                    value: `${result.packsNeeded} packs`,
                    primary: true,
                });
            }

            setResults(items);
            setHasResults(true);
        } catch {
            // Invalid input — do nothing
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
        setResults([]);
        setHasResults(false);
    }, []);

    const fieldGroups: FieldGroup[] = [
        {
            legend: 'Room dimensions',
            children: (
                <div className="grid grid-cols-2 gap-4">
                    <FormInput
                        id="room-width"
                        label="Width"
                        unit="metres"
                        value={roomWidth}
                        onChange={setRoomWidth}
                        placeholder="e.g. 3.5"
                        min={0.01}
                        step="0.01"
                        required
                    />
                    <FormInput
                        id="room-height"
                        label="Height / Length"
                        unit="metres"
                        value={roomHeight}
                        onChange={setRoomHeight}
                        placeholder="e.g. 2.4"
                        min={0.01}
                        step="0.01"
                        required
                    />
                </div>
            ),
        },
        {
            legend: 'Tile size',
            children: (
                <div className="space-y-4">
                    <FormSelect
                        id="tile-size-preset"
                        label="Common tile sizes"
                        value={selectedSize}
                        onChange={handleSizeChange}
                        options={tileSizeOptions}
                    />
                    {isCustom && (
                        <div className="grid grid-cols-2 gap-4">
                            <FormInput
                                id="tile-width"
                                label="Tile width"
                                unit="mm"
                                value={tileWidth}
                                onChange={setTileWidth}
                                placeholder="e.g. 300"
                                min={1}
                                step={1}
                                required
                            />
                            <FormInput
                                id="tile-height"
                                label="Tile height"
                                unit="mm"
                                value={tileHeight}
                                onChange={setTileHeight}
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
                    <FormInput
                        id="wastage"
                        label="Wastage allowance"
                        unit="%"
                        value={wastage}
                        onChange={setWastage}
                        placeholder="e.g. 10"
                        min={0}
                        max={50}
                        step={1}
                    />
                    <FormInput
                        id="pack-size"
                        label="Pack size (optional)"
                        unit="tiles/pack"
                        value={packSize}
                        onChange={setPackSize}
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
            iconPath="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"
            fieldGroups={fieldGroups}
            results={results}
            hasResults={hasResults}
            onCalculate={handleCalculate}
            onReset={handleReset}
        />
    );
}
