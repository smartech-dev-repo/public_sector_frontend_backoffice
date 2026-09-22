"use client";

import { useEffect, useState } from 'react';
import { useAgents } from '@/app/composables/modules/useAgents';
import { useToast } from '@/app/composables/useToast';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import { createPortal } from 'react-dom';
import { useConfirm } from '@/app/composables/useConfirm';

export default function AgentManagementPage() {
  const { confirm } = useConfirm();

  const { loading, error, agents, fetchAgents, approveAgent, rejectAgent, resendCredentials } = useAgents();
  const { addToast } = useToast();

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const handleApprove = async (id: string) => {
    const confirmed = await confirm({ message: 'Are you sure you want to approve this agent?' });
    if (!confirmed) return;
    try {
      await approveAgent(id);
      addToast('Agent approved successfully', 'success');
      fetchAgents();
    } catch (e: any) {
      addToast(e?.response?.data?.message || 'Failed to approve agent', 'error');
    }
  };

  const handleResendCredentials = async (id: string) => {
    try {
      await resendCredentials(id);
      addToast('Credentials resent successfully', 'success');
    } catch (e: any) {
      addToast(e?.response?.data?.message || 'Failed to resend credentials', 'error');
    }
  };

  const openRejectModal = (agent: any) => {
    setSelectedAgent(agent);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      addToast('Reason is required', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await rejectAgent(selectedAgent.id, { reason: rejectReason });
      addToast('Agent rejected', 'success');
      setShowRejectModal(false);
      fetchAgents();
    } catch (e: any) {
      addToast(e?.response?.data?.message || 'Failed to reject agent', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Agent Management</h1>
      </div>

      {loading && <PulseLoader />}
      {!loading && error && <div className="text-red-500 py-12 text-center">{error}</div>}
      
      {!loading && !error && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {agents.length === 0 && <EmptyState message="No agents found." />}
          {agents.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {agents.map((agent: any) => (
                    <tr key={agent.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-mono">{agent.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">{agent.firstName} {agent.lastName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="px-2 py-1 bg-slate-100 rounded text-xs font-medium">{agent.status || agent.reviewStatus}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                        {agent.status === 'PENDING_REVIEW' && (
                          <>
                            <button onClick={() => handleApprove(agent.id)} className="text-emerald-600 hover:text-emerald-800 transition-colors">Approve</button>
                            <button onClick={() => openRejectModal(agent)} className="text-rose-600 hover:text-rose-800 transition-colors">Reject</button>
                          </>
                        )}
                        <button onClick={() => handleResendCredentials(agent.id)} className="text-blue-600 hover:text-blue-800 transition-colors">Resend Credentials</button>
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
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Reject Agent</h3>
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
