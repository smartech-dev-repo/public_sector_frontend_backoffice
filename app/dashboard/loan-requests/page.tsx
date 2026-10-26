"use client";

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import RequestsTab from './components/RequestsTab';
import ClientLoansTab from './components/ClientLoansTab';
import DisbursementSummaryTab from './components/DisbursementSummaryTab';
import PulseLoader from '@/app/components/ui/PulseLoader';
import { useAdminPermissions } from '@/app/composables/useAdminPermissions';

type TabId = 'requests' | 'client-loans' | 'disbursement';

function LoanRequestPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get('tab') as TabId | null;
  const { hasPermission, hasAnyPermission, isSuperAdmin } = useAdminPermissions();

  const tabs = useMemo(() => {
    const allTabs: { id: TabId; label: string; visible: boolean }[] = [
      { 
        id: 'requests', 
        label: 'Loan Requests', 
        visible: isSuperAdmin || hasPermission('loan-requests:review') 
      },
      { 
        id: 'client-loans', 
        label: 'Client Loans', 
        visible: isSuperAdmin || hasAnyPermission(['client-loans:read', 'clients:read']) 
      },
      { 
        id: 'disbursement', 
        label: 'Disbursement Summary', 
        visible: isSuperAdmin || hasAnyPermission(['loan-requests:review', 'client-loans:read']) 
      },
    ];
    return allTabs.filter(t => t.visible);
  }, [hasPermission, hasAnyPermission, isSuperAdmin]);

  const [activeTab, setActiveTab] = useState<TabId>(() => {
    if (tabParam && tabs.some(t => t.id === tabParam)) {
      return tabParam;
    }
    return tabs[0]?.id || 'requests';
  });

  useEffect(() => {
    if (tabParam && tabs.some(t => t.id === tabParam)) {
      setActiveTab(tabParam);
    } else if (tabs.length > 0 && !tabs.some(t => t.id === activeTab)) {
      setActiveTab(tabs[0].id);
    }
  }, [tabParam, tabs, activeTab]);

  const handleTabChange = (newTab: TabId) => {
    setActiveTab(newTab);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', newTab);
    router.replace(`/dashboard/loan-requests?${params.toString()}`, { scroll: false });
  };

  if (tabs.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border p-12 text-center max-w-lg mx-auto mt-8">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto mb-4 font-bold text-xl">!</div>
        <h3 className="text-lg font-semibold text-foreground mb-1">Access Restricted</h3>
        <p className="text-sm text-muted-foreground">You do not have permission to view or review loan requests or client loans.</p>
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
