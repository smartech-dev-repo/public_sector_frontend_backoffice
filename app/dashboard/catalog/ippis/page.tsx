"use client";

import { useEffect, useState } from 'react';
import { useIppis } from '@/app/composables/modules/useIppis';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import Pagination from '@/app/components/ui/Pagination';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/app/components/ui/Select';

export default function IppisCatalogPage() {
  const { loading, error, ippisRecords, fetchIppisRecords, meta } = useIppis();
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [q, setQ] = useState('');
  const [agency, setAgency] = useState('all');
  const [status, setStatus] = useState('all');
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    const params: any = { page, limit };
    if (q.trim()) params.q = q.trim();
    if (agency !== 'all') params.agency = agency;
    if (status !== 'all') params.status = status;
    
    fetchIppisRecords(params);
  }, [fetchIppisRecords, page, limit, q, agency, status]);

  return (
    <main className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">IPPIS Records Catalog</h1>
          <p className="text-sm text-muted-foreground mt-1">View all synced personnel records from IPPIS</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full text-sm font-medium text-foreground/90 hover:bg-muted/30 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
            Filters
            <svg className={`w-4 h-4 transition-transform ${showFilter ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>
        </div>
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex bg-card p-2 rounded-2xl border border-border shadow-sm">
          <div className="flex items-center pl-3 pr-2 text-muted-foreground/70">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          <input 
            type="text"
            placeholder="Search by name or staff ID..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full px-2 py-1.5 bg-transparent border-none outline-none text-sm text-foreground placeholder-slate-400"
          />
        </div>

        {showFilter && (
          <div className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Agency</label>
                <Select value={agency} onValueChange={setAgency}>
                  <SelectTrigger className="w-full bg-card"><SelectValue placeholder="All Agencies" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Agencies</SelectItem>
                    <SelectItem value="NSCDC">NSCDC</SelectItem>
                    <SelectItem value="NCS">NCS</SelectItem>
                    <SelectItem value="NIS">NIS</SelectItem>
                    <SelectItem value="NPS">NPS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-full bg-card"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="ACTIVE">Active Employee</SelectItem>
                    <SelectItem value="INACTIVE">Ex Employee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </div>

      {loading && <PulseLoader />}
      {!loading && error && <div className="text-red-500 py-12 text-center">{error}</div>}
      
      {!loading && !error && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-[#E9F4EE] dark:bg-emerald-950/20">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Staff Details</th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Agency</th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Role & Dept</th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Grade/Step</th>
                  <th className="px-4 py-4 text-right text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Salary</th>
                  <th className="px-4 py-4 text-right text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ippisRecords.map((record: any) => (
                  <tr key={record.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-foreground">{record.employeeName}</div>
                      <div className="text-xs text-muted-foreground font-mono mt-0.5">{record.staffId}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground/90 font-medium">{record.agency || 'N/A'}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground/90">{record.jobTitle || 'N/A'}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{record.department || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground/90">
                      GL-{record.grade || '--'} / Step {record.step || '--'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground font-medium text-right">
                      ₦{Number(record.salary || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        record.employeeStatus === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-muted/50 text-muted-foreground'
                      }`}>
                        {record.employeeStatus === 'ACTIVE' ? 'Active Employee' : 'Ex Employee'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {ippisRecords.length === 0 && <EmptyState title="No IPPIS records found." />}
          {meta && meta.total > 0 && (
            <div className="border-t border-border/50 bg-card">
              <Pagination 
                totalItems={meta.total || 0}
                currentPage={page || 1}
                itemsPerPage={limit || 25}
                onPageChange={setPage}
                onItemsPerPageChange={setLimit}
              />
            </div>
          )}
        </div>
      )}
    </main>
  );
}
