"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import { notifications_api } from '@/app/api_factory/modules/notifications';
import { announceNotificationsChanged } from '@/app/composables/modules/useNotificationSummary';

export const timeAgo = (value: string) => {
 const minutes = Math.floor((Date.now() - new Date(value).getTime()) / 60000);
 if (minutes < 1) return 'Just now';
 if (minutes < 60) return `${minutes}m ago`;
 const hours = Math.floor(minutes / 60);
 if (hours < 24) return `${hours}h ago`;
 return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function NotificationBell({ unread }: { unread: number }) {
 const router = useRouter();
 const panelRef = useRef<HTMLDivElement>(null);
 const [open, setOpen] = useState(false);
 const [items, setItems] = useState<any[]>([]);

 const load = async () => {
  const res: any = await notifications_api.list({ limit: 6 });
  if (res?.type !== 'ERROR') setItems(res.data?.data || []);
 };

 useEffect(() => {
  if (open) load();
 }, [open, unread]);

 useEffect(() => {
  const close = (e: MouseEvent) => {
   if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
  };
  document.addEventListener('mousedown', close);
  return () => document.removeEventListener('mousedown', close);
 }, []);

 const openItem = async (item: any) => {
  setOpen(false);
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
  <div className="relative" ref={panelRef}>
   <button
    type="button"
    onClick={() => setOpen(!open)}
    aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
    aria-expanded={open}
    className="relative p-2 text-muted-foreground hover:text-primary hover:bg-accent rounded-lg transition-colors"
   >
    <Bell className="w-5 h-5" />
    {unread > 0 && (
     <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-rose-600 text-white text-[10px] font-bold">
      {unread > 99 ? '99+' : unread}
     </span>
    )}
   </button>
   {open && (
    <div className="absolute right-0 mt-2 w-[min(360px,calc(100vw-2rem))] bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden">
     <div className="flex items-center justify-between px-4 py-3 border-b border-border">
      <span className="text-sm font-bold text-foreground">Notifications</span>
      {unread > 0 && <button type="button" onClick={markAll} className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">Mark all as read</button>}
     </div>
     {items.length === 0 && <p className="px-4 py-8 text-sm text-center text-muted-foreground">You're all caught up.</p>}
     <ul className="max-h-96 overflow-y-auto divide-y divide-border">
      {items.map((item) => (
       <li key={item.id}>
        <button type="button" onClick={() => openItem(item)} className={`w-full text-left px-4 py-3 hover:bg-muted/50 ${item.readAt ? '' : 'bg-emerald-50/60 dark:bg-emerald-950/20'}`}>
         <span className="flex items-start justify-between gap-3">
          <span className={`text-sm text-foreground ${item.readAt ? 'font-medium' : 'font-semibold'}`}>{item.title}</span>
          <span className="text-[11px] text-muted-foreground whitespace-nowrap">{timeAgo(item.createdAt)}</span>
         </span>
         <span className="block text-xs text-muted-foreground mt-0.5">{item.body}</span>
        </button>
       </li>
      ))}
     </ul>
     <Link href="/dashboard/notifications" onClick={() => setOpen(false)} className="block px-4 py-3 text-center text-sm font-semibold text-emerald-700 dark:text-emerald-400 border-t border-border hover:bg-muted/50">
      View all notifications
     </Link>
    </div>
   )}
  </div>
 );
}
