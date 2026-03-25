import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FlooringProjectWizard from '../FlooringProjectWizard';

test('renders wizard with room dimensions step', () => {
    render(<FlooringProjectWizard />);
    expect(screen.getByText('Step 1 of 4 — Room dimensions')).toBeInTheDocument();
});
