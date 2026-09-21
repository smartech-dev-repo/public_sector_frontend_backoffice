"use client";

import { useEffect, useState, useMemo } from 'react';
import PulseLoader from '@/app/components/ui/PulseLoader';
import Pagination from '@/app/components/ui/Pagination';
import DatePicker from '@/app/components/ui/DatePicker';
import { useAuditLogs } from '@/app/composables/modules/useAuditLogs';

export default function AuditPage() {
  const { loading: isLoading, error, logs, fetchLogs } = useAuditLogs();

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const [showFilter, setShowFilter] = useState(false);
  const [filterParams, setFilterParams] = useState({
    search: '',
    dateRange: ''
  });

  const clearFilters = () => {
    setFilterParams({ search: '', dateRange: '' });
  };

  const filteredLogs = useMemo(() => {
    let result = logs;
    
    if (filterParams.search) {
      const lower = filterParams.search.toLowerCase();
      result = result.filter((log: any) => 
        String(log.actorId).toLowerCase().includes(lower) || 
        String(log.targetId).toLowerCase().includes(lower) ||
        String(log.action).toLowerCase().includes(lower)
      );
    }
    
    if (filterParams.dateRange) {
      const dates = filterParams.dateRange.split(' to ');
      if (dates.length > 0) {
        const start = new Date(dates[0]).getTime();
        const end = dates.length === 2 ? new Date(dates[1]).getTime() : start;
        result = result.filter((log: any) => {
          const itemDate = new Date(log.createdAt).getTime();
          return itemDate >= start && itemDate <= end;
        });
      }
    }
    
    return result;
  }, [logs, filterParams]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredLogs.slice(start, end);
  }, [currentPage, itemsPerPage, filteredLogs]);

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="py-20">
          <PulseLoader />
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <p className="text-sm text-slate-500 mt-1">System of record for all high-risk operations and access changes.</p>
          </div>

          {/* Alert */}
          <div className="bg-slate-800 rounded-xl p-4 flex items-start gap-3 border border-slate-700">
            <svg className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            <div>
              <h4 className="text-sm text-white">Read-Only View (SOP 11)</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">This log is immutable. Records cannot be edited or deleted. It tracks the actor, timestamp, target record, and mandatory justification for every critical platform action.</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 max-w-md">
              <span className="text-sm text-slate-400">Showing {filteredLogs.length} of {logs.length} logs</span>
            </div>
            
            <div className="flex items-center gap-3 relative">
              <button onClick={() => setShowFilter(!showFilter)} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                Filter
              </button>
              
              {/* Filter Dropdown */}
              {showFilter && (
                <div className="absolute top-12 right-0 w-80 bg-white rounded-xl shadow-xl border border-slate-100 p-4 z-50">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Filter Logs</h3>
                  
                  <div className="space-y-3 mb-4">
                    <input 
                      value={filterParams.search}
                      onChange={(e) => setFilterParams({ ...filterParams, search: e.target.value })}
                      type="text" 
                      placeholder="Search by actor or target..." 
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" 
                    />
                    
                    <DatePicker 
                      value={filterParams.dateRange}
                      onChange={(val) => setFilterParams({ ...filterParams, dateRange: val as any })}
                      placeholder="Select date range"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <button onClick={clearFilters} className="flex-1 py-2 bg-slate-50 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors">Clear</button>
                    <button onClick={() => setShowFilter(false)} className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">Apply Filter</button>
                  </div>
                </div>
              )}
              
              <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 border border-slate-200 shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                Export CSV
              </button>
            </div>
          </div>

          {/* Log List */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 ">
                    <th className="px-6 py-4">Timestamp (UTC)</th>
                    <th className="px-6 py-4">Actor</th>
                    <th className="px-6 py-4">Action Event</th>
                    <th className="px-6 py-4">Target Ref</th>
                    <th className="px-6 py-4">Recorded Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {paginatedLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No logs found.</td>
                    </tr>
                  )}
                  {paginatedLogs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 font-mono text-slate-500 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                      <td className="px-6 py-4 font-medium text-slate-800">{log.actorType} ({log.actorId})</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-md text-xs whitespace-nowrap bg-blue-100 text-blue-700">{log.action}</span>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-600">{log.targetType} ({log.targetId})</td>
                      <td className="px-6 py-4 text-slate-600 text-xs">{log.reason || log.ipAddress}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <Pagination 
            totalItems={filteredLogs.length} 
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      )}
    </div>
  );
}
