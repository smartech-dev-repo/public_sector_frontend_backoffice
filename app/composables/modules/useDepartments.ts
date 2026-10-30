import { useState, useCallback, useRef } from 'react';
import { departments_api } from '@/app/api_factory/modules/departments';

export const useDepartments = () => {
 const [loading, setLoading] = useState(false);
 const [meta, setMeta] = useState({ total: 0, page: 1, limit: 25, totalPages: 1 });
 const [error, setError] = useState<string | null>(null);
 const [departments, setDepartments] = useState([] as any[]);
 const listRequestSeq = useRef(0);

 const fetchDepartments = useCallback(async (params?: any) => {
  const seq = ++listRequestSeq.current;
  setLoading(true);
  setError(null);
  try {
   const res = await departments_api.getDepartments(params);
   if (seq !== listRequestSeq.current) return [];
   let dataList = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.result || res.data?.departments || []);
   if (res.data?.meta) setMeta(res.data.meta);
   dataList = Array.isArray(dataList) ? dataList : [];
   setDepartments(dataList);
   return dataList;
  } catch (err: any) {
   if (seq === listRequestSeq.current) setError(err.message);
   return [];
  } finally {
   if (seq === listRequestSeq.current) setLoading(false);
  }
 }, []);

 const createDepartment = useCallback(async (payload: any) => {
  setLoading(true);
  try {
   const res = await departments_api.createDepartment(payload);
   return res.data;
  } catch (err: any) {
   setError(err.message);
   throw err;
  } finally {
   setLoading(false);
  }
 }, []);

 const updateDepartment = useCallback(async (id: string, payload: any) => {
  setLoading(true);
  try {
   const res = await departments_api.updateDepartment(id, payload);
   return res.data;
  } catch (err: any) {
   setError(err.message);
   throw err;
  } finally {
   setLoading(false);
  }
 }, []);

 const deleteDepartment = useCallback(async (id: string) => {
  setLoading(true);
  try {
   const res = await departments_api.deleteDepartment(id);
   return res.data;
  } catch (err: any) {
   setError(err.message);
   throw err;
  } finally {
   setLoading(false);
  }
 }, []);

 return { loading, error, departments, fetchDepartments, createDepartment, updateDepartment, deleteDepartment, meta };
};
