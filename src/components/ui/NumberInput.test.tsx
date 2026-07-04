import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { NumberInput } from './NumberInput';

describe('NumberInput', () => {
  it('renders correctly', () => {
    render(<NumberInput aria-label="Test Input" />);
    const input = screen.getByLabelText('Test Input');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'number');
    expect(input).toHaveAttribute('inputmode', 'decimal');
  });

  it('renders unit suffix when provided', () => {
    render(<NumberInput aria-label="Test Input" unit="m²" />);
    const input = screen.getByLabelText('Test Input');
    expect(input).toBeInTheDocument();
    
    const unit = screen.getByText('m²');
    expect(unit).toBeInTheDocument();
  });

  it('handles disabled state', () => {
    render(<NumberInput aria-label="Test Input" disabled />);
    const input = screen.getByLabelText('Test Input');
    expect(input).toBeDisabled();
  });

  it('accepts min and step props', () => {
    render(<NumberInput aria-label="Test Input" min={0} step={0.5} />);
    const input = screen.getByLabelText('Test Input');
    expect(input).toHaveAttribute('min', '0');
    expect(input).toHaveAttribute('step', '0.5');
  });
});
