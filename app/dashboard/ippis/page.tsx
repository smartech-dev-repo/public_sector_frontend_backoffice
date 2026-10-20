"use client";

import { useEffect } from 'react';
import { useIppis } from '@/app/composables/modules/useIppis';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';

import { useAdminPermissions } from '@/app/composables/useAdminPermissions';

export default function IppisPage() {
 const { isSuperAdmin, hasPermission } = useAdminPermissions();
 const canUploadIppis = isSuperAdmin || hasPermission('ippis:upload');
 const canReadDocs = isSuperAdmin || hasPermission('documents:read');
 const { loading, error, batches, fetchBatches } = useIppis();

 useEffect(() => {
  if (canReadDocs) {
   fetchBatches();
  }
 }, [fetchBatches, canReadDocs]);

 const getStatusBadgeClass = (status: string) => {
  switch ((status || '').toUpperCase()) {
   case 'COMPLETED':
    return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60';
   case 'PROCESSING':
    return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60';
   case 'FAILED':
    return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60';
   default:
    return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60';
  }
 };

 if (!canUploadIppis && !canReadDocs) {
  return (
   <div className="p-8">
    <EmptyState
     title="Access Restricted"
     description="You do not have permission to upload or view IPPIS documents."
    />
   </div>
  );
 }

 return (
  <main className="w-full">
   {canUploadIppis && (
    <div className="flex justify-end items-center mb-3">
     <h1 className="sr-only">IPPIS Documents</h1>
     <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium">
      Upload Document
     </button>
    </div>
   )}

   {loading && <PulseLoader />}
   {!loading && error && canReadDocs && <div className="text-red-500 py-12 text-center">{error}</div>}
   
   {!loading && !error && canReadDocs && (
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
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full font-semibold ${getStatusBadgeClass(batch.status)}`}>
           <span className={`w-1.5 h-1.5 rounded-full ${
            batch.status === 'COMPLETED' ? 'bg-emerald-500' :
            batch.status === 'PROCESSING' ? 'bg-blue-500' :
            batch.status === 'FAILED' ? 'bg-rose-500' : 'bg-amber-500'
           }`} />
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
