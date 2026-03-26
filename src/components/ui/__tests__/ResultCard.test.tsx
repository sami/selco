import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResultCard } from '../ResultCard';
import type { MaterialQuantity } from '../../../types';

test('renders the title', () => {
    render(<ResultCard title="Tile Results" materials={[]} />);
    expect(screen.getByText('Tile Results')).toBeInTheDocument();
});

test('renders MaterialsList with provided materials', () => {
    const materials: MaterialQuantity[] = [
        { material: 'Tiles', quantity: 10, unit: 'packs' },
    ];
    render(<ResultCard title="Results" materials={materials} />);
    expect(screen.getByText('Tiles')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
});

test('renders all warning messages when provided', () => {
    render(
        <ResultCard title="Results" materials={[]} warnings={['Check substrate', 'Allow extra wastage']} />
    );
    expect(screen.getByText('Check substrate')).toBeInTheDocument();
    expect(screen.getByText('Allow extra wastage')).toBeInTheDocument();
});

test('does not render warnings section when warnings prop omitted', () => {
    render(<ResultCard title="Results" materials={[]} />);
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
});

test('renders children when provided', () => {
    render(
        <ResultCard title="Results" materials={[]}>
            <span>Extra content</span>
        </ResultCard>
    );
    expect(screen.getByText('Extra content')).toBeInTheDocument();
});

test('uses the card CSS class on the container', () => {
    const { container } = render(<ResultCard title="Results" materials={[]} />);
    expect(container.firstChild).toHaveClass('card');
});
