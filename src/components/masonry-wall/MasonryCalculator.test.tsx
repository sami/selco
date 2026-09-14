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

    expect(screen.getByText('670')).toBeInTheDocument();
    expect(screen.getAllByText(/bricks/i).length).toBeGreaterThan(0);

    const rows = screen.getAllByRole('row');
    const row = (name: string) => rows.find((r) => r.textContent?.includes(name));
    expect(row('Blue Circle OPC')).toHaveTextContent('725kg bags');
    expect(row('Building Sand Jumbo Bag')).toHaveTextContent('1');
    expect(row('Type 4 Light Duty Wall Tie 200mm')).toHaveTextContent('boxes of 50');
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
    expect(copied).toContain('- 670 bricks');
    expect(copied).toContain('- Blue Circle OPC: 7 × 25kg bags');
    expect(copied).toContain('- Building Sand Jumbo Bag: 1 × 875kg bags');
    expect(copied).toContain('- Type 4 Light Duty Wall Tie 200mm: 1 × boxes of 50');
  });
});
