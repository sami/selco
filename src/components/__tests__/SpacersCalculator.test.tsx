import { test, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SpacersCalculator from '../SpacersCalculator';

/** Helper: submit the calculator form by clicking the Calculate button */
function submitForm() {
    const btn = screen.getByText('Calculate');
    const form = btn.closest('form')!;
    fireEvent.submit(form);
}

test('renders calculator title and description', () => {
    render(<SpacersCalculator />);
    expect(screen.getByText('Spacers Calculator')).toBeInTheDocument();
    expect(screen.getByText('Calculate how many tile spacers you need for your project.')).toBeInTheDocument();
});

test('renders area, tile width, tile height, wastage, and pack size number inputs', () => {
    render(<SpacersCalculator />);
    expect(screen.getByLabelText(/Total area/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tile width/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tile height/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Wastage allowance/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Pack size/)).toBeInTheDocument();
});

test('renders spacer size and layout pattern selects', () => {
    render(<SpacersCalculator />);
    expect(screen.getByLabelText('Spacer size')).toBeInTheDocument();
    expect(screen.getByLabelText('Layout pattern')).toBeInTheDocument();
});

test('shows validation error when area is empty and calculate is clicked', () => {
    render(<SpacersCalculator />);
    submitForm();
    expect(screen.getByText(/Total area must be a valid number/)).toBeInTheDocument();
});

test('displays ResultCard with materials after valid calculation', () => {
    render(<SpacersCalculator />);

    // Fill in a valid area (10 m²), tile defaults are 300×300 mm
    fireEvent.change(screen.getByLabelText(/Total area/), { target: { value: '10' } });
    submitForm();

    // ResultCard should appear with title "Spacers"
    expect(screen.getByText('Spacers')).toBeInTheDocument();
    // Should show a material line for spacers (e.g. "3 mm tile spacers")
    expect(screen.getByText(/\d+ mm tile spacers/)).toBeInTheDocument();
});

test('reset clears the results', () => {
    render(<SpacersCalculator />);

    fireEvent.change(screen.getByLabelText(/Total area/), { target: { value: '10' } });
    submitForm();
    expect(screen.getByText('Spacers')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /reset/i }));
    expect(screen.queryByText('Spacers')).not.toBeInTheDocument();
});
