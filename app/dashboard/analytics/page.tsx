"use client";

import { useEffect, useState } from 'react';
import PulseLoader from '@/app/components/ui/PulseLoader';
import { useMockData } from '@/app/composables/modules/useMockData';
import { useToast } from '@/app/composables/useToast';
import Select from '@/app/components/ui/Select';

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const { analyticsStats } = useMockData();
  const { addToast } = useToast();

  const downloadReport = () => {
    addToast('Exporting CSV report for the selected period...', 'success');
    
    setTimeout(() => {
      const headers = ['Metric', 'Value'];
      const rows = [
        ['Total Applications', analyticsStats.totalLoansOriginated],
        ['Approval Rate', "85%"],
        ['Average Processing Time', analyticsStats.averageTurnaround],
        ['Active Agents', analyticsStats.activeAgents]
      ];
      
      const csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n"
        + rows.map(e => e.join(",")).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `analytics_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      addToast('CSV export downloaded successfully.', 'success');
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
          <p className="text-sm text-slate-500">View platform performance metrics and download segmented data for analysis.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-48">
            <Select 
              options={[
                {label: 'Last 30 Days', value: '30d'}, 
                {label: 'This Quarter', value: 'Q'}, 
                {label: 'Year to Date', value: 'YTD'}
              ]} 
              value={period}
              onChange={(val) => setPeriod(val as string)}
            />
          </div>
          <button onClick={downloadReport} className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 py-2 px-4 rounded-lg flex items-center gap-2 transition-colors border border-emerald-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Total Loans Originated</div>
          <div className="text-3xl text-slate-800">{analyticsStats.totalLoansOriginated.toLocaleString()}</div>
          <div className="text-sm text-emerald-600 mt-2 font-medium flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
            +14% from last month
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Total Volume Disbursed</div>
          <div className="text-3xl text-slate-800">₦{(analyticsStats.totalVolume / 1000000).toFixed(1)}M</div>
          <div className="text-sm text-emerald-600 mt-2 font-medium flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
            +8.2% from last month
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Avg. Turnaround Time</div>
          <div className="text-3xl text-slate-800">{analyticsStats.averageTurnaround}</div>
          <div className="text-sm text-emerald-600 mt-2 font-medium flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path></svg>
            -1.5 hrs from last month
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Active Field Agents</div>
          <div className="text-3xl text-slate-800">{analyticsStats.activeAgents}</div>
          <div className="text-sm text-emerald-600 mt-2 font-medium flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
            +12 new this month
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agent Performance Mock Chart */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200">
          <h3 className="text-lg text-slate-800 mb-6">Top Performing Sectors</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-700">Nigerian Police Force</span>
                <span className="text-slate-800">45%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5">
                <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-700">Customs Service</span>
                <span className="text-slate-800">30%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5">
                <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '30%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-700">Federal Ministry of Health</span>
                <span className="text-slate-800">15%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5">
                <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-700">Other Ministries</span>
                <span className="text-slate-800">10%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5">
                <div className="bg-slate-400 h-2.5 rounded-full" style={{ width: '10%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Compliance Overview */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200">
          <h3 className="text-lg text-slate-800 mb-6">Compliance & Onboarding Health</h3>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center">
              <div className="text-4xl text-emerald-600 mb-2">98.5%</div>
              <div className="text-sm text-slate-600">KYC Pass Rate</div>
              <p className="text-xs text-slate-400 mt-2">First-time BVN/NIN match</p>
            </div>
            
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center">
              <div className="text-4xl text-slate-800 mb-2">2.4%</div>
              <div className="text-sm text-slate-600">Abandonment Rate</div>
              <p className="text-xs text-slate-400 mt-2">During agent-assisted flow</p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <div>
              <h4 className="text-sm text-amber-900">Attention Required</h4>
              <p className="text-xs text-amber-700 mt-1">15 agent applications have been pending Internal Control review for {'>'} 48 hours. Consider reassigning queue.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
