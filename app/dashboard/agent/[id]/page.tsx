"use client";

import { useEffect, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, X, Users, Banknote, ExternalLink } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useAgents } from '@/app/composables/modules/useAgents';
import { useLoans } from '@/app/composables/modules/useLoans';
import { useSessions } from '@/app/composables/modules/useSessions';
import { useToast } from '@/app/composables/useToast';
import { clients_api } from '@/app/api_factory/modules/clients';
import PulseLoader from '@/app/components/ui/PulseLoader';
import Pagination from '@/app/components/ui/Pagination';
import DatePicker from '@/app/components/ui/DatePicker';
import { useConfirm } from '@/app/composables/useConfirm';
import { useAdminPermissions } from '@/app/composables/useAdminPermissions';

export default function AgentPage({ params }: { params: Promise<{ id: string }> }) {
 const { confirm } = useConfirm();
 const router = useRouter();
 const { id } = use(params);
 
 const { hasPermission, hasAnyPermission, isSuperAdmin } = useAdminPermissions();
 const canReviewAgent = isSuperAdmin || hasPermission('agents:review');
 const canManageAccess = isSuperAdmin || hasPermission('agents:onboarding-access:manage');
 const canRevokeSessions = isSuperAdmin || hasPermission('agents:sessions:revoke');
 const canReadLoans = isSuperAdmin || hasPermission('client-loans:read');
 const canReadClients = isSuperAdmin || hasPermission('clients:read');
 const canReadDocs = isSuperAdmin || hasPermission('documents:read');
 const canSendCreds = canReviewAgent || isSuperAdmin || hasPermission('agents:recruitment:manage');

 const { getAgentById, approveAgent, rejectAgent, resendCredentials, updateOnboardingAccess } = useAgents();
 const { revokeAgentSessions } = useSessions();
 const { clientLoans, fetchClientLoans, meta, loading: loansLoading } = useLoans();
 const { addToast } = useToast();

 const [application, setApplication] = useState<any>(null);
 const [loading, setLoading] = useState(true);
 const [submitting, setSubmitting] = useState(false);
 const [previewDoc, setPreviewDoc] = useState<{ url: string; title: string; subtitle?: string } | null>(null);

 // Filters for loans table
 const [showFilter, setShowFilter] = useState(false);
 const [filterParams, setFilterParams] = useState({ search: '', dateRange: '' });
 const [page, setPage] = useState(1);
 const [limit, setLimit] = useState(10);

 // Onboarded clients state
 const [onboardedClients, setOnboardedClients] = useState<any[]>([]);
 const [clientsMeta, setClientsMeta] = useState<any>(null);
 const [clientsLoading, setClientsLoading] = useState(false);
 const [activeTab, setActiveTab] = useState<'loans' | 'clients'>(() => {
  if (isSuperAdmin || hasPermission('client-loans:read')) return 'loans';
  if (isSuperAdmin || hasPermission('clients:read')) return 'clients';
  return 'loans';
 });
 const [clientsPage, setClientsPage] = useState(1);
 const [clientsLimit, setClientsLimit] = useState(10);

 const fetchAgentClients = useCallback(async () => {
  setClientsLoading(true);
  try {
   const res = await clients_api.getClients({ agentId: id, page: clientsPage, limit: clientsLimit });
   const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
   setOnboardedClients(list);
   if (res.data?.meta) setClientsMeta(res.data.meta);
  } catch {
   // graceful fallback
  } finally {
   setClientsLoading(false);
  }
 }, [id, clientsPage, clientsLimit]);

 useEffect(() => {
  fetchAgentClients();
 }, [fetchAgentClients]);

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

 const handleToggleOnboarding = async () => {
  const currentStatus = application.canOnboardClients ?? true;
  const newStatus = !currentStatus;
  const confirmed = await confirm({
   title: 'Update Onboarding Access',
   message: `Are you sure you want to ${newStatus ? 'grant' : 'restrict'} client onboarding access for this agent?`,
   confirmText: newStatus ? 'Grant Access' : 'Restrict Access'
  });
  if (!confirmed) return;
  try {
   await updateOnboardingAccess(application.id, { canOnboardClients: newStatus });
   addToast(`Onboarding access ${newStatus ? 'granted' : 'restricted'} successfully`, 'success');
   await fetchAgentDetails();
  } catch (err: any) {
   addToast(err?.response?.data?.message || 'Failed to update onboarding access', 'error');
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
   {application.status === 'PENDING' && canReviewAgent && (
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

   {application.status === 'APPROVED' && (canSendCreds || canManageAccess || canRevokeSessions) && (
    <div className="flex flex-wrap gap-3 mb-4 w-full">
     {canSendCreds && (
      <button onClick={handleResendCredentials} className="flex-1 min-w-[140px] px-4 py-2 bg-card border border-border text-foreground/90 hover:bg-muted/30 rounded-lg transition-colors text-sm font-medium">
       Resend Credentials
      </button>
     )}
     {canManageAccess && (
      <button onClick={handleToggleOnboarding} className="flex-1 min-w-[160px] px-4 py-2 bg-card border border-amber-200 text-amber-700 hover:bg-amber-50 rounded-lg transition-colors text-sm font-medium">
       {application.canOnboardClients === false ? 'Grant Onboarding Access' : 'Restrict Onboarding Access'}
      </button>
     )}
     {canRevokeSessions && (
      <button onClick={handleRevokeSessions} className="flex-1 min-w-[140px] px-4 py-2 bg-card border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-sm font-medium">
       Revoke Sessions
      </button>
     )}
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
     <p className="text-[12px] text-muted-foreground/70 mb-1">Onboarding Access</p>
     <p className="text-[16px] font-semibold text-foreground">
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
       application.canOnboardClients === false 
        ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300' 
        : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
      }`}>
       {application.canOnboardClients === false ? 'Restricted' : 'Granted'}
      </span>
     </p>
    </div>
    <div>
     <p className="text-[12px] text-muted-foreground/70 mb-1">Created At</p>
     <p className="text-[16px] font-semibold text-foreground">{application.createdAt ? new Date(application.createdAt).toLocaleDateString() : 'N/A'}</p>
    </div>
    <div>
     <p className="text-[12px] text-muted-foreground/70 mb-1">Document</p>
     <p className="text-[16px] font-semibold text-blue-600">
      {application.cvKey && canReadDocs ? (
       <button
        type="button"
        onClick={() => setPreviewDoc({
         url: `/${application.cvKey}`,
         title: `${application.fullName || 'Agent'} - Verification Document`,
         subtitle: `Agent ID: ${application.id}`
        })}
        className="text-[#018752] hover:underline inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 cursor-pointer"
       >
        <Eye className="w-3.5 h-3.5" />
        <span>View Document</span>
       </button>
      ) : application.cvKey ? 'Document on file' : 'N/A'}
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
    <div 
     onClick={() => setActiveTab('loans')}
     className={`rounded-xl p-5 border transition-all cursor-pointer ${
      activeTab === 'loans' 
       ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-500/50 shadow-xs ring-1 ring-emerald-500/30' 
       : 'bg-muted/30 border-border/50 hover:border-emerald-500/30'
     }`}
    >
     <div className="flex items-center justify-between mb-2">
      <h3 className="text-[13px] text-muted-foreground font-medium">Total Loans Originated</h3>
      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${activeTab === 'loans' ? 'bg-emerald-600 text-white' : 'bg-muted text-muted-foreground'}`}>Active Tab</span>
     </div>
     <div className="text-3xl font-bold text-emerald-600 mb-1">{meta?.total || 0}</div>
     <span className="text-[11px] text-muted-foreground">originated via agent code</span>
    </div>

    <div 
     onClick={() => setActiveTab('clients')}
     className={`rounded-xl p-5 border transition-all cursor-pointer ${
      activeTab === 'clients' 
       ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-500/50 shadow-xs ring-1 ring-emerald-500/30' 
       : 'bg-muted/30 border-border/50 hover:border-emerald-500/30'
     }`}
    >
     <div className="flex items-center justify-between mb-2">
      <h3 className="text-[13px] text-muted-foreground font-medium">Customers Onboarded</h3>
      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${activeTab === 'clients' ? 'bg-emerald-600 text-white' : 'bg-muted text-muted-foreground'}`}>Active Tab</span>
     </div>
     <div className="text-3xl font-bold text-emerald-600 mb-1">{clientsMeta?.total ?? onboardedClients.length}</div>
     <span className="text-[11px] text-muted-foreground">onboarded by this agent</span>
    </div>

    <div className="bg-muted/30 rounded-xl p-5 border border-border/50">
     <h3 className="text-[13px] text-muted-foreground font-medium mb-2">Agent Status</h3>
     <div className="text-3xl font-bold text-emerald-600 mb-1 capitalize">{application.status?.toLowerCase() || 'N/A'}</div>
     <span className="text-[11px] text-muted-foreground">{application.canOnboardClients === false ? 'Onboarding restricted' : 'Authorized for onboarding'}</span>
    </div>
   </div>

   {/* View Tabs Selector */}
   {(canReadLoans || canReadClients) && (
   <div className="flex items-center justify-between border-b border-border/60 pt-4">
    <div className="flex items-center gap-6">
     {canReadLoans && (
      <button
       type="button"
       onClick={() => setActiveTab('loans')}
       className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
        activeTab === 'loans'
         ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
         : 'border-transparent text-muted-foreground hover:text-foreground'
       }`}
      >
       <Banknote className="w-4 h-4" />
       <span>Originated Loans</span>
       <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-muted/60 text-muted-foreground">
        {meta?.total || 0}
       </span>
      </button>
     )}

     {canReadClients && (
      <button
       type="button"
       onClick={() => setActiveTab('clients')}
       className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
        activeTab === 'clients'
         ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
         : 'border-transparent text-muted-foreground hover:text-foreground'
       }`}
      >
       <Users className="w-4 h-4" />
       <span>Onboarded Customers</span>
       <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-muted/60 text-muted-foreground">
        {clientsMeta?.total ?? onboardedClients.length}
       </span>
      </button>
     )}
    </div>

    {activeTab === 'clients' && (
     <Link
      href={`/dashboard/clients?agentId=${id}&agentName=${encodeURIComponent(application.fullName || application.email || '')}`}
      className="pb-3 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1.5"
     >
      <span>Open in Customer Directory</span>
      <ExternalLink className="w-3.5 h-3.5" />
     </Link>
    )}
   </div>
   )}

   {/* TAB 1: LOANS TABLE */}
   {activeTab === 'loans' && canReadLoans && (
    <>
     {/* Table Actions */}
     <div className="flex gap-3 w-full pt-4 relative">
      <span className="text-sm text-muted-foreground/70 mr-2">Showing {clientLoans.length} of {meta?.total || 0} Loans</span>
      
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

     {/* Loans Data Table */}
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
    </>
   )}

   {/* TAB 2: ONBOARDED CUSTOMERS TABLE */}
   {activeTab === 'clients' && canReadClients && (
    <>
     <div className="pt-4 flex items-center justify-between">
      <span className="text-sm text-muted-foreground/70">
       Showing {onboardedClients.length} of {clientsMeta?.total || onboardedClients.length} Customers onboarded by {application.fullName || 'this agent'}
      </span>
     </div>

     <div className="bg-card rounded-xl border border-border/50 overflow-hidden mt-4">
      <div className="overflow-x-auto">
       <table className="w-full text-left text-sm">
        <thead className="bg-[#E9F4EE] dark:bg-emerald-950/20">
         <tr>
          <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Customer Name</th>
          <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">IPPIS NO.</th>
          <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Agency / Sector</th>
          <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Status</th>
          <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Onboarded Date</th>
          <th className="px-4 py-4 text-right text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Actions</th>
         </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
         {clientsLoading ? (
          <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">Loading onboarded clients...</td></tr>
         ) : onboardedClients.length === 0 ? (
          <tr>
           <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No customers onboarded by this agent yet.</td>
          </tr>
         ) : (
          onboardedClients.map((client: any) => {
           const name = client?.onboarding?.employeeName || client?.employeeName || [client?.firstName, client?.lastName].filter(Boolean).join(' ') || client?.phone || 'Unnamed Customer';
           const ippis = client?.onboarding?.ippisRecord?.staffId || client?.ippisRecord?.staffId || client?.staffId || '—';
           const sector = client?.onboarding?.agency || client?.agency || '—';
           return (
            <tr key={client.id} className="hover:bg-muted/30 transition-colors group">
             <td className="px-4 py-4 font-semibold text-foreground">
              <Link href={`/dashboard/clients/${client.id}`} className="hover:text-emerald-600 transition-colors">
               {name}
              </Link>
             </td>
             <td className="px-4 py-4 font-mono text-muted-foreground">{ippis}</td>
             <td className="px-4 py-4 text-muted-foreground">{sector}</td>
             <td className="px-4 py-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/50">
               {client.status || 'VERIFIED'}
              </span>
             </td>
             <td className="px-4 py-4 text-muted-foreground">
              {client.createdAt ? new Date(client.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
             </td>
             <td className="px-4 py-4 text-right">
              <Link 
               href={`/dashboard/clients/${client.id}`}
               className="inline-flex items-center gap-1 font-medium text-xs text-emerald-700 dark:text-emerald-400 hover:underline"
              >
               <Eye className="w-4 h-4" />
               <span>Details</span>
              </Link>
             </td>
            </tr>
           );
          })
         )}
        </tbody>
       </table>
      </div>
     </div>

     {clientsMeta && clientsMeta.total > 0 && (
      <div className="pt-4">
       <Pagination 
        totalItems={clientsMeta.total} 
        currentPage={clientsPage}
        itemsPerPage={clientsLimit}
        onPageChange={setClientsPage}
        onItemsPerPageChange={setClientsLimit}
       />
      </div>
     )}
    </>
   )}
    {/* Document Lightbox Modal */}
    {previewDoc && typeof document !== 'undefined' && createPortal(
     <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 sm:p-6">
      <div 
       className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" 
       onClick={() => setPreviewDoc(null)} 
      />
      <div className="relative bg-card rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-border shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200">
       <div className="flex items-center justify-between p-4 border-b border-border bg-muted/40 shrink-0">
        <div className="min-w-0 pr-4">
         <h4 className="text-sm sm:text-base font-bold text-foreground truncate">{previewDoc.title}</h4>
         {previewDoc.subtitle && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">{previewDoc.subtitle}</p>
         )}
        </div>
        <button
         onClick={() => setPreviewDoc(null)}
         className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
         title="Close viewer"
        >
         <X className="w-5 h-5" />
        </button>
       </div>

       <div className="p-4 bg-muted/20 flex-1 overflow-auto flex items-center justify-center min-h-[320px] max-h-[72vh]">
        {previewDoc.url.toLowerCase().includes('.pdf') ? (
         <iframe
          src={previewDoc.url}
          title={previewDoc.title}
          className="w-full h-[68vh] rounded-xl border border-border bg-white"
         />
        ) : (
         <img
          src={previewDoc.url}
          alt={previewDoc.title}
          className="max-h-[68vh] max-w-full w-auto object-contain rounded-xl shadow-md border border-border bg-slate-950/20"
         />
        )}
       </div>

       <div className="p-3.5 bg-muted/30 border-t border-border flex items-center justify-between text-xs text-muted-foreground shrink-0">
        <span className="flex items-center gap-1.5 text-[11px]">
         <span className="w-2 h-2 rounded-full bg-[#018752] inline-block"></span>
         <span>Secure In-App Document Viewer</span>
        </span>
        <button
         onClick={() => setPreviewDoc(null)}
         className="px-4 py-1.5 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-medium transition-colors"
        >
         Close
        </button>
       </div>
      </div>
     </div>,
     document.body
    )}
   </div>
  );
 }
