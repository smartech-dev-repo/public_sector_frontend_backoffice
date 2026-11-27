"use client";

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { History, UserCog, X } from 'lucide-react';
import { clientAssignment_api } from '@/app/api_factory/modules/devices';
import { useDataVersion } from '@/app/composables/useDataVersion';
import { useToast } from '@/app/composables/useToast';
import PersonPicker, { PickedPerson } from './PersonPicker';

const when = (value: string) => new Date(value).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

/**
 * Who looks after this client now (agent and admin), who onboarded them, and every change.
 * The assigned admin decides "own clients only" access; the assigned agent sees the client in the app.
 */
export default function ClientAssignmentPanel({ clientId, canAssign }: { clientId: string; canAssign: boolean }) {
 const dataVersion = useDataVersion();
 const { addToast } = useToast();
 const [data, setData] = useState<any>(null);
 const [editing, setEditing] = useState(false);
 const [agent, setAgent] = useState<PickedPerson | null>(null);
 const [admin, setAdmin] = useState<PickedPerson | null>(null);
 const [removeAgent, setRemoveAgent] = useState(false);
 const [reason, setReason] = useState('');
 const [saving, setSaving] = useState(false);

 const load = useCallback(async () => {
  const res: any = await clientAssignment_api.get(clientId);
  if (res?.type !== 'ERROR') setData(res.data);
 }, [clientId]);

 useEffect(() => { load(); }, [load, dataVersion]);

 const open = () => {
  setAgent(null);
  setAdmin(null);
  setRemoveAgent(false);
  setReason('');
  setEditing(true);
 };

 const save = async (e: React.FormEvent) => {
  e.preventDefault();
  const payload: { agentId?: string | null; adminId?: string | null; reason: string } = { reason: reason.trim() };
  if (agent) payload.agentId = agent.id;
  else if (removeAgent) payload.agentId = null;
  if (admin) payload.adminId = admin.id;
  setSaving(true);
  const res: any = await clientAssignment_api.update(clientId, payload);
  setSaving(false);
  if (res?.type === 'ERROR') return;
  setData(res.data);
  setEditing(false);
  addToast('Assignment updated', 'success');
 };

 if (!data) return null;
 const nothingChosen = !agent && !admin && !removeAgent;
 const onboardedBy = data.onboarding?.onboardedByAgent?.fullName
  ? `${data.onboarding.onboardedByAgent.fullName} (agent)`
  : data.onboarding?.onboardedByAdmin?.fullName
   ? `${data.onboarding.onboardedByAdmin.fullName} (admin)`
   : 'Self-onboarded';

 return (
  <div className="bg-card p-6 rounded-2xl border border-border shadow-xs">
   <div className="flex items-center justify-between gap-3 mb-4 pb-2 border-b border-border/60">
    <div className="flex items-center gap-2">
     <UserCog className="w-4 h-4 text-emerald-600" />
     <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Assigned To</h3>
    </div>
    {canAssign && (
     <button type="button" onClick={open} className="h-9 px-3 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-muted/50">Reassign</button>
    )}
   </div>
   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
    <div>
     <span className="text-xs text-muted-foreground block mb-0.5">Agent</span>
     <span className="font-semibold text-foreground">{data.assignedAgent?.fullName ?? 'No agent'}</span>
     {data.assignedAgent && <span className="block text-xs text-muted-foreground">{data.assignedAgent.phone}</span>}
    </div>
    <div>
     <span className="text-xs text-muted-foreground block mb-0.5">Admin (record owner)</span>
     <span className="font-semibold text-foreground">{data.assignedAdmin?.fullName ?? 'No admin'}</span>
     {data.assignedAdmin && <span className="block text-xs text-muted-foreground break-all">{data.assignedAdmin.email}</span>}
    </div>
    <div>
     <span className="text-xs text-muted-foreground block mb-0.5">Originally onboarded by</span>
     <span className="font-semibold text-foreground">{onboardedBy}</span>
    </div>
   </div>

   {data.history?.length > 0 && (
    <div className="mt-5">
     <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2"><History className="w-3.5 h-3.5" /> Changes</span>
     <ol className="space-y-2">
      {data.history.slice(0, 8).map((h: any) => (
       <li key={h.id} className="text-sm border-l-2 border-border pl-3">
        <span className="text-foreground">
         {h.kind === 'AGENT' ? 'Agent' : 'Admin'}: {h.fromName ?? 'none'} → <b>{h.toName ?? 'none'}</b>
        </span>
        <span className="block text-xs text-muted-foreground">
         {h.reason} · {h.actorName ?? (h.actorType === 'AGENT' ? 'Agent' : 'Admin')} · {when(h.createdAt)}
        </span>
       </li>
      ))}
     </ol>
    </div>
   )}

   {editing &&
    createPortal(
     <div className="fixed inset-0 z-modal flex items-center justify-center">
      <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm" onClick={saving ? undefined : () => setEditing(false)} />
      <form onSubmit={save} role="dialog" aria-modal="true" aria-label="Reassign client" className="relative bg-card rounded-2xl p-6 w-full max-w-md mx-4 border border-border shadow-2xl space-y-4">
       <div className="flex items-start justify-between">
        <h3 className="text-lg font-semibold text-foreground">Reassign client</h3>
        <button type="button" onClick={() => setEditing(false)} aria-label="Close" className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
       </div>
       <div>
        <span className="block text-sm font-medium text-foreground mb-1">New agent <span className="font-normal text-muted-foreground">(now: {data.assignedAgent?.fullName ?? 'none'})</span></span>
        <PersonPicker kind="agent" label="New agent" value={agent} onChange={(p) => { setAgent(p); if (p) setRemoveAgent(false); }} excludeId={data.assignedAgent?.id} />
        {data.assignedAgent && !agent && (
         <label className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <input type="checkbox" checked={removeAgent} onChange={(e) => setRemoveAgent(e.target.checked)} className="accent-emerald-700" /> Remove the agent instead
         </label>
        )}
       </div>
       <div>
        <span className="block text-sm font-medium text-foreground mb-1">New admin <span className="font-normal text-muted-foreground">(now: {data.assignedAdmin?.fullName ?? 'none'})</span></span>
        <PersonPicker kind="admin" label="New admin" value={admin} onChange={setAdmin} excludeId={data.assignedAdmin?.id} />
       </div>
       <label className="block text-sm font-medium text-foreground">
        Reason <span className="text-rose-600">*</span>
        <textarea required rows={2} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Agent moved to another state" className="mt-1 w-full px-3 py-2.5 bg-card border border-border rounded-lg text-sm font-normal outline-none focus:ring-1 focus:ring-emerald-200 focus:border-emerald-400" />
       </label>
       <p className="text-xs text-muted-foreground">The old agent stops seeing this client in the app. Who originally onboarded them doesn&apos;t change.</p>
       <div className="flex gap-3">
        <button type="button" onClick={() => setEditing(false)} disabled={saving} className="flex-1 h-11 rounded-lg text-sm text-foreground bg-muted/50 hover:bg-muted">Cancel</button>
        <button type="submit" disabled={saving || nothingChosen || reason.trim().length < 5} className="flex-1 h-11 rounded-lg text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
       </div>
      </form>
     </div>,
     document.body,
    )}
  </div>
 );
}
