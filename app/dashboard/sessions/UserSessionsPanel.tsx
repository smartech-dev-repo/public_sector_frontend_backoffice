"use client";

import { useCallback, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import Pagination from '@/app/components/ui/Pagination';
import Avatar from '@/app/components/ui/Avatar';
import { sessions_api } from '@/app/api_factory/modules/sessions';
import { auditLogs_api } from '@/app/api_factory/modules/auditLogs';
import { useAdminPermissions } from '@/app/composables/useAdminPermissions';
import { useConfirm } from '@/app/composables/useConfirm';
import { useToast } from '@/app/composables/useToast';
import { OUTCOME_LABELS, OUTCOME_STYLES, describeAction, describeDevice, principalName } from '@/app/dashboard/reports/components/auditFormat';

export const formatSessionDate = (value: string) =>
 new Date(value).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const STATUS_STYLES: Record<string, string> = {
 active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
 revoked: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
 expired: 'bg-muted text-muted-foreground',
};
const STATUS_LABELS: Record<string, string> = { active: 'Active', revoked: 'Signed out', expired: 'Expired' };

export const SessionStatusBadge = ({ status }: { status: string }) => (
 <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status]}`}>{STATUS_LABELS[status]}</span>
);

interface UserSessionsPanelProps {
 session: any;
 onClose: () => void;
 onChanged: () => void;
}

export default function UserSessionsPanel({ session, onClose, onChanged }: UserSessionsPanelProps) {
 const { isSuperAdmin, hasPermission } = useAdminPermissions();
 const canViewLogs = isSuperAdmin || hasPermission('audit:read');
 const { confirm } = useConfirm();
 const { addToast } = useToast();
 const [tab, setTab] = useState<'sessions' | 'activity'>('sessions');
 const [page, setPage] = useState(1);
 const [limit, setLimit] = useState(25);
 const [rows, setRows] = useState<any[]>([]);
 const [total, setTotal] = useState(0);
 const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

 const name = principalName(session.user) || 'Removed user';
 const contact = session.user?.email || session.user?.phone;
 const userId = session.principalId;

 const load = useCallback(async () => {
  setState('loading');
  const res: any = tab === 'sessions'
   ? await sessions_api.getUserSessions({ userType: session.principalType, userId, page, limit })
   : await auditLogs_api.getLogs({ actorId: userId, page, limit });
  if (res?.type === 'ERROR') {
   setState('error');
   return;
  }
  setRows(res.data?.data || []);
  setTotal(res.data?.meta?.total || 0);
  setState('ready');
 }, [tab, session.principalType, userId, page, limit]);

 useEffect(() => { load(); }, [load]);

 const switchTab = (next: 'sessions' | 'activity') => {
  setTab(next);
  setPage(1);
 };

 const handleRevoke = async (id: string) => {
  const res: any = await sessions_api.revokeUserSession(id);
  if (res?.type !== 'ERROR') addToast('Session signed out', 'success');
  load();
  onChanged();
 };

 const handleRevokeAll = async () => {
  const proceed = await confirm({ title: 'Sign out everywhere?', message: `${name} will be signed out on every device within 15 minutes.`, confirmText: 'Sign out everywhere' });
  if (!proceed) return;
  const res: any = await sessions_api.revokeAllForUser({ userType: session.principalType, userId });
  if (res?.type !== 'ERROR') addToast(`${name} signed out everywhere`, 'success');
  load();
  onChanged();
 };

 return (
  <div className="fixed inset-0 z-modal">
   <div className="fixed inset-0 bg-black/30" onClick={onClose}></div>
   <aside aria-label={`${name}'s sessions and activity`} className="fixed top-0 right-0 bottom-0 w-full sm:w-[520px] bg-card border-l border-border flex flex-col">
    <div className="p-5 border-b border-border space-y-3">
     <div className="flex items-start justify-between gap-3">
      <span className="flex items-center gap-3 min-w-0">
       <Avatar name={name} />
       <span className="min-w-0">
        <span className="block text-base font-bold text-foreground truncate">{name}</span>
        {contact && contact !== name && <span className="block text-xs text-muted-foreground truncate">{contact}</span>}
       </span>
      </span>
      <button type="button" onClick={onClose} aria-label="Close" className="w-10 h-10 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/50"><X className="w-5 h-5" /></button>
     </div>
     <button type="button" onClick={handleRevokeAll} className="h-10 px-3.5 border border-border rounded-lg text-sm font-medium text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20">Sign out everywhere</button>
     <div role="tablist" className="flex gap-5">
      <button role="tab" aria-selected={tab === 'sessions'} onClick={() => switchTab('sessions')} className={`pb-1.5 text-sm border-b-2 ${tab === 'sessions' ? 'border-emerald-700 text-emerald-700 dark:text-emerald-400 font-bold' : 'border-transparent text-muted-foreground font-medium'}`}>Sessions</button>
      {canViewLogs && <button role="tab" aria-selected={tab === 'activity'} onClick={() => switchTab('activity')} className={`pb-1.5 text-sm border-b-2 ${tab === 'activity' ? 'border-emerald-700 text-emerald-700 dark:text-emerald-400 font-bold' : 'border-transparent text-muted-foreground font-medium'}`}>Activity log</button>}
     </div>
    </div>
    <div className="flex-1 overflow-y-auto p-5">
     {state === 'loading' && <PulseLoader />}
     {state === 'error' && <p className="text-sm text-red-600 py-8 text-center">Could not load this.</p>}
     {state === 'ready' && rows.length === 0 && <EmptyState title={tab === 'sessions' ? 'No sessions found.' : 'No activity recorded.'} />}
     {state === 'ready' && rows.length > 0 && (
      <ul className="divide-y divide-border">
       {tab === 'sessions' && rows.map((row) => (
        <li key={row.id} className="py-3 flex items-center justify-between gap-3">
         <span className="min-w-0">
          <span className="block text-sm font-medium text-foreground">{describeDevice(row.userAgent) || 'Unknown device'}</span>
          <span className="block text-xs text-muted-foreground"><span className="font-mono">{row.ip || 'IP not recorded'}</span> · last active {formatSessionDate(row.lastUsedAt)}</span>
         </span>
         {row.status === 'active'
          ? <button type="button" onClick={() => handleRevoke(row.id)} className="h-10 px-3 shrink-0 text-xs font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg">Sign out</button>
          : <SessionStatusBadge status={row.status} />}
        </li>
       ))}
       {tab === 'activity' && rows.map((log) => (
        <li key={log.id} className="py-3">
         <span className="flex items-start justify-between gap-3">
          <span className="text-sm font-medium text-foreground">{describeAction(log.action)}</span>
          <span className={`shrink-0 px-2 py-0.5 rounded-full text-[11px] font-medium ${OUTCOME_STYLES[log.outcome]}`}>{OUTCOME_LABELS[log.outcome]}</span>
         </span>
         {log.reason && <span className="block text-xs text-muted-foreground">{log.reason}</span>}
         <span className="block text-xs text-muted-foreground">{formatSessionDate(log.createdAt)}{log.ip ? ` · ${log.ip}` : ''}</span>
        </li>
       ))}
      </ul>
     )}
    </div>
    {state === 'ready' && rows.length > 0 && (
     <Pagination totalItems={total} currentPage={page} itemsPerPage={limit} onPageChange={setPage} onItemsPerPageChange={(value) => { setLimit(value); setPage(1); }} />
    )}
   </aside>
  </div>
 );
}
