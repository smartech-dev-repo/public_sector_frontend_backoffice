"use client";

import { useSectorOptions } from '@/app/composables/modules/useSectorOptions';
import { useDataVersion } from '@/app/composables/useDataVersion';
import FilterBar, { dateRangeParams } from '@/app/components/ui/FilterBar';
import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLoans } from '@/app/composables/modules/useLoans';
import { useToast } from '@/app/composables/useToast';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import { createPortal } from 'react-dom';
import Pagination from '@/app/components/ui/Pagination';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/app/components/ui/Select';
import Link from 'next/link';
import { useReportTabTotal } from '@/app/composables/useTabTotals';
import { useAdminPermissions } from '@/app/composables/useAdminPermissions';
import TableDropdown from '@/app/components/ui/TableDropdown';
import { FileText, User, CreditCard } from 'lucide-react';

export default function ClientLoansTab() {
 return (
  <Suspense fallback={<PulseLoader />}>
   <ClientLoansContent />
  </Suspense>
 );
}

function ClientLoansContent() {
 const agencyOptions = useSectorOptions();
 const dataVersion = useDataVersion();
 const { isSuperAdmin, hasPermission } = useAdminPermissions();
 const canReadClientLoans = isSuperAdmin || hasPermission('clients:read');
 const canReadPlan = isSuperAdmin || hasPermission('client-loans:read');
 const searchParams = useSearchParams();
 const { loading, error, clientLoans, fetchClientLoans, getClientLoanRepaymentPlan, meta } = useLoans();
 // Reported here, since the pager is hidden when a filter matches nothing.
 useReportTabTotal(loading ? undefined : meta.total);
 const { addToast } = useToast();

 const [clientIdFilter, setClientIdFilter] = useState(searchParams.get('clientId') || '');
 const [statusFilter, setStatusFilter] = useState('');
 const [agencyFilter, setAgencyFilter] = useState('');
 const [disbursedRange, setDisbursedRange] = useState('');

 const [repaymentPlan, setRepaymentPlan] = useState<any>(null);
 const [showRepaymentModal, setShowRepaymentModal] = useState(false);
 const [repaymentLoading, setRepaymentLoading] = useState(false);
 const [selectedLoan, setSelectedLoan] = useState<any>(null);
 const [page, setPage] = useState(1);
 const [limit, setLimit] = useState(25);

 const tableContainerRef = useRef<HTMLDivElement>(null);
 const [canScrollLeft, setCanScrollLeft] = useState(false);
 const [canScrollRight, setCanScrollRight] = useState(false);

 const checkScroll = () => {
  if (tableContainerRef.current) {
   const { scrollLeft, scrollWidth, clientWidth } = tableContainerRef.current;
   setCanScrollLeft(scrollLeft > 0);
   setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
  }
 };

 useEffect(() => {
  checkScroll();
  window.addEventListener('resize', checkScroll);
  return () => window.removeEventListener('resize', checkScroll);
 }, [clientLoans]);


 useEffect(() => {
  if (!canReadClientLoans) return;
  const params: any = { page, limit };
  if (clientIdFilter.trim()) params.clientId = clientIdFilter.trim();
  if (statusFilter && statusFilter !== 'none') params.status = statusFilter;
  if (agencyFilter) params.agency = agencyFilter;
  Object.assign(params, dateRangeParams(disbursedRange, 'disbursedFrom', 'disbursedTo'));
  fetchClientLoans(params);
 }, [fetchClientLoans, page, limit, clientIdFilter, statusFilter, agencyFilter, disbursedRange, dataVersion]);

 const handleViewRepayment = async (loan: any) => {
  setSelectedLoan(loan);
  setRepaymentLoading(true);
  setShowRepaymentModal(true);
  try {
   const data = await getClientLoanRepaymentPlan(loan.id);
   let plan = data;
   if (data?.data) plan = data.data;
   setRepaymentPlan(plan);
  } catch (e: any) {
   addToast(e?.response?.data?.message || 'Failed to load repayment plan', 'error');
   setShowRepaymentModal(false);
  } finally {
   setRepaymentLoading(false);
  }
 };

 const closeRepaymentModal = () => {
  setShowRepaymentModal(false);
  setRepaymentPlan(null);
  setSelectedLoan(null);
 };

 const statusColor = (status: string) => {
  switch (status?.toUpperCase()) {
   case 'ACTIVE': return 'bg-emerald-100 text-emerald-800';
   case 'CLOSED': return 'bg-blue-100 text-blue-800';
   case 'DEFAULT': return 'bg-rose-100 text-rose-800';
   default: return 'bg-muted/50 text-foreground';
  }
 };

 return (
  <main className="w-full">
   <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
    <div className="flex-1 max-w-md">
     <div className="relative">
      <input
       type="text"
       placeholder="Client ID (optional)"
       value={clientIdFilter}
       onChange={(e) => { setClientIdFilter(e.target.value); setPage(1); }}
       className="w-full pl-10 pr-4 py-2 border rounded-full text-sm bg-card border-border outline-none focus:ring-1 focus:ring-emerald-200 focus:border-emerald-400"
      />
      <svg className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
      </svg>
     </div>
    </div>
    <div className="flex items-center gap-3">
    </div>
   </div>

   <div className="mb-6 space-y-4">
    <FilterBar
     onChange={() => setPage(1)}
     search={{ value: clientIdFilter, onChange: setClientIdFilter, placeholder: 'Client ID' }}
     filters={[
      { key: 'status', label: 'Status', type: 'select', value: statusFilter, options: [{ value: 'ACTIVE', label: 'Active' }, { value: 'CLOSED', label: 'Closed' }, { value: 'DEFAULT', label: 'Default' }], onChange: setStatusFilter },
      { key: 'agency', label: 'Agency', type: 'select', value: agencyFilter, options: agencyOptions, onChange: setAgencyFilter },
      { key: 'disbursed', label: 'Disbursed', type: 'dateRange', value: disbursedRange, onChange: setDisbursedRange },
     ]}
    />
   </div>

   {loading && clientLoans.length === 0 && <PulseLoader />}
   {!loading && !canReadClientLoans && (
    <div className="p-8">
     <EmptyState
      title="Access Restricted"
      description="You do not have permission to view client loans."
     />
    </div>
   )}
   {!loading && error && canReadClientLoans && <div className="text-red-500 py-12 text-center">{error}</div>}

   {!error && canReadClientLoans && !(loading && clientLoans.length === 0) && (
    <div className="bg-card rounded-2xl border border-border overflow-hidden relative w-full max-w-full ">
     
     
      <>
       {canScrollLeft && (
        <button
         onClick={(e) => { e.preventDefault(); e.stopPropagation(); if(tableContainerRef.current) tableContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' }); }}
         className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-card border border-border flex items-center justify-center z-10 text-muted-foreground/70 hover:text-muted-foreground "
         type="button"
        >
         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
        </button>
       )}
       <div 
        ref={tableContainerRef}
        onScroll={checkScroll}
        className="overflow-x-auto w-full"
       >
        <table className="min-w-full divide-y divide-slate-200 min-w-[1000px]">
         <thead className="bg-[#E9F4EE] dark:bg-emerald-950/20">
          <tr>
           <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Loan ID</th>
           <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Client</th>
           <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Amount</th>
           <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Outstanding</th>
           <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Tenor</th>
           <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Status</th>
           <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Disbursed At</th>
           {canReadPlan && (
            <th className="px-4 py-4 text-right text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Actions</th>
           )}
          </tr>
         </thead>
         <tbody className="divide-y divide-slate-100">
          {clientLoans.length === 0 ? (
           <tr>
            <td colSpan={canReadPlan ? 8 : 7} className="p-8">
             <div className="flex flex-col items-center justify-center w-full py-8 text-center">
               <EmptyState 
                title="No client loans found"
                description="No loans match these filters."
               />
             </div>
            </td>
           </tr>
          ) : (clientLoans.map((loan: any) => (
           <tr key={loan.id} className="hover:bg-muted/30 transition-colors">
            <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground font-mono">{loan.id?.slice(0, 8)}...</td>
            <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground font-medium">
             {loan.clientId ? (
              <Link href={`/dashboard/clients/${loan.clientId}`} className="text-emerald-700 hover:text-emerald-800 hover:underline">
               {loan.client?.onboarding?.employeeName || loan.client?.fullName || `${loan.clientId?.slice(0, 8)}...`}
              </Link>
             ) : '-'}
            </td>
            <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">₦{loan.amount?.toLocaleString() || loan.principal?.toLocaleString() || '0'}</td>
            <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">₦{loan.outstandingBalance?.toLocaleString() || loan.outstanding?.toLocaleString() || '0'}</td>
            <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">{loan.tenor || loan.tenorMonths || '-'} months</td>
            <td className="px-4 py-4 whitespace-nowrap text-sm">
             <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${statusColor(loan.status)}`}>
              {loan.status || '-'}
             </span>
            </td>
            <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground font-mono">
             {loan.disbursedAt || loan.createdAt
              ? new Date(loan.disbursedAt || loan.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
              : '-'
             }
            </td>
            {canReadPlan && (
             <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
              <TableDropdown>
               <button
                type="button"
                onClick={() => handleViewRepayment(loan)}
                className="w-full text-left px-4 py-2.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors flex items-center gap-2.5"
               >
                <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                View Repayment Plan
               </button>
               {loan.clientId && (
                <>
                 <Link
                  href={`/dashboard/clients/${loan.clientId}`}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium text-foreground hover:bg-muted transition-colors flex items-center gap-2.5"
                 >
                  <User className="w-4 h-4 text-muted-foreground shrink-0" />
                  View Customer Profile
                 </Link>
                 <Link
                  href={`/dashboard/loan-requests?tab=requests&clientId=${loan.clientId}`}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium text-foreground hover:bg-muted transition-colors flex items-center gap-2.5"
                 >
                  <CreditCard className="w-4 h-4 text-muted-foreground shrink-0" />
                  View Loan Requests
                 </Link>
                </>
               )}
              </TableDropdown>
             </td>
            )}
           </tr>
          )))}
</tbody>
        </table>
       </div>
       {canScrollRight && (
        <button
         onClick={(e) => { e.preventDefault(); e.stopPropagation(); if(tableContainerRef.current) tableContainerRef.current.scrollTo({ left: tableContainerRef.current.scrollWidth, behavior: 'smooth' }); }}
         className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-card border border-border flex items-center justify-center z-10 text-muted-foreground/70 hover:text-muted-foreground "
         type="button"
        >
         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
        </button>
       )}
       {meta.total > 0 && (
        <Pagination
         totalItems={meta.total}
         currentPage={page}
         itemsPerPage={meta.limit || 25}
         onPageChange={(p: number) => setPage(p)}
         onItemsPerPageChange={() => {}}
        />
       )}
      </>
     
    </div>
   )}

   {/* Repayment Plan Modal */}
   {showRepaymentModal && typeof document !== 'undefined' && createPortal(
    <div className="fixed inset-0 z-modal flex items-center justify-center">
     <div className="fixed inset-0 bg-white/30 dark:bg-white/10 backdrop-blur-md" onClick={closeRepaymentModal}></div>
     <div className="relative bg-card rounded-2xl p-6 w-full max-w-2xl mx-4 animate-in fade-in zoom-in-95 duration-200 max-h-[80vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl shadow-black/10">
      <div className="flex items-start justify-between mb-4">
       <h3 className="text-lg font-semibold text-foreground">
        Repayment Plan {selectedLoan?.id ? `(${selectedLoan.id.slice(0, 8)}...)` : ''}
       </h3>
       <button onClick={closeRepaymentModal} className="text-muted-foreground/70 hover:text-muted-foreground">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
       </button>
      </div>

      {repaymentLoading && <PulseLoader />}

      {!repaymentLoading && repaymentPlan && (
       <div>
        {/* Summary */}
        {(repaymentPlan.totalRepayment || repaymentPlan.monthlyRepayment) && (
         <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-3">
          {repaymentPlan.totalRepayment && (
           <div className="bg-muted/30 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground">Total Repayment</p>
            <p className="text-lg font-bold text-foreground">₦{repaymentPlan.totalRepayment?.toLocaleString()}</p>
           </div>
          )}
          {repaymentPlan.monthlyRepayment && (
           <div className="bg-muted/30 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground">Monthly Repayment</p>
            <p className="text-lg font-bold text-foreground">₦{repaymentPlan.monthlyRepayment?.toLocaleString()}</p>
           </div>
          )}
          {repaymentPlan.interestRate && (
           <div className="bg-muted/30 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground">Interest Rate</p>
            <p className="text-lg font-bold text-foreground">{repaymentPlan.interestRate}%</p>
           </div>
          )}
         </div>
        )}

        {/* Schedule Table */}
        {(repaymentPlan.schedule || repaymentPlan.installments) && (
         <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
           <thead className="bg-[#E9F4EE] dark:bg-emerald-950/20">
            <tr>
             <th className="px-4 py-2 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase">#</th>
             <th className="px-4 py-2 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase">Due Date</th>
             <th className="px-4 py-2 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase">Amount</th>
             <th className="px-4 py-2 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase">Status</th>
            </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
            {(repaymentPlan.schedule || repaymentPlan.installments).map((item: any, index: number) => (
             <tr key={index} className="hover:bg-muted/30">
              <td className="px-4 py-2 text-muted-foreground">{item.installmentNumber || index + 1}</td>
              <td className="px-4 py-2 text-muted-foreground font-mono">
               {item.dueDate ? new Date(item.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
              </td>
              <td className="px-4 py-2 text-foreground font-medium">₦{(item.amount || item.installmentAmount)?.toLocaleString() || '0'}</td>
              <td className="px-4 py-2">
               <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${statusColor(item.status)}`}>
                {item.status || 'PENDING'}
               </span>
              </td>
             </tr>
            ))}
           </tbody>
          </table>
         </div>
        )}

        {/* Fallback: show raw data if no schedule */}
        {!repaymentPlan.schedule && !repaymentPlan.installments && (
         <pre className="bg-muted/30 rounded-lg p-4 text-xs overflow-x-auto">{JSON.stringify(repaymentPlan, null, 2)}</pre>
        )}
       </div>
      )}

      {!repaymentLoading && !repaymentPlan && (
       <p className="text-muted-foreground text-sm text-center py-6">No repayment plan data available.</p>
      )}
     </div>
    </div>,
    document.body
   )}
  </main>
 );
}
