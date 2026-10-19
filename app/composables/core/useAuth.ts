import { useState } from 'react';
import { auth_api } from '@/app/api_factory/modules/auth';

export const useAuth = () => {
 const [user, setUser] = useState(null);
 const [isAuthenticated, setIsAuthenticated] = useState(false);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState(null);

 const setToken = (data: any) => {
  const token = data?.token || data?.accessToken || data?.data?.token || data?.data?.accessToken;
  const refreshToken = data?.refreshToken || data?.data?.refreshToken;
  if (token && typeof window !== 'undefined') {
   document.cookie = `public_sector_token=${encodeURIComponent(token)}; path=/; max-age=31536000`; // 1 year
   localStorage.setItem('token', token);
  }
  if (refreshToken && typeof window !== 'undefined') {
   localStorage.setItem('refreshToken', refreshToken);
  }
  const rawPerms = data?.permissions || data?.data?.permissions || data?.role?.permissions || data?.data?.role?.permissions;
  if (Array.isArray(rawPerms) && typeof window !== 'undefined') {
   const perms = rawPerms.map((p: any) => typeof p === 'string' ? p : (p?.permission?.key || p?.key || '')).filter(Boolean);
   localStorage.setItem('public_sector_permissions', JSON.stringify(perms));
  }
  const roleName = data?.role?.name || data?.data?.role?.name || (typeof data?.role === 'string' ? data.role : '');
  if (roleName && typeof window !== 'undefined') {
   localStorage.setItem('public_sector_role', roleName);
  }
 };

 const refreshToken = async () => {
  const storedRefresh = typeof localStorage !== 'undefined' ? localStorage.getItem('refreshToken') : null;
  if (!storedRefresh) return null;
  try {
   const response = await auth_api.refreshToken({ refreshToken: storedRefresh });
   const data = (response.data as any)?.data || response.data;
   if (data) {
    setToken(data);
    return data;
   }
   return null;
  } catch (e) {
   return null;
  }
 };

 const login = async (payload: any) => {
  setLoading(true);
  setError(null);
  try {
   const response = await auth_api.login(payload);
   setToken(response.data);
   setUser(response.data);
   if (payload?.email && typeof window !== 'undefined') {
    localStorage.setItem('public_sector_user_email', payload.email);
   }
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
   if (payload?.email && typeof window !== 'undefined') {
    localStorage.setItem('public_sector_user_email', payload.email);
   }
   const response = await auth_api.adminLogin(payload);
   if (response.data?.twoFactorRequired) {
    if (typeof window !== 'undefined') {
     localStorage.setItem('admin_2fa_enabled', 'true');
    }
    return response.data;
   }
   if (typeof window !== 'undefined') {
    localStorage.setItem('admin_2fa_enabled', 'false');
   }
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

 const loginVerify2fa = async (payload: any) => {
  setLoading(true);
  setError(null);
  try {
   const response = await auth_api.loginVerify2fa(payload);
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

 const clearAuthStorage = () => {
  if (typeof window !== 'undefined') {
   document.cookie = 'public_sector_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
   localStorage.removeItem('token');
   localStorage.removeItem('refreshToken');
   localStorage.removeItem('public_sector_permissions');
   localStorage.removeItem('public_sector_role');
  }
 };

 const logout = async () => {
  try {
   await auth_api.logout();
  } catch (err) {
   console.error('Logout API failed', err);
  } finally {
   clearAuthStorage();
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
   clearAuthStorage();
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
  logout,
  logoutAll,
  refreshToken,
  loginVerify2fa
 };
};
