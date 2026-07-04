import React, { ReactNode } from 'react';

interface FormFieldProps {
  id: string;
  label: string;
  children: ReactNode;
  helperText?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export function FormField({
  id,
  label,
  children,
  helperText,
  error,
  required = false,
  disabled = false,
}: FormFieldProps) {
  const helperId = `${id}-helper`;
  const errorId = `${id}-error`;

  const ariaDescribedBy = [
    error ? errorId : null,
    helperText ? helperId : null,
  ].filter(Boolean).join(' ') || undefined;

  const childElement = React.isValidElement(children) 
    ? React.cloneElement(children as React.ReactElement<any>, {
        id,
        'aria-describedby': ariaDescribedBy,
        required,
        disabled,
        'aria-invalid': !!error,
      })
    : children;

  return (
    <div className={`flex flex-col space-y-1 ${disabled ? 'opacity-50' : ''}`}>
      <label htmlFor={id} className="text-sm font-bold text-selco-navy">
        {label}
        {required && <span className="text-error-red ml-1" aria-hidden="true">*</span>}
      </label>
      
      {childElement}

      {error && (
        <p id={errorId} className="text-sm text-error-red font-medium" role="alert">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p id={helperId} className="text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
}
