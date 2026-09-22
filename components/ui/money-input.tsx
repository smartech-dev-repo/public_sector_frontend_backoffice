import * as React from 'react';
import { Input, type InputProps } from './input';

export interface MoneyInputProps extends Omit<InputProps, 'onChange'> {
  value?: string | number;
  onChange?: (value: string) => void;
}

export const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ value, onChange, type = 'text', inputMode = 'decimal', ...props }, ref) => {
    
    // Format the value with commas
    const formattedValue = React.useMemo(() => {
      if (value === undefined || value === null || value === '') return '';
      
      const strVal = String(value);
      // Remove all non-numeric and non-decimal characters
      const cleanValue = strVal.replace(/[^\d.]/g, '');
      
      const parts = cleanValue.split('.');
      // Format the integer part with commas
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      
      // Limit to max 2 decimal places if there is a decimal
      if (parts.length > 1) {
        parts[1] = parts[1].substring(0, 2);
      }
      
      return parts.join('.');
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        // Strip commas before passing to the parent
        const rawValue = e.target.value.replace(/,/g, '');
        // Allow valid numbers, empty string, or intermediate typing like "10."
        if (/^\d*\.?\d{0,2}$/.test(rawValue)) {
          onChange(rawValue);
        }
      }
    };

    return (
      <Input
        ref={ref}
        type={type}
        inputMode={inputMode}
        value={formattedValue}
        onChange={handleChange}
        {...props}
      />
    );
  }
);
MoneyInput.displayName = 'MoneyInput';
