import { useState } from 'react';
import { permissions_api } from '@/app/api_factory/modules/permissions';

export const usePermissions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permissions, setPermissions] = useState([] as any[]);

  const fetchPermissions = async (params?: any) => {
    setLoading(true);
    try {
      const res = await permissions_api.getPermissions(params);
      setPermissions(res.data);
      return res.data;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createPermission = async (payload: any) => {
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
  };

  const updatePermission = async (id: string, payload: any) => {
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
  };

  const deletePermission = async (id: string) => {
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
  };

  return { loading, error, permissions, fetchPermissions, createPermission, updatePermission, deletePermission };
};
