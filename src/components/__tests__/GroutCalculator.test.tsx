import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import GroutCalculator from '../GroutCalculator';

test('renders grout calculator with title and product select', () => {
    render(<GroutCalculator />);
    expect(screen.getByText('Grout Calculator')).toBeInTheDocument();
    expect(screen.getByLabelText(/grout product/i)).toBeInTheDocument();
});

test('renders area input field', () => {
    render(<GroutCalculator />);
    expect(screen.getByLabelText(/total area/i)).toBeInTheDocument();
});

test('renders tile dimension inputs', () => {
    render(<GroutCalculator />);
    expect(screen.getByLabelText(/tile width/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tile height/i)).toBeInTheDocument();
});

test('renders joint width select and tile thickness input', () => {
    render(<GroutCalculator />);
    expect(screen.getByLabelText(/joint width/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tile thickness/i)).toBeInTheDocument();
});
