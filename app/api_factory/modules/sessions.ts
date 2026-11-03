import { GATEWAY_ENDPOINT_WITH_AUTH } from '../axios.config';

export const sessions_api = {
 getUserSessions: (params: any) => {
  return GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/sessions', { params });
 },
 revokeUserSession: (id: string) => {
  return GATEWAY_ENDPOINT_WITH_AUTH.post(`/admin/sessions/${id}/revoke`);
 },
 revokeAllForUser: (payload: { userType: string; userId: string }) => {
  return GATEWAY_ENDPOINT_WITH_AUTH.post('/admin/sessions/revoke-user', payload);
 },
 revokeAgentSessions: (agentId: string) => {
  return GATEWAY_ENDPOINT_WITH_AUTH.post(`/admin/agents/${agentId}/sessions/revoke-all`);
 },
 revokeClientSessions: (clientId: string) => {
  return GATEWAY_ENDPOINT_WITH_AUTH.post(`/admin/clients/${clientId}/sessions/revoke-all`);
 }
};
