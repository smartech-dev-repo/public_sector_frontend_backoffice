import * as React from 'react';
import { Input } from '@/components/ui/input';
import type { InputProps } from '@/components/ui/input';

export interface NumericInputProps extends Omit<InputProps, 'onChange'> {
  value?: string | number | undefined;
  onValueChange: (value: string) => void;
  allowNegative?: boolean;
  decimalPlaces?: number;
}

export const NumericInput = React.forwardRef<HTMLInputElement, NumericInputProps>(
  ({ value, onValueChange, allowNegative = false, decimalPlaces = 2, onFocus, onBlur, ...props }, ref) => {
    
    const [isFocused, setIsFocused] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState<string>('');

    React.useEffect(() => {
      if (!isFocused) {
        const strVal = String(value ?? '');
        const num = Number(strVal);
        if (!isNaN(num) && strVal !== '') {
          // Normalize to specified decimal places when not focused
          setInternalValue(num.toFixed(decimalPlaces));
        } else {
          setInternalValue(strVal);
        }
      }
    }, [value, isFocused]);

    const formatNumber = (val: string) => {
      if (val === '') return '';
      const isNegative = val.startsWith('-');
      const absStr = isNegative ? val.slice(1) : val;

      if (!isFocused) {
        const num = Number(absStr);
        if (!isNaN(num)) {
          const fixed = num.toFixed(decimalPlaces);
          const fixedParts = fixed.split('.');
          fixedParts[0] = fixedParts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          const result = fixedParts.join('.');
          return isNegative && allowNegative ? '-' + result : result;
        }
      }

      const parts = absStr.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      let formatted = parts.join('.');
      if (isNegative && allowNegative) formatted = '-' + formatted;
      return formatted;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let rawValue = e.target.value;
      if (!allowNegative) {
        rawValue = rawValue.replace(/[^0-9.]/g, '');
      } else {
        const isNegative = rawValue.startsWith('-');
        rawValue = rawValue.replace(/[^0-9.]/g, '');
        if (isNegative) rawValue = '-' + rawValue;
      }
      
      const parts = rawValue.split('.');
      const cleanValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : rawValue;
      
      setInternalValue(cleanValue);
      onValueChange(cleanValue);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      if (onFocus) onFocus(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      const num = Number(internalValue);
      if (!isNaN(num) && internalValue !== '') {
         onValueChange(num.toFixed(decimalPlaces));
      }
      if (onBlur) onBlur(e);
    };

    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        inputMode="decimal"
        value={formatNumber(internalValue)}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    );
  }
);
NumericInput.displayName = 'NumericInput';
