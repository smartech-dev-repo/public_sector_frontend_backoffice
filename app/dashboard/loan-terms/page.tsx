"use client";

import { useState } from 'react';
import ConfigurationsTab from './components/ConfigurationsTab';
import LoansCatalogTab from './components/LoansCatalogTab';

export default function LoanProductsPage() {
 const [activeTab, setActiveTab] = useState<'configs' | 'catalog'>('configs');

 const tabs = [
  { id: 'configs', label: 'Configurations' },
  { id: 'catalog', label: 'Loans Catalog' },
 ] as const;

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
    {activeTab === 'configs' && <ConfigurationsTab />}
    {activeTab === 'catalog' && <LoansCatalogTab />}
   </div>
  </div>
 );
}
