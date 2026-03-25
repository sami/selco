import type { ChangeEvent } from 'react';

interface NumberInputProps {
    id: string;
    label: string;
    value: number | '';
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    unit?: string;
    min?: number;
    max?: number;
    step?: number;
    error?: string;
    helperText?: string;
    required?: boolean;
    disabled?: boolean;
}

export function NumberInput({
    id,
    label,
    value,
    onChange,
    unit,
    min,
    max,
    step,
    error,
    helperText,
    required,
    disabled,
}: NumberInputProps) {
    return (
        <div>
            <label htmlFor={id} className="form-label">
                {label}
                {required && <span aria-hidden="true"> *</span>}
            </label>

            <div className="flex items-center gap-2">
                <input
                    id={id}
                    type="number"
                    className={`form-input${error ? ' input-error' : ''}`}
                    value={value}
                    onChange={onChange}
                    min={min}
                    max={max}
                    step={step}
                    required={required}
                    disabled={disabled}
                />
                {unit && (
                    <span data-testid="unit-suffix" className="text-sm text-text-muted shrink-0">
                        {unit}
                    </span>
                )}
            </div>

            {error && <span className="form-error">{error}</span>}
            {helperText && !error && <span className="field-description">{helperText}</span>}
        </div>
    );
}
