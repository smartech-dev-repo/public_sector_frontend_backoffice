import { GATEWAY_ENDPOINT_WITH_AUTH } from '../axios.config';

/** BASE_PAY_DTI: the DTI share, but never leaving the client less than base pay. */
export type CapacityMethod = 'BASE_PAY' | 'DTI' | 'BASE_PAY_DTI';

/** Send affordabilityMethod: null to clear, so the level below applies. */
export interface RepaymentCapacityPayload {
 affordabilityMethod: CapacityMethod | null;
 basePayAmount?: number | null;
 dtiPercent?: number | null;
}

export const loanEligibility_api = {
 /** The most a client can borrow or top up over a tenor, with the workings. */
 preview: (clientId: string, params: { tenorMonths: number; type?: 'LOAN' | 'TOPUP' }) => {
  return GATEWAY_ENDPOINT_WITH_AUTH.get(`/admin/clients/${clientId}/loan-eligibility`, { params });
 },
 getClientCapacity: (clientId: string) => {
  return GATEWAY_ENDPOINT_WITH_AUTH.get(`/admin/clients/${clientId}/repayment-capacity`);
 },
 updateClientCapacity: (clientId: string, payload: RepaymentCapacityPayload) => {
  return GATEWAY_ENDPOINT_WITH_AUTH.patch(`/admin/clients/${clientId}/repayment-capacity`, payload);
 },
};
