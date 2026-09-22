"use client";

import { useEffect, useState } from 'react';
import { useLoans } from '@/app/composables/modules/useLoans';
import { useToast } from '@/app/composables/useToast';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';

export default function DisbursementSummaryPage() {
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

  return (
    <main className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Disbursement Summary</h1>
        <div>
          <input 
            type="month" 
            value={month} 
            onChange={(e) => setMonth(e.target.value)} 
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {loading && <PulseLoader />}
      {!loading && error && <div className="text-red-500 py-12 text-center">{error}</div>}
      
      {!loading && !error && disbursementSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <p className="text-sm font-medium text-slate-500 mb-1">Total Disbursed</p>
            <p className="text-3xl font-bold text-slate-800">₦{disbursementSummary.totalAmount?.toLocaleString() || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <p className="text-sm font-medium text-slate-500 mb-1">Total Loans</p>
            <p className="text-3xl font-bold text-slate-800">{disbursementSummary.totalCount || 0}</p>
          </div>
        </div>
      )}

      {!loading && !error && (!disbursementSummary || disbursementSummary.totalCount === 0) && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <EmptyState message="No disbursement data for this month." />
        </div>
      )}
    </main>
  );
}
