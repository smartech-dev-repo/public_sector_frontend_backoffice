"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/app/composables/core/useAuth';
import { useTheme } from 'next-themes';
import { createPortal } from 'react-dom';
import { useToast } from '@/app/composables/useToast';

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const WARNING_BEFORE_LOGOUT = 60 * 1000; // 1 minute warning

export default function SessionManager() {
 const router = useRouter();
 const { setTheme } = useTheme();
 const pathname = usePathname();
 const { fetchAdminProfile, logout, adminLogin } = useAuth();
 const { addToast } = useToast();
 
 const [showWarning, setShowWarning] = useState(false);
 const [isTimedOut, setIsTimedOut] = useState(false);
 const [countdown, setCountdown] = useState(0);
 
 const [userEmail, setUserEmail] = useState('');
 
 useEffect(() => {
  if (typeof window !== 'undefined') {
   setUserEmail(localStorage.getItem('public_sector_user_email') || '');
  }
 }, []);
 
 const [password, setPassword] = useState('');
 const [showPassword, setShowPassword] = useState(false);
 const [loggingIn, setLoggingIn] = useState(false);

 // Track last activity for fallback if JWT doesn't exist
 const [lastActivity, setLastActivity] = useState(Date.now());

 const getTokenInfo = useCallback(() => {
  try {
   const match = typeof document !== 'undefined' ? document.cookie.match(new RegExp('(^| )public_sector_token=([^;]+)')) : null;
   const token = match ? decodeURIComponent(match[2]) : (typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null);
   if (!token) return { expiry: null, email: '' };
   
   const payload = JSON.parse(atob(token.split('.')[1]));
   let expiry = null;
   if (payload && payload.exp) {
    expiry = payload.exp * 1000;
   }
   let email = payload?.email || payload?.user?.email || '';
   
   // Fallback to local storage if not in JWT
   if (!email && typeof localStorage !== 'undefined') {
    email = localStorage.getItem('public_sector_user_email') || '';
   }
   
   return { 
    expiry, 
    email 
   };
  } catch (e) {
   return { expiry: null, email: '' };
  }
 }, []);

 const handleActivity = useCallback(() => {
  setLastActivity(Date.now());
 }, []);

 useEffect(() => {
  if (pathname.startsWith('/login') || pathname.startsWith('/forgot-password')) {
   return;
  }

  const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
  events.forEach(e => window.addEventListener(e, handleActivity));

  const checkSession = setInterval(() => {
   // If already timed out, do not do anything
   if (isTimedOut) return;

   const { expiry, email } = getTokenInfo();
   if (email && !userEmail) {
    setUserEmail(email);
   }
   
   const now = Date.now();
   let timeRemaining = 0;
   
   if (expiry) {
    timeRemaining = expiry - now;
   } else {
    const activeTimeRemaining = (lastActivity + INACTIVITY_TIMEOUT) - now;
    timeRemaining = activeTimeRemaining;
   }

   if (timeRemaining <= 0) {
    // Capture email from localStorage BEFORE logout clears anything
    const savedEmail = typeof localStorage !== 'undefined' ? localStorage.getItem('public_sector_user_email') || '' : '';
    if (savedEmail && !userEmail) {
     setUserEmail(savedEmail);
    }
    setIsTimedOut(true);
    setShowWarning(false);
    logout(); // clear tokens behind the scenes so API requests fail properly if any go out
   } else if (timeRemaining <= WARNING_BEFORE_LOGOUT) {
    setShowWarning(true);
    setCountdown(Math.ceil(timeRemaining / 1000));
   } else {
    setShowWarning(false);
   }
  }, 1000);

  return () => {
   events.forEach(e => window.removeEventListener(e, handleActivity));
   clearInterval(checkSession);
  };
 }, [pathname, lastActivity, handleActivity, logout, router, isTimedOut, userEmail, getTokenInfo]);

 const handleKeepLoggedIn = () => {
  // The user requested to call the login endpoint instead of /admin/me.
  // To call login, we must prompt for password. Transition to the login modal.
  setShowWarning(false);
  setIsTimedOut(true);
 };

 const handleReLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!password) return;
  // Get email - prefer state, fallback to localStorage
  const emailToUse = userEmail || (typeof localStorage !== 'undefined' ? localStorage.getItem('public_sector_user_email') || '' : '');
  if (!emailToUse) {
   addToast('Email not found. Please log in from the login page.', 'error');
   return;
  }
  setLoggingIn(true);
  try {
   await adminLogin({ email: emailToUse, password });
    setTheme('light');
   setIsTimedOut(false);
   setPassword('');
   setLastActivity(Date.now());
   addToast('Welcome back!', 'success');
   // Token is re-established, session resumes seamlessly
  } catch (err: any) {
   addToast(err?.response?.data?.message || 'Invalid password. Please try again.', 'error');
  } finally {
   setLoggingIn(false);
  }
 };

 const handleFullLogout = () => {
  logout();
  router.push('/login');
  setIsTimedOut(false);
 };

 if ((!showWarning && !isTimedOut) || typeof document === 'undefined') return null;

 return createPortal(
  <div className="fixed inset-0 z-[200] flex items-center justify-center">
   <div className="fixed inset-0 bg-white/40 backdrop-blur-md dark:bg-slate-900/40"></div>
   
   {isTimedOut ? (
    <div className="relative bg-card rounded-2xl border p-8 w-full max-w-md mx-4 animate-in fade-in zoom-in-95 duration-200">
     <div className="text-center mb-6">
            <div className="rounded-lg flex items-center justify-start mb-6">
     <img src="/auth-logo.png" className="h-8 w-auto" alt="Logo" />
    </div>
      {/* <h4 className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mb-3">Public Sector Admin</h4> */}
      <h2 className="text-xl text-start font-bold text-foreground">Session Timed Out</h2>
      <p className="text-sm text-start text-muted-foreground mt-2">
       Your session has expired due to inactivity. Please sign in again to continue.
      </p>
     </div>
     
     <form onSubmit={handleReLogin} className="space-y-6">
      <div className="space-y-1.5 text-left relative">
       <label className="text-xs font-bold text-foreground/90">Email Address</label>
       <input
        type="email"
        value={userEmail}
        readOnly
        placeholder="admin@publicsector.io"
        className="w-full px-4 py-2.5 text-sm font-medium bg-muted/30 text-muted-foreground border border-border rounded-xl cursor-not-allowed focus:outline-none"
       />
      </div>
      
      <div className="space-y-1.5 text-left relative">
       <label className="text-xs font-bold text-foreground/90">Password</label>
       <div className="relative">
        <input
         type={showPassword ? 'text' : 'password'}
         value={password}
         onChange={(e) => setPassword(e.target.value)}
         placeholder="••••••••••••"
         className="w-full px-4 py-2.5 text-sm font-medium bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#018752]/20 focus:border-[#018752] transition-colors pr-10"
         required
        />
        <button
         type="button"
         onClick={() => setShowPassword(!showPassword)}
         className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-muted-foreground"
        >
         {showPassword ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
         ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
         )}
        </button>
       </div>
      </div>
      
      <div className="flex items-center gap-3 pt-2">
       <button
        type="button"
        onClick={handleFullLogout}
        className="flex-1 py-3 rounded-full text-sm font-medium text-foreground/90 bg-card border border-border hover:bg-muted/30 transition-colors"
       >
        Sign Out
       </button>
       <button
        type="submit"
        disabled={loggingIn || !password}
        className="flex-1 py-3 rounded-full text-sm font-medium text-white bg-[#018752] hover:bg-[#018752]/90 transition-colors disabled:opacity-50"
       >
        {loggingIn ? 'Signing in...' : 'Sign in'}
       </button>
      </div>
      
      <div className="text-center pt-2">
       <button 
        type="button"
        onClick={handleFullLogout}
        className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline"
       >
        Return to Login Page
       </button>
      </div>
     </form>
    </div>
   ) : (
    <div className="relative bg-card border rounded-2xl p-6 w-full max-w-md mx-4 animate-in fade-in zoom-in-95 duration-200">
     <div className="text-center">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 mb-4">
       <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
       </svg>
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">Session Expiring Soon</h3>
      <p className="text-sm text-muted-foreground mb-6">
       You will be logged out in <span className="font-bold text-amber-600">{countdown} seconds</span> due to inactivity or token expiration.
      </p>
      <div className="flex gap-3 justify-center">
       <button 
        onClick={handleFullLogout}
        className="px-5 py-2.5 rounded-xl text-sm font-medium text-foreground/90 bg-muted/50 hover:bg-slate-200 transition-colors"
       >
        Logout Now
       </button>
       <button 
        onClick={handleKeepLoggedIn}
        className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
       >
        Don't log out
       </button>
      </div>
     </div>
    </div>
   )}
  </div>,
  document.body
 );
}
