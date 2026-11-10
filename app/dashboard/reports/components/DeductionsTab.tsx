"use client";

import { useCallback, useEffect, useState } from 'react';
import { useSectorOptions } from '@/app/composables/modules/useSectorOptions';
import { reconciliation_api } from '@/app/api_factory/modules/reconciliation';
import FilterBar from '@/app/components/ui/FilterBar';
import PulseLoader from '@/app/components/ui/PulseLoader';
import Pagination from '@/app/components/ui/Pagination';
import { createPortal } from 'react-dom';
import { MonthPicker } from '@/app/components/ui/MonthPicker';
import { addToast } from '@/app/composables/useToast';
import { useAdminPermissions } from '@/app/composables/useAdminPermissions';
import { Link2, Undo2, XCircle, Clock } from 'lucide-react';

type Reason = 'NO_LOAN' | 'REQUEST_NOT_DISBURSED' | 'BEFORE_DISBURSEMENT' | 'AFTER_MATURITY' | 'AFTER_SETTLEMENT' | 'NO_PERIOD' | 'MATCHED';

const REASON_LABELS: Record<Reason, string> = {
 NO_LOAN: 'No loan',
 REQUEST_NOT_DISBURSED: 'Request not disbursed',
 BEFORE_DISBURSEMENT: 'Before disbursement',
 AFTER_MATURITY: 'After loan ended',
 AFTER_SETTLEMENT: 'After top-up',
 NO_PERIOD: 'No month',
 MATCHED: 'Matched',
};

const RESOLUTION_LABELS: Record<string, string> = { ASSIGNED: 'Assigned', REFUNDED: 'Refunded', DISMISSED: 'Dismissed' };

const naira = (value: unknown) => `₦${Number(value || 0).toLocaleString('en-NG', { maximumFractionDigits: 2 })}`;
const monthLabel = (period?: string | null) => {
 if (!period) return '—';
 const [y, m] = period.split('-').map(Number);
 return new Date(y, m - 1, 1).toLocaleDateString('en-NG', { month: 'short', year: 'numeric' });
};
const dateLabel = (value?: string | null) => (value ? new Date(value).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

const TH = 'px-4 py-3.5 text-left text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider';
const BTN = 'text-xs px-2.5 py-1 font-medium rounded-lg transition-colors inline-flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed';

type Action = { kind: 'assign' | 'refund' | 'dismiss'; row: any } | null;

export default function DeductionsTab() {
 const agencyOptions = useSectorOptions();
 const { isSuperAdmin, hasPermission } = useAdminPermissions();
 const canResolve = isSuperAdmin || hasPermission('reconciliation:resolve');

 const [rows, setRows] = useState<any[]>([]);
 const [meta, setMeta] = useState({ total: 0 });
 const [summary, setSummary] = useState<any>({ unresolved: { count: 0, amount: 0, byReason: {} }, resolved: {} });
 const [isLoading, setIsLoading] = useState(true);
 const [page, setPage] = useState(1);
 const [limit, setLimit] = useState(10);
 const [search, setSearch] = useState('');
 const [filters, setFilters] = useState({ view: 'UNRESOLVED', matchStatus: '', resolution: '', agency: '', period: '' });
 const [action, setAction] = useState<Action>(null);

 const load = useCallback(async () => {
  const params: Record<string, unknown> = { page, limit, view: filters.view };
  for (const key of ['matchStatus', 'resolution', 'agency', 'period'] as const) if (filters[key]) params[key] = filters[key];
  if (search) params.search = search;
  const res: any = await reconciliation_api.getDeductions(params);
  if (res?.type !== 'ERROR') {
   setRows(res.data?.data ?? []);
   setMeta(res.data?.meta ?? { total: 0 });
   setSummary(res.data?.summary ?? summary);
  }
  setIsLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [page, limit, filters, search]);

 useEffect(() => { load(); }, [load]);

 const byReason = summary.unresolved?.byReason ?? {};
 const reasonCount = (...keys: Reason[]) => keys.reduce((sum, k) => sum + (byReason[k]?.count ?? 0), 0);
 const reasonAmount = (...keys: Reason[]) => keys.reduce((sum, k) => sum + (byReason[k]?.amount ?? 0), 0);
 const resolvedCount = Object.values(summary.resolved ?? {}).reduce((sum: number, r: any) => sum + (r?.count ?? 0), 0);
 const done = () => { setAction(null); load(); };

 if (isLoading) return <div className="py-12"><PulseLoader /></div>;

 return (
  <div className="space-y-4">
   <div>
    <h2 className="text-xl font-bold text-foreground">Payroll Deductions</h2>
    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
     Deductions on the repayment schedule that don&apos;t belong to a loan running in their month. Assign each to the right loan, refund it to the client&apos;s wallet, or dismiss it with a note.
    </p>
   </div>

   <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
    <Kpi tone="rose" label="Unmatched" value={summary.unresolved?.count ?? 0} sub={`${naira(summary.unresolved?.amount)} to resolve`} />
    <Kpi tone="amber" label="No loan" value={reasonCount('NO_LOAN', 'REQUEST_NOT_DISBURSED')} sub={`${reasonCount('REQUEST_NOT_DISBURSED')} with an undisbursed request · ${naira(reasonAmount('NO_LOAN', 'REQUEST_NOT_DISBURSED'))}`} />
    <Kpi tone="amber" label="Outside loan months" value={reasonCount('BEFORE_DISBURSEMENT', 'AFTER_MATURITY', 'AFTER_SETTLEMENT', 'NO_PERIOD')} sub={naira(reasonAmount('BEFORE_DISBURSEMENT', 'AFTER_MATURITY', 'AFTER_SETTLEMENT', 'NO_PERIOD'))} />
    <Kpi tone="emerald" label="Resolved" value={resolvedCount} sub={['ASSIGNED', 'REFUNDED', 'DISMISSED'].map((k) => `${summary.resolved?.[k]?.count ?? 0} ${RESOLUTION_LABELS[k].toLowerCase()}`).join(' · ')} />
   </div>

   <FilterBar
    onChange={() => setPage(1)}
    search={{ value: search, onChange: setSearch, placeholder: 'Staff ID' }}
    filters={[
     { key: 'view', label: 'Show', type: 'select', value: filters.view, emptyValue: 'UNRESOLVED', options: [{ value: 'UNRESOLVED', label: 'To resolve' }, { value: 'RESOLVED', label: 'Resolved' }, { value: 'ALL', label: 'All deductions' }], onChange: (view) => setFilters({ ...filters, view: view || 'UNRESOLVED', resolution: view === 'RESOLVED' ? filters.resolution : '' }) },
     { key: 'matchStatus', label: 'Reason', type: 'select', value: filters.matchStatus, options: (Object.keys(REASON_LABELS) as Reason[]).filter((k) => filters.view === 'ALL' || k !== 'MATCHED').map((k) => ({ value: k, label: REASON_LABELS[k] })), onChange: (matchStatus) => setFilters({ ...filters, matchStatus }) },
     ...(filters.view === 'RESOLVED' ? [{ key: 'resolution', label: 'Resolution', type: 'select' as const, value: filters.resolution, options: Object.entries(RESOLUTION_LABELS).map(([value, label]) => ({ value, label })), onChange: (resolution: string) => setFilters({ ...filters, resolution }) }] : []),
     { key: 'agency', label: 'Sector', type: 'select', value: filters.agency, options: agencyOptions, onChange: (agency) => setFilters({ ...filters, agency }) },
     { key: 'period', label: 'Month', type: 'month', value: filters.period, onChange: (period) => setFilters({ ...filters, period }) },
    ]}
   />

   <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
    <div className="overflow-x-auto">
     <table className="w-full min-w-full text-left border-collapse">
      <thead className="bg-[#E9F4EE] dark:bg-emerald-950/20">
       <tr>
        <th className={`pin-start ${TH}`}>Staff ID</th>
        <th className={TH}>Employee</th>
        <th className={TH}>Sector</th>
        <th className={TH}>Month</th>
        <th className={`${TH} text-right`}>Amount</th>
        <th className={TH}>Reason</th>
        <th className={TH}>Outcome</th>
        <th className={`pin-end ${TH} text-right`}>Actions</th>
       </tr>
      </thead>
      <tbody className="divide-y divide-border/40 text-sm text-foreground">
       {rows.length === 0 ? (
        <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">{filters.view === 'UNRESOLVED' ? 'Every deduction belongs to a running loan. Nothing to resolve.' : 'No deductions found.'}</td></tr>
       ) : rows.map((row) => (
        <tr key={row.id} className="hover:bg-muted/20 transition-colors">
         <td className="pin-start px-4 py-3.5 font-mono text-xs whitespace-nowrap">{row.staffId}</td>
         <td className="px-4 py-3.5 font-medium max-w-[14rem] truncate" title={row.employeeName ?? ''}>
          {row.employeeName ?? '—'}
          {!row.clientId && <span className="block text-[11px] font-normal text-muted-foreground">No app account</span>}
         </td>
         <td className="px-4 py-3.5 text-xs text-muted-foreground">{row.agency}</td>
         <td className="px-4 py-3.5 text-xs text-muted-foreground whitespace-nowrap">{monthLabel(row.period)}</td>
         <td className="px-4 py-3.5 text-right font-medium whitespace-nowrap">{naira(row.amount)}</td>
         <td className="px-4 py-3.5">
          <span title={row.reason ?? ''} className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap ${row.matchStatus === 'MATCHED' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300' : 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-300'}`}>
           {REASON_LABELS[row.matchStatus as Reason] ?? row.matchStatus}
          </span>
         </td>
         <td className="px-4 py-3.5 text-xs">
          <Outcome row={row} />
         </td>
         <td className="pin-end px-4 py-3.5 text-right whitespace-nowrap">
          {canResolve && !row.resolution && row.matchStatus !== 'MATCHED' && !row.pendingRefund ? (
           <div className="inline-flex gap-1.5">
            <button onClick={() => setAction({ kind: 'assign', row })} className={`${BTN} bg-[#018752] hover:bg-[#016f43] text-white`}><Link2 className="w-3 h-3" />Assign</button>
            <button onClick={() => setAction({ kind: 'refund', row })} disabled={!row.clientId} title={row.clientId ? 'Refund to wallet' : 'No app account, so no wallet to refund to'} className={`${BTN} bg-muted/40 hover:bg-muted/70 text-foreground`}><Undo2 className="w-3 h-3" />Refund</button>
            <button onClick={() => setAction({ kind: 'dismiss', row })} className={`${BTN} bg-muted/40 hover:bg-muted/70 text-foreground`}><XCircle className="w-3 h-3" />Dismiss</button>
           </div>
          ) : <span className="text-xs text-muted-foreground">—</span>}
         </td>
        </tr>
       ))}
      </tbody>
     </table>
    </div>
   </div>

   <Pagination tabTotal totalItems={meta?.total || 0} currentPage={page} itemsPerPage={limit} onPageChange={setPage} onItemsPerPageChange={setLimit} />

   {action?.kind === 'assign' && <AssignModal row={action.row} onClose={() => setAction(null)} onDone={done} />}
   {action?.kind === 'refund' && <RefundModal row={action.row} onClose={() => setAction(null)} onDone={done} />}
   {action?.kind === 'dismiss' && <DismissModal row={action.row} onClose={() => setAction(null)} onDone={done} />}
  </div>
 );
}

function Kpi({ tone, label, value, sub }: { tone: 'rose' | 'amber' | 'emerald'; label: string; value: number; sub: string }) {
 const tones = {
  rose: 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200/60 dark:border-rose-900/40 text-rose-700 dark:text-rose-400',
  amber: 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-900/40 text-amber-700 dark:text-amber-400',
  emerald: 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400',
 };
 return (
  <div className={`rounded-2xl p-4 sm:p-5 border ${tones[tone]}`}>
   <div className="text-[11px] font-semibold uppercase tracking-wider mb-1">{label}</div>
   <div className="text-2xl font-bold">{value.toLocaleString()}</div>
   <div className="text-[11px] opacity-80 mt-1">{sub}</div>
  </div>
 );
}

function Outcome({ row }: { row: any }) {
 if (row.pendingRefund) {
  return <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300 font-medium"><Clock className="w-3 h-3" />Refund awaiting approval</span>;
 }
 if (!row.resolution) return <span className="text-muted-foreground">{row.matchStatus === 'MATCHED' ? 'Counts toward its loan' : 'To resolve'}</span>;
 const detail =
  row.resolution === 'ASSIGNED'
   ? `to ${row.clientLoan ? 'app loan' : row.loan?.customerName ?? 'imported loan'}${row.appliedPeriod ? `, ${monthLabel(row.appliedPeriod)}` : ''}`
   : row.resolution === 'REFUNDED' ? 'to wallet' : '';
 return (
  <div className="max-w-[16rem]">
   <span className="font-semibold text-foreground">{RESOLUTION_LABELS[row.resolution]}</span> <span className="text-muted-foreground">{detail}</span>
   <span className="block text-[11px] text-muted-foreground truncate" title={row.resolutionNote ?? ''}>
    {row.resolvedBy?.fullName ?? 'Admin'} · {dateLabel(row.resolvedAt)}{row.resolutionNote ? ` · ${row.resolutionNote}` : ''}
   </span>
  </div>
 );
}

function Summary({ row }: { row: any }) {
 return (
  <div className="grid grid-cols-2 gap-2 text-xs mb-4">
   <Field label="Staff ID" value={<span className="font-mono">{row.staffId}</span>} />
   <Field label="Amount" value={naira(row.amount)} />
   <Field label="Month" value={monthLabel(row.period)} />
   <Field label="Why unmatched" value={row.reason ?? '—'} />
  </div>
 );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
 return (
  <div className="p-2.5 rounded-lg bg-muted/20 border border-border/40 min-w-0">
   <p className="text-muted-foreground text-[10px] uppercase tracking-wider">{label}</p>
   <p className="font-medium text-foreground mt-0.5 break-words">{value}</p>
  </div>
 );
}

const NOTE = 'w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#018752]/40';

function AssignModal({ row, onClose, onDone }: { row: any; onClose: () => void; onDone: () => void }) {
 const [loans, setLoans] = useState<any[] | null>(null);
 const [selected, setSelected] = useState<any>(null);
 const [period, setPeriod] = useState<string>(row.period ?? '');
 const [note, setNote] = useState('');
 const [saving, setSaving] = useState(false);

 useEffect(() => {
  reconciliation_api.getDeductionCandidates(row.id).then((res: any) => {
   const list = res?.type === 'ERROR' ? [] : res.data?.loans ?? [];
   setLoans(list);
   setSelected(list.find((l: any) => l.coversPeriod) ?? list[0] ?? null);
  });
 }, [row.id]);

 const inLoan = (loan: any, p: string) => {
  if (!loan || !p) return false;
  const key = (d: string) => d.slice(0, 7);
  return p >= key(loan.disbursementDate) && p <= key(loan.maturationDate) && (!loan.settledAt || p < key(loan.settledAt));
 };
 const valid = selected && inLoan(selected, period);

 const submit = async () => {
  if (!valid) return;
  setSaving(true);
  const res: any = await reconciliation_api.assignDeduction(row.id, {
   ...(selected.clientLoanId ? { clientLoanId: selected.clientLoanId } : { loanId: selected.loanId }),
   period,
   ...(note.trim() ? { note: note.trim() } : {}),
  });
  setSaving(false);
  if (res?.type === 'ERROR') return;
  addToast('Deduction assigned and the loan reconciled again');
  onDone();
 };

 return (
  <Dialog onClose={onClose} title="Assign to a loan">
   <Summary row={row} />
   {loans === null ? <div className="py-6"><PulseLoader /></div> : loans.length === 0 ? (
    <p className="text-sm rounded-xl border border-border bg-muted/20 p-3">This staff number has no loans in the app or the disbursed-loans upload, so there is nothing to assign it to. Refund or dismiss it instead.</p>
   ) : (
    <div className="space-y-3 text-sm">
     <div className="space-y-2 max-h-56 overflow-y-auto">
      {loans.map((loan) => {
       const id = loan.clientLoanId ?? loan.loanId;
       const active = (selected?.clientLoanId ?? selected?.loanId) === id;
       return (
        <label key={id} className={`flex gap-3 items-start rounded-xl border p-3 cursor-pointer transition-colors ${active ? 'border-[#018752] bg-emerald-50/50 dark:bg-emerald-950/20' : 'border-border hover:bg-muted/30'}`}>
         <input type="radio" name="loan" className="mt-1 accent-[#018752]" checked={active} onChange={() => setSelected(loan)} />
         <span className="min-w-0 text-xs">
          <span className="block text-sm font-semibold text-foreground">{loan.source === 'APP' ? 'App loan' : 'Imported loan'} · {naira(loan.principalAmount)}</span>
          <span className="block text-muted-foreground">{loan.agency ?? '—'} · {dateLabel(loan.disbursementDate)} to {dateLabel(loan.maturationDate)} · balance {naira(loan.principalBalance)}</span>
          {!loan.sameSector && <span className="block text-amber-700 dark:text-amber-400">Different sector from the deduction</span>}
         </span>
        </label>
       );
      })}
     </div>
     <div>
      <label className="block text-xs font-medium text-foreground mb-1">Counts toward month</label>
      <MonthPicker value={period} onChange={setPeriod} className="w-full" />
      {selected && period && !valid && <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{monthLabel(period)} is outside this loan&apos;s repayment months. Pick a month from {monthLabel(selected.disbursementDate.slice(0, 7))} to {monthLabel(selected.maturationDate.slice(0, 7))}.</p>}
     </div>
     <textarea className={NOTE} rows={2} maxLength={500} placeholder="Note (optional), e.g. loan was disbursed after payroll deducted" value={note} onChange={(e) => setNote(e.target.value)} />
    </div>
   )}
   <Footer onClose={onClose} onConfirm={submit} disabled={!valid || saving} label={saving ? 'Assigning…' : 'Assign'} />
  </Dialog>
 );
}

function RefundModal({ row, onClose, onDone }: { row: any; onClose: () => void; onDone: () => void }) {
 const [note, setNote] = useState('');
 const [saving, setSaving] = useState(false);
 const submit = async () => {
  setSaving(true);
  const res: any = await reconciliation_api.refundDeduction(row.id, note.trim() ? { note: note.trim() } : {});
  setSaving(false);
  if (res?.type === 'ERROR') return;
  addToast('Refund sent for approval');
  onDone();
 };
 return (
  <Dialog onClose={onClose} title="Refund to wallet">
   <Summary row={row} />
   <p className="text-sm mb-3">{naira(row.amount)} goes to {row.employeeName ?? 'the client'}&apos;s wallet once someone with wallet approval approves it.</p>
   <textarea className={NOTE} rows={2} maxLength={500} placeholder="Note for the approver (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
   <Footer onClose={onClose} onConfirm={submit} disabled={saving} label={saving ? 'Sending…' : 'Send for approval'} />
  </Dialog>
 );
}

function DismissModal({ row, onClose, onDone }: { row: any; onClose: () => void; onDone: () => void }) {
 const [note, setNote] = useState('');
 const [saving, setSaving] = useState(false);
 const submit = async () => {
  if (!note.trim()) return;
  setSaving(true);
  const res: any = await reconciliation_api.dismissDeduction(row.id, { note: note.trim() });
  setSaving(false);
  if (res?.type === 'ERROR') return;
  addToast('Deduction dismissed');
  onDone();
 };
 return (
  <Dialog onClose={onClose} title="Dismiss deduction">
   <Summary row={row} />
   <p className="text-sm mb-3">It won&apos;t count toward any loan and nothing is refunded. Say why, for the record.</p>
   <textarea className={NOTE} rows={3} maxLength={500} placeholder="Reason, e.g. agency confirmed a payroll error and reversed it" value={note} onChange={(e) => setNote(e.target.value)} />
   <Footer onClose={onClose} onConfirm={submit} disabled={!note.trim() || saving} label={saving ? 'Dismissing…' : 'Dismiss'} />
  </Dialog>
 );
}

function Dialog({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
 useEffect(() => {
  const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
  window.addEventListener('keydown', onKey);
  return () => window.removeEventListener('keydown', onKey);
 }, [onClose]);
 return createPortal(
  <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-modal flex items-center justify-center p-4">
   <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm" onClick={onClose} />
   <div className="relative bg-card rounded-3xl p-6 w-full max-w-lg border border-border shadow-2xl max-h-[calc(100dvh-2rem)] overflow-y-auto">
    <div className="flex items-start justify-between mb-4">
     <h3 className="text-xl font-bold text-foreground">{title}</h3>
     <button onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground transition-colors">
      <XCircle className="w-5 h-5" />
     </button>
    </div>
    <div className="text-muted-foreground">{children}</div>
   </div>
  </div>,
  document.body,
 );
}

function Footer({ onClose, onConfirm, disabled, label }: { onClose: () => void; onConfirm: () => void; disabled: boolean; label: string }) {
 return (
  <div className="flex items-center gap-3 justify-end mt-5">
   <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-medium text-foreground bg-muted hover:bg-muted/80 transition-colors">Cancel</button>
   <button onClick={onConfirm} disabled={disabled} className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-[#018752] hover:bg-[#016f43] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">{label}</button>
  </div>
 );
}
