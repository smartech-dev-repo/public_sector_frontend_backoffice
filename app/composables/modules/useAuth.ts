import { useState, useCallback } from 'react';
import { auth_api } from '@/app/api_factory/modules/auth';

export const useAuth = () => {
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [profile, setProfile] = useState<any>(null);
 const [qrCode, setQrCode] = useState<string | null>(null);

 const getProfile = useCallback(async () => {
  setLoading(true);
  try {
   const res = await auth_api.getProfile();
   setProfile(res.data?.data || res.data);
   return res.data;
  } catch (err: any) {
   setError(err.message);
   throw err;
  } finally {
   setLoading(false);
  }
 }, []);

 const changePassword = useCallback(async (payload: any) => {
  setLoading(true);
  try {
   const res = await auth_api.changePassword(payload);
   return res.data;
  } catch (err: any) {
   setError(err.message);
   throw err;
  } finally {
   setLoading(false);
  }
 }, []);

 const setup2fa = useCallback(async () => {
  setLoading(true);
  try {
   const res = await auth_api.setup2fa();
   if (res.data?.qrCodeUrl || res.data?.data?.qrCodeUrl) {
     setQrCode(res.data.qrCodeUrl || res.data.data.qrCodeUrl);
   }
   return res.data;
  } catch (err: any) {
   setError(err.message);
   throw err;
  } finally {
   setLoading(false);
  }
 }, []);

 const confirm2fa = useCallback(async (payload: { token: string }) => {
  setLoading(true);
  try {
   const res = await auth_api.confirm2fa(payload);
   return res.data;
  } catch (err: any) {
   setError(err.message);
   throw err;
  } finally {
   setLoading(false);
  }
 }, []);

 const disable2fa = useCallback(async (payload: { token: string }) => {
  setLoading(true);
  try {
   const res = await auth_api.disable2fa(payload);
   return res.data;
  } catch (err: any) {
   setError(err.message);
   throw err;
  } finally {
   setLoading(false);
  }
 }, []);

 return { 
  loading, 
  error, 
  profile, 
  qrCode, 
  getProfile, 
  changePassword, 
  setup2fa, 
  confirm2fa, 
  disable2fa 
 };
};
