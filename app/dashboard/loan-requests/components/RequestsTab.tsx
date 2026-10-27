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
import { useAdminPermissions } from '@/app/composables/useAdminPermissions';
import Link from 'next/link';
import { 
  CheckCircle, 
  XCircle, 
  KeyRound, 
  Send, 
  ExternalLink, 
  User, 
  FileText, 
  Calendar,
  AlertCircle,
  CreditCard
} from 'lucide-react';

export default function RequestsTab() {
  const { isSuperAdmin, hasPermission } = useAdminPermissions();
  const canReview = isSuperAdmin || hasPermission('loan-requests:review');
  const [showFilter, setShowFilter] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const { confirm } = useConfirm();

  const { 
    loading, 
    error, 
    loanRequests, 
    fetchLoanRequests, 
    approveLoanRequest, 
    rejectLoanRequest, 
    disburseLoanRequest, 
    confirmLoanRequestCode,
    meta 
  } = useLoans();
  const { addToast } = useToast();

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showConfirmCodeModal, setShowConfirmCodeModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [clientIdFilter, setClientIdFilter] = useState('');
  const [createdRange, setCreatedRange] = useState('');
  const [disbursedRange, setDisbursedRange] = useState('');

  const loadData = () => {
    if (!canReview) return;
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
  };

  useEffect(() => {
    loadData();
  }, [fetchLoanRequests, statusFilter, typeFilter, clientIdFilter, createdRange, disbursedRange, page, limit, canReview]);

  const handleApprove = async (id: string) => {
    const confirmed = await confirm({ 
      title: 'Approve Loan Request',
      message: 'Are you sure you want to approve this loan request? This will approve and immediately disburse the loan.',
      confirmText: 'Approve & Disburse'
    });
    if (!confirmed) return;
    try {
      await approveLoanRequest(id);
      addToast('Loan request approved and disbursed successfully', 'success');
      loadData();
    } catch (e: any) {
      const msg = e?.message || e?.response?.data?.message || 'Failed to approve loan request';
      addToast(msg, 'error');
    }
  };

  const handleDisburse = async (id: string) => {
    const confirmed = await confirm({ 
      title: 'Disburse Loan Request',
      message: 'Are you sure you want to disburse this approved loan?',
      confirmText: 'Disburse Now'
    });
    if (!confirmed) return;
    try {
      await disburseLoanRequest(id);
      addToast('Loan request disbursed successfully', 'success');
      loadData();
    } catch (e: any) {
      const msg = e?.message || e?.response?.data?.message || 'Failed to disburse loan request';
      addToast(msg, 'error');
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
      loadData();
    } catch (e: any) {
      const msg = e?.message || e?.response?.data?.message || 'Failed to reject loan request';
      addToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const openConfirmCodeModal = (req: any) => {
    setSelectedRequest(req);
    setConfirmationCode('');
    setShowConfirmCodeModal(true);
  };

  const handleConfirmCode = async () => {
    if (!confirmationCode.trim()) {
      addToast('Please enter the confirmation OTP code', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await confirmLoanRequestCode(selectedRequest.id, confirmationCode.trim());
      addToast('Loan request confirmed successfully. It can now be approved.', 'success');
      setShowConfirmCodeModal(false);
      loadData();
    } catch (e: any) {
      const msg = e?.message || e?.response?.data?.message || 'Failed to confirm code. Verify code is valid and request is PENDING.';
      addToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    const normalized = (status || '').toUpperCase();
    switch (normalized) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            CONFIRMED
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            APPROVED
          </span>
        );
      case 'DISBURSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            DISBURSED
          </span>
        );
      case 'PENDING':
      case 'PENDING_REVIEW':
      case 'SUBMITTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            PENDING
          </span>
        );
      case 'REJECTED':
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            {normalized}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-muted/60 dark:bg-muted/40 text-muted-foreground border border-border/60 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60" />
            {normalized || 'UNKNOWN'}
          </span>
        );
    }
  };

  if (!canReview) {
    return (
      <div className="p-8">
        <EmptyState
          title="Access Restricted"
          description="You do not have permission to view or review loan requests."
        />
      </div>
    );
  }

  return (
    <main className="w-full">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold text-foreground hidden">Loan Requests</h1>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full text-sm font-medium text-foreground/90 hover:bg-muted/30 transition-colors"
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
                    <SelectItem value="PENDING">PENDING</SelectItem>
                    <SelectItem value="CONFIRMED">CONFIRMED</SelectItem>
                    <SelectItem value="APPROVED">APPROVED</SelectItem>
                    <SelectItem value="DISBURSED">DISBURSED</SelectItem>
                    <SelectItem value="REJECTED">REJECTED</SelectItem>
                    <SelectItem value="FAILED">FAILED</SelectItem>
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
              <div className="space-y-1.5 relative">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Created Date</label>
                <CustomDateRangePicker 
                  value={createdRange}
                  onChange={setCreatedRange}
                  placeholder="Created Date"
                />
              </div>
              <div className="space-y-1.5 relative">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Disbursed Date</label>
                <CustomDateRangePicker 
                  value={disbursedRange}
                  onChange={setDisbursedRange}
                  placeholder="Disbursed Date"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => { 
                  setClientIdFilter(''); 
                  setStatusFilter('none'); 
                  setTypeFilter('none'); 
                  setCreatedRange(''); 
                  setDisbursedRange(''); 
                }} 
                className="px-5 py-2 bg-card border border-border rounded-full text-sm font-medium text-foreground/90 hover:bg-muted/30 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {loading && <PulseLoader />}
      {!loading && error && <div className="text-red-500 py-12 text-center">{error}</div>}
      
      {!loading && !error && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-[#E9F4EE] dark:bg-emerald-950/20">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Date Created</th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Client</th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Status</th>
                  {canReview && (
                    <th className="px-4 py-4 text-right text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {loanRequests.length === 0 ? (
                  <tr>
                    <td colSpan={canReview ? 5 : 4} className="p-8">
                      <div className="flex justify-center w-full">
                        <EmptyState title="No loan requests found." />
                      </div>
                    </td>
                  </tr>
                ) : (
                  loanRequests.map((req: any) => {
                    const clientName = 
                      req.client?.onboarding?.employeeName || 
                      req.client?.onboarding?.ippisRecord?.employeeName || 
                      req.client?.fullName || 
                      req.client?.name || 
                      req.clientName;
                    const staffId = req.client?.onboarding?.ippisRecord?.staffId;
                    const agency = req.client?.onboarding?.agency || req.client?.onboarding?.ippisRecord?.agency || req.agency;
                    const phone = req.client?.phone;

                    const reqStatus = (req.status || '').toUpperCase();
                    const availableActions: string[] = Array.isArray(req.availableActions) ? req.availableActions : [];

                    // 1. Confirm with Code: on PENDING loan requests
                    const canConfirmCode = canReview && (
                      availableActions.includes('confirm-code') || 
                      availableActions.includes('confirm') || 
                      reqStatus === 'PENDING'
                    );

                    // 2. Approve: on CONFIRMED loan requests
                    const canApprove = canReview && (
                      availableActions.includes('approve') || 
                      reqStatus === 'CONFIRMED'
                    );

                    // 3. Reject: on PENDING or CONFIRMED loan requests
                    const canReject = canReview && (
                      availableActions.includes('reject') || 
                      reqStatus === 'PENDING' || 
                      reqStatus === 'CONFIRMED'
                    );

                    // 4. Disburse: on APPROVED loan requests
                    const canDisburse = canReview && (
                      availableActions.includes('disburse') || 
                      reqStatus === 'APPROVED'
                    );

                    return (
                      <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground font-mono">
                          {new Date(req.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground">
                              {clientName || (phone ? phone : (req.clientId ? `${req.clientId.substring(0, 8)}...` : 'Client'))}
                            </span>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                              {agency && (
                                <span className="px-1.5 py-0.5 rounded bg-muted/60 text-[10px] font-medium text-foreground/80">
                                  {agency}
                                </span>
                              )}
                              {staffId && <span className="font-mono text-[11px]">{staffId}</span>}
                              {clientName && phone && (
                                <span className="text-[11px] text-muted-foreground">{phone}</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground">
                              ₦{Number(req.amount || 0).toLocaleString()}
                            </span>
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                              {req.tenorMonths && <span>{req.tenorMonths} mos</span>}
                              {req.type && req.type !== 'ORIGINATION' && (
                                <span className="px-1 py-0.2 rounded text-[9px] font-semibold bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
                                  {req.type}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {renderStatusBadge(req.status)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                          <TableDropdown>
                            <Link 
                              href={`/dashboard/loan-requests/${req.id}`}
                              className="w-full text-left px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted/40 transition-colors flex items-center gap-2"
                            >
                              <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                              View Loan Details
                            </Link>

                            {req.clientId && (
                              <>
                                <Link 
                                  href={`/dashboard/clients/${req.clientId}`}
                                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted/40 transition-colors flex items-center gap-2"
                                >
                                  <User className="w-4 h-4 text-muted-foreground shrink-0" />
                                  View Customer Profile
                                </Link>
                                <Link 
                                  href={`/dashboard/loan-requests?tab=client-loans&clientId=${req.clientId}`}
                                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted/40 transition-colors flex items-center gap-2"
                                >
                                  <CreditCard className="w-4 h-4 text-muted-foreground shrink-0" />
                                  View Existing Loans
                                </Link>
                              </>
                            )}

                            {canConfirmCode && (
                              <button 
                                onClick={() => openConfirmCodeModal(req)} 
                                className="w-full text-left px-4 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors flex items-center gap-2"
                              >
                                <KeyRound className="w-4 h-4 text-blue-600 shrink-0" />
                                Confirm with Code
                              </button>
                            )}

                            {canApprove && (
                              <button 
                                onClick={() => handleApprove(req.id)} 
                                className="w-full text-left px-4 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors flex items-center gap-2"
                              >
                                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                                Approve
                              </button>
                            )}

                            {canReject && (
                              <button 
                                onClick={() => openRejectModal(req)} 
                                className="w-full text-left px-4 py-2.5 text-sm font-medium text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex items-center gap-2"
                              >
                                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                                Reject
                              </button>
                            )}

                            {canDisburse && (
                              <button 
                                onClick={() => handleDisburse(req.id)} 
                                className="w-full text-left px-4 py-2.5 text-sm font-medium text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors flex items-center gap-2"
                              >
                                <Send className="w-4 h-4 text-indigo-600 shrink-0" />
                                Disburse
                              </button>
                            )}
                          </TableDropdown>
                        </td>
                      </tr>
                    );
                  })
                )}
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
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setShowRejectModal(false)}></div>
          <div className="relative bg-card rounded-2xl p-6 w-full max-w-md mx-4 animate-in fade-in zoom-in-95 duration-200 border border-border shadow-2xl">
            <h3 className="text-lg font-semibold text-foreground mb-1">Reject Loan Request</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Please state why this loan request is being declined. This will be recorded on the audit log.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Reason for Rejection *
                </label>
                <textarea 
                  value={rejectReason} 
                  onChange={(e) => setRejectReason(e.target.value)} 
                  className="w-full px-4 py-2.5 border rounded-lg min-h-[100px] text-sm bg-card border-border outline-none focus:ring-1 focus:ring-rose-200 focus:border-rose-400" 
                  placeholder="e.g. Insufficient documentation, active loan limit exceeded..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6 w-full">
              <button 
                onClick={() => setShowRejectModal(false)} 
                className="flex-1 px-4 py-2.5 bg-muted/50 hover:bg-muted text-foreground/90 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleReject} 
                disabled={submitting} 
                className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors shadow-sm"
              >
                {submitting ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Confirm Code Modal (POST /admin/loan-requests/:id/confirm-code) */}
      {showConfirmCodeModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setShowConfirmCodeModal(false)}></div>
          <div className="relative bg-card rounded-2xl p-6 w-full max-w-md mx-4 animate-in fade-in zoom-in-95 duration-200 border border-border shadow-2xl">
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mb-3">
              <KeyRound className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Confirm Loan Request Code</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Enter the OTP verification code issued to the client to confirm this stuck PENDING request on their behalf.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Verification Code (OTP) *
                </label>
                <input 
                  type="text" 
                  maxLength={10}
                  value={confirmationCode} 
                  onChange={(e) => setConfirmationCode(e.target.value)} 
                  className="w-full px-4 py-2.5 border rounded-lg text-lg font-mono tracking-widest text-center bg-card border-border outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-400" 
                  placeholder="123456"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6 w-full">
              <button 
                onClick={() => setShowConfirmCodeModal(false)} 
                className="flex-1 px-4 py-2.5 bg-muted/50 hover:bg-muted text-foreground/90 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmCode} 
                disabled={submitting} 
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors shadow-sm"
              >
                {submitting ? 'Confirming...' : 'Verify & Confirm'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </main>
  );
}
