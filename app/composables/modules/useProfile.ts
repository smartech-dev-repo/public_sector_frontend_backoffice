import { useState, useCallback, useEffect } from 'react';
import { profile_api, AdminProfile } from '@/app/api_factory/modules/profile';

export const useProfile = () => {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await profile_api.getProfile();
      const data = (res.data as any)?.data || res.data;
      if (data && typeof data === 'object') {
        setProfile(data);
        if (data.email) {
          localStorage.setItem('public_sector_user_email', data.email);
        }
        if (data.fullName || data.firstName) {
          const name = data.fullName || `${data.firstName || ''} ${data.lastName || ''}`.trim();
          localStorage.setItem('public_sector_user_name', name);
        }
        if (typeof data.twoFactorEnabled === 'boolean') {
          localStorage.setItem('admin_2fa_enabled', String(data.twoFactorEnabled));
        }
        const rawPerms = Array.isArray(data.permissions) 
          ? data.permissions 
          : (Array.isArray(data.role?.permissions) ? data.role.permissions : []);
        const perms = rawPerms.map((p: any) => {
          if (typeof p === 'string') return p.trim();
          if (p && typeof p === 'object') {
            return p.key || p.permission?.key || p.name || p.permission?.name || p.slug || p.permission?.slug || '';
          }
          return '';
        }).filter(Boolean);
        localStorage.setItem('public_sector_permissions', JSON.stringify(perms));
        if (data.role?.name) {
          localStorage.setItem('public_sector_role', data.role.name);
        }
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('public_sector_profile_updated'));
        }
      }
      return data;
    } catch (err: any) {
      setError(err?.message || 'Failed to load profile');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (payload: { firstName?: string; lastName?: string }) => {
    setLoading(true);
    try {
      const res = await profile_api.updateProfile(payload);
      const data = (res.data as any)?.data || res.data;
      if (data) {
        setProfile(prev => ({ ...(prev || {}), ...data }));
        if (data.fullName || data.firstName) {
          const name = data.fullName || `${data.firstName || ''} ${data.lastName || ''}`.trim();
          localStorage.setItem('public_sector_user_name', name);
        }
      }
      return data;
    } catch (err: any) {
      setError(err?.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadProfileImage = useCallback(async (file: File) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await profile_api.uploadProfileImage(formData);
      const data = (res.data as any)?.data || res.data;
      if (data) {
        setProfile(prev => ({ ...(prev || {}), ...data }));
      }
      return data;
    } catch (err: any) {
      setError(err?.message || 'Failed to upload profile image');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProfileImage = useCallback(async () => {
    setLoading(true);
    try {
      const res = await profile_api.deleteProfileImage();
      const data = (res.data as any)?.data || res.data;
      if (data) {
        setProfile(prev => ({ ...(prev || {}), ...data, profileImage: null }));
      }
      return data;
    } catch (err: any) {
      setError(err?.message || 'Failed to delete profile image');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    uploadProfileImage,
    deleteProfileImage
  };
};
