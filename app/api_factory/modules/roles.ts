import { GATEWAY_ENDPOINT_WITH_AUTH } from '../axios.config';

export const roles_api = {
  createRole: (payload: any) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.post('/admin/roles', payload);
  },
  getRoles: (params?: any) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/roles', { params });
  },
  getRoleById: (id: string) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.get(`/admin/roles/${id}`);
  },
  updateRole: (id: string, payload: any) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.patch(`/admin/roles/${id}`, payload);
  },
  deleteRole: (id: string) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.delete(`/admin/roles/${id}`);
  },
  assignPermissionToRole: (roleId: string, payload: any) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.post(`/admin/roles/${roleId}/permissions`, payload);
  },
  removePermissionFromRole: (roleId: string, permissionId: string) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.delete(`/admin/roles/${roleId}/permissions/${permissionId}`);
  }
};
