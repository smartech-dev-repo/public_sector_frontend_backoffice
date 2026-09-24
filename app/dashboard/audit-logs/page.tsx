"use client";

import { useEffect } from 'react';
import { useAuditLogs } from '@/app/composables/modules/useAuditLogs';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';

export default function AuditLogsPage() {
  const { loading, error, logs, fetchLogs } = useAuditLogs();

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <main className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Audit Logs</h1>
      </div>

      {loading && <PulseLoader />}
      {!loading && error && <div className="text-red-500 py-12 text-center">{error}</div>}
      
      {!loading && !error && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
<table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-[#E9F4EE]">
                  <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">Action</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">Actor</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log: any) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-medium">{log.action}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{log.actorType} ({log.actorId})</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{log.targetType} ({log.targetId})</td>
                </tr>
              ))}
            </tbody>
          </table>
</div>
          {logs.length === 0 && <EmptyState title="No audit logs found." />}
        </div>
      )}
    </main>
  );
}
