import { useState, useCallback } from 'react';
import { ippis_api } from '@/app/api_factory/modules/ippis';

export const useIppis = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [batches, setBatches] = useState([] as any[]);

  const fetchBatches = useCallback(async (params?: any) => {
    setLoading(true);
    try {
      const res = await ippis_api.getDocumentBatches(params);
      let dataList = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.result || res.data?.agents || res.data?.clients || res.data?.roles || res.data?.admins || res.data?.logs || res.data?.invites || res.data?.permissions || res.data?.batches || []);
      dataList = Array.isArray(dataList) ? dataList : [];
      setBatches(dataList);
      return dataList;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadBroadsheet = useCallback(async (formData: FormData) => {
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
  }, []);
  
  const uploadDisbursedLoans = useCallback(async (formData: FormData) => {
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
  }, []);
  
  const uploadRepaymentSchedule = useCallback(async (formData: FormData) => {
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
  }, []);

  const downloadFile = useCallback(async (key: string) => {
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
  }, []);

  return { loading, error, batches, fetchBatches, uploadBroadsheet, uploadDisbursedLoans, uploadRepaymentSchedule, downloadFile };
};
