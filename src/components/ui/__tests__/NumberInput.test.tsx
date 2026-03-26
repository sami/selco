import { test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NumberInput } from '../NumberInput';

test('renders label and number input', () => {
    render(<NumberInput id="area" label="Area" value="10" onChange={() => {}} />);
    expect(screen.getByLabelText('Area')).toBeInTheDocument();
    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
});

test('shows unit suffix when unit prop provided', () => {
    render(<NumberInput id="area" label="Area" value="10" onChange={() => {}} unit="m²" />);
    expect(screen.getByText('m²')).toBeInTheDocument();
});

test('does not render unit element when unit prop omitted', () => {
    render(<NumberInput id="area" label="Area" value="10" onChange={() => {}} />);
    expect(screen.queryByTestId('unit-suffix')).not.toBeInTheDocument();
});

test('calls onChange with string value when value changes', () => {
    const onChange = vi.fn();
    render(<NumberInput id="area" label="Area" value="10" onChange={onChange} />);
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '20' } });
    expect(onChange).toHaveBeenCalledWith('20');
});

test('shows error message when error prop provided', () => {
    render(<NumberInput id="area" label="Area" value="0" onChange={() => {}} error="Must be positive" />);
    expect(screen.getByText('Must be positive')).toBeInTheDocument();
});

test('shows helper text when helperText prop provided', () => {
    render(<NumberInput id="area" label="Area" value="0" onChange={() => {}} helperText="Enter room area" />);
    expect(screen.getByText('Enter room area')).toBeInTheDocument();
});

test('passes min, max, and step attributes to input', () => {
    render(<NumberInput id="area" label="Area" value="10" onChange={() => {}} min={0} max={100} step={0.5} />);
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('min', '0');
    expect(input).toHaveAttribute('max', '100');
    expect(input).toHaveAttribute('step', '0.5');
});

test('input is disabled when disabled prop is true', () => {
    render(<NumberInput id="area" label="Area" value="0" onChange={() => {}} disabled />);
    expect(screen.getByRole('spinbutton')).toBeDisabled();
});

test('input has required attribute when required prop is true', () => {
    render(<NumberInput id="area" label="Area" value="0" onChange={() => {}} required />);
    expect(screen.getByRole('spinbutton')).toBeRequired();
});

test('input uses form-input class', () => {
    render(<NumberInput id="area" label="Area" value="0" onChange={() => {}} />);
    expect(screen.getByRole('spinbutton')).toHaveClass('form-input');
});
