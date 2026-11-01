"use client";

import { useEffect, useState } from 'react';
import { auditLogs_api } from '@/app/api_factory/modules/auditLogs';
import Pagination from '@/app/components/ui/Pagination';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';

const ACTION_LABELS: Record<string, string> = {
 'role.created': 'Role created',
 'role.updated': 'Details edited',
 'role.deleted': 'Role deleted',
 'role.permissions.replaced': 'Permissions changed',
 'role.permissions.bulk_assigned': 'Permissions added',
 'role.permission.assigned': 'Permission added',
 'role.permission.removed': 'Permission removed',
};

const KeyList = ({ title, keys }: { title: string; keys?: string[] }) => {
 if (!keys?.length) return null;
 return <p className="text-xs text-muted-foreground mt-1 break-words"><span className="font-semibold">{title}:</span> <span className="font-mono">{keys.join(', ')}</span></p>;
};

// `version` changes whenever the role is saved, so a new entry shows without a reload.
export default function RoleHistoryPanel({ roleId, version }: { roleId: string; version?: string }) {
 const [page, setPage] = useState(1);
 const [limit, setLimit] = useState(25);
 const [logs, setLogs] = useState<any[]>([]);
 const [total, setTotal] = useState(0);
 const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

 useEffect(() => { setPage(1); }, [roleId]);

 useEffect(() => {
  let stale = false;
  setStatus('loading');
  auditLogs_api.getLogs({ targetType: 'Role', targetId: roleId, page, limit }).then((res: any) => {
   if (stale) return;
   if (res?.type === 'ERROR') {
    setStatus('error');
    return;
   }
   setLogs(res.data?.data || []);
   setTotal(res.data?.meta?.total || 0);
   setStatus('ready');
  });
  return () => { stale = true; };
 }, [roleId, page, limit, version]);

 if (status === 'loading') return <PulseLoader />;
 if (status === 'error') return <p className="text-sm text-red-600 py-8 text-center">Could not load this role's history.</p>;
 if (logs.length === 0) return <EmptyState title="No changes recorded yet." />;

 return (
  <div>
   <ul className="divide-y divide-border">
    {logs.map((log) => (
     <li key={log.id} className="py-3">
      <div className="flex items-start justify-between gap-3">
       <span className="text-sm font-medium text-foreground">{ACTION_LABELS[log.action] || log.action}</span>
       <span className="text-xs text-muted-foreground whitespace-nowrap">
        {new Date(log.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
       </span>
      </div>
      <p className="text-xs text-muted-foreground">{log.actor?.fullName || log.actor?.email || 'Unknown admin'}</p>
      <KeyList title="Added" keys={log.metadata?.added} />
      <KeyList title="Removed" keys={log.metadata?.removed} />
     </li>
    ))}
   </ul>
   <Pagination totalItems={total} currentPage={page} itemsPerPage={limit} onPageChange={setPage} onItemsPerPageChange={(value) => { setLimit(value); setPage(1); }} />
  </div>
 );
}
