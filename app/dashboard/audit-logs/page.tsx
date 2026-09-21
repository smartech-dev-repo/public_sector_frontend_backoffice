"use client";

import { useEffect } from 'react';
import { useAuditLogs } from '@/app/composables/modules/useAuditLogs';

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

      {loading && <div className="text-slate-500 py-12 text-center">Loading audit logs...</div>}
      {!loading && error && <div className="text-red-500 py-12 text-center">{error}</div>}
      
      {!loading && !error && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Target</th>
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
          {logs.length === 0 && (
            <div className="p-8 text-center text-slate-400">No audit logs found.</div>
          )}
        </div>
      )}
    </main>
  );
}
