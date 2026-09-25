"use client";

import { useEffect, useState, useMemo } from 'react';
import { useAgents } from '@/app/composables/modules/useAgents';
import { useSessions } from '@/app/composables/modules/useSessions';
import { useToast } from '@/app/composables/useToast';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import { useConfirm } from '@/app/composables/useConfirm';

export default function AgentSecurityPage() {
  const { confirm } = useConfirm();

  const { loading, error, agents, fetchAgents } = useAgents();
  const { revokeAgentSessions } = useSessions();
  const { addToast } = useToast();

  const [revokingId, setRevokingId] = useState('');

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const approvedAgents = useMemo(() => {
    return agents.filter((a: any) => a.status === 'APPROVED');
  }, [agents]);

  const handleRevoke = async (agent: any) => {
    const confirmed = await confirm({ message: `Are you sure you want to revoke all sessions for ${agent.firstName}?` });
    if (!confirmed) return;
    setRevokingId(agent.id);
    try {
      await revokeAgentSessions(agent.id);
      addToast('Sessions revoked successfully', 'success');
    } catch (err: any) {
      addToast(err?.response?.data?.message || 'Failed to revoke sessions', 'error');
    } finally {
      setRevokingId('');
    }
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="py-20 text-center text-slate-500">
          Loading agents...
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-sm text-slate-500 mt-1">Monitor agent activity and enforce immediate session revocation for flagged agents.</p>
            </div>
          </div>

          {/* Alert */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <div>
              <h4 className="text-sm text-amber-900">Immediate Access Revocation (SOP 10)</h4>
              <p className="text-xs text-amber-700 mt-1 leading-relaxed">Revoking an agent immediately terminates their active sessions. This action is fully audited.</p>
            </div>
          </div>

          {/* Agent List */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#E9F4EE]">
                  <tr>
                    <th scope="col" className="px-6 py-2 tracking-wider">Agent Details</th>
                    <th scope="col" className="px-6 py-2 tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-2 tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {approvedAgents.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-slate-500">No active agents found.</td>
                    </tr>
                  )}
                  {approvedAgents.map((agent: any) => (
                    <tr key={agent.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-medium">
                            {agent.firstName?.charAt(0) || 'A'}
                          </div>
                          <div>
                            <div className="text-slate-800 font-medium">{agent.firstName} {agent.lastName}</div>
                            <div className="text-xs font-mono text-slate-500 mt-0.5">{agent.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-2">
                        <span className="px-2.5 py-1 rounded-md text-xs whitespace-nowrap bg-emerald-100 text-emerald-700">
                          {agent.status}
                        </span>
                      </td>
                      <td className="px-6 py-2 text-right">
                        <button onClick={() => handleRevoke(agent)} disabled={revokingId === agent.id} className="px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200 disabled:opacity-50">
                          {revokingId === agent.id ? 'Revoking...' : 'Revoke All Sessions'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
