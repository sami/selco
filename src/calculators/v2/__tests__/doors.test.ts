import { describe, it, expect } from 'vitest';
import { doorsLinings } from '../specs/interiors';
import type { Values } from '../specs/spec-types';

// Doors carry a size choice (the standard 1981-high widths), a three-way
// use (standard / FD30 internal / fire exit & public), and a lining choice
// across the stocked range (softwood packs, primed MDF sets, Firecheck).

const compute = (v: Values) => doorsLinings.compute(v);
const lines = (v: Values) => compute(v).sections.flatMap((s) => s.lines);
const line = (v: Values, id: string) => lines(v).find((l) => l.id === id);

const base: Values = {
    doors: 2,
    doorUse: 'standard',
    doorType: 'oak',
    doorSize: '762',
    lining: 'sw138',
    closers: false,
    newLinings: true,
};

describe('doorsLinings — size choice', () => {
    it('TC1: the door line carries the chosen width and a 35 mm standard leaf', () => {
        expect(line({ ...base, doorSize: '686' }, 'doors')!.detail).toContain('686');
        expect(line({ ...base, doorSize: '686' }, 'doors')!.detail).toContain('35');
    });

    it('TC2: FD30 makes the leaf 44 mm and the lining a 38 mm firecheck', () => {
        const fire = { ...base, doorUse: 'fd30' };
        expect(line(fire, 'doors')!.detail).toContain('44');
        const lining = line(fire, 'linings')!;
        expect(lining.name.toLowerCase()).toContain('firecheck');
        expect(lining.name).toContain('38');
    });
});

describe('doorsLinings — type choice', () => {
    it('TC3: the door name reflects the chosen type', () => {
        expect(line({ ...base, doorType: 'oak' }, 'doors')!.name.toLowerCase()).toContain('oak');
        expect(line({ ...base, doorType: 'panel' }, 'doors')!.name.toLowerCase()).toContain('moulded');
    });
});

describe('doorsLinings — lining choice', () => {
    it('TC5: the lining width follows the choice', () => {
        expect(line({ ...base, lining: 'sw115' }, 'linings')!.name).toContain('115');
        expect(line({ ...base, lining: 'sw138' }, 'linings')!.name).toContain('138');
    });

    it('TC5a: primed MDF sets are their own product at 25 mm', () => {
        const mdf = line({ ...base, lining: 'mdf132' }, 'linings')!;
        expect(mdf.name.toLowerCase()).toContain('mdf');
        expect(mdf.name).toContain('25 × 132');
    });

    it('TC5b: fire doors snap the lining to the nearest Firecheck width', () => {
        expect(line({ ...base, doorUse: 'fd30', lining: 'mdf108' }, 'linings')!.name).toContain('115');
        expect(line({ ...base, doorUse: 'fd30', lining: 'mdf132' }, 'linings')!.name).toContain('138');
    });

    it('TC6: no lining line when hanging into existing frames', () => {
        expect(line({ ...base, newLinings: false }, 'linings')).toBeUndefined();
    });
});

describe('doorsLinings — door use drives the hardware', () => {
    it('TC8: standard doors get no fire kit', () => {
        expect(line(base, 'strips')).toBeUndefined();
        expect(line(base, 'closers')).toBeUndefined();
        expect(line(base, 'panic')).toBeUndefined();
        expect(line(base, 'signage')).toBeUndefined();
    });

    it('TC9: FD30 internal keeps lever handles, closers only when asked', () => {
        const fd30 = { ...base, doorUse: 'fd30' };
        expect(line(fd30, 'handles')).toBeDefined();
        expect(line(fd30, 'strips')!.qty).toBe(6);
        expect(line(fd30, 'closers')).toBeUndefined();
        expect(line({ ...fd30, closers: true }, 'closers')!.qty).toBe(2);
    });

    it('TC10: fire exit doors swap handles for a panic bar and always close', () => {
        const exit = { ...base, doorUse: 'exit' };
        expect(line(exit, 'handles')).toBeUndefined();
        expect(line(exit, 'latch')).toBeUndefined();
        expect(line(exit, 'panic')!.qty).toBe(2);
        expect(line(exit, 'closers')!.qty).toBe(2);
        expect(line(exit, 'signage')!.qty).toBe(4);
        expect(line(exit, 'strips')!.name).toContain('FD30S');
    });
});

describe('doorsLinings — quantities still scale per door', () => {
    it('TC7: three hinges per door, latch per door', () => {
        expect(line({ ...base, doors: 4 }, 'hinges')!.qty).toBe(12);
        expect(line({ ...base, doors: 4 }, 'latch')!.qty).toBe(4);
    });
});
