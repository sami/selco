import { describe, it, expect } from 'vitest';
import {
    FLOOR_TYPES,
    UNDERLAYS,
    planFlooring,
    calculateFlooring,
    type FlooringInput,
} from '../flooring';

// The flooring calculator now answers in area to cover (m²) rather than
// packs, because Selco pack sizes vary by range. It also lets the customer
// pick the underlay (including integrated / none) and the fixing method
// (floating click vs glued down).

const job = (over: Partial<FlooringInput> = {}): FlooringInput => ({
    widthM: 3.5,
    lengthM: 4.5,
    floorId: 'laminate8',
    underlay: 'foam',
    fixing: 'floating',
    concreteSubfloor: false,
    doorways: 1,
    ...over,
});

const allLines = (input: FlooringInput) =>
    calculateFlooring(input).sections.flatMap((s) => s.lines);

describe('catalogues', () => {
    it('TC1: floor types carry a thickness; only wood floors can be glued down', () => {
        for (const f of FLOOR_TYPES) expect(f.thicknessMm).toBeGreaterThan(0);
        // Laminate and rigid-click LVT are floating only; engineered/solid glue.
        expect(FLOOR_TYPES.find((f) => f.id === 'laminate8')!.canGlue).toBe(false);
        expect(FLOOR_TYPES.find((f) => f.id === 'lvt')!.canGlue).toBe(false);
        expect(FLOOR_TYPES.find((f) => f.id === 'engineered')!.canGlue).toBe(true);
        expect(FLOOR_TYPES.find((f) => f.id === 'solid')!.canGlue).toBe(true);
    });

    it('TC2: underlay options include integrated and none plus real Selco types', () => {
        const ids = UNDERLAYS.map((u) => u.id);
        expect(ids).toEqual(expect.arrayContaining(['integrated', 'none', 'foam', 'fibreboard', 'acoustic']));
    });
});

describe('planFlooring — area to cover, not packs', () => {
    it('TC3: cover area is the room area plus cutting waste', () => {
        const plan = planFlooring(job());
        expect(plan.coverM2).toBeCloseTo(3.5 * 4.5 * 1.08, 2);
    });

    it('TC4: plank thickness does not change how much floor you need', () => {
        const thin = planFlooring(job({ floorId: 'laminate8' })).coverM2;
        const thick = planFlooring(job({ floorId: 'laminate12' })).coverM2;
        expect(thick).toBeCloseTo(thin, 5);
    });
});

describe('calculateFlooring — bill', () => {
    it('TC5: the flooring line is quoted in m² to cover, not packs', () => {
        const floor = allLines(job()).find((l) => l.id === 'floor')!;
        expect(floor.unit.toLowerCase()).toContain('m²');
    });

    it('TC6: integrated underlay adds no underlay line', () => {
        const lines = allLines(job({ underlay: 'integrated' }));
        expect(lines.some((l) => l.id === 'underlay')).toBe(false);
    });

    it('TC7: a chosen underlay names the Selco product and is quoted by area', () => {
        const u = allLines(job({ underlay: 'fibreboard' })).find((l) => l.id === 'underlay')!;
        expect(u.name.toLowerCase()).toContain('fibreboard');
        expect(u.unit.toLowerCase()).toContain('m²');
    });

    it('TC8: glued fixing adds the wood adhesive line; floating does not', () => {
        const glued = allLines(job({ floorId: 'engineered', fixing: 'glued' })).find((l) => l.id === 'adhesive');
        expect(glued?.name.toLowerCase()).toContain('wood floor adhesive');
        expect(allLines(job({ floorId: 'engineered', fixing: 'floating' })).some((l) => l.id === 'adhesive')).toBe(false);
    });

    it('TC9: rigid-click LVT is floating only — a glue request adds no adhesive and keeps the beading', () => {
        const lines = allLines(job({ floorId: 'lvt', fixing: 'glued' }));
        expect(lines.some((l) => l.id === 'adhesive')).toBe(false);
        expect(lines.some((l) => l.id === 'beading')).toBe(true);
        expect(lines.some((l) => l.id === 'spacers')).toBe(true);
    });

    it('TC10: glued wood still needs the perimeter expansion beading', () => {
        expect(allLines(job({ floorId: 'engineered', fixing: 'glued', underlay: 'none' })).some((l) => l.id === 'beading')).toBe(true);
    });
});
