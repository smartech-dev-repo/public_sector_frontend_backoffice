import { GATEWAY_ENDPOINT_WITH_AUTH } from '../axios.config';

export const notifications_api = {
 list: (params: any) => {
  return GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/notifications', { params });
 },
 summary: () => {
  return GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/notifications/summary', { skipToast: true } as any);
 },
 markRead: (id: string) => {
  return GATEWAY_ENDPOINT_WITH_AUTH.post(`/admin/notifications/${id}/read`);
 },
 markAllRead: () => {
  return GATEWAY_ENDPOINT_WITH_AUTH.post('/admin/notifications/read-all');
 }
};
