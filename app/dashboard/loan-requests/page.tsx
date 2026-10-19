"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import RequestsTab from './components/RequestsTab';
import ClientLoansTab from './components/ClientLoansTab';
import MakerCheckerTab from './components/MakerCheckerTab';
import DisbursementSummaryTab from './components/DisbursementSummaryTab';
import PulseLoader from '@/app/components/ui/PulseLoader';

import { usePermissions, Permission } from '@/app/composables/usePermissions';

type TabId = 'requests' | 'client-loans' | 'maker-checker' | 'disbursement';

function LoanRequestPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get('tab') as TabId | null;
  const { hasPermission } = usePermissions();

  const allTabs: { id: TabId; label: string; permissions: Permission[] }[] = [
    { id: 'requests', label: 'Loan Requests', permissions: ['loan-requests:review'] },
    { id: 'client-loans', label: 'Client Loans', permissions: ['client-loans:read'] },
    { id: 'maker-checker', label: 'Maker/Checker Queue', permissions: ['loan-requests:review'] },
    { id: 'disbursement', label: 'Disbursement Summary', permissions: ['loan-requests:review', 'client-loans:read'] },
  ];

  const tabs = allTabs.filter(tab => tab.permissions.some(p => hasPermission(p)));

  const [activeTab, setActiveTab] = useState<TabId>(() => {
    if (tabParam && ['requests', 'client-loans', 'maker-checker', 'disbursement'].includes(tabParam)) {
      return tabParam;
    }
    return 'requests';
  });

  useEffect(() => {
    if (tabs.length > 0 && !tabs.some(t => t.id === activeTab)) {
      setActiveTab(tabs[0].id);
    }
  }, [tabs, activeTab]);

  useEffect(() => {
    if (tabParam && ['requests', 'client-loans', 'maker-checker', 'disbursement'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (newTab: TabId) => {
    setActiveTab(newTab);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', newTab);
    router.replace(`/dashboard/loan-requests?${params.toString()}`, { scroll: false });
  };

  if (tabs.length === 0) {
    return (
      <div className="p-8 text-center bg-card rounded-2xl border border-border">
        <p className="text-sm font-medium text-muted-foreground">You do not have permission to view any loan request sections.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs" style={{ overflowX: 'auto' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
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
        <Suspense fallback={<PulseLoader />}>
          {activeTab === 'requests' && <RequestsTab />}
          {activeTab === 'client-loans' && <ClientLoansTab />}
          {activeTab === 'maker-checker' && <MakerCheckerTab />}
          {activeTab === 'disbursement' && <DisbursementSummaryTab />}
        </Suspense>
      </div>
    </div>
  );
}

export default function LoanRequestPage() {
  return (
    <Suspense fallback={<PulseLoader />}>
      <LoanRequestPageContent />
    </Suspense>
  );
}
