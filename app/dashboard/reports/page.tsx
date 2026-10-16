"use client";

import { useState } from 'react';
import ReconciliationTab from './components/ReconciliationTab';
import AuditLogsTab from './components/AuditLogsTab';
import AnalyticsTab from './components/AnalyticsTab';

export default function SystemReportsPage() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'reconciliation' | 'audit'>('analytics');

  const tabs = [
    { id: 'analytics', label: 'Analytics Dashboard' },
    { id: 'reconciliation', label: 'Finance Reconciliation' },
    { id: 'audit', label: 'Audit Trail Logs' },
  ] as const;

  return (
    <div className="space-y-4">
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
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
