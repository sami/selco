import React, { useState, useCallback, useMemo } from 'react';
import { FormInput, FormSelect } from './CalculatorLayout';
import { calculateTiles, COMMON_TILE_SIZES } from '../calculators/tiles';
import { calculateAdhesive, ADHESIVE_PRODUCTS } from '../calculators/adhesive';
import { calculateGrout, COMMON_JOINT_WIDTHS } from '../calculators/grout';
import { calculateSpacers, SPACER_SIZES } from '../calculators/spacers';
import { TILING_SUGGESTIONS } from '../projects/tiling-suggestions';
import type { TileResult, AdhesiveResult, GroutResult, SpacersResult } from '../calculators/types';

const stepLabels = ['Your area', 'Tiles', 'Adhesive', 'Grout', 'Spacers', 'Materials list'];

const spacerSizeOptions = SPACER_SIZES.map((s) => ({
    value: String(s.value),
    label: s.label,
}));

const layoutOptions = [
    { value: 'cross', label: 'Cross (straight grid) — 4 per tile' },
    { value: 't-junction', label: 'T-junction (brick bond / offset) — 3 per tile' },
];

export default function TilingWizard() {
    // Navigation
    const [currentStep, setCurrentStep] = useState(1);

    // Step 1 — Area
    const [roomLength, setRoomLength] = useState('');
    const [roomWidth, setRoomWidth] = useState('');

    // Step 2 — Tiles
    const [selectedTileSize, setSelectedTileSize] = useState('300x300');
    const [tileWidth, setTileWidth] = useState('300');
    const [tileHeight, setTileHeight] = useState('300');
    const [tileWastage, setTileWastage] = useState('10');
    const [packSize, setPackSize] = useState('');

    // Step 3 — Adhesive
    const [selectedProduct, setSelectedProduct] = useState(ADHESIVE_PRODUCTS[0].value);
    const [applicationType, setApplicationType] = useState<'dry' | 'wet'>('dry');
    const [substrate, setSubstrate] = useState('even');
    const [adhesiveWastage, setAdhesiveWastage] = useState('10');

    // Step 4 — Grout
    const [selectedJointWidth, setSelectedJointWidth] = useState('3');
    const [customJointWidth, setCustomJointWidth] = useState('');
    const [tileDepth, setTileDepth] = useState('8');
    const [groutWastage, setGroutWastage] = useState('10');

    // Step 5 — Spacers
    const [spacerSize, setSpacerSize] = useState('3');
    const [layout, setLayout] = useState('cross');
    const [spacerWastage, setSpacerWastage] = useState('10');

    // Results
    const [tileResult, setTileResult] = useState<TileResult | null>(null);
    const [adhesiveResult, setAdhesiveResult] = useState<AdhesiveResult | null>(null);
    const [groutResult, setGroutResult] = useState<GroutResult | null>(null);
    const [spacersResult, setSpacersResult] = useState<SpacersResult | null>(null);

    // Derived values
    const area = useMemo(() => {
        const l = parseFloat(roomLength);
        const w = parseFloat(roomWidth);
        return (l > 0 && w > 0) ? l * w : 0;
    }, [roomLength, roomWidth]);

    const product = useMemo(
        () => ADHESIVE_PRODUCTS.find(p => p.value === selectedProduct) ?? ADHESIVE_PRODUCTS[0],
        [selectedProduct],
    );

    const isCustomTileSize = selectedTileSize === 'custom';
    const isCustomJointWidth = selectedJointWidth === 'custom';
    const effectiveJointWidth = isCustomJointWidth ? customJointWidth : selectedJointWidth;

    // Handlers
    function handleTileSizeChange(value: string) {
        setSelectedTileSize(value);
        if (value !== 'custom') {
            const [w, h] = value.split('x');
            setTileWidth(w);
            setTileHeight(h);
        }
    }

    const handleNext = useCallback(() => {
        try {
            if (currentStep === 1) {
                if (area <= 0) return;
            } else if (currentStep === 2) {
                const ps = parseFloat(packSize);
                const result = calculateTiles({
                    areaWidth: parseFloat(roomLength),
                    areaHeight: parseFloat(roomWidth),
                    tileWidth: parseFloat(tileWidth),
                    tileHeight: parseFloat(tileHeight),
                    wastage: parseFloat(tileWastage),
                    ...(ps > 0 ? { packSize: ps } : {}),
                });
                setTileResult(result);
            } else if (currentStep === 3) {
                const coverageRate = applicationType === 'dry' ? product.dryWallRate : product.wetAreaRate;
                const result = calculateAdhesive({
                    area,
                    coverageRate,
                    bagSize: product.bagSize,
                    substrate: substrate as 'even' | 'uneven',
                    wastage: parseFloat(adhesiveWastage),
                });
                setAdhesiveResult(result);
            } else if (currentStep === 4) {
                const result = calculateGrout({
                    area,
                    tileWidth: parseFloat(tileWidth),
                    tileHeight: parseFloat(tileHeight),
                    jointWidth: parseFloat(effectiveJointWidth),
                    tileDepth: parseFloat(tileDepth),
                    wastage: parseFloat(groutWastage),
                });
                setGroutResult(result);
            } else if (currentStep === 5) {
                const result = calculateSpacers({
                    areaM2: area,
                    tileWidthMm: parseFloat(tileWidth),
                    tileHeightMm: parseFloat(tileHeight),
                    layout: layout as 'cross' | 't-junction',
                    wastage: parseFloat(spacerWastage),
                });
                setSpacersResult(result);
            }
            setCurrentStep((s) => Math.min(s + 1, 6));
        } catch {
            // Invalid input — stay on current step
        }
    }, [
        currentStep, area, roomLength, roomWidth, tileWidth, tileHeight, tileWastage, packSize,
        product, applicationType, substrate, adhesiveWastage,
        effectiveJointWidth, tileDepth, groutWastage,
        layout, spacerWastage
    ]);

    function handleBack() {
        setCurrentStep((s) => Math.max(s - 1, 1));
    }

    const handleReset = useCallback(() => {
        setCurrentStep(1);
        setRoomLength('');
        setRoomWidth('');
        setTileResult(null);
        setAdhesiveResult(null);
        setGroutResult(null);
        setSpacersResult(null);
    }, []);

    return (
        <div className="space-y-8">
            {/* Step indicator */}
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5, 6].map(step => (
                        <div key={step} className={`flex-1 h-2 rounded-full transition-colors ${step <= currentStep ? 'bg-brand-blue' : 'bg-muted/40'
                            }`} />
                    ))}
                </div>
                <p className="text-sm text-muted-foreground font-medium">
                    Step {currentStep} of 6 — {stepLabels[currentStep - 1]}
                </p>
            </div>

            {/* Step 1 — Area */}
            {currentStep === 1 && (
                <div className="space-y-8">
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-surface-foreground">Measuring Your Tiling Area</h2>
                        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                            <p>Measure the length and width of your room in metres. Multiply them to get the total area in square metres (m²).</p>
                            <p>For L-shaped rooms, split the space into two rectangles, measure each one separately, and add the areas together. The same applies to rooms with alcoves or bay windows — break them down into simple shapes.</p>
                            <p><strong>Common mistake:</strong> Measuring in feet and entering the numbers as metres. If your tape measure reads in feet and inches, use our unit converter to convert before entering values here.</p>
                            <p><strong>Tip:</strong> Always measure the full area to the walls, not just the visible floor. Tiles need to run under bath panels, behind toilets, and into door thresholds. BS 5385-3:2015 recommends measuring the total area to be tiled including margins.</p>
                        </div>
                    </section>

                    <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <FormInput
                                id="room-length"
                                label="Room length"
                                unit="m"
                                value={roomLength}
                                onChange={setRoomLength}
                                placeholder="e.g. 4.5"
                                min={0.1}
                                step={0.01}
                                required
                            />
                            <FormInput
                                id="room-width"
                                label="Room width"
                                unit="m"
                                value={roomWidth}
                                onChange={setRoomWidth}
                                placeholder="e.g. 3.2"
                                min={0.1}
                                step={0.01}
                                required
                            />
                        </div>

                        {area > 0 && (
                            <div className="bg-muted/30 rounded-lg p-4 flex items-center justify-between border border-border/50">
                                <span className="text-sm font-medium text-muted-foreground">Total Measured Area</span>
                                <span className="text-xl font-bold text-surface-foreground">{area.toFixed(2)} m²</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Step 2 — Tiles */}
            {currentStep === 2 && (
                <div className="space-y-8">
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-surface-foreground">Choosing the Right Tiles</h2>
                        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                            <h3 className="text-surface-foreground font-semibold">Floor vs wall tiles</h3>
                            <p>Floor tiles must be rated for floor use — they are thicker, denser, and slip-rated. Wall tiles are thinner and lighter. Using wall tiles on floors risks cracking under foot traffic.</p>
                            <h3 className="text-surface-foreground font-semibold mt-4">Wastage explained</h3>
                            <p>Industry standard is 10% for straight lay and 15% for diagonal or herringbone patterns (BS 5385-1:2009). Wastage accounts for cuts at edges, breakages, and future replacements. Never buy exact quantities.</p>
                        </div>
                    </section>

                    <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-6">
                        <div className="bg-muted/30 rounded-lg p-3 px-4 border border-border/50 mb-4">
                            <span className="text-sm text-muted-foreground">Area from Step 1: <strong>{area.toFixed(2)} m²</strong></span>
                        </div>

                        <div className="space-y-4">
                            <FormSelect
                                id="tile-size"
                                label="Tile size"
                                value={selectedTileSize}
                                onChange={handleTileSizeChange}
                                options={[
                                    ...COMMON_TILE_SIZES.map(s => ({ value: `${s.width}x${s.height}`, label: s.label })),
                                    { value: 'custom', label: 'Custom size...' }
                                ]}
                            />
                            {isCustomTileSize && (
                                <div className="grid grid-cols-2 gap-4">
                                    <FormInput id="tile-width" label="Width" unit="mm" value={tileWidth} onChange={setTileWidth} required />
                                    <FormInput id="tile-height" label="Height" unit="mm" value={tileHeight} onChange={setTileHeight} required />
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormInput
                                id="tile-wastage"
                                label="Wastage"
                                unit="%"
                                value={tileWastage}
                                onChange={setTileWastage}
                                placeholder="10"
                            />
                            <FormInput
                                id="pack-size"
                                label="Pack size (optional)"
                                unit="tiles"
                                value={packSize}
                                onChange={setPackSize}
                                placeholder="e.g. 8"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Step 3 — Adhesive */}
            {currentStep === 3 && (
                <div className="space-y-8">
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-surface-foreground">How Much Tile Adhesive Do You Need?</h2>
                        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                            <p>Bonds the tile to the substrate. The right adhesive depends on tile type, substrate, and location (floor, wall, wet area, exterior). <strong>Ready-mixed</strong> is convenient for small wall jobs. <strong>Flexible powder</strong> is required for floors and underfloor heating.</p>
                            <h3 className="text-surface-foreground font-semibold mt-4">Coverage rates</h3>
                            <p>Coverage varies by tile size because larger tiles need a larger trowel notch to achieve even bed thickness. Small tiles (6mm notch) use approx 5 kg/m². Large tiles (10-12mm notch) use 7-8 kg/m². BS 5385-3:2015 recommends minimum 3 mm bed thickness for floors.</p>
                        </div>
                    </section>

                    <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-6">
                        <div className="bg-muted/30 rounded-lg p-3 px-4 border border-border/50 mb-4 flex justify-between items-center flex-wrap gap-2">
                            <span className="text-sm text-muted-foreground">Area: <strong>{area.toFixed(2)} m²</strong></span>
                            <span className="text-xs font-medium text-brand-blue bg-brand-blue/5 px-2 py-1 rounded">
                                Rate: {(applicationType === 'dry' ? product.dryWallRate : product.wetAreaRate)} kg/m² ({product.bagSize} kg bag)
                            </span>
                        </div>

                        <FormSelect
                            id="adhesive-product"
                            label="Product"
                            value={selectedProduct}
                            onChange={setSelectedProduct}
                            options={ADHESIVE_PRODUCTS.map(p => ({ value: p.value, label: p.label }))}
                        />

                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-surface-foreground" id="wizard-app-type-label">Application type</label>
                            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-labelledby="wizard-app-type-label">
                                <button
                                    type="button"
                                    role="radio"
                                    aria-checked={applicationType === 'dry'}
                                    onClick={() => setApplicationType('dry')}
                                    className={`h-11 rounded-[--radius-input] text-sm font-medium border transition-all focus-ring ${applicationType === 'dry'
                                        ? 'bg-brand-blue/5 border-brand-blue text-brand-blue'
                                        : 'bg-surface border-border text-muted-foreground hover:bg-muted/30'
                                        }`}
                                >
                                    Dry Wall
                                </button>
                                <button
                                    type="button"
                                    role="radio"
                                    aria-checked={applicationType === 'wet'}
                                    onClick={() => setApplicationType('wet')}
                                    className={`h-11 rounded-[--radius-input] text-sm font-medium border transition-all focus-ring ${applicationType === 'wet'
                                        ? 'bg-brand-blue/5 border-brand-blue text-brand-blue'
                                        : 'bg-surface border-border text-muted-foreground hover:bg-muted/30'
                                        }`}
                                >
                                    Floor &amp; Wet Areas
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormSelect
                                id="substrate"
                                label="Substrate condition"
                                value={substrate}
                                onChange={setSubstrate}
                                options={[
                                    { value: 'even', label: 'Even (Standard)' },
                                    { value: 'uneven', label: 'Uneven (+20%)' },
                                ]}
                            />
                            <FormInput
                                id="adhesive-wastage"
                                label="Wastage"
                                unit="%"
                                value={adhesiveWastage}
                                onChange={setAdhesiveWastage}
                                placeholder="10"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Step 4 — Grout */}
            {currentStep === 4 && (
                <div className="space-y-8">
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-surface-foreground">How Much Grout Do You Need?</h2>
                        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                            <p>Fills the joints between tiles, preventing water ingress and giving a finished look. <strong>2 mm joints</strong> offer a minimal, modern look for rectified tiles. <strong>5 mm joints</strong> are standard for floors to accommodate slight size variations.</p>
                            <p><strong>Coverage formula:</strong> Based on tile dimensions, joint width, tile thickness, and grout specific gravity (SG 2.0, covering denser/flexible grouts).</p>
                        </div>
                    </section>

                    <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-6">
                        <div className="bg-muted/30 rounded-lg p-3 px-4 border border-border/50 mb-4 flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Area: <strong>{area.toFixed(2)} m²</strong></span>
                            <span className="text-sm text-muted-foreground">Tile: <strong>{tileWidth} × {tileHeight} mm</strong></span>
                        </div>

                        <div className="space-y-4">
                            <FormSelect
                                id="joint-width"
                                label="Joint width"
                                value={selectedJointWidth}
                                onChange={setSelectedJointWidth}
                                options={[
                                    ...COMMON_JOINT_WIDTHS.map(j => ({ value: String(j.value), label: j.label })),
                                    { value: 'custom', label: 'Custom width...' }
                                ]}
                            />
                            {isCustomJointWidth && (
                                <FormInput id="custom-joint" label="Custom joint width" unit="mm" value={customJointWidth} onChange={setCustomJointWidth} required />
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormInput
                                id="tile-depth"
                                label="Tile thickness"
                                unit="mm"
                                value={tileDepth}
                                onChange={setTileDepth}
                                placeholder="e.g. 8"
                                required
                            />
                            <FormInput
                                id="grout-wastage"
                                label="Wastage"
                                unit="%"
                                value={groutWastage}
                                onChange={setGroutWastage}
                                placeholder="10"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Step 5 — Spacers */}
            {currentStep === 5 && (
                <div className="space-y-8">
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-surface-foreground">How Many Tile Spacers Do You Need?</h2>
                        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                            <p>Maintain consistent joint widths between tiles. <strong>Grid layouts</strong> (cross pattern) use 4 spacers per tile. <strong>Brick bond</strong> (offset) layouts use 3 spacers per tile.</p>
                            <p><strong>Tip:</strong> Match your spacer size to your chosen joint width (e.g., 3 mm spacers for 3 mm joints). Buy more than calculated as they snap easily.</p>
                        </div>
                    </section>

                    <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-6">
                        <div className="bg-muted/30 rounded-lg p-3 px-4 border border-border/50 mb-4 flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Area: <strong>{area.toFixed(2)} m²</strong></span>
                            <span className="text-sm text-muted-foreground">Tile: <strong>{tileWidth} × {tileHeight} mm</strong></span>
                        </div>

                        <div className="space-y-4">
                            <FormSelect
                                id="spacer-size"
                                label="Spacer size"
                                value={spacerSize}
                                onChange={setSpacerSize}
                                options={spacerSizeOptions}
                            />
                            <FormSelect
                                id="layout"
                                label="Layout pattern"
                                value={layout}
                                onChange={setLayout}
                                options={layoutOptions}
                            />
                            <FormInput
                                id="spacer-wastage"
                                label="Wastage"
                                unit="%"
                                value={spacerWastage}
                                onChange={setSpacerWastage}
                                placeholder="10"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Step 6 — Results */}
            {currentStep === 6 && (
                <div className="space-y-12">
                    <section>
                        <h2 className="text-2xl font-bold text-surface-foreground mb-6">Your Complete Tiling Materials List</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            {/* Tiles Card */}
                            <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-brand-blue/5 flex items-center justify-center shrink-0 text-brand-blue">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-surface-foreground">Tiles</h3>
                                        <p className="text-2xl font-bold text-surface-foreground mt-1">{tileResult?.tilesNeeded} tiles</p>
                                        <p className="text-sm text-muted-foreground">
                                            {tileWidth}×{tileHeight} mm • Area: {tileResult?.coverageArea.toFixed(2)} m²
                                        </p>
                                        {tileResult?.packsNeeded && (
                                            <div className="mt-2 inline-flex items-center px-2.5 py-1 rounded-md bg-muted/40 text-xs font-medium text-muted-foreground">
                                                {tileResult.packsNeeded} packs of {packSize}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Adhesive Card */}
                            <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-brand-blue/5 flex items-center justify-center shrink-0 text-brand-blue">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2h4" /><path d="M12 14v-4" /><path d="M4 14a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-4l-4 4-4-4H4z" /></svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-surface-foreground">Adhesive</h3>
                                        <p className="text-2xl font-bold text-surface-foreground mt-1">{adhesiveResult?.kgNeeded.toFixed(1)} kg</p>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            {selectedProduct === 'dunlop-rx3000' ? 'Tub' : 'Bag'} size: {product.bagSize} kg
                                        </p>
                                        <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-brand-yellow/20 text-brand-blue border border-brand-yellow/30 text-xs font-bold">
                                            {adhesiveResult?.bagsNeeded} x {product.bagSize} kg {selectedProduct === 'dunlop-rx3000' ? 'tubs' : 'bags'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Grout Card */}
                            <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-brand-blue/5 flex items-center justify-center shrink-0 text-brand-blue">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-surface-foreground">Grout</h3>
                                        <p className="text-2xl font-bold text-surface-foreground mt-1">{groutResult?.kgNeeded.toFixed(1)} kg</p>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            Joint: {effectiveJointWidth} mm • Depth: {tileDepth} mm
                                        </p>
                                        <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-brand-yellow/20 text-brand-blue border border-brand-yellow/30 text-xs font-bold">
                                            {groutResult?.bags5kg} x 5 kg bags
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Spacers Card */}
                            <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-brand-blue/5 flex items-center justify-center shrink-0 text-brand-blue">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h7v7H3z" /><path d="M14 3h7v7h-7z" /><path d="M14 14h7v7h-7z" /><path d="M3 14h7v7H3z" /></svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-surface-foreground">Spacers</h3>
                                        <p className="text-2xl font-bold text-surface-foreground mt-1">{spacersResult?.spacersNeeded}</p>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            Size: {spacerSize} mm • {layout === 'cross' ? 'Cross' : 'T-junction'} layout
                                        </p>
                                        <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-brand-yellow/20 text-brand-blue border border-brand-yellow/30 text-xs font-bold">
                                            {spacersResult?.packs100} x packs of 100
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <h3 className="text-xl font-bold text-surface-foreground">You Might Also Need</h3>
                        <div className="rounded-xl border border-border overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/40 text-muted-foreground font-medium">
                                    <tr>
                                        <th scope="col" className="px-5 py-3">Item</th>
                                        <th scope="col" className="px-5 py-3">Why you might need it</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50 bg-white">
                                    {TILING_SUGGESTIONS.map((s, i) => (
                                        <tr key={i} className="hover:bg-muted/5 transition-colors">
                                            <td className="px-5 py-3 font-semibold text-surface-foreground">{s.item}</td>
                                            <td className="px-5 py-3 text-muted-foreground">{s.description}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <div className="pt-6 border-t border-border flex justify-center">
                        <button
                            type="button"
                            onClick={handleReset}
                            className="px-6 h-11 text-sm font-medium text-brand-blue hover:text-brand-blue/80 hover:bg-brand-blue/5 rounded-[--radius-button] transition-all focus-ring"
                        >
                            Start Over
                        </button>
                    </div>
                </div>
            )}

            {/* Navigation Buttons */}
            {currentStep < 6 && (
                <div className="flex items-center gap-4 pt-6 border-t border-border">
                    {currentStep > 1 && (
                        <button
                            type="button"
                            onClick={handleBack}
                            className="px-6 h-11 text-sm font-medium text-muted-foreground hover:text-surface-foreground border border-border rounded-[--radius-button] hover:bg-muted/30 transition-all focus-ring"
                        >
                            Back
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={handleNext}
                        className="px-8 h-11 text-sm font-bold bg-brand-yellow text-brand-blue rounded-[--radius-button] shadow-sm hover:brightness-105 active:scale-[0.98] transition-all focus-ring ml-auto"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
