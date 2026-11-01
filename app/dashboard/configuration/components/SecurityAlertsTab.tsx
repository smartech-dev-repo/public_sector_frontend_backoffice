"use client";

import { useDataVersion } from '@/app/composables/useDataVersion';
import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import { alertRecipients_api } from '@/app/api_factory/modules/alertRecipients';
import { useConfirm } from '@/app/composables/useConfirm';
import { useToast } from '@/app/composables/useToast';

const TH = 'px-4 py-3.5 text-left text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider';
const INPUT = 'mt-1 w-full px-4 py-2.5 border border-border rounded-lg text-sm font-normal outline-none focus:ring-1 focus:ring-emerald-200 focus:border-emerald-400';

const ALERT_TYPES = [
 'A sign-in token that looks stolen',
 '5 failed sign-ins on one account in 15 minutes',
 'An agent blocked 3 times from other agents\' clients in 15 minutes',
 'An admin turning off two-factor sign-in',
 'An admin\'s role being changed',
 'A role\'s permissions being changed',
];

type EditorState = { id?: string; email: string; name: string } | null;

export default function SecurityAlertsTab() {
 const dataVersion = useDataVersion();
 const { confirm } = useConfirm();
 const { addToast } = useToast();
 const [recipients, setRecipients] = useState<any[]>([]);
 const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
 const [editor, setEditor] = useState<EditorState>(null);
 const [saving, setSaving] = useState(false);

 const load = useCallback(async () => {
  const res: any = await alertRecipients_api.list();
  if (res?.type === 'ERROR') {
   setState('error');
   return;
  }
  setRecipients(res.data || []);
  setState('ready');
 }, []);

 useEffect(() => { load(); }, [load, dataVersion]);

 const handleSave = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!editor) return;
  setSaving(true);
  const payload = { email: editor.email.trim(), name: editor.name.trim() };
  const res: any = editor.id ? await alertRecipients_api.update(editor.id, payload) : await alertRecipients_api.create(payload);
  setSaving(false);
  // The API layer has already shown the server's message for a rejected save.
  if (res?.type === 'ERROR') return;
  addToast(editor.id ? 'Recipient updated' : 'Recipient added', 'success');
  setEditor(null);
 };

 const handleToggle = async (recipient: any) => {
  const res: any = await alertRecipients_api.update(recipient.id, { isActive: !recipient.isActive });
  if (res?.type !== 'ERROR') addToast(recipient.isActive ? `Alerts turned off for ${recipient.email}` : `Alerts turned on for ${recipient.email}`, 'success');
 };

 const handleRemove = async (recipient: any) => {
  const proceed = await confirm({ title: 'Remove recipient?', message: `${recipient.email} will stop receiving security alerts.`, confirmText: 'Remove' });
  if (!proceed) return;
  const res: any = await alertRecipients_api.remove(recipient.id);
  if (res?.type !== 'ERROR') addToast('Recipient removed', 'success');
 };

 const activeCount = recipients.filter((recipient) => recipient.isActive).length;

 return (
  <div className="space-y-4">
   <div className="flex flex-wrap items-start justify-between gap-3">
    <div>
     <h2 className="text-lg font-bold text-foreground">Security Alerts</h2>
     <p className="text-xs text-muted-foreground mt-1">These people are emailed when something high-risk happens.</p>
    </div>
    <button type="button" onClick={() => setEditor({ email: '', name: '' })} className="h-11 px-4 inline-flex items-center gap-2 bg-[#018752] hover:bg-[#017044] text-white rounded-xl text-sm font-semibold">
     <Plus className="w-4 h-4" /> Add recipient
    </button>
   </div>

   {state === 'ready' && recipients.length > 0 && activeCount === 0 && (
    <p className="px-4 py-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-400 text-sm text-amber-900 dark:text-amber-300">
     Everyone is turned off, so no security alerts are being sent.
    </p>
   )}

   {state === 'loading' && <PulseLoader />}
   {state === 'error' && <p className="text-red-600 py-12 text-center">Could not load recipients.</p>}
   {state === 'ready' && (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
     <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border">
       <thead className="bg-[#E9F4EE] dark:bg-emerald-950/20">
        <tr>
         <th scope="col" className={TH}>Recipient</th>
         <th scope="col" className={TH}>Alerts</th>
         <th scope="col" aria-label="Actions" className={TH}></th>
        </tr>
       </thead>
       <tbody className="divide-y divide-border">
        {recipients.length === 0 && (
         <tr><td colSpan={3} className="p-8"><div className="flex justify-center"><EmptyState title="No recipients yet." description="Add someone so security alerts have somewhere to go." /></div></td></tr>
        )}
        {recipients.map((recipient) => (
         <tr key={recipient.id} className="hover:bg-muted/30 transition-colors">
          <td className="px-4 py-3">
           <span className="block text-sm font-medium text-foreground">{recipient.name || recipient.email}</span>
           {recipient.name && <span className="block text-xs text-muted-foreground">{recipient.email}</span>}
          </td>
          <td className="px-4 py-3">
           <label className="inline-flex items-center gap-2 min-h-10 cursor-pointer text-sm text-foreground">
            <input
             type="checkbox"
             role="switch"
             checked={recipient.isActive}
             onChange={() => handleToggle(recipient)}
             aria-label={`Send alerts to ${recipient.email}`}
             className="w-[18px] h-[18px] accent-emerald-700"
            />
            {recipient.isActive ? 'On' : 'Off'}
           </label>
          </td>
          <td className="px-4 py-3 text-right whitespace-nowrap">
           <button type="button" onClick={() => setEditor({ id: recipient.id, email: recipient.email, name: recipient.name || '' })} aria-label={`Edit ${recipient.email}`} className="w-10 h-10 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/50"><Pencil className="w-4 h-4" /></button>
           <button type="button" onClick={() => handleRemove(recipient)} aria-label={`Remove ${recipient.email}`} className="w-10 h-10 inline-flex items-center justify-center rounded-lg text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20"><Trash2 className="w-4 h-4" /></button>
          </td>
         </tr>
        ))}
       </tbody>
      </table>
     </div>
    </div>
   )}

   <div className="bg-card rounded-2xl border border-border p-5">
    <h3 className="text-sm font-bold text-foreground mb-2">What sends an alert</h3>
    <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
     {ALERT_TYPES.map((alert) => <li key={alert}>{alert}</li>)}
    </ul>
   </div>

   {editor && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
     <div className="fixed inset-0 bg-white/30 dark:bg-white/10 backdrop-blur-md" onClick={() => setEditor(null)}></div>
     <div role="dialog" aria-modal="true" aria-label={editor.id ? 'Edit recipient' : 'Add recipient'} className="relative bg-card rounded-2xl p-6 w-full max-w-md mx-4 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-black/10">
      <h3 className="text-lg font-semibold text-foreground mb-4">{editor.id ? 'Edit recipient' : 'Add recipient'}</h3>
      <form onSubmit={handleSave} className="space-y-4">
       <label className="block text-sm font-medium text-foreground/90">
        Email
        <input type="email" required autoFocus value={editor.email} onChange={(e) => setEditor({ ...editor, email: e.target.value })} className={INPUT} />
       </label>
       <label className="block text-sm font-medium text-foreground/90">
        Name (optional)
        <input value={editor.name} maxLength={100} onChange={(e) => setEditor({ ...editor, name: e.target.value })} placeholder="e.g. Security team" className={INPUT} />
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
