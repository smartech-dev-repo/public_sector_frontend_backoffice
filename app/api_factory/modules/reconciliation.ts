import { GATEWAY_ENDPOINT_WITH_AUTH as $api } from '../axios.config';

export const reconciliation_api = {
 getReconciliation: (params?: any) => $api.get('/admin/reconciliation', { params }),
 /** Payroll deductions; by default those matching no running loan and not yet dealt with. */
 getDeductions: (params?: any) => $api.get('/admin/reconciliation/deductions', { params }),
 getDeductionCandidates: (id: string) => $api.get(`/admin/reconciliation/deductions/${id}/candidates`),
 assignDeduction: (id: string, body: { clientLoanId?: string; loanId?: string; period?: string; note?: string }) =>
  $api.post(`/admin/reconciliation/deductions/${id}/assign`, body),
 /** Sent for approvals:wallets; paid to the client's wallet once approved. */
 refundDeduction: (id: string, body: { note?: string }) => $api.post(`/admin/reconciliation/deductions/${id}/refund`, body),
 dismissDeduction: (id: string, body: { note: string }) => $api.post(`/admin/reconciliation/deductions/${id}/dismiss`, body),
};
