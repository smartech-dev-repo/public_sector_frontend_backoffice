"use client";

import { useSectorOptions } from '@/app/composables/modules/useSectorOptions';
import ExportButton, { ExportColumn } from '@/app/components/ui/ExportButton';
import { ippis_api } from '@/app/api_factory/modules/ippis';
import { useDataVersion } from '@/app/composables/useDataVersion';
import FilterBar from '@/app/components/ui/FilterBar';
import { useCallback, useEffect, useState } from 'react';
import { useIppis } from '@/app/composables/modules/useIppis';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import Pagination from '@/app/components/ui/Pagination';
import SensitiveValue from '@/app/components/ui/SensitiveValue';

import { useAdminPermissions } from '@/app/composables/useAdminPermissions';
import IppisRecordDetailModal, { formatIppisAmount, formatIppisDate, isActiveEmployee } from './IppisRecordDetailModal';

const HEADER_CLASS = 'px-4 py-3 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider whitespace-nowrap';
const HEADER_RIGHT_CLASS = HEADER_CLASS.replace('text-left', 'text-right');
const PAYMENT_MONTHS = [
 ['3 mo ago', 'paymentThreeMonthsAgo'],
 ['2 mo ago', 'paymentTwoMonthsAgo'],
 ['Last month', 'paymentLastMonth'],
] as const;


// The list's last filters, reused by Export so it exports what the list shows.
const exportParams: { current: Record<string, unknown> } = { current: {} };

const EXPORT_COLUMNS: ExportColumn<any>[] = [
 { header: 'Name', value: (r) => r.employeeName },
 { header: 'IPPIS number', value: (r) => r.staffId },
 { header: 'Sector', value: (r) => r.agency },
 { header: 'Phone', value: (r) => r.phone },
 { header: 'Status', value: (r) => r.employeeStatus },
 { header: 'Job title', value: (r) => r.jobTitle },
 { header: 'Department', value: (r) => r.department },
 { header: 'Grade', value: (r) => r.grade },
 { header: 'Step', value: (r) => r.step },
 { header: 'Hire date', value: (r) => r.hireDate },
 { header: 'Salary', value: (r) => (r.salary == null ? '' : Number(r.salary)) },
 { header: 'Payment last month', value: (r) => (r.paymentLastMonth == null ? '' : Number(r.paymentLastMonth)) },
 { header: 'Payment 2 months ago', value: (r) => (r.paymentTwoMonthsAgo == null ? '' : Number(r.paymentTwoMonthsAgo)) },
 { header: 'Payment 3 months ago', value: (r) => (r.paymentThreeMonthsAgo == null ? '' : Number(r.paymentThreeMonthsAgo)) },
];

export default function IppisRecordsTab() {
 const agencyOptions = useSectorOptions();
 const dataVersion = useDataVersion();
 const { isSuperAdmin, hasPermission } = useAdminPermissions();
 const canUploadIppis = isSuperAdmin || hasPermission('ippis:upload');
 const { loading, error, ippisRecords, fetchIppisRecords, meta } = useIppis();
 
 const [page, setPage] = useState(1);
 const [limit, setLimit] = useState(25);
 const [q, setQ] = useState('');
 const [agency, setAgency] = useState('all');
 const [status, setStatus] = useState('all');
 const [viewing, setViewing] = useState<any>(null);

 useEffect(() => {
  if (!canUploadIppis) return;
  const params: any = { page, limit };
  if (q.trim()) params.q = q.trim();
  if (agency !== 'all') params.agency = agency;
  if (status !== 'all') params.employeeStatus = status;
  
  exportParams.current = params;
  fetchIppisRecords(params);
 }, [fetchIppisRecords, page, limit, q, agency, status, canUploadIppis, dataVersion]);

 const closeDetail = useCallback(() => setViewing(null), []);

 return (
  <main className="w-full">
   <IppisRecordDetailModal record={viewing} onClose={closeDetail} />
   <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
    <div>
     <h1 className="text-2xl font-semibold text-foreground hidden">IPPIS Records Catalog</h1>
     <p className="text-sm text-muted-foreground mt-1">View all synced personnel records from IPPIS</p>
    </div>
    <div className="flex items-center gap-3">
    </div>
   </div>

   <div className="mb-6 space-y-4">

    <FilterBar
     onChange={() => setPage(1)}
     search={{ value: q, onChange: setQ, placeholder: 'Name or staff ID' }}
     filters={[
      { key: 'agency', label: 'Agency', type: 'select', value: agency, emptyValue: 'all', options: agencyOptions, onChange: setAgency },
      { key: 'status', label: 'Status', type: 'select', value: status, emptyValue: 'all', options: [{ value: 'ACTIVE', label: 'Active Employee' }, { value: 'INACTIVE', label: 'Ex Employee' }], onChange: setStatus },
     ]}
    >
     <ExportButton fileName="IPPIS_Records" resource="IPPIS records" columns={EXPORT_COLUMNS} fetchPage={(page, limit) => ippis_api.getIppisRecords({ ...exportParams.current, page, limit })} />
    </FilterBar>
   </div>

   {loading && ippisRecords.length === 0 && <PulseLoader />}
   {!loading && error && <div className="text-red-500 py-12 text-center">{error}</div>}
   
   {!error && !(loading && ippisRecords.length === 0) && (
    <div className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col">
     <div className="overflow-x-auto flex-1">
      <table className="min-w-full divide-y divide-slate-200">
       <thead className="bg-[#E9F4EE] dark:bg-emerald-950/20">
        <tr>
         <th className={`pin-start ${HEADER_CLASS}`}>Staff</th>
         <th className={HEADER_CLASS}>Posting</th>
         <th className={HEADER_CLASS}>Grade</th>
         <th className={HEADER_CLASS}>Phone</th>
         <th className={HEADER_CLASS}>Bank</th>
         <th className={HEADER_RIGHT_CLASS}>Salary</th>
         <th className={HEADER_RIGHT_CLASS}>Last 3 payments</th>
         <th className={HEADER_RIGHT_CLASS}>Status</th>
         <th className={`pin-end ${HEADER_RIGHT_CLASS}`}><span className="sr-only">Actions</span></th>
        </tr>
       </thead>
       <tbody className="divide-y divide-slate-100">
 {ippisRecords.length === 0 ? (
  <tr><td colSpan={9} className="p-8"><div className="flex justify-center w-full"><EmptyState title="No IPPIS records found." /></div></td></tr>
 ) : (ippisRecords.map((record: any) => (
         <tr key={record.id} className="hover:bg-muted/30 transition-colors">
          <td className="pin-start px-4 py-3 whitespace-nowrap">
           <div className="max-w-[14rem] truncate text-sm font-semibold text-foreground" title={record.employeeName}>{record.employeeName}</div>
           <div className="text-xs text-muted-foreground font-mono mt-0.5">
            <SensitiveValue value={record.staffId} allowCopy />
           </div>
          </td>
          <td className="px-4 py-3 whitespace-nowrap">
           <div className="text-sm font-medium text-foreground/90">{record.agency || 'N/A'}</div>
           <div className="max-w-[13rem] truncate text-xs text-muted-foreground mt-0.5" title={[record.jobTitle, record.department].filter(Boolean).join(' · ')}>
            {record.jobTitle || 'N/A'} · {record.department || 'N/A'}
           </div>
          </td>
          <td className="px-4 py-3 whitespace-nowrap">
           <div className="text-sm text-foreground/90">GL-{record.grade || '--'} / Step {record.step || '--'}</div>
           <div className="text-xs text-muted-foreground mt-0.5">Hired {formatIppisDate(record.hireDate)}</div>
          </td>
          <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground/90 font-mono">
           <SensitiveValue value={record.phone} allowCopy forceRevealed />
          </td>
          <td className="px-4 py-3 whitespace-nowrap">
           <div className="text-sm text-foreground/90">{record.bankName || 'N/A'}</div>
           <div className="text-xs text-muted-foreground font-mono mt-0.5"><SensitiveValue value={record.accountNumber} allowCopy /></div>
          </td>
          <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground font-medium text-right">{formatIppisAmount(record.salary)}</td>
          <td className="px-4 py-3 whitespace-nowrap text-right">
           {/* Oldest to newest, the order the eligibility workings read them. */}
           <div className="inline-grid grid-cols-3 gap-x-3 text-right">
            {PAYMENT_MONTHS.map(([label]) => <span key={label} className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>)}
            {PAYMENT_MONTHS.map(([label, key]) => <span key={label} className="text-sm text-foreground/90 tabular-nums">{formatIppisAmount(record[key])}</span>)}
           </div>
          </td>
          <td className="px-4 py-3 whitespace-nowrap text-right">
            {(() => {
              const isActive = isActiveEmployee(record.employeeStatus);
              return (
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                  isActive ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300' : 'bg-muted/50 text-muted-foreground'
                }`}>
                  {record.employeeStatus || (isActive ? 'Active Employee' : 'Ex Employee')}
                </span>
              );
            })()}
          </td>
          <td className="pin-end px-4 py-3 whitespace-nowrap text-right">
           <button onClick={() => setViewing(record)} aria-label={`View ${record.employeeName}`} className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted/50 transition-colors">View</button>
          </td>
         </tr>
        )))}
</tbody>
      </table>
     </div>
     
     {meta && (
      <div className="border-t border-border/50 bg-card">
       <Pagination tabTotal 
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
