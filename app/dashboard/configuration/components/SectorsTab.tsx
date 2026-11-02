"use client";

import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import { sectors_api } from '@/app/api_factory/modules/sectors';
import { useDataVersion } from '@/app/composables/useDataVersion';
import { useConfirm } from '@/app/composables/useConfirm';
import { useToast } from '@/app/composables/useToast';

const TH = 'px-4 py-3.5 text-left text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider';
const INPUT = 'mt-1 w-full px-4 py-2.5 border border-border rounded-lg text-sm font-normal outline-none focus:ring-1 focus:ring-emerald-200 focus:border-emerald-400 disabled:opacity-60';

type EditorState = { id?: string; code: string; name: string } | null;

export default function SectorsTab() {
 const dataVersion = useDataVersion();
 const { confirm } = useConfirm();
 const { addToast } = useToast();
 const [sectors, setSectors] = useState<any[]>([]);
 const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
 const [editor, setEditor] = useState<EditorState>(null);
 const [saving, setSaving] = useState(false);

 const load = useCallback(async () => {
  const res: any = await sectors_api.list();
  if (res?.type === 'ERROR') {
   setState('error');
   return;
  }
  setSectors(res.data || []);
  setState('ready');
 }, []);

 useEffect(() => { load(); }, [load, dataVersion]);

 const handleSave = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!editor) return;
  setSaving(true);
  const name = editor.name.trim() || undefined;
  const res: any = editor.id ? await sectors_api.update(editor.id, { name }) : await sectors_api.create({ code: editor.code.trim(), name });
  setSaving(false);
  // The API layer has already shown the server's message for a rejected save.
  if (res?.type === 'ERROR') return;
  addToast(editor.id ? 'Sector updated' : 'Sector added', 'success');
  setEditor(null);
 };

 const handleRemove = async (sector: any) => {
  const proceed = await confirm({ title: 'Remove sector?', message: `Remove ${sector.code}? Sheets with this name will no longer merge.`, confirmText: 'Remove' });
  if (!proceed) return;
  const res: any = await sectors_api.remove(sector.id);
  if (res?.type !== 'ERROR') addToast('Sector removed', 'success');
 };

 return (
  <div className="space-y-4">
   <div className="flex flex-wrap items-start justify-between gap-3">
    <div>
     <h2 className="text-lg font-bold text-foreground">Sectors</h2>
     <p className="text-xs text-muted-foreground mt-1">Upload sheets only merge when their name matches a sector here. Filters and loan products use this list too.</p>
    </div>
    <button type="button" onClick={() => setEditor({ code: '', name: '' })} className="h-11 px-4 inline-flex items-center gap-2 bg-[#018752] hover:bg-[#017044] text-white rounded-xl text-sm font-semibold">
     <Plus className="w-4 h-4" /> Add sector
    </button>
   </div>

   {state === 'loading' && <PulseLoader />}
   {state === 'error' && <p className="text-red-600 py-12 text-center">Could not load sectors.</p>}
   {state === 'ready' && (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
     <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border">
       <thead className="bg-[#E9F4EE] dark:bg-emerald-950/20">
        <tr>
         <th scope="col" className={TH}>Sheet name</th>
         <th scope="col" className={TH}>Full name</th>
         <th scope="col" aria-label="Actions" className={TH}></th>
        </tr>
       </thead>
       <tbody className="divide-y divide-border">
        {sectors.length === 0 && (
         <tr><td colSpan={3} className="p-8"><div className="flex justify-center"><EmptyState title="No sectors yet." /></div></td></tr>
        )}
        {sectors.map((sector) => (
         <tr key={sector.id} className="hover:bg-muted/30 transition-colors">
          <td className="px-4 py-3 text-sm font-semibold text-foreground">{sector.code}</td>
          <td className="px-4 py-3 text-sm text-muted-foreground">{sector.name || '—'}</td>
          <td className="px-4 py-3 text-right whitespace-nowrap">
           <button type="button" onClick={() => setEditor({ id: sector.id, code: sector.code, name: sector.name || '' })} aria-label={`Edit ${sector.code}`} className="w-10 h-10 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/50"><Pencil className="w-4 h-4" /></button>
           <button type="button" onClick={() => handleRemove(sector)} aria-label={`Remove ${sector.code}`} className="w-10 h-10 inline-flex items-center justify-center rounded-lg text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20"><Trash2 className="w-4 h-4" /></button>
          </td>
         </tr>
        ))}
       </tbody>
      </table>
     </div>
    </div>
   )}

   {editor && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
     <div className="fixed inset-0 bg-white/30 dark:bg-white/10 backdrop-blur-md" onClick={() => setEditor(null)}></div>
     <div role="dialog" aria-modal="true" aria-label={editor.id ? 'Edit sector' : 'Add sector'} className="relative bg-card rounded-2xl p-6 w-full max-w-md mx-4 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-black/10">
      <h3 className="text-lg font-semibold text-foreground mb-4">{editor.id ? 'Edit sector' : 'Add sector'}</h3>
      <form onSubmit={handleSave} className="space-y-4">
       <label className="block text-sm font-medium text-foreground/90">
        Sheet name
        <input required autoFocus={!editor.id} disabled={!!editor.id} maxLength={31} value={editor.code} onChange={(e) => setEditor({ ...editor, code: e.target.value })} placeholder="e.g. FRSC" className={INPUT} />
        <span className="block mt-1 text-xs font-normal text-muted-foreground">
         {editor.id ? 'This cannot change, because records and loan products use it.' : 'Upload sheets must have this name. It cannot be changed later.'}
        </span>
       </label>
       <label className="block text-sm font-medium text-foreground/90">
        Full name (optional)
        <input maxLength={100} value={editor.name} onChange={(e) => setEditor({ ...editor, name: e.target.value })} placeholder="e.g. Federal Road Safety Corps" className={INPUT} />
       </label>
       <div className="flex gap-3 pt-2">
        <button type="button" onClick={() => setEditor(null)} className="flex-1 h-11 rounded-lg text-sm text-foreground/90 bg-muted/50 hover:bg-slate-200 dark:hover:bg-slate-800">Cancel</button>
        <button type="submit" disabled={saving} className="flex-1 h-11 rounded-lg text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
       </div>
      </form>
     </div>
    </div>
   )}
  </div>
 );
}
