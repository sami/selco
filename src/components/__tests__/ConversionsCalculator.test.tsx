import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ConversionsCalculator from '../ConversionsCalculator';

test('renders unit converter with value input and unit selects', () => {
    render(<ConversionsCalculator />);
    expect(screen.getByText('Unit Converter')).toBeInTheDocument();
    expect(screen.getByLabelText(/value/i)).toBeInTheDocument();
});
