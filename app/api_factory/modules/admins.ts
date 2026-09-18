import { GATEWAY_ENDPOINT_WITH_AUTH } from '../axios.config';

export const admins_api = {
  getAdmins: (params?: any) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/admins', { params });
  },
  assignRoleToAdmin: (adminId: string, payload: any) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.post(`/admin/admins/${adminId}/roles`, payload);
  },
  removeRoleFromAdmin: (adminId: string, roleId: string) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.delete(`/admin/admins/${adminId}/roles/${roleId}`);
  },
  deactivateAdmin: (adminId: string) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.post(`/admin/admins/${adminId}/deactivate`);
  },
  reactivateAdmin: (adminId: string) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.post(`/admin/admins/${adminId}/reactivate`);
  }
};
