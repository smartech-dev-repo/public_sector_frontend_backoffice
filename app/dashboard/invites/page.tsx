"use client";

import { useEffect, useState } from 'react';
import { useInvites } from '@/app/composables/modules/useInvites';
import { useToast } from '@/app/composables/useToast';
import { createPortal } from 'react-dom';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';

export default function InvitesPage() {
  const { loading, error, invites, fetchInvites, resendInvite, createInvite } = useInvites();
  const { addToast } = useToast();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', roleId: '' });

  useEffect(() => {
    fetchInvites();
  }, [fetchInvites]);

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

  const handleResend = async (id: string) => {
    try {
      await resendInvite(id);
      addToast('Invite resent successfully', 'success');
    } catch (e: any) {
      addToast(e?.response?.data?.message || 'Failed to resend invite', 'error');
    }
  };

  return (
    <main className="p-6">
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
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Invited At</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invites.map((invite: any) => (
                <tr key={invite.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-medium">{invite.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{invite.role?.name || 'Unknown'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="px-2.5 py-1 text-xs rounded-full font-medium bg-amber-100 text-amber-800">
                      {invite.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{new Date(invite.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleResend(invite.id)} className="text-emerald-600 hover:text-emerald-800 font-medium transition-colors">Resend</button>
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
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role ID</label>
                <input 
                  value={inviteForm.roleId}
                  onChange={(e) => setInviteForm({ ...inviteForm, roleId: e.target.value })}
                  type="text" 
                  placeholder="Enter role ID to assign" 
                  required 
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" 
                />
              </div>
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
