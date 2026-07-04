import React, { InputHTMLAttributes } from 'react';

export interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'inputMode'> {
  unit?: string;
}

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ unit, className = '', disabled, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        <input
          ref={ref}
          type="number"
          inputMode="decimal"
          disabled={disabled}
          className={`
            block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm
            focus:border-selco-navy focus:outline-none focus:ring-1 focus:ring-selco-navy
            disabled:bg-neutral-grey-100 disabled:text-gray-500 text-neutral-grey-800
            ${unit ? 'pr-12' : ''}
            ${className}
          `}
          {...props}
        />
        {unit && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <span className="text-gray-500">{unit}</span>
          </div>
        )}
      </div>
    );
  }
);
NumberInput.displayName = 'NumberInput';
