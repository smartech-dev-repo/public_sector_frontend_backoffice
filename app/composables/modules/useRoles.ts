import { useState } from '#app';
import { roles_api } from '@/api_factory/modules/roles';

export const useRoles = () => {
  const loading = useState('roles-loading', () => false);
  const error = useState('roles-error', () => null);
  const roles = useState('roles-data', () => [] as any[]);

  const fetchRoles = async (params?: any) => {
    loading.value = true;
    try {
      const res = await roles_api.getRoles(params);
      roles.value = res.data;
      return res.data;
    } catch (err: any) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  const createRole = async (payload: any) => {
    loading.value = true;
    try {
      const res = await roles_api.createRole(payload);
      return res.data;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateRole = async (id: string, payload: any) => {
    loading.value = true;
    try {
      const res = await roles_api.updateRole(id, payload);
      return res.data;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteRole = async (id: string) => {
    loading.value = true;
    try {
      const res = await roles_api.deleteRole(id);
      return res.data;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const assignPermission = async (roleId: string, payload: any) => {
    loading.value = true;
    try {
      const res = await roles_api.assignPermissionToRole(roleId, payload);
      return res.data;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const removePermission = async (roleId: string, permissionId: string) => {
    loading.value = true;
    try {
      const res = await roles_api.removePermissionFromRole(roleId, permissionId);
      return res.data;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return { loading, error, roles, fetchRoles, createRole, updateRole, deleteRole, assignPermission, removePermission };
};
