import { useCallback, useEffect, useRef, useState } from 'react';
import { notifications_api } from '@/app/api_factory/modules/notifications';
import { announceDataChanged, useDataVersion } from '@/app/composables/useDataVersion';

const POLL_MS = 30000;
const CHANGED_EVENT = 'public_sector_notifications_changed';

export interface NotificationSummary {
 unread: number;
 byCategory: Record<string, number>;
 pendingApprovals: number;
 myPendingRequests: number;
}

/** Call after reading a notification or deciding a request, so every count updates at once. */
export const announceNotificationsChanged = () => window.dispatchEvent(new Event(CHANGED_EVENT));

export const useNotificationSummary = () => {
 const [summary, setSummary] = useState<NotificationSummary>({ unread: 0, byCategory: {}, pendingApprovals: 0, myPendingRequests: 0 });
 const dataVersion = useDataVersion();
 const lastCounts = useRef<string | null>(null);

 const refresh = useCallback(async () => {
  // A failed poll keeps the last counts rather than flashing them to zero.
  const res: any = await notifications_api.summary();
  if (!res?.data || res.type === 'ERROR') return;
  setSummary(res.data);
  // Counts move when another admin acts, so open lists catch up without a refresh.
  const counts = JSON.stringify(res.data);
  if (lastCounts.current !== null && lastCounts.current !== counts) announceDataChanged();
  lastCounts.current = counts;
 }, []);

 useEffect(() => { refresh(); }, [refresh, dataVersion]);

 useEffect(() => {
  const timer = setInterval(() => {
   if (document.visibilityState === 'visible') refresh();
  }, POLL_MS);
  window.addEventListener(CHANGED_EVENT, refresh);
  window.addEventListener('focus', refresh);
  return () => {
   clearInterval(timer);
   window.removeEventListener(CHANGED_EVENT, refresh);
   window.removeEventListener('focus', refresh);
  };
 }, [refresh]);

 return summary;
};
