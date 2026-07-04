import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FormField } from './FormField';

describe('FormField', () => {
  it('renders correctly with label', () => {
    render(
      <FormField id="test-input" label="Test Label">
        <input type="text" />
      </FormField>
    );
    
    const label = screen.getByText('Test Label');
    expect(label).toBeInTheDocument();
    
    const input = screen.getByLabelText('Test Label');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('id', 'test-input');
  });

  it('links helper text to input via aria-describedby', () => {
    render(
      <FormField id="test-input" label="Test Label" helperText="Helper description">
        <input type="text" />
      </FormField>
    );
    
    const input = screen.getByLabelText('Test Label');
    const helper = screen.getByText('Helper description');
    
    expect(helper).toHaveAttribute('id', 'test-input-helper');
    expect(input).toHaveAttribute('aria-describedby', 'test-input-helper');
  });

  it('links error text to input and marks invalid', () => {
    render(
      <FormField id="test-input" label="Test Label" error="Error message">
        <input type="text" />
      </FormField>
    );
    
    const input = screen.getByLabelText('Test Label');
    const error = screen.getByRole('alert');
    
    expect(error).toHaveTextContent('Error message');
    expect(error).toHaveAttribute('id', 'test-input-error');
    expect(input).toHaveAttribute('aria-describedby', 'test-input-error');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('applies required and disabled states to child input', () => {
    render(
      <FormField id="test-input" label="Test Label" required disabled>
        <input type="text" />
      </FormField>
    );
    
    const input = screen.getByLabelText('Test Label', { exact: false });
    expect(input).toBeRequired();
    expect(input).toBeDisabled();
  });
});
