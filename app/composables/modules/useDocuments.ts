import { useState } from '#app';
import { documents_api } from '@/api_factory/modules/documents';

export const useDocuments = () => {
  const loading = useState('documents-loading', () => false);
  const error = useState('documents-error', () => null);
  const batches = useState('documents-batches', () => [] as any[]);

  const uploadIppisBroadsheet = async (payload: FormData) => {
    loading.value = true;
    try {
      const res = await documents_api.uploadIppisBroadsheet(payload);
      return res.data;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const uploadDisbursedLoans = async (payload: FormData) => {
    loading.value = true;
    try {
      const res = await documents_api.uploadDisbursedLoans(payload);
      return res.data;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const uploadRepaymentSchedule = async (payload: FormData) => {
    loading.value = true;
    try {
      const res = await documents_api.uploadRepaymentSchedule(payload);
      return res.data;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchDocumentBatches = async (params?: any) => {
    loading.value = true;
    try {
      const res = await documents_api.getDocumentBatches(params);
      batches.value = res.data;
      return res.data;
    } catch (err: any) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  const getDocumentBatchById = async (id: string) => {
    loading.value = true;
    try {
      const res = await documents_api.getDocumentBatchById(id);
      return res.data;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getDocumentFile = async (fileKey: string) => {
    loading.value = true;
    try {
      const res = await documents_api.getDocumentFile(fileKey);
      return res.data;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return { 
    loading, error, batches, 
    uploadIppisBroadsheet, uploadDisbursedLoans, uploadRepaymentSchedule, 
    fetchDocumentBatches, getDocumentBatchById, getDocumentFile 
  };
};
