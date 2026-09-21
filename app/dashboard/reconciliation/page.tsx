"use client";

import { useEffect, useState, useMemo } from 'react';
import PulseLoader from '@/app/components/ui/PulseLoader';
import Pagination from '@/app/components/ui/Pagination';
import Select from '@/app/components/ui/Select';
import DatePicker from '@/app/components/ui/DatePicker';
import TableDropdown from '@/app/components/ui/TableDropdown';
import { useMockData } from '@/app/composables/modules/useMockData';
import { useToast } from '@/app/composables/useToast';

export default function ReconciliationPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const { reconciliationRecords } = useMockData();
  const { addToast } = useToast();

  const [recordsList, setRecordsList] = useState(reconciliationRecords);
  const [showFilter, setShowFilter] = useState(false);
  const [filterParams, setFilterParams] = useState({
    search: '',
    matchStatus: '',
    dateRange: ''
  });

  const clearFilters = () => {
    setFilterParams({ search: '', matchStatus: '', dateRange: '' });
  };

  const filteredRecords = useMemo(() => {
    let result = recordsList;
    
    if (filterParams.search) {
      const lower = filterParams.search.toLowerCase();
      result = result.filter(r => 
        r.customer.toLowerCase().includes(lower) || 
        r.loanId.toLowerCase().includes(lower)
      );
    }
    
    if (filterParams.matchStatus) {
      result = result.filter(r => r.matchStatus === filterParams.matchStatus);
    }
    
    if (filterParams.dateRange) {
      const dates = filterParams.dateRange.split(' to ');
      if (dates.length > 0) {
        const start = new Date(dates[0]).getTime();
        const end = dates.length === 2 ? new Date(dates[1]).getTime() : start;
        result = result.filter(r => {
          if (!r.date) return true;
          const itemDate = new Date(r.date).getTime();
          return itemDate >= start && itemDate <= end;
        });
      }
    }
    
    return result;
  }, [filterParams, recordsList]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredRecords.slice(start, end);
  }, [currentPage, itemsPerPage, filteredRecords]);

  const uploadExtract = () => {
    addToast('Uploading CBA extract. Please wait...', 'info');
    setTimeout(() => {
      addToast('CBA extract successfully uploaded and processed.', 'success');
    }, 1500);
  };

  const resolveRecord = (record: any) => {
    setRecordsList(prev => prev.map(r => r.id === record.id ? { ...r, matchStatus: 'Matched' } : r));
    addToast(`Record ${record.loanId} resolved manually.`, 'success');
  };

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="py-20">
          <PulseLoader />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-sm text-slate-500 mt-1">Match approved portal loans against CBA disbursement records.</p>
            </div>
            <button onClick={uploadExtract} className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
              Upload CBA Extract
            </button>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200">
              <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total Records</div>
              <div className="text-2xl text-slate-800">{recordsList.length}</div>
            </div>
            <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
              <div className="text-xs text-emerald-600 uppercase tracking-wider mb-1">Matched</div>
              <div className="text-2xl text-emerald-700">{recordsList.filter(r => r.matchStatus === 'Matched').length}</div>
            </div>
            <div className="bg-rose-50 rounded-2xl p-5 border border-rose-100">
              <div className="text-xs text-rose-600 uppercase tracking-wider mb-1">Unmatched</div>
              <div className="text-2xl text-rose-700">{recordsList.filter(r => r.matchStatus === 'Unmatched').length}</div>
            </div>
            <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
              <div className="text-xs text-amber-600 uppercase tracking-wider mb-1">Reversed</div>
              <div className="text-2xl text-amber-700">{recordsList.filter(r => r.matchStatus === 'Reversed').length}</div>
            </div>
          </div>
          
          {/* Actions & Filters */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex-1 max-w-md">
              <span className="text-sm text-slate-400">Showing {filteredRecords.length} of {recordsList.length} records</span>
            </div>
            
            <div className="flex items-center gap-3 relative">
              <button onClick={() => setShowFilter(!showFilter)} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                Filter
              </button>
              
              {/* Filter Dropdown */}
              {showFilter && (
                <div className="absolute top-12 right-0 w-80 bg-white rounded-xl shadow-xl border border-slate-100 p-4 z-50">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Filter Records</h3>
                  
                  <div className="space-y-3 mb-4">
                    <input 
                      value={filterParams.search} 
                      onChange={e => setFilterParams({...filterParams, search: e.target.value})} 
                      type="text" 
                      placeholder="Search customer or ref..." 
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" 
                    />
                    
                    <Select 
                      value={filterParams.matchStatus}
                      onChange={(val: any) => setFilterParams({...filterParams, matchStatus: val})}
                      placeholder="All Match Statuses"
                      options={[
                        {label: 'All Match Statuses', value: ''}, 
                        {label: 'Matched', value: 'Matched'}, 
                        {label: 'Unmatched', value: 'Unmatched'}, 
                        {label: 'Reversed', value: 'Reversed'}
                      ]} 
                    />
                    
                    <DatePicker 
                      value={filterParams.dateRange}
                      onChange={(val: any) => setFilterParams({...filterParams, dateRange: val})}
                      placeholder="Select date range"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <button onClick={clearFilters} className="flex-1 py-2 bg-slate-50 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors">Clear</button>
                    <button onClick={() => setShowFilter(false)} className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">Apply Filter</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 ">
                    <th className="px-6 py-4">Ref ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Portal Status</th>
                    <th className="px-6 py-4">CBA Status</th>
                    <th className="px-6 py-4 text-center">Match Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {paginatedRecords.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-slate-500">No records found.</td>
                    </tr>
                  )}
                  {paginatedRecords.map(record => (
                    <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 font-mono text-slate-600">{record.loanId}</td>
                      <td className="px-6 py-4 font-medium text-slate-800">{record.customer}</td>
                      <td className="px-6 py-4 text-slate-600">₦{record.amount.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-100 text-emerald-700 whitespace-nowrap">{record.portalStatus}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap ${record.cbaStatus === 'Disbursed' ? 'bg-emerald-100 text-emerald-700' : record.cbaStatus === 'Pending' ? 'bg-slate-100 text-slate-700' : 'bg-rose-100 text-rose-700'}`}>{record.cbaStatus}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-xs border whitespace-nowrap ${record.matchStatus === 'Matched' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : record.matchStatus === 'Unmatched' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                          {record.matchStatus === 'Matched' && <span>✓</span>}
                          {record.matchStatus === 'Unmatched' && <span>!</span>}
                          {record.matchStatus}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end">
                          {record.matchStatus !== 'Matched' ? (
                            <TableDropdown>
                              <button onClick={() => resolveRecord(record)} className="w-full text-left px-4 py-2.5 text-sm text-emerald-600 hover:bg-emerald-50 transition-colors">
                                Resolve Record
                              </button>
                            </TableDropdown>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <Pagination 
            totalItems={filteredRecords.length} 
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
