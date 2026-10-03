"use client";

import { useEffect } from 'react';
import { useIppis } from '@/app/composables/modules/useIppis';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';

export default function IppisPage() {
 const { loading, error, batches, fetchBatches } = useIppis();

 useEffect(() => {
  fetchBatches();
 }, [fetchBatches]);

 return (
  <main className="w-full">
   <div className="flex justify-between items-center mb-3">
    <h1 className="text-2xl font-semibold text-foreground">IPPIS Documents</h1>
    <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium">
     Upload Document
    </button>
   </div>

   {loading && <PulseLoader />}
   {!loading && error && <div className="text-red-500 py-12 text-center">{error}</div>}
   
   {!loading && !error && (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
     <div className="overflow-x-auto">
<table className="min-w-full divide-y divide-slate-200">
      <thead className="bg-[#E9F4EE] dark:bg-emerald-950/20">
         <tr>
        <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Date Created</th>
        <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Type</th>
        <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Status</th>
        <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Date</th>
       </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
       {batches.map((batch: any) => (
        <tr key={batch.id} className="hover:bg-muted/30 transition-colors">
         <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground font-mono">{new Date(batch.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
         <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground font-medium">{batch.documentType}</td>
         <td className="px-4 py-4 whitespace-nowrap text-sm">
          <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${batch.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
           {batch.status}
          </span>
         </td>
         <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">{new Date(batch.createdAt).toLocaleDateString()}</td>
        </tr>
       ))}
       {batches.length === 0 && (
        <tr>
         <td colSpan={4} className="p-8 text-center text-muted-foreground/70">No document batches found.</td>
        </tr>
       )}
      </tbody>
     </table>
</div>
    </div>
   )}
  </main>
 );
}
