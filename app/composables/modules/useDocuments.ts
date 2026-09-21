import { useState } from 'react';
import { documents_api } from '@/app/api_factory/modules/documents';

export const useDocuments = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [batches, setBatches] = useState([] as any[]);

  const uploadIppisBroadsheet = async (payload: FormData) => {
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
  };

  const uploadDisbursedLoans = async (payload: FormData) => {
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
  };

  const uploadRepaymentSchedule = async (payload: FormData) => {
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
  };

  const fetchDocumentBatches = async (params?: any) => {
    setLoading(true);
    try {
      const res = await documents_api.getDocumentBatches(params);
      setBatches(res.data);
      return res.data;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getDocumentBatchById = async (id: string) => {
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
  };

  const getDocumentFile = async (fileKey: string) => {
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
  };

  return { 
    loading, error, batches, 
    uploadIppisBroadsheet, uploadDisbursedLoans, uploadRepaymentSchedule, 
    fetchDocumentBatches, getDocumentBatchById, getDocumentFile 
  };
};
