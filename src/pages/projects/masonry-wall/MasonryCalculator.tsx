import React, { useState } from 'react';
import { calculateMasonry, type MasonryResult } from '../../../calculators/masonry';
import { FormField } from '../../../components/ui/FormField';
import { NumberInput } from '../../../components/ui/NumberInput';
import { MaterialsList, type MaterialItem } from '../../../components/ui/MaterialsList';
import { ResultCard } from '../../../components/ui/ResultCard';

type WallType = 'brick' | 'block';

/**
 * Parse one of the engine's pack-rounded strings into MaterialsList columns.
 * Known shapes (see calculators/masonry.ts):
 *   "10 × 25kg bags of Blue Circle OPC"                        → qty / unit / name
 *   "1 × Type 4 Light Duty Wall Tie 200mm (Box of 250)"        → qty / name / boxes-of unit
 *   "1 × Building Sand Jumbo Bag"                              → qty / name (bag counted in name)
 */
function parsePacked(packed: string): Omit<MaterialItem, 'id'> {
  const [quantity, rest] = packed.split(' × ');
  const box = rest.match(/^(.*) \(Box of (\d+)\)$/);
  if (box) return { quantity, name: box[1], unit: `boxes of ${box[2]}` };
  const parts = rest.split(' of ');
  if (parts.length === 2) return { quantity, name: parts[1], unit: parts[0] };
  return { quantity, name: rest, unit: 'bags' };
}

export function MasonryCalculator() {
  const [length, setLength] = useState('');
  const [height, setHeight] = useState('');
  const [wallType, setWallType] = useState<WallType>('brick');
  const [wastage, setWastage] = useState('5');
  const [result, setResult] = useState<MasonryResult | null>(null);
  const [attempted, setAttempted] = useState<{ length: number; height: number; wallType: WallType; wastage: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
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

  const unitCount = result ? (result.bricks ?? result.blocks ?? 0) : 0;
  const unitLabel = result?.blocks !== undefined ? 'blocks' : 'bricks';

  const materials: MaterialItem[] = result
    ? [
        { id: 'mortar', ...parsePacked(result.mortar) },
        { id: 'sand', ...parsePacked(result.sand) },
        { id: 'ties', ...parsePacked(result.ties) },
      ]
    : [];

  const copyList = () => {
    if (!result || !attempted) return;
    const lines = [
      `Masonry wall — ${attempted.length}m × ${attempted.height}m (${attempted.wallType}, ${attempted.wastage}% wastage)`,
      '',
      `- ${unitCount} ${unitLabel}`,
      `- ${result.mortar}`,
      `- ${result.sand}`,
      `- ${result.ties}`,
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
            title="You will need"
            quantity={unitCount}
            unit={unitLabel}
            detail={`${attempted.length}m × ${attempted.height}m ${attempted.wallType} wall, including ${attempted.wastage}% wastage`}
          />
          <MaterialsList items={materials} />
          <button type="button" onClick={copyList} className="btn-ghost">
            {copied ? 'Copied ✓' : 'Copy list'}
          </button>
        </section>
      )}
    </div>
  );
}
