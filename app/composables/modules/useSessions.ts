import { useState, useCallback } from 'react';
import { sessions_api } from '@/app/api_factory/modules/sessions';

export const useSessions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const revokeAgentSessions = useCallback(async (agentId: string) => {
    setLoading(true);
    try {
      const res = await sessions_api.revokeAgentSessions(agentId);
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeClientSessions = useCallback(async (clientId: string) => {
    setLoading(true);
    try {
      const res = await sessions_api.revokeClientSessions(clientId);
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, revokeAgentSessions, revokeClientSessions };
};
