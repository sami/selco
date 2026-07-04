import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MaterialsList } from './MaterialsList';

describe('MaterialsList', () => {
  it('renders semantic table with correct headers', () => {
    const items = [
      { id: '1', name: 'Bricks', quantity: 500, unit: 'pcs' },
    ];
    
    render(<MaterialsList items={items} />);
    
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(3);
    expect(headers[0]).toHaveTextContent('Material');
    expect(headers[1]).toHaveTextContent('Quantity');
    expect(headers[2]).toHaveTextContent('Unit');
  });

  it('renders correct data rows', () => {
    const items = [
      { id: '1', name: 'Bricks', quantity: 500, unit: 'pcs' },
      { id: '2', name: 'Sand', quantity: 1.5, unit: 'bulk bags' },
    ];
    
    render(<MaterialsList items={items} />);
    
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(3); // 1 header row + 2 data rows
    
    const firstDataRow = rows[1];
    expect(within(firstDataRow).getByText('Bricks')).toBeInTheDocument();
    expect(within(firstDataRow).getByText('500')).toBeInTheDocument();
    expect(within(firstDataRow).getByText('pcs')).toBeInTheDocument();
  });

  it('returns null when items array is empty', () => {
    const { container } = render(<MaterialsList items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
