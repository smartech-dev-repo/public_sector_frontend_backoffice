"use client";

import { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import * as xlsx from 'xlsx';
import { useClients } from '@/app/composables/modules/useClients';
import { useSessions } from '@/app/composables/modules/useSessions';
import { useToast } from '@/app/composables/useToast';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import ButtonLoader from '@/app/components/ui/ButtonLoader';
import { useConfirm } from '@/app/composables/useConfirm';
import CustomDateRangePicker from '@/app/components/ui/CustomDateRangePicker';
import Pagination from '@/app/components/ui/Pagination';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/app/components/ui/Select';
import SensitiveValue from '@/app/components/ui/SensitiveValue';
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

  const { 
    loading, 
    error, 
    clients, 
    fetchClients, 
    analytics,
    fetchClientAnalytics,
    retryClient, 
    approveClient, 
    getClientWallet, 
    creditClientWallet, 
    debitClientWallet, 
    meta 
  } = useClients();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showRetryModal, setShowRetryModal] = useState(false);
  const [retryClientId, setRetryClientId] = useState('');
  const [retryNote, setRetryNote] = useState('');
  const [retrySubmitting, setRetrySubmitting] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [amount, setAmount] = useState<number | ''>('');
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletAction, setWalletAction] = useState<'credit' | 'debit' | null>(null);
  const [note, setNote] = useState('');
  const { revokeClientSessions } = useSessions();
  const { addToast } = useToast();

  const [statusFilter, setStatusFilter] = useState('');
  const [q, setQ] = useState('');
  const [createdRange, setCreatedRange] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  useEffect(() => {
    fetchClientAnalytics();
  }, [fetchClientAnalytics]);

  const totalCustomers = useMemo(() => {
    if (analytics?.totalClients) return analytics.totalClients;
    if (meta?.total) return meta.total;
    return clients?.length || 0;
  }, [analytics, meta, clients]);

  const verifiedCustomers = useMemo(() => {
    if (analytics?.byClientStatus?.VERIFIED !== undefined) {
      return analytics.byClientStatus.VERIFIED;
    }
    if (analytics?.byOnboardingStep?.COMPLETED !== undefined) {
      return analytics.byOnboardingStep.COMPLETED;
    }
    return clients.filter(c => c.status === 'VERIFIED').length;
  }, [analytics, clients]);

  const pendingVerification = useMemo(() => {
    if (analytics?.byClientStatus) {
      const pendingIppis = analytics.byClientStatus.PENDING_IPPIS || 0;
      const manualReview = analytics.byClientStatus.MANUAL_REVIEW || 0;
      const phoneVerified = analytics.byClientStatus.PHONE_VERIFIED || 0;
      return pendingIppis + manualReview + phoneVerified;
    }
    return clients.filter(c => c.status === 'PENDING_IPPIS' || c.status === 'MANUAL_REVIEW' || c.status === 'PHONE_VERIFIED').length;
  }, [analytics, clients]);

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
    setWalletAction('credit');
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
      setWalletAction(null);
    }
  };

  const handleDebit = async () => {
    if (!amount || amount <= 0) return addToast('Enter a valid amount', 'error');
    setWalletLoading(true);
    setWalletAction('debit');
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
      setWalletAction(null);
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

  const openRetryModal = (client: any) => {
    setRetryClientId(client.id);
    setSelectedClient(client);
    setRetryNote('Document verification retry requested by administrator');
    setShowRetryModal(true);
  };

  const handleRetrySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!retryNote.trim()) {
      addToast('Please enter a note for retry', 'error');
      return;
    }
    setRetrySubmitting(true);
    try {
      await retryClient(retryClientId, { note: retryNote.trim() });
      addToast('Verification retry requested successfully', 'success');
      setShowRetryModal(false);
      setRetryNote('');
      fetchClients({ page, limit });
    } catch (e: any) {
      addToast(e?.response?.data?.message || 'Failed to retry client verification', 'error');
    } finally {
      setRetrySubmitting(false);
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
    if (client?.onboarding?.ippisRecord?.employeeName) return client.onboarding.ippisRecord.employeeName;
    if (client?.ippisRecord?.employeeName) return client.ippisRecord.employeeName;
    const combined = [client?.firstName, client?.lastName].filter(Boolean).join(' ').trim();
    if (combined) return combined;
    if (client?.name) return client.name;
    return client?.phone || client?.onboarding?.identityPhoneNumber || 'Unnamed Customer';
  };

  const getIppisNumber = (client: any) => {
    return (
      client?.onboarding?.ippisRecord?.staffId ||
      client?.ippisRecord?.staffId ||
      client?.onboarding?.staffId ||
      client?.staffId ||
      client?.onboarding?.ippisNumber ||
      client?.ippisNumber ||
      client?.onboarding?.legacyId ||
      client?.legacyId ||
      '—'
    );
  };

  const getAgentName = (client: any) => {
    if (client?.onboarding?.onboardedByAgent?.fullName) {
      return client.onboarding.onboardedByAgent.fullName;
    }
    if (client?.onboardedByAgent?.fullName) {
      return client.onboardedByAgent.fullName;
    }
    if (client?.agent?.fullName) {
      return client.agent.fullName;
    }
    if (client?.onboardedBy?.name) {
      return client.onboardedBy.name;
    }
    if (client?.agentName) {
      return client.agentName;
    }
    if (client?.onboarding?.onboardedByAdmin?.fullName) {
      return `${client.onboarding.onboardedByAdmin.fullName} (Admin)`;
    }
    if (client?.createdByAdmin?.fullName) {
      return `${client.createdByAdmin.fullName} (Admin)`;
    }
    if (client?.onboardingSource === 'ADMIN') {
      return 'Admin';
    }
    if (client?.onboardingSource === 'SELF') {
      return 'Self';
    }
    return '—';
  };

  const getSector = (client: any) => {
    return (
      client?.onboarding?.agency ||
      client?.onboarding?.ippisRecord?.agency ||
      client?.ippisRecord?.agency ||
      client?.sector ||
      client?.agency ||
      '—'
    );
  };

  const getLoanAmount = (client: any) => {
    const amount = 
      client?.totalLoanAmount ?? 
      client?.loanAmount ?? 
      client?.activeLoan?.disbursedAmount ?? 
      client?.activeLoan?.principalAmount;
    
    if (amount !== undefined && amount !== null && Number(amount) > 0) {
      return `₦${Number(amount).toLocaleString()}`;
    }
    return '—';
  };

  const getDate = (client: any) => {
    if (!client?.createdAt) return '—';
    try {
      return new Date(client.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return '—';
    }
  };

  const renderStatusBadge = (status?: string) => {
    const raw = (status || 'PENDING_IPPIS').toUpperCase();
    if (raw === 'ACTIVE' || raw === 'VERIFIED' || raw === 'APPROVED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          {raw.replace(/_/g, ' ')}
        </span>
      );
    }
    if (raw.includes('PENDING')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          {raw.replace(/_/g, ' ')}
        </span>
      );
    }
    if (raw.includes('MANUAL') || raw.includes('REVIEW')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
          {raw.replace(/_/g, ' ')}
        </span>
      );
    }
    if (raw.includes('FAILED') || raw.includes('REJECT')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          {raw.replace(/_/g, ' ')}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        {raw.replace(/_/g, ' ')}
      </span>
    );
  };

  // Export table data to Excel (.xlsx)
  const handleExportExcel = () => {
    try {
      const dataToExport = clients.map((c: any) => ({
        'NAME': getClientName(c),
        'IPPIS NO.': getIppisNumber(c),
        'AGENT': getAgentName(c),
        'SECTOR': getSector(c),
        'LOAN AMT': getLoanAmount(c),
        'DATE': getDate(c),
        'STATUS': c.status || 'PENDING_IPPIS'
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

      {/* ================= STATS SECTION (Computed client metrics) ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Card 1 */}
        <div className="bg-card rounded-2xl border border-border/70 p-5 shadow-xs">
          <span className="block text-xs sm:text-[13px] font-medium text-muted-foreground mb-2">
            Customers onboarded
          </span>
          <span className="block text-3xl font-bold text-[#018752] tracking-tight mb-1">
            {totalCustomers}
          </span>
          <span className="block text-[11px] text-muted-foreground/70">
            {analytics?.bySource
              ? `${analytics.bySource.SELF || 0} Self · ${analytics.bySource.AGENT || 0} Agent assisted${analytics.bySource.ADMIN ? ` · ${analytics.bySource.ADMIN} Admin` : ''}`
              : `${clients.filter(c => c.onboardingSource === 'SELF').length} Self · ${clients.filter(c => c.onboardingSource === 'AGENT').length} Agent assisted${clients.filter(c => c.onboardingSource === 'ADMIN').length ? ` · ${clients.filter(c => c.onboardingSource === 'ADMIN').length} Admin` : ''}`}
          </span>
        </div>

        {/* Card 2 */}
        <div className="bg-card rounded-2xl border border-border/70 p-5 shadow-xs">
          <span className="block text-xs sm:text-[13px] font-medium text-muted-foreground mb-2">
            Verified customers
          </span>
          <span className="block text-3xl font-bold text-[#018752] tracking-tight mb-1">
            {verifiedCustomers}
          </span>
          <span className="block text-[11px] text-muted-foreground/70">
            ready for loan applications
          </span>
        </div>

        {/* Card 3 */}
        <div className="bg-card rounded-2xl border border-border/70 p-5 shadow-xs">
          <span className="block text-xs sm:text-[13px] font-medium text-muted-foreground mb-2">
            Pending verification
          </span>
          <span className="block text-3xl font-bold text-amber-600 dark:text-amber-500 tracking-tight mb-1">
            {pendingVerification}
          </span>
          <span className="block text-[11px] text-muted-foreground/70">
            needs IPPIS / KYC check
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
                  <SelectItem value="VERIFIED">Verified</SelectItem>
                  <SelectItem value="PENDING_IPPIS">Pending IPPIS</SelectItem>
                  <SelectItem value="MANUAL_REVIEW">Manual Review</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 w-full relative">
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
                  <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                    STATUS
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                    ACTION
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {clients.map((client: any) => {
                  const clientName = getClientName(client);
                  const ippisNo = getIppisNumber(client);
                  const agentName = getAgentName(client);
                  const sector = getSector(client);
                  const loanAmt = getLoanAmount(client);
                  const dateStr = getDate(client);

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
                        <SensitiveValue value={ippisNo} allowCopy />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {agentName === 'Self' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            Self
                          </span>
                        ) : agentName.includes('(Admin)') ? (
                          <span className="inline-flex items-center gap-1.5 text-sm text-foreground">
                            <span>{agentName.replace(' (Admin)', '')}</span>
                            <span className="text-[10px] uppercase font-semibold text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">Admin</span>
                          </span>
                        ) : agentName === '—' ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          agentName
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {sector === '—' ? <span className="text-muted-foreground">—</span> : sector}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-foreground">
                        {loanAmt === '—' ? <span className="text-muted-foreground font-sans font-normal">—</span> : loanAmt}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {dateStr}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {renderStatusBadge(client.status || client.onboarding?.employeeStatus)}
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
                              onClick={() => openRetryModal(client)} 
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
                    <td colSpan={8} className="p-0 border-b-0">
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
                <button 
                  onClick={handleDebit} 
                  disabled={walletLoading || !amount} 
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <ButtonLoader loading={walletLoading && walletAction === 'debit'} loadingText="Debiting...">
                    Debit Wallet
                  </ButtonLoader>
                </button>
                <button 
                  onClick={handleCredit} 
                  disabled={walletLoading || !amount} 
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <ButtonLoader loading={walletLoading && walletAction === 'credit'} loadingText="Crediting...">
                    Credit Wallet
                  </ButtonLoader>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ================= RETRY VERIFICATION MODAL ================= */}
      {showRetryModal && selectedClient && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="fixed inset-0 bg-white/30 dark:bg-white/10 backdrop-blur-md" onClick={() => setShowRetryModal(false)}></div>
          <div className="relative bg-card rounded-2xl p-6 w-full max-w-md mx-4 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-black/10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-foreground">Request Verification Retry</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {getClientName(selectedClient)}
                  {selectedClient.phone ? ` • ${selectedClient.phone}` : ''}
                </p>
              </div>
              <button onClick={() => setShowRetryModal(false)} className="text-muted-foreground/70 hover:text-muted-foreground bg-muted/50 hover:bg-slate-200 rounded-full p-1.5 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <form onSubmit={handleRetrySubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Reason / Note for Customer <span className="text-rose-500">*</span>
                </label>
                <textarea 
                  value={retryNote}
                  onChange={(e) => setRetryNote(e.target.value)}
                  rows={3}
                  required
                  placeholder="e.g. Document was blurry. Please re-upload a clear copy of your passport photo." 
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:ring-1 focus:ring-emerald-200 focus:border-emerald-400 outline-none transition-all resize-none bg-card text-foreground" 
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button 
                  type="button" 
                  onClick={() => setShowRetryModal(false)} 
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={retrySubmitting || !retryNote.trim()} 
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 min-w-[160px]"
                >
                  <ButtonLoader loading={retrySubmitting} loadingText="Sending Request...">
                    Send Retry Request
                  </ButtonLoader>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </main>
  );
}
