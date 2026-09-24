"use client";

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useClients } from '@/app/composables/modules/useClients';
import { useSessions } from '@/app/composables/modules/useSessions';
import { useToast } from '@/app/composables/useToast';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import { useConfirm } from '@/app/composables/useConfirm';

export default function ClientsPage() {
  const { confirm } = useConfirm();

  const { loading, error, clients, fetchClients, retryClient, approveClient, getClientWallet, creditClientWallet, debitClientWallet } = useClients();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [amount, setAmount] = useState<number | ''>('');
  const [walletLoading, setWalletLoading] = useState(false);
  const [note, setNote] = useState('');
  const { revokeClientSessions } = useSessions();
  const { addToast } = useToast();

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

    const openWalletModal = async (client: any) => {
    setSelectedClient(client);
    setWallet(null);
    setAmount('');
    setNote('');
    setShowWalletModal(true);
    setWalletLoading(true);
    try {
      const data = await getClientWallet(client.id);
      setWallet(data);
    } catch (e: any) {
      addToast('Failed to load wallet', 'error');
    } finally {
      setWalletLoading(false);
    }
  };

  const handleCredit = async () => {
    if (!amount || amount <= 0) return addToast('Enter a valid amount', 'error');
    setWalletLoading(true);
    try {
      await creditClientWallet(selectedClient.id, { amount: Number(amount), reference: 'REF-' + Date.now(), description: note || 'Credit' });
      addToast('Wallet credited successfully', 'success');
      setAmount('');
      setNote('');
      const data = await getClientWallet(selectedClient.id);
      setWallet(data);
    } catch (e: any) {
      addToast(e?.response?.data?.message || 'Failed to credit wallet', 'error');
    } finally {
      setWalletLoading(false);
    }
  };

  const handleDebit = async () => {
    if (!amount || amount <= 0) return addToast('Enter a valid amount', 'error');
    setWalletLoading(true);
    try {
      await debitClientWallet(selectedClient.id, { amount: Number(amount), reference: 'REF-' + Date.now(), description: note || 'Debit' });
      addToast('Wallet debited successfully', 'success');
      setAmount('');
      setNote('');
      const data = await getClientWallet(selectedClient.id);
      setWallet(data);
    } catch (e: any) {
      addToast(e?.response?.data?.message || 'Failed to debit wallet', 'error');
    } finally {
      setWalletLoading(false);
    }
  };

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
            <thead className="bg-[#E9F4EE]">
                  <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">Date Created</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">Updated At</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clients.map((client: any) => (
                <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-mono">{new Date(client.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">{client.firstName} {client.lastName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{client.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${statusClass(client.status)}`}>
                      {client.status || 'UNKNOWN'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {new Date(client.updatedAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <button onClick={() => openWalletModal(client)} className="text-blue-600 hover:text-blue-800 transition-colors">Wallet</button>
                    {client.status === 'MANUAL_REVIEW' && (
                      <button onClick={() => handleApprove(client.id)} className="text-emerald-600 hover:text-emerald-800 transition-colors">Approve</button>
                    )}
                    <button onClick={() => handleRetry(client.id)} className="text-amber-600 hover:text-amber-800 transition-colors">Retry</button>
                    <button onClick={() => handleRevoke(client.id)} className="text-rose-600 hover:text-rose-800 transition-colors">Revoke</button>
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
          {showWalletModal && selectedClient && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowWalletModal(false)}></div>
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Client Wallet</h3>
                <p className="text-sm text-slate-500 mt-1">{selectedClient.firstName} {selectedClient.lastName}</p>
              </div>
              <button onClick={() => setShowWalletModal(false)} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-1.5 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6 text-center">
              <p className="text-sm text-slate-500 mb-1">Available Balance</p>
              {walletLoading && !wallet ? (
                <div className="animate-pulse h-8 w-32 bg-slate-200 rounded mx-auto"></div>
              ) : (
                <h4 className="text-3xl font-bold text-slate-800">₦{wallet?.balance?.toLocaleString() || '0.00'}</h4>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₦)</label>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="Enter amount" 
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Note / Description</label>
                <input 
                  type="text" 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Refund or Adjustment" 
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" 
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button onClick={handleDebit} disabled={walletLoading || !amount} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors disabled:opacity-50">
                  Debit Wallet
                </button>
                <button onClick={handleCredit} disabled={walletLoading || !amount} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors disabled:opacity-50">
                  Credit Wallet
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

    </main>
  );
}
