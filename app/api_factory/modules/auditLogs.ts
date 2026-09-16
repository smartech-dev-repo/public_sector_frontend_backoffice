import { GATEWAY_ENDPOINT_WITH_AUTH } from '../axios.config';

export const auditLogs_api = {
  getLogs: (params: any) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/audit-logs', { params });
  }
};
