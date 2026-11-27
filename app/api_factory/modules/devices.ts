import { GATEWAY_ENDPOINT_WITH_AUTH, GATEWAY_ENDPOINT_WITH_AUTH_FORM_DATA } from '../axios.config';

export type PrincipalType = 'AGENT' | 'CLIENT';

/** Reason is required; proof is an optional JPEG, PNG or PDF. */
const releaseForm = (reason: string, proof?: File | null) => {
 const form = new FormData();
 form.append('reason', reason);
 if (proof) form.append('proof', proof);
 return form;
};

export const devices_api = {
 list: (params: { principalType?: PrincipalType; principalId?: string; status?: 'ACTIVE' | 'RELEASED'; q?: string; page?: number; limit?: number }) =>
  GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/devices', { params }),
 releaseRequests: (params: { status?: string; page?: number; limit?: number }) =>
  GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/device-release-requests', { params }),
 release: (deviceId: string, reason: string, proof?: File | null) =>
  GATEWAY_ENDPOINT_WITH_AUTH_FORM_DATA.post(`/admin/devices/${deviceId}/release`, releaseForm(reason, proof)),
 approveRequest: (requestId: string, reason: string, proof?: File | null) =>
  GATEWAY_ENDPOINT_WITH_AUTH_FORM_DATA.post(`/admin/device-release-requests/${requestId}/approve`, releaseForm(reason, proof)),
 rejectRequest: (requestId: string, reason: string) =>
  GATEWAY_ENDPOINT_WITH_AUTH.post(`/admin/device-release-requests/${requestId}/reject`, { reason }),
 deviceProof: (deviceId: string) => GATEWAY_ENDPOINT_WITH_AUTH.get(`/admin/devices/${deviceId}/proof`),
 requestProof: (requestId: string) => GATEWAY_ENDPOINT_WITH_AUTH.get(`/admin/device-release-requests/${requestId}/proof`),
 testPush: (deviceId: string) => GATEWAY_ENDPOINT_WITH_AUTH.post(`/admin/devices/${deviceId}/test-push`),
};

export const clientAssignment_api = {
 get: (clientId: string) => GATEWAY_ENDPOINT_WITH_AUTH.get(`/admin/clients/${clientId}/assignment`),
 update: (clientId: string, payload: { agentId?: string | null; adminId?: string | null; reason: string }) =>
  GATEWAY_ENDPOINT_WITH_AUTH.patch(`/admin/clients/${clientId}/assignment`, payload),
 reassignAgentClients: (agentId: string, payload: { toAgentId: string; clientIds?: string[]; reason: string }) =>
  GATEWAY_ENDPOINT_WITH_AUTH.post(`/admin/agents/${agentId}/clients/reassign`, payload),
};
