"use client";

import { useState, useMemo } from 'react';
import Pagination from '@/app/components/ui/Pagination';
import Select from '@/app/components/ui/Select';
import DatePicker from '@/app/components/ui/DatePicker';

export default function ReportsPage() {
  const [showFilter, setShowFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterParams, setFilterParams] = useState({
    search: '',
    type: '',
    dateRange: ''
  });

  const clearFilters = () => {
    setFilterParams({ search: '', type: '', dateRange: '' });
  };

  const reportsData = [
    { id: 1, title: 'Monthly disbursement summary', type: 'Disbursement', date: 'Aug 2026', size: '1.2 MB' },
    { id: 2, title: 'Monthly disbursement summary', type: 'Disbursement', date: 'Jul 2026', size: '1.1 MB' },
    { id: 3, title: 'Agent performance summary', type: 'Performance', date: 'Aug 2026', size: '2.4 MB' },
    { id: 4, title: 'Credit Risk Analysis Q3', type: 'Risk Analysis', date: 'Sep 2026', size: '3.5 MB' },
    { id: 5, title: 'Regional Portfolio Health', type: 'Portfolio', date: 'Aug 2026', size: '1.8 MB' },
    { id: 6, title: 'NPL Tracking Report', type: 'Risk Analysis', date: 'Aug 2026', size: '0.9 MB' },
    { id: 7, title: 'Quarterly Executive Summary', type: 'Executive', date: 'Q2 2026', size: '4.2 MB' },
    { id: 8, title: 'Agent performance summary', type: 'Performance', date: 'Jul 2026', size: '2.2 MB' },
  ];

  const parseMockDate = (dateStr: string) => {
    let cleaned = dateStr.replace('Q1', 'Jan').replace('Q2', 'Apr').replace('Q3', 'Jul').replace('Q4', 'Oct');
    return new Date(cleaned).getTime();
  };

  const filteredReports = useMemo(() => {
    let result = reportsData;
    
    if (filterParams.search) {
      const lower = filterParams.search.toLowerCase();
      result = result.filter(r => r.title.toLowerCase().includes(lower));
    }
    
    if (filterParams.type) {
      result = result.filter(r => r.type === filterParams.type);
    }
    
    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      result = result.filter(r => r.title.toLowerCase().includes(lower));
    }
    
    if (filterParams.dateRange) {
      const dates = filterParams.dateRange.split(' to ');
      if (dates.length > 0) {
        const start = new Date(dates[0]).getTime();
        const end = dates.length === 2 ? new Date(dates[1]).getTime() : start;
        result = result.filter(r => {
          const itemDate = parseMockDate(r.date);
          return itemDate >= start && itemDate <= end;
        });
      }
    }
    
    return result;
  }, [filterParams, searchQuery, reportsData]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredReports.slice(start, end);
  }, [filteredReports, currentPage, itemsPerPage]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <h3 className="text-[13px] text-slate-500 font-medium mb-1">Total Reports Generated</h3>
            <div className="text-3xl font-bold text-slate-800">{reportsData.length}</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <h3 className="text-[13px] text-slate-500 font-medium mb-1">Downloads This Month</h3>
            <div className="text-3xl font-bold text-emerald-600">142</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <h3 className="text-[13px] text-slate-500 font-medium mb-1">Active Scheduled Reports</h3>
            <div className="text-3xl font-bold text-indigo-600">12</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
        </div>
      </div>

      {/* Actions & Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            type="text" 
            placeholder="Search reports by title..." 
            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500 transition-colors shadow-sm" 
          />
        </div>
        <div className="flex items-center gap-3 relative">
          <button onClick={() => setShowFilter(!showFilter)} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
            Filter
          </button>
          
          {/* Filter Dropdown */}
          {showFilter && (
            <div className="absolute top-12 right-40 w-80 bg-white rounded-xl shadow-xl border border-slate-100 p-4 z-50">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Filter Reports</h3>
              
              <div className="space-y-3 mb-4">
                <input 
                  value={filterParams.search}
                  onChange={(e) => setFilterParams({ ...filterParams, search: e.target.value })}
                  type="text" 
                  placeholder="Search by title..." 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" 
                />
                
                <Select 
                  value={filterParams.type}
                  onChange={(val) => setFilterParams({ ...filterParams, type: val as any })}
                  placeholder="All Types"
                  options={[{label: 'All Types', value: ''}, {label: 'Disbursement', value: 'Disbursement'}, {label: 'Performance', value: 'Performance'}, {label: 'Risk Analysis', value: 'Risk Analysis'}, {label: 'Portfolio', value: 'Portfolio'}, {label: 'Executive', value: 'Executive'}]} 
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
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            Generate New Report
          </button>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-600 text-xs tracking-wider uppercase">Report Title</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-xs tracking-wider uppercase">Type</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-xs tracking-wider uppercase">Date Generated</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-xs tracking-wider uppercase">Size</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-xs tracking-wider uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No reports found.</td>
                </tr>
              )}
              {paginatedReports.map((report) => (
                <tr key={report.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-red-50 text-red-500 flex items-center justify-center">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2.414L17.586 9H13V4.414zM18 20H6V4h5v7h7v9z"/><path d="M8 13h8v2H8zm0 3h8v2H8z"/></svg>
                      </div>
                      <span className="font-medium text-slate-900">{report.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600">{report.type}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{report.date}</td>
                  <td className="px-6 py-4 text-slate-600 font-mono text-xs">{report.size}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination */}
      <Pagination 
        totalItems={filteredReports.length} 
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />
    </div>
  );
}
