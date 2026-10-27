"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLoans } from '@/app/composables/modules/useLoans';
import { useToast } from '@/app/composables/useToast';
import { useConfirm } from '@/app/composables/useConfirm';
import { useAdminPermissions } from '@/app/composables/useAdminPermissions';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import { createPortal } from 'react-dom';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  KeyRound,
  Send,
  User,
  Building,
  CreditCard,
  Calendar,
  DollarSign,
  FileText,
  BadgeCheck,
  AlertTriangle,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

export default function LoanRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();
  const { confirm } = useConfirm();
  const { addToast } = useToast();
  const { isSuperAdmin, hasPermission } = useAdminPermissions();
  const canReview = isSuperAdmin || hasPermission('loan-requests:review');

  const { 
    getLoanRequestById, 
    approveLoanRequest, 
    rejectLoanRequest, 
    disburseLoanRequest, 
    confirmLoanRequestCode 
  } = useLoans();

  const [loading, setLoading] = useState(true);
  const [loanRequest, setLoanRequest] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showConfirmCodeModal, setShowConfirmCodeModal] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLoanRequestById(id);
      const res = data?.data || data;
      setLoanRequest(res);
    } catch (e: any) {
      setError(e?.message || 'Failed to load loan request details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDetail();
    }
  }, [id]);

  const handleApprove = async () => {
    const confirmed = await confirm({
      title: 'Approve Loan Request',
      message: 'Are you sure you want to approve this loan request? This will transition the request to disbursed status and establish the client loan.',
      confirmText: 'Approve & Disburse'
    });
    if (!confirmed) return;
    setActionLoading(true);
    try {
      await approveLoanRequest(id);
      addToast('Loan request approved and disbursed successfully', 'success');
      fetchDetail();
    } catch (e: any) {
      const msg = e?.message || e?.response?.data?.message || 'Failed to approve loan request';
      addToast(msg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisburse = async () => {
    const confirmed = await confirm({
      title: 'Disburse Loan Request',
      message: 'Are you sure you want to disburse this approved loan?',
      confirmText: 'Disburse Now'
    });
    if (!confirmed) return;
    setActionLoading(true);
    try {
      await disburseLoanRequest(id);
      addToast('Loan request disbursed successfully', 'success');
      fetchDetail();
    } catch (e: any) {
      const msg = e?.message || e?.response?.data?.message || 'Failed to disburse loan request';
      addToast(msg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      addToast('Please enter a reason for rejection', 'error');
      return;
    }
    setActionLoading(true);
    try {
      await rejectLoanRequest(id, { reason: rejectReason.trim() });
      addToast('Loan request rejected', 'success');
      setShowRejectModal(false);
      fetchDetail();
    } catch (e: any) {
      const msg = e?.message || e?.response?.data?.message || 'Failed to reject loan request';
      addToast(msg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmCode = async () => {
    if (!confirmationCode.trim()) {
      addToast('Please enter the 6-digit confirmation code', 'error');
      return;
    }
    setActionLoading(true);
    try {
      await confirmLoanRequestCode(id, confirmationCode.trim());
      addToast('Loan request confirmed successfully. It is now ready for approval.', 'success');
      setShowConfirmCodeModal(false);
      fetchDetail();
    } catch (e: any) {
      const msg = e?.message || e?.response?.data?.message || 'Failed to confirm code. Verify the code is valid and request is PENDING.';
      addToast(msg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <PulseLoader />
        <span className="text-sm text-muted-foreground">Loading loan request details...</span>
      </div>
    );
  }

  if (error || !loanRequest) {
    return (
      <div className="p-8 max-w-lg mx-auto">
        <EmptyState
          title="Loan Request Not Found"
          description={error || "Could not retrieve the requested loan application."}
        />
        <div className="mt-4 text-center">
          <Link
            href="/dashboard/loan-requests"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Loan Requests
          </Link>
        </div>
      </div>
    );
  }

  const client = loanRequest.client;
  const onboarding = client?.onboarding;
  const ippis = onboarding?.ippisRecord;
  const clientName = onboarding?.employeeName || ippis?.employeeName || client?.fullName || 'Client';

  const reqStatus = (loanRequest.status || '').toUpperCase();
  const availableActions: string[] = Array.isArray(loanRequest.availableActions) ? loanRequest.availableActions : [];

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
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/loan-requests"
            className="p-2 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Loan Request</h1>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted/60 text-muted-foreground">
                {loanRequest.id.substring(0, 8)}...
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Submitted on {new Date(loanRequest.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Action Buttons Guided by availableActions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={fetchDetail}
            className="px-3 py-2 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors flex items-center gap-1.5"
            title="Refresh Details"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>

          {canConfirmCode && (
            <button
              onClick={() => { setConfirmationCode(''); setShowConfirmCodeModal(true); }}
              disabled={actionLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Confirm with Code
            </button>
          )}

          {canApprove && (
            <button
              onClick={handleApprove}
              disabled={actionLoading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Approve & Disburse
            </button>
          )}

          {canReject && (
            <button
              onClick={() => { setRejectReason(''); setShowRejectModal(true); }}
              disabled={actionLoading}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
              Reject
            </button>
          )}

          {canDisburse && (
            <button
              onClick={handleDisburse}
              disabled={actionLoading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              Disburse
            </button>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Requested Amount</div>
          <div className="text-2xl font-bold text-foreground">
            ₦{Number(loanRequest.amount || 0).toLocaleString()}
          </div>
          <span className="text-[11px] text-muted-foreground mt-1 block">
            Type: <span className="font-medium text-foreground">{loanRequest.type || 'ORIGINATION'}</span>
          </span>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Tenor & Rate</div>
          <div className="text-2xl font-bold text-foreground">
            {loanRequest.tenorMonths} <span className="text-sm font-normal text-muted-foreground">months</span>
          </div>
          <span className="text-[11px] text-muted-foreground mt-1 block">
            Interest Rate: <span className="font-medium text-foreground">{loanRequest.interestRatePercent || 0}%</span>
          </span>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Management Charge</div>
          <div className="text-2xl font-bold text-foreground">
            ₦{Number(loanRequest.managementChargeAmount || 0).toLocaleString()}
          </div>
          <span className="text-[11px] text-muted-foreground mt-1 block">
            {loanRequest.managementChargeValue}% ({loanRequest.managementChargeApplication?.replace(/_/g, ' ') || 'Deduct'})
          </span>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Application Status</div>
          <div className="mt-1">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              loanRequest.status === 'CONFIRMED' || loanRequest.status === 'DISBURSED'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : loanRequest.status === 'APPROVED'
                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200'
                : loanRequest.status === 'PENDING'
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {loanRequest.status}
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground mt-2 block">
            Available actions: {availableActions && availableActions.length > 0 ? availableActions.join(', ') : 'None'}
          </span>
        </div>
      </div>

      {/* Main Grid: Client Info & Employment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600" />
              <h3 className="font-semibold text-foreground text-base">Client Information</h3>
            </div>
            {client?.id && (
              <Link
                href={`/dashboard/clients/${client.id}`}
                className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <span>View Full Profile</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs text-muted-foreground block">Employee / Client Name</span>
              <span className="font-semibold text-foreground">{clientName}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Verification Status</span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 mt-0.5">
                <BadgeCheck className="w-3.5 h-3.5" />
                {client?.status || 'VERIFIED'}
              </span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Phone Number</span>
              <span className="font-mono text-foreground">{client?.phone || '—'}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Email Address</span>
              <span className="text-foreground">{client?.email || '—'}</span>
            </div>
            <div className="col-span-2">
              <span className="text-xs text-muted-foreground block">Client ID</span>
              <span className="font-mono text-xs text-muted-foreground break-all">{loanRequest.clientId}</span>
            </div>
          </div>
        </div>

        {/* IPPIS / Employment Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-emerald-600" />
              <h3 className="font-semibold text-foreground text-base">Public Sector Employment</h3>
            </div>
            {ippis?.staffId && (
              <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-semibold border border-emerald-200 dark:border-emerald-800">
                {ippis.staffId}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs text-muted-foreground block">Agency / Ministry</span>
              <span className="font-semibold text-foreground">{onboarding?.agency || ippis?.agency || '—'}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Employment Status</span>
              <span className="font-medium text-foreground">{ippis?.employeeStatus || 'Active Employee'}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Grade / Level</span>
              <span className="font-medium text-foreground">{ippis?.grade || '—'}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Department</span>
              <span className="font-medium text-foreground">{ippis?.department || '—'}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Salary Bank</span>
              <span className="font-medium text-foreground">{ippis?.bankName || '—'}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Account Number</span>
              <span className="font-mono text-foreground">{ippis?.accountNumber || '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dates & Timeline Details */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-xs">
        <h3 className="font-semibold text-foreground text-base mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-600" />
          Timeline & Execution Dates
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-xs text-muted-foreground block">Created At</span>
            <span className="font-medium text-foreground">
              {loanRequest.createdAt ? new Date(loanRequest.createdAt).toLocaleString() : '—'}
            </span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">Confirmed At</span>
            <span className="font-medium text-foreground">
              {loanRequest.confirmedAt ? new Date(loanRequest.confirmedAt).toLocaleString() : 'Not Confirmed'}
            </span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">Approved At</span>
            <span className="font-medium text-foreground">
              {loanRequest.approvedAt ? new Date(loanRequest.approvedAt).toLocaleString() : 'Not Approved'}
            </span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">Disbursed At</span>
            <span className="font-medium text-foreground">
              {loanRequest.disbursedAt ? new Date(loanRequest.disbursedAt).toLocaleString() : 'Not Disbursed'}
            </span>
          </div>
        </div>

        {loanRequest.rejectionReason && (
          <div className="mt-4 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50">
            <span className="text-xs font-semibold text-rose-800 dark:text-rose-300 block mb-1">Rejection Reason:</span>
            <p className="text-sm text-rose-700 dark:text-rose-200">{loanRequest.rejectionReason}</p>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setShowRejectModal(false)}></div>
          <div className="relative bg-card rounded-2xl p-6 w-full max-w-md mx-4 border border-border shadow-2xl">
            <h3 className="text-lg font-semibold text-foreground mb-1">Reject Loan Request</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Please specify the reason for rejecting this loan request.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Rejection Reason *
                </label>
                <textarea 
                  value={rejectReason} 
                  onChange={(e) => setRejectReason(e.target.value)} 
                  className="w-full px-4 py-2.5 border rounded-lg min-h-[100px] text-sm bg-card border-border outline-none focus:ring-1 focus:ring-rose-200 focus:border-rose-400" 
                  placeholder="Enter reason..."
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
                disabled={actionLoading} 
                className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors"
              >
                {actionLoading ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Confirm Code Modal */}
      {showConfirmCodeModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setShowConfirmCodeModal(false)}></div>
          <div className="relative bg-card rounded-2xl p-6 w-full max-w-md mx-4 border border-border shadow-2xl">
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
                disabled={actionLoading} 
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors shadow-sm"
              >
                {actionLoading ? 'Confirming...' : 'Verify & Confirm'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
