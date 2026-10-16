"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import { useClientAnalytics } from '@/app/composables/modules/useClientAnalytics';
import { useToast } from '@/app/composables/useToast';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/app/components/ui/Select';
import { Users, Banknote, ShieldCheck, Activity, ArrowUpRight, RefreshCw, Download, CheckCircle2, AlertCircle, Clock, Award } from 'lucide-react';

export default function AnalyticsTab() {
  const { loading, error, analytics, fetchAnalytics } = useClientAnalytics();
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
    fetchAnalytics(range);
  }, [period, calculateDateRange, fetchAnalytics]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  const downloadReport = () => {
    if (!analytics) {
      addToast('No analytics data available to export.', 'error');
      return;
    }

    setIsExporting(true);
    addToast('Generating analytics CSV...', 'info');

    try {
      const rows: string[][] = [
        ['PUBLIC SECTOR - CLIENT ONBOARDING & ACTIVITY ANALYTICS'],
        ['Generated At', new Date().toISOString()],
        ['Period Filter', period.toUpperCase()],
        [],
        ['EXECUTIVE SUMMARY METRICS', ''],
        ['Total Registered Clients', String(analytics.totalClients || 0)],
        ['Clients with Disbursed Loans', String(analytics.activity?.clientsWithAtLeastOneDisbursedLoan || 0)],
        ['Clients with Loan Requests', String(analytics.activity?.clientsWithAtLeastOneLoanRequest || 0)],
        ['Total Loan Requests', String(analytics.activity?.totalLoanRequests || 0)],
        ['Total Wallet Operations', String(analytics.activity?.totalWalletEntries || 0)],
        ['Clients with Active Sessions', String(analytics.activity?.clientsWithAtLeastOneSession || 0)],
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
        ['AGENT LEADERBOARD', 'TOTAL ONBOARDED', 'COMPLETED', 'STALLED', 'COMPLETION RATE (%)'],
        ...(analytics.agentLeaderboard || []).map((agt) => [
          agt.agentName || agt.agentId,
          String(agt.totalOnboarded),
          String(agt.completedCount),
          String(agt.stalledCount),
          agt.totalOnboarded > 0 ? `${((agt.completedCount / agt.totalOnboarded) * 100).toFixed(1)}%` : '0%'
        ])
      ];

      const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')).join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `client_analytics_${period}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      addToast('Analytics CSV downloaded successfully.', 'success');
    } catch {
      addToast('Failed to generate export file.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <h2 className="text-xl font-bold text-foreground">Client Onboarding & Growth Analytics</h2>
          {/* <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Real-time data from <code className="text-[11px] font-mono bg-muted/50 px-1.5 py-0.5 rounded">/admin/clients/analytics</code>
          </p> */}
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
            disabled={isExporting || loading || !analytics}
            className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1.5 text-xs font-medium transition-colors shadow-sm disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {loading && !analytics ? (
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
        <div className="space-y-6">
          {/* Executive KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card rounded-2xl p-5 border border-border/70 shadow-sm relative overflow-hidden group hover:border-[#018752]/40 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Clients</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground">
                {totalClients.toLocaleString()}
              </div>
              <div className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>{statusCounts.VERIFIED} fully verified</span>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-5 border border-border/70 shadow-sm relative overflow-hidden group hover:border-[#018752]/40 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Disbursed Loans</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Banknote className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground">
                {(analytics?.activity?.clientsWithAtLeastOneDisbursedLoan || 0).toLocaleString()}
              </div>
              <div className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1 font-medium">
                <ArrowUpRight className="w-3.5 h-3.5 text-blue-500" />
                <span>{analytics?.activity?.totalLoanRequests || 0} loan requests</span>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-5 border border-border/70 shadow-sm relative overflow-hidden group hover:border-[#018752]/40 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Active Sessions</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground">
                {(analytics?.activity?.clientsWithAtLeastOneSession || 0).toLocaleString()}
              </div>
              <div className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                <span>Portal authenticated clients</span>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-5 border border-border/70 shadow-sm relative overflow-hidden group hover:border-[#018752]/40 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Wallet Operations</span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground">
                {(analytics?.activity?.totalWalletEntries || 0).toLocaleString()}
              </div>
              <div className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1 font-medium">
                <span className="w-2 h-2 rounded-full bg-purple-500 inline-block"></span>
                <span>Ledger journal entries</span>
              </div>
            </div>
          </div>

          {/* Two Columns: Status Funnel vs Channel Sources */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution */}
            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-foreground">Client Verification Funnel</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Distribution across client onboarding states</p>
                </div>
                <span className="text-xs font-mono font-medium px-2 py-1 bg-muted/50 rounded-lg text-muted-foreground">
                  {totalClients} total
                </span>
              </div>

              <div className="space-y-3.5 pt-1">
                {[
                  { key: 'VERIFIED', label: 'Verified & Approved', count: statusCounts.VERIFIED, color: 'bg-emerald-500', pill: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' },
                  { key: 'PENDING_IPPIS', label: 'Pending IPPIS Verification', count: statusCounts.PENDING_IPPIS, color: 'bg-amber-500', pill: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' },
                  { key: 'MANUAL_REVIEW', label: 'Manual Review Required', count: statusCounts.MANUAL_REVIEW, color: 'bg-blue-500', pill: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' },
                  { key: 'PHONE_VERIFIED', label: 'Phone Verified Only', count: statusCounts.PHONE_VERIFIED, color: 'bg-slate-400', pill: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
                ].map((item) => {
                  const pct = totalClients > 0 ? (item.count / totalClients) * 100 : 0;
                  return (
                    <div key={item.key} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground">{item.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{item.count}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${item.pill}`}>
                            {pct.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-muted/40 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Acquisition Channels */}
            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-foreground">Acquisition Channel</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Where onboarding traffic originates</p>
                </div>
                <span className="text-xs font-mono font-medium px-2 py-1 bg-muted/50 rounded-lg text-muted-foreground">
                  bySource
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                {[
                  { key: 'SELF', label: 'Self Onboarded', count: sourceCounts.SELF, desc: 'Client portal self-serve' },
                  { key: 'AGENT', label: 'Agent Assisted', count: sourceCounts.AGENT, desc: 'Enrolled via field agent' },
                  { key: 'ADMIN', label: 'Admin Initiated', count: sourceCounts.ADMIN, desc: 'Created by backoffice' },
                  { key: 'NONE', label: 'Direct / Unlinked', count: sourceCounts.NONE, desc: 'No source recorded' },
                ].map((channel) => {
                  const pct = totalClients > 0 ? (channel.count / totalClients) * 100 : 0;
                  return (
                    <div key={channel.key} className="p-3.5 rounded-xl bg-muted/20 border border-border/50 hover:bg-muted/40 transition-colors">
                      <div className="text-xs font-medium text-muted-foreground">{channel.label}</div>
                      <div className="text-xl font-bold text-foreground mt-1">{channel.count}</div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/40 text-[10px] text-muted-foreground">
                        <span className="truncate">{channel.desc}</span>
                        <span className="font-mono font-semibold text-foreground shrink-0">{pct.toFixed(0)}%</span>
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
                <h3 className="text-base font-semibold text-foreground">Pipeline Stages Progression</h3>
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
                  <h3 className="text-base font-semibold text-foreground">Agent Onboarding Leaderboard</h3>
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
      )}
    </div>
  );
}
