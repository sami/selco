import React, { useState } from 'react';
import { calculateMasonry, type MasonryResult } from '../../calculators/masonry';
import { FormField } from '../ui/FormField';
import { NumberInput } from '../ui/NumberInput';
import { MaterialsList } from '../ui/MaterialsList';
import { ResultCard } from '../ui/ResultCard';

type WallType = 'brick' | 'block';

export function MasonryCalculator() {
  const [length, setLength] = useState('');
  const [height, setHeight] = useState('');
  const [wallType, setWallType] = useState<WallType>('brick');
  const [wastage, setWastage] = useState('5');
  const [result, setResult] = useState<MasonryResult | null>(null);
  const [attempted, setAttempted] = useState<{ length: number; height: number; wallType: WallType; wastage: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Invalid/empty input parses to 0 so the engine's own guard produces
    // the single canonical error message.
    const parsed = {
      length: parseFloat(length) || 0,
      height: parseFloat(height) || 0,
      wallType,
      wastage: parseFloat(wastage) || 0,
    };
    setAttempted(parsed);
    try {
      setResult(calculateMasonry(parsed));
      setError(null);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
    setCopied(false);
  };

  /** Field-level error for whichever dimension actually failed the last attempt. */
  const fieldError = (value: number | undefined) =>
    attempted && value !== undefined && value <= 0 ? 'Enter a positive number' : undefined;

  const copyList = () => {
    if (!result || !attempted) return;
    const lines = [
      `Masonry wall — ${attempted.length}m × ${attempted.height}m (${attempted.wallType}, ${attempted.wastage}% wastage)`,
      '',
      `- ${result.unitCount} ${result.unitKind}`,
      ...result.lines.map((l) => `- ${l.name}: ${l.quantity} × ${l.unit}`),
    ];
    navigator.clipboard.writeText(lines.join('\n')).then(() => setCopied(true));
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} noValidate className="card space-y-4" aria-label="Masonry wall calculator">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="wall-length" label="Wall length" required error={fieldError(attempted?.length)}>
            <NumberInput
              unit="m"
              min="0"
              step="0.01"
              placeholder="e.g. 5.0"
              value={length}
              onChange={e => setLength(e.target.value)}
            />
          </FormField>
          <FormField id="wall-height" label="Wall height" required error={fieldError(attempted?.height)}>
            <NumberInput
              unit="m"
              min="0"
              step="0.01"
              placeholder="e.g. 2.5"
              value={height}
              onChange={e => setHeight(e.target.value)}
            />
          </FormField>
          <FormField id="wall-type" label="Wall type" helperText="Bricks at 51/m², blocks at 10/m²">
            <select
              value={wallType}
              onChange={e => setWallType(e.target.value as WallType)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm bg-white focus:border-selco-navy focus:outline-none focus:ring-1 focus:ring-selco-navy text-neutral-grey-800"
            >
              <option value="brick">Brick</option>
              <option value="block">Block</option>
            </select>
          </FormField>
          <FormField id="wastage" label="Wastage" helperText="5% is typical for brickwork">
            <NumberInput
              unit="%"
              min="0"
              max="100"
              step="1"
              value={wastage}
              onChange={e => setWastage(e.target.value)}
            />
          </FormField>
        </div>

        {/* Always-mounted live region so screen readers announce new errors */}
        <div aria-live="assertive" role="alert">
          {error && <p className="text-error-red font-medium text-sm">{error}</p>}
        </div>

        <button type="submit" className="btn-accent">
          Calculate materials
        </button>
      </form>

      {result && attempted && (
        <section aria-label="Results" className="space-y-4">
          <ResultCard
            title="Estimated quantity"
            quantity={result.unitCount}
            unit={result.unitKind}
            detail={`${attempted.length}m × ${attempted.height}m ${attempted.wallType} wall, including ${attempted.wastage}% wastage`}
          />
          <MaterialsList items={result.lines} />
          <button type="button" onClick={copyList} className="btn-ghost">
            {copied ? 'Copied ✓' : 'Copy list'}
          </button>
        </section>
      )}
    </div>
  );
}
