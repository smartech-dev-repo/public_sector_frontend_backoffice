import { GATEWAY_ENDPOINT_WITH_AUTH } from '../axios.config';

export type DocumentSlug = 'ippis-broadsheet' | 'repayment-schedule' | 'disbursed-loans';

// Large workbooks outlast the 15 second default, and a progress bar is the
// feedback for a slow upload anyway.
const UPLOAD_TIMEOUT_MS = 10 * 60 * 1000;

export const documents_api = {
 getTemplate: (slug: DocumentSlug) => {
  return GATEWAY_ENDPOINT_WITH_AUTH.get(`/admin/documents/templates/${slug}`);
 },
 downloadTemplate: (slug: DocumentSlug) => {
  return GATEWAY_ENDPOINT_WITH_AUTH.get(`/admin/documents/templates/${slug}/download`, { responseType: 'blob' });
 },
 validateUpload: (slug: DocumentSlug, payload: FormData, onProgress: (percent: number) => void) => {
  return GATEWAY_ENDPOINT_WITH_AUTH.post(`/admin/documents/${slug}/validate`, payload, {
   headers: { 'Content-Type': 'multipart/form-data' },
   timeout: UPLOAD_TIMEOUT_MS,
   skipToast: true,
   onUploadProgress: (event: { loaded: number; total?: number }) => onProgress(event.total ? Math.round((event.loaded / event.total) * 100) : 0),
  } as any);
 },
 confirmUpload: (slug: DocumentSlug, id: string) => {
  return GATEWAY_ENDPOINT_WITH_AUTH.post(`/admin/documents/${slug}/batches/${id}/confirm`, undefined, { skipToast: true } as any);
 },
 cancelUpload: (slug: DocumentSlug, id: string) => {
  return GATEWAY_ENDPOINT_WITH_AUTH.post(`/admin/documents/${slug}/batches/${id}/cancel`, undefined, { skipToast: true } as any);
 },
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
