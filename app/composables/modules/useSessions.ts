import { useState } from '#app';
import { sessions_api } from '@/api_factory/modules/sessions';

export const useSessions = () => {
  const loading = useState('sessions-loading', () => false);
  const error = useState('sessions-error', () => null);

  const revokeAgentSessions = async (agentId: string) => {
    loading.value = true;
    try {
      const res = await sessions_api.revokeAgentSessions(agentId);
      return res.data;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const revokeClientSessions = async (clientId: string) => {
    loading.value = true;
    try {
      const res = await sessions_api.revokeClientSessions(clientId);
      return res.data;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return { loading, error, revokeAgentSessions, revokeClientSessions };
};
