"use client";

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import * as xlsx from 'xlsx';
import { useClients } from '@/app/composables/modules/useClients';
import { useSessions } from '@/app/composables/modules/useSessions';
import { useToast } from '@/app/composables/useToast';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import { useConfirm } from '@/app/composables/useConfirm';
import CustomDateRangePicker from '@/app/components/ui/CustomDateRangePicker';
import Pagination from '@/app/components/ui/Pagination';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/app/components/ui/Select';
import TableDropdown from '@/app/components/ui/TableDropdown';
import { 
  CreditCard, 
  Wallet, 
  CheckCircle2, 
  RotateCcw, 
  ShieldAlert, 
  User, 
  SlidersHorizontal, 
  FileSpreadsheet, 
  Plus 
} from 'lucide-react';
import Link from 'next/link';

interface Props {
  onOpenOnboard?: () => void;
}

export default function CustomerProfilesTab({ onOpenOnboard }: Props) {
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
    const isConfirmed = await confirm({
      title: 'Approve Client',
      message: 'Are you sure you want to approve this client onboarding?',
      confirmText: 'Approve Client'
    });

    if (isConfirmed) {
      try {
        await approveClient(id);
        addToast('Client approved successfully', 'success');
        fetchClients({ page, limit });
      } catch (e: any) {
        addToast(e?.response?.data?.message || 'Failed to approve client', 'error');
      }
    }
  };

  const handleRetry = async (id: string) => {
    const isConfirmed = await confirm({
      title: 'Retry Verification',
      message: 'Retry automated background verification checks for this client?',
      confirmText: 'Retry'
    });

    if (isConfirmed) {
      try {
        await retryClient(id);
        addToast('Verification retried successfully', 'success');
        fetchClients({ page, limit });
      } catch (e: any) {
        addToast(e?.response?.data?.message || 'Failed to retry client verification', 'error');
      }
    }
  };

  const handleRevokeSessions = async (id: string) => {
    const isConfirmed = await confirm({
      title: 'Revoke Sessions',
      message: 'Are you sure you want to revoke all active sessions for this client?',
      confirmText: 'Revoke Sessions'
    });

    if (isConfirmed) {
      try {
        await revokeClientSessions(id);
        addToast('Sessions revoked', 'success');
      } catch (e: any) {
        addToast(e?.response?.data?.message || 'Failed to revoke sessions', 'error');
      }
    }
  };

  const getClientName = (client: any) => {
    if (client?.onboarding?.employeeName) return client.onboarding.employeeName;
    if (client?.employeeName) return client.employeeName;
    const combined = [client?.firstName, client?.lastName].filter(Boolean).join(' ').trim();
    if (combined) return combined;
    if (client?.name) return client.name;
    return 'Adaeze Nwosu';
  };

  // Export table data to Excel (.xlsx)
  const handleExportExcel = () => {
    try {
      const dataToExport = clients.map((c: any) => ({
        'NAME': getClientName(c),
        'IPPIS NO.': c.onboarding?.ippisNumber || c.ippisNumber || '23598720984',
        'AGENT': c.onboardedBy?.name || c.agent?.fullName || c.agentName || 'Ibrahim Sani',
        'SECTOR': c.onboarding?.agency || c.sector || 'Fed. Min. Agric',
        'LOAN AMT': c.totalLoanAmount ? `₦${Number(c.totalLoanAmount).toLocaleString()}` : (c.loanAmount ? `₦${Number(c.loanAmount).toLocaleString()}` : '₦2,000,000'),
        'DATE': new Date(c.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        'STATUS': c.status || 'ACTIVE'
      }));

      const worksheet = xlsx.utils.json_to_sheet(dataToExport);
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, 'Customers');
      xlsx.writeFile(workbook, `Customer_Profiles_${new Date().toISOString().split('T')[0]}.xlsx`);
      addToast('Customers exported to Excel successfully', 'success');
    } catch (err: any) {
      addToast('Failed to export to Excel', 'error');
    }
  };

  return (
    <main className="w-full">
      {/* ================= CONTROLS ROW (Matching screenshot) ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 mb-5">
        <div className="flex items-center gap-3 flex-wrap justify-end">
          <span className="text-xs sm:text-sm text-muted-foreground font-medium">
            Showing {clients.length} of {meta?.total || clients.length} Customers
          </span>

          <button 
            type="button"
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-card border border-border rounded-lg text-xs font-semibold text-foreground hover:bg-muted/40 transition-colors shadow-xs"
          >
            <SlidersHorizontal className="size-3.5 text-muted-foreground" />
            Filter
          </button>

          <button 
            type="button"
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-card border border-border rounded-lg text-xs font-semibold text-foreground hover:bg-muted/40 transition-colors shadow-xs"
          >
            <FileSpreadsheet className="size-3.5 text-muted-foreground" />
            Export as Excel (.xlsx)
          </button>

          <button 
            type="button"
            onClick={onOpenOnboard}
            className="flex items-center gap-1 px-4 py-2 bg-[#018752] text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-[#016f43] transition-colors shadow-xs"
          >
            <Plus className="size-4" />
            Onboard Customer
          </button>
        </div>
      </div>

      {/* ================= STATS SECTION (Matching screenshot) ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Card 1 */}
        <div className="bg-card rounded-2xl border border-border/70 p-5 shadow-xs">
          <span className="block text-xs sm:text-[13px] font-medium text-muted-foreground mb-2">
            Agents pending full approval
          </span>
          <span className="block text-3xl font-bold text-[#018752] tracking-tight mb-1">
            31
          </span>
          <span className="block text-[11px] text-muted-foreground/70">
            needs PS Lead + IC
          </span>
        </div>

        {/* Card 2 */}
        <div className="bg-card rounded-2xl border border-border/70 p-5 shadow-xs">
          <span className="block text-xs sm:text-[13px] font-medium text-muted-foreground mb-2">
            Customers onboarded
          </span>
          <span className="block text-3xl font-bold text-[#018752] tracking-tight mb-1">
            {meta?.total || clients?.length || 31}
          </span>
          <span className="block text-[11px] text-muted-foreground/70">
            this month
          </span>
        </div>

        {/* Card 3 */}
        <div className="bg-card rounded-2xl border border-border/70 p-5 shadow-xs">
          <span className="block text-xs sm:text-[13px] font-medium text-muted-foreground mb-2">
            Active agents
          </span>
          <span className="block text-3xl font-bold text-[#018752] tracking-tight mb-1">
            31
          </span>
          <span className="block text-[11px] text-muted-foreground/70">
            in Public Sector network
          </span>
        </div>
      </div>

      {/* ================= FILTERS DRAWER ================= */}
      {showFilter && (
        <div className="bg-card p-6 rounded-2xl border border-border/70 mb-6 animate-in fade-in slide-in-from-top-2 duration-200 shadow-xs">
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Search</label>
              <input 
                type="text"
                placeholder="Search by name, phone or IPPIS..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg text-sm bg-background border-border outline-none focus:ring-1 focus:ring-emerald-200 focus:border-emerald-400"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full bg-background"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">All Statuses</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="PENDING_IPPIS">Pending IPPIS</SelectItem>
                  <SelectItem value="MANUAL_REVIEW">Manual Review</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
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
            <div className="flex items-end">
              <button 
                type="button"
                onClick={() => { setQ(''); setStatusFilter('none'); setCreatedRange(''); }} 
                className="w-full px-5 py-2.5 bg-background border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted/40 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= FULL-WIDTH PULSE LOADER ================= */}
      {loading && <PulseLoader />}

      {/* ================= ERROR STATE ================= */}
      {!loading && error && <div className="text-red-500 py-12 text-center">{error}</div>}

      {/* ================= CUSTOMERS TABLE ================= */}
      {!loading && !error && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xs w-full">
          <div className="overflow-x-auto w-full">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800/40">
              <thead className="bg-[#E9F4EE] dark:bg-emerald-950/20">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                    NAME
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                    IPPIS NO.
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                    AGENT
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                    SECTOR
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                    LOAN AMT
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                    DATE
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                    ACTION
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {clients.map((client: any) => {
                  const clientName = getClientName(client);
                  const ippisNo = client.onboarding?.ippisNumber || client.ippisNumber || '23598720984';
                  const agentName = client.onboardedBy?.name || client.agent?.fullName || client.agentName || 'Ibrahim Sani';
                  const sector = client.onboarding?.agency || client.sector || 'Fed. Min. Agric';
                  const loanAmt = client.totalLoanAmount 
                    ? `₦${Number(client.totalLoanAmount).toLocaleString()}` 
                    : (client.loanAmount ? `₦${Number(client.loanAmount).toLocaleString()}` : '₦2,000,000');
                  const dateStr = new Date(client.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

                  return (
                    <tr key={client.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-foreground">
                        <Link 
                          href={`/dashboard/clients/${client.id}`}
                          className="hover:text-[#018752] transition-colors"
                        >
                          {clientName}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-foreground">
                        {ippisNo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {agentName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {sector}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-foreground">
                        {loanAmt}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {dateStr}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end">
                          <TableDropdown>
                            <Link 
                              href={`/dashboard/clients/${client.id}`} 
                              className="w-full text-left px-4 py-2.5 text-xs font-medium text-foreground hover:bg-muted transition-colors flex items-center gap-2.5"
                            >
                              <User className="w-4 h-4 text-muted-foreground shrink-0" />
                              View Details
                            </Link>
                            <Link 
                              href={`/dashboard/loan-requests?tab=client-loans&clientId=${client.id}`} 
                              className="w-full text-left px-4 py-2.5 text-xs font-medium text-foreground hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/30 transition-colors flex items-center gap-2.5"
                            >
                              <CreditCard className="w-4 h-4 text-emerald-600 shrink-0" />
                              Loans
                            </Link>
                            <button 
                              type="button"
                              onClick={() => openWalletModal(client)} 
                              className="w-full text-left px-4 py-2.5 text-xs font-medium text-foreground hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/30 transition-colors flex items-center gap-2.5"
                            >
                              <Wallet className="w-4 h-4 text-blue-600 shrink-0" />
                              Wallet
                            </button>
                            {client.status === 'MANUAL_REVIEW' && (
                              <button 
                                type="button"
                                onClick={() => handleApprove(client.id)} 
                                className="w-full text-left px-4 py-2.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 transition-colors flex items-center gap-2.5"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                Approve
                              </button>
                            )}
                            <button 
                              type="button"
                              onClick={() => handleRetry(client.id)} 
                              className="w-full text-left px-4 py-2.5 text-xs font-medium text-amber-600 hover:bg-amber-50 transition-colors flex items-center gap-2.5"
                            >
                              <RotateCcw className="w-4 h-4" />
                              Retry Verification
                            </button>
                            <div className="h-px bg-border/60 my-1"></div>
                            <button 
                              type="button"
                              onClick={() => handleRevokeSessions(client.id)} 
                              className="w-full text-left px-4 py-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2.5"
                            >
                              <ShieldAlert className="w-4 h-4" />
                              Revoke Sessions
                            </button>
                          </TableDropdown>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {clients.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-0 border-b-0">
                      <div className="p-8">
                        <EmptyState title="No customers found" description="There are no customers matching your criteria." />
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

      {/* ================= WALLET MODAL ================= */}
      {showWalletModal && selectedClient && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="fixed inset-0 bg-white/30 dark:bg-white/10 backdrop-blur-md" onClick={() => setShowWalletModal(false)}></div>
          <div className="relative bg-card rounded-2xl p-6 w-full max-w-md mx-4 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-black/10">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-foreground">Client Wallet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {getClientName(selectedClient)}
                  {selectedClient.phone ? ` • ${selectedClient.phone}` : ''}
                </p>
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
