"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import { useClientAnalytics } from '@/app/composables/modules/useClientAnalytics';
import { useAgents } from '@/app/composables/modules/useAgents';
import { useAgentRecruitment } from '@/app/composables/modules/useAgentRecruitment';
import { useProfile } from '@/app/composables/modules/useProfile';
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
  Briefcase,
  ArrowRight,
  ChevronRight,
  Layers,
  PieChart,
  Sparkles,
  Smartphone,
  UserPlus,
  FolderDown,
  ExternalLink
} from 'lucide-react';
import { useAdminPermissions } from '@/app/composables/useAdminPermissions';

export default function DashboardOverviewPage() {
  const { isSuperAdmin, hasPermission } = useAdminPermissions();
  const canClientAnalytics = isSuperAdmin || hasPermission('clients:analytics:read');
  const canAgentAnalytics = isSuperAdmin || hasPermission('agents:analytics:read');
  const canRecruitmentAnalytics = isSuperAdmin || hasPermission('agents:recruitment:analytics:read');
  const hasAnyAnalytics = canClientAnalytics || canAgentAnalytics || canRecruitmentAnalytics;

  const { profile } = useProfile();
  const { loading: clientLoading, error: clientError, analytics, fetchAnalytics: fetchClientAnalytics } = useClientAnalytics();
  const { agentAnalytics, analyticsLoading: agentLoading, fetchAgentAnalytics } = useAgents();
  const { analytics: recruitmentAnalytics, analyticsLoading: recruitmentLoading, fetchAnalytics: fetchRecruitmentAnalytics } = useAgentRecruitment();
  
  const { addToast } = useToast();
  const [period, setPeriod] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);

  const adminName = useMemo(() => {
    if (profile?.firstName) return profile.firstName;
    if (profile?.fullName) return profile.fullName.split(' ')[0];
    return 'Admin';
  }, [profile]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const calculateDateRange = useCallback((selectedPeriod: string) => {
    const now = new Date();
    let from: Date | null = null;
    let to: Date = now;

    if (selectedPeriod === '30d') {
      from = new Date();
      from.setDate(now.getDate() - 30);
    } else if (selectedPeriod === '90d') {
      from = new Date();
      from.setDate(now.getDate() - 90);
    } else if (selectedPeriod === 'ytd') {
      from = new Date(now.getFullYear(), 0, 1);
    }

    return {
      from: from ? from.toISOString().split('T')[0] : undefined,
      to: to.toISOString().split('T')[0]
    };
  }, []);

  const loadData = useCallback(() => {
    const range = calculateDateRange(period);
    const params: any = {};
    if (range.from) params.createdFrom = range.from;
    if (range.to) params.createdTo = range.to;

    if (canClientAnalytics) fetchClientAnalytics(params);
    if (canAgentAnalytics) fetchAgentAnalytics(params);
    if (canRecruitmentAnalytics) fetchRecruitmentAnalytics(params);
  }, [period, canClientAnalytics, canAgentAnalytics, canRecruitmentAnalytics, calculateDateRange, fetchClientAnalytics, fetchAgentAnalytics, fetchRecruitmentAnalytics]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loading = clientLoading || agentLoading || recruitmentLoading;
  const error = clientError;

  // Client calculations
  const totalClients = analytics?.totalClients || 0;

  const statusCounts = useMemo(() => {
    const raw = analytics?.byClientStatus || {};
    return {
      VERIFIED: raw.VERIFIED || 0,
      PENDING_IPPIS: raw.PENDING_IPPIS || 0,
      MANUAL_REVIEW: raw.MANUAL_REVIEW || 0,
      PHONE_VERIFIED: raw.PHONE_VERIFIED || 0
    };
  }, [analytics]);

  const sourceCounts = useMemo(() => {
    const raw = analytics?.bySource || {};
    return {
      SELF: raw.SELF || 0,
      AGENT: raw.AGENT || 0,
      ADMIN: raw.ADMIN || 0,
      NONE: raw.NONE || 0
    };
  }, [analytics]);

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
  const agentAvgTurnaround = agentAnalytics?.activity?.averageReviewTimeHours !== null && agentAnalytics?.activity?.averageReviewTimeHours !== undefined
    ? Number(agentAnalytics.activity.averageReviewTimeHours).toFixed(1)
    : null;

  // CSV Export
  const downloadReport = () => {
    setIsExporting(true);
    addToast('Generating executive intelligence CSV export...', 'info');

    try {
      const rows: string[][] = [
        ['PUBLIC SECTOR - EXECUTIVE PLATFORM INTELLIGENCE REPORT'],
        ['Generated At', new Date().toISOString()],
        ['Period Filter', period.toUpperCase()],
        [],
        ['=== 1. CLIENT ONBOARDING & ACTIVITY METRICS ==='],
        ['Total Registered Clients', String(analytics?.totalClients || 0)],
        ['Clients with Disbursed Loans', String(analytics?.activity?.clientsWithAtLeastOneDisbursedLoan || 0)],
        ['Clients with Loan Requests', String(analytics?.activity?.clientsWithAtLeastOneLoanRequest || 0)],
        ['Total Loan Requests Volume', String(analytics?.activity?.totalLoanRequests || 0)],
        [],
        ['=== 2. AGENT RECRUITMENT PIPELINE ==='],
        ['Total Recruitment Applications', String(totalRecruitmentApps)],
        ['Conversion Rate', `${recruitmentConvRate}%`],
        ['Average Time to Submit (Hours)', recruitmentAvgHours || 'N/A'],
        [],
        ['=== 3. AGENT VERIFICATION & REVIEW PERFORMANCE ==='],
        ['Total Agent Candidates', String(totalAgentApps)],
        ['Approved Agents', String(agentApproved)],
        ['Pending Review Queue', String(agentPending)],
        ['Average Review Turnaround (Hours)', agentAvgTurnaround || 'N/A']
      ];

      const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')).join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `executive_dashboard_${period}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      addToast('Executive dashboard CSV downloaded successfully.', 'success');
    } catch {
      addToast('Failed to generate export file.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const verifiedPercent = totalClients > 0 ? ((statusCounts.VERIFIED / totalClients) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* ================= HEADER SECTION ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
              {greeting}, {adminName}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E8F5EE] text-[#018752] border border-[#018752]/20">
              <Sparkles className="w-3 h-3 text-[#018752]" />
              Live Analytics
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time executive intelligence covering client enrollment, field agent pipelines, and credit operations.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="w-40">
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
            className="h-9 px-3 bg-card border border-border hover:bg-muted/30 text-foreground rounded-lg flex items-center gap-1.5 text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
            title="Refresh analytics data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={downloadReport}
            disabled={isExporting || loading}
            className="h-9 px-4 bg-[#018752] hover:bg-[#017044] text-white rounded-lg flex items-center gap-1.5 text-xs font-medium transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* ================= LOADING & ERROR STATES ================= */}
      {loading && !analytics && !agentAnalytics && !recruitmentAnalytics ? (
        <div className="py-20">
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
        <div className="space-y-8">
          
          {/* ================= 4 PRIMARY EXECUTIVE KPI CARDS ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Total Registered Clients */}
            <div className="bg-card rounded-2xl p-5 border border-border/80 shadow-xs hover:border-[#018752]/50 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between text-muted-foreground mb-2">
                  <span className="text-xs font-medium">Registered Clients</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-3xl font-extrabold text-foreground tracking-tight">
                    {totalClients}
                  </span>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/50">
                    {verifiedPercent}% Verified
                  </span>
                </div>
                <div className="w-full bg-muted/60 h-1.5 rounded-full overflow-hidden my-2">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${verifiedPercent}%` }} />
                </div>
              </div>

              <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Pending IPPIS: <strong className="text-foreground">{statusCounts.PENDING_IPPIS}</strong></span>
                <Link href="/dashboard/clients" className="text-[#018752] hover:underline font-semibold flex items-center gap-0.5">
                  View <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Card 2: Lending Operations & Activity */}
            <div className="bg-card rounded-2xl p-5 border border-border/80 shadow-xs hover:border-[#018752]/50 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between text-muted-foreground mb-2">
                  <span className="text-xs font-medium">Loan Operations</span>
                  <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Banknote className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-3xl font-extrabold text-foreground tracking-tight">
                    {analytics?.activity?.totalLoanRequests || 0}
                  </span>
                  <span className="text-xs font-semibold text-purple-600 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-full border border-purple-200/50">
                    Requests
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {analytics?.activity?.clientsWithAtLeastOneDisbursedLoan || 0} clients received disbursed loans
                </p>
              </div>

              <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Active Borrowers: <strong className="text-foreground">{analytics?.activity?.clientsWithAtLeastOneLoanRequest || 0}</strong></span>
                <Link href="/dashboard/loan-requests" className="text-[#018752] hover:underline font-semibold flex items-center gap-0.5">
                  Manage <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Card 3: Field Agent Recruitment */}
            <div className="bg-card rounded-2xl p-5 border border-border/80 shadow-xs hover:border-[#018752]/50 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between text-muted-foreground mb-2">
                  <span className="text-xs font-medium">Agent Recruitment</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <UserPlus className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-3xl font-extrabold text-foreground tracking-tight">
                    {totalRecruitmentApps}
                  </span>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full border border-blue-200/50">
                    {recruitmentConvRate}% Conv.
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {recruitmentSubmitted} candidate profiles submitted
                </p>
              </div>

              <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Turnaround: <strong className="text-foreground">{recruitmentAvgHours ? `${recruitmentAvgHours}h` : 'Real-time'}</strong></span>
                <Link href="/dashboard/invites" className="text-[#018752] hover:underline font-semibold flex items-center gap-0.5">
                  Pipeline <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Card 4: Agent Verification & Compliance */}
            <div className="bg-card rounded-2xl p-5 border border-border/80 shadow-xs hover:border-[#018752]/50 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between text-muted-foreground mb-2">
                  <span className="text-xs font-medium">Active Field Force</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <UserCheck className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-3xl font-extrabold text-[#018752] tracking-tight">
                    {agentApproved}
                  </span>
                  <span className="text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200/50">
                    {agentPending} Pending
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Verified field agents active in onboarding
                </p>
              </div>

              <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Avg Review: <strong className="text-foreground">{agentAvgTurnaround ? `${agentAvgTurnaround}h` : 'Immediate'}</strong></span>
                <Link href="/dashboard/agent-management" className="text-[#018752] hover:underline font-semibold flex items-center gap-0.5">
                  Review <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

          </div>

          {/* ================= PRIMARY TWO-PANEL ANALYTICS ROW ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Client KYC & Onboarding Continuum Funnel */}
            <div className="lg:col-span-2 bg-card rounded-2xl border border-border/80 p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/60">
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#018752]" />
                    Customer KYC & Onboarding Funnel
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Conversion tracking across the 6 statutory checkpoints of public sector enrollment
                  </p>
                </div>
                <Link 
                  href="/dashboard/reports" 
                  className="text-xs text-[#018752] hover:underline font-semibold flex items-center gap-1 self-start sm:self-auto"
                >
                  Full Reports <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Progress Steps Horizontal Bar */}
              <div className="space-y-3">
                {stepCounts.map((step, idx) => {
                  const percentage = totalClients > 0 ? ((step.count / totalClients) * 100).toFixed(1) : '0';
                  return (
                    <div key={step.key} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-foreground flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-mono text-muted-foreground">
                            {idx + 1}
                          </span>
                          {step.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">{step.count}</span>
                          <span className="text-[11px] font-mono text-muted-foreground">({percentage}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-muted/50 h-2 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#018752] rounded-full transition-all duration-500" 
                          style={{ width: `${percentage}%` }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 bg-[#E8F5EE] dark:bg-emerald-950/20 rounded-xl border border-emerald-200/50 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#018752]" />
                  Total KYC Verified Candidates Ready for Lending:
                </span>
                <span className="font-bold text-sm font-mono">{statusCounts.VERIFIED}</span>
              </div>
            </div>

            {/* Right 1 Col: Customer Acquisition Channel Breakdown */}
            <div className="bg-card rounded-2xl border border-border/80 p-6 shadow-xs space-y-5 flex flex-col justify-between">
              <div>
                <div className="pb-3 border-b border-border/60">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-emerald-600" />
                    Acquisition Channels
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Distribution of client enrollment sources
                  </p>
                </div>

                <div className="space-y-4 mt-4">
                  {/* Self-Service */}
                  <div className="p-4 rounded-xl bg-muted/20 border border-border/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-foreground">Self Registration</span>
                        <span className="block text-[11px] text-muted-foreground">Customer Direct App/Web</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block text-base font-bold text-foreground font-mono">{sourceCounts.SELF}</span>
                      <span className="block text-[10px] text-muted-foreground">
                        {totalClients > 0 ? `${((sourceCounts.SELF / totalClients) * 100).toFixed(0)}%` : '0%'}
                      </span>
                    </div>
                  </div>

                  {/* Agent Assisted */}
                  <div className="p-4 rounded-xl bg-muted/20 border border-border/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-foreground">Field Agent Enrolled</span>
                        <span className="block text-[11px] text-muted-foreground">Agent App Assistance</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block text-base font-bold text-foreground font-mono">{sourceCounts.AGENT}</span>
                      <span className="block text-[10px] text-muted-foreground">
                        {totalClients > 0 ? `${((sourceCounts.AGENT / totalClients) * 100).toFixed(0)}%` : '0%'}
                      </span>
                    </div>
                  </div>

                  {/* Admin Assisted */}
                  <div className="p-4 rounded-xl bg-muted/20 border border-border/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-foreground">Backoffice Admin</span>
                        <span className="block text-[11px] text-muted-foreground">Internal Portal Assisted</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block text-base font-bold text-foreground font-mono">{sourceCounts.ADMIN}</span>
                      <span className="block text-[10px] text-muted-foreground">
                        {totalClients > 0 ? `${((sourceCounts.ADMIN / totalClients) * 100).toFixed(0)}%` : '0%'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-border/50">
                <Link
                  href="/dashboard/clients"
                  className="w-full py-2 bg-muted/40 hover:bg-muted text-foreground text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-border/60"
                >
                  <span>Explore Customer Directory</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>

          {/* ================= SECOND ROW: AGENT RECRUITMENT & LEADERBOARD ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Agent Recruitment Pipeline Pulse */}
            <div className="bg-card rounded-2xl border border-border/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <FileCheck2 className="w-5 h-5 text-[#018752]" />
                    Recruitment Funnel
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Field agent application conversion
                  </p>
                </div>
                <Link href="/dashboard/invites" className="text-xs text-[#018752] hover:underline font-semibold flex items-center gap-1">
                  Manage <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-muted/20 border border-border/60 rounded-xl">
                  <span className="block text-xs text-muted-foreground">Email Sent</span>
                  <span className="block text-lg font-bold text-foreground font-mono mt-1">
                    {recruitmentAnalytics?.byStatus?.EMAIL_PENDING ?? 0}
                  </span>
                </div>
                <div className="p-3 bg-muted/20 border border-border/60 rounded-xl">
                  <span className="block text-xs text-muted-foreground">Verified</span>
                  <span className="block text-lg font-bold text-blue-600 font-mono mt-1">
                    {recruitmentAnalytics?.byStatus?.EMAIL_VERIFIED ?? 0}
                  </span>
                </div>
                <div className="p-3 bg-muted/20 border border-border/60 rounded-xl">
                  <span className="block text-xs text-muted-foreground">Submitted</span>
                  <span className="block text-lg font-bold text-[#018752] font-mono mt-1">
                    {recruitmentSubmitted}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-muted/30 rounded-xl border border-border/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Funnel Conversion Rate</span>
                  <span className="font-bold text-emerald-600 font-mono">{recruitmentConvRate}%</span>
                </div>
                <div className="w-full bg-muted/60 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${recruitmentConvRate}%` }} />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {recruitmentAvgHours ? `Average submission turnaround is ${recruitmentAvgHours} hours.` : 'Real-time pipeline monitoring.'}
                </p>
              </div>
            </div>

            {/* Top Field Agents Leaderboard (2 cols) */}
            <div className="lg:col-span-2 bg-card rounded-2xl border border-border/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    Top Field Agent Enrollers
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Highest performing field force members by completed onboarding volume
                  </p>
                </div>
                <Link href="/dashboard/agent-management" className="text-xs text-[#018752] hover:underline font-semibold flex items-center gap-1">
                  All Agents <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#E9F4EE] dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="px-3.5 py-2.5 rounded-l-lg">Rank</th>
                      <th className="px-3.5 py-2.5">Agent</th>
                      <th className="px-3.5 py-2.5 text-center">Enrolled</th>
                      <th className="px-3.5 py-2.5 text-center">Completed</th>
                      <th className="px-3.5 py-2.5 text-right rounded-r-lg">Completion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 text-foreground">
                    {(!analytics?.agentLeaderboard || analytics.agentLeaderboard.length === 0) ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-muted-foreground">
                          No agent activity recorded for this period.
                        </td>
                      </tr>
                    ) : (
                      analytics.agentLeaderboard.slice(0, 5).map((agent, index) => {
                        const rate = agent.totalOnboarded > 0 ? (agent.completedCount / agent.totalOnboarded) * 100 : 0;
                        return (
                          <tr key={agent.agentId || index} className="hover:bg-muted/20 transition-colors">
                            <td className="px-3.5 py-3 font-mono font-bold text-muted-foreground">
                              {index === 0 ? '🥇 #1' : index === 1 ? '🥈 #2' : index === 2 ? '🥉 #3' : `#${index + 1}`}
                            </td>
                            <td className="px-3.5 py-3">
                              <div className="font-semibold text-foreground">{agent.agentName || 'Field Agent'}</div>
                              <div className="text-[10px] font-mono text-muted-foreground">{agent.agentId}</div>
                            </td>
                            <td className="px-3.5 py-3 text-center font-bold font-mono">
                              {agent.totalOnboarded}
                            </td>
                            <td className="px-3.5 py-3 text-center">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/50">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                {agent.completedCount}
                              </span>
                            </td>
                            <td className="px-3.5 py-3 text-right">
                              <span className="font-semibold font-mono text-xs text-foreground">{rate.toFixed(0)}%</span>
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

          {/* ================= QUICK OPERATIONS LAUNCHPAD ================= */}
          <div className="bg-gradient-to-r from-emerald-900/10 via-card to-card rounded-2xl border border-border/80 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#018752]" />
              Quick Operations Launchpad
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Link
                href="/dashboard/broadsheet"
                className="p-3.5 rounded-xl bg-card border border-border/70 hover:border-[#018752] hover:shadow-xs transition-all flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between text-muted-foreground group-hover:text-[#018752]">
                  <FolderDown className="w-5 h-5" />
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <div className="mt-3">
                  <span className="block text-xs font-bold text-foreground">Broadsheet Uploads</span>
                  <span className="block text-[11px] text-muted-foreground mt-0.5">IPPIS & payroll files</span>
                </div>
              </Link>

              <Link
                href="/dashboard/loan-requests"
                className="p-3.5 rounded-xl bg-card border border-border/70 hover:border-[#018752] hover:shadow-xs transition-all flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between text-muted-foreground group-hover:text-[#018752]">
                  <Banknote className="w-5 h-5" />
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <div className="mt-3">
                  <span className="block text-xs font-bold text-foreground">Loan Approvals</span>
                  <span className="block text-[11px] text-muted-foreground mt-0.5">Review credit queue</span>
                </div>
              </Link>

              <Link
                href="/dashboard/agent-management"
                className="p-3.5 rounded-xl bg-card border border-border/70 hover:border-[#018752] hover:shadow-xs transition-all flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between text-muted-foreground group-hover:text-[#018752]">
                  <Users className="w-5 h-5" />
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <div className="mt-3">
                  <span className="block text-xs font-bold text-foreground">Agent Verification</span>
                  <span className="block text-[11px] text-muted-foreground mt-0.5">Review candidate profiles</span>
                </div>
              </Link>

              <Link
                href="/dashboard/reports"
                className="p-3.5 rounded-xl bg-card border border-border/70 hover:border-[#018752] hover:shadow-xs transition-all flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between text-muted-foreground group-hover:text-[#018752]">
                  <Activity className="w-5 h-5" />
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <div className="mt-3">
                  <span className="block text-xs font-bold text-foreground">Deep Analytics</span>
                  <span className="block text-[11px] text-muted-foreground mt-0.5">Domain-based sub-tabs</span>
                </div>
              </Link>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
