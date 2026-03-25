import type { ChangeEvent } from 'react';

interface Product {
    id: string;
    name: string;
    brand?: string;
}

interface ProductSelectorProps {
    id: string;
    label: string;
    products: Product[];
    value: string | null;
    onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
    placeholder?: string;
    error?: string;
}

export function ProductSelector({
    id,
    label,
    products,
    value,
    onChange,
    placeholder,
    error,
}: ProductSelectorProps) {
    return (
        <div>
            <label htmlFor={id} className="form-label">{label}</label>

            <select
                id={id}
                className={`form-select${error ? ' input-error' : ''}`}
                value={value ?? ''}
                onChange={onChange}
            >
                {placeholder && <option value="">{placeholder}</option>}
                {products.map((product) => (
                    <option key={product.id} value={product.id}>
                        {product.name}
                    </option>
                ))}
            </select>

            {error && <span className="form-error">{error}</span>}
        </div>
    );
}
