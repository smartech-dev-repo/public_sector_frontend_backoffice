import { GATEWAY_ENDPOINT_WITH_AUTH } from '../axios.config';

export type WalletDirection = 'CREDIT' | 'DEBIT';
export type WalletSource = 'MANUAL' | 'LOAN_OVERPAYMENT' | 'DEDUCTION_REFUND' | 'LOAN_REPAYMENT';

export const wallets_api = {
  /** Wallets across clients with their balance, plus a summary of money held and moved. */
  getWallets: (params?: Record<string, unknown>) => GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/wallets', { params }),
  /** Every movement across wallets, with the client and totals for the filter. */
  getWalletEntries: (params?: Record<string, unknown>) => GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/wallets/entries', { params }),
  getClientWallet: (clientId: string, params?: Record<string, unknown>) =>
    GATEWAY_ENDPOINT_WITH_AUTH.get(`/admin/clients/${clientId}/wallet`, { params }),
  /** Sent for approval; the response carries pendingApproval and opens the approver picker. */
  move: (clientId: string, direction: WalletDirection, payload: { amount: number; description: string }) =>
    GATEWAY_ENDPOINT_WITH_AUTH.post(`/admin/clients/${clientId}/wallet/${direction === 'CREDIT' ? 'credit' : 'debit'}`, payload),
};
