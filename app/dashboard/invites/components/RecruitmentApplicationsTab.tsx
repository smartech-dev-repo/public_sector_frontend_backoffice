"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Eye, 
  Trash2, 
  ExternalLink, 
  Filter, 
  X, 
  FileText, 
  ShieldCheck, 
  FileCheck2, 
  ArrowRight,
  TrendingUp,
  RefreshCw,
  UserCheck,
  KeyRound,
  Download
} from 'lucide-react';
import { useAgentRecruitment, AgentRecruitmentApplication } from '@/app/composables/modules/useAgentRecruitment';
import { useAgents } from '@/app/composables/modules/useAgents';
import { useConfirm } from '@/app/composables/useConfirm';
import { useToast } from '@/app/composables/useToast';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import TableDropdown from '@/app/components/ui/TableDropdown';
import Pagination from '@/app/components/ui/Pagination';
import CustomDateRangePicker from '@/app/components/ui/CustomDateRangePicker';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/app/components/ui/Select';
import SensitiveValue from '@/app/components/ui/SensitiveValue';
import { useAdminPermissions } from '@/app/composables/useAdminPermissions';

export default function RecruitmentApplicationsTab() {
  const { confirm } = useConfirm();
  const { addToast } = useToast();
  const { hasPermission, isSuperAdmin } = useAdminPermissions();

  const canReadAnalytics = isSuperAdmin || hasPermission('agents:recruitment:analytics:read');
  const canReadRecruitment = isSuperAdmin || hasPermission('agents:recruitment:read');
  const canReviewAgent = isSuperAdmin || hasPermission('agents:review');
  const canManageRecruitment = isSuperAdmin || hasPermission('agents:recruitment:manage');
  const canReadDocs = isSuperAdmin || hasPermission('documents:read');
  const canSendCreds = canReviewAgent;

  const {
    loading,
    analyticsLoading,
    error,
    applications,
    analytics,
    meta,
    fetchApplications,
    fetchAnalytics,
    getApplicationById,
    deleteApplication
  } = useAgentRecruitment();

  const { approveAgent, resendCredentials, rejectAgent } = useAgents();
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Reject Reason Modal state
  const [rejectModal, setRejectModal] = useState<{
    isOpen: boolean;
    agentId: string;
    applicantName: string;
    reason: string;
    submitting: boolean;
  }>({
    isOpen: false,
    agentId: '',
    applicantName: '',
    reason: '',
    submitting: false
  });

  // Filters state
  const [showFilter, setShowFilter] = useState(false);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('none');
  const [dateRange, setDateRange] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Detail Modal state
  const [selectedApp, setSelectedApp] = useState<AgentRecruitmentApplication | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Lightbox Document Preview Modal state
  const [previewDoc, setPreviewDoc] = useState<{ url: string; title: string; subtitle?: string } | null>(null);

  // Load analytics
  const loadAnalytics = useCallback(() => {
    if (!canReadAnalytics) return;
    let params: any = undefined;
    if (dateRange) {
      const [from, to] = dateRange.split(' to ');
      if (from && to) params = { createdFrom: from, createdTo: to };
    }
    fetchAnalytics(params);
  }, [fetchAnalytics, dateRange, canReadAnalytics]);

  // Load applications list
  const loadApplications = useCallback(() => {
    if (!canReadRecruitment) return;
    const params: any = { page: currentPage, limit: itemsPerPage };
    if (q.trim()) params.q = q.trim();
    if (statusFilter && statusFilter !== 'none') params.status = statusFilter;
    if (dateRange) {
      const [from, to] = dateRange.split(' to ');
      if (from) params.createdFrom = from;
      if (to) params.createdTo = to;
    }
    fetchApplications(params);
  }, [fetchApplications, currentPage, itemsPerPage, q, statusFilter, dateRange, canReadRecruitment]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const clearFilters = () => {
    setQ('');
    setStatusFilter('none');
    setDateRange('');
    setCurrentPage(1);
  };

  const handleOpenDetail = async (appId: string) => {
    setShowDetailModal(true);
    setDetailLoading(true);
    try {
      const full = await getApplicationById(appId);
      setSelectedApp(full);
    } catch (e: any) {
      addToast(e.message || 'Failed to load details', 'error');
      setShowDetailModal(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = async (app: AgentRecruitmentApplication) => {
    const isSubmitted = app.status === 'SUBMITTED';
    const confirmed = await confirm({
      title: 'Delete Recruitment Application',
      message: isSubmitted
        ? `Are you sure you want to delete the recruitment application for "${app.fullName || app.email}"? Note: If this application has already been processed or converted to an active field agent, the system will prevent its removal.`
        : `Are you sure you want to delete the recruitment application for "${app.fullName || app.email}"? This action cannot be undone.`,
      confirmText: 'Delete Application'
    });

    if (!confirmed) return;

    try {
      await deleteApplication(app.id);
      addToast('Recruitment application deleted successfully', 'success');
      if (selectedApp?.id === app.id) {
        setShowDetailModal(false);
      }
      loadApplications();
      loadAnalytics();
    } catch (err: any) {
      addToast(err?.message || 'Failed to delete application', 'error');
    }
  };

  const handleApproveAgent = async (agentId: string, applicantName?: string) => {
    const confirmed = await confirm({
      title: 'Approve Field Agent',
      message: `Are you sure you want to approve ${applicantName || 'this agent'}? They will be granted full access to the agent network.`,
      confirmText: 'Approve Agent'
    });
    if (!confirmed) return;

    setActionLoadingId(agentId);
    try {
      await approveAgent(agentId);
      addToast('Agent approved successfully', 'success');
      loadApplications();
      loadAnalytics();
      if (selectedApp && selectedApp.submittedAgent && selectedApp.submittedAgent.id === agentId) {
        setSelectedApp({
          ...selectedApp,
          submittedAgent: {
            ...selectedApp.submittedAgent,
            status: 'APPROVED'
          }
        });
      }
    } catch (err: any) {
      addToast(err?.response?.data?.message || err?.message || 'Failed to approve agent', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleResendCredentials = async (agentId: string, applicantName?: string) => {
    const confirmed = await confirm({
      title: 'Send Login Credentials',
      message: `Send temporary login credentials to ${applicantName || 'this agent'}? An email containing login credentials will be dispatched.`,
      confirmText: 'Send Credentials'
    });
    if (!confirmed) return;

    setActionLoadingId(agentId);
    try {
      await resendCredentials(agentId);
      addToast('Login credentials sent successfully to agent email', 'success');
    } catch (err: any) {
      addToast(err?.response?.data?.message || err?.message || 'Failed to send credentials', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const openRejectModal = (agentId: string, applicantName?: string) => {
    setRejectModal({
      isOpen: true,
      agentId,
      applicantName: applicantName || 'this agent',
      reason: '',
      submitting: false
    });
  };

  const submitReject = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!rejectModal.reason.trim()) {
      addToast('Please provide a reason for rejection', 'error');
      return;
    }

    setRejectModal(prev => ({ ...prev, submitting: true }));
    try {
      await rejectAgent(rejectModal.agentId, { reason: rejectModal.reason.trim() });
      addToast('Agent application rejected', 'success');
      setRejectModal({ isOpen: false, agentId: '', applicantName: '', reason: '', submitting: false });
      loadApplications();
      loadAnalytics();
      if (selectedApp && selectedApp.submittedAgent && selectedApp.submittedAgent.id === rejectModal.agentId) {
        setSelectedApp({
          ...selectedApp,
          submittedAgent: {
            ...selectedApp.submittedAgent,
            status: 'REJECTED'
          }
        });
      }
    } catch (err: any) {
      addToast(err?.response?.data?.message || err?.message || 'Failed to reject agent', 'error');
      setRejectModal(prev => ({ ...prev, submitting: false }));
    }
  };

  const totalApps = analytics?.totalApplications ?? (meta?.total || applications.length);
  const pendingCount = analytics?.byStatus?.EMAIL_PENDING ?? applications.filter(a => a.status === 'EMAIL_PENDING').length;
  const verifiedCount = analytics?.byStatus?.EMAIL_VERIFIED ?? applications.filter(a => a.status === 'EMAIL_VERIFIED').length;
  const submittedCount = analytics?.byStatus?.SUBMITTED ?? applications.filter(a => a.status === 'SUBMITTED').length;
  const convRate = analytics?.conversionRate !== null && analytics?.conversionRate !== undefined
    ? (analytics.conversionRate * 100).toFixed(1)
    : totalApps > 0 ? ((submittedCount / totalApps) * 100).toFixed(1) : '0';
  const avgTimeHours = analytics?.averageTimeToSubmitHours !== null && analytics?.averageTimeToSubmitHours !== undefined
    ? Number(analytics.averageTimeToSubmitHours).toFixed(1)
    : null;

  return (
    <div className="space-y-6">
      {/* ================= RECRUITMENT FUNNEL ANALYTICS ================= */}
      {canReadAnalytics && (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Applications */}
        <div className="bg-card rounded-2xl border border-border/70 p-5 shadow-xs transition-all hover:border-[#018752]/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-[13px] font-medium text-muted-foreground">
              Total Applications
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#E8F5EE] text-[#018752] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <span className="block text-3xl font-bold text-foreground tracking-tight mb-1">
            {totalApps}
          </span>
          <span className="block text-[11px] text-muted-foreground/70">
            {submittedCount} completed submissions
          </span>
        </div>

        {/* Email Pending */}
        <div className="bg-card rounded-2xl border border-border/70 p-5 shadow-xs transition-all hover:border-amber-500/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-[13px] font-medium text-muted-foreground">
              Email Pending
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <span className="block text-3xl font-bold text-amber-600 dark:text-amber-500 tracking-tight mb-1">
            {pendingCount}
          </span>
          <span className="block text-[11px] text-muted-foreground/70">
            awaiting email confirmation
          </span>
        </div>

        {/* Email Verified */}
        <div className="bg-card rounded-2xl border border-border/70 p-5 shadow-xs transition-all hover:border-blue-500/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-[13px] font-medium text-muted-foreground">
              Email Verified
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <span className="block text-3xl font-bold text-blue-600 dark:text-blue-400 tracking-tight mb-1">
            {verifiedCount}
          </span>
          <span className="block text-[11px] text-muted-foreground/70">
            draft in profile completion
          </span>
        </div>

        {/* Submitted & Enrolled */}
        <div className="bg-card rounded-2xl border border-border/70 p-5 shadow-xs transition-all hover:border-[#018752]/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-[13px] font-medium text-muted-foreground">
              Submitted
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#E8F5EE] text-[#018752] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <span className="block text-3xl font-bold text-[#018752] tracking-tight mb-1">
            {submittedCount}
          </span>
          <span className="block text-[11px] text-muted-foreground/70">
            transferred to review pipeline
          </span>
        </div>

        {/* Conversion Rate & Turnaround */}
        <div className="bg-card rounded-2xl border border-border/70 p-5 shadow-xs transition-all hover:border-purple-500/40 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-[13px] font-medium text-muted-foreground">
              Conversion Rate
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <span className="block text-3xl font-bold text-purple-600 dark:text-purple-400 tracking-tight mb-1">
            {convRate}%
          </span>
          <span className="block text-[11px] text-muted-foreground/70 truncate">
            {avgTimeHours ? `Avg submit time: ${avgTimeHours}h` : 'Funnel throughput'}
          </span>
        </div>
      </div>
      )}

      {/* ================= CONTROLS & FILTER ROW ================= */}
      {canReadRecruitment && (
        <>
          <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs sm:text-sm text-muted-foreground font-medium">
            Showing {applications.length} of {meta?.total || applications.length} Recruitment Applications
          </span>

          <div className="flex items-center gap-3 justify-end">
            <button 
              type="button"
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full text-xs sm:text-sm font-medium text-foreground hover:bg-muted/30 transition-colors shadow-xs"
            >
              <Filter className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Filters</span>
              <svg className={`w-3.5 h-3.5 transition-transform ${showFilter ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>

            <button
              type="button"
              onClick={() => {
                loadApplications();
                loadAnalytics();
                addToast('Applications refreshed', 'info');
              }}
              className="p-2 bg-card border border-border hover:bg-muted/30 text-foreground rounded-full transition-colors shadow-xs"
              title="Refresh applications"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#018752]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filter Drawer */}
        {showFilter && (
          <div className="bg-card p-6 rounded-2xl border border-border/70 animate-in fade-in slide-in-from-top-2 duration-200 shadow-xs">
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Search Applicant</label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={q}
                    onChange={(e) => {
                      setQ(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm bg-background border-border outline-none focus:ring-1 focus:ring-emerald-200 focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Application Status</label>
                <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}>
                  <SelectTrigger className="w-full bg-background"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">All Statuses</SelectItem>
                    <SelectItem value="EMAIL_PENDING">EMAIL PENDING</SelectItem>
                    <SelectItem value="EMAIL_VERIFIED">EMAIL VERIFIED</SelectItem>
                    <SelectItem value="SUBMITTED">SUBMITTED</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 w-full relative sm:col-span-2">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Applied Date Range</label>
                <CustomDateRangePicker 
                  value={dateRange}
                  onChange={(val: any) => { setDateRange(val); setCurrentPage(1); }}
                  placeholder="Filter by application date range"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button 
                type="button"
                onClick={clearFilters}
                className="px-5 py-2 bg-background border border-border rounded-full text-xs sm:text-sm font-medium text-foreground hover:bg-muted/40 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================= DATA TABLE ================= */}
      {loading && <PulseLoader />}
      {!loading && error && <div className="text-red-500 py-12 text-center">{error}</div>}

      {!loading && !error && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xs w-full">
          <div className="overflow-x-auto w-full">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800/40">
              <thead className="bg-[#E9F4EE] dark:bg-emerald-950/20">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                    APPLICANT
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                    NIN VERIFICATION
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                    LOCATION
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                    STATUS
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                    ENROLLMENT LINK
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                    DATE APPLIED
                  </th>
                  <th className="px-5 py-4 text-right text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-sm">
                {applications.map((app) => {
                  const locationStr = [app.localGovernment, app.city, app.state].filter(Boolean).join(', ') || '—';
                  const dateStr = app.createdAt 
                    ? new Date(app.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) 
                    : '—';

                  return (
                    <tr key={app.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-foreground">
                          {app.fullName || 'Draft Applicant'}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <span>{app.email}</span>
                          {app.phone && (
                            <>
                              <span>•</span>
                              <span>{app.phone}</span>
                            </>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        {app.nin ? (
                          <div className="flex items-center gap-1.5">
                            <SensitiveValue value={app.nin} allowCopy />
                            {app.ninVerified ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/50" title={`Verified as: ${app.ninVerifiedName || 'Verified'}`}>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Verified
                              </span>
                            ) : (
                              <span className="text-[10px] text-muted-foreground">Unverified</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">Not provided</span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-xs text-foreground max-w-[180px] truncate" title={locationStr}>
                        {locationStr}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        {app.status === 'SUBMITTED' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Submitted
                          </span>
                        ) : app.status === 'EMAIL_VERIFIED' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            Email Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Email Pending
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        {app.submittedAgent ? (
                          <Link
                            href={`/dashboard/agent/${app.submittedAgent.id}`}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Agent Profile ({app.submittedAgent.status})</span>
                          </Link>
                        ) : (
                          <span className="text-xs text-muted-foreground">Draft Application</span>
                        )}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-xs text-foreground font-mono">
                        {dateStr}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end">
                          <TableDropdown>
                            <button
                              type="button"
                              onClick={() => handleOpenDetail(app.id)}
                              className="w-full text-left px-4 py-2.5 text-xs font-medium text-foreground hover:bg-muted transition-colors flex items-center gap-2.5"
                            >
                              <Eye className="w-4 h-4 text-emerald-600 shrink-0" />
                              View Application
                            </button>

                            {app.submittedAgent && (
                              <>
                                {app.submittedAgent.status === 'PENDING_REVIEW' && canReviewAgent && (
                                  <>
                                    <button
                                      type="button"
                                      disabled={actionLoadingId === app.submittedAgent.id}
                                      onClick={() => handleApproveAgent(app.submittedAgent!.id, app.fullName || app.email)}
                                      className="w-full text-left px-4 py-2.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors flex items-center gap-2.5 disabled:opacity-50"
                                    >
                                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                      {actionLoadingId === app.submittedAgent.id ? 'Approving...' : 'Approve Agent'}
                                    </button>
                                    <button
                                      type="button"
                                      disabled={actionLoadingId === app.submittedAgent.id}
                                      onClick={() => openRejectModal(app.submittedAgent!.id, app.fullName || app.email)}
                                      className="w-full text-left px-4 py-2.5 text-xs font-medium text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors flex items-center gap-2.5 disabled:opacity-50"
                                    >
                                      <X className="w-4 h-4 text-amber-600 shrink-0" />
                                      Reject Agent
                                    </button>
                                  </>
                                )}

                                {app.submittedAgent.status === 'APPROVED' && canSendCreds && (
                                  <button
                                    type="button"
                                    disabled={actionLoadingId === app.submittedAgent.id}
                                    onClick={() => handleResendCredentials(app.submittedAgent!.id, app.fullName || app.email)}
                                    className="w-full text-left px-4 py-2.5 text-xs font-medium text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors flex items-center gap-2.5 disabled:opacity-50"
                                  >
                                    <KeyRound className="w-4 h-4 text-blue-600 shrink-0" />
                                    {actionLoadingId === app.submittedAgent.id ? 'Sending...' : 'Send Login Details'}
                                  </button>
                                )}

                                <Link
                                  href={`/dashboard/agent/${app.submittedAgent.id}`}
                                  className="w-full text-left px-4 py-2.5 text-xs font-medium text-foreground hover:bg-muted transition-colors flex items-center gap-2.5"
                                >
                                  <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
                                  View Field Agent Profile
                                </Link>
                              </>
                            )}

                            {canManageRecruitment && (
                              <button
                                type="button"
                                onClick={() => handleDelete(app)}
                                className="w-full text-left px-4 py-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex items-center gap-2.5"
                              >
                                <Trash2 className="w-4 h-4 text-rose-600 shrink-0" />
                                Delete Application
                              </button>
                            )}
                          </TableDropdown>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {applications.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-0 border-b-0">
                      <div className="p-8">
                        <EmptyState 
                          title="No recruitment applications found" 
                          description="There are no candidate recruitment drafts matching your selected criteria." 
                        />
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
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          )}
        </div>
      )}
        </>
      )}

      {!canReadRecruitment && !canReadAnalytics && (
        <div className="bg-card border border-border/60 rounded-2xl p-12 text-center shadow-xs">
          <ShieldCheck className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-foreground">Access Restricted</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            You do not have permission to view agent recruitment applications or funnel analytics.
          </p>
        </div>
      )}

      {/* ================= APPLICATION DETAIL MODAL ================= */}
      {showDetailModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setShowDetailModal(false)} 
          />
          <div className="relative bg-card rounded-2xl max-w-2xl w-full my-8 border border-border shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-border bg-muted/40 shrink-0">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-foreground">
                  Recruitment Application Details
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  ID: <span className="font-mono">{selectedApp?.id}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {detailLoading || !selectedApp ? (
                <div className="py-12">
                  <PulseLoader />
                </div>
              ) : (
                <>
                  {/* Status Banner */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-muted/20 border border-border/60">
                    <div>
                      <span className="text-xs text-muted-foreground block mb-1">Application Stage</span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        selectedApp.status === 'SUBMITTED' 
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200' 
                          : selectedApp.status === 'EMAIL_VERIFIED'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200'
                      }`}>
                        {selectedApp.status}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-muted-foreground block mb-1">Email Verification</span>
                      <span className="text-xs font-medium text-foreground">
                        {selectedApp.emailVerifiedAt 
                          ? new Date(selectedApp.emailVerifiedAt).toLocaleString() 
                          : 'Pending confirmation'}
                      </span>
                    </div>
                  </div>

                  {/* Personal & Contact Information */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                      Personal & Contact Information
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-border/60 bg-card">
                      <div>
                        <span className="text-[11px] text-muted-foreground block">Full Name</span>
                        <span className="text-sm font-semibold text-foreground">{selectedApp.fullName || '—'}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-muted-foreground block">Email Address</span>
                        <span className="text-sm font-medium text-foreground">{selectedApp.email}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-muted-foreground block">Phone Number</span>
                        <span className="text-sm font-medium text-foreground">{selectedApp.phone || '—'}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-muted-foreground block">Gender</span>
                        <span className="text-sm font-medium text-foreground">{selectedApp.gender || '—'}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-[11px] text-muted-foreground block">Residential Address</span>
                        <span className="text-sm text-foreground">
                          {[selectedApp.address, selectedApp.city, selectedApp.localGovernment, selectedApp.state].filter(Boolean).join(', ') || '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* NIN & Identity Verification */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                      National Identification & KYC
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-border/60 bg-card">
                      <div>
                        <span className="text-[11px] text-muted-foreground block">National Identity Number (NIN)</span>
                        <div className="text-sm font-mono font-semibold text-foreground mt-0.5">
                          {selectedApp.nin ? <SensitiveValue value={selectedApp.nin} allowCopy /> : 'Not provided'}
                        </div>
                      </div>
                      <div>
                        <span className="text-[11px] text-muted-foreground block">Verification Status</span>
                        <div className="mt-1">
                          {selectedApp.ninVerified ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              NIN Verified
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">Verification pending / unverified</span>
                          )}
                        </div>
                      </div>
                      {selectedApp.ninVerifiedName && (
                        <div className="sm:col-span-2">
                          <span className="text-[11px] text-muted-foreground block">NIN Database Registered Name</span>
                          <span className="text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                            {selectedApp.ninVerifiedName}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cover Letter */}
                  {selectedApp.coverLetter && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        Applicant Statement / Cover Letter
                      </h4>
                      <div className="p-4 rounded-xl bg-muted/20 border border-border/60 text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                        {selectedApp.coverLetter}
                      </div>
                    </div>
                  )}

                  {/* Uploaded Documents */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                      Uploaded Supporting Documents
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* CV */}
                      <div className="p-3.5 rounded-xl border border-border/60 bg-card space-y-2">
                        <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-emerald-600" />
                          Curriculum Vitae
                        </span>
                        {(selectedApp.cvUrl || selectedApp.cvKey) && canReadDocs ? (
                          <button
                            type="button"
                            onClick={() => {
                              const rawUrl = selectedApp.cvUrl || selectedApp.cvKey || '';
                              const url = rawUrl.startsWith('http') ? rawUrl : `/${rawUrl}`;
                              setPreviewDoc({
                                url,
                                title: `${selectedApp.fullName || 'Candidate'} - Curriculum Vitae`,
                                subtitle: url.toLowerCase().includes('.doc') ? 'Word Document (.doc / .docx)' : 'PDF Document'
                              });
                            }}
                            className="w-full py-1.5 px-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View CV</span>
                          </button>
                        ) : !(selectedApp.cvUrl || selectedApp.cvKey) ? (
                          <span className="text-xs text-muted-foreground block py-1">Not uploaded</span>
                        ) : null}
                      </div>

                      {/* Passport Photo */}
                      <div className="p-3.5 rounded-xl border border-border/60 bg-card space-y-2">
                        <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                          <Eye className="w-4 h-4 text-blue-600" />
                          Passport Photo
                        </span>
                        {(selectedApp.passportPhotoUrl || selectedApp.passportPhotoKey) && canReadDocs ? (
                          <button
                            type="button"
                            onClick={() => {
                              const rawUrl = selectedApp.passportPhotoUrl || selectedApp.passportPhotoKey || '';
                              const url = rawUrl.startsWith('http') ? rawUrl : `/${rawUrl}`;
                              setPreviewDoc({
                                url,
                                title: `${selectedApp.fullName || 'Candidate'} - Passport Photograph`,
                                subtitle: 'Image'
                              });
                            }}
                            className="w-full py-1.5 px-2 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Photo</span>
                          </button>
                        ) : !(selectedApp.passportPhotoUrl || selectedApp.passportPhotoKey) ? (
                          <span className="text-xs text-muted-foreground block py-1">Not uploaded</span>
                        ) : null}
                      </div>

                      {/* Identity Document */}
                      <div className="p-3.5 rounded-xl border border-border/60 bg-card space-y-2">
                        <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-purple-600" />
                          ID Document
                        </span>
                        {(selectedApp.identityDocumentUrl || selectedApp.identityDocumentKey || selectedApp.ninSlipUrl || selectedApp.ninSlipKey) && canReadDocs ? (
                          <button
                            type="button"
                            onClick={() => {
                              const rawUrl = selectedApp.identityDocumentUrl || selectedApp.identityDocumentKey || selectedApp.ninSlipUrl || selectedApp.ninSlipKey || '';
                              const url = rawUrl.startsWith('http') ? rawUrl : `/${rawUrl}`;
                              setPreviewDoc({
                                url,
                                title: `${selectedApp.fullName || 'Candidate'} - Identity Document`,
                                subtitle: url.toLowerCase().includes('.pdf') ? 'PDF Document' : 'Identity Document'
                              });
                            }}
                            className="w-full py-1.5 px-2 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-lg text-xs font-semibold hover:bg-purple-100 transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View ID</span>
                          </button>
                        ) : !(selectedApp.identityDocumentUrl || selectedApp.identityDocumentKey || selectedApp.ninSlipUrl || selectedApp.ninSlipKey) ? (
                          <span className="text-xs text-muted-foreground block py-1">Not uploaded</span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* Submitted Agent Review & Actions Panel */}
                  {selectedApp.submittedAgent && (
                    <div className="p-4 rounded-xl bg-card border border-border shadow-sm space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/50">
                        <div>
                          <span className="text-xs font-bold text-foreground block">
                            Field Agent Record Created
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                            <span>Agent Status:</span>
                            <span className={`font-semibold inline-flex items-center px-2 py-0.5 rounded text-[11px] ${
                              selectedApp.submittedAgent.status === 'APPROVED'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                                : selectedApp.submittedAgent.status === 'REJECTED'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                            }`}>
                              {selectedApp.submittedAgent.status}
                            </span>
                          </span>
                        </div>
                        <Link
                          href={`/dashboard/agent/${selectedApp.submittedAgent.id}`}
                          className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground rounded-lg text-xs font-medium transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto"
                        >
                          <span>Full Profile</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>

                      {/* Action buttons inside detail modal */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {selectedApp.submittedAgent.status === 'PENDING_REVIEW' && canReviewAgent && (
                          <>
                            <button
                              type="button"
                              disabled={actionLoadingId === selectedApp.submittedAgent.id}
                              onClick={() => handleApproveAgent(selectedApp.submittedAgent!.id, selectedApp.fullName || selectedApp.email)}
                              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-sm"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{actionLoadingId === selectedApp.submittedAgent.id ? 'Approving...' : 'Approve Agent'}</span>
                            </button>
                            <button
                              type="button"
                              disabled={actionLoadingId === selectedApp.submittedAgent.id}
                              onClick={() => openRejectModal(selectedApp.submittedAgent!.id, selectedApp.fullName || selectedApp.email)}
                              className="px-3.5 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 dark:border-rose-800 dark:bg-rose-950/30 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Reject Application</span>
                            </button>
                          </>
                        )}

                        {selectedApp.submittedAgent.status === 'APPROVED' && canSendCreds && selectedApp.submittedAgent.mustChangePassword !== false && (
                          <button
                            type="button"
                            disabled={actionLoadingId === selectedApp.submittedAgent.id}
                            onClick={() => handleResendCredentials(selectedApp.submittedAgent!.id, selectedApp.fullName || selectedApp.email)}
                            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-sm"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>{actionLoadingId === selectedApp.submittedAgent.id ? 'Sending...' : 'Send Login Details'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border bg-muted/30 flex items-center justify-between shrink-0">
              {selectedApp && canManageRecruitment ? (
                <button
                  type="button"
                  onClick={() => handleDelete(selectedApp)}
                  className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Application
                </button>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="px-5 py-2 bg-background border border-border hover:bg-muted text-foreground rounded-lg text-xs font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ================= REJECT REASON MODAL ================= */}
      {rejectModal.isOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => !rejectModal.submitting && setRejectModal(prev => ({ ...prev, isOpen: false }))}
          />
          <div className="relative bg-card rounded-2xl max-w-md w-full border border-border shadow-2xl z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/40">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center text-rose-600">
                  <X className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Reject Agent Application</h4>
                  <p className="text-xs text-muted-foreground">{rejectModal.applicantName}</p>
                </div>
              </div>
              <button
                type="button"
                disabled={rejectModal.submitting}
                onClick={() => setRejectModal(prev => ({ ...prev, isOpen: false }))}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={submitReject} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Rejection Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={rejectModal.reason}
                  onChange={(e) => setRejectModal(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="e.g. CV does not meet required criteria, or NIN verification mismatch..."
                  rows={4}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 placeholder:text-muted-foreground/60 resize-none transition-all"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  This note is submitted to the backend as the rejection justification.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={rejectModal.submitting}
                  onClick={() => setRejectModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-foreground bg-muted/60 hover:bg-muted transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rejectModal.submitting || !rejectModal.reason.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-sm"
                >
                  {rejectModal.submitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Rejecting...</span>
                    </>
                  ) : (
                    <span>Confirm Rejection</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ================= IN-APP DOCUMENT VIEWER LIGHTBOX ================= */}
      {previewDoc && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 sm:p-6">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" 
            onClick={() => setPreviewDoc(null)} 
          />
          <div className="relative bg-card rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-border shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/40 shrink-0">
              <div className="min-w-0 pr-4">
                <h4 className="text-sm sm:text-base font-bold text-foreground truncate">{previewDoc.title}</h4>
                {previewDoc.subtitle && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{previewDoc.subtitle}</p>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <a
                  href={previewDoc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title="Close viewer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 bg-muted/20 flex-1 overflow-auto flex items-center justify-center min-h-[320px] max-h-[72vh]">
              {previewDoc.url.toLowerCase().includes('.pdf') ? (
                <iframe
                  src={previewDoc.url}
                  title={previewDoc.title}
                  className="w-full h-[68vh] rounded-xl border border-border bg-white"
                />
              ) : previewDoc.url.toLowerCase().includes('.doc') ? (
                <div className="w-full h-[68vh] flex flex-col items-center justify-center bg-card rounded-xl border border-border p-6 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div className="max-w-md">
                    <h4 className="text-base font-bold text-foreground">{previewDoc.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Word Document format (.doc / .docx). You can download or preview it via Google Docs.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-2 flex-wrap justify-center">
                    <a
                      href={previewDoc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#018752] hover:bg-[#017044] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Document</span>
                    </a>
                    <a
                      href={`https://docs.google.com/gview?url=${encodeURIComponent(previewDoc.url)}&embedded=true`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-xl text-xs font-semibold transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>View in Google Docs</span>
                    </a>
                  </div>
                </div>
              ) : (
                <img
                  src={previewDoc.url}
                  alt={previewDoc.title}
                  className="max-h-[68vh] max-w-full w-auto object-contain rounded-xl shadow-md border border-border bg-slate-950/20"
                />
              )}
            </div>

            <div className="p-3.5 bg-muted/30 border-t border-border flex items-center justify-between text-xs text-muted-foreground shrink-0">
              <span className="flex items-center gap-1.5 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-[#018752] inline-block"></span>
                <span>Secure In-App Document Viewer</span>
              </span>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-1.5 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
