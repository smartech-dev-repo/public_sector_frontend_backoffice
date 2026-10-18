import { useState, useCallback } from 'react';
import { clients_api } from '@/app/api_factory/modules/clients';

export const useClients = () => {
 const [loading, setLoading] = useState(false);
 const [meta, setMeta] = useState({ total: 0, page: 1, limit: 25, totalPages: 1 });
 const [error, setError] = useState(null);
  const [clients, setClients] = useState([] as any[]);
  const [analytics, setAnalytics] = useState<any>(null);

  const fetchClientAnalytics = useCallback(async () => {
    try {
      const res = await clients_api.getClientAnalytics();
      const data = res.data?.data || res.data;
      setAnalytics(data);
      return data;
    } catch {
      // Graceful fallback if analytics endpoint fails
      return null;
    }
  }, []);

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
    return res.data;
  };

 const getClientById = useCallback(async (id: string) => {
  setLoading(true);
  try {
   const res = await clients_api.getClientById(id);
   return unwrapResponse(res, 'Failed to fetch client');
  } catch (err: any) {
   setError(err.message);
   throw err;
  } finally {
   setLoading(false);
  }
 }, []);

 const retryClient = useCallback(async (id: string, payload?: { note?: string }) => {
  setLoading(true);
  try {
   const res = await clients_api.retryClient(id, payload);
   return res.data;
  } catch (err: any) {
   setError(err.message);
   throw err;
  } finally {
   setLoading(false);
  }
 }, []);

 const revokeClientSessions = useCallback(async (id: string) => {
  setLoading(true);
  try {
   const res = await clients_api.revokeClientSessions(id);
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

 const getClientWallet = useCallback(async (id: string, params?: any) => {
  setLoading(true);
  try {
   const res = await clients_api.getClientWallet(id, params);
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

 const getClientActivities = useCallback(async (id: string) => {
  setLoading(true);
  try {
   const res = await clients_api.getClientActivities(id);
   return res.data;
  } catch (err: any) {
   setError(err.message);
   throw err;
  } finally {
   setLoading(false);
  }
 }, []);

 const getClientOnboardingStatus = useCallback(async (id: string) => {
  setLoading(true);
  try {
   const res = await clients_api.getClientOnboardingStatus(id);
   return unwrapResponse(res, 'Failed to fetch onboarding status');
  } catch (err: any) {
   setError(err.message);
   throw err;
  } finally {
   setLoading(false);
  }
 }, []);

  const ippisLookup = useCallback(async (payload: { ippisNumber: string }) => {
    setLoading(true);
    try {
      const res = await clients_api.clientIppisLookup(payload);
      return unwrapResponse(res, 'IPPIS lookup failed');
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const identityVerification = useCallback(async (clientId: string, payload: { bvn: string, nin: string }) => {
    setLoading(true);
    try {
      const res = await clients_api.submitClientIdentity(clientId, payload);
      return unwrapResponse(res, 'Identity verification failed');
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadDocument = useCallback(async (clientId: string, type: string, file: File) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await clients_api.uploadClientDocument(clientId, type, formData);
      return unwrapResponse(res, `Failed to upload ${type}`);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const runFaceMatch = useCallback(async (clientId: string) => {
    setLoading(true);
    try {
      const res = await clients_api.submitClientFaceMatch(clientId, {});
      return unwrapResponse(res, 'Biometric cross-check failed');
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    ippisLookup,
    identityVerification,
    uploadDocument,
    runFaceMatch,
    getClientOnboardingStatus,
    loading,
    error,
    clients,
    fetchClients,
    analytics,
    fetchClientAnalytics,
    getClientById,
    retryClient,
    approveClient,
    revokeClientSessions,
    getClientWallet,
    creditClientWallet,
    debitClientWallet,
    getClientActivities,
    meta
  };
};
