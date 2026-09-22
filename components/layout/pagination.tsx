import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export type PaginationProps = {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  limit?: number;
  onLimitChange?: (limit: number) => void;
  className?: string;
};

function visiblePages(current: number, total: number): (number | 'dots')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const set = new Set<number | 'dots'>();
  set.add(1);
  set.add(total);
  set.add(current);
  if (current - 1 >= 1) set.add(current - 1);
  if (current + 1 <= total) set.add(current + 1);
  const sorted = [...set].filter((p): p is number => typeof p === 'number').sort((a, b) => a - b);
  const out: (number | 'dots')[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const n = sorted[i]!;
    if (i > 0 && n - (sorted[i - 1] as number) > 1) out.push('dots');
    out.push(n);
  }
  return out;
}

export function Pagination({ page, pageCount, onPageChange, limit, onLimitChange, className }: PaginationProps) {
  const total = Math.max(1, pageCount);
  const current = Math.min(Math.max(1, page), total);
  const pages = React.useMemo(() => visiblePages(current, total), [current, total]);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('camco_admin_table_page_size');
      if (stored && onLimitChange) {
        const val = parseInt(stored, 10);
        if (limit !== val) {
          onLimitChange(val);
        }
      }
    } catch (e) {}
  }, []);

  return (
    <div className={cn('flex items-center gap-4', className)}>
      {onLimitChange && limit && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Rows per page:</span>
          <Select value={String(limit)} onValueChange={(val: string) => {
            const num = Number(val);
            try {
              localStorage.setItem('camco_admin_table_page_size', num.toString());
            } catch (err) {}
            onLimitChange(num);
          }}>
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="200">200</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      <nav className="flex items-center justify-center gap-1" aria-label="Pagination">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="size-8 p-0"
          disabled={current <= 1}
          onClick={() => onPageChange(current - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </Button>
        {pages.map((p, i) =>
          p === 'dots' ? (
            <span
              key={`dots-${i}`}
              className="flex size-8 items-center justify-center text-muted-foreground"
              aria-hidden
            >
              <MoreHorizontal className="size-4" />
            </span>
          ) : (
            <Button
              key={p}
              type="button"
              variant={p === current ? 'primary' : 'outline'}
              size="sm"
              className="size-8 p-0"
              onClick={() => onPageChange(p)}
              aria-label={`Page ${p}`}
              aria-current={p === current ? 'page' : undefined}
            >
              {p}
            </Button>
          ),
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="size-8 p-0"
          disabled={current >= total}
          onClick={() => onPageChange(current + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </Button>
      </nav>
    </div>
  );
}
