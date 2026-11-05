"use client";

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { clientAssignment_api } from '@/app/api_factory/modules/devices';
import { useToast } from '@/app/composables/useToast';
import PersonPicker, { PickedPerson } from './PersonPicker';

/** Moves every client assigned to one agent to another (e.g. the agent left or is on leave). */
export default function MoveClientsDialog({ agentId, agentName, onClose }: { agentId: string; agentName: string; onClose: () => void }) {
 const { addToast } = useToast();
 const [to, setTo] = useState<PickedPerson | null>(null);
 const [reason, setReason] = useState('');
 const [saving, setSaving] = useState(false);

 const submit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!to) return;
  setSaving(true);
  const res: any = await clientAssignment_api.reassignAgentClients(agentId, { toAgentId: to.id, reason: reason.trim() });
  setSaving(false);
  if (res?.type === 'ERROR') return;
  const moved = res.data?.moved ?? 0;
  addToast(moved ? `Moved ${moved} ${moved === 1 ? 'client' : 'clients'} to ${to.fullName}` : `${agentName} has no clients to move`, moved ? 'success' : 'info');
  onClose();
 };

 return createPortal(
  <div className="fixed inset-0 z-modal flex items-center justify-center">
   <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm" onClick={saving ? undefined : onClose} />
   <form onSubmit={submit} role="dialog" aria-modal="true" aria-label="Move clients" className="relative bg-card rounded-2xl p-6 w-full max-w-md mx-4 border border-border shadow-2xl space-y-4">
    <div className="flex items-start justify-between">
     <h3 className="text-lg font-semibold text-foreground">Move {agentName}&apos;s clients</h3>
     <button type="button" onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
    </div>
    <p className="text-sm text-muted-foreground">Every client assigned to {agentName} moves to the agent you pick. {agentName} stops seeing them in the app.</p>
    <div>
     <span className="block text-sm font-medium text-foreground mb-1">Move to</span>
     <PersonPicker kind="agent" label="Move to agent" value={to} onChange={setTo} excludeId={agentId} />
    </div>
    <label className="block text-sm font-medium text-foreground">
     Reason <span className="text-rose-600">*</span>
     <textarea required rows={2} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Agent resigned" className="mt-1 w-full px-3 py-2.5 bg-card border border-border rounded-lg text-sm font-normal outline-none focus:ring-1 focus:ring-emerald-200 focus:border-emerald-400" />
    </label>
    <div className="flex gap-3">
     <button type="button" onClick={onClose} disabled={saving} className="flex-1 h-11 rounded-lg text-sm text-foreground bg-muted/50 hover:bg-muted">Cancel</button>
     <button type="submit" disabled={saving || !to || reason.trim().length < 5} className="flex-1 h-11 rounded-lg text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50">{saving ? 'Moving...' : 'Move clients'}</button>
    </div>
   </form>
  </div>,
  document.body,
 );
}
