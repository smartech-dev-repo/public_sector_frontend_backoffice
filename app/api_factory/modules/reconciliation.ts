import { GATEWAY_ENDPOINT_WITH_AUTH as $api } from '../axios.config';

export const reconciliation_api = {
  getReconciliation: (params?: any) => $api.get('/admin/reconciliation', { params })
};
