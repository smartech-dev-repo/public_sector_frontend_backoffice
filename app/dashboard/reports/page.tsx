"use client";

import { useState, useMemo, useEffect } from 'react';
import ReconciliationTab from './components/ReconciliationTab';
import AuditLogsTab from './components/AuditLogsTab';
import AnalyticsTab from './components/AnalyticsTab';
import { useAdminPermissions } from '@/app/composables/useAdminPermissions';
import { ShieldAlert } from 'lucide-react';

export default function SystemReportsPage() {
  const { hasPermission, hasAnyPermission, isSuperAdmin } = useAdminPermissions();

  const canAnalytics = isSuperAdmin || hasAnyPermission(['clients:analytics:read', 'agents:analytics:read']);
  const canReconciliation = isSuperAdmin || hasPermission('reconciliation:read');
  const canAudit = isSuperAdmin || hasPermission('audit:read');

  const availableTabs = useMemo(() => {
    const list: { id: 'analytics' | 'reconciliation' | 'audit'; label: string }[] = [];
    if (canAnalytics) list.push({ id: 'analytics', label: 'Analytics Dashboard' });
    if (canReconciliation) list.push({ id: 'reconciliation', label: 'Finance Reconciliation' });
    if (canAudit) list.push({ id: 'audit', label: 'Audit Trail Logs' });
    return list;
  }, [canAnalytics, canReconciliation, canAudit]);

  const [activeTab, setActiveTab] = useState<'analytics' | 'reconciliation' | 'audit'>('analytics');

  // Automatically adjust activeTab if the current one is not permitted
  useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.some(t => t.id === activeTab)) {
      setActiveTab(availableTabs[0].id);
    }
  }, [availableTabs, activeTab]);

  if (availableTabs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-card rounded-2xl border border-border mt-6">
        <ShieldAlert className="w-10 h-10 text-amber-500 mb-3" />
        <h3 className="text-lg font-semibold text-foreground">No Report Permissions</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          You do not have access to any reporting modules. Please contact an administrator if you require audit, reconciliation, or analytics access.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {availableTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm transition-colors cursor-pointer
                ${activeTab === tab.id
                  ? 'border-[#018752] text-[#018752]'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="pt-2">
        {activeTab === 'analytics' && canAnalytics && <AnalyticsTab />}
        {activeTab === 'reconciliation' && canReconciliation && <ReconciliationTab />}
        {activeTab === 'audit' && canAudit && <AuditLogsTab />}
      </div>
    </div>
  );
}
