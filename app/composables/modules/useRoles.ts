import { useState } from 'react';
import { roles_api } from '@/app/api_factory/modules/roles';

export const useRoles = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [roles, setRoles] = useState([] as any[]);

  const fetchRoles = async (params?: any) => {
    setLoading(true);
    try {
      const res = await roles_api.getRoles(params);
      setRoles(res.data);
      return res.data;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createRole = async (payload: any) => {
    setLoading(true);
    try {
      const res = await roles_api.createRole(payload);
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (id: string, payload: any) => {
    setLoading(true);
    try {
      const res = await roles_api.updateRole(id, payload);
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteRole = async (id: string) => {
    setLoading(true);
    try {
      const res = await roles_api.deleteRole(id);
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const assignPermission = async (roleId: string, payload: any) => {
    setLoading(true);
    try {
      const res = await roles_api.assignPermissionToRole(roleId, payload);
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removePermission = async (roleId: string, permissionId: string) => {
    setLoading(true);
    try {
      const res = await roles_api.removePermissionFromRole(roleId, permissionId);
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, roles, fetchRoles, createRole, updateRole, deleteRole, assignPermission, removePermission };
};
