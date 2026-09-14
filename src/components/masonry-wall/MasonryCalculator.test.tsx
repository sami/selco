import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MasonryCalculator } from './MasonryCalculator';

/** Fill the form and submit. Values mirror the engine's own test fixtures. */
function fillAndCalculate({ length, height }: { length: string; height: string }) {
  fireEvent.change(screen.getByLabelText(/wall length/i), { target: { value: length } });
  fireEvent.change(screen.getByLabelText(/wall height/i), { target: { value: height } });
  fireEvent.click(screen.getByRole('button', { name: /calculate/i }));
}

describe('MasonryCalculator', () => {
  beforeEach(() => {
    render(<MasonryCalculator />);
  });

  it('renders the form with defaults (brick, 5% wastage)', () => {
    expect(screen.getByLabelText(/wall length/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/wall height/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/wall type/i)).toHaveValue('brick');
    expect(screen.getByLabelText(/wastage/i)).toHaveValue(5);
  });

  it('shows no results before the first calculation', () => {
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('calculates a brick wall: 5.0m × 2.5m → 670 bricks and pack-rounded materials', () => {
    fillAndCalculate({ length: '5', height: '2.5' });

    // Headline result card
    expect(screen.getByText('670')).toBeInTheDocument();
    expect(screen.getAllByText(/bricks/i).length).toBeGreaterThan(0);

    // Materials table parsed from the engine's pack-rounded strings
    const table = screen.getByRole('table');
    expect(table).toHaveTextContent('Blue Circle OPC');
    expect(table).toHaveTextContent('10');
    expect(table).toHaveTextContent('25kg bags');
    expect(table).toHaveTextContent('Building Sand Jumbo Bag');
    expect(table).toHaveTextContent('Type 4 Light Duty Wall Tie 200mm');
  });

  it('calculates a block wall: 4.0m × 2.4m → 101 blocks', () => {
    fireEvent.change(screen.getByLabelText(/wall type/i), { target: { value: 'block' } });
    fillAndCalculate({ length: '4', height: '2.4' });

    expect(screen.getByText('101')).toBeInTheDocument();
    expect(screen.getAllByText(/blocks/i).length).toBeGreaterThan(0);
  });

  it('surfaces the engine validation error in the aria-live region for negative dimensions', () => {
    fillAndCalculate({ length: '-1', height: '2.5' });

    const liveRegion = screen.getByText('Wall dimensions must be positive');
    expect(liveRegion).toBeInTheDocument();
    expect(liveRegion.closest('[aria-live="assertive"]')).not.toBeNull();
    // No stale results alongside the error
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('clears the error once a valid calculation succeeds', () => {
    fillAndCalculate({ length: '-1', height: '2.5' });
    expect(screen.getByText('Wall dimensions must be positive')).toBeInTheDocument();

    fillAndCalculate({ length: '5', height: '2.5' });
    expect(screen.queryByText('Wall dimensions must be positive')).not.toBeInTheDocument();
    expect(screen.getByText('670')).toBeInTheDocument();
  });

  it('copies a plain-English materials list to the clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });

    fillAndCalculate({ length: '5', height: '2.5' });
    fireEvent.click(screen.getByRole('button', { name: /copy list/i }));

    expect(writeText).toHaveBeenCalledTimes(1);
    const copied = writeText.mock.calls[0][0] as string;
    expect(copied).toContain('670 bricks');
    expect(copied).toContain('10 × 25kg bags of Blue Circle OPC');
    expect(copied).toContain('1 × Building Sand Jumbo Bag');
    expect(copied).toContain('1 × Type 4 Light Duty Wall Tie 200mm (Box of 250)');
  });
});
