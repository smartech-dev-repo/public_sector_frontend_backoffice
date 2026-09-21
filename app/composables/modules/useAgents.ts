import { useState } from 'react';
import { agents_api } from '@/app/api_factory/modules/agents';

export const useAgents = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [agents, setAgents] = useState([] as any[]);

  const fetchAgents = async (params?: any) => {
    setLoading(true);
    try {
      const res = await agents_api.getAgents(params);
      setAgents(res.data);
      return res.data;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getAgentById = async (id: string) => {
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
  };

  const approveAgent = async (id: string) => {
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
  };

  const rejectAgent = async (id: string) => {
    setLoading(true);
    try {
      const res = await agents_api.rejectAgent(id);
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resendCredentials = async (id: string) => {
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
  };

  return { loading, error, agents, fetchAgents, getAgentById, approveAgent, rejectAgent, resendCredentials };
};
