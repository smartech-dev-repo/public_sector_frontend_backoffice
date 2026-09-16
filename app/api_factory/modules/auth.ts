import { GATEWAY_ENDPOINT, GATEWAY_ENDPOINT_WITH_AUTH } from '../axios.config';

export const auth_api = {
  login: (payload: any) => {
    return GATEWAY_ENDPOINT.post('/auth/login', payload);
  },
  adminLogin: (payload: any) => {
    return GATEWAY_ENDPOINT.post('/auth/admin/login', payload);
  },
  acceptInvite: (payload: any) => {
    return GATEWAY_ENDPOINT.post('/auth/admin/accept-invite', payload);
  },
  getAdminProfile: () => {
    return GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/me');
  },
  agentLogin: (payload: any) => {
    return GATEWAY_ENDPOINT.post('/auth/agent/login', payload);
  },
  clientOtpRequest: (payload: any) => {
    return GATEWAY_ENDPOINT.post('/auth/client/otp/request', payload);
  },
  clientOtpVerify: (payload: any) => {
    return GATEWAY_ENDPOINT.post('/auth/client/otp/verify', payload);
  },
  refresh: () => {
    return GATEWAY_ENDPOINT_WITH_AUTH.post('/auth/refresh');
  },
  getSessions: () => {
    return GATEWAY_ENDPOINT_WITH_AUTH.get('/auth/sessions');
  },
  deleteSession: (id: string) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.delete(`/auth/sessions/${id}`);
  },
  logout: () => {
    return GATEWAY_ENDPOINT_WITH_AUTH.post('/auth/logout');
  },
  logoutAll: () => {
    return GATEWAY_ENDPOINT_WITH_AUTH.post('/auth/logout-all');
  },
  getProfile: () => {
    return GATEWAY_ENDPOINT_WITH_AUTH.get('/auth/profile');
  }
};
