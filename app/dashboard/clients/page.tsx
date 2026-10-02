"use client";

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useClients } from '@/app/composables/modules/useClients';
import { useSessions } from '@/app/composables/modules/useSessions';
import { useToast } from '@/app/composables/useToast';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import { useConfirm } from '@/app/composables/useConfirm';
import CustomDateRangePicker from '@/app/components/ui/CustomDateRangePicker';
import Pagination from '@/app/components/ui/Pagination';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/app/components/ui/Select';
import Link from 'next/link';

export default function ClientsPage() {
  const { confirm } = useConfirm();

  const { loading, error, clients, fetchClients, retryClient, approveClient, getClientWallet, creditClientWallet, debitClientWallet, meta } = useClients();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [amount, setAmount] = useState<number | ''>('');
  const [walletLoading, setWalletLoading] = useState(false);
  const [note, setNote] = useState('');
  const { revokeClientSessions } = useSessions();
  const { addToast } = useToast();

  const [statusFilter, setStatusFilter] = useState('');
  const [q, setQ] = useState('');
  const [createdRange, setCreatedRange] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  useEffect(() => {
    const params: any = { page, limit };
    if (statusFilter && statusFilter !== 'none') params.status = statusFilter;
    if (q.trim()) params.q = q.trim();
    if (createdRange) {
      const [from, to] = createdRange.split(' to ');
      if (from) params.createdFrom = from;
      if (to) params.createdTo = to;
    }
    fetchClients(params);
  }, [fetchClients, statusFilter, q, createdRange, page, limit]);

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
      default: return 'bg-muted/50 text-foreground';
    }
  };

  return (
    <main className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-foreground">Clients Management</h1>
      </div>

      {/* Filters Area */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full text-sm font-medium text-foreground/90 hover:bg-muted/30 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
            Filters
            <svg className={`w-4 h-4 transition-transform ${showFilter ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>
        </div>

        {showFilter && (
          <div className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Search</label>
                <input 
                  type="text"
                  placeholder="Search by phone..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg text-sm bg-card border-border outline-none focus:ring-1 focus:ring-emerald-200 focus:border-emerald-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full bg-card"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">All Statuses</SelectItem>
                    <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                    <SelectItem value="MANUAL_REVIEW">MANUAL REVIEW</SelectItem>
                    <SelectItem value="FAILED">FAILED</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 w-full z-[60] relative">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Date Range</label>
                <CustomDateRangePicker 
                  value={createdRange}
                  onChange={setCreatedRange}
                  placeholder="Created Date"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => { setQ(''); setStatusFilter('none'); setCreatedRange(''); }} className="px-5 py-2 bg-card border border-border rounded-full text-sm font-medium text-foreground/90 hover:bg-muted/30 transition-colors">Clear Filters</button>
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
                <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Name</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Email</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Updated At</th>
                <th className="px-4 py-4 text-right text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clients.map((client: any) => (
                <tr key={client.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground font-mono">{new Date(client.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground">{client.firstName} {client.lastName}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">{client.email}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${statusClass(client.status)}`}>
                      {client.status || 'UNKNOWN'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {new Date(client.updatedAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <Link href={`/dashboard/client-loans?clientId=${client.id}`} className="text-emerald-700 dark:text-emerald-400 hover:text-[#016c41] transition-colors">Loans</Link>
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
                  <td colSpan={6} className="p-0 border-b-0">
                    <div className="p-8">
                      <EmptyState title="No clients found" description="There are no clients matching your criteria." />
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
</div>
          {meta && meta.total > 0 && (
            <Pagination
              totalItems={meta.total}
              currentPage={page}
              itemsPerPage={limit}
              onPageChange={(p) => setPage(p)}
              onItemsPerPageChange={(l) => setLimit(l)}
            />
          )}
        </div>
      )}
          {showWalletModal && selectedClient && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="fixed inset-0 bg-slate-900 dark:bg-slate-800/50 backdrop-blur-sm" onClick={() => setShowWalletModal(false)}></div>
          <div className="relative bg-card rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-foreground">Client Wallet</h3>
                <p className="text-sm text-muted-foreground mt-1">{selectedClient.firstName} {selectedClient.lastName}</p>
              </div>
              <button onClick={() => setShowWalletModal(false)} className="text-muted-foreground/70 hover:text-muted-foreground bg-muted/50 hover:bg-slate-200 rounded-full p-1.5 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="bg-muted/30 p-4 rounded-xl border border-border/50 mb-3 text-center">
              <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
              {walletLoading && !wallet ? (
                <div className="animate-pulse h-8 w-32 bg-slate-200 rounded mx-auto"></div>
              ) : (
                <h4 className="text-3xl font-bold text-foreground">₦{wallet?.balance?.toLocaleString() || '0.00'}</h4>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground/90 mb-1">Amount (₦)</label>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="Enter amount" 
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:ring-1 focus:ring-emerald-200 focus:border-emerald-400 outline-none transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/90 mb-1">Note / Description</label>
                <input 
                  type="text" 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Refund or Adjustment" 
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:ring-1 focus:ring-emerald-200 focus:border-emerald-400 outline-none transition-all" 
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
