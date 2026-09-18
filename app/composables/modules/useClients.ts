import { useState } from '#app';
import { clients_api } from '@/api_factory/modules/clients';

export const useClients = () => {
  const loading = useState('clients-loading', () => false);
  const error = useState('clients-error', () => null);
  const clients = useState('clients-data', () => [] as any[]);

  const fetchClients = async (params?: any) => {
    loading.value = true;
    try {
      const res = await clients_api.getClients(params);
      clients.value = res.data;
      return res.data;
    } catch (err: any) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  const getClientById = async (id: string) => {
    loading.value = true;
    try {
      const res = await clients_api.getClientById(id);
      return res.data;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const retryClient = async (id: string) => {
    loading.value = true;
    try {
      const res = await clients_api.retryClient(id);
      return res.data;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const approveClient = async (id: string) => {
    loading.value = true;
    try {
      const res = await clients_api.approveClient(id);
      return res.data;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return { loading, error, clients, fetchClients, getClientById, retryClient, approveClient };
};
