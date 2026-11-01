"use client";

import TabCount from '@/app/components/ui/TabCount';
import { useListTotals } from '@/app/composables/useListTotals';
import { useDataVersion } from '@/app/composables/useDataVersion';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import FilterBar from '@/app/components/ui/FilterBar';
import Pagination from '@/app/components/ui/Pagination';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import { approvals_api } from '@/app/api_factory/modules/approvals';
import { APPROVAL_STATUS_LABELS, APPROVAL_STATUS_STYLES, formatApprovalDate } from './approvalLabels';

const TH = 'px-4 py-3.5 text-left text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider whitespace-nowrap';

type View = 'to_decide' | 'mine' | 'all';
const VIEWS: { id: View; label: string }[] = [
 { id: 'to_decide', label: 'Waiting for me' },
 { id: 'mine', label: 'My requests' },
 { id: 'all', label: 'All' },
];

export default function ApprovalsPage() {
 const dataVersion = useDataVersion();
 const [view, setView] = useState<View>('to_decide');
 const [status, setStatus] = useState('');
 const [page, setPage] = useState(1);
 const [limit, setLimit] = useState(25);
 const [rows, setRows] = useState<any[]>([]);
 const [total, setTotal] = useState(0);
 const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

 const totals = useListTotals({
  to_decide: () => approvals_api.list({ view: 'to_decide', limit: 1 }),
  mine: () => approvals_api.list({ view: 'mine', limit: 1 }),
  all: () => approvals_api.list({ limit: 1 }),
 });

 const load = useCallback(async () => {
  setState('loading');
  const params: any = { page, limit };
  if (view !== 'all') params.view = view;
  if (status && status !== 'none') params.status = status;
  const res: any = await approvals_api.list(params);
  if (res?.type === 'ERROR') {
   setState('error');
   return;
  }
  setRows(res.data?.data || []);
  setTotal(res.data?.meta?.total || 0);
  setState('ready');
 }, [view, status, page, limit]);

 useEffect(() => { load(); }, [load, dataVersion]);

 const switchView = (next: View) => {
  setView(next);
  setStatus('');
  setPage(1);
 };

 return (
  <main className="w-full space-y-4">
   <div className="border-b border-border">
    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
     {VIEWS.map((tab) => (
      <button key={tab.id} onClick={() => switchView(tab.id)} aria-current={view === tab.id ? 'page' : undefined} className={`whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm transition-colors ${view === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`}>
       {tab.label}
       <TabCount count={totals[tab.id]} active={view === tab.id} />
      </button>
     ))}
    </nav>
   </div>
   {view !== 'to_decide' && (
    <FilterBar
     onChange={() => setPage(1)}
     filters={[{ key: 'status', label: 'Status', type: 'select', value: status, emptyValue: 'none', options: Object.entries(APPROVAL_STATUS_LABELS).map(([value, label]) => ({ value, label })), onChange: setStatus }]}
    />
   )}
   {state === 'loading' && <PulseLoader />}
   {state === 'error' && <p className="text-red-600 py-12 text-center">Could not load approvals.</p>}
   {state === 'ready' && (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
     <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border">
       <thead className="bg-[#E9F4EE] dark:bg-emerald-950/20">
        <tr>
         <th scope="col" className={TH}>Request</th>
         <th scope="col" className={TH}>Requested by</th>
         <th scope="col" className={TH}>Assigned to</th>
         <th scope="col" className={TH}>Date</th>
         <th scope="col" className={TH}>Status</th>
        </tr>
       </thead>
       <tbody className="divide-y divide-border">
        {rows.length === 0 && (
         <tr><td colSpan={5} className="p-8"><div className="flex justify-center"><EmptyState title={view === 'to_decide' ? 'Nothing is waiting for you.' : 'No requests found.'} /></div></td></tr>
        )}
        {rows.map((row) => (
         <tr key={row.id} className="hover:bg-muted/30 transition-colors">
          <td className="px-4 py-3 text-sm">
           <Link href={`/dashboard/approvals/${row.id}`} className="block font-medium text-[#016B41] dark:text-emerald-400 hover:underline">{row.summary?.title}</Link>
           {row.summary?.subject && <span className="block text-xs text-muted-foreground">{row.summary.subject}</span>}
          </td>
          <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">{row.requestedBy?.fullName}</td>
          <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">{row.assignedTo?.fullName || <span className="text-muted-foreground">Any approver</span>}</td>
          <td className="px-4 py-3 text-xs text-foreground whitespace-nowrap">{formatApprovalDate(row.createdAt)}</td>
          <td className="px-4 py-3 whitespace-nowrap"><span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${APPROVAL_STATUS_STYLES[row.status]}`}>{APPROVAL_STATUS_LABELS[row.status]}</span></td>
         </tr>
        ))}
       </tbody>
      </table>
     </div>
     {rows.length > 0 && (
      <div className="border-t border-border/50 py-4 px-4">
       <Pagination totalItems={total} currentPage={page} itemsPerPage={limit} onPageChange={setPage} onItemsPerPageChange={(value) => { setLimit(value); setPage(1); }} />
      </div>
     )}
    </div>
   )}
  </main>
 );
}
