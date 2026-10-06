"use client";

import { useEffect } from 'react';
import { useAuditLogs } from '@/app/composables/modules/useAuditLogs';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import Pagination from '@/app/components/ui/Pagination';
import CustomDateRangePicker from '@/app/components/ui/CustomDateRangePicker';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/app/components/ui/Select';
import { useState } from 'react';

export default function AuditLogsTab() {
 const [showFilter, setShowFilter] = useState(false);
 const [page, setPage] = useState(1);
 const [limit, setLimit] = useState(25);
 const { loading, error, logs, fetchLogs, meta } = useAuditLogs();

 const [actionFilter, setActionFilter] = useState('');
 const [actorTypeFilter, setActorTypeFilter] = useState('');
 const [targetTypeFilter, setTargetTypeFilter] = useState('');
 const [targetIdFilter, setTargetIdFilter] = useState('');
 const [createdRange, setCreatedRange] = useState('');

 useEffect(() => {
  const params: any = { page, limit };
  if (actionFilter) params.action = actionFilter;
  if (actorTypeFilter && actorTypeFilter !== 'none') params.actorType = actorTypeFilter;
  if (targetTypeFilter) params.targetType = targetTypeFilter;
  if (targetIdFilter) params.targetId = targetIdFilter;
  if (createdRange) {
   const [from, to] = createdRange.split(' to ');
   if (from) params.createdFrom = from;
   if (to) params.createdTo = to;
  }
  fetchLogs(params);
 }, [fetchLogs, page, limit, actionFilter, actorTypeFilter, targetTypeFilter, targetIdFilter, createdRange]);

 return (
  <main className="w-full">
   <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
    <h1 className="text-2xl font-semibold text-foreground hidden">Audit Logs</h1>
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
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
       <div className="space-y-1.5">
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Action</label>
        <input 
         type="text"
         placeholder="Action (e.g. admin.invite.created)..."
         value={actionFilter}
         onChange={e => setActionFilter(e.target.value)}
         className="w-full px-4 py-2 border rounded-lg text-sm bg-card border-border outline-none focus:ring-1 focus:ring-emerald-200 focus:border-emerald-400"
        />
       </div>
       <div className="space-y-1.5">
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Actor Type</label>
        <Select value={actorTypeFilter} onValueChange={setActorTypeFilter}>
         <SelectTrigger className="w-full bg-card"><SelectValue placeholder="All Actor Types" /></SelectTrigger>
         <SelectContent>
          <SelectItem value="none">All Actor Types</SelectItem>
          <SelectItem value="ADMIN">ADMIN</SelectItem>
          <SelectItem value="AGENT">AGENT</SelectItem>
          <SelectItem value="CLIENT">CLIENT</SelectItem>
          <SelectItem value="SYSTEM">SYSTEM</SelectItem>
         </SelectContent>
        </Select>
       </div>
       <div className="space-y-1.5">
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Target Type</label>
        <input 
         type="text"
         placeholder="Target Type (e.g. AdminInvite)..."
         value={targetTypeFilter}
         onChange={e => setTargetTypeFilter(e.target.value)}
         className="w-full px-4 py-2 border rounded-lg text-sm bg-card border-border outline-none focus:ring-1 focus:ring-emerald-200 focus:border-emerald-400"
        />
       </div>
       <div className="space-y-1.5">
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Target ID</label>
        <input 
         type="text"
         placeholder="Target ID..."
         value={targetIdFilter}
         onChange={e => setTargetIdFilter(e.target.value)}
         className="w-full px-4 py-2 border rounded-lg text-sm bg-card border-border outline-none focus:ring-1 focus:ring-emerald-200 focus:border-emerald-400"
        />
       </div>
       <div className="space-y-1.5 z-[60] relative">
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Date Created</label>
        <CustomDateRangePicker 
         value={createdRange} 
         onChange={setCreatedRange} 
         placeholder="Created Date" 
        />
       </div>
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
        <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Date</th>
        <th className="px-4 py-4 text-right text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Actions</th>
        <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Actor</th>
        <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Target</th>
       </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
 {logs.length === 0 ? (
  <tr><td colSpan={4} className="p-8"><div className="flex justify-center w-full"><EmptyState title="No audit logs found." /></div></td></tr>
 ) : (logs.map((log: any) => (
        <tr key={log.id} className="hover:bg-muted/30 transition-colors">
         <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground">{new Date(log.createdAt).toLocaleString()}</td>
         <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground font-medium">{log.action}</td>
         <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">{log.actorType} ({log.actorId})</td>
         <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">{log.targetType} ({log.targetId})</td>
        </tr>
       )))}
</tbody>
     </table>
</div>
     {meta && logs.length > 0 && (
      <div className="border-t border-border/50 pt-4 mt-4 pb-4">
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
