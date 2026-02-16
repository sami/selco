import React, { useEffect, useMemo, useState } from 'react';
import { FormInput, FormSelect } from './CalculatorLayout';

type Unit = 'm' | 'ft';
type Application = 'floor' | 'wall';
type Pattern = 'grid' | 'brick_bond' | 'diagonal' | 'herringbone';

type StepId =
  | 'setup'
  | 'tiles'
  | 'adhesive'
  | 'grout'
  | 'spacers'
  | 'primer'
  | 'backer'
  | 'tanking'
  | 'slc'
  | 'summary';

const TILE_PRESETS = [
  { value: '75x245', label: 'Brick metro — 75 × 245', width: 75, height: 245 },
  { value: '100x200', label: 'Metro — 100 × 200', width: 100, height: 200 },
  { value: '150x150', label: 'Small square — 150 × 150', width: 150, height: 150 },
  { value: '200x250', label: 'Small rectangular — 200 × 250', width: 200, height: 250 },
  { value: '250x400', label: 'Medium rectangular — 250 × 400', width: 250, height: 400 },
  { value: '250x500', label: 'Large rectangular — 250 × 500', width: 250, height: 500 },
  { value: '300x600', label: 'Standard rectangular — 300 × 600', width: 300, height: 600 },
  { value: '600x600', label: 'Large square — 600 × 600', width: 600, height: 600 },
  { value: '600x1200', label: 'Extra-large rectangular — 600 × 1200', width: 600, height: 1200 },
  { value: 'custom', label: 'Custom size', width: 0, height: 0 },
];

const PATTERNS: { value: Pattern; label: string; wastage: number }[] = [
  { value: 'grid', label: 'Grid', wastage: 10 },
  { value: 'brick_bond', label: 'Brick bond', wastage: 12 },
  { value: 'diagonal', label: 'Diagonal', wastage: 15 },
  { value: 'herringbone', label: 'Herringbone', wastage: 15 },
];

const SPACERS_PER_TILE: Record<Pattern, number> = {
  grid: 4,
  diagonal: 4,
  brick_bond: 3,
  herringbone: 2,
};

const FT_TO_M = 0.3048;
const ADHESIVE_BASE_COVERAGE = 2.0;

const formatNumber = (value: number, decimals = 2) => {
  if (!Number.isFinite(value) || value <= 0) return '—';
  return value.toFixed(decimals);
};

const formatWhole = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) return '—';
  return Math.ceil(value).toLocaleString('en-GB');
};

const toNumber = (value: string) => {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export default function TilingProjectWizard() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const [areaUnit, setAreaUnit] = useState<Unit>('m');
  const [areaWidth, setAreaWidth] = useState('');
  const [areaHeight, setAreaHeight] = useState('');
  const [application, setApplication] = useState<Application>('floor');

  const [tilePreset, setTilePreset] = useState('300x600');
  const [tileWidth, setTileWidth] = useState('300');
  const [tileHeight, setTileHeight] = useState('600');
  const [gapWidth, setGapWidth] = useState('3');
  const [pattern, setPattern] = useState<Pattern>('grid');
  const [tileWastage, setTileWastage] = useState('10');

  const [bedDepth, setBedDepth] = useState('3');
  const [adhesiveBagSize, setAdhesiveBagSize] = useState('20');
  const [adhesiveWastage, setAdhesiveWastage] = useState('10');

  const [tileDepth, setTileDepth] = useState('8');
  const [groutBagSize, setGroutBagSize] = useState('5');
  const [groutWastage, setGroutWastage] = useState('10');

  const [spacersPerPack, setSpacersPerPack] = useState('250');

  const [primerCoverage, setPrimerCoverage] = useState('5');
  const [primerBottleSize, setPrimerBottleSize] = useState('5');
  const [primerCoats, setPrimerCoats] = useState('1');

  const [boardWidth, setBoardWidth] = useState('1200');
  const [boardHeight, setBoardHeight] = useState('800');
  const [boardWastage, setBoardWastage] = useState('10');

  const [tankingCoverage, setTankingCoverage] = useState('0.7');
  const [tankingCoats, setTankingCoats] = useState('2');
  const [tankingTubSize, setTankingTubSize] = useState('5');

  const [slcCoverage, setSlcCoverage] = useState('1.7');
  const [slcDepth, setSlcDepth] = useState('3');
  const [slcBagSize, setSlcBagSize] = useState('20');
  const [slcWastage, setSlcWastage] = useState('10');

  const [skipPrimer, setSkipPrimer] = useState(false);
  const [skipBacker, setSkipBacker] = useState(false);
  const [skipTanking, setSkipTanking] = useState(false);
  const [skipSlc, setSkipSlc] = useState(false);

  const steps = useMemo(() => {
    const base: { id: StepId; label: string; optional?: boolean }[] = [
      { id: 'setup', label: 'Area & tile setup' },
      { id: 'tiles', label: 'Tiles' },
      { id: 'adhesive', label: 'Adhesive' },
      { id: 'grout', label: 'Grout' },
      { id: 'spacers', label: 'Spacers' },
      { id: 'primer', label: 'Primer (optional)', optional: true },
      { id: 'backer', label: 'Backer board (optional)', optional: true },
      { id: 'tanking', label: 'Tanking (optional)', optional: true },
    ];

    if (application === 'floor') {
      base.push({ id: 'slc', label: 'Self-levelling compound (optional)', optional: true });
    }

    base.push({ id: 'summary', label: 'Summary' });
    return base;
  }, [application]);

  const currentStep = steps[currentIndex];

  useEffect(() => {
    if (currentIndex > steps.length - 1) {
      setCurrentIndex(steps.length - 1);
    }
  }, [currentIndex, steps.length]);

  useEffect(() => {
    const selected = PATTERNS.find((item) => item.value === pattern);
    if (selected) {
      setTileWastage(String(selected.wastage));
    }
  }, [pattern]);

  const handleUnitToggle = (nextUnit: Unit) => {
    if (nextUnit === areaUnit) return;

    const width = toNumber(areaWidth);
    const height = toNumber(areaHeight);

    if (width > 0) {
      const converted = areaUnit === 'm' ? width / FT_TO_M : width * FT_TO_M;
      setAreaWidth(converted.toFixed(2));
    }

    if (height > 0) {
      const converted = areaUnit === 'm' ? height / FT_TO_M : height * FT_TO_M;
      setAreaHeight(converted.toFixed(2));
    }

    setAreaUnit(nextUnit);
  };

  const handleTilePresetChange = (value: string) => {
    setTilePreset(value);
    const preset = TILE_PRESETS.find((item) => item.value === value);
    if (preset && preset.value !== 'custom') {
      setTileWidth(String(preset.width));
      setTileHeight(String(preset.height));
    }
  };

  const areaM2 = useMemo(() => {
    const width = toNumber(areaWidth);
    const height = toNumber(areaHeight);
    if (width <= 0 || height <= 0) return 0;
    if (areaUnit === 'ft') {
      return (width * FT_TO_M) * (height * FT_TO_M);
    }
    return width * height;
  }, [areaWidth, areaHeight, areaUnit]);

  const tileMetrics = useMemo(() => {
    const widthMm = toNumber(tileWidth);
    const heightMm = toNumber(tileHeight);
    const gapMm = toNumber(gapWidth);
    const wastage = toNumber(tileWastage);

    if (widthMm <= 0 || heightMm <= 0 || gapMm < 0) {
      return {
        tileAreaM2: 0,
        tilesNeeded: 0,
        tilesWithWastage: 0,
        coveragePerTile: 0,
      };
    }

    const effectiveWidthM = (widthMm + gapMm) / 1000;
    const effectiveHeightM = (heightMm + gapMm) / 1000;
    const tileAreaM2 = effectiveWidthM * effectiveHeightM;
    const tilesNeeded = tileAreaM2 > 0 ? Math.ceil(areaM2 / tileAreaM2) : 0;
    const tilesWithWastage = Math.ceil(tilesNeeded * (1 + wastage / 100));

    return {
      tileAreaM2,
      tilesNeeded,
      tilesWithWastage,
      coveragePerTile: tileAreaM2,
    };
  }, [areaM2, tileWidth, tileHeight, gapWidth, tileWastage]);

  const adhesiveMetrics = useMemo(() => {
    const depth = toNumber(bedDepth);
    const baseCoverage = ADHESIVE_BASE_COVERAGE;
    const wastage = toNumber(adhesiveWastage);
    const bag = toNumber(adhesiveBagSize);
    if (depth <= 0 || baseCoverage <= 0 || areaM2 <= 0 || bag <= 0) {
      return { scaledCoverage: 0, kgNeeded: 0, kgWithWastage: 0, bagsNeeded: 0 };
    }

    const scaledCoverage = baseCoverage * (depth / 3);
    const kgNeeded = areaM2 * scaledCoverage;
    const kgWithWastage = kgNeeded * (1 + wastage / 100);
    const bagsNeeded = Math.ceil(kgWithWastage / bag);
    return { scaledCoverage, kgNeeded, kgWithWastage, bagsNeeded };
  }, [bedDepth, adhesiveWastage, adhesiveBagSize, areaM2]);

  const groutMetrics = useMemo(() => {
    const widthM = toNumber(tileWidth) / 1000;
    const heightM = toNumber(tileHeight) / 1000;
    const jointM = toNumber(gapWidth) / 1000;
    const depthM = toNumber(tileDepth) / 1000;
    const bag = toNumber(groutBagSize);
    const wastage = toNumber(groutWastage);

    if (widthM <= 0 || heightM <= 0 || jointM <= 0 || depthM <= 0 || areaM2 <= 0 || bag <= 0) {
      return { kgNeeded: 0, kgWithWastage: 0, bagsNeeded: 0, kgPerSqm: 0 };
    }

    const jointCrossSection = jointM * depthM;
    const tilePerimeterPerSqm = 2 * (1 / widthM + 1 / heightM);
    const groutVolumePerSqm = (jointCrossSection * tilePerimeterPerSqm) / 2;
    const kgPerSqm = groutVolumePerSqm * 1700;

    const kgNeeded = areaM2 * kgPerSqm;
    const kgWithWastage = kgNeeded * (1 + wastage / 100);
    const bagsNeeded = Math.ceil(kgWithWastage / bag);

    return { kgNeeded, kgWithWastage, bagsNeeded, kgPerSqm };
  }, [tileWidth, tileHeight, gapWidth, tileDepth, groutBagSize, groutWastage, areaM2]);

  const spacerMetrics = useMemo(() => {
    const perPack = toNumber(spacersPerPack);
    const spacersPerTile = SPACERS_PER_TILE[pattern];
    const totalSpacers = tileMetrics.tilesWithWastage * spacersPerTile;
    const packsNeeded = perPack > 0 ? Math.ceil(totalSpacers / perPack) : 0;
    return { totalSpacers, packsNeeded, spacersPerTile };
  }, [spacersPerPack, pattern, tileMetrics.tilesWithWastage]);

  const primerMetrics = useMemo(() => {
    const coverage = toNumber(primerCoverage);
    const bottle = toNumber(primerBottleSize);
    const coats = toNumber(primerCoats);
    if (coverage <= 0 || bottle <= 0 || coats <= 0 || areaM2 <= 0) {
      return { litres: 0, bottles: 0 };
    }
    const litres = (areaM2 / coverage) * coats;
    const bottles = Math.ceil(litres / bottle);
    return { litres, bottles };
  }, [primerCoverage, primerBottleSize, primerCoats, areaM2]);

  const backerMetrics = useMemo(() => {
    const widthM = toNumber(boardWidth) / 1000;
    const heightM = toNumber(boardHeight) / 1000;
    const wastage = toNumber(boardWastage);
    if (widthM <= 0 || heightM <= 0 || areaM2 <= 0) {
      return { boards: 0, boardArea: 0 };
    }
    const boardArea = widthM * heightM;
    const rawBoards = boardArea > 0 ? areaM2 / boardArea : 0;
    const boards = Math.ceil(rawBoards * (1 + wastage / 100));
    return { boards, boardArea };
  }, [boardWidth, boardHeight, boardWastage, areaM2]);

  const tankingMetrics = useMemo(() => {
    const coverage = toNumber(tankingCoverage);
    const coats = toNumber(tankingCoats);
    const tub = toNumber(tankingTubSize);
    if (coverage <= 0 || coats <= 0 || tub <= 0 || areaM2 <= 0) {
      return { kg: 0, tubs: 0 };
    }
    const kg = areaM2 * coverage * coats;
    const tubs = Math.ceil(kg / tub);
    return { kg, tubs };
  }, [tankingCoverage, tankingCoats, tankingTubSize, areaM2]);

  const slcMetrics = useMemo(() => {
    const coverage = toNumber(slcCoverage);
    const depth = toNumber(slcDepth);
    const bag = toNumber(slcBagSize);
    const wastage = toNumber(slcWastage);
    if (coverage <= 0 || depth <= 0 || bag <= 0 || areaM2 <= 0) {
      return { kg: 0, kgWithWastage: 0, bags: 0 };
    }
    const kg = areaM2 * depth * coverage;
    const kgWithWastage = kg * (1 + wastage / 100);
    const bags = Math.ceil(kgWithWastage / bag);
    return { kg, kgWithWastage, bags };
  }, [slcCoverage, slcDepth, slcBagSize, slcWastage, areaM2]);

  const goNext = () => setCurrentIndex((prev) => Math.min(prev + 1, steps.length - 1));
  const goBack = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));

  const handleSkip = (stepId: StepId) => {
    if (stepId === 'primer') setSkipPrimer(true);
    if (stepId === 'backer') setSkipBacker(true);
    if (stepId === 'tanking') setSkipTanking(true);
    if (stepId === 'slc') setSkipSlc(true);
    goNext();
  };

  const renderOptionalNotice = (label: string, onInclude: () => void) => (
    <div className="rounded-xl border border-dashed border-border bg-surface p-5">
      <p className="text-sm text-muted-foreground">
        {label} was skipped. You can include it if you need a quantity for this material.
      </p>
      <button
        type="button"
        onClick={onInclude}
        className="mt-4 inline-flex items-center justify-center rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white"
      >
        Include this step
      </button>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex-1 h-2 rounded-full transition-colors ${index <= currentIndex ? 'bg-brand-blue' : 'bg-muted/40'}`}
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground font-medium">
          Step {currentIndex + 1} of {steps.length} — {currentStep?.label}
        </p>
      </div>

      {currentStep?.id === 'setup' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-6">
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => handleUnitToggle('m')}
                className={`px-4 py-2 rounded-full text-sm font-semibold border ${areaUnit === 'm' ? 'bg-brand-blue text-white border-brand-blue' : 'bg-surface border-border text-surface-foreground'}`}
              >
                Metres
              </button>
              <button
                type="button"
                onClick={() => handleUnitToggle('ft')}
                className={`px-4 py-2 rounded-full text-sm font-semibold border ${areaUnit === 'ft' ? 'bg-brand-blue text-white border-brand-blue' : 'bg-surface border-border text-surface-foreground'}`}
              >
                Feet
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                id="area-width"
                label="Area width"
                unit={areaUnit}
                value={areaWidth}
                onChange={setAreaWidth}
                placeholder={areaUnit === 'm' ? 'e.g. 4.5' : 'e.g. 14.7'}
                min={0.1}
                step={0.01}
                required
              />
              <FormInput
                id="area-height"
                label="Area height / length"
                unit={areaUnit}
                value={areaHeight}
                onChange={setAreaHeight}
                placeholder={areaUnit === 'm' ? 'e.g. 3.2' : 'e.g. 10.5'}
                min={0.1}
                step={0.01}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormSelect
                id="application"
                label="Application"
                value={application}
                onChange={(value) => setApplication(value as Application)}
                options={[
                  { value: 'floor', label: 'Floor' },
                  { value: 'wall', label: 'Wall' },
                ]}
              />
              <FormSelect
                id="pattern"
                label="Laying pattern"
                value={pattern}
                onChange={(value) => setPattern(value as Pattern)}
                options={PATTERNS.map((p) => ({ value: p.value, label: `${p.label} (suggested wastage ${p.wastage}%)` }))}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormSelect
                id="tile-preset"
                label="Tile size preset"
                value={tilePreset}
                onChange={handleTilePresetChange}
                options={TILE_PRESETS.map((preset) => ({ value: preset.value, label: preset.label }))}
              />
              <FormInput
                id="gap-width"
                label="Grout joint width"
                unit="mm"
                value={gapWidth}
                onChange={setGapWidth}
                placeholder="3"
                min={1}
                step={0.5}
              />
            </div>

            {tilePreset === 'custom' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  id="tile-width"
                  label="Tile width"
                  unit="mm"
                  value={tileWidth}
                  onChange={setTileWidth}
                  placeholder="e.g. 300"
                  min={10}
                  step={1}
                />
                <FormInput
                  id="tile-height"
                  label="Tile height"
                  unit="mm"
                  value={tileHeight}
                  onChange={setTileHeight}
                  placeholder="e.g. 600"
                  min={10}
                  step={1}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {currentStep?.id === 'tiles' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-6">
            <FormInput
              id="tile-wastage"
              label="Wastage percentage"
              unit="%"
              value={tileWastage}
              onChange={setTileWastage}
              min={0}
              step={1}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border p-4">
                <p className="text-xs text-muted-foreground">Total area</p>
                <p className="text-lg font-semibold text-surface-foreground">{formatNumber(areaM2, 2)} m²</p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-xs text-muted-foreground">Coverage per tile</p>
                <p className="text-lg font-semibold text-surface-foreground">{formatNumber(tileMetrics.coveragePerTile, 4)} m²</p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-xs text-muted-foreground">Tiles needed</p>
                <p className="text-lg font-semibold text-surface-foreground">{formatWhole(tileMetrics.tilesNeeded)} tiles</p>
              </div>
              <div className="rounded-lg border border-brand-blue/20 bg-brand-blue/5 p-4">
                <p className="text-xs text-muted-foreground">Tiles incl. wastage</p>
                <p className="text-lg font-semibold text-brand-blue">{formatWhole(tileMetrics.tilesWithWastage)} tiles</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentStep?.id === 'adhesive' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                id="bed-depth"
                label="Bed depth"
                unit="mm"
                value={bedDepth}
                onChange={setBedDepth}
                min={1}
                step={0.5}
              />
              <div className="rounded-lg border border-border bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground">Coverage rate at 3mm bed</p>
                <p className="text-lg font-semibold text-surface-foreground">{ADHESIVE_BASE_COVERAGE} kg/m²</p>
                <p className="text-xs text-muted-foreground mt-1">Fixed default. Adjust bed depth to scale consumption.</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                id="adhesive-bag"
                label="Bag size"
                unit="kg"
                value={adhesiveBagSize}
                onChange={setAdhesiveBagSize}
                min={5}
                step={1}
              />
              <FormInput
                id="adhesive-wastage"
                label="Wastage"
                unit="%"
                value={adhesiveWastage}
                onChange={setAdhesiveWastage}
                min={0}
                step={1}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border p-4">
                <p className="text-xs text-muted-foreground">Scaled coverage rate</p>
                <p className="text-lg font-semibold text-surface-foreground">{formatNumber(adhesiveMetrics.scaledCoverage, 2)} kg/m²</p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-xs text-muted-foreground">Adhesive needed</p>
                <p className="text-lg font-semibold text-surface-foreground">{formatNumber(adhesiveMetrics.kgNeeded, 1)} kg</p>
              </div>
              <div className="rounded-lg border border-brand-blue/20 bg-brand-blue/5 p-4">
                <p className="text-xs text-muted-foreground">Adhesive incl. wastage</p>
                <p className="text-lg font-semibold text-brand-blue">{formatNumber(adhesiveMetrics.kgWithWastage, 1)} kg</p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-xs text-muted-foreground">Bags needed</p>
                <p className="text-lg font-semibold text-surface-foreground">{formatWhole(adhesiveMetrics.bagsNeeded)} bags</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentStep?.id === 'grout' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                id="tile-depth"
                label="Tile depth"
                unit="mm"
                value={tileDepth}
                onChange={setTileDepth}
                min={3}
                step={0.5}
              />
              <FormInput
                id="grout-bag"
                label="Bag size"
                unit="kg"
                value={groutBagSize}
                onChange={setGroutBagSize}
                min={2}
                step={1}
              />
            </div>
            <FormInput
              id="grout-wastage"
              label="Wastage"
              unit="%"
              value={groutWastage}
              onChange={setGroutWastage}
              min={0}
              step={1}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border p-4">
                <p className="text-xs text-muted-foreground">Grout per m²</p>
                <p className="text-lg font-semibold text-surface-foreground">{formatNumber(groutMetrics.kgPerSqm, 3)} kg</p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-xs text-muted-foreground">Grout needed</p>
                <p className="text-lg font-semibold text-surface-foreground">{formatNumber(groutMetrics.kgNeeded, 1)} kg</p>
              </div>
              <div className="rounded-lg border border-brand-blue/20 bg-brand-blue/5 p-4">
                <p className="text-xs text-muted-foreground">Grout incl. wastage</p>
                <p className="text-lg font-semibold text-brand-blue">{formatNumber(groutMetrics.kgWithWastage, 1)} kg</p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-xs text-muted-foreground">Bags needed</p>
                <p className="text-lg font-semibold text-surface-foreground">{formatWhole(groutMetrics.bagsNeeded)} bags</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentStep?.id === 'spacers' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-6">
            <FormInput
              id="spacers-pack"
              label="Spacers per pack"
              value={spacersPerPack}
              onChange={setSpacersPerPack}
              min={50}
              step={1}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border p-4">
                <p className="text-xs text-muted-foreground">Spacers per tile</p>
                <p className="text-lg font-semibold text-surface-foreground">{spacerMetrics.spacersPerTile}</p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-xs text-muted-foreground">Total spacers</p>
                <p className="text-lg font-semibold text-surface-foreground">{formatWhole(spacerMetrics.totalSpacers)} spacers</p>
              </div>
              <div className="rounded-lg border border-brand-blue/20 bg-brand-blue/5 p-4">
                <p className="text-xs text-muted-foreground">Packs needed</p>
                <p className="text-lg font-semibold text-brand-blue">{formatWhole(spacerMetrics.packsNeeded)} packs</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentStep?.id === 'primer' && (
        <div className="space-y-6">
          {skipPrimer
            ? renderOptionalNotice('Primer', () => setSkipPrimer(false))
            : (
              <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormInput
                    id="primer-coverage"
                    label="Coverage rate"
                    unit="m²/L"
                    value={primerCoverage}
                    onChange={setPrimerCoverage}
                    min={1}
                    step={0.1}
                  />
                  <FormInput
                    id="primer-bottle"
                    label="Bottle size"
                    unit="L"
                    value={primerBottleSize}
                    onChange={setPrimerBottleSize}
                    min={1}
                    step={0.5}
                  />
                </div>
                <FormInput
                  id="primer-coats"
                  label="Number of coats"
                  value={primerCoats}
                  onChange={setPrimerCoats}
                  min={1}
                  step={1}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-xs text-muted-foreground">Primer needed</p>
                    <p className="text-lg font-semibold text-surface-foreground">{formatNumber(primerMetrics.litres, 2)} L</p>
                  </div>
                  <div className="rounded-lg border border-brand-blue/20 bg-brand-blue/5 p-4">
                    <p className="text-xs text-muted-foreground">Bottles needed</p>
                    <p className="text-lg font-semibold text-brand-blue">{formatWhole(primerMetrics.bottles)} bottles</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSkip('primer')}
                  className="text-sm font-semibold text-muted-foreground underline"
                >
                  Skip this step
                </button>
              </div>
            )}
        </div>
      )}

      {currentStep?.id === 'backer' && (
        <div className="space-y-6">
          {skipBacker
            ? renderOptionalNotice('Backer board', () => setSkipBacker(false))
            : (
              <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormInput
                    id="board-width"
                    label="Board width"
                    unit="mm"
                    value={boardWidth}
                    onChange={setBoardWidth}
                    min={300}
                    step={1}
                  />
                  <FormInput
                    id="board-height"
                    label="Board height"
                    unit="mm"
                    value={boardHeight}
                    onChange={setBoardHeight}
                    min={300}
                    step={1}
                  />
                </div>
                <FormInput
                  id="board-wastage"
                  label="Wastage"
                  unit="%"
                  value={boardWastage}
                  onChange={setBoardWastage}
                  min={0}
                  step={1}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-xs text-muted-foreground">Board area</p>
                    <p className="text-lg font-semibold text-surface-foreground">{formatNumber(backerMetrics.boardArea, 2)} m²</p>
                  </div>
                  <div className="rounded-lg border border-brand-blue/20 bg-brand-blue/5 p-4">
                    <p className="text-xs text-muted-foreground">Boards needed</p>
                    <p className="text-lg font-semibold text-brand-blue">{formatWhole(backerMetrics.boards)} boards</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSkip('backer')}
                  className="text-sm font-semibold text-muted-foreground underline"
                >
                  Skip this step
                </button>
              </div>
            )}
        </div>
      )}

      {currentStep?.id === 'tanking' && (
        <div className="space-y-6">
          {skipBacker ? (
            <div className="rounded-xl border border-dashed border-border bg-surface p-5">
              <p className="text-sm text-muted-foreground">
                Tanking is usually applied over backer boards or waterproof substrates. Add backer boards in the previous step to calculate tanking.
              </p>
              <button
                type="button"
                onClick={goNext}
                className="mt-4 inline-flex items-center justify-center rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white"
              >
                Continue
              </button>
            </div>
          ) : skipTanking
            ? renderOptionalNotice('Tanking', () => setSkipTanking(false))
            : (
              <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormInput
                    id="tanking-coverage"
                    label="Coverage rate"
                    unit="kg/m² per coat"
                    value={tankingCoverage}
                    onChange={setTankingCoverage}
                    min={0.2}
                    step={0.1}
                  />
                  <FormInput
                    id="tanking-coats"
                    label="Number of coats"
                    value={tankingCoats}
                    onChange={setTankingCoats}
                    min={1}
                    step={1}
                  />
                </div>
                <FormInput
                  id="tanking-tub"
                  label="Tub size"
                  unit="kg"
                  value={tankingTubSize}
                  onChange={setTankingTubSize}
                  min={1}
                  step={0.5}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-xs text-muted-foreground">Tanking needed</p>
                    <p className="text-lg font-semibold text-surface-foreground">{formatNumber(tankingMetrics.kg, 2)} kg</p>
                  </div>
                  <div className="rounded-lg border border-brand-blue/20 bg-brand-blue/5 p-4">
                    <p className="text-xs text-muted-foreground">Tubs needed</p>
                    <p className="text-lg font-semibold text-brand-blue">{formatWhole(tankingMetrics.tubs)} tubs</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSkip('tanking')}
                  className="text-sm font-semibold text-muted-foreground underline"
                >
                  Skip this step
                </button>
              </div>
            )}
        </div>
      )}

      {currentStep?.id === 'slc' && (
        <div className="space-y-6">
          {skipSlc
            ? renderOptionalNotice('Self-levelling compound', () => setSkipSlc(false))
            : (
              <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormInput
                    id="slc-coverage"
                    label="Coverage rate"
                    unit="kg/m²/mm"
                    value={slcCoverage}
                    onChange={setSlcCoverage}
                    min={1}
                    step={0.1}
                  />
                  <FormInput
                    id="slc-depth"
                    label="Average depth"
                    unit="mm"
                    value={slcDepth}
                    onChange={setSlcDepth}
                    min={1}
                    step={0.5}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormInput
                    id="slc-bag"
                    label="Bag size"
                    unit="kg"
                    value={slcBagSize}
                    onChange={setSlcBagSize}
                    min={5}
                    step={1}
                  />
                  <FormInput
                    id="slc-wastage"
                    label="Wastage"
                    unit="%"
                    value={slcWastage}
                    onChange={setSlcWastage}
                    min={0}
                    step={1}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-xs text-muted-foreground">SLC needed</p>
                    <p className="text-lg font-semibold text-surface-foreground">{formatNumber(slcMetrics.kg, 1)} kg</p>
                  </div>
                  <div className="rounded-lg border border-brand-blue/20 bg-brand-blue/5 p-4">
                    <p className="text-xs text-muted-foreground">SLC incl. wastage</p>
                    <p className="text-lg font-semibold text-brand-blue">{formatNumber(slcMetrics.kgWithWastage, 1)} kg</p>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-xs text-muted-foreground">Bags needed</p>
                    <p className="text-lg font-semibold text-surface-foreground">{formatWhole(slcMetrics.bags)} bags</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSkip('slc')}
                  className="text-sm font-semibold text-muted-foreground underline"
                >
                  Skip this step
                </button>
              </div>
            )}
        </div>
      )}

      {currentStep?.id === 'summary' && (
        <div className="space-y-8">
          <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left">
                <tr>
                  <th className="px-5 py-3 font-semibold">Material</th>
                  <th className="px-5 py-3 font-semibold">Quantity</th>
                  <th className="px-5 py-3 font-semibold">Purchase qty</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-5 py-3 font-medium">Tiles</td>
                  <td className="px-5 py-3">{formatWhole(tileMetrics.tilesWithWastage)} tiles</td>
                  <td className="px-5 py-3">{formatWhole(tileMetrics.tilesWithWastage)} tiles</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-5 py-3 font-medium">Adhesive</td>
                  <td className="px-5 py-3">{formatNumber(adhesiveMetrics.kgWithWastage, 1)} kg</td>
                  <td className="px-5 py-3">{formatWhole(adhesiveMetrics.bagsNeeded)} × {adhesiveBagSize}kg bags</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-5 py-3 font-medium">Grout</td>
                  <td className="px-5 py-3">{formatNumber(groutMetrics.kgWithWastage, 1)} kg</td>
                  <td className="px-5 py-3">{formatWhole(groutMetrics.bagsNeeded)} × {groutBagSize}kg bags</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-5 py-3 font-medium">Spacers</td>
                  <td className="px-5 py-3">{formatWhole(spacerMetrics.totalSpacers)} spacers</td>
                  <td className="px-5 py-3">{formatWhole(spacerMetrics.packsNeeded)} packs</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-5 py-3 font-medium">Primer</td>
                  <td className="px-5 py-3">{skipPrimer ? '—' : `${formatNumber(primerMetrics.litres, 2)} L`}</td>
                  <td className="px-5 py-3">{skipPrimer ? '—' : `${formatWhole(primerMetrics.bottles)} × ${primerBottleSize}L bottles`}</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-5 py-3 font-medium">Backer board</td>
                  <td className="px-5 py-3">{skipBacker ? '—' : `${formatWhole(backerMetrics.boards)} boards`}</td>
                  <td className="px-5 py-3">{skipBacker ? '—' : `${formatWhole(backerMetrics.boards)} boards`}</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-5 py-3 font-medium">Tanking</td>
                  <td className="px-5 py-3">{skipBacker || skipTanking ? '—' : `${formatNumber(tankingMetrics.kg, 2)} kg`}</td>
                  <td className="px-5 py-3">{skipBacker || skipTanking ? '—' : `${formatWhole(tankingMetrics.tubs)} × ${tankingTubSize}kg tubs`}</td>
                </tr>
                {application === 'floor' && (
                  <tr className="border-t border-border">
                    <td className="px-5 py-3 font-medium">Self-levelling compound</td>
                    <td className="px-5 py-3">{skipSlc ? '—' : `${formatNumber(slcMetrics.kgWithWastage, 1)} kg`}</td>
                    <td className="px-5 py-3">{skipSlc ? '—' : `${formatWhole(slcMetrics.bags)} × ${slcBagSize}kg bags`}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-surface-foreground mb-4">Suggested accessories</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Tile trim / edge profiles (2.5m lengths)</li>
                <li>Silicone sealant (movement joints, corners, sanitary ware)</li>
                <li>Tanking tape (for wet areas)</li>
                <li>Backer board screws and washers</li>
                <li>Tile levelling system (clips and wedges)</li>
                <li>Decoupling membrane for floors with movement or UFH</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-surface-foreground mb-4">Suggested tools</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Notched trowel (6mm, 10mm, 12mm)</li>
                <li>Tile cutter (manual or wet)</li>
                <li>Grout float</li>
                <li>Mixing drill and paddle</li>
                <li>Spirit level (1200mm)</li>
                <li>Sponge, bucket, tape measure, tile nippers, knee pads</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={goBack}
          disabled={currentIndex === 0}
          className="px-4 py-2 text-sm font-semibold rounded-lg border border-border bg-surface disabled:opacity-50"
        >
          Back
        </button>

        <div className="flex flex-wrap gap-3">
          {currentStep?.id !== 'summary' && (
            <button
              type="button"
              onClick={goNext}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-brand-blue text-white"
            >
              Next
            </button>
          )}
          {currentStep?.id === 'summary' && (
            <button
              type="button"
              onClick={() => setCurrentIndex(0)}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-brand-blue text-white"
            >
              Start over
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
