"use client";

import { useEffect, useState } from 'react';
import { useLoans } from '@/app/composables/modules/useLoans';
import { useToast } from '@/app/composables/useToast';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import { createPortal } from 'react-dom';
import Pagination from '@/app/components/ui/Pagination';

export default function ClientLoansPage() {
  const { loading, error, clientLoans, fetchClientLoans, getClientLoanRepaymentPlan, meta } = useLoans();
  const { addToast } = useToast();

  const [clientIdFilter, setClientIdFilter] = useState('');
  const [repaymentPlan, setRepaymentPlan] = useState<any>(null);
  const [showRepaymentModal, setShowRepaymentModal] = useState(false);
  const [repaymentLoading, setRepaymentLoading] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const params: any = { page };
    if (clientIdFilter.trim()) params.clientId = clientIdFilter.trim();
    fetchClientLoans(params);
  }, [fetchClientLoans, page, clientIdFilter]);

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
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <main className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Client Loans</h1>
        <div className="flex items-center gap-3">
          <input
            value={clientIdFilter}
            onChange={(e) => { setClientIdFilter(e.target.value); setPage(1); }}
            type="text"
            placeholder="Filter by Client ID..."
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all w-64"
          />
        </div>
      </div>

      {loading && <PulseLoader />}
      {!loading && error && <div className="text-red-500 py-12 text-center">{error}</div>}

      {!loading && !error && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {clientLoans.length === 0 && <EmptyState title="No client loans found." />}
          {clientLoans.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-[#E9F4EE]">
                    <tr>
                      <th className="px-4 py-4 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">Loan ID</th>
                      <th className="px-4 py-4 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">Client</th>
                      <th className="px-4 py-4 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-4 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">Outstanding</th>
                      <th className="px-4 py-4 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">Tenor</th>
                      <th className="px-4 py-4 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">Status</th>
                      <th className="px-4 py-4 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">Disbursed At</th>
                      <th className="px-4 py-4 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {clientLoans.map((loan: any) => (
                      <tr key={loan.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600 font-mono">{loan.id?.slice(0, 8)}...</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-800 font-medium">{loan.clientId?.slice(0, 8) || '-'}...</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">₦{loan.amount?.toLocaleString() || loan.principal?.toLocaleString() || '0'}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">₦{loan.outstandingBalance?.toLocaleString() || loan.outstanding?.toLocaleString() || '0'}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">{loan.tenor || loan.tenorMonths || '-'} months</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${statusColor(loan.status)}`}>
                            {loan.status || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600 font-mono">
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
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={closeRepaymentModal}></div>
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[80vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">
                Repayment Plan {selectedLoan?.id ? `(${selectedLoan.id.slice(0, 8)}...)` : ''}
              </h3>
              <button onClick={closeRepaymentModal} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            {repaymentLoading && <PulseLoader />}

            {!repaymentLoading && repaymentPlan && (
              <div>
                {/* Summary */}
                {(repaymentPlan.totalRepayment || repaymentPlan.monthlyRepayment) && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                    {repaymentPlan.totalRepayment && (
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <p className="text-xs text-slate-500">Total Repayment</p>
                        <p className="text-lg font-bold text-slate-800">₦{repaymentPlan.totalRepayment?.toLocaleString()}</p>
                      </div>
                    )}
                    {repaymentPlan.monthlyRepayment && (
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <p className="text-xs text-slate-500">Monthly Repayment</p>
                        <p className="text-lg font-bold text-slate-800">₦{repaymentPlan.monthlyRepayment?.toLocaleString()}</p>
                      </div>
                    )}
                    {repaymentPlan.interestRate && (
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <p className="text-xs text-slate-500">Interest Rate</p>
                        <p className="text-lg font-bold text-slate-800">{repaymentPlan.interestRate}%</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Schedule Table */}
                {(repaymentPlan.schedule || repaymentPlan.installments) && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                      <thead className="bg-[#E9F4EE]">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-[#018752] uppercase">#</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-[#018752] uppercase">Due Date</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-[#018752] uppercase">Amount</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-[#018752] uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(repaymentPlan.schedule || repaymentPlan.installments).map((item: any, index: number) => (
                          <tr key={index} className="hover:bg-slate-50">
                            <td className="px-4 py-2 text-slate-600">{item.installmentNumber || index + 1}</td>
                            <td className="px-4 py-2 text-slate-600 font-mono">
                              {item.dueDate ? new Date(item.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                            </td>
                            <td className="px-4 py-2 text-slate-800 font-medium">₦{(item.amount || item.installmentAmount)?.toLocaleString() || '0'}</td>
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
                  <pre className="bg-slate-50 rounded-lg p-4 text-xs overflow-x-auto">{JSON.stringify(repaymentPlan, null, 2)}</pre>
                )}
              </div>
            )}

            {!repaymentLoading && !repaymentPlan && (
              <p className="text-slate-500 text-sm text-center py-6">No repayment plan data available.</p>
            )}
          </div>
        </div>,
        document.body
      )}
    </main>
  );
}
