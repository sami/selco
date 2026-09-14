import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BoardCuttingCalculator } from '../BoardCuttingCalculator';
import { SIGN_OFF_STATEMENT } from '../cutting-terms';

const printButton = () => screen.getByRole('button', { name: 'Print cutting sheet' });
const printSheet = () => screen.getByRole('region', { name: 'Printable cutting sheet' });

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('BoardCuttingCalculator', () => {
  it('starts with one blank piece, no plan and printing disabled', () => {
    render(<BoardCuttingCalculator />);
    expect(screen.getAllByLabelText(/^width of/i)).toHaveLength(1);
    expect(screen.queryByRole('region', { name: 'Cutting plan' })).not.toBeInTheDocument();
    expect(printButton()).toBeDisabled();
    expect(screen.getByText('Add at least one piece before printing.')).toBeInTheDocument();
  });

  it('draws the plan and enables printing once a piece is entered', () => {
    render(<BoardCuttingCalculator />);
    fireEvent.change(screen.getByLabelText('Width of new piece'), { target: { value: '800' } });
    fireEvent.change(screen.getByLabelText('Height of piece A'), { target: { value: '600' } });

    expect(screen.getByRole('region', { name: 'Cutting plan' })).toBeInTheDocument();
    expect(printButton()).toBeEnabled();
  });

  it('adds and removes pieces', () => {
    render(<BoardCuttingCalculator />);
    fireEvent.click(screen.getByRole('button', { name: 'Add another piece' }));
    expect(screen.getAllByLabelText(/^width of/i)).toHaveLength(2);

    fireEvent.click(screen.getAllByRole('button', { name: /^remove/i })[0]);
    expect(screen.getAllByLabelText(/^width of/i)).toHaveLength(1);
  });

  it('flags a piece too big for the board and blocks printing', () => {
    render(<BoardCuttingCalculator initialRows={[{ w: '1300', h: '2500', qty: '1' }]} />);

    expect(screen.getByLabelText('Width of piece A')).toHaveAttribute('aria-invalid', 'true');
    expect(printButton()).toBeDisabled();
    expect(screen.getByText('Fix the highlighted pieces before printing.')).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Printable cutting sheet' })).not.toBeInTheDocument();
  });

  it('shows a row error for a bad quantity and hides the plan', () => {
    render(<BoardCuttingCalculator initialRows={[{ w: '500', h: '500', qty: '0' }]} />);

    expect(screen.getByText('Quantity must be a whole number from 1 to 50')).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Cutting plan' })).not.toBeInTheDocument();
    expect(printButton()).toBeDisabled();
  });

  it('hides the rotation option for worktops, which only cut to length', () => {
    render(<BoardCuttingCalculator />);
    expect(screen.getByLabelText('Pieces may be turned to fit')).toBeChecked();

    fireEvent.change(screen.getByLabelText('Board type'), { target: { value: 'worktop' } });
    expect(screen.queryByLabelText('Pieces may be turned to fit')).not.toBeInTheDocument();
  });

  it('opens the print dialog from the print button', () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => {});
    render(<BoardCuttingCalculator initialRows={[{ w: '800', h: '600', qty: '2' }]} />);

    fireEvent.click(printButton());
    expect(print).toHaveBeenCalledTimes(1);
  });

  it('stamps the printed date and time when the print dialog opens', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 8, 14, 21, 50));
    render(<BoardCuttingCalculator initialRows={[{ w: '800', h: '600', qty: '2' }]} />);
    expect(within(printSheet()).getByText('14/09/2026, 21:50')).toBeInTheDocument();

    vi.setSystemTime(new Date(2026, 8, 14, 21, 55));
    act(() => {
      window.dispatchEvent(new Event('beforeprint'));
    });
    expect(within(printSheet()).getByText('14/09/2026, 21:55')).toBeInTheDocument();
  });

  it('shows the same terms on screen as on the printed sheet', () => {
    render(<BoardCuttingCalculator initialRows={[{ w: '800', h: '600', qty: '2' }]} />);
    const onScreen = within(screen.getByRole('region', { name: 'Terms the customer signs' }))
      .getAllByRole('listitem')
      .map((li) => li.textContent);
    const printed = within(printSheet()).getAllByRole('listitem').map((li) => li.textContent);

    expect(onScreen).toHaveLength(9);
    expect(printed).toEqual(onScreen);
    expect(onScreen.some((t) => t?.includes('up to 3 mm over or under'))).toBe(true);
  });

  it('prints the cut list letters, the trim term and a signature block', () => {
    render(<BoardCuttingCalculator initialRows={[{ w: '800', h: '600', qty: '2' }, { w: '400', h: '300', qty: '1' }]} />);
    const sheet = within(printSheet());

    const rows = sheet.getAllByRole('row').slice(1);
    expect(rows.map((r) => r.querySelector('td')?.textContent)).toEqual(['A', 'B']);
    expect(sheet.getByText(/Piece B is below the saw's 500 × 230 mm minimum/)).toBeInTheDocument();
    expect(sheet.getByText(SIGN_OFF_STATEMENT)).toBeInTheDocument();
    expect(sheet.getByText(/Customer signature/)).toBeInTheDocument();
    expect(sheet.getByText(/Date and time signed/)).toBeInTheDocument();
  });

  it('explains which way width and height run for each board type', () => {
    render(<BoardCuttingCalculator />);
    expect(screen.getByText('Width runs across the 1220 mm side and height along the 2440 mm side, as drawn.')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Board type'), { target: { value: 'worktop' } });
    expect(screen.getByText('Width is the depth across the worktop, up to 600 mm, and height is the length.')).toBeInTheDocument();
  });

  it('only accepts whole millimetres and quantities up to the maximum', () => {
    render(<BoardCuttingCalculator />);
    expect(screen.getByLabelText('Width of new piece')).toHaveAttribute('step', '1');
    expect(screen.getByLabelText('Height of new piece')).toHaveAttribute('step', '1');
    expect(screen.getByLabelText('Quantity of new piece')).toHaveAttribute('max', '50');
  });

  it('shows the engine error for part millimetres', () => {
    render(<BoardCuttingCalculator initialRows={[{ w: '405.5', h: '300', qty: '1' }]} />);
    expect(screen.getByText('Enter a width and height in whole mm above 0')).toBeInTheDocument();
    expect(printButton()).toBeDisabled();
  });
});
