"use client";

import { useEffect, useState, useMemo } from 'react';
import { useAuditLogs } from '@/app/composables/modules/useAuditLogs';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import Pagination from '@/app/components/ui/Pagination';
import CustomDateRangePicker from '@/app/components/ui/CustomDateRangePicker';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/app/components/ui/Select';

const KNOWN_ACTIONS: { value: string; label: string }[] = [
  { value: 'admin.invite.created', label: 'Admin Invite Created' },
  { value: 'admin.invite.deleted', label: 'Admin Invite Deleted' },
  { value: 'admin.invite.accepted', label: 'Admin Invite Accepted' },
  { value: 'admin.invite.resent', label: 'Admin Invite Resent' },
  { value: 'admin.invite.revoked', label: 'Admin Invite Revoked' },
  { value: 'admin.created', label: 'Admin Created' },
  { value: 'admin.updated', label: 'Admin Updated' },
  { value: 'admin.deleted', label: 'Admin Deleted' },
  { value: 'admin.status.changed', label: 'Admin Status Changed' },
  { value: 'admin.login', label: 'Admin Logged In' },
  { value: 'admin.password.changed', label: 'Admin Password Changed' },
  { value: 'admin.2fa.enabled', label: 'Admin 2FA Enabled' },
  { value: 'admin.2fa.disabled', label: 'Admin 2FA Disabled' },
  { value: 'role.created', label: 'Role Created' },
  { value: 'role.updated', label: 'Role Updated' },
  { value: 'role.deleted', label: 'Role Deleted' },
  { value: 'role.permissions.bulk_assigned', label: 'Role Permissions Assigned' },
  { value: 'agent.approved', label: 'Agent Approved' },
  { value: 'agent.rejected', label: 'Agent Rejected' },
  { value: 'agent.status.changed', label: 'Agent Status Changed' },
  { value: 'agent.session.created', label: 'Agent Session Created' },
  { value: 'agent.session.revoked', label: 'Agent Session Revoked' },
  { value: 'loan-request.created', label: 'Loan Request Created' },
  { value: 'loan-request.approve', label: 'Loan Request Approved' },
  { value: 'loan-request.reject', label: 'Loan Request Rejected' },
  { value: 'loan-request.disburse', label: 'Loan Disbursed' },
  { value: 'loan-request.confirmed', label: 'Loan Request Confirmed' },
  { value: 'loans.upload', label: 'Loan Book Uploaded' },
  { value: 'repayments.upload', label: 'Repayments Uploaded' },
  { value: 'ippis.upload', label: 'IPPIS Uploaded' },
  { value: 'client.created', label: 'Client Created' },
  { value: 'client.updated', label: 'Client Updated' },
  { value: 'client.session.revoked', label: 'Client Session Revoked' },
];

const KNOWN_TARGET_TYPES: { value: string; label: string }[] = [
  { value: 'AdminInvite', label: 'Admin Invite' },
  { value: 'AdminUser', label: 'Admin User' },
  { value: 'Role', label: 'Role' },
  { value: 'Department', label: 'Department' },
  { value: 'Agent', label: 'Agent' },
  { value: 'AgentApplication', label: 'Agent Application' },
  { value: 'Client', label: 'Client' },
  { value: 'Loan', label: 'Loan' },
  { value: 'LoanRequest', label: 'Loan Request' },
  { value: 'IppisBatch', label: 'IPPIS Batch' },
  { value: 'RepaymentBatch', label: 'Repayment Batch' },
  { value: 'Session', label: 'User Session' },
];

export default function AuditLogsTab() {
  const [showFilter, setShowFilter] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const { loading, error, logs, fetchLogs, meta } = useAuditLogs();

  const [actionFilter, setActionFilter] = useState('');
  const [actorTypeFilter, setActorTypeFilter] = useState('');
  const [targetTypeFilter, setTargetTypeFilter] = useState('');
  const [targetIdFilter, setTargetIdFilter] = useState('');
  const [createdRange, setCreatedRange] = useState('');

  useEffect(() => {
    const params: any = { page, limit };
    if (actionFilter && actionFilter !== 'none') params.action = actionFilter;
    if (actorTypeFilter && actorTypeFilter !== 'none') params.actorType = actorTypeFilter;
    if (targetTypeFilter && targetTypeFilter !== 'none') params.targetType = targetTypeFilter;
    if (targetIdFilter && targetIdFilter !== 'none') params.targetId = targetIdFilter;
    if (createdRange) {
      const [from, to] = createdRange.split(' to ');
      if (from) params.createdFrom = from;
      if (to) params.createdTo = to;
    }
    fetchLogs(params);
  }, [fetchLogs, page, limit, actionFilter, actorTypeFilter, targetTypeFilter, targetIdFilter, createdRange]);

  // Dynamically include any additional actions found in fetched logs
  const actionOptions = useMemo(() => {
    const knownValues = new Set(KNOWN_ACTIONS.map(a => a.value));
    const extra: { value: string; label: string }[] = [];
    logs.forEach((log: any) => {
      if (log.action && !knownValues.has(log.action)) {
        knownValues.add(log.action);
        extra.push({ value: log.action, label: log.action });
      }
    });
    return [...KNOWN_ACTIONS, ...extra];
  }, [logs]);

  // Dynamically include any additional target types found in fetched logs
  const targetTypeOptions = useMemo(() => {
    const knownValues = new Set(KNOWN_TARGET_TYPES.map(t => t.value));
    const extra: { value: string; label: string }[] = [];
    logs.forEach((log: any) => {
      if (log.targetType && !knownValues.has(log.targetType)) {
        knownValues.add(log.targetType);
        extra.push({ value: log.targetType, label: log.targetType });
      }
    });
    return [...KNOWN_TARGET_TYPES, ...extra];
  }, [logs]);

  // Distinct targets found in current logs for easy quick-filter
  const targetIdOptions = useMemo(() => {
    const map = new Map<string, string>();
    logs.forEach((log: any) => {
      if (log.targetId) {
        const desc = log.target?.fullName || log.target?.email || log.target?.name || `${log.targetType || 'Target'}: ${log.targetId.slice(0, 10)}...`;
        map.set(log.targetId, desc);
      }
    });
    return Array.from(map.entries()).map(([id, label]) => ({ value: id, label }));
  }, [logs]);

  const resetFilters = () => {
    setActionFilter('');
    setActorTypeFilter('');
    setTargetTypeFilter('');
    setTargetIdFilter('');
    setCreatedRange('');
    setPage(1);
  };

  const hasActiveFilters = Boolean(
    (actionFilter && actionFilter !== 'none') ||
    (actorTypeFilter && actorTypeFilter !== 'none') ||
    (targetTypeFilter && targetTypeFilter !== 'none') ||
    (targetIdFilter && targetIdFilter !== 'none') ||
    createdRange
  );

  const formatActionDisplay = (action: string) => {
    if (!action) return '—';
    // If it's an HTTP format: "METHOD /path (status)"
    const match = action.match(/^(GET|POST|PUT|PATCH|DELETE)\s+([^\s]+)(\s+\(\d+\))?$/);
    if (match) {
      const method = match[1];
      const path = match[2];
      const status = match[3] || '';
      const methodColors: Record<string, string> = {
        GET: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
        POST: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
        PUT: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
        PATCH: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300',
        DELETE: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300',
      };
      return (
        <div className="flex flex-col items-start gap-1">
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${methodColors[method] || 'bg-muted text-muted-foreground'}`}>
              {method}
            </span>
            <span className="font-semibold text-foreground truncate max-w-[280px]" title={path}>
              {path}
            </span>
            {status && <span className="text-[11px] text-muted-foreground">{status}</span>}
          </div>
        </div>
      );
    }

    const matchedKnown = KNOWN_ACTIONS.find(k => k.value === action);
    return (
      <div className="flex flex-col items-start">
        <span className="font-medium text-foreground">{matchedKnown?.label || action}</span>
        {matchedKnown && (
          <span className="font-mono text-[11px] text-muted-foreground">{action}</span>
        )}
      </div>
    );
  };

  return (
    <main className="w-full">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold text-foreground hidden">Audit Logs</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-full text-sm font-medium transition-colors ${
              hasActiveFilters
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-[#018752] text-[#018752]'
                : 'bg-card border-border text-foreground/90 hover:bg-muted/30'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-[#018752]" />
            )}
            <svg className={`w-4 h-4 transition-transform ${showFilter ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      <div className="mb-6 space-y-4">
        {showFilter && (
          <div className="bg-card p-6 rounded-2xl border border-border/50 animate-in fade-in slide-in-from-top-2 duration-200 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {/* ACTION DROPDOWN WITH SEARCH */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Action
                </label>
                <Select value={actionFilter || 'none'} onValueChange={setActionFilter}>
                  <SelectTrigger className="w-full bg-card">
                    <SelectValue placeholder="All Actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">All Actions</SelectItem>
                    {actionOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* ACTOR TYPE DROPDOWN */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Actor Type
                </label>
                <Select value={actorTypeFilter || 'none'} onValueChange={setActorTypeFilter}>
                  <SelectTrigger className="w-full bg-card">
                    <SelectValue placeholder="All Actor Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">All Actor Types</SelectItem>
                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                    <SelectItem value="AGENT">AGENT</SelectItem>
                    <SelectItem value="CLIENT">CLIENT</SelectItem>
                    <SelectItem value="SYSTEM">SYSTEM</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* TARGET TYPE DROPDOWN WITH SEARCH */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Target Type
                </label>
                <Select value={targetTypeFilter || 'none'} onValueChange={setTargetTypeFilter}>
                  <SelectTrigger className="w-full bg-card">
                    <SelectValue placeholder="All Target Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">All Target Types</SelectItem>
                    {targetTypeOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* TARGET ID DROPDOWN / SEARCH */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Target ID / Entity
                </label>
                {targetIdOptions.length > 0 ? (
                  <Select value={targetIdFilter || 'none'} onValueChange={setTargetIdFilter}>
                    <SelectTrigger className="w-full bg-card">
                      <SelectValue placeholder="All Targets" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">All Targets</SelectItem>
                      {targetIdOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <input
                    type="text"
                    placeholder="Search by Target ID..."
                    value={targetIdFilter === 'none' ? '' : targetIdFilter}
                    onChange={e => setTargetIdFilter(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-sm bg-card border-input outline-none focus:ring-2 focus:ring-[#018752]/20 focus:border-[#018752]"
                  />
                )}
              </div>

              {/* DATE CREATED RANGE PICKER */}
              <div className="space-y-1.5 relative">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Date Created
                </label>
                <CustomDateRangePicker
                  value={createdRange}
                  onChange={setCreatedRange}
                  placeholder="Pick a date range"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {loading && <PulseLoader />}
      {!loading && error && <div className="text-red-500 py-12 text-center">{error}</div>}

      {!loading && !error && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-[#E9F4EE] dark:bg-emerald-950/20">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                    Actor
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                    Target
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8">
                      <div className="flex justify-center w-full">
                        <EmptyState title="No audit logs found." />
                      </div>
                    </td>
                  </tr>
                ) : (
                  logs.map((log: any) => {
                    const actorName = log.actor?.fullName || log.actor?.email;
                    const targetName = log.target?.fullName || log.target?.email || log.target?.name || log.metadata?.email;
                    const hasTarget = Boolean(log.targetType || log.targetId || targetName);

                    return (
                      <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-4 whitespace-nowrap text-xs text-foreground font-mono">
                          {new Date(log.createdAt).toLocaleString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </td>
                        <td className="px-5 py-4 text-sm text-foreground">
                          {formatActionDisplay(log.action)}
                        </td>
                        <td className="px-5 py-4 text-sm text-muted-foreground whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            {log.actorType && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-muted/60 text-foreground">
                                {log.actorType}
                              </span>
                            )}
                            <span className="font-medium text-foreground text-xs">
                              {actorName || (log.actorId ? `${log.actorId.slice(0, 8)}...` : '—')}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-muted-foreground">
                          {!hasTarget ? (
                            <span className="text-muted-foreground/50">—</span>
                          ) : (
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-1.5">
                                {log.targetType && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#E8F5EE] text-[#018752] dark:bg-emerald-950/40 dark:text-emerald-300">
                                    {log.targetType}
                                  </span>
                                )}
                                {targetName && (
                                  <span className="font-medium text-foreground text-xs truncate max-w-[200px]" title={targetName}>
                                    {targetName}
                                  </span>
                                )}
                              </div>
                              {log.targetId && !targetName && (
                                <span className="font-mono text-[11px] text-muted-foreground truncate max-w-[220px]" title={log.targetId}>
                                  {log.targetId}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {meta && logs.length > 0 && (
            <div className="border-t border-border/50 py-4 px-4">
              <Pagination
                totalItems={meta.total || 0}
                currentPage={page || 1}
                itemsPerPage={limit || 25}
                onPageChange={setPage}
                onItemsPerPageChange={setLimit}
              />
            </div>
          )}
        </div>
      )}
    </main>
  );
}
