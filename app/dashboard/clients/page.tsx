"use client";

import { useState, Suspense } from 'react';
import CustomerProfilesTab from './components/CustomerProfilesTab';
import ClientOnboardingModal from './components/ClientOnboardingModal';
import IppisRecordsTab from './components/IppisRecordsTab';
import PulseLoader from '@/app/components/ui/PulseLoader';

import { usePermissions, Permission } from '@/app/composables/usePermissions';

export default function CustomerManagementPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const { hasPermission } = usePermissions();

  const allTabs: { id: 'profiles' | 'ippis'; label: string; permissions: Permission[] }[] = [
    { id: 'profiles', label: 'Customer Profiles', permissions: ['clients:read', 'clients:review'] },
    { id: 'ippis', label: 'IPPIS Records', permissions: ['ippis:upload'] },
  ];

  const tabs = allTabs.filter(tab => tab.permissions.some(p => hasPermission(p)));

  const [activeTab, setActiveTab] = useState<'profiles' | 'ippis'>(() => {
    return 'profiles';
  });

  if (tabs.length > 0 && !tabs.some(t => t.id === activeTab) && activeTab !== tabs[0].id) {
    setActiveTab(tabs[0].id);
  }

  if (tabs.length === 0) {
    return (
      <div className="p-8 text-center bg-card rounded-2xl border border-border">
        <p className="text-sm font-medium text-muted-foreground">You do not have permission to view customer profiles or IPPIS records.</p>
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
    <ClientOnboardingModal 
      open={onboardingOpen} 
      onOpenChange={setOnboardingOpen}
      onSuccess={() => setRefreshKey((prev) => prev + 1)}
    />

    <div className="pt-1">
     {activeTab === 'profiles' && (
       <Suspense fallback={<PulseLoader />}>
         <CustomerProfilesTab key={refreshKey} onOpenOnboard={() => setOnboardingOpen(true)} />
       </Suspense>
     )}
     {activeTab === 'ippis' && <IppisRecordsTab />}
    </div>
   </div>
  );
}
