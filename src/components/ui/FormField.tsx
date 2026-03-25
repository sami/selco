import type { ChangeEvent } from 'react';

interface Option {
    value: string;
    label: string;
}

interface FormFieldProps {
    id: string;
    label: string;
    type: 'text' | 'number' | 'select';
    value: string | number;
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    error?: string;
    helperText?: string;
    options?: Option[];
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
}

export function FormField({
    id,
    label,
    type,
    value,
    onChange,
    error,
    helperText,
    options = [],
    placeholder,
    required,
    disabled,
}: FormFieldProps) {
    return (
        <div>
            <label htmlFor={id} className="form-label">
                {label}
                {required && <span aria-hidden="true"> *</span>}
            </label>

            {type === 'select' ? (
                <select
                    id={id}
                    className={`form-select${error ? ' input-error' : ''}`}
                    value={value}
                    onChange={onChange}
                    required={required}
                    disabled={disabled}
                >
                    {placeholder && <option value="">{placeholder}</option>}
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            ) : (
                <input
                    id={id}
                    type={type}
                    className={`form-input${error ? ' input-error' : ''}`}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                />
            )}

            {error && <span className="form-error">{error}</span>}
            {helperText && !error && <span className="field-description">{helperText}</span>}
        </div>
    );
}
