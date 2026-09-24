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
    <main className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">IPPIS Documents</h1>
        <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium">
          Upload Document
        </button>
      </div>

      {loading && <PulseLoader />}
      {!loading && error && <div className="text-red-500 py-12 text-center">{error}</div>}
      
      {!loading && !error && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
<table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-[#E9F4EE]">
                  <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {batches.map((batch: any) => (
                <tr key={batch.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-mono">{batch.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-medium">{batch.documentType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${batch.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {batch.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{new Date(batch.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {batches.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">No document batches found.</td>
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
