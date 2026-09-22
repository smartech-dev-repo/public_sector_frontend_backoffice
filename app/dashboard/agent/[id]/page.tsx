"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAgents } from '@/app/composables/modules/useAgents';
import { useSessions } from '@/app/composables/modules/useSessions';
import { useToast } from '@/app/composables/useToast';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import { useConfirm } from '@/app/composables/useConfirm';

export default function AgentPage({ params }: { params: Promise<{ id: string }> }) {
  const { confirm } = useConfirm();

  const router = useRouter();
  const { id } = use(params);
  const { getAgentById, approveAgent, rejectAgent, resendCredentials } = useAgents();
  const { revokeAgentSessions } = useSessions();
  const { addToast } = useToast();

  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchAgentDetails = async () => {
    setLoading(true);
    try {
      const data = await getAgentById(id);
      setApplication(data);
    } catch (err: any) {
      addToast('Failed to load agent details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentDetails();
  }, [id]); // fetchAgentDetails removed from dependency array to avoid infinite loop since it is not wrapped in useCallback

  const handleApprove = async () => {
    const confirmed = await confirm({ message: 'Are you sure you want to approve this agent?' });
    if (!confirmed) return;
    setSubmitting(true);
    try {
      await approveAgent(application.id);
      addToast('Agent approved successfully', 'success');
      await fetchAgentDetails();
    } catch (err: any) {
      addToast(err?.response?.data?.message || 'Failed to approve', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    const confirmed = await confirm({ message: 'Are you sure you want to reject this agent?' });
    if (!confirmed) return;
    setSubmitting(true);
    try {
      await rejectAgent(application.id, { reason: 'Rejected by admin' });
      addToast('Application rejected successfully', 'success');
      await fetchAgentDetails();
    } catch (err: any) {
      addToast(err?.response?.data?.message || 'Failed to reject', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendCredentials = async () => {
    const confirmed = await confirm({ message: 'Are you sure you want to resend credentials?' });
    if (!confirmed) return;
    try {
      await resendCredentials(application.id);
      addToast('Credentials resent successfully', 'success');
    } catch (err: any) {
      addToast(err?.response?.data?.message || 'Failed to resend credentials', 'error');
    }
  };

  const handleRevokeSessions = async () => {
    const confirmed = await confirm({ message: 'Are you sure you want to revoke all sessions for this agent?' });
    if (!confirmed) return;
    try {
      await revokeAgentSessions(application.id);
      addToast('Sessions revoked successfully', 'success');
    } catch (err: any) {
      addToast(err?.response?.data?.message || 'Failed to revoke sessions', 'error');
    }
  };

  const statusClass = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-100 text-amber-700';
      case 'APPROVED': return 'bg-emerald-100 text-emerald-700';
      case 'REJECTED': return 'bg-rose-100 text-rose-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <Link href="/dashboard/maker-checker" className="flex items-center text-sm text-slate-500 hover:text-emerald-600 transition-colors">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          Back to Queue
        </Link>
        {application && (
          <span className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap ${statusClass(application.status)}`}>
            {application.status}
          </span>
        )}
      </div>

      {loading && <PulseLoader />}
      {!loading && !application && <div className="text-center py-20 text-slate-500">Application not found.</div>}

      {!loading && application && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:p-6">
          {/* Applicant Info */}
          <div className="col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-4 sm:p-6">
              <h2 className="text-xl text-slate-800 mb-6 border-b border-slate-100 pb-4">Applicant Information</h2>
              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Full Name</div>
                  <div className="font-medium text-slate-800 text-lg">{application.firstName} {application.lastName}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Application Ref (ID)</div>
                  <div className="font-mono text-slate-800">{application.id}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Email</div>
                  <div className="font-medium text-slate-800">{application.email}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Submission Date</div>
                  <div className="font-medium text-slate-800">{new Date(application.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-6">
            {application.status === 'PENDING' && (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 sm:p-6 text-white">
                <h2 className="text-lg mb-4">Internal Control (Checker)</h2>
                <p className="text-sm text-slate-400 mb-6">Review the applicant's details and approve or reject.</p>
                
                <div className="space-y-3">
                  <button onClick={handleApprove} disabled={submitting} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors disabled:opacity-50">
                    {submitting ? 'Processing...' : 'Approve Agent'}
                  </button>
                  <button onClick={handleReject} disabled={submitting} className="w-full py-3 bg-transparent border-2 border-rose-500/30 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors disabled:opacity-50">
                    {submitting ? 'Processing...' : 'Reject Application'}
                  </button>
                </div>
              </div>
            )}

            {application.status === 'APPROVED' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6">
                <h2 className="text-lg mb-4 text-slate-800">Agent Actions</h2>
                <div className="space-y-3">
                  <button onClick={handleResendCredentials} className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-colors font-medium">
                    Resend Credentials
                  </button>
                  <button onClick={handleRevokeSessions} className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors font-medium">
                    Revoke Sessions
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
