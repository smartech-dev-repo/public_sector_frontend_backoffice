"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/composables/core/useAuth';
import AuthInput from '@/app/components/Auth/Input';
import OtpInput from '@/app/components/ui/OtpInput';
import { Mail, ShieldCheck, ArrowLeft, KeyRound } from 'lucide-react';

export default function LoginPage() {
 const router = useRouter();
 const { adminLogin, loginVerify2fa, loading } = useAuth();
 
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [show2fa, setShow2fa] = useState(false);
 const [twoFactorMethod, setTwoFactorMethod] = useState<'TOTP' | 'EMAIL'>('TOTP');
 const [pendingToken, setPendingToken] = useState('');
 const [token2fa, setToken2fa] = useState('');
 const [verifyError, setVerifyError] = useState<string | null>(null);

 const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setVerifyError(null);
  if (email && typeof window !== 'undefined') {
   localStorage.setItem('public_sector_user_email', email);
  }
  try {
   const res: any = await adminLogin({ email, password });
   if (res?.twoFactorRequired || res?.data?.twoFactorRequired || res?.requires2fa) {
    const data = res?.twoFactorRequired ? res : (res?.data || {});
    setTwoFactorMethod(data.method === 'EMAIL' ? 'EMAIL' : 'TOTP');
    setPendingToken(data.pendingToken || '');
    setShow2fa(true);
   } else {
    router.push('/dashboard');
   }
  } catch (err: any) {
   if (err?.response?.data?.twoFactorRequired || err?.response?.data?.message?.toLowerCase().includes('two-factor')) {
    const data = err?.response?.data || {};
    setTwoFactorMethod(data.method === 'EMAIL' ? 'EMAIL' : 'TOTP');
    setPendingToken(data.pendingToken || '');
    setShow2fa(true);
   } else {
    setVerifyError(err?.response?.data?.message || 'Invalid email or password. Please try again.');
   }
  }
 };

 const handleVerify2fa = async (e: React.FormEvent) => {
  e.preventDefault();
  setVerifyError(null);
  try {
   await loginVerify2fa({ pendingToken, code: token2fa });
   if (typeof window !== 'undefined') {
    localStorage.setItem('admin_2fa_enabled', 'true');
   }
   router.push('/dashboard');
  } catch (err: any) {
   setVerifyError(err?.response?.data?.message || 'Invalid verification code. Please try again.');
  }
 };

 return (
  <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
   <div className="max-w-[420px] w-full">
    <div className="bg-card p-8 rounded-2xl border border-border/50 text-center shadow-sm">
     {/* Logo header */}
     <div className="flex justify-start items-start flex-col">
       <div className="flex justify-center items-center mb-6">
        <img src="/auth-logo.png" className="h-6 w-auto" alt="Logo" />
       </div>
       <h2 className="text-2xl font-semibold text-foreground">
        {show2fa ? (twoFactorMethod === 'EMAIL' ? 'Email OTP Verification' : 'Two-Factor Authentication') : 'Welcome back'}
       </h2>
       <p className="mt-2 text-sm text-muted-foreground mb-6 text-left">
        {show2fa ? (
         twoFactorMethod === 'EMAIL' 
          ? 'A 6-digit one-time code has been sent to your email. Enter it below to access your account.' 
          : 'Enter the 6-digit code from your authenticator app (Google Authenticator / Authy) to continue.'
        ) : (
         'Enter your Login details to access your dashboard'
        )}
       </p>
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
        className="w-full flex justify-center items-center mt-2 py-3 px-4 rounded-xl text-white font-medium bg-[#018752] hover:bg-[#017044] transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
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
       <div className={`p-4 rounded-xl border flex items-start gap-3 mb-2 ${twoFactorMethod === 'EMAIL' ? 'bg-sky-50 border-sky-200 text-sky-900' : 'bg-[#E8F5EE] border-[#018752]/20 text-[#018752]'}`}>
        {twoFactorMethod === 'EMAIL' ? (
         <Mail className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
        ) : (
         <ShieldCheck className="w-5 h-5 text-[#018752] shrink-0 mt-0.5" />
        )}
        <div className="text-xs leading-relaxed">
         {twoFactorMethod === 'EMAIL' ? (
          <span><strong>Email OTP Required:</strong> Check your email inbox and spam folder for the one-time code.</span>
         ) : (
          <span><strong>Authenticator Code:</strong> Open Google Authenticator, Microsoft Authenticator or Authy.</span>
         )}
        </div>
       </div>

       {verifyError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
         {verifyError}
        </div>
       )}

       <div className="space-y-2.5 pt-1">
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
         {twoFactorMethod === 'EMAIL' ? 'Enter 6-Digit Email Code' : 'Enter 6-Digit Authenticator Code'}
        </label>
        <OtpInput
         value={token2fa}
         onChange={setToken2fa}
         autoFocus
        />
       </div>

       <button 
        disabled={loading || token2fa.length < 6} 
        type="submit" 
        className="w-full flex justify-center items-center mt-2 py-3 px-4 rounded-xl text-white font-medium bg-[#018752] hover:bg-[#017044] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
       >
        {loading && (
         <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
         </svg>
        )}
        {loading ? 'Verifying...' : 'Verify Code'}
       </button>

       <div className="text-center mt-4 pt-2">
        <button 
         type="button" 
         onClick={() => { setShow2fa(false); setToken2fa(''); setVerifyError(null); }} 
         className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
        >
         <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
        </button>
       </div>
      </form>
     )}

     {!show2fa && (
      <div className="mt-6 text-sm text-muted-foreground">
       Forgot password? <Link href="/forgot-password" className="text-[#018752] hover:underline font-medium">Reset password</Link>
      </div>
     )}
    </div>
   </div>
  </div>
 );
}
