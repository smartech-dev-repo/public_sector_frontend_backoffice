import { GATEWAY_ENDPOINT_WITH_AUTH } from '../axios.config';

export const clients_api = {
  getClients: (params?: any) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/clients', { params });
  },
  getClientById: (id: string) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.get(`/admin/clients/${id}`);
  },
  retryClient: (id: string) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.post(`/admin/clients/${id}/retry`);
  },
  approveClient: (id: string) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.post(`/admin/clients/${id}/approve`);
  },
  getClientWallet: (id: string) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.get(`/admin/clients/${id}/wallet`);
  },
  creditClientWallet: (id: string, payload: any) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.post(`/admin/clients/${id}/wallet/credit`, payload);
  },
  debitClientWallet: (id: string, payload: any) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.post(`/admin/clients/${id}/wallet/debit`, payload);
  }
};
