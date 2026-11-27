import { GATEWAY_ENDPOINT_WITH_AUTH } from '../axios.config';

export const alertRecipients_api = {
 list: () => {
  return GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/alert-recipients');
 },
 create: (payload: { email: string; name?: string }) => {
  return GATEWAY_ENDPOINT_WITH_AUTH.post('/admin/alert-recipients', payload);
 },
 update: (id: string, payload: { email?: string; name?: string; isActive?: boolean }) => {
  return GATEWAY_ENDPOINT_WITH_AUTH.patch(`/admin/alert-recipients/${id}`, payload);
 },
 remove: (id: string) => {
  return GATEWAY_ENDPOINT_WITH_AUTH.delete(`/admin/alert-recipients/${id}`);
 }
};
