import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormField } from '../FormField';

test('renders label and text input', () => {
    render(<FormField id="name" label="Name" type="text" value="" onChange={() => {}} />);
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
});

test('renders number input when type is number', () => {
    render(<FormField id="qty" label="Quantity" type="number" value="" onChange={() => {}} />);
    expect(screen.getByLabelText('Quantity')).toBeInTheDocument();
    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
});

test('renders select with options when type is select', () => {
    const options = [{ value: 'a', label: 'Option A' }, { value: 'b', label: 'Option B' }];
    render(<FormField id="sel" label="Pick one" type="select" value="a" onChange={() => {}} options={options} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('Option A')).toBeInTheDocument();
    expect(screen.getByText('Option B')).toBeInTheDocument();
});

test('shows error message when error prop provided', () => {
    render(<FormField id="name" label="Name" type="text" value="" onChange={() => {}} error="Required field" />);
    expect(screen.getByText('Required field')).toBeInTheDocument();
});

test('shows helper text when helperText prop provided', () => {
    render(<FormField id="name" label="Name" type="text" value="" onChange={() => {}} helperText="Enter your full name" />);
    expect(screen.getByText('Enter your full name')).toBeInTheDocument();
});

test('calls onChange when text input value changes', () => {
    const onChange = vi.fn();
    render(<FormField id="name" label="Name" type="text" value="" onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'hello' } });
    expect(onChange).toHaveBeenCalled();
});

test('input is disabled when disabled prop is true', () => {
    render(<FormField id="name" label="Name" type="text" value="" onChange={() => {}} disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
});

test('input has required attribute when required prop is true', () => {
    render(<FormField id="name" label="Name" type="text" value="" onChange={() => {}} required />);
    expect(screen.getByRole('textbox')).toBeRequired();
});

test('input uses form-input class', () => {
    render(<FormField id="name" label="Name" type="text" value="" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toHaveClass('form-input');
});

test('select uses form-select class', () => {
    render(<FormField id="sel" label="Pick" type="select" value="" onChange={() => {}} options={[]} />);
    expect(screen.getByRole('combobox')).toHaveClass('form-select');
});
