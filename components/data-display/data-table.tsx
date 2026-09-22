import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Filter, Search } from 'lucide-react';
import * as React from 'react';
import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/feedback/skeleton';
import { TableExportButton } from '@/components/data-display/table-export-button';
import { cn } from '@/lib/utils';
import { getAdminAuditColumns, AUDIT_FIELDS } from '@/lib/admin-audit-columns';

export type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterColumnId?: string;
  filterPlaceholder?: string;
  filtersContent?: React.ReactNode;
  loading?: boolean;
  loadingRows?: number;
  loadingText?: string;
  className?: string;
  onRowClick?: (row: TData) => void;
  exportConfig?: {
    enabled: boolean;
    filename?: string;
    dateField?: keyof TData;
    columns?: { header: string; key: string }[];
  };
  manualPagination?: boolean;
  pageCount?: number;
  pageIndex?: number;
  pageSize?: number;
  onPageChange?: (pageIndex: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
};

export function DataTable<TData, TValue>({
  columns,
  data,
  filterColumnId,
  filterPlaceholder = 'Filter…',
  filtersContent,
  loading = false,
  loadingRows = 6,
  loadingText = 'Loading rows...',
  className,
  onRowClick,
  exportConfig = { enabled: true, filename: 'table_export' },
  manualPagination,
  pageCount,
  pageIndex,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [isFiltersExpanded, setIsFiltersExpanded] = React.useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('camco_admin_table_page_size');
      if (stored) {
        let val = parseInt(stored, 10);
        if (val > 100) val = 100;
        if (onPageSizeChange && pageSize !== val) {
          onPageSizeChange(val);
        } else if (!manualPagination) {
          if (table && table.getState().pagination.pageSize !== val) {
            table.setPageSize(val);
          }
        }
      }
    } catch (e) {}
  }, []);

  const tableRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (tableRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tableRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [data, columns]);

  const scrollLeft = () => {
    if (tableRef.current) {
      tableRef.current.scrollTo({
        left: 0,
        behavior: 'smooth',
      });
    }
  };

  const scrollRight = () => {
    if (tableRef.current) {
      tableRef.current.scrollTo({
        left: tableRef.current.scrollWidth,
        behavior: 'smooth',
      });
    }
  };


  const reversedData = React.useMemo(() => {
    return data;
  }, [data]);

  const finalColumns = React.useMemo(() => {
    let cols = [...columns] as ColumnDef<TData, any>[];
    if (data && data.length > 0) {
      const existingFields = new Set<string>();
      data.forEach(row => {
        AUDIT_FIELDS.forEach(field => {
          if ((row as any)?.[field] !== undefined && (row as any)?.[field] !== null) {
            existingFields.add(field);
          }
        });
      });
      
      if (existingFields.size > 0) {
        const auditCols = getAdminAuditColumns().filter(col => existingFields.has(col.id as string)) as ColumnDef<TData, any>[];
        
        const actionsColIdx = cols.findIndex(c => (c as any).id === 'actions');
        if (actionsColIdx !== -1) {
          const actionsCol = cols[actionsColIdx];
          cols.splice(actionsColIdx, 1);
          cols = [...cols, ...auditCols, actionsCol];
        } else {
          cols = [...cols, ...auditCols];
        }
      }
    }
    return cols;
  }, [columns, data]);

  const table = useReactTable({
    data: reversedData,
    columns: finalColumns,
    state: { 
      sorting, 
      columnFilters,
      ...(manualPagination && pageIndex !== undefined ? { pagination: { pageIndex, pageSize: pageSize ?? 5 } } : {
        ...(pageSize !== undefined && !manualPagination ? { pagination: { pageIndex: 0, pageSize } } : {})
      })
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: manualPagination ? undefined : getPaginationRowModel(),
    initialState: manualPagination ? undefined : { pagination: { pageSize: pageSize ?? 5 } },
    manualPagination,
    pageCount: manualPagination ? pageCount : undefined,
  });

  const filterCol = filterColumnId ? table.getColumn(filterColumnId) : undefined;

  return (
    <div className={cn('space-y-4 w-full min-w-0 max-w-full', className)}>
      {(filterCol || filtersContent || exportConfig?.enabled) ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto flex-1">
              {filterCol && (
                <div className="relative max-w-sm w-full sm:w-[320px]">
                  <Search className="absolute left-4 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    placeholder={filterPlaceholder || "Search..."}
                    value={(filterCol.getFilterValue() as string) ?? ''}
                    onChange={(e) => filterCol.setFilterValue(e.target.value)}
                    disabled={loading}
                    className="pl-10 pr-12 h-9 w-full rounded-full bg-muted/40 border-border/60 focus-visible:ring-1 focus-visible:ring-primary/30 transition-shadow"
                  />
                  <div className="absolute right-3 top-2 flex items-center justify-center rounded bg-muted/80 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground font-mono">
                    ⌘K
                  </div>
                </div>
              )}
              {filtersContent && (
                <Button 
                  type="button"
                  variant="outline" 
                  className="rounded-full gap-1.5 h-9 px-4 text-sm font-medium bg-background hover:bg-muted/50 transition-colors border-border/60"
                  onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                >
                  <Filter className="size-4" /> Filters 
                  {isFiltersExpanded ? <ChevronUp className="size-4 text-muted-foreground ml-0.5" /> : <ChevronDown className="size-4 text-muted-foreground ml-0.5" />}
                </Button>
              )}
            </div>
            
            {exportConfig?.enabled && (
              <div className="shrink-0 flex items-center">
                <TableExportButton 
                  data={table.getFilteredRowModel().rows.map(row => row.original)}
                  filename={exportConfig.filename}
                  dateField={exportConfig.dateField}
                  columns={exportConfig.columns || finalColumns
                    .filter(c => ((c as any).accessorKey || (c as any).id) && typeof c.header === 'string' && (c as any).id !== 'actions' && (c as any).id !== 'select')
                    .map(c => ({ header: c.header as string, key: ((c as any).accessorKey || (c as any).id) as string }))
                  }
                />
              </div>
            )}
          </div>
          
          {isFiltersExpanded && filtersContent && (
            <div className="p-4 rounded-xl border border-border/60 bg-card/50 animate-in fade-in duration-200">
              {filtersContent}
            </div>
          )}
        </div>
      ) : null}
      <div className="bg-card rounded-xl border border-border overflow-hidden w-full max-w-full">
        <div className="relative w-full max-w-full overflow-hidden">
          <div 
            ref={tableRef}
            onScroll={checkScroll}
            className="overflow-auto max-h-[calc(100vh-300px)] min-h-[300px] w-full"
          >
          <table className="w-full caption-bottom text-sm">
            <thead className="bg-muted/50 sticky top-0 z-10 border-b border-border">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      scope="col"
                      className="h-12 px-5 text-start align-middle text-[11px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {loading ? (
              <>
                {Array.from({ length: loadingRows }).map((_, rowIndex) => (
                  <tr key={`loading-${rowIndex}`} className="border-b border-border">
                    {finalColumns.map((_, colIndex) => (
                      <td key={`loading-cell-${rowIndex}-${colIndex}`} className="px-5 py-4 align-middle">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))}
              </>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    "border-b border-border transition-colors hover:bg-muted/50/50",
                    onRowClick && "cursor-pointer"
                  )}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-5 py-4 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="h-24 p-6 text-center text-muted-foreground">
                  No results.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
        {/* Scroll Indicators */}
        {canScrollLeft && (
          <div className="pointer-events-none absolute bottom-0 left-0 top-0 flex items-center justify-start w-16 bg-gradient-to-r from-background to-transparent z-10 pl-2">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); scrollLeft(); }}
              className="pointer-events-auto h-8 w-8 rounded-full bg-background border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Scroll to left end"
              type="button"
            >
              <ChevronLeft className="size-4" />
            </button>
          </div>
        )}
        {canScrollRight && (
          <div className="pointer-events-none absolute bottom-0 right-0 top-0 flex items-center justify-end w-16 bg-gradient-to-l from-background to-transparent z-10 pr-2">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); scrollRight(); }}
              className="pointer-events-auto h-8 w-8 rounded-full bg-background border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors animate-pulse hover:animate-none"
              aria-label="Scroll to right end"
              type="button"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-4 border-t border-border px-5 py-4 bg-card">
          <div className="flex items-center">
            <p className="text-[13px] text-muted-foreground font-medium" aria-live="polite">
              {loading
                ? loadingText
                : `Page ${table.getState().pagination.pageIndex + 1} of ${table.getPageCount() || 1}`}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-muted-foreground font-medium">Rows per page:</span>
              <select
                className="h-8 w-[65px] rounded-lg border border-border bg-transparent px-2 py-1 text-[13px] font-medium outline-none focus:border-[#156336] focus:ring-1 focus:ring-[#156336]"
                value={pageSize ?? table.getState().pagination.pageSize}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  try {
                    localStorage.setItem('camco_admin_table_page_size', val.toString());
                  } catch (err) {}
                  if (onPageSizeChange) {
                    onPageSizeChange(val);
                  } else if (!manualPagination) {
                    table.setPageSize(val);
                  }
                }}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
            <div className="flex gap-1.5">
              <Button
                type="button"
                variant="outline"
                className="h-8 w-8 p-0 rounded-lg border-border hover:bg-muted/50 text-muted-foreground"
                onClick={() => {
                  if (manualPagination && onPageChange && pageIndex !== undefined) {
                    onPageChange(pageIndex - 1);
                  } else {
                    table.previousPage();
                  }
                }}
                disabled={loading || (manualPagination ? (pageIndex ?? 0) === 0 : !table.getCanPreviousPage())}
                aria-label="Previous page"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-8 w-8 p-0 rounded-lg border-border hover:bg-muted/50 text-muted-foreground"
                onClick={() => {
                  if (manualPagination && onPageChange && pageIndex !== undefined) {
                    onPageChange(pageIndex + 1);
                  } else {
                    table.nextPage();
                  }
                }}
                disabled={loading || (manualPagination ? (pageIndex ?? 0) >= (pageCount ?? 1) - 1 : !table.getCanNextPage())}
                aria-label="Next page"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
