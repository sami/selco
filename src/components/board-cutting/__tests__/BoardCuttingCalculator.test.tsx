import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BoardCuttingCalculator } from '../BoardCuttingCalculator';
import { SIGN_OFF_STATEMENT } from '../cutting-terms';

const printButton = () => screen.getByRole('button', { name: 'Print cutting sheet' });
const printSheet = () => screen.getByRole('region', { name: 'Printable cutting sheet' });
/** The print-only paragraph shown instead of the sheet: the copy of the reason that isn't the button's description. */
const printFallback = (reason: string) =>
  screen.getAllByText(reason).find((el) => el.id !== printButton().getAttribute('aria-describedby'));
const threeRows = [
  { w: '800', h: '600', qty: '1' },
  { w: '400', h: '300', qty: '1' },
  { w: '900', h: '600', qty: '1' },
];

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
    expect(printButton()).toHaveAccessibleDescription('Add at least one piece before printing.');
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
    expect(printButton()).toHaveAccessibleDescription('Fix the highlighted pieces before printing.');
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

  it('stamps the current time before the print button opens the dialog', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 8, 14, 21, 50));
    render(<BoardCuttingCalculator initialRows={[{ w: '800', h: '600', qty: '2' }]} />);

    vi.setSystemTime(new Date(2026, 8, 14, 21, 55));
    let stampedWhenPrinted = false;
    vi.spyOn(window, 'print').mockImplementation(() => {
      stampedWhenPrinted = within(printSheet()).queryByText('14/09/2026, 21:55') !== null;
    });
    fireEvent.click(printButton());

    expect(stampedWhenPrinted).toBe(true);
  });

  it('stamps the current time synchronously when the browser print shortcut is used', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 8, 14, 21, 50));
    render(<BoardCuttingCalculator initialRows={[{ w: '800', h: '600', qty: '2' }]} />);

    vi.setSystemTime(new Date(2026, 8, 14, 21, 55));
    const env = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean };
    const previous = env.IS_REACT_ACT_ENVIRONMENT;
    let stamped = false;
    try {
      env.IS_REACT_ACT_ENVIRONMENT = false;
      window.dispatchEvent(new Event('beforeprint'));
      stamped = within(printSheet()).queryByText('14/09/2026, 21:55') !== null;
    } finally {
      env.IS_REACT_ACT_ENVIRONMENT = previous;
    }

    expect(stamped).toBe(true);
  });

  it('moves focus to the remove button of the row that takes the place of the removed row', () => {
    render(<BoardCuttingCalculator initialRows={threeRows} />);

    fireEvent.click(screen.getByRole('button', { name: 'Remove piece B' }));
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Remove piece B' }));
    expect(screen.getByLabelText('Width of piece B')).toHaveValue(900);

    fireEvent.click(screen.getByRole('button', { name: 'Remove piece B' }));
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Remove piece A' }));
  });

  it('replaces the only row with a fresh blank row and focuses its width', () => {
    render(<BoardCuttingCalculator initialRows={[{ w: '800', h: '600', qty: '3' }]} />);

    fireEvent.click(screen.getByRole('button', { name: 'Remove piece A' }));
    expect(screen.getAllByLabelText(/^width of/i)).toHaveLength(1);
    const width = screen.getByLabelText('Width of new piece');
    expect(width).toHaveValue(null);
    expect(screen.getByLabelText('Height of new piece')).toHaveValue(null);
    expect(screen.getByLabelText('Quantity of new piece')).toHaveValue(1);
    expect(document.activeElement).toBe(width);
  });

  it('waits for both sizes or a blur before showing a row error', () => {
    render(<BoardCuttingCalculator />);
    fireEvent.change(screen.getByLabelText('Width of new piece'), { target: { value: '800' } });

    expect(screen.queryByText('Enter a width and height in whole mm above 0')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Width of piece A')).toHaveAttribute('aria-invalid', 'false');
    expect(printButton()).toBeDisabled();
    expect(printButton()).toHaveAccessibleDescription('Finish entering the pieces before printing.');

    fireEvent.blur(screen.getByLabelText('Width of piece A'));
    expect(screen.getByText('Enter a width and height in whole mm above 0')).toBeInTheDocument();
    expect(printButton()).toHaveAccessibleDescription('Fix the highlighted pieces before printing.');
  });

  it('marks only the quantity input for a quantity error', () => {
    render(<BoardCuttingCalculator initialRows={[{ w: '500', h: '500', qty: '0' }]} />);

    expect(screen.getByLabelText('Quantity of piece A')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Width of piece A')).toHaveAttribute('aria-invalid', 'false');
    expect(screen.getByLabelText('Height of piece A')).toHaveAttribute('aria-invalid', 'false');
  });

  it('announces row errors and the print status politely', () => {
    render(<BoardCuttingCalculator initialRows={[{ w: '500', h: '500', qty: '0' }]} />);

    expect(screen.getByText('Quantity must be a whole number from 1 to 50')).toHaveAttribute('aria-live', 'polite');
    const statusId = printButton().getAttribute('aria-describedby');
    expect(document.getElementById(statusId ?? '')).toHaveAttribute('aria-live', 'polite');
  });

  it('only renders up to the maximum number of pieces it can plan', () => {
    const rows = Array.from({ length: 27 }, () => ({ w: '600', h: '300', qty: '1' }));
    render(<BoardCuttingCalculator initialRows={rows} />);
    expect(screen.getAllByLabelText(/^width of/i)).toHaveLength(26);
  });

  it('counts a size the browser could not read as entered and flags it', () => {
    render(<BoardCuttingCalculator initialRows={[{ w: '500', h: '', qty: '1' }]} />);
    const width = screen.getByLabelText('Width of piece A');
    Object.defineProperty(width, 'validity', { value: { badInput: true }, configurable: true });
    fireEvent.change(width, { target: { value: '' } });

    expect(printButton()).toHaveAccessibleDescription('Finish entering the pieces before printing.');
    fireEvent.blur(screen.getByLabelText('Width of piece A'));
    expect(screen.getByText('Enter a width and height in whole mm above 0')).toBeInTheDocument();
    expect(screen.getByLabelText('Width of piece A')).toHaveAttribute('aria-invalid', 'true');
    expect(printButton()).toBeDisabled();
  });

  it('flags a quantity the browser could not read', () => {
    render(<BoardCuttingCalculator initialRows={[{ w: '500', h: '300', qty: '1' }]} />);
    const qty = screen.getByLabelText('Quantity of piece A');
    Object.defineProperty(qty, 'validity', { value: { badInput: true }, configurable: true });
    fireEvent.change(qty, { target: { value: '' } });

    expect(screen.getByText('Quantity must be a whole number from 1 to 50')).toBeInTheDocument();
    expect(qty).toHaveAttribute('aria-invalid', 'true');
    expect(printButton()).toBeDisabled();
  });

  it('names each piece once in the drawing label', () => {
    render(<BoardCuttingCalculator initialRows={[{ w: '800', h: '600', qty: '3' }]} />);
    expect(screen.getAllByRole('img', { name: 'Sheet 1: pieces A' })).toHaveLength(2);
  });

  it('re-letters the cut list after removing a piece', () => {
    render(<BoardCuttingCalculator initialRows={threeRows} />);
    expect(within(printSheet()).getByText(/below the saw's/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Remove piece B' }));
    const rows = within(printSheet()).getAllByRole('row').slice(1);
    expect(rows.map((r) => r.querySelector('td')?.textContent)).toEqual(['A', 'B']);
    expect(within(rows[1]).getByText('900 × 600')).toBeInTheDocument();
    expect(screen.getByLabelText('Width of piece B')).toHaveValue(900);
    expect(within(printSheet()).queryByText(/below the saw's/)).not.toBeInTheDocument();
  });

  it('flags a sheet piece that is too big once the board type is switched to worktop', () => {
    render(<BoardCuttingCalculator initialRows={[{ w: '800', h: '600', qty: '1' }]} />);
    fireEvent.change(screen.getByLabelText('Board type'), { target: { value: 'worktop' } });

    expect(screen.getByLabelText('Width of piece A')).toHaveAccessibleDescription('Too big for this board');
    expect(printButton()).toBeDisabled();
    expect(screen.queryByRole('region', { name: 'Printable cutting sheet' })).not.toBeInTheDocument();
  });

  it('only fits a wide piece while it may be turned', () => {
    render(<BoardCuttingCalculator initialRows={[{ w: '1300', h: '1000', qty: '1' }]} />);
    expect(printSheet()).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Pieces may be turned to fit'));
    expect(screen.getByLabelText('Width of piece A')).toHaveAccessibleDescription('Too big for this board');
    expect(printButton()).toBeDisabled();

    fireEvent.click(screen.getByLabelText('Pieces may be turned to fit'));
    expect(screen.getByLabelText('Width of piece A')).toHaveAttribute('aria-invalid', 'false');
    expect(printSheet()).toBeInTheDocument();
  });

  it('prints the blocked reason instead of the sheet', () => {
    render(<BoardCuttingCalculator initialRows={[{ w: '1300', h: '2500', qty: '1' }]} />);

    expect(printFallback('Fix the highlighted pieces before printing.')).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Printable cutting sheet' })).not.toBeInTheDocument();
  });

  it('keeps a row untouched while moving between its own inputs', () => {
    render(<BoardCuttingCalculator initialRows={[{ w: '800', h: '', qty: '1' }]} />);
    const width = screen.getByLabelText('Width of piece A');
    const height = screen.getByLabelText('Height of piece A');

    fireEvent.blur(width, { relatedTarget: height });
    expect(screen.queryByText('Enter a width and height in whole mm above 0')).not.toBeInTheDocument();
    expect(printButton()).toHaveAccessibleDescription('Finish entering the pieces before printing.');

    fireEvent.blur(height, { relatedTarget: document.body });
    expect(screen.getByText('Enter a width and height in whole mm above 0')).toBeInTheDocument();
    expect(printButton()).toHaveAccessibleDescription('Fix the highlighted pieces before printing.');
  });

  it('renders the same HTML, row ids included, on every server render', () => {
    expect(renderToString(<BoardCuttingCalculator />)).toBe(renderToString(<BoardCuttingCalculator />));
  });

  it('records unreadable text typed into an empty size', () => {
    render(<BoardCuttingCalculator />);
    const width = screen.getByLabelText('Width of new piece');
    Object.defineProperty(width, 'validity', { value: { badInput: true }, configurable: true });
    fireEvent.input(width, { target: { value: '' } });

    fireEvent.blur(screen.getByLabelText('Width of piece A'), { relatedTarget: document.body });
    expect(screen.getByText('Enter a width and height in whole mm above 0')).toBeInTheDocument();
    expect(printButton()).toBeDisabled();
  });

  it('forgets unreadable text once the size is cleared', () => {
    render(<BoardCuttingCalculator />);
    const width = screen.getByLabelText('Width of new piece');
    Object.defineProperty(width, 'validity', { value: { badInput: true }, configurable: true });
    fireEvent.input(width, { target: { value: '' } });
    expect(screen.getByLabelText('Width of piece A')).toBe(width);

    Object.defineProperty(width, 'validity', { value: { badInput: false }, configurable: true });
    fireEvent.input(width, { target: { value: '' } });
    expect(screen.getByLabelText('Width of new piece')).toBe(width);
    expect(printButton()).toHaveAccessibleDescription('Add at least one piece before printing.');
  });

  it('ignores a row with no sizes even when its quantity is unreadable', () => {
    render(<BoardCuttingCalculator />);
    const qty = screen.getByLabelText('Quantity of new piece');
    Object.defineProperty(qty, 'validity', { value: { badInput: true }, configurable: true });
    fireEvent.change(qty, { target: { value: '' } });

    expect(screen.getByLabelText('Width of new piece')).toBeInTheDocument();
    expect(printButton()).toHaveAccessibleDescription('Add at least one piece before printing.');
  });

  it('keeps flagging a piece too big for the board while another piece is being typed', () => {
    render(<BoardCuttingCalculator initialRows={[{ w: '1300', h: '2500', qty: '1' }, { w: '800', h: '', qty: '1' }]} />);

    expect(screen.getByLabelText('Width of piece A')).toHaveAccessibleDescription('Too big for this board');
    expect(printButton()).toHaveAccessibleDescription('Fix the highlighted pieces before printing.');
  });
});
