import { GATEWAY_ENDPOINT, GATEWAY_ENDPOINT_WITH_AUTH, SESSION_ENDPOINT } from '../axios.config';

export const auth_api = {
 adminLogin: (payload: any) => {
  return SESSION_ENDPOINT.post('/login', payload);
 },
 acceptInvite: (payload: any) => {
  return SESSION_ENDPOINT.post('/accept-invite', payload);
 },
 forgotPassword: (payload: any) => {
  return GATEWAY_ENDPOINT.post('/auth/admin/forgot-password', payload);
 },
 resetPassword: (payload: any) => {
  return GATEWAY_ENDPOINT.post('/auth/admin/reset-password', payload);
 },
 changePassword: (payload: any) => {
  return GATEWAY_ENDPOINT_WITH_AUTH.post('/auth/admin/change-password', payload);
 },
 setup2fa: (payload?: { method?: 'TOTP' | 'EMAIL' }) => {
  return GATEWAY_ENDPOINT_WITH_AUTH.post('/auth/admin/2fa/setup', payload || { method: 'TOTP' });
 },
 confirm2fa: (payload: any) => {
  return GATEWAY_ENDPOINT_WITH_AUTH.post('/auth/admin/2fa/confirm', payload);
 },
 disable2fa: (payload: any) => {
  return GATEWAY_ENDPOINT_WITH_AUTH.post('/auth/admin/2fa/disable', payload);
 },
 loginVerify2fa: (payload: any) => {
  return SESSION_ENDPOINT.post('/verify-2fa', payload);
 },
 getAdminProfile: () => {
  return GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/me');
 },
 getSessions: (params?: any) => {
  return GATEWAY_ENDPOINT_WITH_AUTH.get('/auth/sessions', { params });
 },
 deleteSession: (id: string) => {
  return GATEWAY_ENDPOINT_WITH_AUTH.delete(`/auth/sessions/${id}`);
 },
 logout: () => {
  return SESSION_ENDPOINT.post('/logout');
 },
 logoutAll: () => {
  return GATEWAY_ENDPOINT_WITH_AUTH.post('/auth/logout-all');
 },
 getProfile: () => {
  return GATEWAY_ENDPOINT_WITH_AUTH.get('/auth/profile');
 },
};
