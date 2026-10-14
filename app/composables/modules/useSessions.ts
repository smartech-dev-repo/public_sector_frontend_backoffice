import { useState, useCallback } from 'react';
import { sessions_api } from '@/app/api_factory/modules/sessions';
import { auth_api } from '@/app/api_factory/modules/auth';

export const useSessions = () => {
 const [loading, setLoading] = useState(false);
 const [meta, setMeta] = useState({ total: 0, page: 1, limit: 25, totalPages: 1 });
 const [error, setError] = useState(null);
 const [sessions, setSessions] = useState([] as any[]);

 const fetchSessions = useCallback(async (params?: any) => {
  setLoading(true);
  try {
   const res = await auth_api.getSessions();
   let dataList = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.sessions || []);
   if (res.data?.meta) setMeta(res.data.meta);
   dataList = Array.isArray(dataList) ? dataList : [];
   setSessions(dataList);
   return dataList;
  } catch (err: any) {
   setError(err.message);
  } finally {
   setLoading(false);
  }
 }, []);

 const deleteSession = useCallback(async (id: string) => {
  setLoading(true);
  try {
   const res = await auth_api.deleteSession(id);
   return res.data;
  } catch (err: any) {
   setError(err.message);
   throw err;
  } finally {
   setLoading(false);
  }
 }, []);

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

 return { loading, error, sessions, fetchSessions, deleteSession, revokeAgentSessions, revokeClientSessions, meta };
};
