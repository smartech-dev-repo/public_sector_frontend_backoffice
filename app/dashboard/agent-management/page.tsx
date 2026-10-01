"use client";

import { useEffect, useState } from 'react';
import { useAgents } from '@/app/composables/modules/useAgents';
import { useToast } from '@/app/composables/useToast';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import { createPortal } from 'react-dom';
import { useConfirm } from '@/app/composables/useConfirm';
import TableDropdown from '@/app/components/ui/TableDropdown';
import Pagination from '@/app/components/ui/Pagination';
import Link from 'next/link';
import CustomDateRangePicker from '@/app/components/ui/CustomDateRangePicker';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/app/components/ui/Select';

export default function AgentManagementPage() {
  const { confirm } = useConfirm();

  const { loading, error, agents, fetchAgents, approveAgent, rejectAgent, resendCredentials, meta } = useAgents();
  const { addToast } = useToast();

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  
  const [statusFilter, setStatusFilter] = useState('');
  const [qFilter, setQFilter] = useState('');
  const [createdRange, setCreatedRange] = useState('');
  const [reviewedRange, setReviewedRange] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  useEffect(() => {
    const params: any = { page: currentPage, limit: itemsPerPage };
    if (statusFilter && statusFilter !== 'none') params.status = statusFilter;
    if (qFilter.trim()) params.q = qFilter.trim();
    if (createdRange) {
      const [from, to] = createdRange.split(' to ');
      if (from) params.createdFrom = from;
      if (to) params.createdTo = to;
    }
    if (reviewedRange) {
      const [from, to] = reviewedRange.split(' to ');
      if (from) params.reviewedFrom = from;
      if (to) params.reviewedTo = to;
    }
    fetchAgents(params);
  }, [fetchAgents, currentPage, itemsPerPage, statusFilter, qFilter, createdRange, reviewedRange]);

  const handleApprove = async (id: string) => {
    const confirmed = await confirm({ message: 'Are you sure you want to approve this agent?' });
    if (!confirmed) return;
    try {
      await approveAgent(id);
      addToast('Agent approved successfully', 'success');
      fetchAgents();
    } catch (e: any) {
      addToast(e?.response?.data?.message || 'Failed to approve agent', 'error');
    }
  };

  const handleResendCredentials = async (id: string) => {
    const confirmed = await confirm({ message: 'Are you sure you want to resend credentials to this agent?' });
    if (!confirmed) return;
    try {
      await resendCredentials(id);
      addToast('Credentials resent successfully', 'success');
    } catch (e: any) {
      addToast(e?.response?.data?.message || 'Failed to resend credentials', 'error');
    }
  };

  const openRejectModal = (agent: any) => {
    setSelectedAgent(agent);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      addToast('Reason is required', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await rejectAgent(selectedAgent.id, { reason: rejectReason });
      addToast('Agent rejected', 'success');
      setShowRejectModal(false);
      fetchAgents();
    } catch (e: any) {
      addToast(e?.response?.data?.message || 'Failed to reject agent', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-foreground">Agent Management</h1>
      </div>

      {/* Filters Area */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full text-sm font-medium text-foreground/90 hover:bg-muted/30 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
            Filters
            <svg className={`w-4 h-4 transition-transform ${showFilter ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>
        </div>

        {showFilter && (
          <div className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Search</label>
                <input 
                  type="text"
                  placeholder="Search by name, email, phone..."
                  value={qFilter}
                  onChange={(e) => setQFilter(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg text-sm bg-card border-border outline-none focus:ring-1 focus:ring-emerald-200 focus:border-emerald-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full bg-card"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">All Statuses</SelectItem>
                    <SelectItem value="PENDING_REVIEW">PENDING REVIEW</SelectItem>
                    <SelectItem value="APPROVED">APPROVED</SelectItem>
                    <SelectItem value="REJECTED">REJECTED</SelectItem>
                    <SelectItem value="BLOCKED">BLOCKED</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 w-full z-[60] relative">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Created Date</label>
                <CustomDateRangePicker 
                  value={createdRange}
                  onChange={setCreatedRange}
                  placeholder="Select created date"
                />
              </div>
              <div className="space-y-1.5 w-full z-[50] relative">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Reviewed Date</label>
                <CustomDateRangePicker 
                  value={reviewedRange}
                  onChange={setReviewedRange}
                  placeholder="Select reviewed date"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => { setQFilter(''); setStatusFilter('none'); setCreatedRange(''); setReviewedRange(''); }} className="px-5 py-2 bg-card border border-border rounded-full text-sm font-medium text-foreground/90 hover:bg-muted/30 transition-colors">Clear Filters</button>
            </div>
          </div>
        )}
      </div>

      {loading && <PulseLoader />}
      {!loading && error && <div className="text-red-500 py-12 text-center">{error}</div>}
      
      {!loading && !error && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden relative w-full max-w-full shadow-sm">
          {agents.length === 0 && <EmptyState title="No agents found." />}
          {agents.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-[#E9F4EE] dark:bg-emerald-950/20">
                  <tr>
                    <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Date Created</th>
                    <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Phone</th>
                    <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-4 text-right text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {agents.map((agent: any) => (
                    <tr key={agent.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground font-mono">{new Date(agent.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground">{agent.fullName || `${agent.firstName} ${agent.lastName}`}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground">{agent.email}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground">{agent.phone || '-'}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <span className="px-2 py-1 bg-muted/50 rounded text-xs font-medium">{agent.status || agent.reviewStatus}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <TableDropdown>
                          {agent.status === 'PENDING_REVIEW' && (
                            <>
                              <button onClick={() => handleApprove(agent.id)} className="w-full text-left px-4 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50 transition-colors flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                Approve
                              </button>
                              <button onClick={() => openRejectModal(agent)} className="w-full text-left px-4 py-2.5 text-sm font-medium text-rose-700 hover:bg-rose-50 transition-colors flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                Reject
                              </button>
                              <div className="h-px bg-muted/50 my-1.5"></div>
                            </>
                          )}
                          <button onClick={() => handleResendCredentials(agent.id)} className="w-full text-left px-4 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-50 transition-colors flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                            Resend Credentials
                          </button>
                          <Link href={`/dashboard/agent/${agent.id}`} className="w-full text-left px-4 py-2.5 text-sm font-medium text-foreground/90 hover:bg-muted/30 transition-colors flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                            View Details
                          </Link>
                        </TableDropdown>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {agents.length > 0 && (
            <Pagination 
              totalItems={meta?.total || 0}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          )}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="fixed inset-0 bg-slate-900 dark:bg-slate-800/50 backdrop-blur-sm" onClick={() => setShowRejectModal(false)}></div>
          <div className="relative bg-card rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-semibold text-foreground mb-4">Reject Agent</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground/90 mb-1">Reason for Rejection</label>
                <textarea 
                  value={rejectReason} 
                  onChange={(e) => setRejectReason(e.target.value)} 
                  className="w-full px-4 py-2 border rounded-lg min-h-[100px]" 
                  placeholder="Enter reason..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 bg-muted/50 text-foreground/90 rounded-lg">Cancel</button>
              <button onClick={handleReject} disabled={submitting} className="px-4 py-2 bg-rose-600 text-white rounded-lg disabled:opacity-50">
                {submitting ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </main>
  );
}
