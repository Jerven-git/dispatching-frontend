import React from 'react';
import { Input } from './Input';

interface FormFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'label'> {
  name: string;
  label?: string;
  error?: string | string[];
  helperText?: string;
}

const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ name, label, error, helperText, required, ...inputProps }, ref) => {
    // Handle both string and array error formats
    const errorMessage = Array.isArray(error) ? error[0] : error;

    return (
      <Input
        ref={ref}
        id={name}
        label={label || name}
        error={errorMessage}
        helperText={helperText}
        required={required}
        {...inputProps}
      />
    );
  }
);

FormField.displayName = 'FormField';

export { FormField };
export type { FormFieldProps };
