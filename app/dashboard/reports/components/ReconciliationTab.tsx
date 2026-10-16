"use client";

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import PulseLoader from '@/app/components/ui/PulseLoader';
import Pagination from '@/app/components/ui/Pagination';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/app/components/ui/Select';
import { MonthPicker } from '@/app/components/ui/MonthPicker';
import TableDropdown from '@/app/components/ui/TableDropdown';
import { useReconciliation } from '@/app/composables/modules/useReconciliation';
import { FileSpreadsheet, Eye, Scale, CheckCircle2, AlertTriangle, AlertCircle, Clock } from 'lucide-react';

export default function ReconciliationTab() {
  const [isLoading, setIsLoading] = useState(true);
  const { reconciliation, fetchReconciliation, meta } = useReconciliation();

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

  const paginatedRecords = useMemo(() => {
    return recordsList;
  }, [recordsList]);

  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const viewRecordDetails = (record: any) => {
    setSelectedRecord(record);
    setShowDetailsModal(true);
  };

  // KPI Calculations based on real status enum: MATCHED | UNDER_PAID | OVER_PAID | NO_DEDUCTION_FOUND
  const matchedCount = recordsList.filter(r => r.status === 'MATCHED').length;
  const underPaidCount = recordsList.filter(r => r.status === 'UNDER_PAID').length;
  const overPaidCount = recordsList.filter(r => r.status === 'OVER_PAID').length;
  const noDeductionCount = recordsList.filter(r => r.status === 'NO_DEDUCTION_FOUND').length;

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="py-12">
          <PulseLoader />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">Finance Reconciliation</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Repayment variances computed after disbursed-loans and repayment-schedule batch uploads.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowFilter(!showFilter)}
                className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-xs font-medium text-foreground hover:bg-muted/30 transition-colors shadow-sm"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                Filters
                <svg className={`w-3 h-3 transition-transform ${showFilter ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
              <Link 
                href="/dashboard/broadsheet" 
                className="bg-[#018752] hover:bg-[#016f43] text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Upload Schedules
              </Link>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-card rounded-2xl p-4 sm:p-5 border border-border">
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Records</div>
              <div className="text-2xl font-bold text-foreground">{recordsList.length}</div>
              <div className="text-[11px] text-muted-foreground mt-1">Variances evaluated</div>
            </div>
            <div className="bg-emerald-50/60 dark:bg-emerald-950/20 rounded-2xl p-4 sm:p-5 border border-emerald-200/60 dark:border-emerald-900/40">
              <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">Matched</div>
              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{matchedCount}</div>
              <div className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-1">Exact deduction matches</div>
            </div>
            <div className="bg-amber-50/60 dark:bg-amber-950/20 rounded-2xl p-4 sm:p-5 border border-amber-200/60 dark:border-amber-900/40">
              <div className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">Under / Over Paid</div>
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">{underPaidCount + overPaidCount}</div>
              <div className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-1">{underPaidCount} under / {overPaidCount} over</div>
            </div>
            <div className="bg-rose-50/60 dark:bg-rose-950/20 rounded-2xl p-4 sm:p-5 border border-rose-200/60 dark:border-rose-900/40">
              <div className="text-[11px] font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wider mb-1">No Deduction</div>
              <div className="text-2xl font-bold text-rose-700 dark:text-rose-400">{noDeductionCount}</div>
              <div className="text-[11px] text-rose-600/80 dark:text-rose-400/80 mt-1">Missing payroll deductions</div>
            </div>
          </div>
          
          {/* Filters Panel */}
          {showFilter && (
            <div className="bg-card p-5 rounded-2xl border border-border shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Agency</label>
                  <input 
                    value={filterParams.agency} 
                    onChange={e => setFilterParams({ ...filterParams, agency: e.target.value })} 
                    placeholder="e.g. NPF, NSCDC" 
                    className="w-full text-xs h-9 px-3 bg-muted/20 border border-border rounded-lg outline-none focus:border-primary text-foreground"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
                  <Select value={filterParams.matchStatus} onValueChange={v => setFilterParams({ ...filterParams, matchStatus: v === 'ALL' ? '' : v })}>
                    <SelectTrigger className="w-full text-xs h-9 bg-muted/20"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Statuses</SelectItem>
                      <SelectItem value="MATCHED">Matched</SelectItem>
                      <SelectItem value="UNDER_PAID">Under Paid</SelectItem>
                      <SelectItem value="OVER_PAID">Over Paid</SelectItem>
                      <SelectItem value="NO_DEDUCTION_FOUND">No Deduction Found</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Period (YYYY-MM)</label>
                  <MonthPicker
                    value={filterParams.period}
                    onChange={(period) => setFilterParams({ ...filterParams, period })}
                    placeholder="Select Period"
                  />
                </div>
                <div className="flex items-end">
                  <button onClick={clearFilters} className="h-9 px-4 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-lg transition-colors border border-border">
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-full text-left border-collapse">
                <thead className="bg-[#E9F4EE] dark:bg-emerald-950/20">
                  <tr>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Ref ID</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Customer</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Agency</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Period</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Expected</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Actual</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Variance</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3.5 text-right text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-sm text-foreground">
                  {paginatedRecords.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center text-muted-foreground">
                        No reconciliation variance records found.
                      </td>
                    </tr>
                  ) : (
                    paginatedRecords.map((record) => {
                      const varianceNum = Number(record.variance || 0);
                      return (
                        <tr key={record.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">{record.id?.split('-')[0]}</td>
                          <td className="px-4 py-3.5 font-medium text-foreground">{record.loan?.customerName || 'N/A'}</td>
                          <td className="px-4 py-3.5 text-xs text-muted-foreground">{record.loan?.agency || '—'}</td>
                          <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">{record.period || '—'}</td>
                          <td className="px-4 py-3.5 text-muted-foreground">₦{Number(record.expectedAmount || 0).toLocaleString()}</td>
                          <td className="px-4 py-3.5 text-muted-foreground">₦{Number(record.actualAmount || 0).toLocaleString()}</td>
                          <td className="px-4 py-3.5">
                            <span className={`px-2 py-0.5 rounded text-xs font-mono font-medium whitespace-nowrap ${varianceNum < 0 ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' : varianceNum > 0 ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'}`}>
                              ₦{varianceNum.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap ${
                              record.status === 'MATCHED'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                : record.status === 'UNDER_PAID' || record.status === 'OVER_PAID'
                                ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                                : 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                            }`}>
                              {record.status?.replace(/_/g, ' ') || 'UNKNOWN'}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <button
                              onClick={() => viewRecordDetails(record)}
                              className="text-xs px-2.5 py-1 bg-muted/40 hover:bg-muted/70 text-foreground font-medium rounded-lg transition-colors inline-flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              Details
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl max-w-xl w-full p-6 border border-border shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-border/50">
              <h3 className="text-base font-bold text-foreground">Reconciliation Variance Details</h3>
              <button onClick={() => setShowDetailsModal(false)} className="p-1.5 text-muted-foreground hover:bg-muted/50 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-lg bg-muted/20 border border-border/40">
                  <p className="text-muted-foreground text-[10px] uppercase tracking-wider">Ref ID</p>
                  <p className="font-mono font-medium text-foreground mt-0.5 truncate" title={selectedRecord.id}>{selectedRecord.id}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-muted/20 border border-border/40">
                  <p className="text-muted-foreground text-[10px] uppercase tracking-wider">Period</p>
                  <p className="font-mono font-medium text-foreground mt-0.5">{selectedRecord.period || 'N/A'}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-muted/20 border border-border/40">
                  <p className="text-muted-foreground text-[10px] uppercase tracking-wider">Customer Name</p>
                  <p className="font-medium text-foreground mt-0.5">{selectedRecord.loan?.customerName || 'N/A'}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-muted/20 border border-border/40">
                  <p className="text-muted-foreground text-[10px] uppercase tracking-wider">Account Number</p>
                  <p className="font-mono font-medium text-foreground mt-0.5">{selectedRecord.loan?.accountNumber || 'N/A'}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-muted/20 border border-border/40">
                  <p className="text-muted-foreground text-[10px] uppercase tracking-wider">IPPIS Number</p>
                  <p className="font-mono font-medium text-foreground mt-0.5">{selectedRecord.loan?.ippisNumber || 'N/A'}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-muted/20 border border-border/40">
                  <p className="text-muted-foreground text-[10px] uppercase tracking-wider">Agency</p>
                  <p className="font-medium text-foreground mt-0.5">{selectedRecord.loan?.agency || 'N/A'}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-muted/20 border border-border/40">
                  <p className="text-muted-foreground text-[10px] uppercase tracking-wider">Expected Deduction</p>
                  <p className="font-semibold text-foreground mt-0.5">₦{Number(selectedRecord.expectedAmount || 0).toLocaleString()}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-muted/20 border border-border/40">
                  <p className="text-muted-foreground text-[10px] uppercase tracking-wider">Actual Deduction</p>
                  <p className="font-semibold text-foreground mt-0.5">₦{Number(selectedRecord.actualAmount || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-border/50 flex justify-end">
              <button onClick={() => setShowDetailsModal(false)} className="px-5 py-2 bg-muted/40 hover:bg-muted/70 text-foreground rounded-lg text-xs font-medium transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
