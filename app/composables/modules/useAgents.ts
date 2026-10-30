import { useState, useCallback, useRef } from 'react';
import { agents_api } from '@/app/api_factory/modules/agents';

const unwrapResponse = (res: any, defaultErrMsg = 'Operation failed') => {
  if (!res) {
    throw new Error(defaultErrMsg);
  }
  if (
    res.type === 'ERROR' ||
    (typeof res.status === 'number' && res.status >= 400) ||
    (typeof res.statusCode === 'number' && res.statusCode >= 400) ||
    (res.data && typeof res.data.statusCode === 'number' && res.data.statusCode >= 400)
  ) {
    const errorMsg =
      res.data?.message ||
      res.message ||
      res.data?.error ||
      res.error ||
      defaultErrMsg;
    const formatted = Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg;
    const err: any = new Error(formatted);
    err.response = res;
    err.statusCode = res.status || res.data?.statusCode || res.statusCode;
    throw err;
  }
  return res;
};

export const useAgents = () => {
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 25, totalPages: 1 });
  const [error, setError] = useState<string | null>(null);
  const [agents, setAgents] = useState([] as any[]);
  const [agentAnalytics, setAgentAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const listRequestSeq = useRef(0);

  const fetchAgentAnalytics = useCallback(async (params?: { createdFrom?: string; createdTo?: string }) => {
    setAnalyticsLoading(true);
    try {
      const res = await agents_api.getAgentAnalytics(params);
      unwrapResponse(res, 'Failed to fetch agent analytics');
      const data = res.data?.data || res.data;
      setAgentAnalytics(data);
      return data;
    } catch (err: any) {
      return null;
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  const fetchAgents = useCallback(async (params?: any) => {
    const seq = ++listRequestSeq.current;
    setLoading(true);
    setError(null);
    try {
      const res = await agents_api.getAgents(params);
      if (seq !== listRequestSeq.current) return [];
      unwrapResponse(res, 'Failed to fetch agents');
      let dataList = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.result || res.data?.agents || []);
      if (res.data?.meta) setMeta(res.data.meta);
      dataList = Array.isArray(dataList) ? dataList : [];
      setAgents(dataList);
      return dataList;
    } catch (err: any) {
      if (seq === listRequestSeq.current) setError(err.message);
      return [];
    } finally {
      if (seq === listRequestSeq.current) setLoading(false);
    }
  }, []);

  const getAgentById = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await agents_api.getAgentById(id);
      unwrapResponse(res, 'Failed to fetch agent');
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const approveAgent = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await agents_api.approveAgent(id);
      unwrapResponse(res, 'Failed to approve agent');
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const rejectAgent = useCallback(async (id: string, payload: any) => {
    setLoading(true);
    try {
      const res = await agents_api.rejectAgent(id, payload);
      unwrapResponse(res, 'Failed to reject agent');
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const resendCredentials = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await agents_api.resendCredentials(id);
      unwrapResponse(res, 'Failed to resend credentials');
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOnboardingAccess = useCallback(async (id: string, payload: boolean | { canOnboardClients: boolean }) => {
    setLoading(true);
    try {
      const canOnboard = typeof payload === 'boolean' ? payload : payload.canOnboardClients;
      const res = await agents_api.updateOnboardingAccess(id, { canOnboardClients: canOnboard });
      unwrapResponse(res, 'Failed to update onboarding access');
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeAgentSessions = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await agents_api.revokeSessions(id);
      unwrapResponse(res, 'Failed to revoke sessions');
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { 
    loading, error, agents, fetchAgents, getAgentById, approveAgent, rejectAgent, 
    resendCredentials, updateOnboardingAccess, revokeAgentSessions, revokeSessions: revokeAgentSessions, meta,
    agentAnalytics, analyticsLoading, fetchAgentAnalytics
  };
};
