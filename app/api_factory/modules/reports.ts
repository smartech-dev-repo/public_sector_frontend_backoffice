import { GATEWAY_ENDPOINT_WITH_AUTH } from '../axios.config';

export const reports_api = {
  getReports: (params?: any) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/reports', { params });
  }
};
