import { GATEWAY_ENDPOINT_WITH_AUTH } from '../axios.config';

export const approvals_api = {
 list: (params: any) => {
  return GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/approvals', { params });
 },
 getById: (id: string) => {
  return GATEWAY_ENDPOINT_WITH_AUTH.get(`/admin/approvals/${id}`);
 },
 listAssignees: (id: string) => {
  return GATEWAY_ENDPOINT_WITH_AUTH.get(`/admin/approvals/${id}/assignees`);
 },
 assign: (id: string, assigneeId: string | null) => {
  return GATEWAY_ENDPOINT_WITH_AUTH.post(`/admin/approvals/${id}/assign`, { assigneeId });
 },
 approve: (id: string, note?: string) => {
  return GATEWAY_ENDPOINT_WITH_AUTH.post(`/admin/approvals/${id}/approve`, { note });
 },
 reject: (id: string, note: string) => {
  return GATEWAY_ENDPOINT_WITH_AUTH.post(`/admin/approvals/${id}/reject`, { note });
 },
 cancel: (id: string) => {
  return GATEWAY_ENDPOINT_WITH_AUTH.post(`/admin/approvals/${id}/cancel`);
 }
};
