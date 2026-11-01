"use client";

import { useEffect, useState } from 'react';
import { admins_api } from '@/app/api_factory/modules/admins';
import Pagination from '@/app/components/ui/Pagination';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';

export default function RoleMembersPanel({ roleId }: { roleId: string }) {
 const [page, setPage] = useState(1);
 const [limit, setLimit] = useState(25);
 const [members, setMembers] = useState<any[]>([]);
 const [total, setTotal] = useState(0);
 const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

 useEffect(() => { setPage(1); }, [roleId]);

 useEffect(() => {
  let stale = false;
  setStatus('loading');
  admins_api.getAdmins({ roleId, page, limit }).then((res: any) => {
   if (stale) return;
   if (res?.type === 'ERROR') {
    setStatus('error');
    return;
   }
   setMembers(res.data?.data || []);
   setTotal(res.data?.meta?.total || 0);
   setStatus('ready');
  });
  return () => { stale = true; };
 }, [roleId, page, limit]);

 if (status === 'loading') return <PulseLoader />;
 if (status === 'error') return <p className="text-sm text-red-600 py-8 text-center">Could not load the admins holding this role.</p>;
 if (members.length === 0) return <EmptyState title="No admins hold this role." />;

 return (
  <div>
   <ul className="divide-y divide-border">
    {members.map((member) => (
     <li key={member.id} className="flex items-center justify-between gap-3 py-3">
      <span className="min-w-0">
       <span className="block text-sm font-medium text-foreground truncate">{member.fullName || member.email}</span>
       <span className="block text-xs text-muted-foreground truncate">{member.email}</span>
      </span>
      <span className={`text-xs font-semibold ${member.isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground'}`}>
       {member.isActive ? 'Active' : 'Deactivated'}
      </span>
     </li>
    ))}
   </ul>
   <Pagination totalItems={total} currentPage={page} itemsPerPage={limit} onPageChange={setPage} onItemsPerPageChange={(value) => { setLimit(value); setPage(1); }} />
  </div>
 );
}
