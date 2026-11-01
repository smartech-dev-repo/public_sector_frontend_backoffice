import { useCallback, useEffect, useState } from 'react';
import { notifications_api } from '@/app/api_factory/modules/notifications';

const POLL_MS = 30000;
const CHANGED_EVENT = 'public_sector_notifications_changed';

export interface NotificationSummary {
 unread: number;
 byCategory: Record<string, number>;
 pendingApprovals: number;
}

/** Call after reading a notification or deciding a request, so every count updates at once. */
export const announceNotificationsChanged = () => window.dispatchEvent(new Event(CHANGED_EVENT));

export const useNotificationSummary = () => {
 const [summary, setSummary] = useState<NotificationSummary>({ unread: 0, byCategory: {}, pendingApprovals: 0 });

 const refresh = useCallback(async () => {
  // A failed poll keeps the last counts rather than flashing them to zero.
  const res: any = await notifications_api.summary();
  if (res?.data && res.type !== 'ERROR') setSummary(res.data);
 }, []);

 useEffect(() => {
  refresh();
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
