"use client";

import { useEffect, useState } from 'react';
import { useLoans } from '@/app/composables/modules/useLoans';
import { useToast } from '@/app/composables/useToast';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import { MonthPicker } from '@/app/components/ui/MonthPicker';
import { GATEWAY_ENDPOINT_WITH_AUTH } from '@/app/api_factory/axios.config';

export default function DisbursementSummaryTab() {
 const { loading, error, disbursementSummary, fetchDisbursementSummary } = useLoans();
 const { addToast } = useToast();

 const [month, setMonth] = useState(() => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
 });

 useEffect(() => {
  if (month) {
   fetchDisbursementSummary({ month });
  }
 }, [fetchDisbursementSummary, month]);

 const handleExportCSV = async () => {
  if (!month) return;
  try {
   const res = await GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/client-loans/disbursement-summary', {
    params: { month },
    headers: { Accept: 'text/csv' },
    responseType: 'blob'
   });
   const url = window.URL.createObjectURL(new Blob([res.data as any]));
   const link = document.createElement('a');
   link.href = url;
   link.setAttribute('download', `disbursement-summary-${month}.csv`);
   document.body.appendChild(link);
   link.click();
   link.remove();
   addToast('Exported CSV successfully', 'success');
  } catch (e: any) {
   addToast(e?.response?.data?.message || 'Failed to export CSV', 'error');
  }
 };

 return (
  <main className="w-full">
   <div className="flex justify-between items-center mb-3">
    <h1 className="text-2xl font-semibold text-foreground hidden">Disbursement Summary</h1>
    <div className="flex items-center gap-3">
     <MonthPicker 
      value={month} 
      onChange={(val) => setMonth(val)} 
      className="w-48"
     />
     <button 
      onClick={handleExportCSV}
      className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition-colors whitespace-nowrap"
     >
      Export CSV
     </button>
    </div>
   </div>

   {loading && <PulseLoader />}
   {!loading && error && <div className="text-red-500 py-12 text-center">{error}</div>}
   
   {!loading && !error && disbursementSummary && (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
     <div className="bg-card p-6 rounded-2xl border border-border">
      <p className="text-sm font-medium text-muted-foreground mb-1">Total Disbursed</p>
      <p className="text-3xl font-bold text-foreground">₦{disbursementSummary.totalAmount?.toLocaleString() || 0}</p>
     </div>
     <div className="bg-card p-6 rounded-2xl border border-border">
      <p className="text-sm font-medium text-muted-foreground mb-1">Total Loans</p>
      <p className="text-3xl font-bold text-foreground">{disbursementSummary.totalCount || 0}</p>
     </div>
    </div>
   )}

   {!loading && !error && (!disbursementSummary || disbursementSummary.totalCount === 0) && (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
     <EmptyState title="No disbursement data for this month." />
    </div>
   )}
  </main>
 );
}
