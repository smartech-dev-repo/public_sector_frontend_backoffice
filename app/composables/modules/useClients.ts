import { useState } from 'react';
import { clients_api } from '@/app/api_factory/modules/clients';

export const useClients = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clients, setClients] = useState([] as any[]);

  const fetchClients = async (params?: any) => {
    setLoading(true);
    try {
      const res = await clients_api.getClients(params);
      setClients(res.data);
      return res.data;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getClientById = async (id: string) => {
    setLoading(true);
    try {
      const res = await clients_api.getClientById(id);
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const retryClient = async (id: string) => {
    setLoading(true);
    try {
      const res = await clients_api.retryClient(id);
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const approveClient = async (id: string) => {
    setLoading(true);
    try {
      const res = await clients_api.approveClient(id);
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, clients, fetchClients, getClientById, retryClient, approveClient };
};
