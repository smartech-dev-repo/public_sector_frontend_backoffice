const compact = new Intl.NumberFormat('en-NG', { notation: 'compact', maximumFractionDigits: 1 });

/**
 * How many records a tab holds, with or without filters. A plain number with no
 * background: red is kept for menu alerts, which mean a decision is waiting.
 */
export default function TabCount({ count }: { count?: number; active?: boolean }) {
 if (count === undefined) return null;
 const full = count.toLocaleString('en-NG');
 return (
  <span title={`${full} records`} className="ml-1.5 sm:ml-2 inline-flex shrink-0 items-center text-[11px] sm:text-xs font-medium leading-none tabular-nums text-muted-foreground">
   {count >= 10000 ? compact.format(count) : full}
  </span>
 );
}
