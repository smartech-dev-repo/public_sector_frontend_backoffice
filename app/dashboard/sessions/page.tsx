"use client";

import { useCallback, useEffect, useState } from 'react';
import FilterBar, { dateRangeParams } from '@/app/components/ui/FilterBar';
import Pagination from '@/app/components/ui/Pagination';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import Avatar from '@/app/components/ui/Avatar';
import { sessions_api } from '@/app/api_factory/modules/sessions';
import { useAdminPermissions } from '@/app/composables/useAdminPermissions';
import { useConfirm } from '@/app/composables/useConfirm';
import { useToast } from '@/app/composables/useToast';
import { describeDevice, principalName } from '@/app/dashboard/reports/components/auditFormat';
import UserSessionsPanel, { SessionStatusBadge, formatSessionDate } from './UserSessionsPanel';

const TH = 'px-4 py-3.5 text-left text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider whitespace-nowrap';
const USER_TYPE_LABELS: Record<string, string> = { ADMIN: 'Admin', AGENT: 'Agent', CLIENT: 'Client' };

export default function UserSessionsPage() {
 const { isSuperAdmin, hasPermission } = useAdminPermissions();
 const canManage = isSuperAdmin || hasPermission('sessions:manage');
 const { confirm } = useConfirm();
 const { addToast } = useToast();

 const [page, setPage] = useState(1);
 const [limit, setLimit] = useState(25);
 const [search, setSearch] = useState('');
 const [userType, setUserType] = useState('');
 const [status, setStatus] = useState('active');
 const [signedIn, setSignedIn] = useState('');
 const [sessions, setSessions] = useState<any[]>([]);
 const [total, setTotal] = useState(0);
 const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
 const [viewing, setViewing] = useState<any>(null);

 const load = useCallback(async () => {
  const params: any = { page, limit, ...dateRangeParams(signedIn, 'createdFrom', 'createdTo') };
  if (search.trim()) params.q = search.trim();
  if (userType && userType !== 'none') params.userType = userType;
  if (status && status !== 'none') params.status = status;
  const res: any = await sessions_api.getUserSessions(params);
  if (res?.type === 'ERROR') {
   setState('error');
   return;
  }
  setSessions(res.data?.data || []);
  setTotal(res.data?.meta?.total || 0);
  setState('ready');
 }, [page, limit, search, userType, status, signedIn]);

 useEffect(() => {
  if (canManage) load();
 }, [canManage, load]);

 const handleRevoke = async (session: any) => {
  const name = principalName(session.user) || 'this user';
  const proceed = await confirm({ title: 'Sign out this device?', message: `${name} will be signed out on this device within 15 minutes.`, confirmText: 'Sign out' });
  if (!proceed) return;
  const res: any = await sessions_api.revokeUserSession(session.id);
  if (res?.type !== 'ERROR') addToast('Session signed out', 'success');
  load();
 };

 if (!canManage) {
  return <EmptyState title="Access Restricted" description="You do not have permission to view user sessions." />;
 }

 return (
  <main className="w-full space-y-4">
   <FilterBar
    onChange={() => setPage(1)}
    search={{ value: search, onChange: setSearch, placeholder: 'Name, email or phone' }}
    filters={[
     { key: 'status', label: 'Status', type: 'select', value: status, emptyValue: 'none', options: [{ value: 'active', label: 'Active' }, { value: 'revoked', label: 'Signed out' }, { value: 'expired', label: 'Expired' }], onChange: setStatus },
     { key: 'userType', label: 'User type', type: 'select', value: userType, emptyValue: 'none', options: [{ value: 'ADMIN', label: 'Admin' }, { value: 'AGENT', label: 'Agent' }, { value: 'CLIENT', label: 'Client' }], onChange: setUserType },
     { key: 'signedIn', label: 'Signed in', type: 'dateRange', value: signedIn, onChange: setSignedIn },
    ]}
   />
   {state === 'loading' && <PulseLoader />}
   {state === 'error' && <p className="text-red-600 py-12 text-center">Could not load sessions.</p>}
   {state === 'ready' && (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
     <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border">
       <thead className="bg-[#E9F4EE] dark:bg-emerald-950/20">
        <tr>
         <th scope="col" className={TH}>User</th>
         <th scope="col" className={TH}>Type</th>
         <th scope="col" className={TH}>Device and IP</th>
         <th scope="col" className={TH}>Signed in</th>
         <th scope="col" className={TH}>Last active</th>
         <th scope="col" className={TH}>Status</th>
         <th scope="col" aria-label="Actions" className={TH}></th>
        </tr>
       </thead>
       <tbody className="divide-y divide-border">
        {sessions.length === 0 && (
         <tr><td colSpan={7} className="p-8"><div className="flex justify-center"><EmptyState title="No sessions found." /></div></td></tr>
        )}
        {sessions.map((session) => {
         const name = principalName(session.user) || 'Removed user';
         const contact = session.user?.email || session.user?.phone;
         return (
          <tr key={session.id} className="hover:bg-muted/30 transition-colors">
           <td className="px-4 py-3 whitespace-nowrap">
            <span className="flex items-center gap-2.5">
             <Avatar name={name} />
             <span className="min-w-0">
              <button type="button" onClick={() => setViewing(session)} className="block text-sm font-medium text-foreground hover:text-[#018752] hover:underline text-left">{name}</button>
              {contact && contact !== name && <span className="block text-xs text-muted-foreground">{contact}</span>}
             </span>
            </span>
           </td>
           <td className="px-4 py-3 text-sm text-foreground">{USER_TYPE_LABELS[session.principalType]}</td>
           <td className="px-4 py-3 whitespace-nowrap">
            <span className="block text-sm text-foreground">{describeDevice(session.userAgent) || 'Unknown device'}</span>
            <span className="block text-xs font-mono text-muted-foreground">{session.ip || 'IP not recorded'}</span>
           </td>
           <td className="px-4 py-3 whitespace-nowrap text-xs text-foreground">{formatSessionDate(session.createdAt)}</td>
           <td className="px-4 py-3 whitespace-nowrap text-xs text-foreground">{formatSessionDate(session.lastUsedAt)}</td>
           <td className="px-4 py-3 whitespace-nowrap"><SessionStatusBadge status={session.status} /></td>
           <td className="px-4 py-3 text-right whitespace-nowrap">
            <button type="button" onClick={() => setViewing(session)} className="h-10 px-3 text-xs font-semibold text-foreground hover:bg-muted/50 rounded-lg">View</button>
            {session.status === 'active' && (
             <button type="button" onClick={() => handleRevoke(session)} className="h-10 px-3 text-xs font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg">Sign out</button>
            )}
           </td>
          </tr>
         );
        })}
       </tbody>
      </table>
     </div>
     {sessions.length > 0 && (
      <div className="border-t border-border/50 py-4 px-4">
       <Pagination totalItems={total} currentPage={page} itemsPerPage={limit} onPageChange={setPage} onItemsPerPageChange={(value) => { setLimit(value); setPage(1); }} />
      </div>
     )}
    </div>
   )}
   {viewing && <UserSessionsPanel session={viewing} onClose={() => setViewing(null)} onChanged={load} />}
  </main>
 );
}
