import { GATEWAY_ENDPOINT_WITH_AUTH } from '../axios.config';

export const management_fees_api = {
 list: (params?: any) => {
  return GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/management-fees', { params });
 },
 create: (payload: any) => {
  return GATEWAY_ENDPOINT_WITH_AUTH.post('/admin/management-fees', payload);
 },
 update: (id: string, payload: any) => {
  return GATEWAY_ENDPOINT_WITH_AUTH.patch(`/admin/management-fees/${id}`, payload);
 },
 remove: (id: string) => {
  return GATEWAY_ENDPOINT_WITH_AUTH.delete(`/admin/management-fees/${id}`);
 },
};
