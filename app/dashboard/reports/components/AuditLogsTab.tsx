"use client";

import { Fragment, useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import FilterBar, { dateRangeParams } from '@/app/components/ui/FilterBar';
import { useAuditLogs } from '@/app/composables/modules/useAuditLogs';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import Pagination from '@/app/components/ui/Pagination';
import Avatar from '@/app/components/ui/Avatar';
import { useAdminPermissions } from '@/app/composables/useAdminPermissions';
import {
 ACTION_OPTIONS,
 TARGET_TYPE_OPTIONS,
 describeAction,
 describeDevice,
 formatDetailValue,
 humanizeKey,
 isAlertAction,
 parseRequest,
 principalName,
} from './auditFormat';

const TH = 'px-4 py-3.5 text-left text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider';

const dateTime = (value: string) =>
 new Date(value).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });

const targetTypeLabel = (type?: string | null) => TARGET_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type;

const DetailRow = ({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) => (
 <div className="min-w-0">
  <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
  <dd className={`text-sm text-foreground break-words ${mono ? 'font-mono text-xs' : ''}`}>{value}</dd>
 </div>
);

export default function AuditLogsTab() {
 const { isSuperAdmin, hasPermission } = useAdminPermissions();
 const canAudit = isSuperAdmin || hasPermission('audit:read');
 const [page, setPage] = useState(1);
 const [limit, setLimit] = useState(25);
 const { loading, error, logs, fetchLogs, meta } = useAuditLogs();

 const [kindFilter, setKindFilter] = useState('');
 const [actionFilter, setActionFilter] = useState('');
 const [actorTypeFilter, setActorTypeFilter] = useState('');
 const [actorIdFilter, setActorIdFilter] = useState('');
 const [targetTypeFilter, setTargetTypeFilter] = useState('');
 const [targetIdFilter, setTargetIdFilter] = useState('');
 const [createdRange, setCreatedRange] = useState('');
 const [expandedId, setExpandedId] = useState('');

 useEffect(() => {
  if (!canAudit) return;
  const params: any = { page, limit };
  if (kindFilter && kindFilter !== 'none') params.kind = kindFilter;
  if (actionFilter && actionFilter !== 'none') params.action = actionFilter;
  if (actorTypeFilter && actorTypeFilter !== 'none') params.actorType = actorTypeFilter;
  if (actorIdFilter.trim()) params.actorId = actorIdFilter.trim();
  if (targetTypeFilter && targetTypeFilter !== 'none') params.targetType = targetTypeFilter;
  if (targetIdFilter.trim()) params.targetId = targetIdFilter.trim();
  Object.assign(params, dateRangeParams(createdRange, 'createdFrom', 'createdTo'));
  fetchLogs(params);
 }, [fetchLogs, canAudit, page, limit, kindFilter, actionFilter, actorTypeFilter, actorIdFilter, targetTypeFilter, targetIdFilter, createdRange]);

 const showEverythingBy = (actorId: string) => {
  setActorIdFilter(actorId);
  setExpandedId('');
  setPage(1);
 };

 const showHistoryOf = (log: any) => {
  setTargetTypeFilter(log.targetType);
  setTargetIdFilter(log.targetId);
  setExpandedId('');
  setPage(1);
 };

 if (!canAudit) {
  return (
   <div className="p-8">
    <EmptyState title="Access Restricted" description="You do not have permission to view audit trail logs." />
   </div>
  );
 }

 return (
  <main className="w-full space-y-4">
   <FilterBar
    onChange={() => setPage(1)}
    filters={[
     { key: 'kind', label: 'Entry type', type: 'select', value: kindFilter, emptyValue: 'none', options: [{ value: 'event', label: 'Named events' }, { value: 'request', label: 'Automatic records' }], onChange: setKindFilter },
     { key: 'action', label: 'Action', type: 'select', value: actionFilter, emptyValue: 'none', options: ACTION_OPTIONS, onChange: setActionFilter },
     { key: 'actorType', label: 'Done by', type: 'select', value: actorTypeFilter, emptyValue: 'none', options: [{ value: 'ADMIN', label: 'Admin' }, { value: 'AGENT', label: 'Agent' }, { value: 'CLIENT', label: 'Client' }, { value: 'SYSTEM', label: 'System' }], onChange: setActorTypeFilter },
     { key: 'actorId', label: 'Person ID', type: 'text', value: actorIdFilter, placeholder: 'Person ID', onChange: setActorIdFilter },
     { key: 'targetType', label: 'Record type', type: 'select', value: targetTypeFilter, emptyValue: 'none', options: TARGET_TYPE_OPTIONS, onChange: setTargetTypeFilter },
     { key: 'targetId', label: 'Record ID', type: 'text', value: targetIdFilter, placeholder: 'Record ID', onChange: setTargetIdFilter },
     { key: 'created', label: 'Date', type: 'dateRange', value: createdRange, onChange: setCreatedRange },
    ]}
   />

   {loading && logs.length === 0 && <PulseLoader />}
   {!loading && error && <div className="text-red-500 py-12 text-center">{error}</div>}

   {!error && !(loading && logs.length === 0) && (
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
     <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border">
       <thead className="bg-[#E9F4EE] dark:bg-emerald-950/20">
        <tr>
         <th scope="col" className={TH}>When</th>
         <th scope="col" className={TH}>Who</th>
         <th scope="col" className={TH}>What happened</th>
         <th scope="col" className={TH}>On</th>
         <th scope="col" className={TH}>From</th>
         <th scope="col" aria-label="Details" className={TH}></th>
        </tr>
       </thead>
       <tbody className="divide-y divide-border">
        {logs.length === 0 && (
         <tr><td colSpan={6} className="p-8"><div className="flex justify-center w-full"><EmptyState title="No audit logs found." /></div></td></tr>
        )}
        {logs.map((log: any) => {
         const request = parseRequest(log.action);
         const failed = (request?.status ?? 0) >= 400 || isAlertAction(log.action);
         const actorName = principalName(log.actor) || log.metadata?.email || log.metadata?.phone || (log.actorType === 'SYSTEM' ? 'System' : null);
         const targetName = principalName(log.target) || log.metadata?.email;
         const device = describeDevice(log.userAgent);
         const expanded = expandedId === log.id;
         const { changes, ...otherDetails } = log.metadata ?? {};
         const details = Object.entries(otherDetails);
         const changeList = Object.entries((changes ?? {}) as Record<string, { from: unknown; to: unknown }>);
         return (
          <Fragment key={log.id}>
           <tr className="hover:bg-muted/30 transition-colors">
            <td className="px-4 py-3 whitespace-nowrap text-xs text-foreground">{dateTime(log.createdAt)}</td>
            <td className="px-4 py-3 whitespace-nowrap">
             <span className="flex items-center gap-2.5">
              <Avatar name={actorName} size="sm" />
              <span className="min-w-0">
               <span className="block text-sm font-medium text-foreground truncate max-w-[200px]">{actorName || 'Unknown'}</span>
               <span className="block text-xs text-muted-foreground">{log.actor?.role?.name || humanizeKey(log.actorType || 'unknown')}</span>
              </span>
             </span>
            </td>
            <td className="px-4 py-3 text-sm">
             <span className={`block font-medium ${failed ? 'text-rose-700 dark:text-rose-400' : 'text-foreground'}`}>{describeAction(log.action)}</span>
             <span className="block text-xs text-muted-foreground">{request ? `Automatic record · ${request.status}` : 'Named event'}</span>
            </td>
            <td className="px-4 py-3 text-sm">
             {log.targetType ? (
              <>
               <span className="block text-foreground truncate max-w-[200px]">{targetName || `${log.targetId?.slice(0, 8) ?? ''}...`}</span>
               <span className="block text-xs text-muted-foreground">{targetTypeLabel(log.targetType)}</span>
              </>
             ) : <span className="text-muted-foreground/60">—</span>}
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-xs">
             {log.ip || device ? (
              <>
               <span className="block font-mono text-foreground">{log.ip || '—'}</span>
               <span className="block text-muted-foreground">{device || '—'}</span>
              </>
             ) : <span className="text-muted-foreground" title="This was not recorded for older named events">Not recorded</span>}
            </td>
            <td className="px-2 py-3 text-right">
             <button
              type="button"
              onClick={() => setExpandedId(expanded ? '' : log.id)}
              aria-expanded={expanded}
              aria-label={`${expanded ? 'Hide' : 'Show'} details of ${describeAction(log.action)}`}
              className="w-10 h-10 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/50"
             >
              <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
             </button>
            </td>
           </tr>
           {expanded && (
            <tr>
             <td colSpan={6} className="px-4 py-4 bg-muted/30">
              <dl className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
               <DetailRow label="Entry ID" value={log.id} mono />
               <DetailRow label="Exact action" value={log.action} mono />
               <DetailRow label="Done by" value={log.actor?.email || log.actor?.phone || actorName || 'Unknown'} />
               <DetailRow label="Person ID" value={log.actorId || '—'} mono />
               {log.targetId && <DetailRow label="Record ID" value={log.targetId} mono />}
               {details.map(([key, value]) => <DetailRow key={key} label={humanizeKey(key)} value={formatDetailValue(value)} />)}
               <DetailRow label="Device details" value={log.userAgent || 'Not recorded'} mono />
              </dl>
              {changeList.length > 0 && (
               <div className="mt-4">
                <h4 className="text-xs font-medium text-muted-foreground mb-1">What changed</h4>
                <ul className="space-y-1">
                 {changeList.map(([field, change]) => (
                  <li key={field} className="text-sm text-foreground break-words">
                   <span className="font-medium">{humanizeKey(field)}:</span> {formatDetailValue(change.from)} → {formatDetailValue(change.to)}
                  </li>
                 ))}
                </ul>
               </div>
              )}
              <div className="flex flex-wrap gap-2 mt-4">
               {log.actorId && <button type="button" onClick={() => showEverythingBy(log.actorId)} className="h-10 px-3.5 border border-border bg-card rounded-lg text-sm font-medium text-foreground hover:bg-muted/50">Everything by this person</button>}
               {log.targetType && log.targetId && <button type="button" onClick={() => showHistoryOf(log)} className="h-10 px-3.5 border border-border bg-card rounded-lg text-sm font-medium text-foreground hover:bg-muted/50">Full history of this record</button>}
              </div>
             </td>
            </tr>
           )}
          </Fragment>
         );
        })}
       </tbody>
      </table>
     </div>
     {meta && logs.length > 0 && (
      <div className="border-t border-border/50 py-4 px-4">
       <Pagination totalItems={meta.total || 0} currentPage={page || 1} itemsPerPage={limit || 25} onPageChange={setPage} onItemsPerPageChange={setLimit} />
      </div>
     )}
    </div>
   )}
  </main>
 );
}
