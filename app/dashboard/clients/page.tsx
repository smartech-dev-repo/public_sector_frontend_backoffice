"use client";

import { useState } from 'react';
import CustomerProfilesTab from './components/CustomerProfilesTab';
import ClientOnboardingModal from './components/ClientOnboardingModal';
import IppisRecordsTab from './components/IppisRecordsTab';

export default function CustomerManagementPage() {
 const [activeTab, setActiveTab] = useState<'profiles' | 'ippis'>('profiles');
 const [onboardingOpen, setOnboardingOpen] = useState(false);

 const tabs = [
  { id: 'profiles', label: 'Customer Profiles' },
  { id: 'ippis', label: 'IPPIS Records' },
 ] as const;

 return (
  <div className="space-y-3">
   

   <div className="border-b border-border flex justify-between items-center pr-4">
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
    <button 
      onClick={() => setOnboardingOpen(true)}
      className="px-4 py-2 bg-[#0F7642] text-white text-sm font-medium rounded-lg hover:bg-[#0F7642]/90 transition-colors"
    >
      + Onboard Client
    </button>
   </div>
   <ClientOnboardingModal open={onboardingOpen} onOpenChange={setOnboardingOpen} />

   <div className="pt-1">
    {activeTab === 'profiles' && <CustomerProfilesTab />}
    {activeTab === 'ippis' && <IppisRecordsTab />}
   </div>
  </div>
 );
}
