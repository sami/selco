/**
 * Hard flooring ranges and underlays, carried over from the pre-reset v2
 * concept calculator. Pack sizes vary range to range, so floors are quoted
 * as m² to buy rather than packs.
 */

export type FloorId = 'laminate8' | 'laminate12' | 'lvt' | 'engineered' | 'solid';

export interface FloorType {
  id: FloorId;
  label: string;
  thicknessMm: number;
  productName: string;
  /** Can be bonded down as well as floated. Laminate and rigid LVT float only. */
  canGlue: boolean;
  /** A real-timber wearing layer: moves with the seasons, so always needs the expansion gap. */
  wood: boolean;
}

export const FLOOR_TYPES: FloorType[] = [
  { id: 'laminate8', label: 'Laminate 8 mm', thicknessMm: 8, productName: 'Krono 8 mm laminate', canGlue: false, wood: false },
  { id: 'laminate12', label: 'Laminate 12 mm', thicknessMm: 12, productName: 'Krono Eurohome 12 mm laminate', canGlue: false, wood: false },
  { id: 'lvt', label: 'LVT / SPC 5 mm', thicknessMm: 5, productName: 'SPC rigid vinyl click plank', canGlue: false, wood: false },
  { id: 'engineered', label: 'Engineered wood 14 mm', thicknessMm: 14, productName: 'Engineered oak plank', canGlue: true, wood: true },
  { id: 'solid', label: 'Solid wood 18 mm', thicknessMm: 18, productName: 'Solid oak plank', canGlue: true, wood: true },
];

export type UnderlayId = 'foam' | 'vapour' | 'fibreboard' | 'acoustic' | 'integrated';

export interface Underlay {
  id: UnderlayId;
  label: string;
  /** Empty for integrated, which adds no line. */
  productName: string;
  note: string;
}

export const UNDERLAYS: Underlay[] = [
  { id: 'foam', label: 'Foam underlay', productName: 'White foam flooring underlay', note: 'Over a dry, level timber subfloor.' },
  { id: 'vapour', label: 'Vapour-barrier foam', productName: 'Vapour barrier foam underlay', note: 'Built-in DPM, the choice over concrete.' },
  { id: 'fibreboard', label: 'Fibreboard 5 mm', productName: 'Fibreboard flooring underlay, 5 mm', note: 'Evens out a slightly uneven subfloor.' },
  { id: 'acoustic', label: 'Acoustic (LVT-rated)', productName: 'Timbertech acoustic underlay', note: 'Thin, dense and rated for rigid LVT.' },
  { id: 'integrated', label: 'Integrated (built into the plank)', productName: '', note: 'Nothing separate to lay.' },
];

export const FLOOR_ADHESIVE = 'SikaBond-54 wood floor adhesive';
export const SCOTIA_BEADING = { name: 'Matching scotia beading', lengthM: 2.4 };
export const THRESHOLD_BAR = 'Threshold / door bar, 900 mm';
export const FITTING_KIT = 'Expansion spacer & fitting kit';
