import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MasonryProjectWizard from '../MasonryProjectWizard';

test('renders wizard with wall dimensions step', () => {
    render(<MasonryProjectWizard />);
    expect(screen.getByText('Step 1 of 5 — Wall dimensions')).toBeInTheDocument();
});
