import { GATEWAY_ENDPOINT_WITH_AUTH } from '../axios.config';

export const agents_api = {
  getAgents: (params?: any) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/agents', { params });
  },
  getAgentById: (id: string) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.get(`/admin/agents/${id}`);
  },
  approveAgent: (id: string) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.post(`/admin/agents/${id}/approve`);
  },
  rejectAgent: (id: string, payload: any) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.post(`/admin/agents/${id}/reject`, payload);
  },
  resendCredentials: (id: string) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.post(`/admin/agents/${id}/resend-credentials`);
  },
  updateOnboardingAccess: (id: string, payload: { canOnboardClients: boolean }) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.patch(`/admin/agents/${id}/onboarding-access`, payload);
  },
  revokeSessions: (id: string) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.post(`/admin/agents/${id}/sessions/revoke-all`);
  }
};
