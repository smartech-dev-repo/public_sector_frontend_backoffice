import { useState, useCallback, useRef } from 'react';
import { roles_api } from '@/app/api_factory/modules/roles';

export const useRoles = () => {
 const [loading, setLoading] = useState(false);
 const [meta, setMeta] = useState({ total: 0, page: 1, limit: 25, totalPages: 1 });
 const [error, setError] = useState<string | null>(null);
 const [roles, setRoles] = useState([] as any[]);
 const listRequestSeq = useRef(0);

 const fetchRoles = useCallback(async (params?: any) => {
  const seq = ++listRequestSeq.current;
  setLoading(true);
  setError(null);
  try {
   const res = await roles_api.getRoles(params);
   if (seq !== listRequestSeq.current) return [];
   let dataList = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.result || res.data?.agents || res.data?.clients || res.data?.roles || res.data?.admins || res.data?.logs || res.data?.invites || res.data?.permissions || res.data?.batches || []);
   if (res.data?.meta) setMeta(res.data.meta);
   dataList = Array.isArray(dataList) ? dataList : [];
   setRoles(dataList);
   return dataList;
  } catch (err: any) {
   if (seq === listRequestSeq.current) setError(err.message);
   return [];
  } finally {
   if (seq === listRequestSeq.current) setLoading(false);
  }
 }, []);

 const createRole = useCallback(async (payload: any) => {
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
 }, []);

 const updateRole = useCallback(async (id: string, payload: any) => {
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
 }, []);

 const deleteRole = useCallback(async (id: string) => {
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
 }, []);

 const assignPermission = useCallback(async (roleId: string, payload: any) => {
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
 }, []);

 const removePermission = useCallback(async (roleId: string, permissionId: string) => {
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
 }, []);

 const assignBulkPermissions = useCallback(async (roleId: string, payload: { permissionIds: string[] }) => {
  setLoading(true);
  try {
   const res = await roles_api.assignBulkPermissionsToRole(roleId, payload);
   return res.data;
  } catch (err: any) {
   setError(err.message);
   throw err;
  } finally {
   setLoading(false);
  }
 }, []);

 return { loading, error, roles, fetchRoles, createRole, updateRole, deleteRole, assignPermission, removePermission, assignBulkPermissions, meta };
};
