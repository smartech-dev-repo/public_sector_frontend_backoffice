import { X } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

export type TagProps = React.HTMLAttributes<HTMLSpanElement> & {
  onRemove?: () => void;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
};

const sizes = {
  xs: 'gap-0.5 rounded px-1.5 py-0 text-[10px]',
  sm: 'gap-1 rounded-md px-2 py-0.5 text-xs',
  md: 'gap-1 rounded-md px-2 py-0.5 text-xs',
  lg: 'gap-1.5 rounded-md px-2.5 py-1 text-sm',
  xl: 'gap-2 rounded-lg px-3 py-1 text-sm',
} as const;

export function Tag({ className, onRemove, size = 'md', children, ...props }: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center border bg-muted font-medium text-foreground',
        sizes[size],
        className,
      )}
      {...props}
    >
      <span className="min-w-0 truncate">{children}</span>
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="rounded-sm p-0.5 text-muted-foreground transition-colors hover:bg-background/80 hover:text-foreground"
          aria-label="Remove"
        >
          <X className="size-3.5 shrink-0" />
        </button>
      ) : null}
    </span>
  );
}
