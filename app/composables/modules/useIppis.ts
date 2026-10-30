import { useState, useCallback, useRef } from 'react';
import { ippis_api } from '@/app/api_factory/modules/ippis';

export const useIppis = () => {
 const [loading, setLoading] = useState(false);
 const [meta, setMeta] = useState({ total: 0, page: 1, limit: 25, totalPages: 1 });
 const [error, setError] = useState<string | null>(null);
 const [batches, setBatches] = useState([] as any[]);
 const [ippisRecords, setIppisRecords] = useState([] as any[]);
 const recordsRequestSeq = useRef(0);
 const batchesRequestSeq = useRef(0);

 const fetchIppisRecords = useCallback(async (params?: any) => {
  const seq = ++recordsRequestSeq.current;
  setLoading(true);
  setError(null);
  try {
   const res = await ippis_api.getIppisRecords(params);
   if (seq !== recordsRequestSeq.current) return [];
   let dataList = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.result || []);
   if (res.data?.meta) setMeta(res.data.meta);
   dataList = Array.isArray(dataList) ? dataList : [];
   setIppisRecords(dataList);
   return dataList;
  } catch (err: any) {
   if (seq === recordsRequestSeq.current) setError(err.message);
   return [];
  } finally {
   if (seq === recordsRequestSeq.current) setLoading(false);
  }
 }, []);

 const fetchBatches = useCallback(async (params?: any) => {
  const seq = ++batchesRequestSeq.current;
  setLoading(true);
  setError(null);
  try {
   const res = await ippis_api.getDocumentBatches(params);
   if (seq !== batchesRequestSeq.current) return [];
   let dataList = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.result || res.data?.agents || res.data?.clients || res.data?.roles || res.data?.admins || res.data?.logs || res.data?.invites || res.data?.permissions || res.data?.batches || []);
   if (res.data?.meta) setMeta(res.data.meta);
   dataList = Array.isArray(dataList) ? dataList : [];
   setBatches(dataList);
   return dataList;
  } catch (err: any) {
   if (seq === batchesRequestSeq.current) setError(err.message);
   return [];
  } finally {
   if (seq === batchesRequestSeq.current) setLoading(false);
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

 return { loading, error, batches, ippisRecords, fetchIppisRecords, fetchBatches, uploadBroadsheet, uploadDisbursedLoans, uploadRepaymentSchedule, downloadFile, meta };
};
