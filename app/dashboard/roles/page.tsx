"use client";

import { useEffect, useState } from 'react';
import { useRoles } from '@/app/composables/modules/useRoles';
import { useToast } from '@/app/composables/useToast';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import { useConfirm } from '@/app/composables/useConfirm';

export default function RolesPage() {
  const { confirm } = useConfirm();

  const { loading, error, roles, fetchRoles, deleteRole, createRole, updateRole } = useRoles();
  const { addToast } = useToast();

  const [showCreateRole, setShowCreateRole] = useState(false);
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
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {roles.map((role: any) => (
                <tr key={role.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-mono">{role.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-medium">{role.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{role.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <button onClick={() => openEditModal(role)} className="text-blue-600 hover:text-blue-800 font-medium transition-colors">Edit</button>
                    <button onClick={() => handleDelete(role.id)} className="text-rose-600 hover:text-rose-800 font-medium transition-colors">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
</div>
          {roles.length === 0 && <EmptyState message="No roles found." />}
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
    </main>
  );
}
