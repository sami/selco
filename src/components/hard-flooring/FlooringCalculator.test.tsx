import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FlooringCalculator } from './FlooringCalculator';

const choose = (label: RegExp, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });

function fillAndCalculate({ width, length }: { width: string; length: string }) {
  choose(/room width/i, width);
  choose(/room length/i, length);
  fireEvent.click(screen.getByRole('button', { name: /calculate/i }));
}

const row = (name: string) => screen.getAllByRole('row').find((r) => r.textContent?.includes(name));

describe('FlooringCalculator', () => {
  beforeEach(() => {
    render(<FlooringCalculator />);
  });

  it('renders with sensible defaults: 8 mm laminate, floating, foam underlay, one doorway', () => {
    expect(screen.getByLabelText(/floor type/i)).toHaveValue('laminate8');
    expect(screen.getByLabelText(/floating/i)).toBeChecked();
    expect(screen.getByLabelText(/underlay/i)).toHaveValue('foam');
    expect(screen.getByLabelText(/doorways/i)).toHaveValue(1);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('calculates a 3.5m × 4.5m room: 17.01 m² to buy with underlay and beading', () => {
    fillAndCalculate({ width: '3.5', length: '4.5' });

    const card = screen.getByRole('heading', { name: /flooring to buy/i }).parentElement;
    expect(card).toHaveTextContent('17.01m²');
    expect(row('White foam flooring underlay')).toHaveTextContent('16.54');
    expect(row('scotia beading')).toHaveTextContent('7');
  });

  describe('glue-down is only offered where the trade allows it', () => {
    it('cannot be selected for laminate', () => {
      expect(screen.getByLabelText(/glued/i)).toBeDisabled();
    });

    it('can be selected for engineered wood, which then drops the underlay and adds adhesive', () => {
      choose(/floor type/i, 'engineered');
      const glued = screen.getByLabelText(/glued/i);
      expect(glued).toBeEnabled();

      fireEvent.click(glued);
      expect(screen.queryByLabelText(/underlay/i)).not.toBeInTheDocument();

      fillAndCalculate({ width: '3.5', length: '4.5' });
      expect(row('wood floor adhesive')).toBeDefined();
    });

    it('switching a glued wood floor to laminate puts it back to floating, visibly', () => {
      choose(/floor type/i, 'engineered');
      fireEvent.click(screen.getByLabelText(/glued/i));
      choose(/floor type/i, 'laminate12');

      expect(screen.getByLabelText(/floating/i)).toBeChecked();
      expect(screen.getByLabelText(/glued/i)).toBeDisabled();
      expect(screen.getByLabelText(/underlay/i)).toBeInTheDocument();
    });
  });

  it('shows the concrete-subfloor vapour-barrier warning with the results', () => {
    fireEvent.click(screen.getByLabelText(/concrete subfloor/i));
    fillAndCalculate({ width: '3.5', length: '4.5' });

    expect(screen.getByText(/vapour/i, { selector: 'li' })).toBeInTheDocument();
  });

  it('surfaces validation errors in the live region with no stale results', () => {
    fillAndCalculate({ width: '0', length: '4.5' });

    const message = screen.getByText('Room dimensions must be positive');
    expect(message.closest('[aria-live="assertive"]')).not.toBeNull();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('copies a plain-English materials list', () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });

    fillAndCalculate({ width: '3.5', length: '4.5' });
    fireEvent.click(screen.getByRole('button', { name: /copy list/i }));

    const copied = writeText.mock.calls[0][0] as string;
    expect(copied).toContain('Hard flooring — 3.5m × 4.5m');
    expect(copied).toContain('- White foam flooring underlay: 16.54 × m²');
  });
});
