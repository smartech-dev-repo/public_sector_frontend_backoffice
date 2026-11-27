"use client";

import { useDataVersion } from '@/app/composables/useDataVersion';
import { useEffect, useState } from 'react';
import { Laptop } from 'lucide-react';
import FilterBar, { dateRangeParams } from '@/app/components/ui/FilterBar';
import Pagination from '@/app/components/ui/Pagination';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import { useSessions } from '@/app/composables/modules/useSessions';
import { useConfirm } from '@/app/composables/useConfirm';
import { useToast } from '@/app/composables/useToast';
import { describeDevice } from '@/app/dashboard/audit-logs/components/auditFormat';

const dateTime = (value: string) =>
 new Date(value).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function ActiveSessionsTab({ onCountChange }: { onCountChange?: (count: number) => void }) {
 const dataVersion = useDataVersion();
 const { loading, sessions, meta, fetchSessions, deleteSession } = useSessions();
 const { confirm } = useConfirm();
 const { addToast } = useToast();
 const [page, setPage] = useState(1);
 const [limit, setLimit] = useState(25);
 const [search, setSearch] = useState('');
 const [signedIn, setSignedIn] = useState('');

 const load = () => {
  const params: any = { page, limit, ...dateRangeParams(signedIn, 'createdFrom', 'createdTo') };
  if (search.trim()) params.q = search.trim();
  return fetchSessions(params);
 };

 useEffect(() => { load(); }, [page, limit, search, signedIn, dataVersion]); // eslint-disable-line react-hooks/exhaustive-deps

 useEffect(() => {
  if (!search.trim() && !signedIn) onCountChange?.(meta.total);
 }, [meta.total, search, signedIn, onCountChange]);

 const handleRevoke = async (id: string) => {
  const proceed = await confirm({ message: 'Sign out this device? If this is the device you are using, you will be signed out when your access expires.' });
  if (!proceed) return;
  try {
   await deleteSession(id);
   addToast('Device signed out', 'success');
  } catch (err: any) {
   addToast(err?.response?.data?.message || 'Failed to sign out this device', 'error');
  }
 };

 return (
  <div className="space-y-4">
   <div>
    <h3 className="text-lg font-bold text-foreground">Active Sessions</h3>
    <p className="text-xs text-muted-foreground mt-1">Devices signed in to your account. Sign out any you don't recognise.</p>
   </div>
   <FilterBar
    onChange={() => setPage(1)}
    search={{ value: search, onChange: setSearch, placeholder: 'Search IP or device' }}
    filters={[{ key: 'signedIn', label: 'Signed in', type: 'dateRange', value: signedIn, onChange: setSignedIn }]}
   />
   {loading && sessions.length === 0 ? <PulseLoader /> : (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
     <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
       <thead>
        <tr className="bg-[#E9F4EE] dark:bg-emerald-950/20 text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
         <th scope="col" className="py-3.5 px-4">Device and IP</th>
         <th scope="col" className="py-3.5 px-4">Signed in</th>
         <th scope="col" className="py-3.5 px-4">Last active</th>
         <th scope="col" aria-label="Actions" className="py-3.5 px-4"></th>
        </tr>
       </thead>
       <tbody className="divide-y divide-border">
        {sessions.length === 0 && (
         <tr><td colSpan={4} className="p-8"><div className="flex justify-center"><EmptyState title="No sessions found." /></div></td></tr>
        )}
        {sessions.map((session: any) => (
         <tr key={session.id} className="hover:bg-muted/30 transition-colors">
          <td className="py-3 px-4">
           <span className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-[#E8F5EE] text-[#018752] flex items-center justify-center shrink-0"><Laptop className="w-4 h-4" /></span>
            <span>
             <span className="block font-medium text-foreground">{describeDevice(session.userAgent) || 'Unknown device'}</span>
             <span className="block text-xs text-muted-foreground font-mono">{session.ip || 'IP not recorded'}</span>
            </span>
           </span>
          </td>
          <td className="py-3 px-4 text-muted-foreground text-xs whitespace-nowrap">{dateTime(session.createdAt)}</td>
          <td className="py-3 px-4 text-muted-foreground text-xs whitespace-nowrap">{dateTime(session.lastUsedAt)}</td>
          <td className="py-3 px-4 text-right">
           <button onClick={() => handleRevoke(session.id)} className="h-10 px-3 text-xs font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors">Sign out</button>
          </td>
         </tr>
        ))}
       </tbody>
      </table>
     </div>
     {sessions.length > 0 && (
      <div className="border-t border-border/50 py-4 px-4">
       <Pagination totalItems={meta.total || 0} currentPage={page} itemsPerPage={limit} onPageChange={setPage} onItemsPerPageChange={(value) => { setLimit(value); setPage(1); }} />
      </div>
     )}
    </div>
   )}
  </div>
 );
}
