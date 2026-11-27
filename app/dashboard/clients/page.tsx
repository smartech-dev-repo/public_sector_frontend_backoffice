"use client";

import TabCount from '@/app/components/ui/TabCount';
import { TabTotalScope, useTabTotals } from '@/app/composables/useTabTotals';
import { useListTotals } from '@/app/composables/useListTotals';
import { clients_api } from '@/app/api_factory/modules/clients';
import { ippis_api } from '@/app/api_factory/modules/ippis';
import { useState, Suspense, useEffect } from 'react';
import CustomerProfilesTab from './components/CustomerProfilesTab';
import ClientOnboardingModal from './components/ClientOnboardingModal';
import IppisRecordsTab from './components/IppisRecordsTab';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import { useAdminPermissions } from '@/app/composables/useAdminPermissions';

export default function CustomerManagementPage() {
  const { isSuperAdmin, hasPermission } = useAdminPermissions();
  const canReadProfiles = isSuperAdmin || hasPermission('clients:review') || hasPermission('clients:analytics:read');
  const canUploadIppis = isSuperAdmin || hasPermission('ippis:upload');
  const canOnboard = isSuperAdmin || hasPermission('clients:onboard');
  // The client list itself (GET /admin/clients) needs clients:review; analytics-only admins see the summary.
  const canListClients = isSuperAdmin || hasPermission('clients:review');

  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<'profiles' | 'ippis'>('profiles');
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  const totals = useListTotals({
    profiles: canListClients ? () => clients_api.getClients({ limit: 1 }) : null,
    ippis: canUploadIppis ? () => ippis_api.getIppisRecords({ limit: 1 }) : null,
  });

  const tabs = [
    ...(canReadProfiles ? [{ id: 'profiles' as const, label: 'Customer Profiles' }] : []),
    ...(canUploadIppis ? [{ id: 'ippis' as const, label: 'IPPIS Records' }] : []),
  ];

  useEffect(() => {
    if (tabs.length > 0 && !tabs.some(t => t.id === activeTab)) {
      setActiveTab(tabs[0].id);
    }
  }, [tabs, activeTab]);

  // Before the early return, so React sees the same hooks on every render.
  const { shown: shownTotals, report: reportTabTotal } = useTabTotals(totals, activeTab);

  if (tabs.length === 0) {
    return (
      <div className="p-8">
        <EmptyState
          title="Access Restricted"
          description="You do not have permission to view Customer Profiles or IPPIS Records."
        />
      </div>
    );
  }


  return (
    <div className="space-y-3">
      <div className="border-b border-border">
        <nav className="-mb-px flex gap-4 sm:gap-8 overflow-x-auto overflow-y-hidden [scrollbar-width:none]" aria-label="Tabs">
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
              <TabCount count={shownTotals[tab.id]} active={activeTab === tab.id} />
            </button>
          ))}
        </nav>
      </div>

      {canOnboard && (
        <ClientOnboardingModal 
          open={onboardingOpen} 
          onOpenChange={setOnboardingOpen}
          onSuccess={() => setRefreshKey((prev) => prev + 1)}
        />
      )}

      <TabTotalScope value={reportTabTotal}>
      <div className="pt-1">
        {activeTab === 'profiles' && canReadProfiles && (
          <Suspense fallback={<PulseLoader />}>
            <CustomerProfilesTab key={refreshKey} onOpenOnboard={() => setOnboardingOpen(true)} />
          </Suspense>
        )}
        {activeTab === 'ippis' && canUploadIppis && <IppisRecordsTab />}
      </div>
      </TabTotalScope>
    </div>
  );
}
