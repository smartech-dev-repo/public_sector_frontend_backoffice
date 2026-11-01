import { useState, useCallback } from 'react';
import { roles_api } from '@/app/api_factory/modules/roles';

// The axios layer resolves failed requests instead of rejecting them, so a caller's
// catch block would never run. Rejecting here keeps a failed save from reading as a success.
const unwrap = (res: any) => {
 if (res?.type === 'ERROR') {
  const message = res.data?.message;
  throw Object.assign(new Error(typeof message === 'string' ? message : 'Request failed'), { status: res.status });
 }
 return res.data;
};

export const useRoles = () => {
 const [loading, setLoading] = useState(false);
 const [meta, setMeta] = useState({ total: 0, page: 1, limit: 25, totalPages: 1 });
 const [error, setError] = useState<string | null>(null);
 const [roles, setRoles] = useState([] as any[]);

 const fetchRoles = useCallback(async (params?: any) => {
  setLoading(true);
  try {
   const res = await roles_api.getRoles(params);
   unwrap(res);
   setError(null);
   let dataList = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.result || res.data?.agents || res.data?.clients || res.data?.roles || res.data?.admins || res.data?.logs || res.data?.invites || res.data?.permissions || res.data?.batches || []);
   if (res.data?.meta) setMeta(res.data.meta);
   dataList = Array.isArray(dataList) ? dataList : [];
   setRoles(dataList);
   return dataList;
  } catch (err: any) {
   setError(err.message);
  } finally {
   setLoading(false);
  }
 }, []);

 const fetchAllRoles = useCallback(async () => {
  setLoading(true);
  try {
   const all: any[] = [];
   let page = 1;
   let totalPages = 1;
   do {
    const body = unwrap(await roles_api.getRoles({ page, limit: 100 }));
    all.push(...(body?.data || []));
    totalPages = body?.meta?.totalPages || 1;
    page += 1;
   } while (page <= totalPages);
   setError(null);
   setRoles(all);
   return all;
  } catch (err: any) {
   setError(err.message);
  } finally {
   setLoading(false);
  }
 }, []);

 const fetchPermissionOptions = useCallback(async () => {
  return (unwrap(await roles_api.getPermissionOptions()) || []) as any[];
 }, []);

 const setRolePermissions = useCallback(async (roleId: string, permissionIds: string[]) => {
  return unwrap(await roles_api.setRolePermissions(roleId, { permissionIds }));
 }, []);

 const createRole = useCallback(async (payload: any) => {
  setLoading(true);
  try {
   return unwrap(await roles_api.createRole(payload));
  } catch (err: any) {
   setError(err.message);
   throw err;
  } finally {
   setLoading(false);
  }
 }, []);

 const updateRole = useCallback(async (id: string, payload: any) => {
  setLoading(true);
  try {
   return unwrap(await roles_api.updateRole(id, payload));
  } catch (err: any) {
   setError(err.message);
   throw err;
  } finally {
   setLoading(false);
  }
 }, []);

 const deleteRole = useCallback(async (id: string) => {
  setLoading(true);
  try {
   return unwrap(await roles_api.deleteRole(id));
  } catch (err: any) {
   setError(err.message);
   throw err;
  } finally {
   setLoading(false);
  }
 }, []);

 const assignPermission = useCallback(async (roleId: string, payload: any) => {
  setLoading(true);
  try {
   return unwrap(await roles_api.assignPermissionToRole(roleId, payload));
  } catch (err: any) {
   setError(err.message);
   throw err;
  } finally {
   setLoading(false);
  }
 }, []);

 const removePermission = useCallback(async (roleId: string, permissionId: string) => {
  setLoading(true);
  try {
   return unwrap(await roles_api.removePermissionFromRole(roleId, permissionId));
  } catch (err: any) {
   setError(err.message);
   throw err;
  } finally {
   setLoading(false);
  }
 }, []);

 const assignBulkPermissions = useCallback(async (roleId: string, payload: { permissionIds: string[] }) => {
  setLoading(true);
  try {
   return unwrap(await roles_api.assignBulkPermissionsToRole(roleId, payload));
  } catch (err: any) {
   setError(err.message);
   throw err;
  } finally {
   setLoading(false);
  }
 }, []);

 return { loading, error, roles, fetchRoles, fetchAllRoles, fetchPermissionOptions, setRolePermissions, createRole, updateRole, deleteRole, assignPermission, removePermission, assignBulkPermissions, meta };
};
