"use client";

import { useEffect, useState } from 'react';
import { useInvites } from '@/app/composables/modules/useInvites';
import { useRoles } from '@/app/composables/modules/useRoles';
import { useToast } from '@/app/composables/useToast';
import { useConfirm } from '@/app/composables/useConfirm';
import { createPortal } from 'react-dom';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';

export default function InvitesPage() {
  const { loading, error, invites, fetchInvites, resendInvite, deleteInvite, createInvite } = useInvites();
  const { roles, fetchRoles } = useRoles();
  const { addToast } = useToast();
  const { confirm } = useConfirm();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', roleId: '' });
  const [roleSearch, setRoleSearch] = useState('');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  useEffect(() => {
    fetchInvites();
    fetchRoles();
  }, [fetchInvites, fetchRoles]);

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
      fetchInvites();
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
      fetchInvites();
    } catch (e: any) {
      addToast(e?.response?.data?.message || 'Failed to delete invite', 'error');
    }
  };

  return (
    <main className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Pending Invites</h1>
        <button onClick={() => setShowInviteModal(true)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium">
          Invite Admin
        </button>
      </div>

      {loading && <PulseLoader />}
      {!loading && error && <div className="text-red-500 py-12 text-center">{error}</div>}
      
      {!loading && !error && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
<table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-[#E9F4EE]">
                  <tr>
                <th className="px-4 py-4 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">Email</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">Role</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">Status</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">Invited At</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invites.map((invite: any) => (
                <tr key={invite.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-800 font-medium">{invite.email}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">{invite.role?.name || 'Unknown'}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <span className="px-2.5 py-1 text-xs rounded-full font-medium bg-amber-100 text-amber-800">
                      {invite.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">{new Date(invite.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <button onClick={() => handleResend(invite.id, invite.email)} className="text-emerald-600 hover:text-emerald-800 font-medium transition-colors">Resend</button>
                    <button onClick={() => handleDelete(invite.id, invite.email)} className="text-rose-600 hover:text-rose-800 font-medium transition-colors">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
</div>
          {invites.length === 0 && <EmptyState title="No pending invites." />}
        </div>
      )}

      {/* Invite Admin Modal */}
      {showInviteModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowInviteModal(false)}></div>
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Invite New Admin</h3>
              <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <form onSubmit={handleCreateInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input 
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  type="email" 
                  placeholder="admin@example.com" 
                  required 
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" 
                />
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <div className="relative">
                  <div 
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm bg-white cursor-pointer flex justify-between items-center focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                    tabIndex={0}
                    onBlur={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                        setShowRoleDropdown(false);
                      }
                    }}
                  >
                    <span className={inviteForm.roleId ? 'text-slate-900' : 'text-slate-400'}>
                      {inviteForm.roleId ? roles.find((r: any) => r.id === inviteForm.roleId)?.name : 'Select a role'}
                    </span>
                    <svg className={`w-4 h-4 text-slate-400 transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                  
                  {showRoleDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 flex flex-col" onMouseDown={(e) => e.preventDefault()}>
                      <div className="p-2 border-b border-slate-100 shrink-0">
                        <input 
                          type="text" 
                          placeholder="Search roles..." 
                          value={roleSearch}
                          onChange={e => setRoleSearch(e.target.value)}
                          className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
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
                            className={`px-3 py-2 text-sm rounded cursor-pointer hover:bg-emerald-50 transition-colors ${inviteForm.roleId === role.id ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-slate-700'}`}
                          >
                            {role.name}
                          </div>
                        ))}
                        {roles.filter((r: any) => r.name.toLowerCase().includes(roleSearch.toLowerCase())).length === 0 && (
                          <div className="px-3 py-2 text-sm text-slate-500 text-center">No roles found</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {inviteForm.roleId && (
                <div className="pt-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Role Permissions Preview</label>
                  <div className="max-h-[150px] overflow-y-auto border border-slate-200 rounded-lg p-3 bg-slate-50 flex flex-wrap gap-1.5">
                    {(() => {
                      const selectedRole = roles.find((r: any) => r.id === inviteForm.roleId);
                      if (!selectedRole?.permissions || selectedRole.permissions.length === 0) {
                        return <div className="text-sm text-slate-500 w-full text-center py-2">No permissions assigned to this role.</div>;
                      }
                      return selectedRole.permissions.map((p: any) => (
                        <span key={p.permission?.id || Math.random()} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[11px] font-medium tracking-wide shadow-sm" title={p.permission?.description}>
                          {p.permission?.key}
                        </span>
                      ));
                    })()}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 justify-end mt-6">
                <button type="button" onClick={() => setShowInviteModal(false)} className="px-5 py-2.5 rounded-lg text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="px-5 py-2.5 rounded-lg text-sm text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50">
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
