import { useState, useCallback, useRef } from 'react';
import { invites_api } from '@/app/api_factory/modules/invites';

export const useInvites = () => {
 const [loading, setLoading] = useState(false);
 const [meta, setMeta] = useState({ total: 0, page: 1, limit: 25, totalPages: 1 });
 const [error, setError] = useState<string | null>(null);
 const [invites, setInvites] = useState([] as any[]);
 const listRequestSeq = useRef(0);

 const fetchInvites = useCallback(async (params?: any) => {
  const seq = ++listRequestSeq.current;
  setLoading(true);
  setError(null);
  try {
   const res = await invites_api.getInvites(params);
   if (seq !== listRequestSeq.current) return [];
   let dataList = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.result || res.data?.agents || res.data?.clients || res.data?.roles || res.data?.admins || res.data?.logs || res.data?.invites || res.data?.permissions || res.data?.batches || []);
   if (res.data?.meta) setMeta(res.data.meta);
   dataList = Array.isArray(dataList) ? dataList : [];
   setInvites(dataList);
   return dataList;
  } catch (err: any) {
   if (seq === listRequestSeq.current) setError(err.message);
   return [];
  } finally {
   if (seq === listRequestSeq.current) setLoading(false);
  }
 }, []);

 const createInvite = useCallback(async (payload: any) => {
  setLoading(true);
  try {
   const res = await invites_api.createInvite(payload);
   return res.data;
  } catch (err: any) {
   setError(err.message);
   throw err;
  } finally {
   setLoading(false);
  }
 }, []);

 const resendInvite = useCallback(async (id: string) => {
  setLoading(true);
  try {
   const res = await invites_api.resendInvite(id);
   return res.data;
  } catch (err: any) {
   setError(err.message);
   throw err;
  } finally {
   setLoading(false);
  }
 }, []);

 const deleteInvite = useCallback(async (id: string) => {
  setLoading(true);
  try {
   const res = await invites_api.deleteInvite(id);
   return res.data;
  } catch (err: any) {
   setError(err.message);
   throw err;
  } finally {
   setLoading(false);
  }
 }, []);

 const revokeInvite = useCallback(async (id: string) => {
  setLoading(true);
  try {
   const res = await invites_api.revokeInvite(id);
   return res.data;
  } catch (err: any) {
   setError(err.message);
   throw err;
  } finally {
   setLoading(false);
  }
 }, []);

 return { loading, error, invites, fetchInvites, createInvite, resendInvite, deleteInvite, revokeInvite, meta };
};
