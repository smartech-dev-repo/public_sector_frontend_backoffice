import { useState } from 'react';
import { admins_api } from '@/app/api_factory/modules/admins';

export const useAdmins = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [admins, setAdmins] = useState([] as any[]);

  const fetchAdmins = async (params?: any) => {
    setLoading(true);
    try {
      const res = await admins_api.getAdmins(params);
      setAdmins(res.data);
      return res.data;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const assignRole = async (adminId: string, payload: any) => {
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
  };

  const removeRole = async (adminId: string, roleId: string) => {
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
  };

  const deactivateAdmin = async (adminId: string) => {
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
  };

  const reactivateAdmin = async (adminId: string) => {
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
  };

  return { loading, error, admins, fetchAdmins, assignRole, removeRole, deactivateAdmin, reactivateAdmin };
};
