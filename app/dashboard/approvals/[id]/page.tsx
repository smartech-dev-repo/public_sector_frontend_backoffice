"use client";

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/app/components/ui/Select';
import { approvals_api } from '@/app/api_factory/modules/approvals';
import { announceNotificationsChanged } from '@/app/composables/modules/useNotificationSummary';
import { useConfirm } from '@/app/composables/useConfirm';
import { useToast } from '@/app/composables/useToast';
import { APPROVAL_STATUS_LABELS, APPROVAL_STATUS_STYLES, formatApprovalDate } from '../approvalLabels';

const ANY_APPROVER = 'any';

const Detail = ({ label, children }: { label: string; children: React.ReactNode }) => (
 <div>
  <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
  <dd className="text-sm text-foreground break-words">{children}</dd>
 </div>
);

export default function ApprovalDetailPage() {
 const { id } = useParams<{ id: string }>();
 const { confirm } = useConfirm();
 const { addToast } = useToast();
 const [approval, setApproval] = useState<any>(null);
 const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading');
 const [assignees, setAssignees] = useState<any[]>([]);
 const [note, setNote] = useState('');
 const [rejecting, setRejecting] = useState(false);
 const [busy, setBusy] = useState(false);

 const load = useCallback(async () => {
  const res: any = await approvals_api.getById(id);
  if (res?.type === 'ERROR') {
   setState('missing');
   return;
  }
  setApproval(res.data);
  setState('ready');
  if (res.data.canAssign) {
   const people: any = await approvals_api.listAssignees(id);
   if (people?.type !== 'ERROR') setAssignees(people.data || []);
  }
 }, [id]);

 useEffect(() => { load(); }, [load]);

 // The API layer shows the server's message for a refused action.
 const act = async (run: () => Promise<any>, success: string) => {
  setBusy(true);
  const res = await run();
  setBusy(false);
  if (res?.type !== 'ERROR') addToast(success, 'success');
  setRejecting(false);
  setNote('');
  announceNotificationsChanged();
  load();
 };

 const handleApprove = async () => {
  const proceed = await confirm({ title: 'Approve this request?', message: `${approval.summary.title} will run straight away.`, confirmText: 'Approve' });
  if (proceed) act(() => approvals_api.approve(id, note.trim() || undefined), 'Approved and carried out');
 };

 const handleReject = (e: React.FormEvent) => {
  e.preventDefault();
  if (note.trim()) act(() => approvals_api.reject(id, note.trim()), 'Request rejected');
 };

 const handleCancel = async () => {
  const proceed = await confirm({ title: 'Withdraw this request?', message: 'It will no longer wait for approval.', confirmText: 'Withdraw' });
  if (proceed) act(() => approvals_api.cancel(id), 'Request withdrawn');
 };

 const handleAssign = (value: string) => {
  act(() => approvals_api.assign(id, value === ANY_APPROVER ? null : value), value === ANY_APPROVER ? 'Open to any approver' : 'Request assigned');
 };

 if (state === 'loading') return <PulseLoader />;
 if (state === 'missing') return <EmptyState title="Request not found" description="It may not exist, or you may not have access to it." />;

 const { summary } = approval;
 const isMaker = !approval.canDecide && approval.status === 'PENDING' && !approval.canAssign;

 return (
  <main className="w-full max-w-3xl space-y-4">
   <Link href="/dashboard/approvals" className="inline-flex items-center gap-1.5 min-h-10 text-sm font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4" /> Back to Approvals</Link>
   <section className="bg-card border border-border rounded-2xl p-6 space-y-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
     <div>
      <h2 className="text-lg font-bold text-foreground">{summary.title}</h2>
      {summary.subject && <p className="text-sm text-muted-foreground">{summary.subject}</p>}
     </div>
     <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${APPROVAL_STATUS_STYLES[approval.status]}`}>{APPROVAL_STATUS_LABELS[approval.status]}</span>
    </div>
    <dl className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(200px,1fr))]">
     {summary.details?.map((detail: any) => <Detail key={detail.label} label={detail.label}>{detail.value}</Detail>)}
     <Detail label="Requested by">{approval.requestedBy?.fullName}</Detail>
     <Detail label="Requested on">{formatApprovalDate(approval.createdAt)}</Detail>
     <Detail label="Assigned to">{approval.assignedTo?.fullName || 'Any approver'}</Detail>
     {approval.decidedBy && <Detail label="Decided by">{approval.decidedBy.fullName}</Detail>}
     {approval.decidedAt && <Detail label="Decided on">{formatApprovalDate(approval.decidedAt)}</Detail>}
     {approval.decisionNote && <Detail label={approval.status === 'REJECTED' ? 'Reason' : 'Note'}>{approval.decisionNote}</Detail>}
     {approval.failureReason && <Detail label="Why it could not complete">{approval.failureReason}</Detail>}
    </dl>
    {summary.link && <Link href={summary.link} className="inline-block text-sm font-semibold text-[#016B41] dark:text-emerald-400 hover:underline">Open the record</Link>}
   </section>

   {approval.canAssign && (
    <section className="bg-card border border-border rounded-2xl p-6 space-y-2">
     <h3 className="text-sm font-bold text-foreground" id="assign-label">Who decides this?</h3>
     <p className="text-xs text-muted-foreground">Assign it to one admin, who then becomes the only person able to decide it.</p>
     <Select value={approval.assignedToId ?? ANY_APPROVER} onValueChange={handleAssign}>
      <SelectTrigger aria-labelledby="assign-label" className="w-full sm:w-80"><SelectValue placeholder="Any approver" /></SelectTrigger>
      <SelectContent>
       <SelectItem value={ANY_APPROVER}>Any approver</SelectItem>
       {assignees.map((admin) => <SelectItem key={admin.id} value={admin.id}>{admin.fullName}</SelectItem>)}
      </SelectContent>
     </Select>
    </section>
   )}

   {approval.canDecide && (
    <section className="bg-card border border-border rounded-2xl p-6 space-y-3">
     <h3 className="text-sm font-bold text-foreground">Your decision</h3>
     {rejecting ? (
      <form onSubmit={handleReject} className="space-y-3">
       <label className="block text-sm font-medium text-foreground/90">
        Reason for rejecting
        <textarea value={note} onChange={(e) => setNote(e.target.value)} required maxLength={500} rows={3} autoFocus className="mt-1 w-full px-4 py-2.5 border border-border rounded-lg text-sm font-normal outline-none focus:ring-1 focus:ring-emerald-200 focus:border-emerald-400" />
       </label>
       <div className="flex gap-2">
        <button type="button" onClick={() => setRejecting(false)} className="h-11 px-4 border border-border rounded-lg text-sm font-semibold text-foreground">Back</button>
        <button type="submit" disabled={busy || !note.trim()} className="h-11 px-4 rounded-lg text-sm font-semibold text-white bg-rose-700 hover:bg-rose-800 disabled:opacity-50">Reject request</button>
       </div>
      </form>
     ) : (
      <div className="flex flex-wrap gap-2">
       <button type="button" onClick={handleApprove} disabled={busy} className="h-11 px-5 rounded-lg text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50">Approve</button>
       <button type="button" onClick={() => setRejecting(true)} disabled={busy} className="h-11 px-5 border border-border rounded-lg text-sm font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20">Reject</button>
      </div>
     )}
    </section>
   )}

   {approval.isMine && approval.status === 'PENDING' && (
    <section className="bg-card border border-border rounded-2xl p-6 flex flex-wrap items-center justify-between gap-3">
     <p className="text-sm text-muted-foreground">You made this request, so another admin must decide it.</p>
     <button type="button" onClick={handleCancel} disabled={busy} className="h-11 px-4 border border-border rounded-lg text-sm font-semibold text-foreground">Withdraw request</button>
    </section>
   )}
   {isMaker && !approval.isMine && <p className="text-sm text-muted-foreground">This is assigned to another admin.</p>}
  </main>
 );
}
