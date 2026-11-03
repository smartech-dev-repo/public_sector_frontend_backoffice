import { GATEWAY_ENDPOINT_WITH_AUTH } from '../axios.config';

export const clients_api = {
  getClients: (params?: any) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/clients', { params });
  },
  getClientById: (id: string) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.get(`/admin/clients/${id}`);
  },
  retryClient: (id: string, payload?: { note?: string }) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.post(`/admin/clients/${id}/retry`, {
      note: payload?.note?.trim() || 'Verification retry requested by administrator'
    });
  },
  approveClient: (id: string) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.post(`/admin/clients/${id}/approve`);
  },
  revokeClientSessions: (clientId: string) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.post(`/admin/clients/${clientId}/sessions/revoke-all`);
  },
  getClientWallet: (id: string, params?: any) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.get(`/admin/clients/${id}/wallet`, { params });
  },
  creditClientWallet: (id: string, payload: any) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.post(`/admin/clients/${id}/wallet/credit`, payload);
  },
  debitClientWallet: (id: string, payload: any) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.post(`/admin/clients/${id}/wallet/debit`, payload);
  },
  getClientActivities: (id: string) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.get(`/admin/clients/${id}/activities`);
  },
  clientIppisLookup: (payload: any) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.post(`/admin/clients/onboarding/ippis-lookup`, payload);
  },
  submitClientIdentity: (id: string, payload: any) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.post(`/admin/clients/${id}/onboarding/identity`, payload);
  },
  uploadClientDocument: (id: string, type: string, payload: any) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.post(`/admin/clients/${id}/onboarding/documents/${type}`, payload, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  submitClientFaceMatch: (id: string, payload?: any) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.post(`/admin/clients/${id}/onboarding/face-match`, payload);
  },
  getClientOnboardingStatus: (id: string) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.get(`/admin/clients/${id}/onboarding/status`);
  },
  getClientAnalytics: (params?: any) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/clients/analytics', { params });
  }
};
