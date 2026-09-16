import { GATEWAY_ENDPOINT_WITH_AUTH } from '../axios.config';

export const sessions_api = {
  revokeAgentSessions: (agentId: string) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.post(`/admin/agents/${agentId}/sessions/revoke-all`);
  },
  revokeClientSessions: (clientId: string) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.post(`/admin/clients/${clientId}/sessions/revoke-all`);
  }
};
