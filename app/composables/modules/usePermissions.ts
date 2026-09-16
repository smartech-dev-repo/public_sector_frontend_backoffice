import { useState } from '#app';
import { permissions_api } from '@/api_factory/modules/permissions';

export const usePermissions = () => {
  const loading = useState('permissions-loading', () => false);
  const error = useState('permissions-error', () => null);
  const permissions = useState('permissions-data', () => [] as any[]);

  const fetchPermissions = async (params?: any) => {
    loading.value = true;
    try {
      const res = await permissions_api.getPermissions(params);
      permissions.value = res.data;
      return res.data;
    } catch (err: any) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  const createPermission = async (payload: any) => {
    loading.value = true;
    try {
      const res = await permissions_api.createPermission(payload);
      return res.data;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updatePermission = async (id: string, payload: any) => {
    loading.value = true;
    try {
      const res = await permissions_api.updatePermission(id, payload);
      return res.data;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deletePermission = async (id: string) => {
    loading.value = true;
    try {
      const res = await permissions_api.deletePermission(id);
      return res.data;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return { loading, error, permissions, fetchPermissions, createPermission, updatePermission, deletePermission };
};
