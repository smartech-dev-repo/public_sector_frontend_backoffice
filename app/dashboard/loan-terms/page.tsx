"use client";

import { useEffect, useState } from 'react';
import { useLoans } from '@/app/composables/modules/useLoans';
import { useToast } from '@/app/composables/useToast';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import { createPortal } from 'react-dom';

import TableDropdown from '@/app/components/ui/TableDropdown';
import Pagination from '@/app/components/ui/Pagination';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/app/components/ui/Select';

export default function LoanTermsPage() {
 const { loading, error, loanTerms, fetchLoanTerms, createLoanTerm, updateLoanTerm } = useLoans();
 const { addToast } = useToast();

 const [showCreateModal, setShowCreateModal] = useState(false);
 const [showFilters, setShowFilters] = useState(false);
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

 const [agencyFilter, setAgencyFilter] = useState('');
 const [isActiveFilter, setIsActiveFilter] = useState('');
 const [page, setPage] = useState(1);
 const [limit, setLimit] = useState(25);

 useEffect(() => {
  const params: any = { page, limit };
  if (agencyFilter) params.agency = agencyFilter;
  if (isActiveFilter && isActiveFilter !== 'none') params.isActive = isActiveFilter;
  fetchLoanTerms(params);
 }, [fetchLoanTerms, agencyFilter, isActiveFilter, page, limit]);

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
  <main className="w-full">
   <div className="flex justify-between items-center mb-3">
    <h1 className="text-2xl font-semibold text-foreground">Loan Terms</h1>
    <button onClick={() => { setForm({ agency: '', minAmount: '', maxAmount: '', interestRate: '', tenorMonths: '' }); setShowCreateModal(true); }} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors whitespace-nowrap">
     Create Loan Term
    </button>
   </div>

   <div className="mb-6 space-y-4">
    <div className="flex items-center justify-between">
     <button 
      onClick={() => setShowFilters(!showFilters)}
      className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full text-sm font-medium text-foreground/90 hover:bg-muted/30 transition-colors "
     >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
      Filters
      <svg className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
     </button>
    </div>

    {showFilters && (
     <div className="bg-card p-6 rounded-2xl border border-border/50 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
       <div className="space-y-1.5">
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Search</label>
        <input 
         type="text"
         placeholder="Agency (e.g. NPF)..."
         value={agencyFilter}
         onChange={e => setAgencyFilter(e.target.value)}
         className="w-full px-4 py-2 border rounded-lg text-sm bg-card border-border outline-none focus:ring-1 focus:ring-emerald-200 focus:border-emerald-400"
        />
       </div>

       <div className="space-y-1.5">
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
        <Select value={isActiveFilter} onValueChange={setIsActiveFilter}>
         <SelectTrigger className="w-full bg-card"><SelectValue placeholder="All Statuses" /></SelectTrigger>
         <SelectContent>
          <SelectItem value="none">All Statuses</SelectItem>
          <SelectItem value="true">Active</SelectItem>
          <SelectItem value="false">Inactive</SelectItem>
         </SelectContent>
        </Select>
       </div>
      </div>
      
      <div className="mt-6 flex justify-end">
       <button onClick={() => { setAgencyFilter(''); setIsActiveFilter('none'); }} className="px-5 py-2 bg-card border border-border rounded-full text-sm font-medium text-foreground/90 hover:bg-muted/30 transition-colors">Clear Filters</button>
      </div>
     </div>
    )}
   </div>

   {loading && <PulseLoader />}
   {!loading && error && <div className="text-red-500 py-12 text-center">{error}</div>}
   
   {!loading && !error && (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
     
      <div className="overflow-x-auto">
       <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-[#E9F4EE] dark:bg-emerald-950/20">
         <tr>
          <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Agency</th>
          <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Min Amount</th>
          <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Max Amount</th>
          <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Interest Rate</th>
          <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Tenor (Months)</th>
          <th className="px-4 py-4 text-right text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Actions</th>
         </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
 {loanTerms.length === 0 ? (<tr><td colSpan={6} className="p-8"><div className="flex justify-center w-full"><EmptyState title="No loan terms found." /></div></td></tr>) : (loanTerms.map((term: any) => (
          <tr key={term.id} className="hover:bg-muted/30 transition-colors">
           <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground">{term.agency}</td>
           <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">₦{term.minAmount?.toLocaleString()}</td>
           <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">₦{term.maxAmount?.toLocaleString()}</td>
           <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">{term.interestRate}%</td>
           <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">{term.tenorMonths}</td>
           <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
            <button onClick={() => openEditModal(term)} className="text-emerald-600 hover:text-emerald-800 transition-colors">Edit</button>
           </td>
          </tr>
         )))}
</tbody>
       </table>
      </div>
     
    </div>
   )}

   {/* Modals */}
   {(showCreateModal || showEditModal) && typeof document !== 'undefined' && createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
     <div className="fixed inset-0 bg-slate-900 dark:bg-slate-800/50 backdrop-blur-sm" onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}></div>
     <div className="relative bg-card rounded-2xl p-6 w-full max-w-md mx-4 animate-in fade-in zoom-in-95 duration-200">
      <h3 className="text-lg font-semibold text-foreground mb-4">{showCreateModal ? 'Create Loan Term' : 'Edit Loan Term'}</h3>
      <div className="space-y-4">
       <div>
        <label className="block text-sm font-medium text-foreground/90 mb-1">Agency</label>
        <input value={form.agency} onChange={(e) => setForm({ ...form, agency: e.target.value })} type="text" className="w-full px-4 py-2 border rounded-lg" />
       </div>
       <div className="grid grid-cols-2 gap-4">
        <div>
         <label className="block text-sm font-medium text-foreground/90 mb-1">Min Amount</label>
         <input value={form.minAmount} onChange={(e) => setForm({ ...form, minAmount: e.target.value })} type="number" className="w-full px-4 py-2 border rounded-lg" />
        </div>
        <div>
         <label className="block text-sm font-medium text-foreground/90 mb-1">Max Amount</label>
         <input value={form.maxAmount} onChange={(e) => setForm({ ...form, maxAmount: e.target.value })} type="number" className="w-full px-4 py-2 border rounded-lg" />
        </div>
       </div>
       <div className="grid grid-cols-2 gap-4">
        <div>
         <label className="block text-sm font-medium text-foreground/90 mb-1">Interest Rate (%)</label>
         <input value={form.interestRate} onChange={(e) => setForm({ ...form, interestRate: e.target.value })} type="number" step="0.01" className="w-full px-4 py-2 border rounded-lg" />
        </div>
        <div>
         <label className="block text-sm font-medium text-foreground/90 mb-1">Tenor (Months)</label>
         <input value={form.tenorMonths} onChange={(e) => setForm({ ...form, tenorMonths: e.target.value })} type="number" className="w-full px-4 py-2 border rounded-lg" />
        </div>
       </div>
      </div>
      <div className="flex justify-end gap-3 mt-6">
       <button onClick={() => { setShowCreateModal(false); setShowEditModal(false); }} className="px-4 py-2 bg-muted/50 text-foreground/90 rounded-lg">Cancel</button>
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
