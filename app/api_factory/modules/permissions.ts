import { GATEWAY_ENDPOINT_WITH_AUTH } from '../axios.config';

export const permissions_api = {
  createPermission: (payload: any) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.post('/admin/permissions', payload);
  },
  getPermissions: (params?: any) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/permissions', { params });
  },
  getPermissionById: (id: string) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.get(`/admin/permissions/${id}`);
  },
  updatePermission: (id: string, payload: any) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.patch(`/admin/permissions/${id}`, payload);
  },
  deletePermission: (id: string) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.delete(`/admin/permissions/${id}`);
  }
};
