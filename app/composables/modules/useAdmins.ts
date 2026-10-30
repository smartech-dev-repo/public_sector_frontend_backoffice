import { useState, useCallback, useRef } from 'react';
import { admins_api } from '@/app/api_factory/modules/admins';

export const useAdmins = () => {
 const [loading, setLoading] = useState(false);
 const [meta, setMeta] = useState({ total: 0, page: 1, limit: 25, totalPages: 1 });
 const [error, setError] = useState<string | null>(null);
 const [admins, setAdmins] = useState([] as any[]);
 const listRequestSeq = useRef(0);

 const fetchAdmins = useCallback(async (params?: any) => {
  const seq = ++listRequestSeq.current;
  setLoading(true);
  setError(null);
  try {
   const res = await admins_api.getAdmins(params);
   // Ignore out-of-order responses (fast typing in the search box).
   if (seq !== listRequestSeq.current) return [];
   let dataList = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.result || res.data?.agents || res.data?.clients || res.data?.roles || res.data?.admins || res.data?.logs || res.data?.invites || res.data?.permissions || res.data?.batches || []);
   if (res.data?.meta) setMeta(res.data.meta);
   dataList = Array.isArray(dataList) ? dataList : [];
   setAdmins(dataList);
   return dataList;
  } catch (err: any) {
   if (seq === listRequestSeq.current) setError(err.message);
   return [];
  } finally {
   if (seq === listRequestSeq.current) setLoading(false);
  }
 }, []);

 const assignRole = useCallback(async (adminId: string, payload: any) => {
  setLoading(true);
  try {
   const res = await admins_api.assignRoleToAdmin(adminId, payload);
   return res.data;
  } catch (err: any) {
   setError(err.message);
   throw err;
  } finally {
   setLoading(false);
  }
 }, []);

 const suspendAdmin = useCallback(async (adminId: string) => {
  setLoading(true);
  try {
   const res = await admins_api.suspendAdmin(adminId);
   return res.data;
  } catch (err: any) {
   setError(err.message);
   throw err;
  } finally {
   setLoading(false);
  }
 }, []);

 const unsuspendAdmin = useCallback(async (adminId: string) => {
  setLoading(true);
  try {
   const res = await admins_api.unsuspendAdmin(adminId);
   return res.data;
  } catch (err: any) {
   setError(err.message);
   throw err;
  } finally {
   setLoading(false);
  }
 }, []);

 return { loading, error, admins, fetchAdmins, assignRole, suspendAdmin, unsuspendAdmin, meta };
};
