import { describe, it, expect } from 'vitest';
import { TILING_SUGGESTIONS } from './tiling-suggestions';

describe('TILING_SUGGESTIONS', () => {
    it('exports at least 10 suggestions', () => {
        expect(TILING_SUGGESTIONS.length).toBeGreaterThanOrEqual(10);
    });

    it('each suggestion has item and description strings', () => {
        for (const s of TILING_SUGGESTIONS) {
            expect(typeof s.item).toBe('string');
            expect(s.item.length).toBeGreaterThan(0);
            expect(typeof s.description).toBe('string');
            expect(s.description.length).toBeGreaterThan(0);
        }
    });

    it('includes tile cutter, spirit level, and silicone sealant', () => {
        const items = TILING_SUGGESTIONS.map((s) => s.item.toLowerCase());
        expect(items).toEqual(
            expect.arrayContaining([
                expect.stringContaining('tile cutter'),
                expect.stringContaining('spirit level'),
                expect.stringContaining('silicone'),
            ]),
        );
    });
});
