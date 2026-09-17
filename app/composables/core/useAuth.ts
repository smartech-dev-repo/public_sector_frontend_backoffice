import { useState } from '#app';
import { auth_api } from '@/api_factory/modules/auth';

export const useAuth = () => {
  const user = useState('user', () => null);
  const isAuthenticated = useState('isAuthenticated', () => false);
  const loading = useState('auth-loading', () => false);
  const error = useState('auth-error', () => null);

  const setToken = (data: any) => {
    const token = data?.token || data?.accessToken || data?.data?.token || data?.data?.accessToken;
    if (token && typeof window !== 'undefined') {
      document.cookie = `public_sector_token=${encodeURIComponent(token)}; path=/; max-age=86400`;
      localStorage.setItem('token', token);
    }
  };

  const login = async (payload: any) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await auth_api.login(payload);
      setToken(response.data);
      user.value = response.data;
      isAuthenticated.value = true;
      return response.data;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const adminLogin = async (payload: any) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await auth_api.adminLogin(payload);
      setToken(response.data);
      user.value = response.data;
      isAuthenticated.value = true;
      return response.data;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const acceptInvite = async (payload: any) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await auth_api.acceptInvite(payload);
      setToken(response.data);
      user.value = response.data;
      isAuthenticated.value = true;
      return response.data;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchAdminProfile = async () => {
    try {
      const response = await auth_api.getAdminProfile();
      user.value = response.data;
      return response.data;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    }
  };

  const agentLogin = async (payload: any) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await auth_api.agentLogin(payload);
      setToken(response.data);
      user.value = response.data;
      isAuthenticated.value = true;
      return response.data;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const clientOtpRequest = async (payload: any) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await auth_api.clientOtpRequest(payload);
      return response.data;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const clientOtpVerify = async (payload: any) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await auth_api.clientOtpVerify(payload);
      setToken(response.data);
      user.value = response.data;
      isAuthenticated.value = true;
      return response.data;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const refreshSession = async () => {
    try {
      const response = await auth_api.refresh();
      return response.data;
    } catch (err: any) {
      console.error('Session refresh failed', err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await auth_api.logout();
    } catch (err) {
      console.error('Logout API failed', err);
    } finally {
      user.value = null;
      isAuthenticated.value = false;
    }
  };

  const logoutAll = async () => {
    try {
      await auth_api.logoutAll();
    } catch (err) {
      console.error('LogoutAll API failed', err);
    } finally {
      user.value = null;
      isAuthenticated.value = false;
    }
  };

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    adminLogin,
    acceptInvite,
    fetchAdminProfile,
    agentLogin,
    clientOtpRequest,
    clientOtpVerify,
    refreshSession,
    logout,
    logoutAll
  };
};
