import { useState, useCallback, useRef } from 'react';
import { documents_api } from '@/app/api_factory/modules/documents';

export const useDocuments = () => {
 const [loading, setLoading] = useState(false);
 const [meta, setMeta] = useState({ total: 0, page: 1, limit: 25, totalPages: 1 });
 const [error, setError] = useState<string | null>(null);
 const [batches, setBatches] = useState([] as any[]);
 const listRequestSeq = useRef(0);

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
  const seq = ++listRequestSeq.current;
  setLoading(true);
  setError(null);
  try {
   const res = await documents_api.getDocumentBatches(params);
   if (seq !== listRequestSeq.current) return [];
   let dataList = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.result || res.data?.agents || res.data?.clients || res.data?.roles || res.data?.admins || res.data?.logs || res.data?.invites || res.data?.permissions || res.data?.batches || []);
   if (res.data?.meta) setMeta(res.data.meta);
   dataList = Array.isArray(dataList) ? dataList : [];
   setBatches(dataList);
   return dataList;
  } catch (err: any) {
   if (seq === listRequestSeq.current) setError(err.message);
   return [];
  } finally {
   if (seq === listRequestSeq.current) setLoading(false);
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
  loading, error, batches, meta,
  uploadIppisBroadsheet, uploadDisbursedLoans, uploadRepaymentSchedule, 
  fetchDocumentBatches, getDocumentBatchById, getDocumentFile 
 };
};
