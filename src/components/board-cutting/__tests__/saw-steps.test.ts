import { describe, it, expect } from 'vitest';
import { planCutting, type CuttingPlan } from '../../../calculators/board-cutting';
import { describeOffcut, describeStep } from '../saw-steps';

const sheet: CuttingPlan = planCutting({ sheetId: 'sheet', pieces: [{ wMm: 800, hMm: 600, qty: 1 }], allowRotation: false });
const worktop: CuttingPlan = planCutting({ sheetId: 'worktop', pieces: [{ wMm: 600, hMm: 1500, qty: 1 }], allowRotation: false });

describe('describeStep', () => {
  it('describes cutting a strip across the full sheet width', () => {
    expect(describeStep({ kind: 'strip', step: 1, strip: 1, atMm: 600 }, sheet)).toBe(
      'Cut strip 1 across the full 1220 mm width at 600 mm',
    );
  });

  it('describes cross-cutting a piece off a strip', () => {
    expect(describeStep({ kind: 'piece', step: 2, strip: 1, ref: 'A', atMm: 800, trimToMm: null }, sheet)).toBe(
      'From strip 1, cut A at 800 mm',
    );
  });

  it('adds the trim when the piece is shorter than its strip', () => {
    expect(describeStep({ kind: 'piece', step: 3, strip: 2, ref: 'B', atMm: 500, trimToMm: 400 }, sheet)).toBe(
      'From strip 2, cut B at 500 mm, then trim to 400 mm',
    );
  });

  it('describes cutting a worktop piece to length', () => {
    expect(describeStep({ kind: 'length', step: 1, ref: 'A', atMm: 1500 }, worktop)).toBe('Cut A at 1500 mm');
  });
});

describe('describeOffcut', () => {
  it('gives the offcut size as width × height', () => {
    expect(describeOffcut({ xMm: 0, yMm: 606, wMm: 1220, hMm: 1834 })).toBe('1220 × 1834');
  });
});
