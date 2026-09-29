"use client";

import { useEffect, useState, useMemo } from 'react';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import Pagination from '@/app/components/ui/Pagination';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/app/components/ui/Select';
import CustomDateRangePicker from '@/app/components/ui/CustomDateRangePicker';
import { useMockData } from '@/app/composables/modules/useMockData';
import { useToast } from '@/app/composables/useToast';

export default function ExceptionsPage() {
  const [showFilter, setShowFilter] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { exceptions } = useMockData();
  const { addToast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);
  const [filterParams, setFilterParams] = useState({
    search: '',
    team: '',
    status: '',
    dateRange: ''
  });

  const clearFilters = () => {
    setFilterParams({ search: '', team: '', status: '', dateRange: '' });
  };

  const filteredExceptions = useMemo(() => {
    let result = exceptions;
    
    if (filterParams.search) {
      const lower = filterParams.search.toLowerCase();
      result = result.filter((exc: any) => exc.reference.toLowerCase().includes(lower));
    }
    
    if (filterParams.team) {
      result = result.filter((exc: any) => exc.assignedTo.includes(filterParams.team) || filterParams.team === ''); 
    }
    
    if (filterParams.status) {
      result = result.filter((exc: any) => exc.status === filterParams.status);
    }
    
    if (filterParams.dateRange) {
      const dates = filterParams.dateRange.split(' to ');
      if (dates.length > 0) {
        const start = new Date(dates[0]).getTime();
        const end = dates.length === 2 ? new Date(dates[1]).getTime() : start;
        result = result.filter((exc: any) => {
          const itemDate = new Date(exc.date).getTime();
          return itemDate >= start && itemDate <= end;
        });
      }
    }
    
    return result;
  }, [exceptions, filterParams]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const paginatedExceptions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredExceptions.slice(start, end);
  }, [filteredExceptions, currentPage, itemsPerPage]);

  const resolveCase = (exc: any) => {
    exc.status = 'Resolved'; // Direct mutation of mock data for demo purposes
    addToast(`Exception ${exc.reference} has been resolved successfully.`, 'success');
    // Force re-render would be needed in a real app, but mock data will just mutate
  };

  const viewDetails = (exc: any) => {
    addToast(`Viewing details for ${exc.reference}.`, 'info');
  };

  return (
    <div className="space-y-3">
      {isLoading ? (
        <div className="py-10">
          <PulseLoader />
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <p className="text-sm text-slate-500 mt-1">Manage and resolve cases flagged for manual intervention.</p>
          </div>

          {/* Actions & Filters */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 max-w-md">
              <span className="text-sm text-slate-400">Showing {filteredExceptions.length} of {exceptions.length} exceptions</span>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowFilter(!showFilter)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                Filters
                <svg className={`w-4 h-4 transition-transform ${showFilter ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
            </div>
          </div>
          
          {/* Filters */}
          <div className="mb-6 space-y-4">
            {showFilter && (
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Search</label>
                    <input 
                      value={filterParams.search}
                      onChange={(e) => setFilterParams({ ...filterParams, search: e.target.value })}
                      type="text" 
                      placeholder="Search by Reference ID..." 
                      className="w-full px-4 py-2 border rounded-lg text-sm bg-white border-slate-200 outline-none focus:ring-1 focus:ring-emerald-200 focus:border-emerald-400" 
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Team</label>
                    <Select 
                      value={filterParams.team}
                      onValueChange={(val: any) => setFilterParams({ ...filterParams, team: val === 'none' ? '' : val })}
                    >
                      <SelectTrigger className="w-full bg-white"><SelectValue placeholder="All Teams" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">All Teams</SelectItem>
                        <SelectItem value="Risk & Compliance">Risk & Compliance</SelectItem>
                        <SelectItem value="Internal Control">Internal Control</SelectItem>
                        <SelectItem value="Operations">Operations</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Status</label>
                    <Select 
                      value={filterParams.status}
                      onValueChange={(val: any) => setFilterParams({ ...filterParams, status: val === 'none' ? '' : val })}
                    >
                      <SelectTrigger className="w-full bg-white"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">All Statuses</SelectItem>
                        <SelectItem value="Open">Open</SelectItem>
                        <SelectItem value="Resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-1.5 z-[60] relative">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Date Range</label>
                    <CustomDateRangePicker 
                      value={filterParams.dateRange}
                      onChange={(val: any) => setFilterParams({ ...filterParams, dateRange: val })}
                      placeholder="Select date range"
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <button onClick={clearFilters} className="px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors w-full">Clear Filters</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Exception List */}
          <div className="space-y-4">
            {filteredExceptions.length === 0 && <EmptyState title="
                No exceptions match your filter criteria.
              " />}
            {paginatedExceptions.map((exc: any) => (
              <div key={exc.id} className="bg-white rounded-2xl p-6 border border-slate-200 flex items-start justify-between group hover:border-emerald-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${exc.severity === 'High' ? 'bg-rose-100 text-rose-600' : exc.severity === 'Medium' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-slate-800 text-lg">{exc.type}</h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider whitespace-nowrap ${exc.severity === 'High' ? 'bg-rose-100 text-rose-700' : exc.severity === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>{exc.severity}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider whitespace-nowrap ${exc.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>{exc.status}</span>
                    </div>
                    <div className="text-sm text-slate-500 flex items-center gap-4">
                      <span>Ref: <span className="font-mono text-slate-700">{exc.reference}</span></span>
                      <span>•</span>
                      <span>Assigned: <span className="text-slate-700">{exc.assignedTo}</span></span>
                      <span>•</span>
                      <span>{new Date(exc.date).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  {exc.status === 'Open' ? (
                    <button onClick={() => resolveCase(exc)} className="bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white px-4 py-2 rounded-lg text-sm transition-colors border border-emerald-200 hover:border-emerald-600">
                      Resolve Case
                    </button>
                  ) : (
                    <button onClick={() => viewDetails(exc)} className="text-slate-400 hover:text-emerald-600 text-sm transition-colors px-4 py-2">
                      View Details
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <Pagination 
            totalItems={filteredExceptions.length} 
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
