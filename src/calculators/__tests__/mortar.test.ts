import { describe, it, expect } from 'vitest';
import { calculateMortar } from '../mortar';

describe('calculateMortar()', () => {
    // TC1 — brickwork volume (0.012 m³/m²)
    it('TC1: 10 m² brickwork, 1:3 → 0.12 m³', () => {
        const r = calculateMortar({ areaM2: 10, unitType: 'brick', mixRatio: '1:3', wastagePercent: 0 });
        expect(r.mortarVolumeM3).toBeCloseTo(0.12, 4);
    });

    // TC2 — blockwork volume (0.007 m³/m²)
    it('TC2: 10 m² blockwork, 1:3 → 0.07 m³', () => {
        const r = calculateMortar({ areaM2: 10, unitType: 'block', mixRatio: '1:3', wastagePercent: 0 });
        expect(r.mortarVolumeM3).toBeCloseTo(0.07, 4);
    });

    // TC3 — mortar weight approximation at sand density
    it('TC3: 0.12 m³ × 1,600 kg/m³ = 192 kg mortar weight', () => {
        const r = calculateMortar({ areaM2: 10, unitType: 'brick', mixRatio: '1:3', wastagePercent: 0 });
        expect(r.mortarWeightKg).toBeCloseTo(192, 1);
    });

    // TC4 — sand component (1:3 → 75%)
    it('TC4: sand component 1:3 mix → 144 kg (75% of 0.12 m³ × 1,600)', () => {
        const r = calculateMortar({ areaM2: 10, unitType: 'brick', mixRatio: '1:3', wastagePercent: 0 });
        expect(r.sandKg).toBeCloseTo(144, 1);
    });

    // TC5 — cement component (1:3 → 25%)
    it('TC5: cement component 1:3 mix → 45 kg (25% of 0.12 m³ × 1,500)', () => {
        const r = calculateMortar({ areaM2: 10, unitType: 'brick', mixRatio: '1:3', wastagePercent: 0 });
        expect(r.cementKg).toBeCloseTo(45, 1);
    });

    // TC6 — 1:4 mix ratio (80% sand, 20% cement)
    it('TC6: 1:4 mix → sand 153.6 kg, cement 36 kg', () => {
        const r = calculateMortar({ areaM2: 10, unitType: 'brick', mixRatio: '1:4', wastagePercent: 0 });
        expect(r.sandKg).toBeCloseTo(153.6, 1);
        expect(r.cementKg).toBeCloseTo(36, 1);
    });

    // TC7 — materials array has sand and cement entries
    it('TC7: materials has 2 entries — sand and cement', () => {
        const r = calculateMortar({ areaM2: 10, unitType: 'brick', mixRatio: '1:3', wastagePercent: 0 });
        expect(r.materials).toHaveLength(2);
        const units = r.materials.map(m => m.unit);
        expect(units).toContain('kg');
    });

    // TC8 — zero area
    it('TC8: zero area → zero mortar', () => {
        const r = calculateMortar({ areaM2: 0, unitType: 'brick', mixRatio: '1:3', wastagePercent: 0 });
        expect(r.mortarVolumeM3).toBe(0);
        expect(r.sandKg).toBe(0);
        expect(r.cementKg).toBe(0);
    });
});
