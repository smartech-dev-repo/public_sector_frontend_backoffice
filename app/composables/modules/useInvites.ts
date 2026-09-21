import { useState } from 'react';
import { invites_api } from '@/app/api_factory/modules/invites';

export const useInvites = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [invites, setInvites] = useState([] as any[]);

  const fetchInvites = async (params?: any) => {
    setLoading(true);
    try {
      const res = await invites_api.getInvites(params);
      setInvites(res.data);
      return res.data;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createInvite = async (payload: any) => {
    setLoading(true);
    try {
      const res = await invites_api.createInvite(payload);
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resendInvite = async (id: string) => {
    setLoading(true);
    try {
      const res = await invites_api.resendInvite(id);
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, invites, fetchInvites, createInvite, resendInvite };
};
