"use client";

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import PulseLoader from '@/app/components/ui/PulseLoader';
import { useMockData } from '@/app/composables/modules/useMockData';
import { useToast } from '@/app/composables/useToast';

export default function DashboardOverviewPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const { adminProfile, analyticsStats, agentApplications, exceptions, auditLogs } = useMockData();
  const { addToast } = useToast();

  const pendingApps = useMemo(() => agentApplications.filter(a => a.status === 'Pending Review').length, [agentApplications]);
  const openExceptions = useMemo(() => exceptions.filter(e => e.status === 'Open').length, [exceptions]);

  const generateReport = () => {
    addToast('Generating platform report...', 'success');
    
    // Actually generate and download a CSV file
    setTimeout(() => {
      const headers = ['Metric', 'Value'];
      const rows = [
        ['Total Loans Originated', analyticsStats.totalLoansOriginated],
        ['Total Volume Disbursed', `₦${(analyticsStats.totalVolume / 1000000).toFixed(1)}M`],
        ['Pending Applications', pendingApps],
        ['Open Exceptions', openExceptions]
      ];
      
      const csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n"
        + rows.map(e => e.join(",")).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `platform_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      addToast('Report generated and downloaded successfully.', 'success');
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="py-20 space-y-6">
        <PulseLoader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-medium text-slate-800">Welcome back, {adminProfile.name.split(' ')[0]}</h2>
          <p className="text-sm text-slate-500 mt-1">Here is what is happening across the Public Sector Lending Platform today.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/dashboard/maker-checker" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors border border-emerald-200">
            Review Queue
          </Link>
          <button onClick={generateReport} className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
            Generate Report
          </button>
        </div>
      </div>

      {/* High-level KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Total Loans Originated</div>
          <div className="text-3xl font-medium text-slate-800">{analyticsStats.totalLoansOriginated.toLocaleString()}</div>
          <div className="text-sm text-emerald-600 mt-2 font-medium flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
            +14% this month
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Total Volume Disbursed</div>
          <div className="text-3xl font-medium text-slate-800">₦{(analyticsStats.totalVolume / 1000000).toFixed(1)}M</div>
          <div className="text-sm text-emerald-600 mt-2 font-medium flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
            +8.2% this month
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Pending Applications</div>
          <div className="text-3xl font-medium text-amber-600">{pendingApps}</div>
          <div className="text-sm text-amber-600 mt-2 font-medium flex items-center gap-1">
            Requires Review
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Open Exceptions</div>
          <div className="text-3xl font-medium text-rose-600">{openExceptions}</div>
          <div className="text-sm text-rose-600 mt-2 font-medium flex items-center gap-1">
            Action Required
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <h3 className="text-lg font-medium text-slate-800 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link href="/dashboard/maker-checker" className="block p-4 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors group">
              <div className="font-medium text-slate-700 group-hover:text-emerald-700">Review Applications</div>
              <div className="text-sm text-slate-500 mt-1">Process pending agent and officer requests</div>
            </Link>
            <Link href="/dashboard/team" className="block p-4 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors group">
              <div className="font-medium text-slate-700 group-hover:text-emerald-700">Manage Team</div>
              <div className="text-sm text-slate-500 mt-1">Add officers or adjust performance targets</div>
            </Link>
            <Link href="/dashboard/exceptions" className="block p-4 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors group">
              <div className="font-medium text-slate-700 group-hover:text-emerald-700">Resolve Exceptions</div>
              <div className="text-sm text-slate-500 mt-1">Clear compliance and operational blocks</div>
            </Link>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="xl:col-span-2 bg-white rounded-2xl p-6 border border-slate-200">
          <h3 className="text-lg font-medium text-slate-800 mb-6">Recent Activity</h3>
          <div className="space-y-6">
            {auditLogs.slice(0, 4).map(log => (
              <div key={log.id} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-slate-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div>
                  <div className="text-slate-800">
                    <span className="font-medium">{log.actor}</span> performed <span className="font-medium">{log.action}</span> on <span className="font-medium">{log.target}</span>
                  </div>
                  <div className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                    <span>{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    <span>•</span>
                    <span>{log.reason}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100">
            <Link href="/dashboard/audit" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">View all activity &rarr;</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
