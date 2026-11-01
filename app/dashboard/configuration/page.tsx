"use client";

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import EmptyState from '@/app/components/ui/EmptyState';
import { useAdminPermissions } from '@/app/composables/useAdminPermissions';
import LoanSettingsTab from './components/LoanSettingsTab';
import ManagementFeesTab from './components/ManagementFeesTab';

type TabId = 'loan-settings' | 'fees';

function ConfigurationTabs() {
 const { isSuperAdmin, hasPermission } = useAdminPermissions();
 const requested = useSearchParams().get('tab');
 const [chosen, setChosen] = useState<TabId | null>(null);

 const tabs: { id: TabId; label: string }[] = [
  ...(isSuperAdmin || hasPermission('loan-settings:manage') ? [{ id: 'loan-settings' as const, label: 'Loan Settings' }] : []),
  ...(isSuperAdmin || hasPermission('management-fees:manage') ? [{ id: 'fees' as const, label: 'Management Fees' }] : []),
 ];

 if (tabs.length === 0) {
  return <EmptyState title="Access Restricted" description="You do not have permission to view these configurations." />;
 }

 const activeTab = tabs.find((tab) => tab.id === (chosen ?? requested))?.id ?? tabs[0].id;

 return (
  <div className="space-y-3">
   <div className="border-b border-border">
    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
     {tabs.map((tab) => (
      <button
       key={tab.id}
       onClick={() => setChosen(tab.id)}
       aria-current={activeTab === tab.id ? 'page' : undefined}
       className={`whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm transition-colors ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`}
      >
       {tab.label}
      </button>
     ))}
    </nav>
   </div>
   <div className="pt-1">
    {activeTab === 'loan-settings' && <LoanSettingsTab />}
    {activeTab === 'fees' && <ManagementFeesTab />}
   </div>
  </div>
 );
}

export default function ConfigurationPage() {
 return (
  <Suspense>
   <ConfigurationTabs />
  </Suspense>
 );
}
