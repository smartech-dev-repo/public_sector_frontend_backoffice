import { useState, useCallback } from 'react';
import { auth_api } from '@/app/api_factory/modules/auth';

export const useAuth = () => {
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [profile, setProfile] = useState<any>(null);
 const [twoFactorSetupData, setTwoFactorSetupData] = useState<any>(null);
 const [qrCode, setQrCode] = useState<string | null>(null);

 const getProfile = useCallback(async () => {
  setLoading(true);
  try {
   let res: any;
   try {
    res = await auth_api.getAdminProfile();
   } catch {
    res = await auth_api.getProfile();
   }
   const data = res.data?.data || res.data;
   setProfile(data);
   return data;
  } catch (err: any) {
   setError(err.message);
   throw err;
  } finally {
   setLoading(false);
  }
 }, []);

 const changePassword = useCallback(async (payload: { currentPassword: string; newPassword: string }) => {
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

 const setup2fa = useCallback(async (payload?: { method?: 'TOTP' | 'EMAIL' }) => {
  setLoading(true);
  try {
   const res = await auth_api.setup2fa(payload);
   const data = res.data?.data || res.data;
   setTwoFactorSetupData(data);
   if (data?.otpauthUrl) {
    const qrUrl = data.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.otpauthUrl)}`;
    setQrCode(qrUrl);
   } else {
    setQrCode(null);
   }
   return data;
  } catch (err: any) {
   setError(err.message);
   throw err;
  } finally {
   setLoading(false);
  }
 }, []);

 const confirm2fa = useCallback(async (payload: { code: string }) => {
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

 const disable2fa = useCallback(async (payload: { currentPassword: string }) => {
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
  twoFactorSetupData,
  getProfile, 
  changePassword, 
  setup2fa, 
  confirm2fa, 
  disable2fa 
 };
};
