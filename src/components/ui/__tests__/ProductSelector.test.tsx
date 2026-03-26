import { test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductSelector } from '../ProductSelector';

const products = [
    { id: 'p1', name: 'Dunlop Adhesive', brand: 'Dunlop' },
    { id: 'p2', name: 'Mapei Keraflex' },
];

test('renders the label', () => {
    render(<ProductSelector id="product" label="Select Product" products={[]} value={null} onChange={() => {}} />);
    expect(screen.getByText('Select Product')).toBeInTheDocument();
});

test('renders an option for each product', () => {
    render(<ProductSelector id="product" label="Product" products={products} value={null} onChange={() => {}} />);
    expect(screen.getByText('Dunlop Adhesive')).toBeInTheDocument();
    expect(screen.getByText('Mapei Keraflex')).toBeInTheDocument();
});

test('shows placeholder option when placeholder prop provided', () => {
    render(
        <ProductSelector id="product" label="Product" products={[]} value={null} onChange={() => {}} placeholder="Choose a product" />
    );
    expect(screen.getByText('Choose a product')).toBeInTheDocument();
});

test('calls onChange when selection changes', () => {
    const onChange = vi.fn();
    render(<ProductSelector id="product" label="Product" products={products} value={null} onChange={onChange} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'p1' } });
    expect(onChange).toHaveBeenCalled();
});

test('shows error message when error prop provided', () => {
    render(
        <ProductSelector id="product" label="Product" products={[]} value={null} onChange={() => {}} error="Please select a product" />
    );
    expect(screen.getByText('Please select a product')).toBeInTheDocument();
});

test('renders as a select element with form-select class', () => {
    render(<ProductSelector id="product" label="Product" products={[]} value={null} onChange={() => {}} />);
    expect(screen.getByRole('combobox')).toHaveClass('form-select');
});

test('sets selected value on the select element', () => {
    render(<ProductSelector id="product" label="Product" products={products} value="p2" onChange={() => {}} />);
    expect(screen.getByRole('combobox')).toHaveValue('p2');
});
