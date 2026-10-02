"use client";

import { useEffect, useState } from 'react';
import { usePermissions } from '@/app/composables/modules/usePermissions';
import { useToast } from '@/app/composables/useToast';
import { createPortal } from 'react-dom';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import { useConfirm } from '@/app/composables/useConfirm';
import Pagination from '@/app/components/ui/Pagination';

export default function PermissionsPage() {
  const { confirm } = useConfirm();

  const { loading, error, permissions, fetchPermissions, deletePermission, createPermission, updatePermission, meta } = usePermissions();
  const { addToast } = useToast();

  const [showCreatePermission, setShowCreatePermission] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState('');
  const [form, setForm] = useState({ key: '', description: '' });
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [q, setQ] = useState('');

  useEffect(() => {
    const params: any = { page, limit };
    if (q.trim()) params.q = q.trim();
    fetchPermissions(params);
  }, [fetchPermissions, page, limit, q]);

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
    <main className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h1 className="text-2xl font-semibold text-foreground">Permission Management</h1>
        <button onClick={openCreateModal} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium whitespace-nowrap">
          Create Permission
        </button>
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex bg-card p-2 rounded-2xl border border-border shadow-sm">
          <div className="flex items-center pl-3 pr-2 text-muted-foreground/70">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          <input 
            type="text"
            placeholder="Search by key (e.g. audit)..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full px-2 py-1.5 bg-transparent border-none outline-none text-sm text-foreground placeholder-slate-400"
          />
        </div>
      </div>

      {loading && <PulseLoader />}
      {!loading && error && <div className="text-red-500 py-12 text-center">{error}</div>}
      
      {!loading && !error && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-[#E9F4EE] dark:bg-emerald-950/20">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Date Created</th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Key</th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Updated At</th>
                  <th className="px-4 py-4 text-right text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {permissions.map((permission: any) => (
                  <tr key={permission.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground font-mono">{new Date(permission.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground font-medium">{permission.key}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">{permission.description}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">{new Date(permission.updatedAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      <button onClick={() => openEditModal(permission)} className="text-blue-600 hover:text-blue-800 font-medium transition-colors">Edit</button>
                      <button onClick={() => handleDelete(permission.id)} className="text-rose-600 hover:text-rose-800 font-medium transition-colors">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {permissions.length === 0 && <EmptyState title="No permissions found." />}
          {meta && meta.total > 0 && (
            <div className="border-t border-border/50 bg-card">
              <Pagination 
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

      {/* Create Permission Modal */}
      {showCreatePermission && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="fixed inset-0 bg-slate-900 dark:bg-slate-800/50 backdrop-blur-sm" onClick={() => setShowCreatePermission(false)}></div>
          <div className="relative bg-card rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">{isEditing ? 'Edit Permission' : 'Create New Permission'}</h3>
              <button onClick={() => setShowCreatePermission(false)} className="text-muted-foreground/70 hover:text-muted-foreground">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <form onSubmit={handleSavePermission} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground/90 mb-1">Permission Key</label>
                <input 
                  value={form.key}
                  onChange={(e) => setForm({ ...form, key: e.target.value })}
                  type="text" 
                  placeholder="e.g. users.read" 
                  required 
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:ring-1 focus:ring-emerald-200 focus:border-emerald-400 outline-none transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/90 mb-1">Description</label>
                <input 
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  type="text" 
                  placeholder="What does this permission allow?" 
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:ring-1 focus:ring-emerald-200 focus:border-emerald-400 outline-none transition-all" 
                />
              </div>
              <div className="flex items-center gap-3 justify-end mt-6">
                <button type="button" onClick={() => setShowCreatePermission(false)} className="px-5 py-2.5 rounded-lg text-sm text-foreground/90 bg-muted/50 hover:bg-slate-200 transition-colors">Cancel</button>
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
