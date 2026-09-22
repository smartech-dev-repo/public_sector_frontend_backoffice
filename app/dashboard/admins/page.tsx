"use client";

import { useEffect, useState } from 'react';
import { useAdmins } from '@/app/composables/modules/useAdmins';
import { useToast } from '@/app/composables/useToast';
import { createPortal } from 'react-dom';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import { useConfirm } from '@/app/composables/useConfirm';
import TableDropdown from '@/app/components/ui/TableDropdown';

export default function AdminsPage() {
  const { confirm } = useConfirm();

  const { loading, error, admins, fetchAdmins, assignRole, removeRole, deactivateAdmin, reactivateAdmin } = useAdmins();
  const { addToast } = useToast();

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
  const [assignRoleForm, setAssignRoleForm] = useState({ roleId: '' });
  const [removeRoleForm, setRemoveRoleForm] = useState({ roleId: '' });

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const openAssignRoleModal = (admin: any) => {
    setSelectedAdmin(admin);
    setAssignRoleForm({ roleId: '' });
    setShowAssignModal(true);
  };

  const openRemoveRoleModal = (admin: any) => {
    setSelectedAdmin(admin);
    setRemoveRoleForm({ roleId: '' });
    setShowRemoveModal(true);
  };

  const handleAssignRole = async () => {
    if (!assignRoleForm.roleId.trim()) { addToast('Role ID is required', 'error'); return; }
    setSubmitting(true);
    try {
      await assignRole(selectedAdmin.id, { roleId: assignRoleForm.roleId.trim() });
      addToast('Role assigned successfully!', 'success');
      setShowAssignModal(false);
      fetchAdmins();
    } catch (e: any) {
      addToast(e?.response?.data?.message || 'Failed to assign role', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveRole = async () => {
    if (!removeRoleForm.roleId.trim()) { addToast('Role ID is required', 'error'); return; }
    setSubmitting(true);
    try {
      await removeRole(selectedAdmin.id, removeRoleForm.roleId.trim());
      addToast('Role removed successfully!', 'success');
      setShowRemoveModal(false);
      fetchAdmins();
    } catch (e: any) {
      addToast(e?.response?.data?.message || 'Failed to remove role', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (admin: any) => {
    const confirmed = await confirm({ message: `Are you sure you want to deactivate ${admin.email}?` });
    if (confirmed) {
      try {
        await deactivateAdmin(admin.id);
        addToast('Admin deactivated successfully', 'success');
        fetchAdmins();
      } catch (e: any) {
        addToast(e?.response?.data?.message || 'Failed to deactivate admin', 'error');
      }
    }
  };

  const handleReactivate = async (admin: any) => {
    const confirmed = await confirm({ message: `Are you sure you want to reactivate ${admin.email}?` });
    if (confirmed) {
      try {
        await reactivateAdmin(admin.id);
        addToast('Admin reactivated successfully', 'success');
        fetchAdmins();
      } catch (e: any) {
        addToast(e?.response?.data?.message || 'Failed to reactivate admin', 'error');
      }
    }
  };

  return (
    <main className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Admin Users</h1>
      </div>

      {loading && <PulseLoader />}
      {!loading && error && <div className="text-red-500 py-12 text-center">{error}</div>}
      
      {!loading && !error && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {admins.length === 0 && <EmptyState title="No admins found." />}
          {admins.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {admins.map((admin: any) => (
                    <tr key={admin.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-mono">{admin.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">{admin.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{admin.firstName} {admin.lastName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                        <TableDropdown>
                          <button onClick={() => { openAssignRoleModal(admin); }} className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                            Assign Role
                          </button>
                          <button onClick={() => { openRemoveRoleModal(admin); }} className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-rose-50 hover:text-rose-700 transition-colors flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path></svg>
                            Remove Role
                          </button>
                          <div className="h-px bg-slate-100 my-1.5"></div>
                          <button onClick={() => { handleDeactivate(admin); }} className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition-colors flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
                            Deactivate
                          </button>
                          <button onClick={() => { handleReactivate(admin); }} className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            Reactivate
                          </button>
                        </TableDropdown>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Assign Role Modal */}
      {showAssignModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowAssignModal(false)}></div>
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Assign Role to {selectedAdmin?.email}</h3>
              <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role ID</label>
                <input 
                  value={assignRoleForm.roleId}
                  onChange={(e) => setAssignRoleForm({ ...assignRoleForm, roleId: e.target.value })}
                  type="text" 
                  placeholder="Enter role ID" 
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" 
                />
              </div>
            </div>
            <div className="flex items-center gap-3 justify-end mt-6">
              <button onClick={() => setShowAssignModal(false)} className="px-5 py-2.5 rounded-lg text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
              <button onClick={handleAssignRole} disabled={submitting} className="px-5 py-2.5 rounded-lg text-sm text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50">
                {submitting ? 'Assigning...' : 'Assign Role'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Remove Role Modal */}
      {showRemoveModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowRemoveModal(false)}></div>
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Remove Role from {selectedAdmin?.email}</h3>
              <button onClick={() => setShowRemoveModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role ID to Remove</label>
                <input 
                  value={removeRoleForm.roleId}
                  onChange={(e) => setRemoveRoleForm({ ...removeRoleForm, roleId: e.target.value })}
                  type="text" 
                  placeholder="Enter role ID to remove" 
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" 
                />
              </div>
            </div>
            <div className="flex items-center gap-3 justify-end mt-6">
              <button onClick={() => setShowRemoveModal(false)} className="px-5 py-2.5 rounded-lg text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
              <button onClick={handleRemoveRole} disabled={submitting} className="px-5 py-2.5 rounded-lg text-sm text-white bg-rose-600 hover:bg-rose-700 transition-colors disabled:opacity-50">
                {submitting ? 'Removing...' : 'Remove Role'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </main>
  );
}
