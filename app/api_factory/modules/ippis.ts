import { GATEWAY_ENDPOINT_WITH_AUTH } from '../axios.config';

export const ippis_api = {
  uploadBroadsheet: (formData: FormData) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.post('/admin/documents/ippis-broadsheet/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  uploadDisbursedLoans: (formData: FormData) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.post('/admin/documents/disbursed-loans/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  uploadRepaymentSchedule: (formData: FormData) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.post('/admin/documents/repayment-schedule/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getDocumentBatches: (params?: any) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/documents/batches', { params });
  },
  getDocumentBatchById: (id: string) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.get(`/admin/documents/batches/${id}`);
  },
  downloadDocumentFile: (key: string) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.get(`/admin/documents/files/${encodeURIComponent(key)}`, {
      responseType: 'blob'
    });
  }
};
