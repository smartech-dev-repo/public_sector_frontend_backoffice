import { useState } from '#app';
import { agents_api } from '@/api_factory/modules/agents';

export const useAgents = () => {
  const loading = useState('agents-loading', () => false);
  const error = useState('agents-error', () => null);
  const agents = useState('agents-data', () => [] as any[]);

  const fetchAgents = async (params?: any) => {
    loading.value = true;
    try {
      const res = await agents_api.getAgents(params);
      agents.value = res.data;
      return res.data;
    } catch (err: any) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  const getAgentById = async (id: string) => {
    loading.value = true;
    try {
      const res = await agents_api.getAgentById(id);
      return res.data;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const approveAgent = async (id: string) => {
    loading.value = true;
    try {
      const res = await agents_api.approveAgent(id);
      return res.data;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const rejectAgent = async (id: string) => {
    loading.value = true;
    try {
      const res = await agents_api.rejectAgent(id);
      return res.data;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const resendCredentials = async (id: string) => {
    loading.value = true;
    try {
      const res = await agents_api.resendCredentials(id);
      return res.data;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return { loading, error, agents, fetchAgents, getAgentById, approveAgent, rejectAgent, resendCredentials };
};
