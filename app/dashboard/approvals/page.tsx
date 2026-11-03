"use client";

import TabCount from '@/app/components/ui/TabCount';
import ExportButton, { ExportColumn } from '@/app/components/ui/ExportButton';
import { TabTotalScope, useTabTotals } from '@/app/composables/useTabTotals';
import { useListTotals } from '@/app/composables/useListTotals';
import { useDataVersion } from '@/app/composables/useDataVersion';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import FilterBar from '@/app/components/ui/FilterBar';
import Pagination from '@/app/components/ui/Pagination';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import Modal from '@/app/components/ui/Modal';
import { approvals_api } from '@/app/api_factory/modules/approvals';
import { announceNotificationsChanged } from '@/app/composables/modules/useNotificationSummary';
import { useConfirm } from '@/app/composables/useConfirm';
import { useToast } from '@/app/composables/useToast';
import { APPROVAL_STATUS_LABELS, APPROVAL_STATUS_STYLES, formatApprovalDate } from './approvalLabels';

const TH = 'px-4 py-3.5 text-left text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider whitespace-nowrap';

type View = 'to_decide' | 'mine' | 'all';
const VIEWS: { id: View; label: string }[] = [
 { id: 'to_decide', label: 'Waiting for me' },
 { id: 'mine', label: 'My requests' },
 { id: 'all', label: 'All' },
];

/** Why a pending row has no Approve button, so it never looks like a fault. */
const waitingOn = (row: any): string | null => {
 if (row.status !== 'PENDING') return null;
 if (row.isMine) return 'Another admin must decide this';
 return row.assignedTo ? 'Assigned to another admin' : 'Needs the approval permission';
};


// The list's last filters, reused by Export so it exports what the list shows.
const exportParams: { current: Record<string, unknown> } = { current: {} };

const EXPORT_COLUMNS: ExportColumn<any>[] = [
 { header: 'Request', value: (r) => r.summary?.title },
 { header: 'For', value: (r) => r.summary?.subject },
 { header: 'Status', value: (r) => r.status },
 { header: 'Requested by', value: (r) => r.requestedBy?.fullName },
 { header: 'Assigned to', value: (r) => r.assignedTo?.fullName ?? 'Any approver' },
 { header: 'Created', value: (r) => r.createdAt },
 { header: 'Decided', value: (r) => r.decidedAt },
 { header: 'Reason', value: (r) => r.decisionReason },
];

export default function ApprovalsPage() {
 const dataVersion = useDataVersion();
 const { confirm } = useConfirm();
 const { addToast } = useToast();
 const [busyId, setBusyId] = useState<string | null>(null);
 const [rejecting, setRejecting] = useState<any>(null);
 const [reason, setReason] = useState('');
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
  exportParams.current = params;
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

 const decide = async (id: string, run: () => Promise<any>, success: string) => {
  setBusyId(id);
  const res = await run();
  setBusyId(null);
  if (res?.type !== 'ERROR') addToast(success, 'success');
  announceNotificationsChanged();
 };

 const handleApprove = async (row: any) => {
  const proceed = await confirm({ title: 'Approve this request?', message: `${row.summary?.title} will run straight away.`, confirmText: 'Approve' });
  if (proceed) decide(row.id, () => approvals_api.approve(row.id), 'Approved and carried out');
 };

 const handleReject = () => {
  if (!reason.trim()) {
   addToast('Enter a reason for rejecting', 'error');
   return;
  }
  decide(rejecting.id, () => approvals_api.reject(rejecting.id, reason.trim()), 'Request rejected');
  setRejecting(null);
  setReason('');
 };

 const switchView = (next: View) => {
  setView(next);
  setStatus('');
  setPage(1);
 };

 const { shown: shownTotals, report: reportTabTotal } = useTabTotals(totals, view);

 return (
  <TabTotalScope value={reportTabTotal}>
  <main className="w-full space-y-4">
   <div className="border-b border-border">
    <nav className="-mb-px flex gap-4 sm:gap-8 overflow-x-auto overflow-y-hidden [scrollbar-width:none]" aria-label="Tabs">
     {VIEWS.map((tab) => (
      <button key={tab.id} onClick={() => switchView(tab.id)} aria-current={view === tab.id ? 'page' : undefined} className={`whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm transition-colors ${view === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`}>
       {tab.label}
       <TabCount count={shownTotals[tab.id]} active={view === tab.id} />
      </button>
     ))}
    </nav>
   </div>
   {view !== 'to_decide' && (
    <FilterBar
     onChange={() => setPage(1)}
     filters={[{ key: 'status', label: 'Status', type: 'select', value: status, emptyValue: 'none', options: Object.entries(APPROVAL_STATUS_LABELS).map(([value, label]) => ({ value, label })), onChange: setStatus }]}
    >
     <ExportButton fileName="Approvals" resource="Approvals" columns={EXPORT_COLUMNS} fetchPage={(page, limit) => approvals_api.list({ ...exportParams.current, page, limit })} />
    </FilterBar>
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
         <th scope="col" className={TH}>Actions</th>
        </tr>
       </thead>
       <tbody className="divide-y divide-border">
        {rows.length === 0 && (
         <tr><td colSpan={6} className="p-8"><div className="flex justify-center"><EmptyState title={view === 'to_decide' ? 'Nothing is waiting for you.' : 'No requests found.'} description={view === 'to_decide' && totals.mine ? 'Requests you sent need another admin to decide them. Find them under My requests.' : undefined} /></div></td></tr>
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
          <td className="px-4 py-3 whitespace-nowrap">
           {row.canDecide ? (
            <div className="flex items-center gap-2">
             <button type="button" onClick={() => handleApprove(row)} disabled={busyId === row.id} aria-label={`Approve ${row.summary?.title}`} className="h-9 px-3 rounded-lg text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50">Approve</button>
             <button type="button" onClick={() => setRejecting(row)} disabled={busyId === row.id} aria-label={`Reject ${row.summary?.title}`} className="h-9 px-3 border border-border rounded-lg text-xs font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20">Reject</button>
            </div>
           ) : (
            <>
             <Link href={`/dashboard/approvals/${row.id}`} className="text-xs font-semibold text-[#016B41] dark:text-emerald-400 hover:underline">View</Link>
             {waitingOn(row) && <span className="block text-xs text-muted-foreground">{waitingOn(row)}</span>}
            </>
           )}
          </td>
         </tr>
        ))}
       </tbody>
      </table>
     </div>
     {rows.length > 0 && (
      <div className="border-t border-border/50 py-4 px-4">
       <Pagination tabTotal totalItems={total} currentPage={page} itemsPerPage={limit} onPageChange={setPage} onItemsPerPageChange={(value) => { setLimit(value); setPage(1); }} />
      </div>
     )}
    </div>
   )}
   <Modal isOpen={!!rejecting} onClose={() => { setRejecting(null); setReason(''); }} onConfirm={handleReject} title="Reject this request?" confirmText="Reject request">
    <label className="block text-sm font-medium text-foreground/90">
     Reason for rejecting
     <textarea value={reason} onChange={(e) => setReason(e.target.value)} maxLength={500} rows={3} autoFocus className="mt-1 w-full px-4 py-2.5 border border-border rounded-lg text-sm font-normal outline-none focus:ring-1 focus:ring-emerald-200 focus:border-emerald-400" />
    </label>
   </Modal>
  </main>
  </TabTotalScope>
 );
}
