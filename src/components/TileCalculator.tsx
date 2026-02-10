import React, { useState, useCallback } from 'react';
import CalculatorLayout, {
    FormInput,
    type ResultItem,
    type FieldGroup,
} from './CalculatorLayout';

/** Pure calculation logic — no React */
function calculateTiles(
    roomWidth: number,
    roomHeight: number,
    tileWidth: number,
    tileHeight: number,
    wastagePercent: number,
): { tilesNeeded: number; coverageArea: number; wastageAmount: number } | null {
    if (roomWidth <= 0 || roomHeight <= 0 || tileWidth <= 0 || tileHeight <= 0) {
        return null;
    }

    const coverageArea = roomWidth * roomHeight;
    const tileSizeM2 = (tileWidth / 1000) * (tileHeight / 1000);
    const rawTiles = coverageArea / tileSizeM2;
    const wastageMultiplier = 1 + wastagePercent / 100;
    const tilesNeeded = Math.ceil(rawTiles * wastageMultiplier);
    const wastageAmount = Math.ceil(rawTiles * (wastagePercent / 100));

    return { tilesNeeded, coverageArea, wastageAmount };
}

export default function TileCalculator() {
    const [roomWidth, setRoomWidth] = useState('');
    const [roomHeight, setRoomHeight] = useState('');
    const [tileWidth, setTileWidth] = useState('300');
    const [tileHeight, setTileHeight] = useState('300');
    const [wastage, setWastage] = useState('10');
    const [results, setResults] = useState<ResultItem[]>([]);
    const [hasResults, setHasResults] = useState(false);

    const handleCalculate = useCallback(() => {
        const result = calculateTiles(
            parseFloat(roomWidth),
            parseFloat(roomHeight),
            parseFloat(tileWidth),
            parseFloat(tileHeight),
            parseFloat(wastage),
        );

        if (!result) return;

        setResults([
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
        ]);
        setHasResults(true);
    }, [roomWidth, roomHeight, tileWidth, tileHeight, wastage]);

    const handleReset = useCallback(() => {
        setRoomWidth('');
        setRoomHeight('');
        setTileWidth('300');
        setTileHeight('300');
        setWastage('10');
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
            ),
        },
        {
            legend: 'Options',
            children: (
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
