"use client";

import { useDataVersion } from '@/app/composables/useDataVersion';
import FilterBar, { AGENCY_FILTER_OPTIONS, dateRangeParams } from '@/app/components/ui/FilterBar';
import { useEffect, useState } from 'react';
import { useLoans } from '@/app/composables/modules/useLoans';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import Pagination from '@/app/components/ui/Pagination';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/app/components/ui/Select';

import { useAdminPermissions } from '@/app/composables/useAdminPermissions';

export default function LoansCatalogTab() {
 const dataVersion = useDataVersion();
 const { isSuperAdmin, hasPermission } = useAdminPermissions();
 const canAccessCatalog = isSuperAdmin || hasPermission('loans:upload');
 const { loading, error, loans, fetchLoans, meta } = useLoans();
 
 const [page, setPage] = useState(1);
 const [limit, setLimit] = useState(25);
 const [q, setQ] = useState('');
 const [agency, setAgency] = useState('all');
 const [product, setProduct] = useState('all');
 const [dateRange, setDateRange] = useState('');

 useEffect(() => {
  if (!canAccessCatalog) return;
  const params: any = { page, limit };
  if (q.trim()) params.q = q.trim();
  if (agency !== 'all') params.agency = agency;
  if (product !== 'all') params.product = product;
  Object.assign(params, dateRangeParams(dateRange, 'disbursedFrom', 'disbursedTo'));
  
  fetchLoans(params);
 }, [fetchLoans, page, limit, q, agency, product, dateRange, canAccessCatalog, dataVersion]);

 return (
  <main className="w-full">
   <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
    <div>
     <h1 className="text-2xl font-semibold text-foreground hidden">Loans Database</h1>
     <p className="text-sm text-muted-foreground mt-1">View all ingested loans across agencies</p>
    </div>
    <div className="flex items-center gap-3">
    </div>
   </div>

   <div className="mb-6 space-y-4">

    <FilterBar
     onChange={() => setPage(1)}
     search={{ value: q, onChange: setQ, placeholder: 'Customer, account or IPPIS' }}
     filters={[
      { key: 'agency', label: 'Agency', type: 'select', value: agency, emptyValue: 'all', options: AGENCY_FILTER_OPTIONS, onChange: setAgency },
      { key: 'product', label: 'Product', type: 'text', value: product, emptyValue: 'all', placeholder: 'Exact product name', onChange: setProduct },
      { key: 'disbursed', label: 'Disbursed', type: 'dateRange', value: dateRange, onChange: setDateRange },
     ]}
    />
   </div>

   {loading && loans.length === 0 && <PulseLoader />}
   {!loading && error && <div className="text-red-500 py-12 text-center">{error}</div>}
   
   {!error && !(loading && loans.length === 0) && (
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
