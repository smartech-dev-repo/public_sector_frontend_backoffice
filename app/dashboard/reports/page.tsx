"use client";

import { useState, useMemo, useEffect } from 'react';
import ReconciliationTab from './components/ReconciliationTab';
import AuditLogsTab from './components/AuditLogsTab';
import AnalyticsTab from './components/AnalyticsTab';
import { usePermissions } from '@/app/composables/usePermissions';

export default function SystemReportsPage() {
  const { hasPermission } = usePermissions();

  const allTabs = useMemo(() => [
    { id: 'analytics' as const, label: 'Analytics Dashboard', perms: ['clients:analytics:read', 'agents:analytics:read'] },
    { id: 'reconciliation' as const, label: 'Finance Reconciliation', perms: ['reconciliation:read'] },
    { id: 'audit' as const, label: 'Audit Trail Logs', perms: ['audit:read'] },
  ], []);

  const availableTabs = useMemo(() => {
    return allTabs.filter(tab => hasPermission(tab.perms));
  }, [allTabs, hasPermission]);

  const [activeTab, setActiveTab] = useState<'analytics' | 'reconciliation' | 'audit' | ''>(() => {
    return availableTabs[0]?.id || 'analytics';
  });

  useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.some(t => t.id === activeTab)) {
      setActiveTab(availableTabs[0].id);
    }
  }, [availableTabs, activeTab]);

  if (availableTabs.length === 0) {
    return (
      <div className="p-8 text-center bg-card rounded-2xl border border-border">
        <p className="text-muted-foreground text-sm">No report sections available for your permissions.</p>
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
                whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm transition-colors
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
        {activeTab === 'analytics' && <AnalyticsTab />}
        {activeTab === 'reconciliation' && <ReconciliationTab />}
        {activeTab === 'audit' && <AuditLogsTab />}
      </div>
    </div>
  );
}
