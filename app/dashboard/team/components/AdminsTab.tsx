"use client";

import { useEffect, useState } from 'react'; 
import Pagination from '@/app/components/ui/Pagination';
import { useAdmins } from '@/app/composables/modules/useAdmins';
import { useInvites } from '@/app/composables/modules/useInvites';
import { useRoles } from '@/app/composables/modules/useRoles';
import { useToast } from '@/app/composables/useToast';
import { createPortal } from 'react-dom';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import { useConfirm } from '@/app/composables/useConfirm';
import TableDropdown from '@/app/components/ui/TableDropdown';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/app/components/ui/Select';
import CustomDateRangePicker from '@/app/components/ui/CustomDateRangePicker';

export default function AdminsTab() {
 const [page, setPage] = useState(1);
 const [limit, setLimit] = useState(25);
 const [showFilter, setShowFilter] = useState(false);
 const [search, setSearch] = useState('');
 const [statusFilter, setStatusFilter] = useState('');
 const [dateRange, setDateRange] = useState('');
 const { confirm } = useConfirm();

 const { loading, error, admins, fetchAdmins, assignRole, suspendAdmin, unsuspendAdmin, meta } = useAdmins();
 const { roles, fetchRoles } = useRoles();
 const { addToast } = useToast();

 const [showAssignModal, setShowAssignModal] = useState(false);
 const [showInviteModal, setShowInviteModal] = useState(false);

 const [submitting, setSubmitting] = useState(false);
 const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
 const [assignRoleForm, setAssignRoleForm] = useState({ roleId: '' });
 const [inviteForm, setInviteForm] = useState({ email: '', roleId: '' });
 const { createInvite } = useInvites();


 useEffect(() => {
  const params: any = { page, limit };
  if (search.trim()) params.search = search.trim();
  if (statusFilter && statusFilter !== 'none') params.status = statusFilter;
  if (dateRange) {
   const [from, to] = dateRange.split(' to ');
   if (from) params.from = from;
   if (to) params.to = to;
  }
  fetchAdmins(params);
  fetchRoles();
 }, [fetchAdmins, fetchRoles, page, limit, search, statusFilter, dateRange]);

 const clearFilters = () => {
  setSearch('');
  setStatusFilter('');
  setDateRange('');
  setPage(1);
 };

 const openAssignRoleModal = (admin: any) => {
  setSelectedAdmin(admin);
  setAssignRoleForm({ roleId: '' });
  setShowAssignModal(true);
 };



 const handleAssignRole = async () => {
  if (!assignRoleForm.roleId.trim()) { addToast('Role ID is required', 'error'); return; }
  setSubmitting(true);
  try {
   await assignRole(selectedAdmin.id, { roleId: assignRoleForm.roleId.trim() });
   addToast('Role assigned successfully!', 'success');
   setShowAssignModal(false);
   fetchAdmins({ page, limit });
  } catch (e: any) {
   addToast(e?.response?.data?.message || 'Failed to assign role', 'error');
  } finally {
   setSubmitting(false);
  }
 };



 const handleSuspend = async (admin: any) => {
  const confirmed = await confirm({ message: `Are you sure you want to suspend ${admin.email}?` });
  if (confirmed) {
   try {
    await suspendAdmin(admin.id);
    addToast('Admin suspended successfully', 'success');
    fetchAdmins({ page, limit });
   } catch (e: any) {
    addToast(e?.response?.data?.message || 'Failed to suspend admin', 'error');
   }
  }
 };

 const handleUnsuspend = async (admin: any) => {
  const confirmed = await confirm({ message: `Are you sure you want to unsuspend ${admin.email}?` });
  if (confirmed) {
   try {
    await unsuspendAdmin(admin.id);
    addToast('Admin unsuspended successfully', 'success');
    fetchAdmins({ page, limit });
   } catch (e: any) {
    addToast(e?.response?.data?.message || 'Failed to unsuspend admin', 'error');
   }
  }
 };

 return (
  <main className="w-full">
   <div className="flex items-center justify-between mb-6">
     <button 
      onClick={() => setShowFilter(!showFilter)}
      className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full text-sm font-medium text-foreground/90 hover:bg-muted/30 transition-colors "
     >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
      Filters
      <svg className={`w-4 h-4 transition-transform ${showFilter ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
     </button>
     <button onClick={() => setShowInviteModal(true)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors whitespace-nowrap shadow-sm">
      Invite Admin
     </button>
    </div>

   <div className="mb-6 space-y-4">

    {showFilter && (
     <div className="bg-card p-6 rounded-2xl border border-border/50 animate-in fade-in slide-in-from-top-2 duration-200">
    <div className="flex bg-card p-2 rounded-xl border border-border/50 mb-6">
     <div className="flex items-center pl-3 pr-2 text-muted-foreground/70">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
     </div>
     <input 
      type="text"
      placeholder="Search email or name..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="w-full px-2 py-1.5 bg-transparent border-none outline-none text-sm text-foreground placeholder-slate-400"
     />
    </div>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
       <div className="space-y-1.5">
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
         <SelectTrigger className="w-full bg-card"><SelectValue placeholder="All Statuses" /></SelectTrigger>
         <SelectContent>
          <SelectItem value="none">All Statuses</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="suspended">Suspended</SelectItem>
         </SelectContent>
        </Select>
       </div>
       <div className="space-y-1.5 z-[70] relative">
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Date Created</label>
        <CustomDateRangePicker 
         value={dateRange} 
         onChange={setDateRange} 
         placeholder="Created Date" 
        />
       </div>
       <div className="flex items-end">
        <button onClick={clearFilters} className="px-4 py-2 bg-card text-muted-foreground border border-border rounded-lg text-sm font-medium hover:bg-muted/30 transition-colors w-full">
         Clear Filters
        </button>
       </div>
      </div>
     </div>
    )}
   </div>

   {loading && <PulseLoader />}
   {!loading && error && <div className="text-red-500 py-12 text-center">{error}</div>}
   
   {!loading && !error && (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
     
      <div className="overflow-x-auto">
       <table className="w-full min-w-full divide-y divide-slate-200">
        <thead className="bg-[#E9F4EE] dark:bg-emerald-950/20">
         <tr>
          <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Date Created</th>
          <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Email</th>
          <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Name</th>
          <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Role</th>
          <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Department</th>
          <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Status</th>
          <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Updated At</th>
          <th className="px-4 py-4 text-right text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Actions</th>
         </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
 {admins.length === 0 ? (<tr><td colSpan={8} className="p-8"><div className="flex justify-center w-full"><EmptyState title="No admins found." /></div></td></tr>) : (admins.map((admin: any) => (
          <tr key={admin.id} className="hover:bg-muted/30 transition-colors">
           <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground font-mono">{new Date(admin.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
           <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground">{admin.email}</td>
           <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">{admin.fullName}</td>
           <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">
            {admin.role ? (
             <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {admin.role.name}
             </span>
            ) : <span className="text-muted-foreground/70">No Role</span>}
           </td>
           <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">
            {admin.department?.name || <span className="text-muted-foreground/70">-</span>}
           </td>
           <td className="px-4 py-4 whitespace-nowrap text-sm">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${admin.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
             {admin.isActive ? 'Active' : 'Suspended'}
            </span>
           </td>
           <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">
            {new Date(admin.updatedAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
           </td>
           <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium relative">
            <TableDropdown>
             <button onClick={() => { openAssignRoleModal(admin); }} className="w-full text-left px-4 py-2.5 text-sm font-medium text-foreground/90 hover:bg-emerald-50 hover:text-emerald-700 transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              Assign Role
             </button>
             <div className="h-px bg-muted/50 my-1.5"></div>
             {admin.isActive ? (
              <button onClick={() => { handleSuspend(admin); }} className="w-full text-left px-4 py-2.5 text-sm font-medium text-foreground/90 hover:bg-amber-50 hover:text-amber-700 transition-colors flex items-center gap-2">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
               Suspend
              </button>
             ) : (
              <button onClick={() => { handleUnsuspend(admin); }} className="w-full text-left px-4 py-2.5 text-sm font-medium text-foreground/90 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-2">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
               Unsuspend
              </button>
             )}
            </TableDropdown>
           </td>
          </tr>
         )))}
</tbody>
       </table>
       {meta && (
        <div className="mt-4 border-t border-border/50 pt-4">
         <Pagination
          totalItems={meta.total || 0}
          currentPage={page || 1}
          itemsPerPage={limit || 25}
          onPageChange={(p) => setPage(p)}
          onItemsPerPageChange={(l) => setLimit(l)}
         />
        </div>
       )}
      </div>
     
    </div>
   )}

   {/* Assign Role Modal */}
   {showAssignModal && typeof document !== 'undefined' && createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
     <div className="fixed inset-0 bg-white/30 dark:bg-white/10 backdrop-blur-md" onClick={() => setShowAssignModal(false)}></div>
     <div className="relative bg-card rounded-2xl p-6 w-full max-w-md mx-4 animate-in fade-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-black/10">
      <div className="flex items-start justify-between mb-4">
       <h3 className="text-lg font-semibold text-foreground">Assign Role to {selectedAdmin?.email}</h3>
       <button onClick={() => setShowAssignModal(false)} className="text-muted-foreground/70 hover:text-muted-foreground">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
       </button>
      </div>
      <div className="space-y-4">
       <div>
        <label className="block text-sm font-medium text-foreground/90 mb-1">Role</label>
        <Select 
         value={assignRoleForm.roleId}
         onValueChange={(val) => setAssignRoleForm({ ...assignRoleForm, roleId: val })}
        >
         <SelectTrigger className="w-full bg-card"><SelectValue placeholder="Select a role" /></SelectTrigger>
         <SelectContent>
          {roles.map((r: any) => (
           <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
          ))}
         </SelectContent>
        </Select>
       </div>
      </div>
      <div className="flex gap-3 w-full mt-6">
       <button onClick={() => setShowAssignModal(false)} className="flex-1 px-5 py-2.5 rounded-lg text-sm text-foreground/90 bg-muted/50 hover:bg-slate-200 transition-colors">Cancel</button>
       <button onClick={handleAssignRole} disabled={submitting} className="flex-1 px-5 py-2.5 rounded-lg text-sm text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50">
        {submitting ? 'Assigning...' : 'Assign Role'}
       </button>
      </div>
     </div>
    </div>,
    document.body
   )}



    {/* Invite Admin Modal */}
    {showInviteModal && createPortal(
     <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-white/30 dark:bg-white/10 backdrop-blur-md" onClick={() => setShowInviteModal(false)}></div>
      <div className="relative bg-card rounded-2xl p-6 w-full max-w-md mx-4 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-black/10">
       <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Invite New Admin</h3>
        <button onClick={() => setShowInviteModal(false)} className="text-muted-foreground/70 hover:text-muted-foreground">
         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
       </div>
       <form onSubmit={async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
         await createInvite({ email: inviteForm.email, roleId: inviteForm.roleId });
         addToast('Invite sent successfully!', 'success');
         setShowInviteModal(false);
         setInviteForm({ email: '', roleId: '' });
         fetchAdmins({ page, limit });
        } catch (err: any) {
         addToast(err?.response?.data?.message || 'Failed to send invite', 'error');
        } finally {
         setSubmitting(false);
        }
       }}>
        <div className="space-y-4">
         <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Email Address</label>
          <input type="email" required value={inviteForm.email} onChange={e => setInviteForm(p => ({ ...p, email: e.target.value }))} placeholder="admin@example.com" className="w-full px-4 py-2.5 border rounded-lg text-sm bg-card border-border outline-none focus:ring-1 focus:ring-emerald-200 focus:border-emerald-400" />
         </div>
         <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Role</label>
          <Select value={inviteForm.roleId} onValueChange={v => setInviteForm(p => ({ ...p, roleId: v }))}>
           <SelectTrigger className="w-full bg-card"><SelectValue placeholder="Select a role" /></SelectTrigger>
           <SelectContent>
            {roles.map((r: any) => (
             <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
            ))}
           </SelectContent>
          </Select>
         </div>
        </div>
        <div className="flex gap-3 w-full mt-6">
         <button type="button" onClick={() => setShowInviteModal(false)} className="flex-1 px-5 py-2.5 rounded-lg text-sm text-foreground/90 bg-muted/50 hover:bg-slate-200 transition-colors">Cancel</button>
         <button type="submit" disabled={submitting} className="flex-1 px-5 py-2.5 rounded-lg text-sm text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50">
          {submitting ? 'Sending...' : 'Send Invite'}
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
