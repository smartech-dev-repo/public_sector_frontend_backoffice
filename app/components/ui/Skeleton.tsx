/**
 * Loading placeholders shaped like the screen that's about to appear, so the layout doesn't jump
 * when the data arrives. Pick the shape that matches what's loading:
 *
 *   TableSkeleton      a list page or tab that shows a table
 *   TableRowsSkeleton  rows inside an existing <tbody> (the table header is already drawn)
 *   ListSkeleton       stacked rows in a panel: sessions, notifications, members, history
 *   DetailSkeleton     a profile or record page: header, tabs, cards of label/value pairs
 *   FormSkeleton       a settings or edit form
 *   StatsSkeleton      a dashboard: stat cards and a chart
 *   PanelSkeleton      a summary card with a few lines (wallet, eligibility)
 *   AuthCardSkeleton   the card on the sign-in pages
 *
 * Every shape is announced once to screen readers ("Loading …") and the pulse stops for people
 * who've asked their system for reduced motion.
 */
import React from 'react';
import { cn } from '@/lib/utils';

/** One grey block. Size and shape come from className. */
export function Skeleton({ className = '' }: { className?: string }) {
 return <div aria-hidden="true" className={cn('rounded-md bg-muted motion-safe:animate-pulse', className)} />;
}

/** Wraps a shape so assistive tech hears one "Loading" message, not a pile of empty boxes. */
function Busy({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
 return (
  <div role="status" aria-live="polite" aria-busy="true" className={className}>
   <span className="sr-only">{label}</span>
   {children}
  </div>
 );
}

// Fixed widths, varied per column and row, so placeholders look like text and not a barcode.
const CELL_WIDTHS = ['w-32', 'w-24', 'w-28', 'w-20', 'w-24', 'w-16', 'w-20', 'w-28'];
const fade = (i: number) => ({ opacity: Math.max(0.35, 1 - i * 0.1) });
const BAR_HEIGHTS = [45, 70, 55, 85, 60, 75, 40, 90, 65, 50, 80, 58];

interface TableSkeletonProps {
 rows?: number;
 columns?: number;
 /** First column shows a photo and two lines (name and ID), like the people tables. */
 withAvatar?: boolean;
 label?: string;
 className?: string;
}

export function TableSkeleton({ rows = 6, columns = 6, withAvatar = false, label = 'Loading table', className }: TableSkeletonProps) {
 const cols = Array.from({ length: columns });
 return (
  <Busy label={label} className={cn('w-full bg-card rounded-2xl border border-border overflow-hidden', className)}>
   <div className="h-12 bg-[#E9F4EE]/70 dark:bg-emerald-950/20 border-b border-border/60 flex items-center gap-6 px-4 sm:px-6 overflow-hidden">
    {cols.map((_, c) => (
     <div key={c} aria-hidden="true" className={cn('h-3 rounded bg-emerald-700/15 dark:bg-emerald-400/15 shrink-0 motion-safe:animate-pulse', CELL_WIDTHS[c % CELL_WIDTHS.length], c === columns - 1 && 'ml-auto')} />
    ))}
   </div>
   <div className="divide-y divide-border/60">
    {Array.from({ length: rows }).map((_, r) => (
     <div key={r} className="h-16 flex items-center gap-6 px-4 sm:px-6 overflow-hidden" style={fade(r)}>
      {cols.map((_, c) =>
       c === 0 && withAvatar ? (
        <div key={c} className="flex items-center gap-3 shrink-0">
         <Skeleton className="size-9 rounded-full" />
         <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-3 w-20" />
         </div>
        </div>
       ) : c === columns - 1 ? (
        <Skeleton key={c} className="h-8 w-16 rounded-lg ml-auto shrink-0" />
       ) : (
        <Skeleton key={c} className={cn('h-3.5 shrink-0', CELL_WIDTHS[(c + r) % CELL_WIDTHS.length])} />
       ),
      )}
     </div>
    ))}
   </div>
  </Busy>
 );
}

/** Placeholder rows for a table whose header is already on screen. Render inside <tbody>. */
export function TableRowsSkeleton({ rows = 5, columns }: { rows?: number; columns: number }) {
 return (
  <>
   {Array.from({ length: rows }).map((_, r) => (
    <tr key={r} aria-hidden={r > 0 ? 'true' : undefined} style={fade(r)}>
     {Array.from({ length: columns }).map((_, c) => (
      <td key={c} className="px-4 py-4">
       {r === 0 && c === 0 && <span className="sr-only" role="status">Loading rows</span>}
       <Skeleton className={cn('h-3.5', CELL_WIDTHS[(c + r) % CELL_WIDTHS.length])} />
      </td>
     ))}
    </tr>
   ))}
  </>
 );
}

export function ListSkeleton({ rows = 5, withAvatar = true, label = 'Loading list', className }: { rows?: number; withAvatar?: boolean; label?: string; className?: string }) {
 return (
  <Busy label={label} className={cn('divide-y divide-border/60', className)}>
   {Array.from({ length: rows }).map((_, r) => (
    <div key={r} className="flex items-center gap-3 py-3.5" style={fade(r)}>
     {withAvatar && <Skeleton className="size-9 rounded-full shrink-0" />}
     <div className="flex-1 space-y-2 min-w-0">
      <Skeleton className={cn('h-3.5', r % 2 ? 'w-2/5' : 'w-1/2')} />
      <Skeleton className={cn('h-3', r % 2 ? 'w-3/5' : 'w-1/3')} />
     </div>
     <Skeleton className="h-3 w-14 shrink-0" />
    </div>
   ))}
  </Busy>
 );
}

function FieldPairs({ count }: { count: number }) {
 return (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
   {Array.from({ length: count }).map((_, i) => (
    <div key={i} className="space-y-2">
     <Skeleton className="h-3 w-24" />
     <Skeleton className={cn('h-4', i % 3 === 0 ? 'w-40' : i % 3 === 1 ? 'w-32' : 'w-28')} />
    </div>
   ))}
  </div>
 );
}

/** `backLink={false}` when the page already draws its real back link above the skeleton. */
export function DetailSkeleton({ tabs = 4, cards = 2, backLink = true, label = 'Loading details', className }: { tabs?: number; cards?: number; backLink?: boolean; label?: string; className?: string }) {
 return (
  <Busy label={label} className={cn('space-y-6', className)}>
   {backLink && <Skeleton className="h-4 w-28" />}
   <div className="bg-card rounded-2xl border border-border p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
    <Skeleton className="size-16 rounded-full shrink-0" />
    <div className="flex-1 space-y-2.5">
     <Skeleton className="h-5 w-56 max-w-full" />
     <Skeleton className="h-3.5 w-40 max-w-full" />
     <div className="flex gap-2 pt-1">
      <Skeleton className="h-6 w-20 rounded-full" />
      <Skeleton className="h-6 w-24 rounded-full" />
     </div>
    </div>
    <div className="flex gap-2">
     <Skeleton className="h-9 w-24 rounded-lg" />
     <Skeleton className="h-9 w-24 rounded-lg" />
    </div>
   </div>
   {tabs > 0 && (
    <div className="flex gap-6 border-b border-border pb-3 overflow-hidden">
     {Array.from({ length: tabs }).map((_, i) => <Skeleton key={i} className={cn('h-4 shrink-0', i === 0 ? 'w-24' : 'w-20')} />)}
    </div>
   )}
   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {Array.from({ length: cards }).map((_, i) => (
     <div key={i} className="bg-card rounded-2xl border border-border p-5 sm:p-6 space-y-5">
      <Skeleton className="h-4 w-36" />
      <FieldPairs count={6} />
     </div>
    ))}
   </div>
  </Busy>
 );
}

export function FormSkeleton({ fields = 4, label = 'Loading form', className }: { fields?: number; label?: string; className?: string }) {
 return (
  <Busy label={label} className={cn('bg-card rounded-2xl border border-border p-5 sm:p-6 space-y-6', className)}>
   <div className="space-y-2">
    <Skeleton className="h-5 w-48" />
    <Skeleton className="h-3.5 w-72 max-w-full" />
   </div>
   <div className="space-y-5">
    {Array.from({ length: fields }).map((_, i) => (
     <div key={i} className="space-y-2">
      <Skeleton className="h-3.5 w-32" />
      <Skeleton className="h-10 w-full rounded-lg" />
     </div>
    ))}
   </div>
   <div className="flex justify-end">
    <Skeleton className="h-10 w-36 rounded-lg" />
   </div>
  </Busy>
 );
}

export function StatsSkeleton({ cards = 4, chart = true, label = 'Loading figures', className }: { cards?: number; chart?: boolean; label?: string; className?: string }) {
 return (
  <Busy label={label} className={cn('space-y-6', className)}>
   <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
    {Array.from({ length: cards }).map((_, i) => (
     <div key={i} className="bg-card rounded-2xl border border-border p-5 space-y-3">
      <div className="flex items-center justify-between">
       <Skeleton className="h-3.5 w-28" />
       <Skeleton className="size-8 rounded-lg" />
      </div>
      <Skeleton className="h-7 w-32" />
      <Skeleton className="h-3 w-20" />
     </div>
    ))}
   </div>
   {chart && (
    <div className="bg-card rounded-2xl border border-border p-5 sm:p-6 space-y-4">
     <Skeleton className="h-4 w-40" />
     <div className="h-56 flex items-end gap-3">
      {BAR_HEIGHTS.map((height, i) => (
       <div key={i} className="flex-1" style={{ height: `${height}%` }}>
        <Skeleton className="w-full h-full rounded-b-none" />
       </div>
      ))}
     </div>
    </div>
   )}
  </Busy>
 );
}

export function PanelSkeleton({ lines = 4, label = 'Loading', className }: { lines?: number; label?: string; className?: string }) {
 return (
  <Busy label={label} className={cn('space-y-4', className)}>
   <Skeleton className="h-6 w-40" />
   {Array.from({ length: lines }).map((_, i) => (
    <div key={i} className="flex items-center justify-between gap-4">
     <Skeleton className={cn('h-3.5', i % 2 ? 'w-28' : 'w-36')} />
     <Skeleton className={cn('h-3.5', i % 2 ? 'w-20' : 'w-24')} />
    </div>
   ))}
  </Busy>
 );
}

export function AuthCardSkeleton({ label = 'Loading' }: { label?: string }) {
 return (
  <Busy label={label} className="space-y-5 p-2">
   <Skeleton className="h-6 w-48" />
   <Skeleton className="h-3.5 w-64 max-w-full" />
   {[0, 1].map((i) => (
    <div key={i} className="space-y-2">
     <Skeleton className="h-3.5 w-24" />
     <Skeleton className="h-11 w-full rounded-lg" />
    </div>
   ))}
   <Skeleton className="h-11 w-full rounded-lg" />
  </Busy>
 );
}
