import { useState, useCallback } from 'react';
import { departments_api } from '@/app/api_factory/modules/departments';

export const useDepartments = () => {
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 25, totalPages: 1 });
  const [error, setError] = useState(null);
  const [departments, setDepartments] = useState([] as any[]);

  const fetchDepartments = useCallback(async (params?: any) => {
    setLoading(true);
    try {
      const res = await departments_api.getDepartments(params);
      let dataList = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.result || res.data?.departments || []);
      if (res.data?.meta) setMeta(res.data.meta);
      dataList = Array.isArray(dataList) ? dataList : [];
      setDepartments(dataList);
      return dataList;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
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
