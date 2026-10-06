"use client";

import { useState } from 'react';
import GeneralReportsTab from './components/GeneralReportsTab';
import ReconciliationTab from './components/ReconciliationTab';
import AuditLogsTab from './components/AuditLogsTab';
import AnalyticsTab from './components/AnalyticsTab';

export default function SystemReportsPage() {
 const [activeTab, setActiveTab] = useState<'analytics' | 'reports' | 'reconciliation' | 'audit'>('analytics');

 const tabs = [
  { id: 'analytics', label: 'Analytics Dashboard' },
  { id: 'reports', label: 'General Reports' },
  { id: 'reconciliation', label: 'Finance Reconciliation' },
  { id: 'audit', label: 'Audit Trail Logs' },
 ] as const;

 return (
  <div className="space-y-3">
   

   <div className="border-b border-border">
    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
     {tabs.map((tab) => (
      <button
       key={tab.id}
       onClick={() => setActiveTab(tab.id)}
       className={`
        whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm transition-colors
        ${activeTab === tab.id
         ? 'border-primary text-primary'
         : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
        }
       `}
      >
       {tab.label}
      </button>
     ))}
    </nav>
   </div>

   <div className="pt-1">
    {activeTab === 'analytics' && <AnalyticsTab />}
    {activeTab === 'reports' && <GeneralReportsTab />}
    {activeTab === 'reconciliation' && <ReconciliationTab />}
    {activeTab === 'audit' && <AuditLogsTab />}
   </div>
  </div>
 );
}
