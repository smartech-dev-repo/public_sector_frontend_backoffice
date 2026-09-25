import { useState } from 'react';
import { auth_api } from '@/app/api_factory/modules/auth';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const setToken = (data: any) => {
    const token = data?.token || data?.accessToken || data?.data?.token || data?.data?.accessToken;
    if (token && typeof window !== 'undefined') {
      document.cookie = `public_sector_token=${encodeURIComponent(token)}; path=/; max-age=31536000`; // 1 year
      localStorage.setItem('token', token);
    }
  };

  const login = async (payload: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await auth_api.login(payload);
      setToken(response.data);
      setUser(response.data);
      setIsAuthenticated(true);
      return response.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const adminLogin = async (payload: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await auth_api.adminLogin(payload);
      setToken(response.data);
      setUser(response.data);
      setIsAuthenticated(true);
      return response.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const acceptInvite = async (payload: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await auth_api.acceptInvite(payload);
      setToken(response.data);
      setUser(response.data);
      setIsAuthenticated(true);
      return response.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (payload: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await auth_api.forgotPassword(payload);
      return response.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (payload: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await auth_api.resetPassword(payload);
      return response.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminProfile = async () => {
    try {
      const response = await auth_api.getAdminProfile();
      setUser(response.data);
      return response.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const agentLogin = async (payload: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await auth_api.agentLogin(payload);
      setToken(response.data);
      setUser(response.data);
      setIsAuthenticated(true);
      return response.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clientOtpRequest = async (payload: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await auth_api.clientOtpRequest(payload);
      return response.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clientOtpVerify = async (payload: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await auth_api.clientOtpVerify(payload);
      setToken(response.data);
      setUser(response.data);
      setIsAuthenticated(true);
      return response.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
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
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const logoutAll = async () => {
    try {
      await auth_api.logoutAll();
    } catch (err) {
      console.error('LogoutAll API failed', err);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
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
    forgotPassword,
    resetPassword,
    fetchAdminProfile,
    agentLogin,
    clientOtpRequest,
    clientOtpVerify,
    refreshSession,
    logout,
    logoutAll
  };
};
