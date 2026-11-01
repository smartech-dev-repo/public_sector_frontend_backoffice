export default function TabCount({ count, active }: { count?: number; active?: boolean }) {
 if (count === undefined) return null;
 return (
  <span className={`ml-2 inline-flex min-w-[22px] h-5 px-1.5 items-center justify-center rounded-full text-[11px] font-semibold ${active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
   {count.toLocaleString('en-NG')}
  </span>
 );
}
