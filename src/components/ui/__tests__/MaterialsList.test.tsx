import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MaterialsList } from '../MaterialsList';
import type { MaterialQuantity } from '../../../types';

test('renders table with Material, Quantity, Unit column headers', () => {
    render(<MaterialsList materials={[]} />);
    expect(screen.getByText('Material')).toBeInTheDocument();
    expect(screen.getByText('Quantity')).toBeInTheDocument();
    expect(screen.getByText('Unit')).toBeInTheDocument();
});

test('renders a row for each material entry', () => {
    const materials: MaterialQuantity[] = [
        { material: 'Tiles', quantity: 50, unit: 'packs' },
        { material: 'Adhesive', quantity: 20, unit: 'kg' },
    ];
    render(<MaterialsList materials={materials} />);
    expect(screen.getByText('Tiles')).toBeInTheDocument();
    expect(screen.getByText('Adhesive')).toBeInTheDocument();
});

test('displays quantity value in correct row', () => {
    const materials: MaterialQuantity[] = [
        { material: 'Grout', quantity: 3.5, unit: 'kg' },
    ];
    render(<MaterialsList materials={materials} />);
    expect(screen.getByText('3.5')).toBeInTheDocument();
    expect(screen.getByText('kg')).toBeInTheDocument();
});

test('renders an empty table body for empty materials array', () => {
    render(<MaterialsList materials={[]} />);
    const rows = screen.getAllByRole('row');
    // Only the header row present
    expect(rows).toHaveLength(1);
});

test('renders multiple rows when given multiple materials', () => {
    const materials: MaterialQuantity[] = [
        { material: 'Tiles', quantity: 10, unit: 'packs' },
        { material: 'Spacers', quantity: 200, unit: 'pieces' },
        { material: 'Grout', quantity: 5, unit: 'kg' },
    ];
    render(<MaterialsList materials={materials} />);
    const rows = screen.getAllByRole('row');
    // 1 header + 3 data rows
    expect(rows).toHaveLength(4);
});
