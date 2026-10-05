"use client";

import { useEffect, useState } from 'react';
import { useLoans } from '@/app/composables/modules/useLoans';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import Pagination from '@/app/components/ui/Pagination';
import CustomDateRangePicker from '@/app/components/ui/CustomDateRangePicker';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/app/components/ui/Select';

export default function LoansCatalogTab() {
 const { loading, error, loans, fetchLoans, meta } = useLoans();
 
 const [page, setPage] = useState(1);
 const [limit, setLimit] = useState(25);
 const [q, setQ] = useState('');
 const [agency, setAgency] = useState('all');
 const [product, setProduct] = useState('all');
 const [showFilter, setShowFilter] = useState(false);
 const [dateRange, setDateRange] = useState('');

 useEffect(() => {
  const params: any = { page, limit };
  if (q.trim()) params.q = q.trim();
  if (agency !== 'all') params.agency = agency;
  if (product !== 'all') params.product = product;
  if (dateRange) {
   const [from, to] = dateRange.split(' to ');
   if (from) params.dateFrom = from;
   if (to) params.dateTo = to;
  }
  
  fetchLoans(params);
 }, [fetchLoans, page, limit, q, agency, product, dateRange]);

 return (
  <main className="w-full">
   <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
    <div>
     <h1 className="text-2xl font-semibold text-foreground hidden">Loans Database</h1>
     <p className="text-sm text-muted-foreground mt-1">View all ingested loans across agencies</p>
    </div>
    <div className="flex items-center gap-3">
     <button 
      onClick={() => setShowFilter(!showFilter)}
      className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full text-sm font-medium text-foreground/90 hover:bg-muted/30 transition-colors "
     >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
      Filters
      <svg className={`w-4 h-4 transition-transform ${showFilter ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
     </button>
    </div>
   </div>

   <div className="mb-6 space-y-4">

    {showFilter && (
     <div className="bg-card p-6 rounded-2xl border border-border/50 animate-in fade-in slide-in-from-top-2 duration-200">
    <div className="flex bg-card p-2 rounded-xl border border-border/50 mb-6">
     <div className="flex items-center pl-3 pr-2 text-muted-foreground/70">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
     </div>
     <input 
      type="text"
      placeholder="Search by customer name, account number or IPPIS..."
      value={q}
      onChange={(e) => setQ(e.target.value)}
      className="w-full px-2 py-1.5 bg-transparent border-none outline-none text-sm text-foreground placeholder-slate-400"
     />
    </div>

      <div className="grid gap-6 sm:grid-cols-3">
       <div className="space-y-1.5">
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Agency</label>
        <Select value={agency} onValueChange={setAgency}>
         <SelectTrigger className="w-full bg-card"><SelectValue placeholder="All Agencies" /></SelectTrigger>
         <SelectContent>
          <SelectItem value="all">All Agencies</SelectItem>
          <SelectItem value="NSCDC">NSCDC</SelectItem>
          <SelectItem value="NCS">NCS</SelectItem>
          <SelectItem value="NIS">NIS</SelectItem>
          <SelectItem value="NPS">NPS</SelectItem>
         </SelectContent>
        </Select>
       </div>
       <div className="space-y-1.5">
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Product</label>
        <Select value={product} onValueChange={setProduct}>
         <SelectTrigger className="w-full bg-card"><SelectValue placeholder="All Products" /></SelectTrigger>
         <SelectContent>
          <SelectItem value="all">All Products</SelectItem>
          <SelectItem value="TEST PRODUCT">TEST PRODUCT</SelectItem>
          <SelectItem value="PERSONAL LOAN">PERSONAL LOAN</SelectItem>
          <SelectItem value="SALARY ADVANCE">SALARY ADVANCE</SelectItem>
         </SelectContent>
        </Select>
       </div>
       <div className="space-y-1.5 z-[70] relative">
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Disbursement Date</label>
        <CustomDateRangePicker 
         value={dateRange} 
         onChange={setDateRange} 
         placeholder="Select date range" 
        />
       </div>
      </div>
     </div>
    )}
   </div>

   {loading && <PulseLoader />}
   {!loading && error && <div className="text-red-500 py-12 text-center">{error}</div>}
   
   {!loading && !error && (
    <div className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col">
     <div className="overflow-x-auto flex-1">
      <table className="min-w-full divide-y divide-slate-200">
       <thead className="bg-[#E9F4EE] dark:bg-emerald-950/20">
        <tr>
         <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Customer</th>
         <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Agency / IPPIS</th>
         <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Product</th>
         <th className="px-4 py-4 text-right text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Loan Amount</th>
         <th className="px-4 py-4 text-right text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Balance</th>
         <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Disbursement Date</th>
        </tr>
       </thead>
       <tbody className="divide-y divide-slate-100">
 {loans.length === 0 ? (
  <tr><td colSpan={6} className="p-8"><div className="flex justify-center w-full"><EmptyState title="No loans found." /></div></td></tr>
 ) : (loans.map((loan: any) => (
         <tr key={loan.id} className="hover:bg-muted/30 transition-colors">
          <td className="px-4 py-4 whitespace-nowrap">
           <div className="text-sm font-semibold text-foreground">{loan.customerName}</div>
           <div className="text-xs text-muted-foreground font-mono mt-0.5">{loan.accountNumber}</div>
          </td>
          <td className="px-4 py-4 whitespace-nowrap">
           <div className="text-sm text-foreground/90 font-medium">{loan.agency || 'N/A'}</div>
           <div className="text-xs text-muted-foreground font-mono mt-0.5">{loan.ippisNumber}</div>
          </td>
          <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground/90">
           {loan.product || 'N/A'}
          </td>
          <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground font-medium text-right">
           ₦{Number(loan.loanAmount || 0).toLocaleString()}
          </td>
          <td className="px-4 py-4 whitespace-nowrap text-sm text-amber-600 font-medium text-right">
           ₦{Number(loan.principalBalance || 0).toLocaleString()}
          </td>
          <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">
           {loan.disbursementDate ? new Date(loan.disbursementDate).toLocaleDateString('en-GB') : 'N/A'}
          </td>
         </tr>
        )))}
</tbody>
      </table>
     </div>
     
     {meta && (
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
  </main>
 );
}
