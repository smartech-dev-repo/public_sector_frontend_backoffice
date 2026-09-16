import { useState } from '#app';
import { invites_api } from '@/api_factory/modules/invites';

export const useInvites = () => {
  const loading = useState('invites-loading', () => false);
  const error = useState('invites-error', () => null);
  const invites = useState('invites-data', () => [] as any[]);

  const fetchInvites = async (params?: any) => {
    loading.value = true;
    try {
      const res = await invites_api.getInvites(params);
      invites.value = res.data;
      return res.data;
    } catch (err: any) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  const createInvite = async (payload: any) => {
    loading.value = true;
    try {
      const res = await invites_api.createInvite(payload);
      return res.data;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const resendInvite = async (id: string) => {
    loading.value = true;
    try {
      const res = await invites_api.resendInvite(id);
      return res.data;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return { loading, error, invites, fetchInvites, createInvite, resendInvite };
};
