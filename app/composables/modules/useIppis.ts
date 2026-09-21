import { useState } from 'react';
import { ippis_api } from '@/app/api_factory/modules/ippis';

export const useIppis = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [batches, setBatches] = useState([] as any[]);

  const fetchBatches = async (params?: any) => {
    setLoading(true);
    try {
      const res = await ippis_api.getDocumentBatches(params);
      setBatches(res.data);
      return res.data;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const uploadBroadsheet = async (formData: FormData) => {
    setLoading(true);
    try {
      const res = await ippis_api.uploadBroadsheet(formData);
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const uploadDisbursedLoans = async (formData: FormData) => {
    setLoading(true);
    try {
      const res = await ippis_api.uploadDisbursedLoans(formData);
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const uploadRepaymentSchedule = async (formData: FormData) => {
    setLoading(true);
    try {
      const res = await ippis_api.uploadRepaymentSchedule(formData);
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async (key: string) => {
    setLoading(true);
    try {
      const res = await ippis_api.downloadDocumentFile(key);
      return res.data; // Blob
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, batches, fetchBatches, uploadBroadsheet, uploadDisbursedLoans, uploadRepaymentSchedule, downloadFile };
};
