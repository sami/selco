import React, { useState, useCallback } from 'react';
import { WizardShell } from './ui/WizardShell';
import { NumberInput } from './ui/NumberInput';
import { FormField } from './ui/FormField';
import { ResultCard } from './ui/ResultCard';
import { calculateFlooringRoom } from '../calculators/flooring-room';
import type { FlooringRoomResult, FlooringType, LayingPattern } from '../calculators/types';

const STEPS = [
    { label: 'Room dimensions' },
    { label: 'Flooring type' },
    { label: 'Ancillaries' },
    { label: 'Results' },
];

const FLOORING_TYPE_OPTIONS = [
    { value: 'engineered', label: 'Engineered wood' },
    { value: 'laminate', label: 'Laminate' },
    { value: 'solid-wood', label: 'Solid wood' },
    { value: 'lvt', label: 'Luxury vinyl tile (LVT)' },
];

const PATTERN_OPTIONS = [
    { value: 'straight', label: 'Straight (5% waste)' },
    { value: 'brick-bond', label: 'Brick bond (10% waste)' },
    { value: 'diagonal', label: 'Diagonal (15% waste)' },
    { value: 'herringbone', label: 'Herringbone (15% waste)' },
];

const INSTALL_METHOD_OPTIONS = [
    { value: 'floating', label: 'Floating' },
    { value: 'glue-down', label: 'Glue-down' },
];

export default function FlooringProjectWizard() {
    // Navigation
    const [currentStep, setCurrentStep] = useState(0);
    const [error, setError] = useState<string | null>(null);

    // Room dimensions
    const [roomLength, setRoomLength] = useState('');
    const [roomWidth, setRoomWidth] = useState('');
    const [hasLShape, setHasLShape] = useState(false);
    const [secondLength, setSecondLength] = useState('');
    const [secondWidth, setSecondWidth] = useState('');

    // Flooring type
    const [flooringType, setFlooringType] = useState<FlooringType>('laminate');
    const [coveragePerPack, setCoveragePerPack] = useState('2.0');
    const [layingPattern, setLayingPattern] = useState<LayingPattern>('brick-bond');
    const [installMethod, setInstallMethod] = useState<'floating' | 'glue-down'>('floating');

    // Ancillaries
    const [includeUnderlay, setIncludeUnderlay] = useState(true);
    const [includeAdhesive, setIncludeAdhesive] = useState(false);
    const [includeDPM, setIncludeDPM] = useState(false);
    const [includeScotia, setIncludeScotia] = useState(true);
    const [includeThresholds, setIncludeThresholds] = useState(true);
    const [doorwayCount, setDoorwayCount] = useState('1');

    // Result
    const [result, setResult] = useState<FlooringRoomResult | null>(null);

    const handleCalculate = useCallback(() => {
        setError(null);

        const length = parseFloat(roomLength);
        const width = parseFloat(roomWidth);
        const coverage = parseFloat(coveragePerPack);

        if (!length || length <= 0 || !width || width <= 0) {
            setError('Room length and width must be greater than 0.');
            return false;
        }
        if (!coverage || coverage <= 0) {
            setError('Coverage per pack must be greater than 0.');
            return false;
        }

        const room: { lengthM: number; widthM: number; secondLengthM?: number; secondWidthM?: number } = {
            lengthM: length,
            widthM: width,
        };

        if (hasLShape) {
            const sLen = parseFloat(secondLength);
            const sWid = parseFloat(secondWidth);
            if (sLen > 0 && sWid > 0) {
                room.secondLengthM = sLen;
                room.secondWidthM = sWid;
            }
        }

        const isSolidWood = flooringType === 'solid-wood';
        const isSolidWoodGlueDown = isSolidWood && installMethod === 'glue-down';

        try {
            const calcResult = calculateFlooringRoom({
                room,
                flooringType,
                coveragePerPackM2: coverage,
                layingPattern,
                doorwayCount: parseInt(doorwayCount, 10) || 1,
                ...(isSolidWood ? { installMethod } : {}),
                includeUnderlay,
                includeAdhesive: isSolidWoodGlueDown ? includeAdhesive : false,
                includeDPM,
                includeScotia,
                includeThresholds,
            });

            setResult(calcResult);
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Calculation failed.');
            return false;
        }
    }, [
        roomLength, roomWidth, hasLShape, secondLength, secondWidth,
        flooringType, coveragePerPack, layingPattern, installMethod,
        includeUnderlay, includeAdhesive, includeDPM, includeScotia,
        includeThresholds, doorwayCount,
    ]);

    const goNext = useCallback(() => {
        if (currentStep === 2) {
            // Moving from ancillaries to results — calculate first
            const ok = handleCalculate();
            if (!ok) return;
        }
        setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
    }, [currentStep, handleCalculate]);

    const goBack = useCallback(() => {
        setCurrentStep((s) => Math.max(s - 1, 0));
    }, []);

    const onStartOver = useCallback(() => {
        setCurrentStep(0);
        setResult(null);
        setError(null);
    }, []);

    const isSolidWood = flooringType === 'solid-wood';
    const isSolidWoodGlueDown = isSolidWood && installMethod === 'glue-down';

    return (
        <WizardShell
            steps={STEPS}
            currentStep={currentStep}
            onNext={goNext}
            onBack={goBack}
            onStartOver={currentStep === STEPS.length - 1 ? onStartOver : undefined}
        >
            {error && (
                <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded">
                    {error}
                </div>
            )}

            {/* Step 1: Room dimensions */}
            {currentStep === 0 && (
                <div className="space-y-4">
                    <NumberInput
                        id="room-length"
                        label="Room length"
                        value={roomLength}
                        onChange={setRoomLength}
                        unit="m"
                        min={0}
                        step={0.1}
                        placeholder="e.g. 5.0"
                        required
                    />
                    <NumberInput
                        id="room-width"
                        label="Room width"
                        value={roomWidth}
                        onChange={setRoomWidth}
                        unit="m"
                        min={0}
                        step={0.1}
                        placeholder="e.g. 4.0"
                        required
                    />
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={hasLShape}
                            onChange={(e) => setHasLShape(e.target.checked)}
                        />
                        L-shaped room
                    </label>
                    {hasLShape && (
                        <>
                            <NumberInput
                                id="second-length"
                                label="Extension length"
                                value={secondLength}
                                onChange={setSecondLength}
                                unit="m"
                                min={0}
                                step={0.1}
                                placeholder="e.g. 2.0"
                            />
                            <NumberInput
                                id="second-width"
                                label="Extension width"
                                value={secondWidth}
                                onChange={setSecondWidth}
                                unit="m"
                                min={0}
                                step={0.1}
                                placeholder="e.g. 1.5"
                            />
                        </>
                    )}
                </div>
            )}

            {/* Step 2: Flooring type */}
            {currentStep === 1 && (
                <div className="space-y-4">
                    <FormField
                        id="flooring-type"
                        label="Flooring type"
                        type="select"
                        value={flooringType}
                        onChange={(e) => setFlooringType(e.target.value as FlooringType)}
                        options={FLOORING_TYPE_OPTIONS}
                    />
                    <NumberInput
                        id="coverage-per-pack"
                        label="Coverage per pack"
                        value={coveragePerPack}
                        onChange={setCoveragePerPack}
                        unit="m²"
                        min={0}
                        step={0.1}
                        required
                    />
                    <FormField
                        id="laying-pattern"
                        label="Laying pattern"
                        type="select"
                        value={layingPattern}
                        onChange={(e) => setLayingPattern(e.target.value as LayingPattern)}
                        options={PATTERN_OPTIONS}
                    />
                    {isSolidWood && (
                        <FormField
                            id="install-method"
                            label="Installation method"
                            type="select"
                            value={installMethod}
                            onChange={(e) => setInstallMethod(e.target.value as 'floating' | 'glue-down')}
                            options={INSTALL_METHOD_OPTIONS}
                        />
                    )}
                </div>
            )}

            {/* Step 3: Ancillaries */}
            {currentStep === 2 && (
                <div className="space-y-4">
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={includeUnderlay}
                            onChange={(e) => setIncludeUnderlay(e.target.checked)}
                        />
                        Include underlay
                    </label>
                    {isSolidWoodGlueDown && (
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={includeAdhesive}
                                onChange={(e) => setIncludeAdhesive(e.target.checked)}
                            />
                            Include adhesive
                        </label>
                    )}
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={includeDPM}
                            onChange={(e) => setIncludeDPM(e.target.checked)}
                        />
                        Include DPM (damp-proof membrane)
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={includeScotia}
                            onChange={(e) => setIncludeScotia(e.target.checked)}
                        />
                        Include scotia beading
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={includeThresholds}
                            onChange={(e) => setIncludeThresholds(e.target.checked)}
                        />
                        Include threshold strips
                    </label>
                    <NumberInput
                        id="doorway-count"
                        label="Number of doorways"
                        value={doorwayCount}
                        onChange={setDoorwayCount}
                        min={0}
                        step={1}
                    />
                </div>
            )}

            {/* Step 4: Results */}
            {currentStep === 3 && result && (
                <ResultCard
                    title="Flooring Materials"
                    materials={result.totalMaterials}
                    warnings={result.warnings}
                />
            )}
        </WizardShell>
    );
}
