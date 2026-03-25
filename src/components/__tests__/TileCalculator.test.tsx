import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TileCalculator from '../TileCalculator';

test('renders tile calculator with title and form', () => {
    render(<TileCalculator />);
    expect(screen.getByText('Tile Calculator')).toBeInTheDocument();
    expect(screen.getByLabelText(/width/i)).toBeInTheDocument();
});
