"use client";

import { useDataVersion } from '@/app/composables/useDataVersion';
import ExportButton, { ExportColumn } from '@/app/components/ui/ExportButton';
import { invites_api } from '@/app/api_factory/modules/invites';
import FilterBar, { dateRangeParams } from '@/app/components/ui/FilterBar';
import { useEffect, useState } from 'react';
import { useInvites } from '@/app/composables/modules/useInvites';
import { useRoles } from '@/app/composables/modules/useRoles';
import { useToast } from '@/app/composables/useToast';
import { useConfirm } from '@/app/composables/useConfirm';
import { createPortal } from 'react-dom';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import TableDropdown from '@/app/components/ui/TableDropdown';
import Pagination from '@/app/components/ui/Pagination';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/app/components/ui/Select';
import { useAdminPermissions } from '@/app/composables/useAdminPermissions';


// The list's last filters, reused by Export so it exports what the list shows.
const exportParams: { current: Record<string, unknown> } = { current: {} };

const EXPORT_COLUMNS: ExportColumn<any>[] = [
 { header: 'Email', value: (r) => r.email },
 { header: 'Role', value: (r) => r.role?.name },
 { header: 'Status', value: (r) => r.status },
 { header: 'Sent', value: (r) => r.createdAt },
 { header: 'Expires', value: (r) => r.expiresAt },
];

export default function InvitesTab() {
 const dataVersion = useDataVersion();
 const { hasPermission, isSuperAdmin } = useAdminPermissions();
 const canInvite = isSuperAdmin || hasPermission('admins:create');

 const [page, setPage] = useState(1);
 const [limit, setLimit] = useState(25);
 const { loading, error, invites, fetchInvites, resendInvite, deleteInvite, createInvite, revokeInvite, meta } = useInvites();
 const { roles, fetchRoles } = useRoles();
 const { addToast } = useToast();
 const { confirm } = useConfirm();

 const [showInviteModal, setShowInviteModal] = useState(false);
 const [submitting, setSubmitting] = useState(false);
 const [inviteForm, setInviteForm] = useState({ email: '', roleId: '' });
 const [statusFilter, setStatusFilter] = useState('');
 const [q, setQ] = useState('');
 const [createdRange, setCreatedRange] = useState('');
 const [expiresRange, setExpiresRange] = useState('');

 useEffect(() => {
  if (!canInvite) return;
  const params: any = { page, limit };
  if (statusFilter && statusFilter !== 'none') params.status = statusFilter;
  if (q.trim()) params.q = q.trim();
  Object.assign(params, dateRangeParams(createdRange, 'createdFrom', 'createdTo'));
  Object.assign(params, dateRangeParams(expiresRange, 'expiresFrom', 'expiresTo'));
  exportParams.current = params;
  fetchInvites(params);
  fetchRoles();
 }, [fetchInvites, fetchRoles, page, limit, statusFilter, q, createdRange, expiresRange, canInvite, dataVersion]);

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
  } catch (e: any) {
   addToast(e?.response?.data?.message || 'Failed to resend invite', 'error');
  }
 };

 const handleRevoke = async (id: string, email: string) => {
  const confirmed = await confirm({
   title: 'Revoke Invite',
   message: `Are you sure you want to revoke the invite for ${email}?`,
   confirmText: 'Revoke',
  });
  if (!confirmed) return;
  try {
   await revokeInvite(id);
   addToast('Invite revoked successfully', 'success');
  } catch (e: any) {
   addToast(e?.response?.data?.message || 'Failed to revoke invite', 'error');
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
  } catch (e: any) {
   addToast(e?.response?.data?.message || 'Failed to delete invite', 'error');
  }
 };

 const renderInviteStatusBadge = (status: string) => {
  const normalized = (status || '').toUpperCase();
  switch (normalized) {
   case 'ACCEPTED':
   case 'ACTIVE':
    return (
     <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shadow-2xs">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      ACCEPTED
     </span>
    );
   case 'PENDING':
    return (
     <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 shadow-2xs">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
      PENDING
     </span>
    );
   case 'EXPIRED':
    return (
     <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 shadow-2xs">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      EXPIRED
     </span>
    );
   case 'REVOKED':
   case 'CANCELLED':
    return (
     <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 shadow-2xs">
      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
      REVOKED
     </span>
    );
   default:
    return (
     <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-muted/60 dark:bg-muted/40 text-muted-foreground border border-border/60 shadow-2xs">
      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60" />
      {normalized || 'UNKNOWN'}
     </span>
    );
  }
 };

 if (!canInvite) {
  return (
   <div className="p-8">
    <EmptyState
     title="Access Restricted"
     description="You do not have permission to view or manage admin invites."
    />
   </div>
  );
 }

 return (
  <main className="w-full">
   <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
    <h1 className="text-2xl font-semibold text-foreground hidden">Pending Invites</h1>
    <div className="flex items-center gap-3">
     {canInvite && (
      <button onClick={() => setShowInviteModal(true)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium whitespace-nowrap ">
       Invite Admin
      </button>
     )}
    </div>
   </div>

   <div className="mb-6 space-y-4">
    <FilterBar
     onChange={() => setPage(1)}
     search={{ value: q, onChange: setQ, placeholder: 'Email' }}
     filters={[
      { key: 'status', label: 'Status', type: 'select', value: statusFilter, emptyValue: 'none', options: [{ value: 'PENDING', label: 'PENDING' }, { value: 'ACCEPTED', label: 'ACCEPTED' }, { value: 'EXPIRED', label: 'EXPIRED' }, { value: 'REVOKED', label: 'REVOKED' }], onChange: setStatusFilter },
      { key: 'created', label: 'Created', type: 'dateRange', value: createdRange, onChange: setCreatedRange },
      { key: 'expires', label: 'Expires', type: 'dateRange', value: expiresRange, onChange: setExpiresRange },
     ]}
    >
     <ExportButton fileName="Admin_Invites" resource="Admin invites" columns={EXPORT_COLUMNS} fetchPage={(page, limit) => invites_api.getInvites({ ...exportParams.current, page, limit })} />
    </FilterBar>
   </div>

   {loading && invites.length === 0 && <PulseLoader />}
   {!loading && error && <div className="text-red-500 py-12 text-center">{error}</div>}
   
   {!error && !(loading && invites.length === 0) && (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
     <div className="overflow-x-auto">
<table className="w-full min-w-full divide-y divide-slate-200">
      <thead className="bg-[#E9F4EE] dark:bg-emerald-950/20">
         <tr>
        <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Email</th>
        <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Role</th>
        <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Status</th>
        <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Invited At</th>
        {canInvite && (
         <th className="px-4 py-4 text-right text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Actions</th>
        )}
       </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
 {invites.length === 0 ? (
  <tr><td colSpan={canInvite ? 5 : 4} className="p-8"><div className="flex justify-center w-full"><EmptyState title="No pending invites." /></div></td></tr>
 ) : (invites.map((invite: any) => (
        <tr key={invite.id} className="hover:bg-muted/30 transition-colors">
         <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground font-medium">{invite.email}</td>
         <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">{invite.role?.name || 'Unknown'}</td>
         <td className="px-4 py-4 whitespace-nowrap text-sm">
          {renderInviteStatusBadge(invite.status)}
         </td>
         <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">{new Date(invite.createdAt).toLocaleDateString()}</td>
         {canInvite && (
          <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium relative">
           <TableDropdown>
            <button onClick={() => handleResend(invite.id, invite.email)} className="w-full text-left px-4 py-2.5 text-sm font-medium text-emerald-600 hover:bg-emerald-50 hover:text-emerald-800 transition-colors">Resend</button>
            <button onClick={() => handleRevoke(invite.id, invite.email)} className="w-full text-left px-4 py-2.5 text-sm font-medium text-amber-600 hover:bg-amber-50 hover:text-amber-800 transition-colors">Revoke</button>
            <button onClick={() => handleDelete(invite.id, invite.email)} className="w-full text-left px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-800 transition-colors">Delete</button>
           </TableDropdown>
          </td>
         )}
        </tr>
       )))}
</tbody>
     </table>
</div>
     {meta && invites.length > 0 && (
      <div className="border-t border-border/50 pt-4 mt-4 pb-4">
       <Pagination tabTotal
        totalItems={meta.total || 0}
        currentPage={page || 1}
        itemsPerPage={limit || 25}
        onPageChange={setPage}
        onItemsPerPageChange={setLimit}
       />
      </div>
     )}
     
    </div>
   )}

   {/* Invite Admin Modal */}
   {showInviteModal && typeof document !== 'undefined' && createPortal(
    <div className="fixed inset-0 z-modal flex items-center justify-center">
     <div className="fixed inset-0 bg-white/30 dark:bg-white/10 backdrop-blur-md" onClick={() => setShowInviteModal(false)}></div>
     <div className="relative bg-card rounded-2xl p-6 w-full max-w-md mx-4 animate-in fade-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-black/10">
      <div className="flex items-start justify-between mb-4">
       <h3 className="text-lg font-semibold text-foreground">Invite New Admin</h3>
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
       <div>
        <label className="block text-sm font-medium text-foreground/90 mb-1">Role</label>
        {/* The shared Select opens above the modal, so the list is never cut off by it. */}
        <Select value={inviteForm.roleId || undefined} onValueChange={(roleId) => setInviteForm({ ...inviteForm, roleId })}>
         <SelectTrigger aria-label="Role" className="w-full"><SelectValue placeholder="Select a role" /></SelectTrigger>
         <SelectContent>
          {roles.map((role: any) => <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>)}
         </SelectContent>
        </Select>
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
