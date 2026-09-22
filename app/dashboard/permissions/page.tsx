"use client";

import { useEffect, useState } from 'react';
import { usePermissions } from '@/app/composables/modules/usePermissions';
import { useToast } from '@/app/composables/useToast';
import { createPortal } from 'react-dom';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import { useConfirm } from '@/app/composables/useConfirm';

export default function PermissionsPage() {
  const { confirm } = useConfirm();

  const { loading, error, permissions, fetchPermissions, deletePermission, createPermission, updatePermission } = usePermissions();
  const { addToast } = useToast();

  const [showCreatePermission, setShowCreatePermission] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState('');
  const [form, setForm] = useState({ key: '', description: '' });

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const openCreateModal = () => {
    setIsEditing(false);
    setEditId('');
    setForm({ key: '', description: '' });
    setShowCreatePermission(true);
  };

  const openEditModal = (permission: any) => {
    setIsEditing(true);
    setEditId(permission.id);
    setForm({ key: permission.key, description: permission.description || '' });
    setShowCreatePermission(true);
  };

  const handleSavePermission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.key.trim()) return;
    setSubmitting(true);
    try {
      if (isEditing) {
        await updatePermission(editId, {
          key: form.key.trim(),
          description: form.description.trim()
        });
        addToast('Permission updated successfully!', 'success');
      } else {
        await createPermission({
          key: form.key.trim(),
          description: form.description.trim()
        });
        addToast('Permission created successfully!', 'success');
      }
      setShowCreatePermission(false);
      fetchPermissions();
    } catch (e: any) {
      addToast(e?.response?.data?.message || 'Failed to save permission', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({ message: 'Are you sure you want to delete this permission?' });
    if (confirmed) {
      try {
        await deletePermission(id);
        addToast('Permission deleted successfully', 'success');
        fetchPermissions();
      } catch (e: any) {
        addToast(e?.response?.data?.message || 'Failed to delete permission', 'error');
      }
    }
  };

  return (
    <main className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Permission Management</h1>
        <button onClick={openCreateModal} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium">
          Create Permission
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
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Key</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {permissions.map((permission: any) => (
                <tr key={permission.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-mono">{permission.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-medium">{permission.key}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{permission.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <button onClick={() => openEditModal(permission)} className="text-blue-600 hover:text-blue-800 font-medium transition-colors">Edit</button>
                    <button onClick={() => handleDelete(permission.id)} className="text-rose-600 hover:text-rose-800 font-medium transition-colors">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
</div>
          {permissions.length === 0 && <EmptyState title="No permissions found." />}
        </div>
      )}

      {/* Create Permission Modal */}
      {showCreatePermission && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowCreatePermission(false)}></div>
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">{isEditing ? 'Edit Permission' : 'Create New Permission'}</h3>
              <button onClick={() => setShowCreatePermission(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <form onSubmit={handleSavePermission} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Permission Key</label>
                <input 
                  value={form.key}
                  onChange={(e) => setForm({ ...form, key: e.target.value })}
                  type="text" 
                  placeholder="e.g. users.read" 
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
                  placeholder="What does this permission allow?" 
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" 
                />
              </div>
              <div className="flex items-center gap-3 justify-end mt-6">
                <button type="button" onClick={() => setShowCreatePermission(false)} className="px-5 py-2.5 rounded-lg text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="px-5 py-2.5 rounded-lg text-sm text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50">
                  {submitting ? 'Saving...' : 'Save Permission'}
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
