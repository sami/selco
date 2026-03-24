import { describe, it, expect } from 'vitest';
import { calculateFlooringRoom } from '../flooring-room';

describe('calculateFlooringRoom — Scenario A: Small room, engineered', () => {
    it('returns correct packs, underlay, scotia, and threshold', () => {
        const result = calculateFlooringRoom({
            room: { lengthM: 4, widthM: 3 },
            flooringType: 'engineered',
            coveragePerPackM2: 2.13,
            layingPattern: 'brick-bond',
            doorwayCount: 1,
        });

        // Floor area = 4 × 3 = 12 m²
        expect(result.floorAreaM2).toBe(12);

        // Perimeter = 2 × (4 + 3) = 14m
        expect(result.perimeterM).toBe(14);

        // Packs: 12 × 1.10 / 2.13 = 13.2 / 2.13 = 6.197 → 7
        expect(result.flooringResult.packsNeeded).toBe(7);

        // Underlay: 12 × 1.05 = 12.6 m² → 1 × 15 m² roll
        const underlay = result.ancillaries.find(a => a.material === 'Underlay');
        expect(underlay).toBeDefined();
        expect(underlay!.packsNeeded).toBe(1);
        expect(underlay!.packSize).toBe(15);

        // Scotia: 14 × 1.10 = 15.4m → ceil(15.4 / 2.4) = 7
        const scotia = result.ancillaries.find(a => a.material === 'Scotia Beading');
        expect(scotia).toBeDefined();
        expect(scotia!.packsNeeded).toBe(7);

        // Threshold: 1 strip
        const threshold = result.ancillaries.find(a => a.material === 'Threshold Strip');
        expect(threshold).toBeDefined();
        expect(threshold!.packsNeeded).toBe(1);

        // No adhesive for engineered (floating)
        const adhesive = result.ancillaries.find(a => a.material === 'Flooring Adhesive');
        expect(adhesive).toBeUndefined();
    });
});

describe('calculateFlooringRoom — Scenario B: Large room, laminate', () => {
    it('returns correct packs, underlay, scotia, and thresholds', () => {
        const result = calculateFlooringRoom({
            room: { lengthM: 6, widthM: 5 },
            flooringType: 'laminate',
            coveragePerPackM2: 2.2,
            layingPattern: 'straight',
            doorwayCount: 2,
        });

        // Floor area = 6 × 5 = 30 m²
        expect(result.floorAreaM2).toBe(30);

        // Perimeter = 2 × (6 + 5) = 22m
        expect(result.perimeterM).toBe(22);

        // Packs: 30 × 1.05 / 2.2 = 31.5 / 2.2 = 14.32 → 15
        expect(result.flooringResult.packsNeeded).toBe(15);

        // Underlay present
        const underlay = result.ancillaries.find(a => a.material === 'Underlay');
        expect(underlay).toBeDefined();
        expect(underlay!.packsNeeded).toBeGreaterThanOrEqual(2);

        // Scotia: 22 × 1.10 = 24.2m → ceil(24.2 / 2.4) = 11
        const scotia = result.ancillaries.find(a => a.material === 'Scotia Beading');
        expect(scotia).toBeDefined();
        expect(scotia!.packsNeeded).toBe(11);

        // Thresholds: 2 strips
        const threshold = result.ancillaries.find(a => a.material === 'Threshold Strip');
        expect(threshold).toBeDefined();
        expect(threshold!.packsNeeded).toBe(2);
    });
});

describe('calculateFlooringRoom — Scenario C: Room, LVT', () => {
    it('returns correct packs, no underlay, no adhesive, scotia, threshold', () => {
        const result = calculateFlooringRoom({
            room: { lengthM: 4, widthM: 4 },
            flooringType: 'lvt',
            coveragePerPackM2: 3.0,
            layingPattern: 'brick-bond',
            doorwayCount: 1,
        });

        // Floor area = 4 × 4 = 16 m²
        expect(result.floorAreaM2).toBe(16);

        // Perimeter = 2 × (4 + 4) = 16m
        expect(result.perimeterM).toBe(16);

        // Packs: 16 × 1.10 / 3.0 = 17.6 / 3.0 = 5.87 → 6
        expect(result.flooringResult.packsNeeded).toBe(6);

        // NO underlay (LVT has integrated underlay)
        const underlay = result.ancillaries.find(a => a.material === 'Underlay');
        expect(underlay).toBeUndefined();

        // NO adhesive (LVT is click system)
        const adhesive = result.ancillaries.find(a => a.material === 'Flooring Adhesive');
        expect(adhesive).toBeUndefined();

        // Scotia: 16 × 1.10 = 17.6m → ceil(17.6 / 2.4) = 8
        const scotia = result.ancillaries.find(a => a.material === 'Scotia Beading');
        expect(scotia).toBeDefined();
        expect(scotia!.packsNeeded).toBe(8);

        // Threshold: 1 strip
        const threshold = result.ancillaries.find(a => a.material === 'Threshold Strip');
        expect(threshold).toBeDefined();
        expect(threshold!.packsNeeded).toBe(1);
    });
});

describe('calculateFlooringRoom — Scenario D: L-shaped room, solid wood glue-down', () => {
    it('returns correct packs, adhesive, no underlay, scotia, thresholds', () => {
        const result = calculateFlooringRoom({
            room: { lengthM: 5, widthM: 4, secondLengthM: 3, secondWidthM: 2 },
            flooringType: 'solid-wood',
            coveragePerPackM2: 1.5,
            layingPattern: 'herringbone',
            doorwayCount: 2,
            installMethod: 'glue-down',
        });

        // Floor area = (5 × 4) + (3 × 2) = 20 + 6 = 26 m²
        expect(result.floorAreaM2).toBe(26);

        // Packs: 26 × 1.15 / 1.5 = 29.9 / 1.5 = 19.93 → 20
        expect(result.flooringResult.packsNeeded).toBe(20);

        // NO underlay (glue-down)
        const underlay = result.ancillaries.find(a => a.material === 'Underlay');
        expect(underlay).toBeUndefined();

        // Adhesive: 26 / 5 = 5.2L → bucket(s)
        const adhesive = result.ancillaries.find(a => a.material === 'Flooring Adhesive');
        expect(adhesive).toBeDefined();
        expect(adhesive!.quantityNeeded).toBeCloseTo(5.2, 6);

        // Thresholds: 2 strips
        const threshold = result.ancillaries.find(a => a.material === 'Threshold Strip');
        expect(threshold).toBeDefined();
        expect(threshold!.packsNeeded).toBe(2);

        // Warning about L-shaped room
        expect(result.warnings.length).toBeGreaterThanOrEqual(1);
        expect(result.warnings.some(w => w.toLowerCase().includes('l-shaped'))).toBe(true);
    });
});

describe('calculateFlooringRoom — defaults', () => {
    it('solid-wood floating defaults to underlay=true, adhesive=false', () => {
        const result = calculateFlooringRoom({
            room: { lengthM: 4, widthM: 3 },
            flooringType: 'solid-wood',
            coveragePerPackM2: 1.5,
        });

        const underlay = result.ancillaries.find(a => a.material === 'Underlay');
        expect(underlay).toBeDefined();

        const adhesive = result.ancillaries.find(a => a.material === 'Flooring Adhesive');
        expect(adhesive).toBeUndefined();
    });

    it('doorwayCount defaults to 1', () => {
        const result = calculateFlooringRoom({
            room: { lengthM: 4, widthM: 3 },
            flooringType: 'engineered',
            coveragePerPackM2: 2.13,
        });

        const threshold = result.ancillaries.find(a => a.material === 'Threshold Strip');
        expect(threshold).toBeDefined();
        expect(threshold!.packsNeeded).toBe(1);
    });

    it('totalMaterials merges flooring packs and ancillaries', () => {
        const result = calculateFlooringRoom({
            room: { lengthM: 4, widthM: 3 },
            flooringType: 'engineered',
            coveragePerPackM2: 2.13,
        });

        expect(result.totalMaterials.length).toBeGreaterThanOrEqual(1);
        const flooringEntry = result.totalMaterials.find(m => m.material === 'Flooring');
        expect(flooringEntry).toBeDefined();
        expect(flooringEntry!.quantity).toBe(result.flooringResult.packsNeeded);
    });
});
