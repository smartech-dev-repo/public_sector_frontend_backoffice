const compact = new Intl.NumberFormat('en-NG', { notation: 'compact', maximumFractionDigits: 1 });

export default function TabCount({ count }: { count?: number; active?: boolean }) {
 if (count === undefined) return null;
 const full = count.toLocaleString('en-NG');
 return (
  <span title={full} className={`ml-1.5 sm:ml-2 inline-flex shrink-0 h-[18px] sm:h-5 min-w-[18px] sm:min-w-[22px] px-1 sm:px-1.5 items-center justify-center rounded-full text-[10px] sm:text-[11px] font-semibold leading-none tabular-nums ${count > 0 ? 'bg-red-600 text-white' : 'bg-muted text-muted-foreground'}`}>
   {count >= 10000 ? compact.format(count) : full}
  </span>
 );
}
