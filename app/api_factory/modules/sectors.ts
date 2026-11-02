import { GATEWAY_ENDPOINT_WITH_AUTH } from '../axios.config';

export const sectors_api = {
 list: () => {
  return GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/sectors');
 },
 create: (payload: { code: string; name?: string }) => {
  return GATEWAY_ENDPOINT_WITH_AUTH.post('/admin/sectors', payload);
 },
 update: (id: string, payload: { name?: string }) => {
  return GATEWAY_ENDPOINT_WITH_AUTH.patch(`/admin/sectors/${id}`, payload);
 },
 remove: (id: string) => {
  return GATEWAY_ENDPOINT_WITH_AUTH.delete(`/admin/sectors/${id}`);
 }
};
