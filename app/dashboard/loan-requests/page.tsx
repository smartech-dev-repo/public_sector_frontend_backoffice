"use client";

import { useState, Suspense } from 'react';
import RequestsTab from './components/RequestsTab';
import ClientLoansTab from './components/ClientLoansTab';
import MakerCheckerTab from './components/MakerCheckerTab';
import DisbursementSummaryTab from './components/DisbursementSummaryTab';
import PulseLoader from '@/app/components/ui/PulseLoader';

export default function LoanRequestPage() {
 const [activeTab, setActiveTab] = useState<'requests' | 'client-loans' | 'maker-checker' | 'disbursement'>('requests');

 const tabs = [
  { id: 'requests', label: 'Loan Requests' },
  { id: 'client-loans', label: 'Client Loans' },
  { id: 'maker-checker', label: 'Maker/Checker Queue' },
  { id: 'disbursement', label: 'Disbursement Summary' },
 ] as const;

 return (
  <div className="space-y-3">
   

   <div className="border-b border-border">
    <nav className="-mb-px flex space-x-8" aria-label="Tabs" style={{ overflowX: 'auto' }}>
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
