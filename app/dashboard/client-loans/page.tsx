"use client";

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLoans } from '@/app/composables/modules/useLoans';
import { useToast } from '@/app/composables/useToast';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import { createPortal } from 'react-dom';
import Pagination from '@/app/components/ui/Pagination';
import CustomDateRangePicker from '@/app/components/ui/CustomDateRangePicker';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/app/components/ui/Select';

export default function ClientLoansPage() {
  return (
    <Suspense fallback={<PulseLoader />}>
      <ClientLoansContent />
    </Suspense>
  );
}

function ClientLoansContent() {
  const searchParams = useSearchParams();
  const { loading, error, clientLoans, fetchClientLoans, getClientLoanRepaymentPlan, meta } = useLoans();
  const { addToast } = useToast();

  const [clientIdFilter, setClientIdFilter] = useState(searchParams.get('clientId') || '');
  const [statusFilter, setStatusFilter] = useState('');
  const [agencyFilter, setAgencyFilter] = useState('');
  const [disbursedRange, setDisbursedRange] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  const [repaymentPlan, setRepaymentPlan] = useState<any>(null);
  const [showRepaymentModal, setShowRepaymentModal] = useState(false);
  const [repaymentLoading, setRepaymentLoading] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

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
  }, [clientLoans]);

  const clearFilters = () => {
    setClientIdFilter('');
    setStatusFilter('');
    setAgencyFilter('');
    setDisbursedRange('');
    setPage(1);
  };

  useEffect(() => {
    if (!clientIdFilter.trim()) return;
    const params: any = { page, limit, clientId: clientIdFilter.trim() };
    if (statusFilter && statusFilter !== 'none') params.status = statusFilter;
    if (agencyFilter) params.agency = agencyFilter;
    if (disbursedRange) {
      const [from, to] = disbursedRange.split(' to ');
      if (from) params.disbursedFrom = from;
      if (to) params.disbursedTo = to;
    }
    fetchClientLoans(params);
  }, [fetchClientLoans, page, limit, clientIdFilter, statusFilter, agencyFilter, disbursedRange]);

  const handleViewRepayment = async (loan: any) => {
    setSelectedLoan(loan);
    setRepaymentLoading(true);
    setShowRepaymentModal(true);
    try {
      const data = await getClientLoanRepaymentPlan(loan.id);
      let plan = data;
      if (data?.data) plan = data.data;
      setRepaymentPlan(plan);
    } catch (e: any) {
      addToast(e?.response?.data?.message || 'Failed to load repayment plan', 'error');
      setShowRepaymentModal(false);
    } finally {
      setRepaymentLoading(false);
    }
  };

  const closeRepaymentModal = () => {
    setShowRepaymentModal(false);
    setRepaymentPlan(null);
    setSelectedLoan(null);
  };

  const statusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE': return 'bg-emerald-100 text-emerald-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      case 'DEFAULTED': return 'bg-rose-100 text-rose-800';
      case 'PENDING': return 'bg-amber-100 text-amber-800';
      default: return 'bg-muted/50 text-foreground';
    }
  };

  return (
    <main className="w-full">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold text-foreground">Client Loans</h1>
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
        {showFilter && (
          <div className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Client ID</label>
                <input
                  value={clientIdFilter}
                  onChange={(e) => { setClientIdFilter(e.target.value); setPage(1); }}
                  type="text"
                  placeholder="Client ID (Required)..."
                  className="w-full px-4 py-2 border rounded-lg text-sm bg-card border-border outline-none focus:ring-1 focus:ring-emerald-200 focus:border-emerald-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
                <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val === 'none' ? '' : val); setPage(1); }}>
                  <SelectTrigger className="w-full bg-card"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">All Statuses</SelectItem>
                    <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                    <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                    <SelectItem value="DEFAULTED">DEFAULTED</SelectItem>
                    <SelectItem value="PENDING">PENDING</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Agency</label>
                <input 
                  type="text"
                  placeholder="Agency (e.g. NPF)..."
                  value={agencyFilter}
                  onChange={(e) => { setAgencyFilter(e.target.value); setPage(1); }}
                  className="w-full px-4 py-2 border rounded-lg text-sm bg-card border-border outline-none focus:ring-1 focus:ring-emerald-200 focus:border-emerald-400"
                />
              </div>
              <div className="space-y-1.5 w-full z-[60] relative">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Disbursed Date</label>
                <CustomDateRangePicker 
                  value={disbursedRange}
                  onChange={(val: any) => { setDisbursedRange(val); setPage(1); }}
                  placeholder="Disbursed Date"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={clearFilters} className="px-5 py-2 bg-card border border-border rounded-full text-sm font-medium text-foreground/90 hover:bg-muted/30 transition-colors">Clear Filters</button>
            </div>
          </div>
        )}
      </div>

      {loading && <PulseLoader />}
      {!loading && error && <div className="text-red-500 py-12 text-center">{error}</div>}

      {!loading && !error && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden relative w-full max-w-full shadow-sm">
          {clientLoans.length === 0 && (
            <EmptyState 
              title={!clientIdFilter.trim() ? "Search for Client Loans" : "No client loans found."}
              description={!clientIdFilter.trim() ? "Enter a Client ID in the filter above to view their loans." : undefined}
            />
          )}
          {clientLoans.length > 0 && (
            <>
              {canScrollLeft && (
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); if(tableContainerRef.current) tableContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' }); }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-card border border-border flex items-center justify-center z-10 text-muted-foreground/70 hover:text-muted-foreground shadow-sm"
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
                <table className="min-w-full divide-y divide-slate-200 min-w-[1000px]">
                  <thead className="bg-[#E9F4EE] dark:bg-emerald-950/20">
                    <tr>
                      <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Loan ID</th>
                      <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Client</th>
                      <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Outstanding</th>
                      <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Tenor</th>
                      <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Disbursed At</th>
                      <th className="px-4 py-4 text-right text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {clientLoans.map((loan: any) => (
                      <tr key={loan.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground font-mono">{loan.id?.slice(0, 8)}...</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground font-medium">{loan.clientId?.slice(0, 8) || '-'}...</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">₦{loan.amount?.toLocaleString() || loan.principal?.toLocaleString() || '0'}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">₦{loan.outstandingBalance?.toLocaleString() || loan.outstanding?.toLocaleString() || '0'}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">{loan.tenor || loan.tenorMonths || '-'} months</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${statusColor(loan.status)}`}>
                            {loan.status || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground font-mono">
                          {loan.disbursedAt || loan.createdAt
                            ? new Date(loan.disbursedAt || loan.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                            : '-'
                          }
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleViewRepayment(loan)}
                            className="text-emerald-600 hover:text-emerald-800 font-medium transition-colors"
                          >
                            View Repayment
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
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-card border border-border flex items-center justify-center z-10 text-muted-foreground/70 hover:text-muted-foreground shadow-sm"
                  type="button"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </button>
              )}
              {meta.total > 0 && (
                <Pagination
                  totalItems={meta.total}
                  currentPage={page}
                  itemsPerPage={meta.limit || 25}
                  onPageChange={(p: number) => setPage(p)}
                  onItemsPerPageChange={() => {}}
                />
              )}
            </>
          )}
        </div>
      )}

      {/* Repayment Plan Modal */}
      {showRepaymentModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="fixed inset-0 bg-slate-900 dark:bg-slate-800/50 backdrop-blur-sm" onClick={closeRepaymentModal}></div>
          <div className="relative bg-card rounded-2xl p-6 w-full max-w-2xl mx-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[80vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                Repayment Plan {selectedLoan?.id ? `(${selectedLoan.id.slice(0, 8)}...)` : ''}
              </h3>
              <button onClick={closeRepaymentModal} className="text-muted-foreground/70 hover:text-muted-foreground">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            {repaymentLoading && <PulseLoader />}

            {!repaymentLoading && repaymentPlan && (
              <div>
                {/* Summary */}
                {(repaymentPlan.totalRepayment || repaymentPlan.monthlyRepayment) && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-3">
                    {repaymentPlan.totalRepayment && (
                      <div className="bg-muted/30 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground">Total Repayment</p>
                        <p className="text-lg font-bold text-foreground">₦{repaymentPlan.totalRepayment?.toLocaleString()}</p>
                      </div>
                    )}
                    {repaymentPlan.monthlyRepayment && (
                      <div className="bg-muted/30 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground">Monthly Repayment</p>
                        <p className="text-lg font-bold text-foreground">₦{repaymentPlan.monthlyRepayment?.toLocaleString()}</p>
                      </div>
                    )}
                    {repaymentPlan.interestRate && (
                      <div className="bg-muted/30 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground">Interest Rate</p>
                        <p className="text-lg font-bold text-foreground">{repaymentPlan.interestRate}%</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Schedule Table */}
                {(repaymentPlan.schedule || repaymentPlan.installments) && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                      <thead className="bg-[#E9F4EE] dark:bg-emerald-950/20">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase">#</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase">Due Date</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase">Amount</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(repaymentPlan.schedule || repaymentPlan.installments).map((item: any, index: number) => (
                          <tr key={index} className="hover:bg-muted/30">
                            <td className="px-4 py-2 text-muted-foreground">{item.installmentNumber || index + 1}</td>
                            <td className="px-4 py-2 text-muted-foreground font-mono">
                              {item.dueDate ? new Date(item.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                            </td>
                            <td className="px-4 py-2 text-foreground font-medium">₦{(item.amount || item.installmentAmount)?.toLocaleString() || '0'}</td>
                            <td className="px-4 py-2">
                              <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${statusColor(item.status)}`}>
                                {item.status || 'PENDING'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Fallback: show raw data if no schedule */}
                {!repaymentPlan.schedule && !repaymentPlan.installments && (
                  <pre className="bg-muted/30 rounded-lg p-4 text-xs overflow-x-auto">{JSON.stringify(repaymentPlan, null, 2)}</pre>
                )}
              </div>
            )}

            {!repaymentLoading && !repaymentPlan && (
              <p className="text-muted-foreground text-sm text-center py-6">No repayment plan data available.</p>
            )}
          </div>
        </div>,
        document.body
      )}
    </main>
  );
}
