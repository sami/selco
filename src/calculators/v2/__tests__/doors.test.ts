import { describe, it, expect } from 'vitest';
import { doorsLinings } from '../specs/interiors';
import type { Values } from '../specs/spec-types';

// Doors now carry a size choice (the standard 1981-high widths), a wider
// type list, and a lining-size choice (depth to suit the wall build-up).

const compute = (v: Values) => doorsLinings.compute(v);
const lines = (v: Values) => compute(v).sections.flatMap((s) => s.lines);
const line = (v: Values, id: string) => lines(v).find((l) => l.id === id);

const base: Values = {
    doors: 2,
    doorType: 'oak',
    doorSize: '762',
    liningWidth: '138',
    fire: false,
    newLinings: true,
};

describe('doorsLinings — size choice', () => {
    it('TC1: the door line carries the chosen width and a 35 mm standard leaf', () => {
        expect(line({ ...base, doorSize: '686' }, 'doors')!.detail).toContain('686');
        expect(line({ ...base, doorSize: '686' }, 'doors')!.detail).toContain('35');
    });

    it('TC2: FD30 makes the leaf 44 mm and the lining a 38 mm firecheck', () => {
        const fire = { ...base, fire: true };
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

describe('doorsLinings — lining size choice', () => {
    it('TC5: the lining depth follows the choice', () => {
        expect(line({ ...base, liningWidth: '115' }, 'linings')!.name).toContain('115');
        expect(line({ ...base, liningWidth: '138' }, 'linings')!.name).toContain('138');
    });

    it('TC6: no lining line when hanging into existing frames', () => {
        expect(line({ ...base, newLinings: false }, 'linings')).toBeUndefined();
    });
});

describe('doorsLinings — quantities still scale per door', () => {
    it('TC7: three hinges per door, latch per door', () => {
        expect(line({ ...base, doors: 4 }, 'hinges')!.qty).toBe(12);
        expect(line({ ...base, doors: 4 }, 'latch')!.qty).toBe(4);
    });
});
