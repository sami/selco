import {
  FITTING_KIT,
  FLOOR_ADHESIVE,
  FLOOR_TYPES,
  SCOTIA_BEADING,
  THRESHOLD_BAR,
  UNDERLAYS,
  type FloorId,
  type FloorType,
  type UnderlayId,
} from '../data/flooring-products';
import { roundUp, type MaterialLine } from './packs';

interface RoomInput {
  widthM: number;
  lengthM: number;
  floorId: FloorId;
  /** Doorways needing a threshold bar. */
  doorways: number;
  /** Concrete subfloors want a vapour barrier under a floating floor. */
  concreteSubfloor: boolean;
}

/** A glued floor is bonded straight down, so it has no underlay to choose. */
export type FlooringInput = RoomInput & ({ fixing: 'floating'; underlay: UnderlayId } | { fixing: 'glued' });

export interface FlooringResult {
  areaM2: number;
  /** m² of flooring to buy, cutting waste included. */
  coverM2: number;
  floor: FloorType;
  lines: MaterialLine[];
  notes: string[];
}

const CUTTING_WASTE = 0.08;
const UNDERLAY_OVERLAP = 0.05;
const DOORWAY_WIDTH_M = 0.8;

/** Pack sizes vary by range, so areas are quoted to the next 0.01 m². */
const upTo2dp = (m2: number) => roundUp(m2 * 100) / 100;

/**
 * Hard flooring quoted as area to buy plus the underlay, adhesive, edges
 * and thresholds that go with it. Combinations the trade doesn't allow are
 * rejected here and made unselectable in the UI, never silently corrected.
 */
export function calculateFlooring(input: FlooringInput): FlooringResult {
  const { widthM, lengthM, doorways, concreteSubfloor } = input;
  if (widthM <= 0 || lengthM <= 0) {
    throw new Error('Room dimensions must be positive');
  }
  if (!Number.isInteger(doorways) || doorways < 0) {
    throw new Error('Doorways must be a whole number, 0 or more');
  }
  const floor = FLOOR_TYPES.find((f) => f.id === input.floorId);
  if (!floor) {
    throw new Error(`Unknown floor type: ${input.floorId}`);
  }
  if (input.fixing === 'glued' && !floor.canGlue) {
    throw new Error(`${floor.label} can only be laid floating`);
  }

  const areaM2 = widthM * lengthM;
  const coverM2 = upTo2dp(areaM2 * (1 + CUTTING_WASTE));
  const perimeterM = 2 * (widthM + lengthM);

  const lines: MaterialLine[] = [{ id: 'floor', name: floor.productName, quantity: coverM2, unit: 'm²' }];

  if (input.fixing === 'floating') {
    const underlay = UNDERLAYS.find((u) => u.id === input.underlay);
    if (underlay && underlay.id !== 'integrated') {
      lines.push({ id: 'underlay', name: underlay.productName, quantity: upTo2dp(areaM2 * (1 + UNDERLAY_OVERLAP)), unit: 'm²' });
    }
  } else {
    lines.push({ id: 'adhesive', name: FLOOR_ADHESIVE, quantity: upTo2dp(areaM2), unit: 'm² to bond' });
  }

  // Floating floors and glued wood both move, so both keep the perimeter gap.
  lines.push({
    id: 'beading',
    name: SCOTIA_BEADING.name,
    quantity: roundUp(Math.max(0, perimeterM - doorways * DOORWAY_WIDTH_M) / SCOTIA_BEADING.lengthM),
    unit: `${SCOTIA_BEADING.lengthM}m lengths`,
  });
  if (doorways > 0) {
    lines.push({ id: 'thresholds', name: THRESHOLD_BAR, quantity: doorways, unit: 'bars' });
  }
  if (input.fixing === 'floating') {
    lines.push({ id: 'spacers', name: FITTING_KIT, quantity: 1, unit: 'kits' });
  }

  const notes = [
    'Leave the packs flat in the room for 48 hours before laying.',
    'Leave a 10 mm expansion gap at every wall; the scotia covers it.',
    `Plank thickness (${floor.thicknessMm} mm) sets the threshold bar height and how far to undercut the door casings.`,
  ];
  if (concreteSubfloor && input.fixing === 'floating' && input.underlay !== 'vapour') {
    notes.push("Concrete subfloor: use the vapour-barrier foam, or lay a separate DPM, so damp can't reach the floor.");
  }

  return { areaM2, coverM2, floor, lines, notes };
}
