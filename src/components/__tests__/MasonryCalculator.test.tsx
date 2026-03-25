import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MasonryCalculator from '../MasonryCalculator';

test('renders masonry calculator with title and form', () => {
    render(<MasonryCalculator />);
    expect(screen.getByText('Masonry Calculator')).toBeInTheDocument();
    expect(screen.getByLabelText(/Type of wall/i)).toBeInTheDocument();
});

test('renders wall dimension inputs', () => {
    render(<MasonryCalculator />);
    expect(screen.getByLabelText(/Length \(Wall 1\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Height \(Wall 1\)/i)).toBeInTheDocument();
});

test('renders mortar and waste fields', () => {
    render(<MasonryCalculator />);
    expect(screen.getByLabelText(/Mortar mix ratio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Unit waste/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mortar waste/i)).toBeInTheDocument();
});
