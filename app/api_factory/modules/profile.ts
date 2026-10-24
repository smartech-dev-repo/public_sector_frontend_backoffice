import { GATEWAY_ENDPOINT_WITH_AUTH } from '../axios.config';

export interface AdminRole {
  id: string;
  name: string;
  department?: {
    id: string;
    name: string;
  };
  permissions?: string[];
}

export interface AdminProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  isActive: boolean;
  role?: AdminRole;
  profileImage?: string | null;
  profileImageUrl?: string | null;
  twoFactorEnabled?: boolean;
  permissions?: string[];
}

export const profile_api = {
  getProfile: () => {
    return GATEWAY_ENDPOINT_WITH_AUTH.get('/admin/me');
  },
  updateProfile: (payload: { firstName?: string; lastName?: string }) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.patch('/admin/me', payload);
  },
  uploadProfileImage: (formData: FormData) => {
    return GATEWAY_ENDPOINT_WITH_AUTH.post('/admin/me/profile-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  deleteProfileImage: () => {
    return GATEWAY_ENDPOINT_WITH_AUTH.delete('/admin/me/profile-image');
  }
};
