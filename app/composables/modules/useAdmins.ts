import { useState } from '#app';
import { admins_api } from '@/api_factory/modules/admins';

export const useAdmins = () => {
  const loading = useState('admins-loading', () => false);
  const error = useState('admins-error', () => null);
  const admins = useState('admins-data', () => [] as any[]);

  const fetchAdmins = async (params?: any) => {
    loading.value = true;
    try {
      const res = await admins_api.getAdmins(params);
      admins.value = res.data;
      return res.data;
    } catch (err: any) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  const assignRole = async (adminId: string, payload: any) => {
    loading.value = true;
    try {
      const res = await admins_api.assignRoleToAdmin(adminId, payload);
      return res.data;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const removeRole = async (adminId: string, roleId: string) => {
    loading.value = true;
    try {
      const res = await admins_api.removeRoleFromAdmin(adminId, roleId);
      return res.data;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deactivateAdmin = async (adminId: string) => {
    loading.value = true;
    try {
      const res = await admins_api.deactivateAdmin(adminId);
      return res.data;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const reactivateAdmin = async (adminId: string) => {
    loading.value = true;
    try {
      const res = await admins_api.reactivateAdmin(adminId);
      return res.data;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return { loading, error, admins, fetchAdmins, assignRole, removeRole, deactivateAdmin, reactivateAdmin };
};
