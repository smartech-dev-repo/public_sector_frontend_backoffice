import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const inputVariants = cva(
  'flex w-full rounded-md border border-input bg-background px-3 py-2 text-base transition-[color,box-shadow] file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
  {
    variants: {
      size: {
        xs: 'h-7 text-xs',
        sm: 'h-8 text-xs',
        md: 'h-9',
        lg: 'h-10 text-base',
        xl: 'h-11 text-lg',
      },
      variant: {
        default: '',
        success: 'border-success/50 focus-visible:ring-success',
        error: 'border-destructive focus-visible:ring-destructive',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  },
);

export type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> &
  VariantProps<typeof inputVariants> & {
    error?: string;
    success?: boolean;
  };

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      size,
      error,
      success,
      variant,
      id,
      'aria-invalid': ariaInvalid,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref,
  ) => {
    const uid = React.useId();
    const inputId = id ?? uid;
    const errorId = `${inputId}-error`;
    const v = error ? 'error' : success ? 'success' : variant;
    const invalid = Boolean(error) || ariaInvalid === true;
    const describedBy = [ariaDescribedBy, error ? errorId : undefined].filter(Boolean).join(' ') || undefined;

    return (
      <div className="flex w-full flex-col gap-1">
        <input
          id={inputId}
          type={type}
          className={cn(inputVariants({ size, variant: v }), className)}
          ref={ref}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          {...props}
        />
        {error ? (
          <p id={errorId} className="text-xs text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
Input.displayName = 'Input';

export { Input, inputVariants };

export default Input;
