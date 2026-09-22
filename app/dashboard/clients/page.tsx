"use client";

import { useEffect } from 'react';
import { useClients } from '@/app/composables/modules/useClients';
import { useSessions } from '@/app/composables/modules/useSessions';
import { useToast } from '@/app/composables/useToast';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import { useConfirm } from '@/app/composables/useConfirm';

export default function ClientsPage() {
  const { confirm } = useConfirm();

  const { loading, error, clients, fetchClients, retryClient, approveClient } = useClients();
  const { revokeClientSessions } = useSessions();
  const { addToast } = useToast();

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleApprove = async (id: string) => {
    const confirmed = await confirm({ message: 'Approve this client?' });
    if (confirmed) {
      try {
        await approveClient(id);
        addToast('Client approved successfully', 'success');
        fetchClients();
      } catch (e: any) {
        addToast(e?.response?.data?.message || 'Failed to approve client', 'error');
      }
    }
  };

  const handleRetry = async (id: string) => {
    const confirmed = await confirm({ message: 'Retry workflow for this client?' });
    if (confirmed) {
      try {
        await retryClient(id);
        addToast('Client retry initiated', 'success');
        fetchClients();
      } catch (e: any) {
        addToast(e?.response?.data?.message || 'Failed to retry client', 'error');
      }
    }
  };

  const handleRevoke = async (id: string) => {
    const confirmed = await confirm({ message: 'Revoke all sessions for this client?' });
    if (confirmed) {
      try {
        await revokeClientSessions(id);
        addToast('Sessions revoked', 'success');
      } catch (e: any) {
        addToast(e?.response?.data?.message || 'Failed to revoke sessions', 'error');
      }
    }
  };

  const statusClass = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-100 text-emerald-800';
      case 'MANUAL_REVIEW': return 'bg-amber-100 text-amber-800';
      case 'FAILED': return 'bg-rose-100 text-rose-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <main className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Clients Management</h1>
      </div>

      {loading && <PulseLoader />}
      {!loading && error && <div className="text-red-500 py-12 text-center">{error}</div>}
      
      {!loading && !error && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
<table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clients.map((client: any) => (
                <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-mono">{client.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">{client.firstName} {client.lastName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{client.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${statusClass(client.status)}`}>
                      {client.status || 'UNKNOWN'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    {client.status === 'MANUAL_REVIEW' && (
                      <button onClick={() => handleApprove(client.id)} className="text-emerald-600 hover:text-emerald-800 transition-colors">Approve</button>
                    )}
                    <button onClick={() => handleRetry(client.id)} className="text-amber-600 hover:text-amber-800 transition-colors">Retry</button>
                    <button onClick={() => handleRevoke(client.id)} className="text-rose-600 hover:text-rose-800 transition-colors">Revoke Sessions</button>
                  </td>
                </tr>
              ))}
              {clients.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">No clients found.</td>
                </tr>
              )}
            </tbody>
          </table>
</div>
        </div>
      )}
    </main>
  );
}
