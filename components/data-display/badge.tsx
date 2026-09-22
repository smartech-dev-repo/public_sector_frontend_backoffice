import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        primary: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline: 'text-foreground',
        ghost: 'border-transparent hover:bg-accent hover:text-accent-foreground',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90',
        success:
          'border-success/30 bg-success/15 text-success hover:bg-success/20',
        warning:
          'border-warning/30 bg-warning/15 text-warning hover:bg-warning/20',
        info:
          'border-info/30 bg-info/15 text-info hover:bg-info/20',
        soft: 'border-transparent bg-soft text-soft-foreground',
        link: 'border-transparent text-primary underline-offset-4 hover:underline',
      },
      size: {
        xs: 'px-1.5 py-0 text-[10px]',
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2 py-0.5 text-xs',
        lg: 'px-2.5 py-1 text-sm',
        xl: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export type BadgeProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}
