"use client";

import { useEffect, useState, useMemo } from 'react';
import PulseLoader from '@/app/components/ui/PulseLoader';
import Pagination from '@/app/components/ui/Pagination';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/app/components/ui/Select';
import CustomDateRangePicker from '@/app/components/ui/CustomDateRangePicker';
import { MonthPicker } from '@/app/components/ui/MonthPicker';
import TableDropdown from '@/app/components/ui/TableDropdown';
import { useReconciliation } from '@/app/composables/modules/useReconciliation';
import { useToast } from '@/app/composables/useToast';

export default function ReconciliationPage() {
  const [isLoading, setIsLoading] = useState(true);

  const { reconciliation, fetchReconciliation, meta } = useReconciliation();
  const { addToast } = useToast();

  const [recordsList, setRecordsList] = useState([] as any[]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showFilter, setShowFilter] = useState(false);
  const [filterParams, setFilterParams] = useState({
    agency: '',
    matchStatus: '',
    period: '',
    generatedRange: ''
  });

  useEffect(() => {
    const params: any = { page: currentPage, limit: itemsPerPage };
    if (filterParams.agency) params.agency = filterParams.agency;
    if (filterParams.matchStatus) params.status = filterParams.matchStatus;
    if (filterParams.period) params.period = filterParams.period;
    if (filterParams.generatedRange) {
      const [from, to] = filterParams.generatedRange.split(' to ');
      if (from) params.generatedFrom = from;
      if (to) params.generatedTo = to;
    }

    fetchReconciliation(params).then((data) => {
      setRecordsList(data || []);
      setIsLoading(false);
    });
  }, [fetchReconciliation, currentPage, itemsPerPage, filterParams]);

  const clearFilters = () => {
    setFilterParams({ agency: '', matchStatus: '', period: '', generatedRange: '' });
  };

  const filteredRecords = useMemo(() => {
    return recordsList;
  }, [recordsList]);

  const paginatedRecords = useMemo(() => {
    return recordsList;
  }, [recordsList]);

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

  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const viewRecordDetails = (record: any) => {
    setSelectedRecord(record);
    setShowDetailsModal(true);
  };

  return (
    <div className="space-y-3">
      {isLoading ? (
        <div className="py-10">
          <PulseLoader />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-sm text-slate-500 mt-1">Match approved portal loans against CBA disbursement records.</p>
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
              <button onClick={uploadExtract} className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2 shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                Upload CBA Extract
              </button>
            </div>
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
          
          {/* Filters */}
          <div className="mb-6 space-y-4">
            {showFilter && (
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Agency</label>
                    <input 
                      value={filterParams.agency} 
                      onChange={e => setFilterParams({...filterParams, agency: e.target.value})} 
                      type="text" 
                      placeholder="Agency (e.g. NSCDC)..." 
                      className="w-full px-4 py-2 border rounded-lg text-sm bg-white border-slate-200 outline-none focus:ring-1 focus:ring-emerald-200 focus:border-emerald-400" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Match Status</label>
                    <Select 
                      value={filterParams.matchStatus}
                      onValueChange={(val: any) => setFilterParams({...filterParams, matchStatus: val === 'none' ? '' : val})}
                    >
                      <SelectTrigger className="w-full bg-white"><SelectValue placeholder="All Match Statuses" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">All Match Statuses</SelectItem>
                        <SelectItem value="MATCHED">Matched</SelectItem>
                        <SelectItem value="UNDER_PAID">Under Paid</SelectItem>
                        <SelectItem value="OVER_PAID">Over Paid</SelectItem>
                        <SelectItem value="NO_DEDUCTION_FOUND">No Deduction Found</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 z-[60] relative">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Period</label>
                    <MonthPicker 
                      value={filterParams.period}
                      onChange={val => setFilterParams({...filterParams, period: val})}
                      placeholder="Pick a month"
                    />
                  </div>
                  <div className="space-y-1.5 z-[60] relative">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Generated Date</label>
                    <CustomDateRangePicker 
                      value={filterParams.generatedRange}
                      onChange={(val: any) => setFilterParams({...filterParams, generatedRange: val})}
                      placeholder="Generated Date Range"
                    />
                  </div>
                  <div className="flex items-end">
                    <button onClick={clearFilters} className="px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors w-full">Clear Filters</button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex-1 max-w-md">
              <span className="text-sm text-slate-400">Total {meta?.total || 0} records found</span>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mt-6">
            <div className="overflow-x-auto">
              <table className="w-full min-w-full text-left border-collapse">
                <thead className="bg-[#E9F4EE]">
                  <tr>
                    <th className="px-4 py-4 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">Ref ID</th>
                    <th className="px-4 py-4 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">Customer</th>
                    <th className="px-4 py-4 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">Expected Amount</th>
                    <th className="px-4 py-4 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">Actual Amount</th>
                    <th className="px-4 py-4 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">Variance</th>
                    <th className="px-4 py-4 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">Status</th>
                    <th className="px-4 py-4 text-right text-xs font-medium text-[#018752] uppercase tracking-wider">Actions</th>
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
                      <td className="px-4 py-4 font-mono text-slate-600">{record.id?.split('-')[0]}</td>
                      <td className="px-4 py-4 font-medium text-slate-800">{record.loan?.customerName || 'Unknown'}</td>
                      <td className="px-4 py-4 text-slate-600">₦{Number(record.expectedAmount || 0).toLocaleString()}</td>
                      <td className="px-4 py-4 text-slate-600">₦{Number(record.actualAmount || 0).toLocaleString()}</td>
                      <td className="px-4 py-4 text-slate-600">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap ${Number(record.variance) < 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          ₦{Number(record.variance || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-xs border whitespace-nowrap ${record.status === 'MATCHED' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
                          {record.status?.replace(/_/g, ' ') || 'UNKNOWN'}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex justify-end">
                          <TableDropdown>
                            <button onClick={() => viewRecordDetails(record)} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                              View Details
                            </button>
                            {record.status !== 'MATCHED' && (
                              <button onClick={() => resolveRecord(record)} className="w-full text-left px-4 py-2.5 text-sm text-emerald-600 hover:bg-emerald-50 transition-colors">
                                Resolve Record
                              </button>
                            )}
                          </TableDropdown>
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
            totalItems={meta?.total || 0} 
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedRecord && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold text-slate-900">Reconciliation Details</h3>
              <button onClick={() => setShowDetailsModal(false)} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-500 mb-1 text-xs uppercase tracking-wider">Ref ID</p>
                  <p className="font-medium text-slate-900 truncate" title={selectedRecord.id}>{selectedRecord.id?.split('-')[0]}...</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1 text-xs uppercase tracking-wider">Loan ID</p>
                  <p className="font-medium text-slate-900 truncate" title={selectedRecord.loanId}>{selectedRecord.loanId?.split('-')[0]}...</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1 text-xs uppercase tracking-wider">Customer Name</p>
                  <p className="font-medium text-slate-900">{selectedRecord.loan?.customerName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1 text-xs uppercase tracking-wider">Account Number</p>
                  <p className="font-medium text-slate-900">{selectedRecord.loan?.accountNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1 text-xs uppercase tracking-wider">IPPIS Number</p>
                  <p className="font-medium text-slate-900">{selectedRecord.loan?.ippisNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1 text-xs uppercase tracking-wider">Agency</p>
                  <p className="font-medium text-slate-900">{selectedRecord.loan?.agency || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1 text-xs uppercase tracking-wider">Product</p>
                  <p className="font-medium text-slate-900">{selectedRecord.loan?.product || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1 text-xs uppercase tracking-wider">Interest Rate</p>
                  <p className="font-medium text-slate-900">{selectedRecord.loan?.interestRatePercent ? `${selectedRecord.loan.interestRatePercent}%` : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1 text-xs uppercase tracking-wider">Period</p>
                  <p className="font-medium text-slate-900">{selectedRecord.period || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1 text-xs uppercase tracking-wider">Disbursement Date</p>
                  <p className="font-medium text-slate-900">{selectedRecord.loan?.disbursementDate ? new Date(selectedRecord.loan.disbursementDate).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
              <button onClick={() => setShowDetailsModal(false)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
