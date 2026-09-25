"use client";

import { useEffect, useState } from 'react'; 
import { useDepartments } from '@/app/composables/modules/useDepartments';
import { useToast } from '@/app/composables/useToast';
import { createPortal } from 'react-dom';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import { useConfirm } from '@/app/composables/useConfirm';
import TableDropdown from '@/app/components/ui/TableDropdown';
import Pagination from '@/app/components/ui/Pagination';

export default function DepartmentsTab() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const { confirm } = useConfirm();

  const { loading, error, departments, meta, fetchDepartments, createDepartment, updateDepartment, deleteDepartment } = useDepartments();
  const { addToast } = useToast();

  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [form, setForm] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchDepartments({ page, limit });
  }, [fetchDepartments, page, limit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingDepartment) {
        await updateDepartment(editingDepartment.id, form);
        addToast('Department updated successfully', 'success');
      } else {
        await createDepartment(form);
        addToast('Department created successfully', 'success');
      }
      setShowModal(false);
      setEditingDepartment(null);
      setForm({ name: '', description: '' });
      fetchDepartments({ page, limit });
    } catch (err: any) {
      addToast(err.message || 'Failed to save department', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (department: any) => {
    setEditingDepartment(department);
    setForm({ name: department.name, description: department.description || '' });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirm({
      title: 'Delete Department',
      message: 'Are you sure you want to delete this department? This action cannot be undone and may fail if users are assigned to it.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      
    });

    if (isConfirmed) {
      try {
        await deleteDepartment(id);
        addToast('Department deleted successfully', 'success');
        fetchDepartments({ page, limit });
      } catch (err: any) {
        addToast(err.message || 'Failed to delete department', 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-foreground">Departments</h1>
        <button 
          onClick={() => {
            setEditingDepartment(null);
            setForm({ name: '', description: '' });
            setShowModal(true);
          }}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Add Department
        </button>
      </div>

      {loading && departments.length === 0 ? (
        <div className="flex justify-center items-center p-12">
          <PulseLoader />
        </div>
      ) : error ? (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg text-sm">
          {error}
        </div>
      ) : departments.length === 0 ? (
        <EmptyState 
          title="No departments found" 
          description="Get started by creating a new department."
        />
      ) : (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#E9F4EE]">
                  <tr>
                  <th className="px-6 py-2 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">Date Created</th>
                  <th className="px-6 py-2 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">Name</th>
                  <th className="px-6 py-2 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">Description</th>
                  <th className="px-6 py-2 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">Updated At</th>
                  <th className="px-6 py-2 text-left text-xs font-medium text-[#018752] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {departments.map((department: any) => (
                  <tr key={department.id} className="hover:bg-accent/50 transition-colors">
                    <td className="px-6 py-2">
                      <div className="font-medium text-slate-800 font-mono">{new Date(department.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    </td>
                    <td className="px-6 py-2">
                      <div className="font-medium text-foreground">{department.name}</div>
                    </td>
                    <td className="px-6 py-2">
                      <div className="text-muted-foreground">{department.description || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-2">
                      <div className="text-slate-500 text-sm">{new Date(department.updatedAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    </td>
                    <td className="px-6 py-2 text-right">
                      <TableDropdown>
                        <button onClick={() => handleEdit(department)} className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors">Edit</button>
                        <button onClick={() => handleDelete(department.id)} className="w-full text-left px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors">Delete</button>
                      </TableDropdown>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {meta && (
            <div className="border-t border-border pt-4 mt-4 pb-4">
              <Pagination
                totalItems={meta.total || 0}
                currentPage={page}
                itemsPerPage={limit}
                onPageChange={setPage}
                onItemsPerPageChange={setLimit}
              />
            </div>
          )}
        </div>
      )}

      {showModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-md rounded-xl border border-border shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-2 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-semibold text-foreground">
                {editingDepartment ? 'Edit Department' : 'Create Department'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Department Name</label>
                <input 
                  type="text" 
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="e.g. Engineering"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Description (Optional)</label>
                <textarea 
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Enter department description"
                  rows={3}
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : (editingDepartment ? 'Save Changes' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
