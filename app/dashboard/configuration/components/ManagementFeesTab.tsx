"use client";

import { useDataVersion } from '@/app/composables/useDataVersion';
import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Modal from '@/app/components/ui/Modal';
import EmptyState from '@/app/components/ui/EmptyState';
import Pagination from '@/app/components/ui/Pagination';
import PulseLoader from '@/app/components/ui/PulseLoader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/Select';
import { useAdminPermissions } from '@/app/composables/useAdminPermissions';
import { useConfirm } from '@/app/composables/useConfirm';
import { useManagementFees } from '@/app/composables/modules/useManagementFees';
import { useToast } from '@/app/composables/useToast';
import { formatFeeRange } from './formatFeeRange';

const EMPTY_FORM = { name: '', type: 'PERCENTAGE', value: '', minAmount: '', maxAmount: '', isActive: true };

const inputClass = 'w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-sm font-medium text-foreground focus:ring-2 focus:ring-[#018752]/20 focus:border-[#018752] outline-none transition-all';
const labelClass = 'block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2';

export default function ManagementFeesTab() {
 const dataVersion = useDataVersion();
  const { isSuperAdmin, hasPermission } = useAdminPermissions();
  const canManage = isSuperAdmin || hasPermission('management-fees:manage');

  const { loading, fees, meta, fetchFees, saveFee, removeFee } = useManagementFees();
  const { addToast } = useToast();
  const { confirm } = useConfirm();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [query, setQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const reload = () => fetchFees({ page, limit, q: query.trim() || undefined });

  useEffect(() => {
    if (canManage) reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canManage, page, limit, query, dataVersion]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setIsFormOpen(true);
  };

  const openEdit = (fee: any) => {
    setEditingId(fee.id);
    setForm({
      name: fee.name,
      type: fee.type,
      value: String(Number(fee.value)),
      minAmount: fee.minAmount === null ? '' : String(Number(fee.minAmount)),
      maxAmount: fee.maxAmount === null ? '' : String(Number(fee.maxAmount)),
      isActive: fee.isActive,
    });
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    const value = Number(form.value);
    const minAmount = form.minAmount === '' ? null : Number(form.minAmount);
    const maxAmount = form.maxAmount === '' ? null : Number(form.maxAmount);

    if (!form.name.trim()) return addToast('Enter a name for this fee', 'error');
    if (form.value === '' || isNaN(value) || value < 0) return addToast('Enter a valid fee value', 'error');
    if (form.type === 'PERCENTAGE' && value > 100) return addToast('A percentage fee cannot exceed 100%', 'error');
    if (minAmount !== null && maxAmount !== null && minAmount > maxAmount) {
      return addToast('The minimum amount cannot be above the maximum amount', 'error');
    }

    const payload: any = { name: form.name.trim(), type: form.type, value, minAmount, maxAmount };
    if (editingId) payload.isActive = form.isActive;

    if (await saveFee(editingId, payload)) {
      addToast(editingId ? 'Management fee updated' : 'Management fee created', 'success');
      setIsFormOpen(false);
    }
  };

  const handleDelete = async (fee: any) => {
    const ok = await confirm({ title: 'Delete management fee', message: `Delete "${fee.name}"? This cannot be undone.`, confirmText: 'Delete' });
    if (ok && (await removeFee(fee.id))) {
      addToast('Management fee deleted', 'success');
    }
  };

  if (!canManage) {
    return (
      <div className="p-8">
        <EmptyState title="Access Restricted" description="You do not have permission to manage management fees." />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          placeholder="Search by name..."
          className="w-full sm:max-w-xs px-4 py-2 border rounded-lg text-sm bg-card border-border outline-none focus:ring-1 focus:ring-emerald-200 focus:border-emerald-400"
        />
        <button onClick={openCreate} className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#018752] hover:bg-[#016f43] text-white text-sm font-semibold transition-colors">
          <Plus className="w-4 h-4" /> Add Fee
        </button>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {loading && fees.length === 0 ? (
          <div className="p-6"><PulseLoader /></div>
        ) : fees.length === 0 ? (
          <EmptyState title="No management fees yet" description="Add a fee, then pick it on a loan product." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-[#E9F4EE] dark:bg-emerald-950/20">
                  <tr>
                    {['Name', 'Value', 'Amount Range', 'Products', 'Status', ''].map((heading, i, all) => (
                      <th key={heading} className={`${i === 0 ? 'pin-start ' : i === all.length - 1 ? 'pin-end ' : ''}px-4 py-3 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider`}>{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {fees.map((fee: any) => (
                    <tr key={fee.id} className="hover:bg-muted/30 transition-colors">
                      <td className="pin-start px-4 py-3 text-sm font-medium text-foreground">{fee.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground">
                        {fee.type === 'PERCENTAGE' ? `${Number(fee.value)}%` : `₦${Number(fee.value).toLocaleString()} flat`}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">{formatFeeRange(fee)}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{fee._count?.loanProducts ?? 0}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${fee.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-muted text-muted-foreground'}`}>
                          {fee.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="pin-end px-4 py-3 text-right whitespace-nowrap">
                        <button onClick={() => openEdit(fee)} aria-label={`Edit ${fee.name}`} className="p-2 text-muted-foreground hover:text-foreground transition-colors"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(fee)} aria-label={`Delete ${fee.name}`} className="p-2 text-muted-foreground hover:text-rose-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination tabTotal totalItems={meta?.total || 0} currentPage={page} itemsPerPage={limit} onPageChange={setPage} onItemsPerPageChange={setLimit} />
          </>
        )}
      </div>

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onConfirm={handleSave} title={editingId ? 'Edit Management Fee' : 'Add Management Fee'}>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Standard Fee" className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Fee Type</label>
              <Select value={form.type} onValueChange={(val) => setForm({ ...form, type: val })}>
                <SelectTrigger className="w-full h-11 bg-muted/30 border-border rounded-xl text-sm font-medium"><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent hideSearch>
                  <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                  <SelectItem value="FLAT">Flat Fee (₦)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className={labelClass}>Value ({form.type === 'PERCENTAGE' ? '%' : '₦'})</label>
              <input type="number" min="0" step="any" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Min Amount (₦)</label>
              <input type="number" min="0" step="any" value={form.minAmount} onChange={(e) => setForm({ ...form, minAmount: e.target.value })} placeholder="Optional" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Max Amount (₦)</label>
              <input type="number" min="0" step="any" value={form.maxAmount} onChange={(e) => setForm({ ...form, maxAmount: e.target.value })} placeholder="Optional" className={inputClass} />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">Leave both amounts empty to make this the general fee, used when no range matches.</p>

          {editingId && (
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-[#018752]" />
              Active
            </label>
          )}
        </div>
      </Modal>
    </div>
  );
}
