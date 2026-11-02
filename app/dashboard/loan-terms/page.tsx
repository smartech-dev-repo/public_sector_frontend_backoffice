"use client";

import TabCount from '@/app/components/ui/TabCount';
import { useListTotals } from '@/app/composables/useListTotals';
import { loans_api } from '@/app/api_factory/modules/loans';
import { useState, useEffect } from 'react';
import ConfigurationsTab from './components/ConfigurationsTab';
import LoansCatalogTab from './components/LoansCatalogTab';
import EmptyState from '@/app/components/ui/EmptyState';
import { useAdminPermissions } from '@/app/composables/useAdminPermissions';

export default function LoanProductsPage() {
 const { isSuperAdmin, hasPermission } = useAdminPermissions();
 const canAccessConfigs = isSuperAdmin || hasPermission('loan-products:manage');
 const canAccessCatalog = isSuperAdmin || hasPermission('loans:upload');

 const totals = useListTotals({
  configs: canAccessConfigs ? () => loans_api.getLoanProducts({ limit: 1 }) : null,
  catalog: canAccessCatalog ? () => loans_api.getLoans({ limit: 1 }) : null,
 });

 const tabs = [
  ...(canAccessConfigs ? [{ id: 'configs' as const, label: 'Loan Products' }] : []),
  ...(canAccessCatalog ? [{ id: 'catalog' as const, label: 'Loans Catalog' }] : []),
 ];

 const [activeTab, setActiveTab] = useState<'configs' | 'catalog'>('configs');

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
     description="You do not have permission to view Loan Products or Loans Catalog."
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
       <TabCount count={totals[tab.id]} active={activeTab === tab.id} />
      </button>
     ))}
    </nav>
   </div>

   <div className="pt-1">
    {activeTab === 'configs' && canAccessConfigs && <ConfigurationsTab />}
    {activeTab === 'catalog' && canAccessCatalog && <LoansCatalogTab />}
   </div>
  </div>
 );
}
