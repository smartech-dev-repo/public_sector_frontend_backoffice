"use client";

import { useState, useMemo, useRef, useEffect } from 'react';
import Pagination from '@/app/components/ui/Pagination';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/app/components/ui/Select';
import CustomDateRangePicker from '@/app/components/ui/CustomDateRangePicker';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import { useReports } from '@/app/composables/modules/useReports';

export default function GeneralReportsTab() {
 const { loading, error, reports, meta, fetchReports } = useReports();
 const [showFilter, setShowFilter] = useState(false);
 const [searchQuery, setSearchQuery] = useState('');
 const [filterParams, setFilterParams] = useState({
  search: '',
  type: '',
  dateRange: ''
 });
 
 const tableContainerRef = useRef<HTMLDivElement>(null);
 const [canScrollLeft, setCanScrollLeft] = useState(false);
 const [canScrollRight, setCanScrollRight] = useState(false);

 const checkScroll = () => {
  if (tableContainerRef.current) {
   const { scrollLeft, scrollWidth, clientWidth } = tableContainerRef.current;
   setCanScrollLeft(scrollLeft > 0);
   setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
  }
 };

 useEffect(() => {
  checkScroll();
  window.addEventListener('resize', checkScroll);
  return () => window.removeEventListener('resize', checkScroll);
 }, []);

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
   result = result.filter((r: any) => (r.title || r.name || '').toLowerCase().includes(lower));
  }
  
  if (filterParams.type) {
   result = result.filter((r: any) => r.type === filterParams.type);
  }
  
  if (searchQuery) {
   const lower = searchQuery.toLowerCase();
   result = result.filter((r: any) => (r.title || r.name || '').toLowerCase().includes(lower));
  }
  
  if (filterParams.dateRange) {
   const dates = filterParams.dateRange.split(' to ');
   if (dates.length > 0) {
    const start = new Date(dates[0]).getTime();
    const end = dates.length === 2 ? new Date(dates[1]).getTime() : start;
    result = result.filter((r: any) => {
     const itemDate = parseMockDate(r.date || r.createdAt);
     return itemDate >= start && itemDate <= end;
    });
   }
  }
  
  return result;
 }, [filterParams, searchQuery, reports]);

 const [currentPage, setCurrentPage] = useState(1);
 const [itemsPerPage, setItemsPerPage] = useState(10);

 useEffect(() => {
  fetchReports({ page: currentPage, limit: itemsPerPage, search: searchQuery, type: filterParams.type, dateRange: filterParams.dateRange });
 }, [fetchReports, currentPage, itemsPerPage, searchQuery, filterParams]);

 const paginatedReports = useMemo(() => {
  if (reports.length > 0) return reports; // If backend handles pagination, we can just use reports. If not, slice it. Assuming backend handles it since we pass params.
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredReports.slice(start, end);
 }, [filteredReports, reports, currentPage, itemsPerPage]);

 return (
  <div className="space-y-3">
   {/* Summary Cards */}
   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div className="bg-card rounded-xl p-5 border border-border/50 flex items-center justify-between">
     <div>
      <h3 className="text-[13px] text-muted-foreground font-medium mb-1">Total Reports Generated</h3>
      <div className="text-3xl font-bold text-foreground">{meta?.total || reports.length}</div>
     </div>
     <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
     </div>
    </div>
    <div className="bg-card rounded-xl p-5 border border-border/50 flex items-center justify-between">
     <div>
      <h3 className="text-[13px] text-muted-foreground font-medium mb-1">Downloads This Month</h3>
      <div className="text-3xl font-bold text-emerald-600">142</div>
     </div>
     <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
     </div>
    </div>
    <div className="bg-card rounded-xl p-5 border border-border/50 flex items-center justify-between">
     <div>
      <h3 className="text-[13px] text-muted-foreground font-medium mb-1">Active Scheduled Reports</h3>
      <div className="text-3xl font-bold text-indigo-600">12</div>
     </div>
     <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
     </div>
    </div>
   </div>

   {/* Actions & Filters */}
   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <div className="flex-1 max-w-md">
     <input 
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      type="text" 
      placeholder="Search reports by title..." 
      className="w-full px-4 py-2 bg-card border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all " 
     />
    </div>
    <div className="flex items-center gap-3">
     <button 
      onClick={() => setShowFilter(!showFilter)}
      className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full text-sm font-medium text-foreground/90 hover:bg-muted/30 transition-colors "
     >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
      Filters
      <svg className={`w-4 h-4 transition-transform ${showFilter ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
     </button>
     <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-full text-sm font-medium hover:bg-emerald-700 transition-colors ">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
      Generate New Report
     </button>
    </div>
   </div>
   
   {/* Filters */}
   <div className="mb-6 space-y-4">
    {showFilter && (
     <div className="bg-card p-6 rounded-2xl border border-border/50 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
       <div className="space-y-1.5">
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Search</label>
        <input 
         value={filterParams.search}
         onChange={(e) => setFilterParams({ ...filterParams, search: e.target.value })}
         type="text" 
         placeholder="Search by title..." 
         className="w-full px-4 py-2 border rounded-lg text-sm bg-card border-border outline-none focus:ring-1 focus:ring-emerald-200 focus:border-emerald-400" 
        />
       </div>
       <div className="space-y-1.5">
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Type</label>
        <Select 
         value={filterParams.type}
         onValueChange={(val: any) => setFilterParams({ ...filterParams, type: val === 'none' ? '' : val })}
        >
         <SelectTrigger className="w-full bg-card"><SelectValue placeholder="All Types" /></SelectTrigger>
         <SelectContent>
          <SelectItem value="none">All Types</SelectItem>
          <SelectItem value="Disbursement">Disbursement</SelectItem>
          <SelectItem value="Performance">Performance</SelectItem>
          <SelectItem value="Risk Analysis">Risk Analysis</SelectItem>
          <SelectItem value="Portfolio">Portfolio</SelectItem>
          <SelectItem value="Executive">Executive</SelectItem>
         </SelectContent>
        </Select>
       </div>
       <div className="space-y-1.5 w-full z-[60] relative">
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Date Range</label>
        <CustomDateRangePicker 
         value={filterParams.dateRange}
         onChange={(val: any) => setFilterParams({ ...filterParams, dateRange: val })}
         placeholder="Select date range"
        />
       </div>
      </div>
      <div className="mt-6 flex justify-end">
       <button onClick={clearFilters} className="px-5 py-2 bg-card border border-border rounded-full text-sm font-medium text-foreground/90 hover:bg-muted/30 transition-colors">Clear Filters</button>
      </div>
     </div>
    )}
   </div>

   {/* Reports Table */}
   {loading && <PulseLoader />}
   {!loading && error && <div className="text-red-500 py-12 text-center">{error}</div>}

   {!loading && !error && (
    <div className="bg-card rounded-xl border border-border/50 overflow-hidden relative w-full max-w-full">
     {canScrollLeft && (
      <button
       onClick={(e) => { e.preventDefault(); e.stopPropagation(); if(tableContainerRef.current) tableContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' }); }}
       className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-card border border-border flex items-center justify-center z-10 text-muted-foreground/70 hover:text-muted-foreground "
       type="button"
      >
       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
      </button>
     )}
     
     <div 
      ref={tableContainerRef} 
      onScroll={checkScroll}
      className="overflow-x-auto w-full"
     >
      <table className="w-full text-left text-sm min-w-[800px]">
      <thead className="bg-[#E9F4EE] dark:bg-emerald-950/20">
         <tr>
        <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Report Title</th>
        <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Type</th>
        <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Date Generated</th>
        <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Size</th>
        <th className="px-4 py-4 text-right text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Actions</th>
       </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
       {filteredReports.length === 0 && (
        <tr>
         <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No reports found.</td>
        </tr>
       )}
       {paginatedReports.map((report: any) => (
        <tr key={report.id} className="hover:bg-muted/30/50 transition-colors group">
         <td className="px-4 py-4">
          <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded bg-red-50 text-red-500 flex items-center justify-center">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2.414L17.586 9H13V4.414zM18 20H6V4h5v7h7v9z"/><path d="M8 13h8v2H8zm0 3h8v2H8z"/></svg>
           </div>
           <span className="font-medium text-foreground">{report.title || report.name || 'Untitled'}</span>
          </div>
         </td>
         <td className="px-4 py-4 text-muted-foreground">
          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-muted/50 text-muted-foreground">{report.type || 'Standard'}</span>
         </td>
         <td className="px-4 py-4 text-muted-foreground">{report.date || new Date(report.createdAt).toLocaleDateString()}</td>
         <td className="px-4 py-4 text-muted-foreground font-mono text-xs">{report.size || 'N/A'}</td>
         <td className="px-4 py-4 text-right">
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
     {canScrollRight && (
      <button
       onClick={(e) => { e.preventDefault(); e.stopPropagation(); if(tableContainerRef.current) tableContainerRef.current.scrollTo({ left: tableContainerRef.current.scrollWidth, behavior: 'smooth' }); }}
       className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-card border border-border flex items-center justify-center z-10 text-muted-foreground/70 hover:text-muted-foreground "
       type="button"
      >
       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
      </button>
     )}
    </div>
   )}
   
   {/* Pagination */}
   {!loading && !error && (
    <Pagination 
     totalItems={meta?.total || filteredReports.length} 
     currentPage={currentPage}
     itemsPerPage={itemsPerPage}
     onPageChange={setCurrentPage}
     onItemsPerPageChange={setItemsPerPage}
    />
   )}
  </div>
 );
}
