import { GATEWAY_ENDPOINT_WITH_AUTH } from '../axios.config';

export const auditLogs_api = {
 getLogs: (params: any) => {
  return GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/audit-logs', { params });
 },
 exportLogs: (params: any) => {
  return GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/audit-logs/export', { params, responseType: 'blob' });
 },
 // Fire and forget: a logging problem must never block what the admin is doing.
 reportDataAccess: (payload: { kind: 'reveal' | 'export'; resource: string; targetType?: string; targetId?: string; recordCount?: number }) => {
  return GATEWAY_ENDPOINT_WITH_AUTH.post('/admin/audit-logs/data-access', payload, { skipToast: true } as any);
 }
};
