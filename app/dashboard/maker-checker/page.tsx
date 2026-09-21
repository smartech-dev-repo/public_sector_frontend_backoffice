"use client";

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAgents } from '@/app/composables/modules/useAgents';

export default function MakerCheckerPage() {
  const { loading, error, agents, fetchAgents } = useAgents();

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const pendingCount = useMemo(() => agents.filter((a: any) => a.status === 'PENDING').length, [agents]);
  const approvedCount = useMemo(() => agents.filter((a: any) => a.status === 'APPROVED').length, [agents]);

  const statusClass = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-100 text-amber-700';
      case 'APPROVED': return 'bg-emerald-100 text-emerald-700';
      case 'REJECTED': return 'bg-rose-100 text-rose-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="py-20 text-center text-slate-500">
          Loading agents...
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-semibold text-slate-800">Agent Applications</h1>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <div className="text-sm text-slate-500 uppercase tracking-wider mb-2">Pending Review</div>
              <div className="text-3xl text-slate-800">{pendingCount}</div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <div className="text-sm text-slate-500 uppercase tracking-wider mb-2">Approved</div>
              <div className="text-3xl text-emerald-600">{approvedCount}</div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <div className="text-sm text-slate-500 uppercase tracking-wider mb-2">Total Agents</div>
              <div className="text-3xl text-emerald-600">{agents.length}</div>
            </div>
          </div>
          
          {/* Queue Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th scope="col" className="px-6 py-4 tracking-wider">Application Ref (ID)</th>
                    <th scope="col" className="px-6 py-4 tracking-wider">Applicant Name</th>
                    <th scope="col" className="px-6 py-4 tracking-wider">Date Submitted</th>
                    <th scope="col" className="px-6 py-4 tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-4 tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {agents.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No applications found.</td>
                    </tr>
                  )}
                  {agents.map((app: any) => (
                    <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-slate-600">{app.id}</td>
                      <td className="px-6 py-4 font-medium text-slate-800">{app.firstName} {app.lastName}</td>
                      <td className="px-6 py-4 text-slate-600">{new Date(app.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap ${statusClass(app.status)}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/dashboard/agent/${app.id}`} className="text-emerald-600 hover:text-emerald-800 font-medium">
                          Review Application
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
