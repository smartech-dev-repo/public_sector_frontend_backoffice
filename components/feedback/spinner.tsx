import { Loader2 } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

const sizes = {
  xs: 'size-3',
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-6',
  xl: 'size-8',
} as const;

export type SpinnerProps = React.SVGProps<SVGSVGElement> & {
  size?: keyof typeof sizes;
  label?: string;
};

export function Spinner({ className, size = 'md', label = 'Loading', ...props }: SpinnerProps) {
  return (
    <Loader2
      role="status"
      aria-label={label}
      className={cn('animate-spin text-muted-foreground', sizes[size], className)}
      {...props}
    />
  );
}
