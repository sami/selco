import React, { useEffect, useMemo, useState } from 'react';
import { NumberInput } from './ui/NumberInput';
import { FormField } from './ui/FormField';
import { WizardShell } from './ui/WizardShell';
import { CopyLinkButton } from './ui/CopyLinkButton';
import { calculateDeckingProject } from '../calculators/decking-project';
import { BOARD_PRESETS, FIXING_PRODUCTS, JOIST_PRODUCTS } from '../data/decking-products';
import { DECKING_STEPS, DECKING_WASTAGE, DEFAULT_SUPPORT_SPACING_MM, DEFAULT_GAP_MM, DEFAULT_JOIST_SPACING_MM } from '../projects/decking';
import { decodePermalink, encodePermalink } from '../projects/permalink';
import { DECKING_PERMALINK_SCHEMA } from '../projects/decking-permalink';
import type { DeckingFixingMethod } from '../calculators/decking';
import type { MaterialQuantity } from '../types';

const toNumber = (value: string) => {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatWhole = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) return '\u2014';
  return Math.ceil(value).toLocaleString('en-GB');
};

const formatNumber = (value: number, decimals = 2) => {
  if (!Number.isFinite(value) || value <= 0) return '\u2014';
  return value.toFixed(decimals);
};

type StepId = 'setup' | 'boards' | 'fixings' | 'substructure' | 'summary';

const JOIST_SPACING_OPTIONS = [
  { value: '300', label: '300 mm (composite \u2014 close spacing)' },
  { value: '400', label: '400 mm (standard \u2014 most boards)' },
  { value: '450', label: '450 mm (38 mm+ thick boards)' },
  { value: '500', label: '500 mm (heavy-duty boards only)' },
];

const JOIST_STOCK_LENGTH_OPTIONS = [
  { value: '2400', label: '2400 mm (2.4 m)' },
  { value: '3000', label: '3000 mm (3.0 m)' },
  { value: '3600', label: '3600 mm (3.6 m)' },
  { value: '4800', label: '4800 mm (4.8 m)' },
];

export default function DeckingProjectWizard() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // --- Setup step state ---
  const [deckLength, setDeckLength] = useState('');
  const [deckWidth, setDeckWidth] = useState('');
  const [boardPreset, setBoardPreset] = useState(BOARD_PRESETS[0].value);
  const [boardWidthMm, setBoardWidthMm] = useState(String(BOARD_PRESETS[0].widthMm));
  const [boardLengthMm, setBoardLengthMm] = useState(String(BOARD_PRESETS[0].lengthMm));
  const [gapMm, setGapMm] = useState(String(DEFAULT_GAP_MM));
  const [boardWastage, setBoardWastage] = useState(String(DECKING_WASTAGE.boards));
  const [boardPackSize] = useState('1');

  // --- Fixings step state ---
  const [fixingMethod, setFixingMethod] = useState<DeckingFixingMethod>(BOARD_PRESETS[0].fixingMethod);
  const [fixingProduct, setFixingProduct] = useState(FIXING_PRODUCTS[0].id);
  const [fixingWastage, setFixingWastage] = useState(String(DECKING_WASTAGE.fixings));

  // --- Substructure step state ---
  const [joistSpacingMm, setJoistSpacingMm] = useState(String(DEFAULT_JOIST_SPACING_MM));
  const [joistProduct, setJoistProduct] = useState(JOIST_PRODUCTS[0].id);
  const [joistStockLength, setJoistStockLength] = useState('3600');
  const [includeDeckBlocks, setIncludeDeckBlocks] = useState(true);
  const [joistWastage, setJoistWastage] = useState(String(DECKING_WASTAGE.joists));

  // Prefill inputs from URL query params (permalink-share). Runs once on
  // mount, after hydration. Invalid or unknown params are dropped by
  // decodePermalink and the defaults stand.
  useEffect(() => {
    const params = decodePermalink(DECKING_PERMALINK_SCHEMA, window.location.search);
    if (Object.keys(params).length === 0) return;

    if (params.dl) setDeckLength(params.dl);
    if (params.dw) setDeckWidth(params.dw);
    if (params.bp) setBoardPreset(params.bp);
    if (params.bw) setBoardWidthMm(params.bw);
    if (params.bl) setBoardLengthMm(params.bl);
    if (params.gap) setGapMm(params.gap);
    if (params.bwa) setBoardWastage(params.bwa);

    if (params.fm) {
      const method = params.fm as DeckingFixingMethod;
      setFixingMethod(method);
      // Only accept a fixing product that matches the method; otherwise
      // pick the first matching product, mirroring the method buttons.
      const linked = FIXING_PRODUCTS.find((f) => f.id === params.fp);
      const fallback = FIXING_PRODUCTS.find((f) => f.type === method);
      const product = linked?.type === method ? linked : fallback;
      if (product) setFixingProduct(product.id);
    } else if (params.fp) {
      setFixingProduct(params.fp);
    }
    if (params.fwa) setFixingWastage(params.fwa);

    if (params.js) setJoistSpacingMm(params.js);
    if (params.jp) setJoistProduct(params.jp);
    if (params.jsl) setJoistStockLength(params.jsl);
    if (params.blk) setIncludeDeckBlocks(params.blk === '1');
    if (params.jwa) setJoistWastage(params.jwa);
  }, []);

  /** Builds the shareable URL for the current inputs (Copy link button). */
  const buildShareUrl = () => {
    const query = encodePermalink(DECKING_PERMALINK_SCHEMA, {
      dl: deckLength,
      dw: deckWidth,
      bp: boardPreset,
      bw: boardWidthMm,
      bl: boardLengthMm,
      gap: gapMm,
      bwa: boardWastage,
      fm: fixingMethod,
      fp: fixingProduct,
      fwa: fixingWastage,
      js: joistSpacingMm,
      jp: joistProduct,
      jsl: joistStockLength,
      blk: includeDeckBlocks ? '1' : '0',
      jwa: joistWastage,
    });
    // The current page URL already carries the /selco base path, so the
    // link is base-safe on GitHub Pages and in dev without hardcoding "/".
    const url = new URL(window.location.href);
    url.search = query;
    url.hash = '';
    return url.toString();
  };

  const steps = useMemo(() => DECKING_STEPS.map(s => ({
    id: s.id as StepId,
    label: s.optional ? `${s.label} (optional)` : s.label,
    optional: s.optional,
  })), []);

  const currentStep = steps[currentIndex];

  const handleBoardPresetChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.value;
    setBoardPreset(value);
    const preset = BOARD_PRESETS.find(p => p.value === value);
    if (preset) {
      setBoardWidthMm(String(preset.widthMm));
      setBoardLengthMm(String(preset.lengthMm));
      setGapMm(String(preset.gapMm));
      setJoistSpacingMm(String(preset.joistSpacingMm));
      setFixingMethod(preset.fixingMethod);
      const matchingFix = FIXING_PRODUCTS.find(f => f.type === preset.fixingMethod);
      if (matchingFix) setFixingProduct(matchingFix.id);
    }
  };

  const areaM2 = useMemo(() => {
    const l = toNumber(deckLength);
    const w = toNumber(deckWidth);
    return l > 0 && w > 0 ? l * w : 0;
  }, [deckLength, deckWidth]);

  const projectResult = useMemo(() => {
    const l = toNumber(deckLength);
    const w = toNumber(deckWidth);
    const bw = toNumber(boardWidthMm);
    const bl = toNumber(boardLengthMm);
    const g = toNumber(gapMm);
    const bWaste = toNumber(boardWastage);
    const bPack = toNumber(boardPackSize);
    const js = toNumber(joistSpacingMm);
    const jsl = toNumber(joistStockLength);
    const jWaste = toNumber(joistWastage);
    const fWaste = toNumber(fixingWastage);

    if (l <= 0 || w <= 0 || bw <= 0 || bl <= 0 || js <= 0) return null;

    const selectedFix = FIXING_PRODUCTS.find(f => f.id === fixingProduct);
    const fixPack = selectedFix?.packSize ?? 200;

    try {
      return calculateDeckingProject({
        deckLengthM: l, deckWidthM: w,
        boardWidthMm: bw, boardLengthMm: bl, gapMm: g,
        boardWastage: bWaste, boardPackSize: bPack,
        joistSpacingMm: js, joistStockLengthMm: jsl,
        supportSpacingMm: DEFAULT_SUPPORT_SPACING_MM,
        includeDeckBlocks, joistWastage: jWaste,
        fixingMethod, fixingPackSize: fixPack, fixingWastage: fWaste,
      });
    } catch {
      return null;
    }
  }, [deckLength, deckWidth, boardWidthMm, boardLengthMm, gapMm,
      boardWastage, boardPackSize, joistSpacingMm, joistStockLength,
      joistWastage, fixingMethod, fixingProduct, fixingWastage, includeDeckBlocks]);

  // --- Step renderers ---
  const renderSetup = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-text-primary">Deck dimensions</h3>
      <div className="grid grid-cols-2 gap-4">
        <NumberInput
          id="deck-length" label="Deck length" unit="m"
          value={deckLength} onChange={setDeckLength}
          min={0.1} step={0.1} placeholder="e.g. 4" required
        />
        <NumberInput
          id="deck-width" label="Deck width" unit="m"
          value={deckWidth} onChange={setDeckWidth}
          min={0.1} step={0.1} placeholder="e.g. 3" required
        />
      </div>
      {areaM2 > 0 && (
        <p className="text-sm text-text-muted">Deck area: <strong>{formatNumber(areaM2)} m\u00B2</strong></p>
      )}

      <h3 className="text-lg font-semibold text-text-primary mt-8">Board selection</h3>
      <FormField
        id="board-preset" label="Board type" type="select"
        value={boardPreset} onChange={handleBoardPresetChange}
        options={BOARD_PRESETS.map(p => ({ value: p.value, label: p.label }))}
      />

      <div className="grid grid-cols-3 gap-4">
        <NumberInput
          id="board-width" label="Board width" unit="mm"
          value={boardWidthMm} onChange={setBoardWidthMm} min={50} step={1}
        />
        <NumberInput
          id="board-length" label="Board length" unit="mm"
          value={boardLengthMm} onChange={setBoardLengthMm} min={1000} step={100}
        />
        <NumberInput
          id="gap" label="Gap" unit="mm"
          value={gapMm} onChange={setGapMm} min={0} max={15} step={1}
        />
      </div>

      <NumberInput
        id="board-wastage" label="Board wastage" unit="%"
        value={boardWastage} onChange={setBoardWastage} min={0} max={30} step={1}
      />
    </div>
  );

  const renderFixings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-text-primary">Fixing method</h3>
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          className={`p-4 rounded-lg border-2 text-left transition-colors ${
            fixingMethod === 'face-fix-screws' ? 'border-brand-blue bg-blue-50' : 'border-border'
          }`}
          onClick={() => {
            setFixingMethod('face-fix-screws');
            const screw = FIXING_PRODUCTS.find(f => f.type === 'face-fix-screws');
            if (screw) setFixingProduct(screw.id);
          }}
        >
          <p className="font-semibold">Face-fix screws</p>
          <p className="text-sm text-text-muted mt-1">2 screws per board at each joist crossing. Visible fixing.</p>
        </button>
        <button
          type="button"
          className={`p-4 rounded-lg border-2 text-left transition-colors ${
            fixingMethod === 'hidden-clips' ? 'border-brand-blue bg-blue-50' : 'border-border'
          }`}
          onClick={() => {
            setFixingMethod('hidden-clips');
            const clip = FIXING_PRODUCTS.find(f => f.type === 'hidden-clips');
            if (clip) setFixingProduct(clip.id);
          }}
        >
          <p className="font-semibold">Hidden clips</p>
          <p className="text-sm text-text-muted mt-1">1 clip per board at each joist crossing. Concealed finish.</p>
        </button>
      </div>

      <FormField
        id="fixing-product" label="Fixing product" type="select"
        value={fixingProduct}
        onChange={e => setFixingProduct(e.target.value)}
        options={FIXING_PRODUCTS.filter(f => f.type === fixingMethod).map(f => ({ value: f.id, label: f.name }))}
      />

      <NumberInput
        id="fixing-wastage" label="Fixing wastage" unit="%"
        value={fixingWastage} onChange={setFixingWastage} min={0} max={20} step={1}
      />
    </div>
  );

  const renderSubstructure = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-text-primary">Substructure</h3>

      <FormField
        id="joist-spacing" label="Joist spacing (mm)" type="select"
        value={joistSpacingMm}
        onChange={e => setJoistSpacingMm(e.target.value)}
        options={JOIST_SPACING_OPTIONS}
      />

      <FormField
        id="joist-product" label="Joist product" type="select"
        value={joistProduct}
        onChange={e => setJoistProduct(e.target.value)}
        options={JOIST_PRODUCTS.map(j => ({ value: j.id, label: j.name }))}
      />

      <FormField
        id="joist-stock-length" label="Joist stock length" type="select"
        value={joistStockLength}
        onChange={e => setJoistStockLength(e.target.value)}
        options={JOIST_STOCK_LENGTH_OPTIONS}
      />

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={includeDeckBlocks}
          onChange={e => setIncludeDeckBlocks(e.target.checked)}
          className="w-4 h-4 rounded border-border text-brand-blue"
        />
        <span className="text-sm">Include concrete deck blocks (ground-level build)</span>
      </label>

      <NumberInput
        id="joist-wastage" label="Joist wastage" unit="%"
        value={joistWastage} onChange={setJoistWastage} min={0} max={20} step={1}
      />
    </div>
  );

  const renderSummary = () => {
    if (!projectResult) {
      return (
        <div className="text-center py-12">
          <p className="text-text-muted">Enter your deck dimensions in Step 1 to see results.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-text-primary">Your decking materials</h3>
        <div className="bg-brand-light rounded-lg p-4">
          <p className="text-sm text-text-muted">Deck area</p>
          <p className="text-2xl font-bold text-brand-navy">{formatNumber(projectResult.deckAreaM2)} m\u00B2</p>
        </div>

        <div className="divide-y divide-border">
          {projectResult.materials.map((mat: MaterialQuantity, i: number) => (
            <div key={i} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-text-primary">{mat.material}</p>
                <p className="text-sm text-text-muted">
                  {formatWhole(mat.quantity)} {mat.unit}
                  {mat.packsNeeded ? ` \u2014 ${formatWhole(mat.packsNeeded)} pack${mat.packsNeeded === 1 ? '' : 's'}` : ''}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-brand-navy">
                  {mat.packsNeeded ? formatWhole(mat.packsNeeded) : formatWhole(mat.quantity)}
                </p>
                <p className="text-xs text-text-muted">{mat.packsNeeded ? 'packs' : mat.unit}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="btn-ghost w-full mt-4"
          onClick={() => setCurrentIndex(0)}
        >
          Start over
        </button>
      </div>
    );
  };

  const renderStep = () => {
    switch (currentStep?.id) {
      case 'setup': return renderSetup();
      case 'boards': return renderSetup();
      case 'fixings': return renderFixings();
      case 'substructure': return renderSubstructure();
      case 'summary': return renderSummary();
      default: return null;
    }
  };

  return (
    <WizardShell
      steps={steps}
      currentStep={currentIndex}
      onNext={() => setCurrentIndex(i => Math.min(i + 1, steps.length - 1))}
      onBack={() => setCurrentIndex(i => Math.max(i - 1, 0))}
      onStartOver={() => setCurrentIndex(0)}
      actions={<CopyLinkButton getUrl={buildShareUrl} />}
    >
      {renderStep()}
    </WizardShell>
  );
}
