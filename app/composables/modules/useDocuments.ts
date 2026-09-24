import { useState, useCallback } from 'react';
import { documents_api } from '@/app/api_factory/modules/documents';

export const useDocuments = () => {
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 25, totalPages: 1 });
  const [error, setError] = useState(null);
  const [batches, setBatches] = useState([] as any[]);

  const uploadIppisBroadsheet = useCallback(async (payload: FormData) => {
    setLoading(true);
    try {
      const res = await documents_api.uploadIppisBroadsheet(payload);
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadDisbursedLoans = useCallback(async (payload: FormData) => {
    setLoading(true);
    try {
      const res = await documents_api.uploadDisbursedLoans(payload);
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadRepaymentSchedule = useCallback(async (payload: FormData) => {
    setLoading(true);
    try {
      const res = await documents_api.uploadRepaymentSchedule(payload);
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDocumentBatches = useCallback(async (params?: any) => {
    setLoading(true);
    try {
      const res = await documents_api.getDocumentBatches(params);
      let dataList = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.result || res.data?.agents || res.data?.clients || res.data?.roles || res.data?.admins || res.data?.logs || res.data?.invites || res.data?.permissions || res.data?.batches || []);
      if (res.data?.meta) setMeta(res.data.meta);
      dataList = Array.isArray(dataList) ? dataList : [];
      setBatches(dataList);
      return dataList;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const getDocumentBatchById = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await documents_api.getDocumentBatchById(id);
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getDocumentFile = useCallback(async (fileKey: string) => {
    setLoading(true);
    try {
      const res = await documents_api.getDocumentFile(fileKey);
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { 
    loading, error, batches, 
    uploadIppisBroadsheet, uploadDisbursedLoans, uploadRepaymentSchedule, 
    fetchDocumentBatches, getDocumentBatchById, getDocumentFile 
  };
};
