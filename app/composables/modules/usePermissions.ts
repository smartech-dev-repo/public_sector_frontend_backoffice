import { useState, useCallback } from 'react';
import { permissions_api } from '@/app/api_factory/modules/permissions';

export const usePermissions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permissions, setPermissions] = useState([] as any[]);

  const fetchPermissions = useCallback(async (params?: any) => {
    setLoading(true);
    try {
      const res = await permissions_api.getPermissions(params);
      let dataList = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.result || res.data?.agents || res.data?.clients || res.data?.roles || res.data?.admins || res.data?.logs || res.data?.invites || res.data?.permissions || res.data?.batches || []);
      dataList = Array.isArray(dataList) ? dataList : [];
      setPermissions(dataList);
      return dataList;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPermission = useCallback(async (payload: any) => {
    setLoading(true);
    try {
      const res = await permissions_api.createPermission(payload);
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePermission = useCallback(async (id: string, payload: any) => {
    setLoading(true);
    try {
      const res = await permissions_api.updatePermission(id, payload);
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePermission = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await permissions_api.deletePermission(id);
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, permissions, fetchPermissions, createPermission, updatePermission, deletePermission };
};
