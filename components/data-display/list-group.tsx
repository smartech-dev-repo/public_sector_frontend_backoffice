import * as React from 'react';

import { cn } from '@/lib/utils';

export type ListGroupItem = {
  id: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  href?: string;
  trailing?: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
};

export type ListGroupProps = React.HTMLAttributes<HTMLUListElement> & {
  items: ListGroupItem[];
};

export function ListGroup({ className, items, ...props }: ListGroupProps) {
  return (
    <ul
      role="list"
      className={cn('divide-y overflow-hidden rounded-lg border bg-card', className)}
      {...props}
    >
      {items.map((item) => {
        const content = (
          <>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-foreground">{item.label}</div>
              {item.description ? (
                <div className="text-sm text-muted-foreground">{item.description}</div>
              ) : null}
            </div>
            {item.trailing ? <div className="shrink-0 text-muted-foreground">{item.trailing}</div> : null}
          </>
        );
        const base =
          'flex w-full items-center gap-3 px-4 py-3 text-start text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring';
        const state = item.disabled
          ? 'pointer-events-none opacity-50'
          : item.active
            ? 'bg-muted'
            : 'hover:bg-muted/60';

        if (item.href && !item.disabled) {
          return (
            <li key={item.id}>
              <a href={item.href} className={cn(base, state)}>
                {content}
              </a>
            </li>
          );
        }
        return (
          <li key={item.id} className={cn(base, state)}>
            {content}
          </li>
        );
      })}
    </ul>
  );
}
