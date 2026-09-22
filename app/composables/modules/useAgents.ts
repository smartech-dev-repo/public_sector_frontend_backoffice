import { useState, useCallback } from 'react';
import { agents_api } from '@/app/api_factory/modules/agents';

export const useAgents = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [agents, setAgents] = useState([] as any[]);

  const fetchAgents = useCallback(async (params?: any) => {
    setLoading(true);
    try {
      const res = await agents_api.getAgents(params);
      let dataList = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.result || res.data?.agents || []);
      dataList = Array.isArray(dataList) ? dataList : [];
      setAgents(dataList);
      return dataList;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const getAgentById = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await agents_api.getAgentById(id);
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
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, agents, fetchAgents, getAgentById, approveAgent, rejectAgent, resendCredentials };
};
