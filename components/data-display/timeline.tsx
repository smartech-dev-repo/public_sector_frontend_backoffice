import * as React from 'react';

import { cn } from '@/lib/utils';

export type TimelineItem = {
  id: string;
  title: string;
  description?: string;
  meta?: string;
  icon?: React.ReactNode;
};

export type TimelineProps = React.HTMLAttributes<HTMLUListElement> & {
  items: TimelineItem[];
};

export function Timeline({ className, items, ...props }: TimelineProps) {
  return (
    <ul className={cn('relative space-y-6 ps-2', className)} {...props}>
      <span
        className="absolute start-[11px] top-2 bottom-2 w-px bg-border"
        aria-hidden
      />
      {items.map((item) => (
        <li key={item.id} className="relative flex gap-4 ps-6">
          <div className="absolute start-0 flex size-6 items-center justify-center rounded-full border bg-background text-muted-foreground">
            {item.icon ?? <span className="size-1.5 rounded-full bg-primary" />}
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-baseline gap-2">
              <p className="font-medium text-foreground">{item.title}</p>
              {item.meta ? (
                <time className="text-xs text-muted-foreground">{item.meta}</time>
              ) : null}
            </div>
            {item.description ? (
              <p className="text-sm text-muted-foreground">{item.description}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
