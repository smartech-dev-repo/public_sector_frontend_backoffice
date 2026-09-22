import { GATEWAY_ENDPOINT_WITH_AUTH } from '../axios.config';

const mockLoanTerms = [
  {
    "id": "1",
    "agency": "NPF",
    "tenor": 12,
    "interestRate": 5.5,
    "status": "ACTIVE"
  },
  {
    "id": "2",
    "agency": "FEDERAL_MINISTRY",
    "tenor": 24,
    "interestRate": 6.5,
    "status": "ACTIVE"
  }
];

export const loans_api = {
  getLoans: (params?: any) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/loans', { params });
  },
  getLoanTerms: async (params?: any) => {
    const res = await GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/loan-terms', { params });
    if ((res as any).type === 'ERROR' && res.status === 404) return { data: mockLoanTerms };
    return res;
  },
  createLoanTerm: (payload: any) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.post('/admin/loan-terms', payload);
  },
  updateLoanTerm: (id: string, payload: any) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.patch(`/admin/loan-terms/${id}`, payload);
  },
  getLoanRequests: async (params?: any) => {
    const res = await GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/loan-requests', { params });
    if ((res as any).type === 'ERROR' && res.status === 404) return { data: [] };
    return res;
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
  getDisbursementSummary: async (params?: any) => {
    const res = await GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/client-loans/disbursement-summary', { params });
    if ((res as any).type === 'ERROR' && res.status === 404) return { data: { totalDisbursed: 0, count: 0 } };
    return res;
  }
};
