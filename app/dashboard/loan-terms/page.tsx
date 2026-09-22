"use client";

import { useEffect, useState } from 'react';
import { useLoans } from '@/app/composables/modules/useLoans';
import { useToast } from '@/app/composables/useToast';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import { createPortal } from 'react-dom';

export default function LoanTermsPage() {
  const { loading, error, loanTerms, fetchLoanTerms, createLoanTerm, updateLoanTerm } = useLoans();
  const { addToast } = useToast();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<any>(null);

  const [form, setForm] = useState({
    agency: '',
    minAmount: '',
    maxAmount: '',
    interestRate: '',
    tenorMonths: ''
  });

  useEffect(() => {
    fetchLoanTerms();
  }, [fetchLoanTerms]);

  const handleCreate = async () => {
    setSubmitting(true);
    try {
      await createLoanTerm({
        ...form,
        minAmount: Number(form.minAmount),
        maxAmount: Number(form.maxAmount),
        interestRate: Number(form.interestRate),
        tenorMonths: Number(form.tenorMonths)
      });
      addToast('Loan term created successfully', 'success');
      setShowCreateModal(false);
      fetchLoanTerms();
    } catch (e: any) {
      addToast(e?.response?.data?.message || 'Failed to create loan term', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (term: any) => {
    setSelectedTerm(term);
    setForm({
      agency: term.agency || '',
      minAmount: term.minAmount || '',
      maxAmount: term.maxAmount || '',
      interestRate: term.interestRate || '',
      tenorMonths: term.tenorMonths || ''
    });
    setShowEditModal(true);
  };

  const handleEdit = async () => {
    setSubmitting(true);
    try {
      await updateLoanTerm(selectedTerm.id, {
        agency: form.agency,
        minAmount: Number(form.minAmount),
        maxAmount: Number(form.maxAmount),
        interestRate: Number(form.interestRate),
        tenorMonths: Number(form.tenorMonths)
      });
      addToast('Loan term updated successfully', 'success');
      setShowEditModal(false);
      fetchLoanTerms();
    } catch (e: any) {
      addToast(e?.response?.data?.message || 'Failed to update loan term', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Loan Terms</h1>
        <button onClick={() => { setForm({ agency: '', minAmount: '', maxAmount: '', interestRate: '', tenorMonths: '' }); setShowCreateModal(true); }} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
          Create Loan Term
        </button>
      </div>

      {loading && <PulseLoader />}
      {!loading && error && <div className="text-red-500 py-12 text-center">{error}</div>}
      
      {!loading && !error && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {loanTerms.length === 0 && <EmptyState title="No loan terms found." />}
          {loanTerms.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Agency</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Min Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Max Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Interest Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tenor (Months)</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loanTerms.map((term: any) => (
                    <tr key={term.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">{term.agency}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">₦{term.minAmount?.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">₦{term.maxAmount?.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{term.interestRate}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{term.tenorMonths}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => openEditModal(term)} className="text-emerald-600 hover:text-emerald-800 transition-colors">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {(showCreateModal || showEditModal) && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}></div>
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">{showCreateModal ? 'Create Loan Term' : 'Edit Loan Term'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Agency</label>
                <input value={form.agency} onChange={(e) => setForm({ ...form, agency: e.target.value })} type="text" className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Min Amount</label>
                  <input value={form.minAmount} onChange={(e) => setForm({ ...form, minAmount: e.target.value })} type="number" className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Max Amount</label>
                  <input value={form.maxAmount} onChange={(e) => setForm({ ...form, maxAmount: e.target.value })} type="number" className="w-full px-4 py-2 border rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Interest Rate (%)</label>
                  <input value={form.interestRate} onChange={(e) => setForm({ ...form, interestRate: e.target.value })} type="number" step="0.01" className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tenor (Months)</label>
                  <input value={form.tenorMonths} onChange={(e) => setForm({ ...form, tenorMonths: e.target.value })} type="number" className="w-full px-4 py-2 border rounded-lg" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setShowCreateModal(false); setShowEditModal(false); }} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg">Cancel</button>
              <button onClick={showCreateModal ? handleCreate : handleEdit} disabled={submitting} className="px-4 py-2 bg-emerald-600 text-white rounded-lg disabled:opacity-50">
                {submitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </main>
  );
}
