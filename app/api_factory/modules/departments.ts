import { GATEWAY_ENDPOINT_WITH_AUTH } from '../axios.config';

export const departments_api = {
  getDepartments: (params?: any) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/departments', { params });
  },
  getDepartmentById: (id: string) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.get(`/admin/departments/${id}`);
  },
  createDepartment: (payload: any) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.post('/admin/departments', payload);
  },
  updateDepartment: (id: string, payload: any) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.patch(`/admin/departments/${id}`, payload);
  },
  deleteDepartment: (id: string) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.delete(`/admin/departments/${id}`);
  },
};
