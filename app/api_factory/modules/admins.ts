import { GATEWAY_ENDPOINT_WITH_AUTH } from '../axios.config';

export const admins_api = {
  getAdmins: (params?: any) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/admins', { params });
  },
  assignRoleToAdmin: (adminId: string, payload: { roleId: string }) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.patch(`/admin/admins/${adminId}/role`, payload);
  },
  suspendAdmin: (adminId: string) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.post(`/admin/admins/${adminId}/suspend`);
  },
  unsuspendAdmin: (adminId: string) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.post(`/admin/admins/${adminId}/unsuspend`);
  }
};
