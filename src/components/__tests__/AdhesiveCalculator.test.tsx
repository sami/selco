import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdhesiveCalculator from '../AdhesiveCalculator';

test('renders adhesive calculator with title and product select', () => {
    render(<AdhesiveCalculator />);
    expect(screen.getByText('Adhesive Calculator')).toBeInTheDocument();
    expect(screen.getByLabelText(/adhesive product/i)).toBeInTheDocument();
});
