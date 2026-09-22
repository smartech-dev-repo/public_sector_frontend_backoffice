import * as React from 'react';

import { cn } from '@/lib/utils';

export type DataGridProps = React.HTMLAttributes<HTMLDivElement> & {
  minItemWidth?: string;
};

/**
 * Responsive CSS grid for cards, tiles, or KPIs. Uses `repeat(auto-fill, minmax(...))`.
 */
export function DataGrid({
  className,
  style,
  minItemWidth = '16rem',
  ...props
}: DataGridProps) {
  return (
    <div
      className={cn('grid gap-4', className)}
      style={{
        gridTemplateColumns: `repeat(auto-fill, minmax(${minItemWidth}, 1fr))`,
        ...style,
      }}
      {...props}
    />
  );
}
