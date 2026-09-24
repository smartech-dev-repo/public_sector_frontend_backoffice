import { useState, useCallback } from 'react';
import { clients_api } from '@/app/api_factory/modules/clients';

export const useClients = () => {
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 25, totalPages: 1 });
  const [error, setError] = useState(null);
  const [clients, setClients] = useState([] as any[]);

  const fetchClients = useCallback(async (params?: any) => {
    setLoading(true);
    try {
      const res = await clients_api.getClients(params);
      let dataList = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.result || res.data?.agents || res.data?.clients || res.data?.roles || res.data?.admins || res.data?.logs || res.data?.invites || res.data?.permissions || res.data?.batches || []);
      if (res.data?.meta) setMeta(res.data.meta);
      dataList = Array.isArray(dataList) ? dataList : [];
      setClients(dataList);
      return dataList;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const getClientById = useCallback(async (id: string) => {
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
  }, []);

  const retryClient = useCallback(async (id: string) => {
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
  }, []);

  const approveClient = useCallback(async (id: string) => {
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
  }, []);

  const getClientWallet = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await clients_api.getClientWallet(id);
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const creditClientWallet = useCallback(async (id: string, payload: any) => {
    setLoading(true);
    try {
      const res = await clients_api.creditClientWallet(id, payload);
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const debitClientWallet = useCallback(async (id: string, payload: any) => {
    setLoading(true);
    try {
      const res = await clients_api.debitClientWallet(id, payload);
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, clients, fetchClients, getClientById, retryClient, approveClient, getClientWallet, creditClientWallet, debitClientWallet, meta };
};
