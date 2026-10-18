"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import { useClientAnalytics } from '@/app/composables/modules/useClientAnalytics';
import { useAgents } from '@/app/composables/modules/useAgents';
import { useAgentRecruitment } from '@/app/composables/modules/useAgentRecruitment';
import { useToast } from '@/app/composables/useToast';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/app/components/ui/Select';
import { 
  Users, 
  Banknote, 
  ShieldCheck, 
  Activity, 
  ArrowUpRight, 
  RefreshCw, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Award,
  FileCheck2,
  UserCheck,
  TrendingUp,
  XCircle,
  Briefcase
} from 'lucide-react';

export default function AnalyticsTab() {
  const { loading: clientLoading, error: clientError, analytics, fetchAnalytics: fetchClientAnalytics } = useClientAnalytics();
  const { agentAnalytics, analyticsLoading: agentLoading, fetchAgentAnalytics } = useAgents();
  const { analytics: recruitmentAnalytics, analyticsLoading: recruitmentLoading, fetchAnalytics: fetchRecruitmentAnalytics } = useAgentRecruitment();
  
  const { addToast } = useToast();
  const [period, setPeriod] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);

  const calculateDateRange = useCallback((selectedPeriod: string) => {
    const now = new Date();
    if (selectedPeriod === '30d') {
      const from = new Date();
      from.setDate(now.getDate() - 30);
      return { createdFrom: from.toISOString().split('T')[0], createdTo: now.toISOString().split('T')[0] };
    }
    if (selectedPeriod === '90d') {
      const from = new Date();
      from.setDate(now.getDate() - 90);
      return { createdFrom: from.toISOString().split('T')[0], createdTo: now.toISOString().split('T')[0] };
    }
    if (selectedPeriod === 'ytd') {
      const from = new Date(now.getFullYear(), 0, 1);
      return { createdFrom: from.toISOString().split('T')[0], createdTo: now.toISOString().split('T')[0] };
    }
    return undefined; // All time
  }, []);

  const loadData = useCallback(() => {
    const range = calculateDateRange(period);
    fetchClientAnalytics(range);
    fetchAgentAnalytics(range);
    fetchRecruitmentAnalytics(range);
  }, [period, calculateDateRange, fetchClientAnalytics, fetchAgentAnalytics, fetchRecruitmentAnalytics]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loading = clientLoading || agentLoading || recruitmentLoading;
  const error = clientError;

  const totalClients = analytics?.totalClients || 0;

  // Status breakdown calculations
  const statusCounts = useMemo(() => {
    const raw = analytics?.byClientStatus || {};
    return {
      VERIFIED: raw.VERIFIED || 0,
      PENDING_IPPIS: raw.PENDING_IPPIS || 0,
      MANUAL_REVIEW: raw.MANUAL_REVIEW || 0,
      PHONE_VERIFIED: raw.PHONE_VERIFIED || 0
    };
  }, [analytics]);

  // Source breakdown calculations
  const sourceCounts = useMemo(() => {
    const raw = analytics?.bySource || {};
    return {
      SELF: raw.SELF || 0,
      AGENT: raw.AGENT || 0,
      ADMIN: raw.ADMIN || 0,
      NONE: raw.NONE || 0
    };
  }, [analytics]);

  // Pipeline step calculations
  const stepCounts = useMemo(() => {
    const raw = analytics?.byOnboardingStep || {};
    return [
      { key: 'PHONE_VERIFIED', label: 'Phone Verified', count: raw.PHONE_VERIFIED || 0 },
      { key: 'IPPIS_LINKED', label: 'IPPIS Linked', count: raw.IPPIS_LINKED || 0 },
      { key: 'IDENTITY_SUBMITTED', label: 'Identity Submitted', count: raw.IDENTITY_SUBMITTED || 0 },
      { key: 'DOCUMENTS_SUBMITTED', label: 'Documents Submitted', count: raw.DOCUMENTS_SUBMITTED || 0 },
      { key: 'FACE_MATCH_PENDING', label: 'Face Match Pending', count: raw.FACE_MATCH_PENDING || 0 },
      { key: 'COMPLETED', label: 'Completed', count: raw.COMPLETED || 0 }
    ];
  }, [analytics]);

  // Recruitment metrics
  const totalRecruitmentApps = recruitmentAnalytics?.totalApplications ?? 0;
  const recruitmentPending = recruitmentAnalytics?.byStatus?.EMAIL_PENDING ?? 0;
  const recruitmentVerified = recruitmentAnalytics?.byStatus?.EMAIL_VERIFIED ?? 0;
  const recruitmentSubmitted = recruitmentAnalytics?.byStatus?.SUBMITTED ?? 0;
  const recruitmentConvRate = recruitmentAnalytics?.conversionRate !== null && recruitmentAnalytics?.conversionRate !== undefined
    ? (recruitmentAnalytics.conversionRate * 100).toFixed(1)
    : totalRecruitmentApps > 0 ? ((recruitmentSubmitted / totalRecruitmentApps) * 100).toFixed(1) : '0';
  const recruitmentAvgHours = recruitmentAnalytics?.averageTimeToSubmitHours !== null && recruitmentAnalytics?.averageTimeToSubmitHours !== undefined
    ? Number(recruitmentAnalytics.averageTimeToSubmitHours).toFixed(1)
    : null;

  // Agent Review metrics
  const totalAgentApps = agentAnalytics?.totalApplications ?? 0;
  const agentApproved = agentAnalytics?.byStatus?.APPROVED ?? 0;
  const agentPending = agentAnalytics?.byStatus?.PENDING ?? 0;
  const agentRejected = agentAnalytics?.byStatus?.REJECTED ?? 0;
  const agentSuspended = agentAnalytics?.byStatus?.SUSPENDED ?? 0;
  const agentAvgTurnaround = agentAnalytics?.activity?.averageReviewTimeHours !== null && agentAnalytics?.activity?.averageReviewTimeHours !== undefined
    ? Number(agentAnalytics.activity.averageReviewTimeHours).toFixed(1)
    : null;

  const downloadReport = () => {
    setIsExporting(true);
    addToast('Generating comprehensive analytics CSV...', 'info');

    try {
      const rows: string[][] = [
        ['PUBLIC SECTOR - COMPREHENSIVE PLATFORM ANALYTICS REPORT'],
        ['Generated At', new Date().toISOString()],
        ['Period Filter', period.toUpperCase()],
        [],
        ['=== 1. CLIENT ONBOARDING & ACTIVITY METRICS ==='],
        ['Total Registered Clients', String(analytics?.totalClients || 0)],
        ['Clients with Disbursed Loans', String(analytics?.activity?.clientsWithAtLeastOneDisbursedLoan || 0)],
        ['Clients with Loan Requests', String(analytics?.activity?.clientsWithAtLeastOneLoanRequest || 0)],
        ['Total Loan Requests', String(analytics?.activity?.totalLoanRequests || 0)],
        ['Total Wallet Operations', String(analytics?.activity?.totalWalletEntries || 0)],
        ['Clients with Active Sessions', String(analytics?.activity?.clientsWithAtLeastOneSession || 0)],
        [],
        ['CLIENT STATUS DISTRIBUTION', 'COUNT', 'SHARE (%)'],
        ['VERIFIED', String(statusCounts.VERIFIED), totalClients > 0 ? `${((statusCounts.VERIFIED / totalClients) * 100).toFixed(1)}%` : '0%'],
        ['PENDING_IPPIS', String(statusCounts.PENDING_IPPIS), totalClients > 0 ? `${((statusCounts.PENDING_IPPIS / totalClients) * 100).toFixed(1)}%` : '0%'],
        ['MANUAL_REVIEW', String(statusCounts.MANUAL_REVIEW), totalClients > 0 ? `${((statusCounts.MANUAL_REVIEW / totalClients) * 100).toFixed(1)}%` : '0%'],
        ['PHONE_VERIFIED', String(statusCounts.PHONE_VERIFIED), totalClients > 0 ? `${((statusCounts.PHONE_VERIFIED / totalClients) * 100).toFixed(1)}%` : '0%'],
        [],
        ['ONBOARDING CHANNEL BREAKDOWN', 'COUNT', 'SHARE (%)'],
        ['Self Service (SELF)', String(sourceCounts.SELF), totalClients > 0 ? `${((sourceCounts.SELF / totalClients) * 100).toFixed(1)}%` : '0%'],
        ['Agent Assisted (AGENT)', String(sourceCounts.AGENT), totalClients > 0 ? `${((sourceCounts.AGENT / totalClients) * 100).toFixed(1)}%` : '0%'],
        ['Admin Backoffice (ADMIN)', String(sourceCounts.ADMIN), totalClients > 0 ? `${((sourceCounts.ADMIN / totalClients) * 100).toFixed(1)}%` : '0%'],
        ['Direct / None (NONE)', String(sourceCounts.NONE), totalClients > 0 ? `${((sourceCounts.NONE / totalClients) * 100).toFixed(1)}%` : '0%'],
        [],
        ['AGENT CLIENT ONBOARDING LEADERBOARD', 'TOTAL ONBOARDED', 'COMPLETED', 'STALLED', 'COMPLETION RATE (%)'],
        ...(analytics?.agentLeaderboard || []).map((agt) => [
          agt.agentName || agt.agentId,
          String(agt.totalOnboarded),
          String(agt.completedCount),
          String(agt.stalledCount),
          agt.totalOnboarded > 0 ? `${((agt.completedCount / agt.totalOnboarded) * 100).toFixed(1)}%` : '0%'
        ]),
        [],
        ['=== 2. AGENT RECRUITMENT FUNNEL METRICS ==='],
        ['Total Recruitment Applications', String(totalRecruitmentApps)],
        ['Email Verification Pending', String(recruitmentPending)],
        ['Email Verified (In Draft)', String(recruitmentVerified)],
        ['Completed Submissions', String(recruitmentSubmitted)],
        ['Recruitment Conversion Rate (%)', `${recruitmentConvRate}%`],
        ['Average Time To Submit (Hours)', recruitmentAvgHours ? `${recruitmentAvgHours} hrs` : 'N/A'],
        [],
        ['=== 3. AGENT APPLICATION REVIEWS & ADMIN PERFORMANCE ==='],
        ['Total Agent Verification Applications', String(totalAgentApps)],
        ['Approved Agents', String(agentApproved)],
        ['Pending Review', String(agentPending)],
        ['Rejected Applications', String(agentRejected)],
        ['Suspended Accounts', String(agentSuspended)],
        ['Average Review Turnaround (Hours)', agentAvgTurnaround ? `${agentAvgTurnaround} hrs` : 'N/A'],
        [],
        ['ADMIN REVIEWER LEADERBOARD', 'APPROVED', 'REJECTED', 'TOTAL DECISIONS', 'APPROVAL RATIO (%)'],
        ...(agentAnalytics?.reviewerLeaderboard || []).map((rev: any) => {
          const totalDecisions = (rev.approvedCount || 0) + (rev.rejectedCount || 0);
          const ratio = totalDecisions > 0 ? ((rev.approvedCount / totalDecisions) * 100).toFixed(1) : '0';
          return [
            rev.reviewerName || rev.reviewerId,
            String(rev.approvedCount || 0),
            String(rev.rejectedCount || 0),
            String(totalDecisions),
            `${ratio}%`
          ];
        })
      ];

      const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')).join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `platform_analytics_${period}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      addToast('Platform analytics CSV downloaded successfully.', 'success');
    } catch {
      addToast('Failed to generate export file.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <h2 className="text-xl font-bold text-foreground">Platform Growth & System Analytics</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Aggregated cross-system intelligence covering client onboarding, agent recruitment pipelines, and review performance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="w-44">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-full bg-card h-9 text-xs">
                <SelectValue placeholder="Period Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
                <SelectItem value="ytd">Year to Date</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="h-9 px-3 bg-card border border-border hover:bg-muted/30 text-foreground rounded-lg flex items-center gap-1.5 text-xs font-medium transition-colors disabled:opacity-50"
            title="Refresh analytics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={downloadReport}
            disabled={isExporting || loading}
            className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1.5 text-xs font-medium transition-colors shadow-sm disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {loading && !analytics && !agentAnalytics && !recruitmentAnalytics ? (
        <div className="py-16">
          <PulseLoader />
        </div>
      ) : error && !analytics ? (
        <div className="p-8 bg-destructive/10 border border-destructive/20 rounded-2xl text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
          <p className="text-sm font-medium text-destructive">{error}</p>
          <button onClick={loadData} className="text-xs underline text-destructive hover:opacity-80">
            Try again
          </button>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* ================= SECTION 1: CLIENT ONBOARDING & ACTIVITY ================= */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-600" />
                  Client Onboarding & Lending Operations
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Registration trajectory, loan conversion, and KYC verification progression</p>
              </div>
            </div>

            {/* Top KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Clients */}
              <div className="bg-card rounded-2xl p-5 border border-border shadow-xs space-y-2 hover:border-emerald-500/40 transition-colors">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-medium">Total Registered Clients</span>
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-extrabold text-foreground tracking-tight">{totalClients}</span>
                  <span className="text-xs font-medium text-emerald-600 flex items-center gap-0.5">
                    <ArrowUpRight className="w-3.5 h-3.5" /> 100%
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground pt-1 border-t border-border/40 flex items-center justify-between">
                  <span>Fully Verified</span>
                  <span className="font-semibold text-foreground">{statusCounts.VERIFIED}</span>
                </div>
              </div>

              {/* Loan Conversion */}
              <div className="bg-card rounded-2xl p-5 border border-border shadow-xs space-y-2 hover:border-emerald-500/40 transition-colors">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-medium">Borrower Conversion</span>
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600">
                    <Banknote className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-extrabold text-foreground tracking-tight">
                    {analytics?.activity?.clientsWithAtLeastOneDisbursedLoan || 0}
                  </span>
                  <span className="text-xs font-mono font-medium text-muted-foreground">
                    {totalClients > 0
                      ? `${(((analytics?.activity?.clientsWithAtLeastOneDisbursedLoan || 0) / totalClients) * 100).toFixed(1)}%`
                      : '0%'}
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground pt-1 border-t border-border/40 flex items-center justify-between">
                  <span>Requested Loan</span>
                  <span className="font-semibold text-foreground">{analytics?.activity?.clientsWithAtLeastOneLoanRequest || 0}</span>
                </div>
              </div>

              {/* Pipeline Verification Rate */}
              <div className="bg-card rounded-2xl p-5 border border-border shadow-xs space-y-2 hover:border-emerald-500/40 transition-colors">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-medium">KYC Verification Rate</span>
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-extrabold text-foreground tracking-tight">
                    {totalClients > 0 ? `${((statusCounts.VERIFIED / totalClients) * 100).toFixed(1)}%` : '0%'}
                  </span>
                  <span className="text-xs font-medium text-amber-600">
                    {statusCounts.PENDING_IPPIS} in IPPIS
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground pt-1 border-t border-border/40 flex items-center justify-between">
                  <span>Manual Review Queue</span>
                  <span className="font-semibold text-foreground">{statusCounts.MANUAL_REVIEW}</span>
                </div>
              </div>

              {/* Total Operational Volume */}
              <div className="bg-card rounded-2xl p-5 border border-border shadow-xs space-y-2 hover:border-emerald-500/40 transition-colors">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-medium">Operational Activity</span>
                  <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600">
                    <Activity className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-extrabold text-foreground tracking-tight">
                    {analytics?.activity?.totalLoanRequests || 0}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">Requests</span>
                </div>
                <div className="text-[11px] text-muted-foreground pt-1 border-t border-border/40 flex items-center justify-between">
                  <span>Wallet Operations</span>
                  <span className="font-semibold text-foreground">{analytics?.activity?.totalWalletEntries || 0}</span>
                </div>
              </div>
            </div>

            {/* Mid Grid: Status & Source Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* KYC Status Distribution */}
              <div className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Client Verification Statuses</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Distribution across KYC approval tiers</p>
                  </div>
                  <span className="text-xs font-mono font-medium px-2 py-1 bg-muted/50 rounded-lg text-muted-foreground">
                    byClientStatus
                  </span>
                </div>

                <div className="space-y-3">
                  {[
                    { label: 'Fully Verified', count: statusCounts.VERIFIED, color: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-300' },
                    { label: 'Pending IPPIS Verification', count: statusCounts.PENDING_IPPIS, color: 'bg-blue-500', text: 'text-blue-700 dark:text-blue-300' },
                    { label: 'Manual Review Required', count: statusCounts.MANUAL_REVIEW, color: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-300' },
                    { label: 'Phone Verified Only', count: statusCounts.PHONE_VERIFIED, color: 'bg-slate-400', text: 'text-slate-600 dark:text-slate-400' }
                  ].map((item) => {
                    const percentage = totalClients > 0 ? (item.count / totalClients) * 100 : 0;
                    return (
                      <div key={item.label} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-foreground">{item.label}</span>
                          <span className="font-mono text-muted-foreground">
                            {item.count} <span className="text-[10px]">({percentage.toFixed(1)}%)</span>
                          </span>
                        </div>
                        <div className="h-2 w-full bg-muted/40 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color} rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Onboarding Source Distribution */}
              <div className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Onboarding Channel Distribution</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Client acquisition origins</p>
                  </div>
                  <span className="text-xs font-mono font-medium px-2 py-1 bg-muted/50 rounded-lg text-muted-foreground">
                    bySource
                  </span>
                </div>

                <div className="space-y-3">
                  {[
                    { label: 'Agent Assisted', count: sourceCounts.AGENT, color: 'bg-emerald-600' },
                    { label: 'Self Service / Direct Portal', count: sourceCounts.SELF, color: 'bg-blue-600' },
                    { label: 'Backoffice Admin Entry', count: sourceCounts.ADMIN, color: 'bg-purple-600' },
                    { label: 'Unspecified / Legacy', count: sourceCounts.NONE, color: 'bg-slate-400' }
                  ].map((item) => {
                    const percentage = totalClients > 0 ? (item.count / totalClients) * 100 : 0;
                    return (
                      <div key={item.label} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-foreground">{item.label}</span>
                          <span className="font-mono text-muted-foreground">
                            {item.count} <span className="text-[10px]">({percentage.toFixed(1)}%)</span>
                          </span>
                        </div>
                        <div className="h-2 w-full bg-muted/40 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color} rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Pipeline Stage Breakdown */}
            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Pipeline Stages Progression</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Clients currently sitting in each onboarding step</p>
                </div>
                <span className="text-xs font-mono font-medium px-2 py-1 bg-muted/50 rounded-lg text-muted-foreground">
                  byOnboardingStep
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {stepCounts.map((step, idx) => (
                  <div key={step.key} className="p-3.5 rounded-xl bg-muted/20 border border-border/50 text-center space-y-1">
                    <div className="text-[10px] font-mono text-muted-foreground uppercase">Step {idx + 1}</div>
                    <div className="text-xl font-bold text-foreground">{step.count}</div>
                    <div className="text-[11px] font-medium text-muted-foreground truncate" title={step.label}>
                      {step.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Agent Leaderboard Table */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="p-6 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    <h4 className="text-sm font-semibold text-foreground">Agent Onboarding Leaderboard</h4>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">Top performing agents ranked by completed client onboardings</p>
                </div>
                <span className="text-xs font-mono text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-full w-fit">
                  {(analytics?.agentLeaderboard || []).length} Agents Active
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="bg-[#E9F4EE] dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Rank</th>
                      <th className="px-5 py-3.5">Agent Name</th>
                      <th className="px-5 py-3.5 text-center">Total Enrolled</th>
                      <th className="px-5 py-3.5 text-center">Completed</th>
                      <th className="px-5 py-3.5 text-center">Stalled / Pending</th>
                      <th className="px-5 py-3.5 text-right">Completion Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 text-foreground">
                    {(!analytics?.agentLeaderboard || analytics.agentLeaderboard.length === 0) ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                          <EmptyState title="No Agent Activity" description="No agent-assisted onboardings recorded for this selected time window." />
                        </td>
                      </tr>
                    ) : (
                      analytics.agentLeaderboard.map((agent, index) => {
                        const rate = agent.totalOnboarded > 0 ? (agent.completedCount / agent.totalOnboarded) * 100 : 0;
                        return (
                          <tr key={agent.agentId || index} className="hover:bg-muted/20 transition-colors">
                            <td className="px-5 py-4 font-mono text-xs text-muted-foreground">
                              {index === 0 ? '🥇 #1' : index === 1 ? '🥈 #2' : index === 2 ? '🥉 #3' : `#${index + 1}`}
                            </td>
                            <td className="px-5 py-4">
                              <div className="font-medium text-foreground">{agent.agentName || 'Agent'}</div>
                              <div className="text-[11px] font-mono text-muted-foreground">{agent.agentId}</div>
                            </td>
                            <td className="px-5 py-4 text-center font-bold text-foreground">
                              {agent.totalOnboarded}
                            </td>
                            <td className="px-5 py-4 text-center">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/50">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                {agent.completedCount}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-center">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/50">
                                <Clock className="w-3 h-3 text-amber-600" />
                                {agent.stalledCount}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <div className="inline-flex flex-col items-end gap-1">
                                <span className="font-semibold text-xs font-mono">{rate.toFixed(1)}%</span>
                                <div className="w-20 bg-muted/40 h-1.5 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${rate}%` }} />
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ================= SECTION 2: AGENT RECRUITMENT FUNNEL ================= */}
          <div className="space-y-4 pt-4 border-t border-border/70">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-[#018752]" />
                  Agent Recruitment Pipeline & Funnel Conversion
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Real-time pipeline progression from email invitation to verified profile submission
                </p>
              </div>
              <span className="text-xs font-mono font-medium px-2.5 py-1 bg-[#E8F5EE] text-[#018752] rounded-full">
                /admin/agent-recruitment-applications/analytics
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-card rounded-2xl border border-border/70 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">Total Applications</span>
                  <div className="w-8 h-8 rounded-xl bg-[#E8F5EE] text-[#018752] flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <span className="block text-3xl font-bold text-foreground tracking-tight mb-1">
                  {totalRecruitmentApps}
                </span>
                <span className="block text-[11px] text-muted-foreground/70">
                  Total recruitment starts
                </span>
              </div>

              <div className="bg-card rounded-2xl border border-border/70 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">Email Pending</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <span className="block text-3xl font-bold text-amber-600 dark:text-amber-500 tracking-tight mb-1">
                  {recruitmentPending}
                </span>
                <span className="block text-[11px] text-muted-foreground/70">
                  Awaiting link confirmation
                </span>
              </div>

              <div className="bg-card rounded-2xl border border-border/70 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">Email Verified</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <span className="block text-3xl font-bold text-blue-600 dark:text-blue-400 tracking-tight mb-1">
                  {recruitmentVerified}
                </span>
                <span className="block text-[11px] text-muted-foreground/70">
                  Active in application draft
                </span>
              </div>

              <div className="bg-card rounded-2xl border border-border/70 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">Submitted & Completed</span>
                  <div className="w-8 h-8 rounded-xl bg-[#E8F5EE] text-[#018752] flex items-center justify-center">
                    <UserCheck className="w-4 h-4" />
                  </div>
                </div>
                <span className="block text-3xl font-bold text-[#018752] tracking-tight mb-1">
                  {recruitmentSubmitted}
                </span>
                <span className="block text-[11px] text-muted-foreground/70">
                  Ready for admin review
                </span>
              </div>

              <div className="bg-card rounded-2xl border border-border/70 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">Funnel Conversion</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <span className="block text-3xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight mb-1">
                  {recruitmentConvRate}%
                </span>
                <span className="block text-[11px] text-muted-foreground/70">
                  {recruitmentAvgHours ? `Avg ${recruitmentAvgHours}h turnaround` : 'Conversion rate'}
                </span>
              </div>
            </div>
          </div>

          {/* ================= SECTION 3: AGENT REVIEW & ADMIN PERFORMANCE ================= */}
          <div className="space-y-4 pt-4 border-t border-border/70">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-600" />
                  Agent Verification Reviews & Admin Reviewer Performance
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Backoffice review efficiency, approval distribution, and reviewer activity metrics
                </p>
              </div>
              <span className="text-xs font-mono font-medium px-2.5 py-1 bg-muted/60 text-muted-foreground rounded-full">
                /admin/agents/analytics
              </span>
            </div>

            {/* Agent Reviews KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-card rounded-2xl border border-border/70 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">Total Agent Applications</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Briefcase className="w-4 h-4" />
                  </div>
                </div>
                <span className="block text-3xl font-bold text-foreground tracking-tight mb-1">
                  {totalAgentApps}
                </span>
                <span className="block text-[11px] text-muted-foreground/70">
                  Candidates in verification
                </span>
              </div>

              <div className="bg-card rounded-2xl border border-border/70 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">Approved Agents</span>
                  <div className="w-8 h-8 rounded-xl bg-[#E8F5EE] text-[#018752] flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <span className="block text-3xl font-bold text-[#018752] tracking-tight mb-1">
                  {agentApproved}
                </span>
                <span className="block text-[11px] text-muted-foreground/70">
                  Active field agents
                </span>
              </div>

              <div className="bg-card rounded-2xl border border-border/70 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">Pending Review</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <span className="block text-3xl font-bold text-amber-600 dark:text-amber-500 tracking-tight mb-1">
                  {agentPending}
                </span>
                <span className="block text-[11px] text-muted-foreground/70">
                  In compliance review queue
                </span>
              </div>

              <div className="bg-card rounded-2xl border border-border/70 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">Rejected Candidates</span>
                  <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center">
                    <XCircle className="w-4 h-4" />
                  </div>
                </div>
                <span className="block text-3xl font-bold text-rose-600 dark:text-rose-500 tracking-tight mb-1">
                  {agentRejected}
                </span>
                <span className="block text-[11px] text-muted-foreground/70">
                  Failed verification criteria
                </span>
              </div>

              <div className="bg-card rounded-2xl border border-border/70 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">Avg Review Time</span>
                  <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <span className="block text-3xl font-bold text-purple-600 dark:text-purple-400 tracking-tight mb-1">
                  {agentAvgTurnaround ? `${agentAvgTurnaround}h` : 'N/A'}
                </span>
                <span className="block text-[11px] text-muted-foreground/70">
                  Decision turnaround speed
                </span>
              </div>
            </div>

            {/* Admin Reviewer Leaderboard Table */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="p-6 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    <h4 className="text-sm font-semibold text-foreground">Admin Reviewer Leaderboard</h4>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Individual backoffice reviewer activity, approved/rejected decision volumes and approval ratios
                  </p>
                </div>
                <span className="text-xs font-mono text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-full w-fit">
                  {(agentAnalytics?.reviewerLeaderboard || []).length} Reviewers
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="bg-[#E9F4EE] dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Rank</th>
                      <th className="px-5 py-3.5">Reviewer Name</th>
                      <th className="px-5 py-3.5 text-center">Approved</th>
                      <th className="px-5 py-3.5 text-center">Rejected</th>
                      <th className="px-5 py-3.5 text-center">Total Decisions</th>
                      <th className="px-5 py-3.5 text-right">Approval Ratio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 text-foreground">
                    {(!agentAnalytics?.reviewerLeaderboard || agentAnalytics.reviewerLeaderboard.length === 0) ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                          <EmptyState title="No Reviewer Activity" description="No administrative reviews logged for the selected period." />
                        </td>
                      </tr>
                    ) : (
                      agentAnalytics.reviewerLeaderboard.map((rev: any, index: number) => {
                        const totalDecisions = (rev.approvedCount || 0) + (rev.rejectedCount || 0);
                        const ratio = totalDecisions > 0 ? (rev.approvedCount / totalDecisions) * 100 : 0;
                        return (
                          <tr key={rev.reviewerId || index} className="hover:bg-muted/20 transition-colors">
                            <td className="px-5 py-4 font-mono text-xs text-muted-foreground">
                              {index === 0 ? '🥇 #1' : index === 1 ? '🥈 #2' : index === 2 ? '🥉 #3' : `#${index + 1}`}
                            </td>
                            <td className="px-5 py-4">
                              <div className="font-medium text-foreground">{rev.reviewerName || 'Admin Reviewer'}</div>
                              <div className="text-[11px] font-mono text-muted-foreground">{rev.reviewerId}</div>
                            </td>
                            <td className="px-5 py-4 text-center">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/50">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                {rev.approvedCount || 0}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-center">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/50">
                                <XCircle className="w-3 h-3 text-rose-600" />
                                {rev.rejectedCount || 0}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-center font-bold text-foreground">
                              {totalDecisions}
                            </td>
                            <td className="px-5 py-4 text-right">
                              <div className="inline-flex flex-col items-end gap-1">
                                <span className="font-semibold text-xs font-mono">{ratio.toFixed(1)}%</span>
                                <div className="w-20 bg-muted/40 h-1.5 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${ratio}%` }} />
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
