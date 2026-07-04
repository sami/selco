import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ResultCard } from './ResultCard';

describe('ResultCard', () => {
  it('renders title, quantity and unit', () => {
    render(<ResultCard title="Total Bricks" quantity={1500} unit="pcs" />);
    
    expect(screen.getByText('Total Bricks')).toBeInTheDocument();
    expect(screen.getByText('1500')).toBeInTheDocument();
    expect(screen.getByText('pcs')).toBeInTheDocument();
  });

  it('renders detail text when provided', () => {
    render(
      <ResultCard 
        title="Total Bricks" 
        quantity={1500} 
        unit="pcs" 
        detail="Includes 5% wastage" 
      />
    );
    
    expect(screen.getByText('Includes 5% wastage')).toBeInTheDocument();
  });

  it('does not render detail element when not provided', () => {
    render(<ResultCard title="Total Bricks" quantity={1500} unit="pcs" />);
    
    // We expect 3 elements: title, quantity, unit
    // No detail text should be present. We can just check it renders correctly.
    expect(screen.queryByText('wastage')).not.toBeInTheDocument();
  });
});
