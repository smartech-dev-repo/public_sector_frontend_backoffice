"use client";

import { useState } from 'react';
import { auth_api } from '@/app/api_factory/modules/auth';

export function decodeJwtPayload(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function clearAuthStorage() {
  if (typeof window !== 'undefined') {
    document.cookie = 'public_sector_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'public_sector_user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('public_sector_permissions');
    localStorage.removeItem('public_sector_role');
    localStorage.removeItem('public_sector_user_name');
    localStorage.removeItem('public_sector_user_email');
    localStorage.removeItem('public_sector_token_sub');
    localStorage.removeItem('admin_2fa_enabled');
    window.dispatchEvent(new Event('public_sector_profile_updated'));
  }
}

export function setAuthToken(data: any) {
  const token = data?.token || data?.accessToken || data?.data?.token || data?.data?.accessToken;
  const refreshToken = data?.refreshToken || data?.data?.refreshToken;
  if (token && typeof window !== 'undefined') {
    // 1. Wipe previous cached permissions & role immediately
    localStorage.removeItem('public_sector_permissions');
    localStorage.removeItem('public_sector_role');
    localStorage.removeItem('public_sector_user_name');

    // 2. Decode fresh permissions directly from the JWT access token payload
    const decoded = decodeJwtPayload(token);
    if (decoded) {
      if (Array.isArray(decoded.permissions)) {
        localStorage.setItem('public_sector_permissions', JSON.stringify(decoded.permissions));
      }
      if (decoded.sub) {
        localStorage.setItem('public_sector_token_sub', decoded.sub);
      }
      if (decoded.role) {
        const rName = typeof decoded.role === 'string' ? decoded.role : decoded.role.name;
        if (rName) localStorage.setItem('public_sector_role', rName);
      }
    }

    document.cookie = `public_sector_token=${encodeURIComponent(token)}; path=/; max-age=31536000`; // 1 year
    localStorage.setItem('token', token);
    window.dispatchEvent(new Event('public_sector_profile_updated'));
  }
  if (refreshToken && typeof window !== 'undefined') {
    localStorage.setItem('refreshToken', refreshToken);
  }
}

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const setToken = setAuthToken;

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
   clearAuthStorage();
   setIsAuthenticated(false);
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
  loginVerify2fa
 };
};
