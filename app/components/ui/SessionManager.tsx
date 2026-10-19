"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/app/composables/core/useAuth';
import { auth_api } from '@/app/api_factory/modules/auth';
import { createPortal } from 'react-dom';
import { useToast } from '@/app/composables/useToast';
import OtpInput from '@/app/components/ui/OtpInput';
import { Mail, ShieldCheck, ArrowLeft, AlertCircle } from 'lucide-react';

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes of real inactivity
const WARNING_BEFORE_LOGOUT = 60 * 1000; // 1 minute warning
const TOKEN_REFRESH_THRESHOLD = 3 * 60 * 1000; // Refresh token when 3 minutes remaining and user is active

export default function SessionManager() {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, adminLogin, loginVerify2fa } = useAuth();
  const { addToast } = useToast();

  const [showWarning, setShowWarning] = useState(false);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const [userEmail, setUserEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [reLoginError, setReLoginError] = useState<string | null>(null);

  // 2FA state for timeout modal
  const [show2fa, setShow2fa] = useState(false);
  const [twoFactorMethod, setTwoFactorMethod] = useState<'TOTP' | 'EMAIL'>('TOTP');
  const [pendingToken, setPendingToken] = useState('');
  const [token2fa, setToken2fa] = useState('');

  // Track last real activity
  const [lastActivity, setLastActivity] = useState(Date.now());
  const isRefreshingRef = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem('public_sector_user_email');
      if (email) setUserEmail(email);
    }
  }, []);

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

      if (!email && typeof localStorage !== 'undefined') {
        email = localStorage.getItem('public_sector_user_email') || '';
      }

      return { expiry, email };
    } catch {
      return { expiry: null, email: '' };
    }
  }, []);

  const silentRefreshToken = useCallback(async () => {
    if (isRefreshingRef.current || typeof window === 'undefined') return;
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return;

    try {
      isRefreshingRef.current = true;
      const res: any = await auth_api.refreshToken({ refreshToken });
      const data = res?.data || {};
      const newAccessToken = data.accessToken || data.token || data.data?.accessToken;
      const newRefreshToken = data.refreshToken || data.data?.refreshToken;
      if (newAccessToken) {
        document.cookie = `public_sector_token=${encodeURIComponent(newAccessToken)}; path=/; max-age=31536000`;
        localStorage.setItem('token', newAccessToken);
      }
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }
    } catch {
      // Refresh token might have expired or is not configured; will prompt when inactivity expires
    } finally {
      isRefreshingRef.current = false;
    }
  }, []);

  const handleActivity = useCallback(() => {
    setLastActivity(Date.now());
  }, []);

  useEffect(() => {
    if (
      pathname.startsWith('/login') ||
      pathname.startsWith('/forgot-password') ||
      pathname.startsWith('/accept-invite')
    ) {
      return;
    }

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(e => window.addEventListener(e, handleActivity));

    const checkSession = setInterval(() => {
      if (isTimedOut) return;

      const now = Date.now();
      const inactivityRemaining = (lastActivity + INACTIVITY_TIMEOUT) - now;
      const { expiry, email } = getTokenInfo();

      if (email && !userEmail) {
        setUserEmail(email);
      }

      // If user is actively using the system and accessToken is getting close to expiring, silently refresh it
      if (expiry && (expiry - now) < TOKEN_REFRESH_THRESHOLD && inactivityRemaining > WARNING_BEFORE_LOGOUT) {
        silentRefreshToken();
      }

      if (inactivityRemaining <= 0) {
        const savedEmail = typeof localStorage !== 'undefined' ? localStorage.getItem('public_sector_user_email') || '' : '';
        if (savedEmail && !userEmail) {
          setUserEmail(savedEmail);
        }
        setIsTimedOut(true);
        setShowWarning(false);
      } else if (inactivityRemaining <= WARNING_BEFORE_LOGOUT) {
        setShowWarning(true);
        setCountdown(Math.ceil(inactivityRemaining / 1000));
      } else {
        setShowWarning(false);
      }
    }, 1000);

    return () => {
      events.forEach(e => window.removeEventListener(e, handleActivity));
      clearInterval(checkSession);
    };
  }, [pathname, lastActivity, handleActivity, isTimedOut, userEmail, getTokenInfo, silentRefreshToken]);

  const handleKeepLoggedIn = () => {
    setLastActivity(Date.now());
    setShowWarning(false);
    silentRefreshToken();
  };

  const handleReLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setReLoginError(null);
    const emailToUse = userEmail.trim() || (typeof localStorage !== 'undefined' ? localStorage.getItem('public_sector_user_email') || '' : '');
    if (!emailToUse) {
      setReLoginError('Email address is required. Please type your email.');
      return;
    }
    if (!password) {
      setReLoginError('Password is required.');
      return;
    }

    setLoggingIn(true);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('public_sector_user_email', emailToUse);
      }
      const res: any = await adminLogin({ email: emailToUse, password });
      if (res?.twoFactorRequired || res?.data?.twoFactorRequired || res?.requires2fa) {
        const data = res?.twoFactorRequired ? res : (res?.data || {});
        setTwoFactorMethod(data.method === 'EMAIL' ? 'EMAIL' : 'TOTP');
        setPendingToken(data.pendingToken || '');
        setShow2fa(true);
      } else {
        setIsTimedOut(false);
        setPassword('');
        setShow2fa(false);
        setLastActivity(Date.now());
        silentRefreshToken();
        addToast('Welcome back! Session restored.', 'success');
      }
    } catch (err: any) {
      if (err?.response?.data?.twoFactorRequired || err?.response?.data?.message?.toLowerCase().includes('two-factor')) {
        const data = err?.response?.data || {};
        setTwoFactorMethod(data.method === 'EMAIL' ? 'EMAIL' : 'TOTP');
        setPendingToken(data.pendingToken || '');
        setShow2fa(true);
      } else {
        setReLoginError(err?.response?.data?.message || err?.message || 'Invalid password. Please try again.');
      }
    } finally {
      setLoggingIn(false);
    }
  };

  const handleVerify2fa = async (e: React.FormEvent) => {
    e.preventDefault();
    setReLoginError(null);
    if (!token2fa || token2fa.length < 6) return;

    setLoggingIn(true);
    try {
      await loginVerify2fa({ pendingToken, code: token2fa });
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin_2fa_enabled', 'true');
      }
      setIsTimedOut(false);
      setShow2fa(false);
      setPassword('');
      setToken2fa('');
      setLastActivity(Date.now());
      addToast('Welcome back! Session restored.', 'success');
    } catch (err: any) {
      setReLoginError(err?.response?.data?.message || err?.message || 'Invalid verification code. Please try again.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleFullLogout = () => {
    if (typeof window !== 'undefined') {
      document.cookie = 'public_sector_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
    logout();
    setIsTimedOut(false);
    setShowWarning(false);
    setShow2fa(false);
    setPassword('');
    setToken2fa('');
    router.push('/login');
  };

  if ((!showWarning && !isTimedOut) || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-md dark:bg-black/60"></div>

      {isTimedOut ? (
        <div className="relative bg-card rounded-2xl border border-border p-6 sm:p-8 w-full max-w-md mx-auto animate-in fade-in zoom-in-95 duration-200 shadow-2xl">
          <div className="text-left mb-6">
            <div className="flex items-center justify-start mb-4">
              <img src="/auth-logo.png" className="h-7 w-auto" alt="Logo" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              {show2fa ? (twoFactorMethod === 'EMAIL' ? 'Email OTP Verification' : 'Two-Factor Authentication') : 'Session Timed Out'}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1.5">
              {show2fa
                ? (twoFactorMethod === 'EMAIL'
                    ? 'Enter the 6-digit one-time code sent to your email to restore your session.'
                    : 'Enter the 6-digit code from your authenticator app to restore your session.')
                : 'Your session has expired due to inactivity. Sign in below to resume your work without losing context.'}
            </p>
          </div>

          {reLoginError && (
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs text-rose-700 dark:text-rose-400 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{reLoginError}</span>
            </div>
          )}

          {!show2fa ? (
            <form onSubmit={handleReLogin} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Email Address</label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  className="w-full px-4 py-2.5 text-sm bg-muted/40 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-[#018752]/20 focus:border-[#018752]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    autoFocus
                    className="w-full px-4 py-2.5 text-sm bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-[#018752]/20 focus:border-[#018752] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
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
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-foreground bg-muted hover:bg-muted/80 transition-colors"
                >
                  Sign Out
                </button>
                <button
                  type="submit"
                  disabled={loggingIn || !password}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-[#018752] hover:bg-[#018752]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loggingIn ? 'Signing in...' : 'Sign in'}
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleFullLogout}
                  className="text-xs font-medium text-[#018752] hover:underline"
                >
                  Return to Login Page
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerify2fa} className="space-y-4 text-left">
              <div className={`p-3 rounded-xl border flex items-start gap-3 ${twoFactorMethod === 'EMAIL' ? 'bg-sky-50 dark:bg-sky-950/20 border-sky-200 dark:border-sky-800 text-sky-900 dark:text-sky-300' : 'bg-[#E8F5EE] dark:bg-emerald-950/20 border-[#018752]/20 dark:border-emerald-800 text-[#018752] dark:text-emerald-400'}`}>
                {twoFactorMethod === 'EMAIL' ? (
                  <Mail className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-[#018752] shrink-0 mt-0.5" />
                )}
                <div className="text-xs leading-relaxed">
                  {twoFactorMethod === 'EMAIL' ? (
                    <span><strong>Email OTP:</strong> Check your inbox for the one-time code.</span>
                  ) : (
                    <span><strong>Authenticator App:</strong> Enter the 6-digit code to continue.</span>
                  )}
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <OtpInput
                  value={token2fa}
                  onChange={setToken2fa}
                  autoFocus
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShow2fa(false); setToken2fa(''); setReLoginError(null); }}
                  className="px-4 py-2.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground bg-muted transition-colors flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <button
                  type="submit"
                  disabled={loggingIn || token2fa.length < 6}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-[#018752] hover:bg-[#018752]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loggingIn ? 'Verifying...' : 'Verify & Continue'}
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-md mx-auto animate-in fade-in zoom-in-95 duration-200 shadow-2xl">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-950/40 mb-4 border border-amber-200 dark:border-amber-800">
              <svg className="h-6 w-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1.5">Session Expiring Soon</h3>
            <p className="text-sm text-muted-foreground mb-6">
              You will be signed out in <span className="font-bold text-amber-600 dark:text-amber-400">{countdown} seconds</span> due to inactivity.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleFullLogout}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-foreground bg-muted hover:bg-muted/80 transition-colors"
              >
                Sign Out
              </button>
              <button
                onClick={handleKeepLoggedIn}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-[#018752] hover:bg-[#018752]/90 transition-colors shadow-sm"
              >
                Stay Logged In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
