import React, { useState } from 'react';
import { calculateFlooring, type FlooringInput, type FlooringResult } from '../../calculators/flooring';
import { FLOOR_TYPES, UNDERLAYS, type FloorId, type UnderlayId } from '../../data/flooring-products';
import { FormField } from '../ui/FormField';
import { NumberInput } from '../ui/NumberInput';
import { MaterialsList } from '../ui/MaterialsList';
import { ResultCard } from '../ui/ResultCard';

type Fixing = FlooringInput['fixing'];

const selectClass =
  'block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm bg-white focus:border-selco-navy focus:outline-none focus:ring-1 focus:ring-selco-navy text-neutral-grey-800';

export function FlooringCalculator() {
  const [width, setWidth] = useState('');
  const [length, setLength] = useState('');
  const [floorId, setFloorId] = useState<FloorId>('laminate8');
  const [fixing, setFixing] = useState<Fixing>('floating');
  const [underlay, setUnderlay] = useState<UnderlayId>('foam');
  const [doorways, setDoorways] = useState('1');
  const [concreteSubfloor, setConcreteSubfloor] = useState(false);
  const [result, setResult] = useState<FlooringResult | null>(null);
  const [attempted, setAttempted] = useState<FlooringInput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const floor = FLOOR_TYPES.find((f) => f.id === floorId)!;

  // Glue-down is only for real wood: moving to a float-only floor puts the
  // fixing back to floating on screen, where the user can see it happen.
  const changeFloor = (id: FloorId) => {
    setFloorId(id);
    if (!FLOOR_TYPES.find((f) => f.id === id)!.canGlue) setFixing('floating');
  };

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const room = {
      widthM: parseFloat(width) || 0,
      lengthM: parseFloat(length) || 0,
      floorId,
      doorways: doorways === '' ? 0 : Number(doorways),
      concreteSubfloor,
    };
    const input: FlooringInput = fixing === 'glued' ? { ...room, fixing } : { ...room, fixing, underlay };
    setAttempted(input);
    try {
      setResult(calculateFlooring(input));
      setError(null);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
    setCopied(false);
  };

  const fieldError = (value: number | undefined) =>
    attempted && value !== undefined && value <= 0 ? 'Enter a positive number' : undefined;

  const copyList = () => {
    if (!result || !attempted) return;
    const lines = [
      `Hard flooring — ${attempted.widthM}m × ${attempted.lengthM}m (${result.floor.label}, ${attempted.fixing})`,
      '',
      ...result.lines.map((l) => `- ${l.name}: ${l.quantity} × ${l.unit}`),
    ];
    navigator.clipboard.writeText(lines.join('\n')).then(() => setCopied(true));
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} noValidate className="card space-y-4" aria-label="Hard flooring calculator">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="room-width" label="Room width" required error={fieldError(attempted?.widthM)}>
            <NumberInput unit="m" min="0" step="0.01" placeholder="e.g. 3.5" value={width} onChange={(e) => setWidth(e.target.value)} />
          </FormField>
          <FormField id="room-length" label="Room length" required error={fieldError(attempted?.lengthM)}>
            <NumberInput unit="m" min="0" step="0.01" placeholder="e.g. 4.5" value={length} onChange={(e) => setLength(e.target.value)} />
          </FormField>
          <FormField id="floor-type" label="Floor type" helperText="Thickness doesn't change the area you buy">
            <select value={floorId} onChange={(e) => changeFloor(e.target.value as FloorId)} className={selectClass}>
              {FLOOR_TYPES.map((f) => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </select>
          </FormField>
          <FormField id="doorways" label="Doorways" helperText="Each one gets a threshold bar">
            <NumberInput min="0" step="1" value={doorways} onChange={(e) => setDoorways(e.target.value)} />
          </FormField>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-bold text-selco-navy">Fixing</legend>
          <label className="flex items-center gap-2 text-sm text-neutral-grey-800">
            <input type="radio" name="fixing" value="floating" checked={fixing === 'floating'} onChange={() => setFixing('floating')} />
            Floating (click together)
          </label>
          <label className={`flex items-center gap-2 text-sm text-neutral-grey-800 ${floor.canGlue ? '' : 'opacity-50'}`}>
            <input
              type="radio"
              name="fixing"
              value="glued"
              checked={fixing === 'glued'}
              disabled={!floor.canGlue}
              aria-describedby="fixing-glued-helper"
              onChange={() => setFixing('glued')}
            />
            Glued down
          </label>
          <p id="fixing-glued-helper" className="text-sm text-gray-500">
            {floor.canGlue ? 'Bonded with wood floor adhesive.' : `${floor.label} can only be laid floating.`}
          </p>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          {fixing === 'floating' && (
            <FormField id="underlay" label="Underlay" helperText={UNDERLAYS.find((u) => u.id === underlay)!.note}>
              <select value={underlay} onChange={(e) => setUnderlay(e.target.value as UnderlayId)} className={selectClass}>
                {UNDERLAYS.map((u) => (
                  <option key={u.id} value={u.id}>{u.label}</option>
                ))}
              </select>
            </FormField>
          )}
          <label className="flex items-center gap-2 text-sm font-bold text-selco-navy sm:self-end sm:pb-2">
            <input type="checkbox" checked={concreteSubfloor} onChange={(e) => setConcreteSubfloor(e.target.checked)} />
            Concrete subfloor
          </label>
        </div>

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
            title="Flooring to buy"
            quantity={result.coverM2.toFixed(2)}
            unit="m²"
            detail={`${attempted.widthM}m × ${attempted.lengthM}m room, including 8% cutting waste. Buy whole packs to cover this.`}
          />
          <MaterialsList items={result.lines} />
          <ul className="list-disc pl-5 space-y-1 text-sm text-text-muted">
            {result.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
          <button type="button" onClick={copyList} className="btn-ghost">
            {copied ? 'Copied ✓' : 'Copy list'}
          </button>
        </section>
      )}
    </div>
  );
}
