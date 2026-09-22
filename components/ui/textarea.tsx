import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const textareaVariants = cva(
  'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        xs: 'min-h-16 text-xs',
        sm: 'min-h-20 text-xs',
        md: 'min-h-[80px]',
        lg: 'min-h-28 text-base',
        xl: 'min-h-32 text-lg',
      },
      variant: {
        default: '',
        success: 'border-success/50 focus-visible:ring-success',
        error: 'border-destructive focus-visible:ring-destructive',
      },
    },
    defaultVariants: { size: 'md', variant: 'default' },
  },
);

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> &
  VariantProps<typeof textareaVariants> & {
    error?: string;
    success?: boolean;
  };

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, size, variant, error, success, id, 'aria-describedby': adb, ...props }, ref) => {
    const uid = React.useId();
    const tid = id ?? uid;
    const eid = `${tid}-error`;
    const v = error ? 'error' : success ? 'success' : variant;
    const describedBy = [adb, error ? eid : undefined].filter(Boolean).join(' ') || undefined;
    return (
      <div className="flex w-full flex-col gap-1">
        <textarea
          id={tid}
          className={cn(textareaVariants({ size, variant: v }), className)}
          ref={ref}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          {...props}
        />
        {error ? (
          <p id={eid} className="text-xs text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';

export { Textarea, textareaVariants };
