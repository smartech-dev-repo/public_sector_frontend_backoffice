"use client";

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

  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<'profiles' | 'ippis'>('profiles');
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  const tabs = [
    ...(canReadProfiles ? [{ id: 'profiles' as const, label: 'Customer Profiles' }] : []),
    ...(canUploadIppis ? [{ id: 'ippis' as const, label: 'IPPIS Records' }] : []),
  ];

  useEffect(() => {
    if (tabs.length > 0 && !tabs.some(t => t.id === activeTab)) {
      setActiveTab(tabs[0].id);
    }
  }, [tabs, activeTab]);

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

      {canOnboard && (
        <ClientOnboardingModal 
          open={onboardingOpen} 
          onOpenChange={setOnboardingOpen}
          onSuccess={() => setRefreshKey((prev) => prev + 1)}
        />
      )}

      <div className="pt-1">
        {activeTab === 'profiles' && canReadProfiles && (
          <Suspense fallback={<PulseLoader />}>
            <CustomerProfilesTab key={refreshKey} onOpenOnboard={() => setOnboardingOpen(true)} />
          </Suspense>
        )}
        {activeTab === 'ippis' && canUploadIppis && <IppisRecordsTab />}
      </div>
    </div>
  );
}
