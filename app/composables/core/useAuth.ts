import { useState } from '#app';
import { auth_api } from '@/api_factory/modules/auth';

export const useAuth = () => {
 const user = useState('user', () => null);
 const isAuthenticated = useState('isAuthenticated', () => false);

 const login = async (payload: any) => {
 try {
 const response = await auth_api.login(payload);
 user.value = response.data;
 isAuthenticated.value = true;
 } catch (error) {
 console.error('Login failed', error);
 throw error;
 }
 };

 const logout = () => {
 user.value = null;
 isAuthenticated.value = false;
 };

 return {
 user,
 isAuthenticated,
 login,
 logout,
 };
};
