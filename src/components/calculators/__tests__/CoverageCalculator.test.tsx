import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CoverageCalculator from '../CoverageCalculator';

test('renders coverage calculator with area input and board presets', () => {
    render(<CoverageCalculator />);
    expect(screen.getByLabelText(/total area/i)).toBeInTheDocument();
    expect(screen.getByText(/plasterboard/i)).toBeInTheDocument();
});
