"use client";

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { GATEWAY_ENDPOINT_WITH_AUTH } from '@/app/api_factory/axios.config';

export interface PickedPerson {
 id: string;
 fullName: string;
 email?: string | null;
 phone?: string | null;
 _count?: { assignedClients: number };
}

interface Props {
 kind: 'agent' | 'admin';
 value: PickedPerson | null;
 onChange: (person: PickedPerson | null) => void;
 excludeId?: string | null;
 label: string;
}

/** Search approved agents (who can take clients) or active admins, by name, email or phone. */
export default function PersonPicker({ kind, value, onChange, excludeId, label }: Props) {
 const [q, setQ] = useState('');
 const [results, setResults] = useState<PickedPerson[]>([]);
 const [open, setOpen] = useState(false);

 useEffect(() => {
  if (!open) return;
  const timer = setTimeout(async () => {
   const res: any = await GATEWAY_ENDPOINT_WITH_AUTH.get(`/admin/clients/assignable-${kind}s`, { params: { q: q.trim() || undefined } });
   if (res?.type !== 'ERROR') setResults((res.data ?? []).filter((p: PickedPerson) => p.id !== excludeId));
  }, 250);
  return () => clearTimeout(timer);
 }, [q, open, kind, excludeId]);

 if (value) {
  return (
   <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/20">
    <span className="min-w-0">
     <span className="block text-sm font-semibold text-foreground truncate">{value.fullName}</span>
     <span className="block text-xs text-muted-foreground truncate">{value.email || value.phone}</span>
    </span>
    <button type="button" onClick={() => onChange(null)} className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">Change</button>
   </div>
  );
 }

 return (
  <div className="relative">
   <label className="relative block">
    <span className="sr-only">{label}</span>
    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
    <input
     value={q}
     onFocus={() => setOpen(true)}
     onChange={(e) => { setQ(e.target.value); setOpen(true); }}
     placeholder={kind === 'agent' ? 'Search agents by name, email or phone' : 'Search admins by name or email'}
     className="w-full h-11 pl-9 pr-3 bg-card border border-border rounded-lg text-sm outline-none focus:ring-1 focus:ring-emerald-200 focus:border-emerald-400"
    />
   </label>
   {open && (
    <ul role="listbox" aria-label={label} className="absolute z-popup mt-1 w-full max-h-60 overflow-y-auto bg-card border border-border rounded-lg shadow-lg">
     {results.length === 0 && <li className="px-3 py-3 text-sm text-muted-foreground">No matches.</li>}
     {results.map((p) => (
      <li key={p.id}>
       <button type="button" role="option" aria-selected={false} onClick={() => { onChange(p); setOpen(false); setQ(''); }} className="w-full text-left px-3 py-2 hover:bg-muted/50">
        <span className="block text-sm font-medium text-foreground">{p.fullName}</span>
        <span className="block text-xs text-muted-foreground">
         {p.email || p.phone}
         {p._count ? ` · ${p._count.assignedClients} ${p._count.assignedClients === 1 ? 'client' : 'clients'}` : ''}
        </span>
       </button>
      </li>
     ))}
    </ul>
   )}
  </div>
 );
}
