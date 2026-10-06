"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import { useAgents } from '@/app/composables/modules/useAgents';
import { useLoans } from '@/app/composables/modules/useLoans';
import { useSessions } from '@/app/composables/modules/useSessions';
import { useToast } from '@/app/composables/useToast';
import PulseLoader from '@/app/components/ui/PulseLoader';
import Pagination from '@/app/components/ui/Pagination';
import DatePicker from '@/app/components/ui/DatePicker';
import { useConfirm } from '@/app/composables/useConfirm';

export default function AgentPage({ params }: { params: Promise<{ id: string }> }) {
 const { confirm } = useConfirm();
 const router = useRouter();
 const { id } = use(params);
 
 const { getAgentById, approveAgent, rejectAgent, resendCredentials } = useAgents();
 const { revokeAgentSessions } = useSessions();
 const { clientLoans, fetchClientLoans, meta, loading: loansLoading } = useLoans();
 const { addToast } = useToast();

 const [application, setApplication] = useState<any>(null);
 const [loading, setLoading] = useState(true);
 const [submitting, setSubmitting] = useState(false);

 // Filters for loans table
 const [showFilter, setShowFilter] = useState(false);
 const [filterParams, setFilterParams] = useState({ search: '', dateRange: '' });
 const [page, setPage] = useState(1);
 const [limit, setLimit] = useState(10);

 const fetchAgentDetails = async () => {
  setLoading(true);
  try {
   const data = await getAgentById(id);
   setApplication(data);
  } catch (err: any) {
   addToast('Failed to load agent details', 'error');
  } finally {
   setLoading(false);
  }
 };

 useEffect(() => {
  fetchAgentDetails();
 }, [id]);

 useEffect(() => {
  const params: any = { agentId: id, page, limit };
  if (filterParams.search) params.q = filterParams.search;
  fetchClientLoans(params);
 }, [fetchClientLoans, id, page, limit, filterParams]);

 const clearFilters = () => {
  setFilterParams({ search: '', dateRange: '' });
 };

 const handleApprove = async () => {
  const confirmed = await confirm({ message: 'Are you sure you want to approve this agent?' });
  if (!confirmed) return;
  setSubmitting(true);
  try {
   await approveAgent(application.id);
   addToast('Agent approved successfully', 'success');
   await fetchAgentDetails();
  } catch (err: any) {
   addToast(err?.response?.data?.message || 'Failed to approve', 'error');
  } finally {
   setSubmitting(false);
  }
 };

 const handleReject = async () => {
  const confirmed = await confirm({ message: 'Are you sure you want to reject this agent?' });
  if (!confirmed) return;
  setSubmitting(true);
  try {
   await rejectAgent(application.id, { reason: 'Rejected by admin' });
   addToast('Application rejected successfully', 'success');
   await fetchAgentDetails();
  } catch (err: any) {
   addToast(err?.response?.data?.message || 'Failed to reject', 'error');
  } finally {
   setSubmitting(false);
  }
 };

 const handleResendCredentials = async () => {
  const confirmed = await confirm({ message: 'Are you sure you want to resend credentials?' });
  if (!confirmed) return;
  try {
   await resendCredentials(application.id);
   addToast('Credentials resent successfully', 'success');
  } catch (err: any) {
   addToast(err?.response?.data?.message || 'Failed to resend credentials', 'error');
  }
 };

 const handleRevokeSessions = async () => {
  const confirmed = await confirm({ message: 'Are you sure you want to revoke all sessions for this agent?' });
  if (!confirmed) return;
  try {
   await revokeAgentSessions(application.id);
   addToast('Sessions revoked successfully', 'success');
  } catch (err: any) {
   addToast(err?.response?.data?.message || 'Failed to revoke sessions', 'error');
  }
 };

 if (loading) {
  return <PulseLoader />;
 }

 if (!application) {
  return <div className="text-center py-10 text-muted-foreground">Agent not found.</div>;
 }

 return (
  <div className="space-y-3 pb-12">
   {/* Breadcrumb */}
   <div className="text-sm">
    <Link href="/dashboard/agent-management" className="text-muted-foreground/70 hover:text-muted-foreground transition-colors">Agent management</Link>
    <span className="text-muted-foreground/70 mx-2">/</span>
    <span className="text-foreground font-medium">Agent details</span>
   </div>

   {/* Action Buttons Block (for approval) */}
   {application.status === 'PENDING' && (
    <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 mb-4 flex items-center justify-between">
     <div>
      <h3 className="text-amber-800 font-semibold">Agent Pending Approval</h3>
      <p className="text-amber-700 text-sm">Please review the agent details before approving.</p>
     </div>
     <div className="flex items-center gap-3">
      <button onClick={handleReject} disabled={submitting} className="px-4 py-2 bg-card text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors text-sm font-medium">
       Reject
      </button>
      <button onClick={handleApprove} disabled={submitting} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium">
       Approve Agent
      </button>
     </div>
    </div>
   )}

   {application.status === 'APPROVED' && (
    <div className="flex gap-3 mb-4 w-full">
      <button onClick={handleResendCredentials} className="flex-1 px-4 py-2 bg-card border border-border text-foreground/90 hover:bg-muted/30 rounded-lg transition-colors text-sm font-medium">
       Resend Credentials
      </button>
      <button onClick={handleRevokeSessions} className="flex-1 px-4 py-2 bg-card border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-sm font-medium">
       Revoke Sessions
      </button>
    </div>
   )}

   {/* Agent Details Grid */}
   <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-2">
    <div>
     <p className="text-[12px] text-muted-foreground/70 mb-1">Name</p>
     <p className="text-[16px] font-semibold text-foreground">{application.fullName || `${application.firstName || ''} ${application.lastName || ''}`.trim() || 'N/A'}</p>
    </div>
    <div>
     <p className="text-[12px] text-muted-foreground/70 mb-1">Phone</p>
     <p className="text-[16px] font-semibold text-foreground">{application.phone || 'N/A'}</p>
    </div>
    <div>
     <p className="text-[12px] text-muted-foreground/70 mb-1">Email</p>
     <p className="text-[16px] font-semibold text-foreground">{application.email || 'N/A'}</p>
    </div>
    <div>
     <p className="text-[12px] text-muted-foreground/70 mb-1">Status</p>
     <p className="text-[16px] font-semibold text-foreground">{application.status || 'N/A'}</p>
    </div>
    <div>
     <p className="text-[12px] text-muted-foreground/70 mb-1">Created At</p>
     <p className="text-[16px] font-semibold text-foreground">{application.createdAt ? new Date(application.createdAt).toLocaleDateString() : 'N/A'}</p>
    </div>
    <div>
     <p className="text-[12px] text-muted-foreground/70 mb-1">Document</p>
     <p className="text-[16px] font-semibold text-blue-600">
      {application.cvKey ? <a href={`/${application.cvKey}`} target="_blank" rel="noopener noreferrer" className="hover:underline">View Document</a> : 'N/A'}
     </p>
    </div>
    <div className="md:col-span-2">
     <p className="text-[12px] text-muted-foreground/70 mb-1">Address</p>
     <p className="text-[16px] font-semibold text-foreground">{application.address || 'N/A'}</p>
     
     {/* Assignee Tag */}
     <div className="mt-4 inline-flex items-center gap-3 bg-emerald-50/50 border border-emerald-100 rounded-xl p-2.5">
      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-semibold">
       {(application.fullName || application.email || 'A').charAt(0).toUpperCase()}
      </div>
      <div className="flex flex-col pr-4">
       <span className="text-[13px] font-medium text-foreground leading-tight">{application.fullName || 'Agent'}</span>
       <span className="text-[10px] text-muted-foreground">{application.email} &nbsp;&bull;&nbsp; {application.phone || 'No phone'}</span>
      </div>
     </div>
    </div>
   </div>

   {/* Summary Cards */}
   <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
    <div className="bg-muted/30 rounded-xl p-5 border border-border/50">
     <h3 className="text-[13px] text-muted-foreground font-medium mb-2">Total Loans Originated</h3>
     <div className="text-3xl font-bold text-emerald-600 mb-1">{meta?.total || 0}</div>
    </div>
    <div className="bg-muted/30 rounded-xl p-5 border border-border/50">
     <h3 className="text-[13px] text-muted-foreground font-medium mb-2">Customers onboarded</h3>
     <div className="text-3xl font-bold text-emerald-600 mb-1">{meta?.total || 0}</div>
    </div>
    <div className="bg-muted/30 rounded-xl p-5 border border-border/50">
     <h3 className="text-[13px] text-muted-foreground font-medium mb-2">Agent Status</h3>
     <div className="text-3xl font-bold text-emerald-600 mb-1 capitalize">{application.status?.toLowerCase() || 'N/A'}</div>
    </div>
   </div>

   {/* Table Actions */}
   <div className="flex gap-3 w-full pt-4 relative">
    <span className="text-sm text-muted-foreground/70 mr-2">Showing {clientLoans.length} of {meta?.total || 0}</span>
    
    <button onClick={() => setShowFilter(!showFilter)} className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted/30 transition-colors ">
     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="8" x2="20" y2="8"></line><circle cx="9" cy="8" r="2"></circle><line x1="4" y1="16" x2="20" y2="16"></line><circle cx="15" cy="16" r="2"></circle></svg>
     Filter
    </button>

    {showFilter && (
     <div className="absolute top-10 right-40 w-80 bg-card rounded-xl border border-border/50 p-4 z-50">
      <h3 className="text-sm font-semibold text-foreground mb-3">Filter Loans</h3>
      <div className="space-y-3 mb-4">
       <input 
        value={filterParams.search}
        onChange={(e) => setFilterParams({ ...filterParams, search: e.target.value })}
        type="text" 
        placeholder="Search..." 
        className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-emerald-500" 
       />
       <DatePicker 
        value={filterParams.dateRange}
        onChange={(val) => setFilterParams({ ...filterParams, dateRange: val as any })}
        placeholder="Select date range"
       />
      </div>
      <div className="flex gap-2">
       <button onClick={clearFilters} className="flex-1 py-2 bg-muted/30 text-muted-foreground rounded-lg text-sm font-medium hover:bg-muted/50 transition-colors">Clear</button>
       <button onClick={() => setShowFilter(false)} className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">Close</button>
      </div>
     </div>
    )}
    <button className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted/30 transition-colors ">
     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
     Export as .xlsx
    </button>
   </div>

   {/* Data Table */}
   <div className="bg-card rounded-xl border border-border/50 overflow-hidden mt-4">
    <div className="overflow-x-auto">
     <table className="w-full text-left text-sm">
      <thead className="bg-[#E9F4EE] dark:bg-emerald-950/20">
       <tr>
        <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Customer Name</th>
        <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">IPPIS NO.</th>
        <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Status</th>
        <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Loan Amt</th>
        <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Date</th>
        <th className="px-4 py-4 text-right text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Actions</th>
       </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
       {loansLoading ? (
        <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">Loading loans...</td></tr>
       ) : clientLoans.length === 0 ? (
        <tr>
         <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No loans found for this agent.</td>
        </tr>
       ) : (
        clientLoans.map((loan: any) => (
         <tr key={loan.id} className="hover:bg-muted/30/50 transition-colors group">
          <td className="px-4 py-4 font-medium text-foreground">{loan.client?.firstName} {loan.client?.lastName}</td>
          <td className="px-4 py-4 text-muted-foreground">{loan.client?.ippisNumber || 'N/A'}</td>
          <td className="px-4 py-4 text-muted-foreground">{loan.status}</td>
          <td className="px-4 py-4 font-semibold text-foreground">₦{Number(loan.amount || 0).toLocaleString()}</td>
          <td className="px-4 py-4 text-muted-foreground">{new Date(loan.createdAt).toLocaleDateString()}</td>
          <td className="px-4 py-4 text-right">
           <button className="font-medium text-muted-foreground/70 hover:text-emerald-600 transition-colors" title="View Details">
            <Eye className="w-5 h-5 ml-auto" />
           </button>
          </td>
         </tr>
        ))
       )}
      </tbody>
     </table>
    </div>
   </div>
   
   {/* Pagination */}
   {meta && meta.total > 0 && (
    <div className="pt-4">
     <Pagination 
      totalItems={meta.total} 
      currentPage={page}
      itemsPerPage={limit}
      onPageChange={setPage}
      onItemsPerPageChange={setLimit}
     />
    </div>
   )}
  </div>
 );
}
