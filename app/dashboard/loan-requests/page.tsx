"use client";

import { useEffect, useState } from 'react';
import { useLoans } from '@/app/composables/modules/useLoans';
import { useToast } from '@/app/composables/useToast';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import { createPortal } from 'react-dom';
import { useConfirm } from '@/app/composables/useConfirm';

export default function LoanRequestsPage() {
  const { confirm } = useConfirm();

  const { loading, error, loanRequests, fetchLoanRequests, approveLoanRequest, rejectLoanRequest, disburseLoanRequest } = useLoans();
  const { addToast } = useToast();

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchLoanRequests(statusFilter ? { status: statusFilter } : {});
  }, [fetchLoanRequests, statusFilter]);

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
    <main className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Loan Requests</h1>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="">All Statuses</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="APPROVED">APPROVED</option>
          <option value="REJECTED">REJECTED</option>
          <option value="DISBURSED">DISBURSED</option>
        </select>
      </div>

      {loading && <PulseLoader />}
      {!loading && error && <div className="text-red-500 py-12 text-center">{error}</div>}
      
      {!loading && !error && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {loanRequests.length === 0 && <EmptyState title="No loan requests found." />}
          {loanRequests.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-[#E9F4EE]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">Date Created</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">Client</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loanRequests.map((req: any) => (
                    <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-mono">{new Date(req.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">{req.clientId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">₦{req.amount?.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="px-2 py-1 bg-slate-100 rounded text-xs font-medium">{req.status}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                        {req.status === 'CONFIRMED' && (
                          <>
                            <button onClick={() => handleApprove(req.id)} className="text-emerald-600 hover:text-emerald-800 transition-colors">Approve</button>
                            <button onClick={() => openRejectModal(req)} className="text-rose-600 hover:text-rose-800 transition-colors">Reject</button>
                          </>
                        )}
                        {req.status === 'APPROVED' && (
                          <button onClick={() => handleDisburse(req.id)} className="text-blue-600 hover:text-blue-800 transition-colors">Disburse</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowRejectModal(false)}></div>
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Reject Loan Request</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reason for Rejection</label>
                <textarea 
                  value={rejectReason} 
                  onChange={(e) => setRejectReason(e.target.value)} 
                  className="w-full px-4 py-2 border rounded-lg min-h-[100px]" 
                  placeholder="Enter reason..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg">Cancel</button>
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
