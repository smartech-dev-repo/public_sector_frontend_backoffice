"use client";

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import FilterBar from '@/app/components/ui/FilterBar';
import Pagination from '@/app/components/ui/Pagination';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import { timeAgo } from '@/app/components/ui/NotificationBell';
import { notifications_api } from '@/app/api_factory/modules/notifications';
import { announceNotificationsChanged } from '@/app/composables/modules/useNotificationSummary';

const CATEGORIES = [
 { value: 'approvals', label: 'Approvals' },
 { value: 'loans', label: 'Loans' },
 { value: 'clients', label: 'Customers' },
 { value: 'agents', label: 'Agents' },
 { value: 'uploads', label: 'Uploads' },
 { value: 'security', label: 'Security' },
];

export default function NotificationsPage() {
 const router = useRouter();
 const [page, setPage] = useState(1);
 const [limit, setLimit] = useState(25);
 const [category, setCategory] = useState('');
 const [read, setRead] = useState('');
 const [items, setItems] = useState<any[]>([]);
 const [total, setTotal] = useState(0);
 const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

 const load = useCallback(async () => {
  const params: any = { page, limit };
  if (category && category !== 'none') params.category = category;
  if (read === 'unread') params.unread = true;
  const res: any = await notifications_api.list(params);
  if (res?.type === 'ERROR') {
   setState('error');
   return;
  }
  setItems(res.data?.data || []);
  setTotal(res.data?.meta?.total || 0);
  setState('ready');
 }, [page, limit, category, read]);

 useEffect(() => { load(); }, [load]);

 const openItem = async (item: any) => {
  if (!item.readAt) {
   await notifications_api.markRead(item.id);
   announceNotificationsChanged();
  }
  router.push(item.link);
 };

 const markAll = async () => {
  await notifications_api.markAllRead();
  announceNotificationsChanged();
  load();
 };

 return (
  <main className="w-full space-y-4">
   <div className="flex flex-wrap items-center justify-between gap-3">
    <FilterBar
     onChange={() => setPage(1)}
     filters={[
      { key: 'read', label: 'Show', type: 'select', value: read, emptyValue: 'none', options: [{ value: 'unread', label: 'Unread only' }], onChange: setRead },
      { key: 'category', label: 'Type', type: 'select', value: category, emptyValue: 'none', options: CATEGORIES, onChange: setCategory },
     ]}
    />
    <button type="button" onClick={markAll} className="h-11 px-4 border border-border bg-card rounded-lg text-sm font-medium text-foreground hover:bg-muted/50">Mark all as read</button>
   </div>
   {state === 'loading' && <PulseLoader />}
   {state === 'error' && <p className="text-red-600 py-12 text-center">Could not load notifications.</p>}
   {state === 'ready' && items.length === 0 && <EmptyState title="No notifications." />}
   {state === 'ready' && items.length > 0 && (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
     <ul className="divide-y divide-border">
      {items.map((item) => (
       <li key={item.id}>
        <button type="button" onClick={() => openItem(item)} className={`w-full text-left px-5 py-4 hover:bg-muted/40 ${item.readAt ? '' : 'bg-emerald-50/60 dark:bg-emerald-950/20'}`}>
         <span className="flex items-start justify-between gap-3">
          <span className={`text-sm text-foreground ${item.readAt ? 'font-medium' : 'font-semibold'}`}>{item.title}</span>
          <span className="text-xs text-muted-foreground whitespace-nowrap">{timeAgo(item.createdAt)}</span>
         </span>
         <span className="block text-sm text-muted-foreground mt-0.5">{item.body}</span>
        </button>
       </li>
      ))}
     </ul>
     <div className="border-t border-border/50 py-4 px-4">
      <Pagination totalItems={total} currentPage={page} itemsPerPage={limit} onPageChange={setPage} onItemsPerPageChange={(value) => { setLimit(value); setPage(1); }} />
     </div>
    </div>
   )}
  </main>
 );
}
