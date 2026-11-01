"use client";

import { Fragment, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, X } from 'lucide-react';
import FilterBar, { dateRangeParams } from '@/app/components/ui/FilterBar';
import { useAuditLogs } from '@/app/composables/modules/useAuditLogs';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import Pagination from '@/app/components/ui/Pagination';
import Avatar from '@/app/components/ui/Avatar';
import { useAdminPermissions } from '@/app/composables/useAdminPermissions';
import { useToast } from '@/app/composables/useToast';
import { auditLogs_api } from '@/app/api_factory/modules/auditLogs';
import {
 ACTION_OPTIONS,
 TARGET_TYPE_OPTIONS,
 describeAction,
 describeDevice,
 OUTCOME_LABELS,
 OUTCOME_STYLES,
 formatDetailValue,
 humanizeKey,
 parseRequest,
 principalName,
 recordHref,
 visibleDetails,
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
 const [actorFilter, setActorFilter] = useState('');
 const [outcomeFilter, setOutcomeFilter] = useState('');
 const [targetTypeFilter, setTargetTypeFilter] = useState('');
 const [recordFocus, setRecordFocus] = useState<{ type: string; id: string; name: string } | null>(null);
 const [createdRange, setCreatedRange] = useState('');
 const [expandedId, setExpandedId] = useState('');
 const [exporting, setExporting] = useState(false);
 const { addToast } = useToast();

 const filterParams = useMemo(() => {
  const params: any = {};
  if (kindFilter && kindFilter !== 'none') params.kind = kindFilter;
  if (actionFilter && actionFilter !== 'none') params.action = actionFilter;
  if (actorTypeFilter && actorTypeFilter !== 'none') params.actorType = actorTypeFilter;
  if (actorFilter.trim()) params.actor = actorFilter.trim();
  if (outcomeFilter && outcomeFilter !== 'none') params.outcome = outcomeFilter;
  if (targetTypeFilter && targetTypeFilter !== 'none') params.targetType = targetTypeFilter;
  if (recordFocus) {
   params.targetType = recordFocus.type;
   params.targetId = recordFocus.id;
  }
  return { ...params, ...dateRangeParams(createdRange, 'createdFrom', 'createdTo') };
 }, [kindFilter, actionFilter, actorTypeFilter, actorFilter, outcomeFilter, targetTypeFilter, recordFocus, createdRange]);

 useEffect(() => {
  if (!canAudit) return;
  fetchLogs({ page, limit, ...filterParams });
 }, [fetchLogs, canAudit, page, limit, filterParams]);

 const handleExport = async () => {
  setExporting(true);
  const res: any = await auditLogs_api.exportLogs(filterParams);
  setExporting(false);
  if (res?.type === 'ERROR') {
   addToast('The export failed. Please try again.', 'error');
   return;
  }
  const url = URL.createObjectURL(res.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = `audit-trail-${new Date().toISOString().slice(0, 10)}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
  addToast('Audit trail exported', 'success');
 };

 const showEverythingBy = (person: string) => {
  setActorFilter(person);
  setExpandedId('');
  setPage(1);
 };

 const showHistoryOf = (log: any) => {
  setRecordFocus({ type: log.targetType, id: log.targetId, name: principalName(log.target) || targetTypeLabel(log.targetType) || 'this record' });
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
   <div className="flex justify-end">
    <button type="button" onClick={handleExport} disabled={exporting} className="h-11 px-4 border border-border bg-card rounded-lg text-sm font-medium text-foreground hover:bg-muted/50 disabled:opacity-50">
     {exporting ? 'Exporting...' : 'Export as Excel'}
    </button>
   </div>
   <FilterBar
    onChange={() => setPage(1)}
    filters={[
     { key: 'actor', label: 'Admin email', type: 'text', value: actorFilter, placeholder: 'Email, name or phone', onChange: setActorFilter },
     { key: 'outcome', label: 'Status', type: 'select', value: outcomeFilter, emptyValue: 'none', options: [{ value: 'success', label: 'Successful' }, { value: 'failed', label: 'Failed' }, { value: 'blocked', label: 'Blocked' }], onChange: setOutcomeFilter },
     { key: 'kind', label: 'Entry type', type: 'select', value: kindFilter, emptyValue: 'none', options: [{ value: 'event', label: 'Named events' }, { value: 'request', label: 'Automatic records' }], onChange: setKindFilter },
     { key: 'action', label: 'Action', type: 'select', value: actionFilter, emptyValue: 'none', options: ACTION_OPTIONS, onChange: setActionFilter },
     { key: 'actorType', label: 'Done by', type: 'select', value: actorTypeFilter, emptyValue: 'none', options: [{ value: 'ADMIN', label: 'Admin' }, { value: 'AGENT', label: 'Agent' }, { value: 'CLIENT', label: 'Client' }, { value: 'SYSTEM', label: 'System' }], onChange: setActorTypeFilter },
     { key: 'targetType', label: 'Record type', type: 'select', value: targetTypeFilter, emptyValue: 'none', options: TARGET_TYPE_OPTIONS, onChange: setTargetTypeFilter },
     { key: 'created', label: 'Date', type: 'dateRange', value: createdRange, onChange: setCreatedRange },
    ]}
   />

   {recordFocus && (
    <div className="flex items-center justify-between gap-3 px-4 py-2 rounded-lg bg-muted/50 text-sm text-foreground">
     <span>Showing the history of <strong>{recordFocus.name}</strong></span>
     <button type="button" onClick={() => { setRecordFocus(null); setPage(1); }} aria-label="Clear record history filter" className="w-10 h-10 inline-flex items-center justify-center rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
    </div>
   )}

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
         <th scope="col" className={TH}>Status</th>
         <th scope="col" className={TH}>Record</th>
         <th scope="col" className={TH}>From</th>
         <th scope="col" aria-label="Details" className={TH}></th>
        </tr>
       </thead>
       <tbody className="divide-y divide-border">
        {logs.length === 0 && (
         <tr><td colSpan={7} className="p-8"><div className="flex justify-center w-full"><EmptyState title="No audit logs found." /></div></td></tr>
        )}
        {logs.map((log: any) => {
         const request = parseRequest(log.action);
         const actorName = principalName(log.actor) || log.metadata?.email || log.metadata?.phone || (log.actorType === 'SYSTEM' ? 'System' : null);
         const targetName = principalName(log.target) || log.metadata?.email;
         const device = describeDevice(log.userAgent);
         const expanded = expandedId === log.id;
         const details = visibleDetails(log.metadata);
         const changeList = Object.entries((log.metadata?.changes ?? {}) as Record<string, { from: unknown; to: unknown }>);
         const href = recordHref(log.targetType, log.targetId);
         const person = log.actor?.email || log.actor?.phone || log.metadata?.email || log.metadata?.phone;
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
             <span className="block font-medium text-foreground">{describeAction(log.action)}</span>
             <span className="block text-xs text-muted-foreground">{request ? 'Automatic record' : 'Named event'}</span>
            </td>
            <td className="px-4 py-3 text-sm max-w-[220px]">
             <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${OUTCOME_STYLES[log.outcome]}`}>{OUTCOME_LABELS[log.outcome]}</span>
             {log.reason && <span className="block text-xs text-muted-foreground mt-1">{log.reason}</span>}
            </td>
            <td className="px-4 py-3 text-sm">
             {log.targetType ? (
              <>
               {href
                ? <Link href={href} className="block font-medium text-[#016B41] dark:text-emerald-400 hover:underline truncate max-w-[200px]">{targetName || 'Open record'}</Link>
                : <span className="block text-foreground truncate max-w-[200px]">{targetName || 'Removed record'}</span>}
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
             <td colSpan={7} className="px-4 py-4 bg-muted/30">
              <dl className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
               <DetailRow label="Done by" value={person || actorName || 'Unknown'} />
               <DetailRow label="Status" value={OUTCOME_LABELS[log.outcome]} />
               {log.reason && <DetailRow label="Reason" value={log.reason} />}
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
               {person && <button type="button" onClick={() => showEverythingBy(person)} className="h-10 px-3.5 border border-border bg-card rounded-lg text-sm font-medium text-foreground hover:bg-muted/50">Everything by this person</button>}
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
