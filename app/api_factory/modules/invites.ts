import { GATEWAY_ENDPOINT_WITH_AUTH } from '../axios.config';

export const invites_api = {
  createInvite: (payload: any) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.post('/admin/invites', payload);
  },
  getInvites: (params?: any) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/invites', { params });
  },
  revokeInvite: (id: string) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.post(`/admin/invites/${id}/revoke`);
  },
  resendInvite: (id: string) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.post(`/admin/invites/${id}/resend`);
  }
};
