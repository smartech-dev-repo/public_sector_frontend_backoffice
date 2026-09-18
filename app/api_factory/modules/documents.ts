import { GATEWAY_ENDPOINT_WITH_AUTH } from '../axios.config';

export const documents_api = {
  uploadIppisBroadsheet: (payload: any) => {
    // Assuming multipart/form-data
    return GATEWAY_ENDPOINT_WITH_AUTH.post('/admin/documents/ippis-broadsheet/upload', payload, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  uploadDisbursedLoans: (payload: any) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.post('/admin/documents/disbursed-loans/upload', payload, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  uploadRepaymentSchedule: (payload: any) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.post('/admin/documents/repayment-schedule/upload', payload, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getDocumentBatches: (params?: any) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/documents/batches', { params });
  },
  getDocumentBatchById: (id: string) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.get(`/admin/documents/batches/${id}`);
  },
  getDocumentFile: (fileKey: string) => {
    // Return the response as blob/arraybuffer if needed, but for now we just use standard GET
    return GATEWAY_ENDPOINT_WITH_AUTH.get(`/admin/documents/files/${encodeURIComponent(fileKey)}`, {
      responseType: 'blob'
    });
  }
};
