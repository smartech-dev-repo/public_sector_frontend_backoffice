import { useState } from '#app';
import { ippis_api } from '@/api_factory/modules/ippis';

export const useIppis = () => {
  const loading = useState('ippis-loading', () => false);
  const error = useState('ippis-error', () => null);
  const batches = useState('ippis-batches', () => [] as any[]);

  const fetchBatches = async (params?: any) => {
    loading.value = true;
    try {
      const res = await ippis_api.getDocumentBatches(params);
      batches.value = res.data;
      return res.data;
    } catch (err: any) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  const uploadBroadsheet = async (formData: FormData) => {
    loading.value = true;
    try {
      const res = await ippis_api.uploadBroadsheet(formData);
      return res.data;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  const uploadDisbursedLoans = async (formData: FormData) => {
    loading.value = true;
    try {
      const res = await ippis_api.uploadDisbursedLoans(formData);
      return res.data;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  const uploadRepaymentSchedule = async (formData: FormData) => {
    loading.value = true;
    try {
      const res = await ippis_api.uploadRepaymentSchedule(formData);
      return res.data;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const downloadFile = async (key: string) => {
    loading.value = true;
    try {
      const res = await ippis_api.downloadDocumentFile(key);
      return res.data; // Blob
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return { loading, error, batches, fetchBatches, uploadBroadsheet, uploadDisbursedLoans, uploadRepaymentSchedule, downloadFile };
};
