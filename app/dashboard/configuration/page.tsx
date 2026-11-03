"use client";

import TabCount from '@/app/components/ui/TabCount';
import { TabTotalScope, useTabTotals } from '@/app/composables/useTabTotals';
import { useListTotals } from '@/app/composables/useListTotals';
import { management_fees_api } from '@/app/api_factory/modules/managementFees';
import { alertRecipients_api } from '@/app/api_factory/modules/alertRecipients';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import EmptyState from '@/app/components/ui/EmptyState';
import { useAdminPermissions } from '@/app/composables/useAdminPermissions';
import LoanSettingsTab from './components/LoanSettingsTab';
import LoanEligibilityTab from './components/LoanEligibilityTab';
import ManagementFeesTab from './components/ManagementFeesTab';
import SecurityAlertsTab from './components/SecurityAlertsTab';
import SectorsTab from './components/SectorsTab';
import { sectors_api } from '@/app/api_factory/modules/sectors';

type TabId = 'sectors' | 'loan-settings' | 'loan-eligibility' | 'fees' | 'alerts';

function ConfigurationTabs() {
 const { isSuperAdmin, hasPermission } = useAdminPermissions();
 const requested = useSearchParams().get('tab');
 const [chosen, setChosen] = useState<TabId | null>(null);

 const totals = useListTotals({
  sectors: isSuperAdmin || hasPermission('sectors:manage') ? () => sectors_api.list() : null,
  fees: isSuperAdmin || hasPermission('management-fees:manage') ? () => management_fees_api.list({ limit: 1 }) : null,
  alerts: isSuperAdmin || hasPermission('alerts:manage') ? () => alertRecipients_api.list() : null,
 });

 const tabs: { id: TabId; label: string }[] = [
  ...(isSuperAdmin || hasPermission('sectors:manage') ? [{ id: 'sectors' as const, label: 'Sectors' }] : []),
  ...(isSuperAdmin || hasPermission('loan-settings:manage') ? [{ id: 'loan-settings' as const, label: 'Loan Settings' }] : []),
  ...(isSuperAdmin || hasPermission('loan-settings:manage') ? [{ id: 'loan-eligibility' as const, label: 'Loan Eligibility' }] : []),
  ...(isSuperAdmin || hasPermission('management-fees:manage') ? [{ id: 'fees' as const, label: 'Management Fees' }] : []),
  ...(isSuperAdmin || hasPermission('alerts:manage') ? [{ id: 'alerts' as const, label: 'Security Alerts' }] : []),
 ];

 const activeTab = tabs.find((tab) => tab.id === (chosen ?? requested))?.id ?? tabs[0]?.id ?? 'sectors';

 // Before the early return, so React sees the same hooks on every render.
 const { shown: shownTotals, report: reportTabTotal } = useTabTotals(totals, activeTab);

 if (tabs.length === 0) {
  return <EmptyState title="Access Restricted" description="You do not have permission to view these configurations." />;
 }


 return (
  <div className="space-y-3">
   <div className="border-b border-border">
    <nav className="-mb-px flex gap-4 sm:gap-8 overflow-x-auto overflow-y-hidden [scrollbar-width:none]" aria-label="Tabs">
     {tabs.map((tab) => (
      <button
       key={tab.id}
       onClick={() => setChosen(tab.id)}
       aria-current={activeTab === tab.id ? 'page' : undefined}
       className={`whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm transition-colors ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`}
      >
       {tab.label}
       <TabCount count={shownTotals[tab.id]} active={activeTab === tab.id} />
      </button>
     ))}
    </nav>
   </div>
   <TabTotalScope value={reportTabTotal}>
   <div className="pt-1">
    {activeTab === 'loan-settings' && <LoanSettingsTab />}
    {activeTab === 'loan-eligibility' && <LoanEligibilityTab />}
    {activeTab === 'sectors' && <SectorsTab />}
    {activeTab === 'fees' && <ManagementFeesTab />}
    {activeTab === 'alerts' && <SecurityAlertsTab />}
   </div>
   </TabTotalScope>
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
