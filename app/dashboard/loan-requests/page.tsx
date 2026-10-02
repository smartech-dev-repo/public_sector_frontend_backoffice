"use client";

import { useEffect, useState } from 'react';
import { useLoans } from '@/app/composables/modules/useLoans';
import { useToast } from '@/app/composables/useToast';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import { createPortal } from 'react-dom';
import TableDropdown from '@/app/components/ui/TableDropdown';
import Pagination from '@/app/components/ui/Pagination';
import CustomDateRangePicker from '@/app/components/ui/CustomDateRangePicker';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/app/components/ui/Select';
import { useConfirm } from '@/app/composables/useConfirm';

export default function LoanRequestsPage() {
 const [showFilter, setShowFilter] = useState(false);
 const [page, setPage] = useState(1);
 const [limit, setLimit] = useState(25);
 const { confirm } = useConfirm();

 const { loading, error, loanRequests, fetchLoanRequests, approveLoanRequest, rejectLoanRequest, disburseLoanRequest, meta } = useLoans();
 const { addToast } = useToast();

 const [showRejectModal, setShowRejectModal] = useState(false);
 const [submitting, setSubmitting] = useState(false);
 const [selectedRequest, setSelectedRequest] = useState<any>(null);
 const [rejectReason, setRejectReason] = useState('');
 const [statusFilter, setStatusFilter] = useState('');
 const [typeFilter, setTypeFilter] = useState('');
 const [clientIdFilter, setClientIdFilter] = useState('');
 const [createdRange, setCreatedRange] = useState('');
 const [disbursedRange, setDisbursedRange] = useState('');

 useEffect(() => {
  const params: any = { page, limit };
  if (statusFilter && statusFilter !== 'none') params.status = statusFilter;
  if (typeFilter && typeFilter !== 'none') params.type = typeFilter;
  if (clientIdFilter.trim()) params.clientId = clientIdFilter.trim();
  if (createdRange) {
   const [from, to] = createdRange.split(' to ');
   if (from) params.createdFrom = from;
   if (to) params.createdTo = to;
  }
  if (disbursedRange) {
   const [from, to] = disbursedRange.split(' to ');
   if (from) params.disbursedFrom = from;
   if (to) params.disbursedTo = to;
  }
  fetchLoanRequests(params);
 }, [fetchLoanRequests, statusFilter, typeFilter, clientIdFilter, createdRange, disbursedRange, page, limit]);

 const handleApprove = async (id: string) => {
  const confirmed = await confirm({ message: 'Are you sure you want to approve this loan request?' });
  if (!confirmed) return;
  try {
   await approveLoanRequest(id);
   addToast('Loan request approved', 'success');
   fetchLoanRequests(statusFilter ? { status: statusFilter } : {});
  } catch (e: any) {
   addToast(e?.response?.data?.message || 'Failed to approve loan request', 'error');
  }
 };

 const handleDisburse = async (id: string) => {
  const confirmed = await confirm({ message: 'Are you sure you want to disburse this loan?' });
  if (!confirmed) return;
  try {
   await disburseLoanRequest(id);
   addToast('Loan request disbursed', 'success');
   fetchLoanRequests(statusFilter ? { status: statusFilter } : {});
  } catch (e: any) {
   addToast(e?.response?.data?.message || 'Failed to disburse loan request', 'error');
  }
 };

 const openRejectModal = (req: any) => {
  setSelectedRequest(req);
  setRejectReason('');
  setShowRejectModal(true);
 };

 const handleReject = async () => {
  if (!rejectReason.trim()) {
   addToast('Please provide a rejection reason', 'error');
   return;
  }
  setSubmitting(true);
  try {
   await rejectLoanRequest(selectedRequest.id, { reason: rejectReason });
   addToast('Loan request rejected', 'success');
   setShowRejectModal(false);
   fetchLoanRequests(statusFilter ? { status: statusFilter } : {});
  } catch (e: any) {
   addToast(e?.response?.data?.message || 'Failed to reject loan request', 'error');
  } finally {
   setSubmitting(false);
  }
 };

 return (
  <main className="w-full">
   <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
    <h1 className="text-2xl font-semibold text-foreground">Loan Requests</h1>
    <div className="flex items-center gap-3">
     <button 
      onClick={() => setShowFilter(!showFilter)}
      className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full text-sm font-medium text-foreground/90 hover:bg-muted/30 transition-colors "
     >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
      Filters
      <svg className={`w-4 h-4 transition-transform ${showFilter ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
     </button>
    </div>
   </div>

   <div className="mb-6 space-y-4">
    {showFilter && (
     <div className="bg-card p-6 rounded-2xl border border-border/50 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
       <div className="space-y-1.5">
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Client ID</label>
        <input 
         type="text"
         placeholder="Client ID..."
         value={clientIdFilter}
         onChange={(e) => setClientIdFilter(e.target.value)}
         className="w-full px-4 py-2 border rounded-lg text-sm bg-card border-border outline-none focus:ring-1 focus:ring-emerald-200 focus:border-emerald-400"
        />
       </div>
       <div className="space-y-1.5">
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
         <SelectTrigger className="w-full bg-card"><SelectValue placeholder="All Statuses" /></SelectTrigger>
         <SelectContent>
          <SelectItem value="none">All Statuses</SelectItem>
          <SelectItem value="CONFIRMED">CONFIRMED</SelectItem>
          <SelectItem value="APPROVED">APPROVED</SelectItem>
          <SelectItem value="REJECTED">REJECTED</SelectItem>
          <SelectItem value="DISBURSED">DISBURSED</SelectItem>
         </SelectContent>
        </Select>
       </div>
       <div className="space-y-1.5">
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Type</label>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
         <SelectTrigger className="w-full bg-card"><SelectValue placeholder="All Types" /></SelectTrigger>
         <SelectContent>
          <SelectItem value="none">All Types</SelectItem>
          <SelectItem value="ORIGINATION">ORIGINATION</SelectItem>
          <SelectItem value="TOPUP">TOPUP</SelectItem>
         </SelectContent>
        </Select>
       </div>
       <div className="space-y-1.5 z-[60] relative">
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Created Date</label>
        <CustomDateRangePicker 
         value={createdRange}
         onChange={setCreatedRange}
         placeholder="Created Date"
        />
       </div>
       <div className="space-y-1.5 z-[60] relative">
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Disbursed Date</label>
        <CustomDateRangePicker 
         value={disbursedRange}
         onChange={setDisbursedRange}
         placeholder="Disbursed Date"
        />
       </div>
      </div>
     </div>
    )}
   </div>

   {loading && <PulseLoader />}
   {!loading && error && <div className="text-red-500 py-12 text-center">{error}</div>}
   
   {!loading && !error && (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
     
      <div className="overflow-x-auto">
       <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-[#E9F4EE] dark:bg-emerald-950/20">
         <tr>
          <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Date Created</th>
          <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Client</th>
          <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Amount</th>
          <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Status</th>
          <th className="px-4 py-4 text-right text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Actions</th>
         </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
 {loanRequests.length === 0 ? (<tr><td colSpan={5} className="p-8"><div className="flex justify-center w-full"><EmptyState title="No loan requests found." /></div></td></tr>) : (loanRequests.map((req: any) => (
          <tr key={req.id} className="hover:bg-muted/30 transition-colors">
           <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground font-mono">{new Date(req.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
           <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground">{req.clientId}</td>
           <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">₦{req.amount?.toLocaleString()}</td>
           <td className="px-4 py-4 whitespace-nowrap text-sm">
            <span className="px-2 py-1 bg-muted/50 rounded text-xs font-medium">{req.status}</span>
           </td>
           <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium relative">
            <TableDropdown>
             {req.status === 'CONFIRMED' && (
              <>
               <button onClick={() => handleApprove(req.id)} className="w-full text-left px-4 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50 transition-colors">Approve</button>
               <button onClick={() => openRejectModal(req)} className="w-full text-left px-4 py-2.5 text-sm font-medium text-rose-700 hover:bg-rose-50 transition-colors">Reject</button>
              </>
             )}
             {req.status === 'APPROVED' && (
              <button onClick={() => handleDisburse(req.id)} className="w-full text-left px-4 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-50 transition-colors">Disburse</button>
             )}
             {req.status !== 'CONFIRMED' && req.status !== 'APPROVED' && (
              <span className="w-full text-left px-4 py-2.5 text-sm font-medium text-muted-foreground/70">No actions</span>
             )}
            </TableDropdown>
           </td>
          </tr>
         )))}
</tbody>
       </table>
      </div>
     
     {meta && loanRequests.length > 0 && (
      <div className="border-t border-border/50 pt-4 mt-4 pb-4">
       <Pagination
        totalItems={meta.total || 0}
        currentPage={page || 1}
        itemsPerPage={limit || 25}
        onPageChange={setPage}
        onItemsPerPageChange={setLimit}
       />
      </div>
     )}
    </div>
   )}

   {/* Reject Modal */}
   {showRejectModal && typeof document !== 'undefined' && createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
     <div className="fixed inset-0 bg-slate-900 dark:bg-slate-800/50 backdrop-blur-sm" onClick={() => setShowRejectModal(false)}></div>
     <div className="relative bg-card rounded-2xl p-6 w-full max-w-md mx-4 animate-in fade-in zoom-in-95 duration-200">
      <h3 className="text-lg font-semibold text-foreground mb-4">Reject Loan Request</h3>
      <div className="space-y-4">
       <div>
        <label className="block text-sm font-medium text-foreground/90 mb-1">Reason for Rejection</label>
        <textarea 
         value={rejectReason} 
         onChange={(e) => setRejectReason(e.target.value)} 
         className="w-full px-4 py-2 border rounded-lg min-h-[100px]" 
         placeholder="Enter reason..."
        />
       </div>
      </div>
      <div className="flex justify-end gap-3 mt-6">
       <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 bg-muted/50 text-foreground/90 rounded-lg">Cancel</button>
       <button onClick={handleReject} disabled={submitting} className="px-4 py-2 bg-rose-600 text-white rounded-lg disabled:opacity-50">
        {submitting ? 'Rejecting...' : 'Confirm Reject'}
       </button>
      </div>
     </div>
    </div>,
    document.body
   )}
  </main>
 );
}
