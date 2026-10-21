import { GATEWAY_ENDPOINT_WITH_AUTH } from '../axios.config';

export const loans_api = {
  getLoanProducts: (params?: any) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/loan-products', { params });
  },
  createLoanProduct: (payload: any) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.post('/admin/loan-products', payload);
  },
  updateLoanProduct: (id: string, payload: any) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.patch(`/admin/loan-products/${id}`, payload);
  },
  getLoanProductSectors: () => {
    return GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/loan-products/sectors');
  },
  getLoanSettings: () => {
    return GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/loan-settings');
  },
  updateLoanSettings: (payload: any) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.patch('/admin/loan-settings', payload);
  },
  getLoans: (params?: any) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/loans', { params });
  },
  getLoanTerms: (params?: any) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/loan-terms', { params });
  },
  createLoanTerm: (payload: any) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.post('/admin/loan-terms', payload);
  },
  updateLoanTerm: (id: string, payload: any) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.patch(`/admin/loan-terms/${id}`, payload);
  },
  getLoanRequests: (params?: any) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/loan-requests', { params });
  },
  approveLoanRequest: (id: string) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.post(`/admin/loan-requests/${id}/approve`);
  },
  rejectLoanRequest: (id: string, payload: any) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.post(`/admin/loan-requests/${id}/reject`, payload);
  },
  disburseLoanRequest: (id: string) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.post(`/admin/loan-requests/${id}/disburse`);
  },
  getDisbursementSummary: (params?: any) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/client-loans/disbursement-summary', { params });
  },
  getClientLoans: (params?: any) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/client-loans', { params });
  },
  getClientLoanRepaymentPlan: (id: string) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.get(`/admin/client-loans/${id}/repayment-plan`);
  }
};
