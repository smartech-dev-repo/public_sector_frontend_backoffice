"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useInvites } from '@/app/composables/modules/useInvites';
import { useRoles } from '@/app/composables/modules/useRoles';
import { invites_api } from '@/app/api_factory/modules/invites';
import { useToast } from '@/app/composables/useToast';
import { useConfirm } from '@/app/composables/useConfirm';
import { createPortal } from 'react-dom';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import ButtonLoader from '@/app/components/ui/ButtonLoader';
import Pagination from '@/app/components/ui/Pagination';
import TableDropdown from '@/app/components/ui/TableDropdown';
import CustomDateRangePicker from '@/app/components/ui/CustomDateRangePicker';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/app/components/ui/Select';
import { Mail, Clock, CheckCircle2, AlertCircle, UserPlus, Plus } from 'lucide-react';

export default function InvitesPage() {
 const { loading, error, invites, fetchInvites, resendInvite, deleteInvite, createInvite, meta } = useInvites();
 const { roles, fetchRoles } = useRoles();
 const { addToast } = useToast();
 const { confirm } = useConfirm();

 const [overallInviteStats, setOverallInviteStats] = useState<{
  total: number;
  pending: number;
  accepted: number;
  expired: number;
 } | null>(null);

 const fetchOverallInviteStats = useCallback(async () => {
  try {
   const res = await invites_api.getInvites({ limit: 100 });
   const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
   const total = res.data?.meta?.total || list.length;
   const pending = list.filter((i: any) => i.status === 'PENDING').length;
   const accepted = list.filter((i: any) => i.status === 'ACCEPTED').length;
   const expired = list.filter((i: any) => i.status === 'EXPIRED' || i.status === 'REVOKED').length;
   setOverallInviteStats({ total, pending, accepted, expired });
  } catch {
   // graceful fallback
  }
 }, []);

 useEffect(() => {
  fetchOverallInviteStats();
 }, [fetchOverallInviteStats]);

 const totalInvitesCount = overallInviteStats?.total ?? (meta?.total || invites.length);
 const pendingInvitesCount = overallInviteStats?.pending ?? invites.filter(i => i.status === 'PENDING').length;
 const acceptedInvitesCount = overallInviteStats?.accepted ?? invites.filter(i => i.status === 'ACCEPTED').length;
 const expiredInvitesCount = overallInviteStats?.expired ?? invites.filter(i => i.status === 'EXPIRED' || i.status === 'REVOKED').length;
 const conversionRate = totalInvitesCount > 0 ? Math.round((acceptedInvitesCount / totalInvitesCount) * 100) : 0;

 const [showInviteModal, setShowInviteModal] = useState(false);
 const [submitting, setSubmitting] = useState(false);
 const [inviteForm, setInviteForm] = useState({ email: '', roleId: '' });
 const [showRoleDropdown, setShowRoleDropdown] = useState(false);
 const [roleSearch, setRoleSearch] = useState('');
 
 const [showFilter, setShowFilter] = useState(false);
 const [emailFilter, setEmailFilter] = useState('');
 const [statusFilter, setStatusFilter] = useState('');
 const [dateRange, setDateRange] = useState('');

 const [currentPage, setCurrentPage] = useState(1);
 const [itemsPerPage, setItemsPerPage] = useState(10);

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
 }, [invites]);

 const clearFilters = () => {
  setEmailFilter('');
  setStatusFilter('');
  setDateRange('');
  setCurrentPage(1);
 };

 useEffect(() => {
  const params: any = { page: currentPage, limit: itemsPerPage };
  if (emailFilter.trim()) params.email = emailFilter.trim();
  if (statusFilter && statusFilter !== 'none') params.status = statusFilter;
  if (dateRange) {
   const [from, to] = dateRange.split(' to ');
   if (from) params.from = from;
   if (to) params.to = to;
  }
  fetchInvites(params);
  fetchRoles();
 }, [fetchInvites, fetchRoles, currentPage, itemsPerPage, emailFilter, statusFilter, dateRange]);

 const handleCreateInvite = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!inviteForm.email.trim() || !inviteForm.roleId.trim()) return;
  setSubmitting(true);
  try {
   await createInvite({
    email: inviteForm.email.trim(),
    roleId: inviteForm.roleId.trim()
   });
   addToast('Invite sent successfully!', 'success');
   setShowInviteModal(false);
   setInviteForm({ email: '', roleId: '' });
   fetchInvites({ page: currentPage, limit: itemsPerPage });
   fetchOverallInviteStats();
  } catch (e: any) {
   addToast(e?.response?.data?.message || 'Failed to send invite', 'error');
  } finally {
   setSubmitting(false);
  }
 };

 const handleResend = async (id: string, email: string) => {
  const confirmed = await confirm({
   title: 'Resend Invite',
   message: `Are you sure you want to resend the invite to ${email}?`,
   confirmText: 'Resend',
  });
  if (!confirmed) return;
  try {
   await resendInvite(id);
   addToast('Invite resent successfully', 'success');
   fetchOverallInviteStats();
  } catch (e: any) {
   addToast(e?.response?.data?.message || 'Failed to resend invite', 'error');
  }
 };

 const handleDelete = async (id: string, email: string) => {
  const confirmed = await confirm({
   title: 'Delete Invite',
   message: `Are you sure you want to delete the invite for ${email}? This action cannot be undone.`,
   confirmText: 'Delete',
  });
  if (!confirmed) return;
  try {
   await deleteInvite(id);
   addToast('Invite deleted successfully', 'success');
   fetchInvites({ page: currentPage, limit: itemsPerPage });
   fetchOverallInviteStats();
  } catch (e: any) {
   addToast(e?.response?.data?.message || 'Failed to delete invite', 'error');
  }
 };

 return (
  <main className="w-full">
   {/* ================= HEADER ================= */}
   <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
    <div>
     <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Agent Recruitment</h1>
     <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Manage recruitment invitations, track candidate onboarding progress and enrollment statuses.</p>
    </div>
    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
     <button 
      onClick={() => setShowFilter(!showFilter)}
      className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full text-sm font-medium text-foreground/90 hover:bg-muted/30 transition-colors"
     >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
      Filters
      <svg className={`w-4 h-4 transition-transform ${showFilter ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
     </button>

     <button
      onClick={() => setShowInviteModal(true)}
      className="flex items-center gap-2 px-4 py-2 bg-[#018752] hover:bg-[#017044] text-white rounded-full text-sm font-medium transition-colors shadow-xs"
     >
      <UserPlus className="w-4 h-4" />
      Invite Candidate
     </button>
    </div>
   </div>

   {/* ================= STATS SECTION ================= */}
   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    {/* Total Invitations */}
    <div className="bg-card rounded-2xl border border-border/70 p-5 shadow-xs transition-all hover:border-[#018752]/40">
     <div className="flex items-center justify-between mb-2">
      <span className="text-xs sm:text-[13px] font-medium text-muted-foreground">
       Total Invitations
      </span>
      <div className="w-8 h-8 rounded-xl bg-[#E8F5EE] text-[#018752] flex items-center justify-center">
       <Mail className="w-4 h-4" />
      </div>
     </div>
     <span className="block text-3xl font-bold text-foreground tracking-tight mb-1">
      {totalInvitesCount}
     </span>
     <span className="block text-[11px] text-muted-foreground/70">
      {acceptedInvitesCount} accepted ({conversionRate}% conversion)
     </span>
    </div>

    {/* Pending Acceptances */}
    <div className="bg-card rounded-2xl border border-border/70 p-5 shadow-xs transition-all hover:border-amber-500/40">
     <div className="flex items-center justify-between mb-2">
      <span className="text-xs sm:text-[13px] font-medium text-muted-foreground">
       Pending Acceptances
      </span>
      <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
       <Clock className="w-4 h-4" />
      </div>
     </div>
     <span className="block text-3xl font-bold text-amber-600 dark:text-amber-500 tracking-tight mb-1">
      {pendingInvitesCount}
     </span>
     <span className="block text-[11px] text-muted-foreground/70">
      awaiting candidate registration
     </span>
    </div>

    {/* Accepted & Enrolled */}
    <div className="bg-card rounded-2xl border border-border/70 p-5 shadow-xs transition-all hover:border-[#018752]/40">
     <div className="flex items-center justify-between mb-2">
      <span className="text-xs sm:text-[13px] font-medium text-muted-foreground">
       Accepted & Enrolled
      </span>
      <div className="w-8 h-8 rounded-xl bg-[#E8F5EE] text-[#018752] flex items-center justify-center">
       <CheckCircle2 className="w-4 h-4" />
      </div>
     </div>
     <span className="block text-3xl font-bold text-[#018752] tracking-tight mb-1">
      {acceptedInvitesCount}
     </span>
     <span className="block text-[11px] text-muted-foreground/70">
      {conversionRate}% candidate recruitment rate
     </span>
    </div>

    {/* Expired or Revoked */}
    <div className="bg-card rounded-2xl border border-border/70 p-5 shadow-xs transition-all hover:border-rose-500/40">
     <div className="flex items-center justify-between mb-2">
      <span className="text-xs sm:text-[13px] font-medium text-muted-foreground">
       Expired / Revoked
      </span>
      <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center">
       <AlertCircle className="w-4 h-4" />
      </div>
     </div>
     <span className="block text-3xl font-bold text-rose-600 dark:text-rose-500 tracking-tight mb-1">
      {expiredInvitesCount}
     </span>
     <span className="block text-[11px] text-muted-foreground/70">
      unclaimed or cancelled invites
     </span>
    </div>
   </div>

   {/* Filters */}
   <div className="mb-6 space-y-4">
    {showFilter && (
     <div className="bg-card p-6 rounded-2xl border border-border/50 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4">
       <div className="space-y-1.5">
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Search Email</label>
        <input
         value={emailFilter}
         onChange={(e) => { setEmailFilter(e.target.value); setCurrentPage(1); }}
         type="text"
         placeholder="Enter email..."
         className="w-full px-4 py-2 border rounded-lg text-sm bg-card border-border outline-none focus:ring-1 focus:ring-emerald-200 focus:border-emerald-400"
        />
       </div>
       <div className="space-y-1.5">
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
        <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val === 'none' ? '' : val); setCurrentPage(1); }}>
         <SelectTrigger className="w-full bg-card"><SelectValue placeholder="All Statuses" /></SelectTrigger>
         <SelectContent>
          <SelectItem value="none">All Statuses</SelectItem>
          <SelectItem value="PENDING">PENDING</SelectItem>
          <SelectItem value="ACCEPTED">ACCEPTED</SelectItem>
          <SelectItem value="EXPIRED">EXPIRED</SelectItem>
         </SelectContent>
        </Select>
       </div>
       <div className="space-y-1.5 w-full relative sm:col-span-2">
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Date Range</label>
        <CustomDateRangePicker 
         value={dateRange}
         onChange={(val: any) => { setDateRange(val); setCurrentPage(1); }}
         placeholder="Filter by date range"
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
    <div className="bg-card rounded-2xl border border-border overflow-hidden relative w-full max-w-full ">
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
<table className="min-w-full divide-y divide-slate-200 min-w-[800px]">
      <thead className="bg-[#E9F4EE] dark:bg-emerald-950/20">
         <tr>
        <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Email</th>
        <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Role</th>
        <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Status</th>
        <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Invited At</th>
        <th className="px-4 py-4 text-right text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Actions</th>
       </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
 {invites.length === 0 ? (
  <tr><td colSpan={5} className="p-8"><div className="flex justify-center w-full"><EmptyState title="No pending invites." /></div></td></tr>
 ) : (invites.map((invite: any) => (
        <tr key={invite.id} className="hover:bg-muted/30 transition-colors">
         <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground font-medium">{invite.email}</td>
         <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">{invite.role?.name || 'Unknown'}</td>
         <td className="px-4 py-4 whitespace-nowrap text-sm">
          <span className="px-2.5 py-1 text-xs rounded-full font-medium bg-amber-100 text-amber-800">
           {invite.status}
          </span>
         </td>
         <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">{new Date(invite.createdAt).toLocaleDateString()}</td>
         <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
          <TableDropdown>
           <button onClick={() => handleResend(invite.id, invite.email)} className="w-full text-left px-4 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50 transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            Resend
           </button>
           <button onClick={() => handleDelete(invite.id, invite.email)} className="w-full text-left px-4 py-2.5 text-sm font-medium text-rose-700 hover:bg-rose-50 transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            Delete
           </button>
          </TableDropdown>
         </td>
        </tr>
       )))}
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
     
     {invites.length > 0 && (
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

   {/* Invite Agent Modal */}
   {showInviteModal && typeof document !== 'undefined' && createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
     <div className="fixed inset-0 bg-white/30 dark:bg-white/10 backdrop-blur-md" onClick={() => setShowInviteModal(false)}></div>
     <div className="relative bg-card rounded-2xl p-6 w-full max-w-md mx-4 animate-in fade-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-black/10">
      <div className="flex items-start justify-between mb-4">
       <h3 className="text-lg font-semibold text-foreground">Invite Candidate / Agent</h3>
       <button onClick={() => setShowInviteModal(false)} className="text-muted-foreground/70 hover:text-muted-foreground">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
       </button>
      </div>
      <form onSubmit={handleCreateInvite} className="space-y-4">
       <div>
        <label className="block text-sm font-medium text-foreground/90 mb-1">Email Address</label>
        <input 
         value={inviteForm.email}
         onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
         type="email" 
         placeholder="admin@example.com" 
         required 
         className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:ring-1 focus:ring-emerald-200 focus:border-emerald-400 outline-none transition-all" 
        />
       </div>
       <div className="relative">
        <label className="block text-sm font-medium text-foreground/90 mb-1">Role</label>
        <div className="relative">
         <div 
          className="w-full px-4 py-2.5 border border-border rounded-lg text-sm bg-card cursor-pointer flex justify-between items-center focus:ring-1 focus:ring-emerald-200 focus:border-emerald-400 outline-none transition-all"
          onClick={() => setShowRoleDropdown(!showRoleDropdown)}
          tabIndex={0}
          onBlur={(e) => {
           if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setShowRoleDropdown(false);
           }
          }}
         >
          <span className={inviteForm.roleId ? 'text-foreground' : 'text-muted-foreground/70'}>
           {inviteForm.roleId ? roles.find((r: any) => r.id === inviteForm.roleId)?.name : 'Select a role'}
          </span>
          <svg className={`w-4 h-4 text-muted-foreground/70 transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
         </div>
         
         {showRoleDropdown && (
          <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg max-h-60 flex flex-col" onMouseDown={(e) => e.preventDefault()}>
           <div className="p-2 border-b border-border/50 shrink-0">
            <input 
             type="text" 
             placeholder="Search roles..." 
             value={roleSearch}
             onChange={e => setRoleSearch(e.target.value)}
             className="w-full px-3 py-1.5 text-sm bg-muted/30 border border-border rounded outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
           </div>
           <div className="overflow-y-auto flex-1 p-1">
            {roles.filter((r: any) => r.name.toLowerCase().includes(roleSearch.toLowerCase())).map((role: any) => (
             <div 
              key={role.id} 
              onClick={() => {
               setInviteForm({ ...inviteForm, roleId: role.id });
               setShowRoleDropdown(false);
               setRoleSearch('');
              }}
              className={`px-3 py-2 text-sm rounded cursor-pointer hover:bg-emerald-50 transition-colors ${inviteForm.roleId === role.id ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-foreground/90'}`}
             >
              {role.name}
             </div>
            ))}
            {roles.filter((r: any) => r.name.toLowerCase().includes(roleSearch.toLowerCase())).length === 0 && (
             <div className="px-3 py-2 text-sm text-muted-foreground text-center">No roles found</div>
            )}
           </div>
          </div>
         )}
        </div>
       </div>

       {inviteForm.roleId && (
        <div className="pt-2">
         <label className="block text-sm font-medium text-foreground/90 mb-2">Role Permissions Preview</label>
         <div className="max-h-[150px] overflow-y-auto border border-border rounded-lg p-3 bg-muted/30 flex flex-wrap gap-1.5">
          {(() => {
           const selectedRole = roles.find((r: any) => r.id === inviteForm.roleId);
           if (!selectedRole?.permissions || selectedRole.permissions.length === 0) {
            return <div className="text-sm text-muted-foreground w-full text-center py-2">No permissions assigned to this role.</div>;
           }
           return selectedRole.permissions.map((p: any) => (
            <span key={p.permission?.id || Math.random()} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[11px] font-medium tracking-wide " title={p.permission?.description}>
             {p.permission?.key}
            </span>
           ));
          })()}
         </div>
        </div>
       )}
       <div className="flex gap-3 w-full mt-6">
        <button type="button" onClick={() => setShowInviteModal(false)} className="flex-1 px-5 py-2.5 rounded-lg text-sm text-foreground/90 bg-muted/50 hover:bg-slate-200 transition-colors">Cancel</button>
        <button
         type="submit"
         disabled={submitting}
         className="flex-1 px-5 py-2.5 rounded-lg text-sm text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
         <ButtonLoader loading={submitting} loadingText="Sending...">
          Send Invite
         </ButtonLoader>
        </button>
       </div>
      </form>
     </div>
    </div>,
    document.body
   )}
  </main>
 );
}
