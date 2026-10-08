"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useAuth } from '@/app/composables/core/useAuth';
import AuthInput from '@/app/components/Auth/Input';

export default function LoginPage() {
 const router = useRouter();
 const { setTheme } = useTheme();
 const { adminLogin, loginVerify2fa, loading, error } = useAuth();
 
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [show2fa, setShow2fa] = useState(false);
 const [token2fa, setToken2fa] = useState('');

 const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
   const res = await adminLogin({ email, password });
   if (res?.requires2fa || res?.data?.requires2fa) {
    setShow2fa(true);
   } else {
    setTheme('light');
    router.push('/dashboard/broadsheet');
   }
  } catch (err: any) {
   // Error is handled in composable, can also show a toast here
   if (err?.response?.data?.message?.toLowerCase().includes('2fa') || err?.response?.data?.requires2fa) {
    setShow2fa(true);
   }
  }
 };

 const handleVerify2fa = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
   await loginVerify2fa({ email, password, token: token2fa });
   setTheme('light');
   router.push('/dashboard/broadsheet');
  } catch (err: any) {
   // handle error
  }
 };

 return (
  <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
   <div className="max-w-[400px] w-full">
    <div className="bg-card p-8 rounded-2xl border border-border/50 text-center">
     {/* Logo placeholder */}
      <div className='flex justify-start items-start flex-col'>
        <div className="flex justify-center items-center mb-6">
        <img src="/auth-logo.png" className="h-6 w-auto" alt="Logo" />
        </div>
        <h2 className="text-2xl font-semibold text-foreground">Welcome back</h2>
        <p className="mt-2 text-sm text-muted-foreground mb-8">Enter your Login details to access your dashboard</p>
      </div>

     {!show2fa ? (
      <form className="space-y-4 text-left" onSubmit={handleLogin}>
       <AuthInput
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        label="Enter your email"
        type="email"
        placeholder="example@mmfb.com"
        required
       />
       <AuthInput
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        label="Enter your password"
        type="password"
        placeholder="!@#$%^&*(password)"
        required
       />
       
       <button 
        disabled={loading} 
        type="submit" 
        className="w-full flex justify-center items-center mt-2 py-3 px-4 rounded-xl text-white font-medium bg-emerald-500 hover:bg-emerald-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
       >
        {loading && (
         <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
         </svg>
        )}
        {loading ? 'Signing in...' : 'Sign in'}
       </button>
      </form>
     ) : (
      <form className="space-y-4 text-left" onSubmit={handleVerify2fa}>
       <div className="p-3 mb-4 bg-emerald-50 border border-emerald-100 rounded-lg">
        <p className="text-sm text-emerald-800 text-center font-medium">Two-Factor Authentication is required for your account.</p>
       </div>
       <AuthInput
        value={token2fa}
        onChange={(e) => setToken2fa(e.target.value.replace(/\D/g, ''))}
        label="Enter Authenticator Code"
        type="text"
        placeholder="e.g. 123456"
        required
       />
       <button 
        disabled={loading || token2fa.length < 6} 
        type="submit" 
        className="w-full flex justify-center items-center mt-2 py-3 px-4 rounded-xl text-white font-medium bg-emerald-500 hover:bg-emerald-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
       >
        {loading && (
         <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
         </svg>
        )}
        {loading ? 'Verifying...' : 'Verify Code'}
       </button>
       <div className="text-center mt-4">
        <button type="button" onClick={() => setShow2fa(false)} className="text-sm text-emerald-600 hover:underline">
         Back to login
        </button>
       </div>
      </form>
     )}

     <div className="mt-6 text-sm text-muted-foreground">
      Forgot password? <Link href="/forgot-password" className="text-emerald-600 hover:underline font-medium">Reset password</Link>
     </div>
    </div>
   </div>
  </div>
 );
}
