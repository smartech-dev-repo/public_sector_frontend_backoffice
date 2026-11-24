"use client";

import { useState } from 'react';
import { auth_api } from '@/app/api_factory/modules/auth';
import { clearAccessToken, setAccessToken } from '@/app/api_factory/tokenStore';

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
  clearAccessToken();
  if (typeof window !== 'undefined') {
    // Tokens no longer live in scripts' reach; these clear what older versions left behind.
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
    localStorage.removeItem('public_sector_last_activity');
    window.dispatchEvent(new Event('public_sector_profile_updated'));
  }
}

/**
 * Keeps a fresh access token in memory and caches what the menus need from it. The refresh
 * token never reaches the page: the sign-in routes put it in an httpOnly cookie.
 */
export function setAuthToken(data: any) {
  const token = data?.accessToken || data?.data?.accessToken;
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

    setAccessToken(token);
    // Clear any token an older version stored where scripts can read it.
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    document.cookie = 'public_sector_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    localStorage.setItem('public_sector_last_activity', String(Date.now()));
    window.dispatchEvent(new Event('public_sector_profile_updated'));
  }
}

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const setToken = setAuthToken;

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
   // Clears this browser's refresh cookie too.
   await auth_api.logout().catch(() => undefined);
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
  adminLogin,
  acceptInvite,
  forgotPassword,
  resetPassword,
  fetchAdminProfile,
  logout,
  logoutAll,
  loginVerify2fa
 };
};
