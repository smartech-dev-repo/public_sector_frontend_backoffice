import { GATEWAY_ENDPOINT_WITH_AUTH } from '../axios.config';
import type { RepaymentCapacityPayload } from './loanEligibility';

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
 /** Repayment capacity for everyone in this sector. Needs loan-settings:manage. */
 updateRepaymentCapacity: (id: string, payload: RepaymentCapacityPayload) => {
  return GATEWAY_ENDPOINT_WITH_AUTH.patch(`/admin/sectors/${id}/repayment-capacity`, payload);
 },
 remove: (id: string) => {
  return GATEWAY_ENDPOINT_WITH_AUTH.delete(`/admin/sectors/${id}`);
 }
};
