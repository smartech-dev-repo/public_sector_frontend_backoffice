"use client";

import { useEffect, useState } from 'react';
import { useRoles } from '@/app/composables/modules/useRoles';
import { useToast } from '@/app/composables/useToast';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import { useConfirm } from '@/app/composables/useConfirm';

export default function RolesTab() {
  const { confirm } = useConfirm();

  const { loading, error, roles, fetchRoles, deleteRole, createRole, updateRole } = useRoles();
  const { addToast } = useToast();

  const [showCreateRole, setShowCreateRole] = useState(false);
  const [showViewPermissions, setShowViewPermissions] = useState(false);
  const [viewingRole, setViewingRole] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState('');
  const [form, setForm] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const openCreateModal = () => {
    setIsEditing(false);
    setEditId('');
    setForm({ name: '', description: '' });
    setShowCreateRole(true);
  };

  const openEditModal = (role: any) => {
    setIsEditing(true);
    setEditId(role.id);
    setForm({ name: role.name, description: role.description || '' });
    setShowCreateRole(true);
  };

  const openViewPermissionsModal = (role: any) => {
    setViewingRole(role);
    setShowViewPermissions(true);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    try {
      if (isEditing) {
        await updateRole(editId, {
          name: form.name.trim(),
          description: form.description.trim()
        });
        addToast('Role updated successfully!', 'success');
      } else {
        await createRole({
          name: form.name.trim(),
          description: form.description.trim()
        });
        addToast('Role created successfully!', 'success');
      }
      setShowCreateRole(false);
      fetchRoles();
    } catch (e: any) {
      addToast(e?.response?.data?.message || 'Failed to save role', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({ message: 'Are you sure you want to delete this role?' });
    if (confirmed) {
      try {
        await deleteRole(id);
        addToast('Role deleted successfully', 'success');
        fetchRoles();
      } catch (e: any) {
        addToast(e?.response?.data?.message || 'Failed to delete role', 'error');
      }
    }
  };

  return (
    <main className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Role Management</h1>
        <button onClick={openCreateModal} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium">
          Create Role
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
                <th className="px-6 py-4 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">Date Created</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">Permissions</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">Updated At</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {roles.map((role: any) => (
                <tr key={role.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-mono">{new Date(role.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-medium">{role.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{role.description}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 max-w-md">
                    <div className="flex flex-wrap gap-1.5">
                      {role.permissions?.slice(0, 5).map((p: any) => (
                        <span key={p.permission?.id || Math.random()} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[11px] font-medium tracking-wide shadow-sm" title={p.permission?.description}>
                          {p.permission?.key}
                        </span>
                      ))}
                      {role.permissions?.length > 5 && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[11px] font-medium shadow-sm">
                          +{role.permissions.length - 5} more
                        </span>
                      )}
                      {(!role.permissions || role.permissions.length === 0) && (
                        <span className="text-slate-400 italic text-xs">No permissions assigned</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {new Date(role.updatedAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <button onClick={() => openViewPermissionsModal(role)} className="text-emerald-600 hover:text-emerald-800 font-medium transition-colors">View</button>
                    <button onClick={() => openEditModal(role)} className="text-blue-600 hover:text-blue-800 font-medium transition-colors">Edit</button>
                    <button onClick={() => handleDelete(role.id)} className="text-rose-600 hover:text-rose-800 font-medium transition-colors">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
</div>
          {roles.length === 0 && <EmptyState title="No roles found." />}
        </div>
      )}

      {/* Create Role Modal */}
      {showCreateRole && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowCreateRole(false)}></div>
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">{isEditing ? 'Edit Role' : 'Create New Role'}</h3>
              <button onClick={() => setShowCreateRole(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <form onSubmit={handleSaveRole} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role Name</label>
                <input 
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  type="text" 
                  placeholder="e.g. SUPER_ADMIN" 
                  required 
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <input 
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  type="text" 
                  placeholder="What does this role do?" 
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" 
                />
              </div>
              <div className="flex items-center gap-3 justify-end mt-6">
                <button type="button" onClick={() => setShowCreateRole(false)} className="px-5 py-2.5 rounded-lg text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="px-5 py-2.5 rounded-lg text-sm text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50">
                  {submitting ? 'Saving...' : 'Save Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Permissions Modal */}
      {showViewPermissions && viewingRole && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowViewPermissions(false)}></div>
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between mb-6 shrink-0">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Role Permissions</h3>
                <p className="text-sm text-slate-500 mt-1">Viewing permissions for <span className="font-semibold text-emerald-700">{viewingRole.name}</span></p>
              </div>
              <button onClick={() => setShowViewPermissions(false)} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-1.5 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {(!viewingRole.permissions || viewingRole.permissions.length === 0) ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-slate-500 font-medium">No permissions assigned to this role.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {viewingRole.permissions.map((p: any) => (
                    <div key={p.permission?.id || Math.random()} className="bg-white border border-slate-200 p-4 rounded-xl hover:border-emerald-300 hover:shadow-md transition-all group relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="flex items-start gap-3">
                        <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600 shrink-0">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-800 text-sm mb-1">{p.permission?.key}</h4>
                          <p className="text-xs text-slate-500 leading-relaxed">{p.permission?.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-100 shrink-0 flex justify-end">
              <button onClick={() => setShowViewPermissions(false)} className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 transition-colors shadow-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
