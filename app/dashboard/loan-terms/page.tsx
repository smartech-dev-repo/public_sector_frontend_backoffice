"use client";

import { useState, useEffect } from 'react';
import ConfigurationsTab from './components/ConfigurationsTab';
import LoansCatalogTab from './components/LoansCatalogTab';
import EmptyState from '@/app/components/ui/EmptyState';
import { useAdminPermissions } from '@/app/composables/useAdminPermissions';

export default function LoanProductsPage() {
 const { isSuperAdmin, hasPermission } = useAdminPermissions();
 const canAccessConfigs = isSuperAdmin || hasPermission('loan-products:manage') || hasPermission('loan-settings:manage');
 const canAccessCatalog = isSuperAdmin || hasPermission('loans:upload');

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
    {activeTab === 'configs' && canAccessConfigs && <ConfigurationsTab />}
    {activeTab === 'catalog' && canAccessCatalog && <LoansCatalogTab />}
   </div>
  </div>
 );
}
