import { ChevronRight, MoreHorizontal } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

export type BreadcrumbItem = {
  label: string;
  href?: string;
  current?: boolean;
};

export type BreadcrumbsProps = React.ComponentProps<'nav'> & {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
};

export function Breadcrumbs({ className, items, separator, ...props }: BreadcrumbsProps) {
  const sep = separator ?? <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />;

  return (
    <nav aria-label="Breadcrumb" className={cn('flex', className)} {...props}>
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="inline-flex items-center gap-1">
              {i > 0 ? sep : null}
              {item.href && !item.current ? (
                <a
                  href={item.href}
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  {item.label}
                </a>
              ) : (
                <span
                  className={cn('font-medium', item.current || isLast ? 'text-foreground' : undefined)}
                  aria-current={item.current || isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function BreadcrumbEllipsis({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      role="presentation"
      aria-hidden
      className={cn('flex size-9 items-center justify-center', className)}
      {...props}
    >
      <MoreHorizontal className="size-4" />
      <span className="sr-only">More</span>
    </span>
  );
}
