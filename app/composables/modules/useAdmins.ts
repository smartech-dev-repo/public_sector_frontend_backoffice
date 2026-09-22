import { useState, useCallback } from 'react';
import { admins_api } from '@/app/api_factory/modules/admins';

export const useAdmins = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [admins, setAdmins] = useState([] as any[]);

  const fetchAdmins = useCallback(async (params?: any) => {
    setLoading(true);
    try {
      const res = await admins_api.getAdmins(params);
      let dataList = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.result || res.data?.agents || res.data?.clients || res.data?.roles || res.data?.admins || res.data?.logs || res.data?.invites || res.data?.permissions || res.data?.batches || []);
      dataList = Array.isArray(dataList) ? dataList : [];
      setAdmins(dataList);
      return dataList;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
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

  const removeRole = useCallback(async (adminId: string, roleId: string) => {
    setLoading(true);
    try {
      const res = await admins_api.removeRoleFromAdmin(adminId, roleId);
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deactivateAdmin = useCallback(async (adminId: string) => {
    setLoading(true);
    try {
      const res = await admins_api.deactivateAdmin(adminId);
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reactivateAdmin = useCallback(async (adminId: string) => {
    setLoading(true);
    try {
      const res = await admins_api.reactivateAdmin(adminId);
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, admins, fetchAdmins, assignRole, removeRole, deactivateAdmin, reactivateAdmin };
};
