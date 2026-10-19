"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/app/composables/core/useAuth';
import { createPortal } from 'react-dom';
import { useToast } from '@/app/composables/useToast';

// 30 minutes of real inactivity before timing out
const INACTIVITY_TIMEOUT = 30 * 60 * 1000;
// 2 minutes warning before forced logout
const WARNING_BEFORE_LOGOUT = 2 * 60 * 1000;

export default function SessionManager() {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, adminLogin, refreshToken, loginVerify2fa } = useAuth();
  const { addToast } = useToast();

  const [showWarning, setShowWarning] = useState(false);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const [userEmail, setUserEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);

  // 2FA state for timeout re-login
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [twoFactorMethod, setTwoFactorMethod] = useState<'TOTP' | 'EMAIL'>('TOTP');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [pendingToken, setPendingToken] = useState('');

  // Track last activity (mouse, keyboard, touch, scroll)
  const [lastActivity, setLastActivity] = useState(Date.now());
  const isRefreshingRef = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('public_sector_user_email');
      if (stored) setUserEmail(stored);
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

  const handleActivity = useCallback(() => {
    setLastActivity(Date.now());
  }, []);

  useEffect(() => {
    if (pathname.startsWith('/login') || pathname.startsWith('/forgot-password') || pathname.startsWith('/accept-invite') || pathname.startsWith('/setup-account')) {
      return;
    }

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, handleActivity));

    const checkSession = setInterval(() => {
      if (isTimedOut) return;

      const { expiry, email } = getTokenInfo();
      if (email && !userEmail) {
        setUserEmail(email);
      }

      const now = Date.now();
      const timeSinceActivity = now - lastActivity;

      // 1. Silent token refresh when user is actively interacting
      // If user was active recently (last 10 minutes) and token is within 3 minutes of expiry, refresh it!
      if (expiry) {
        const tokenTimeRemaining = expiry - now;
        const isUserActive = timeSinceActivity < 10 * 60 * 1000;
        if (isUserActive && tokenTimeRemaining > 0 && tokenTimeRemaining <= 3 * 60 * 1000 && !isRefreshingRef.current) {
          isRefreshingRef.current = true;
          refreshToken()
            .then((res) => {
              isRefreshingRef.current = false;
              if (res) {
                setLastActivity(Date.now());
              }
            })
            .catch(() => {
              isRefreshingRef.current = false;
            });
        }
      }

      // 2. Inactivity check: evaluate time remaining based on real user activity
      const inactivityRemaining = (lastActivity + INACTIVITY_TIMEOUT) - now;
      let effectiveTimeRemaining = inactivityRemaining;

      // If token has an absolute expiry and user has been completely idle, respect the lower of the two
      if (expiry) {
        const tokenRemaining = expiry - now;
        effectiveTimeRemaining = Math.min(inactivityRemaining, tokenRemaining);
      }

      if (effectiveTimeRemaining <= 0) {
        const savedEmail = typeof localStorage !== 'undefined' ? localStorage.getItem('public_sector_user_email') || '' : '';
        if (savedEmail && !userEmail) {
          setUserEmail(savedEmail);
        }
        setIsTimedOut(true);
        setShowWarning(false);
        logout();
      } else if (effectiveTimeRemaining <= WARNING_BEFORE_LOGOUT) {
        setShowWarning(true);
        setCountdown(Math.ceil(effectiveTimeRemaining / 1000));
      } else {
        setShowWarning(false);
      }
    }, 1000);

    return () => {
      events.forEach(e => window.removeEventListener(e, handleActivity));
      clearInterval(checkSession);
    };
  }, [pathname, lastActivity, handleActivity, logout, isTimedOut, userEmail, getTokenInfo, refreshToken]);

  const handleKeepLoggedIn = async () => {
    setShowWarning(false);
    setLastActivity(Date.now());
    // Try refreshing the token silently to extend the session
    try {
      const refreshed = await refreshToken();
      if (refreshed) {
        addToast('Session extended successfully', 'success');
        return;
      }
    } catch {}
    // If refresh token is unavailable, open re-login modal
    setIsTimedOut(true);
  };

  const handleReLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    const emailToUse = userEmail.trim() || (typeof localStorage !== 'undefined' ? localStorage.getItem('public_sector_user_email') || '' : '');
    if (!emailToUse) {
      addToast('Please enter your email address to sign in.', 'error');
      return;
    }
    setLoggingIn(true);
    try {
      const res: any = await adminLogin({ email: emailToUse, password });
      if (res?.twoFactorRequired || res?.data?.twoFactorRequired || res?.requires2fa) {
        const data = res?.twoFactorRequired ? res : (res?.data || {});
        setTwoFactorMethod(data.method === 'EMAIL' ? 'EMAIL' : 'TOTP');
        setPendingToken(data.pendingToken || '');
        setShowTwoFactor(true);
        addToast('Please enter your verification code', 'info');
      } else {
        setIsTimedOut(false);
        setPassword('');
        setShowTwoFactor(false);
        setTwoFactorCode('');
        setLastActivity(Date.now());
        addToast('Welcome back!', 'success');
      }
    } catch (err: any) {
      addToast(err?.response?.data?.message || 'Invalid email or password. Please try again.', 'error');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleVerify2faOnTimeout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFactorCode.trim()) return;
    setLoggingIn(true);
    try {
      await loginVerify2fa({ pendingToken, code: twoFactorCode.trim() });
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin_2fa_enabled', 'true');
      }
      setIsTimedOut(false);
      setPassword('');
      setShowTwoFactor(false);
      setTwoFactorCode('');
      setLastActivity(Date.now());
      addToast('Welcome back!', 'success');
    } catch (err: any) {
      addToast(err?.response?.data?.message || 'Invalid verification code. Please try again.', 'error');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleFullLogout = () => {
    logout();
    setIsTimedOut(false);
    setShowTwoFactor(false);
    setPassword('');
    router.push('/login');
  };

  if ((!showWarning && !isTimedOut) || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="fixed inset-0 bg-white/40 backdrop-blur-md dark:bg-slate-900/40"></div>

      {isTimedOut ? (
        <div className="relative bg-card rounded-2xl border border-border p-8 w-full max-w-md mx-4 animate-in fade-in zoom-in-95 duration-200 shadow-xl">
          <div className="text-center mb-6">
            <div className="rounded-lg flex items-center justify-start mb-6">
              <img src="/auth-logo.png" className="h-8 w-auto dark:invert" alt="Logo" />
            </div>
            <h2 className="text-xl text-start font-bold text-foreground">Session Timed Out</h2>
            <p className="text-sm text-start text-muted-foreground mt-2">
              Your session has expired due to inactivity. Please sign in again to continue your work seamlessly.
            </p>
          </div>

          {!showTwoFactor ? (
            <form onSubmit={handleReLogin} className="space-y-5">
              <div className="space-y-1.5 text-left relative">
                <label className="text-xs font-bold text-foreground/90">Email Address</label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="admin@publicsector.io"
                  required
                  className="w-full px-4 py-2.5 text-sm font-medium bg-card text-foreground border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#018752]/20 focus:border-[#018752] transition-colors"
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
                  className="flex-1 py-3 rounded-full text-sm font-medium text-white bg-[#018752] hover:bg-[#018752]/90 transition-colors disabled:opacity-50 shadow-sm"
                >
                  {loggingIn ? 'Signing in...' : 'Sign in'}
                </button>
              </div>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={handleFullLogout}
                  className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  Return to Login Page
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerify2faOnTimeout} className="space-y-5">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-foreground/90">
                  {twoFactorMethod === 'EMAIL' ? 'Enter Email Verification Code' : 'Enter Authenticator (TOTP) Code'}
                </label>
                <input
                  type="text"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  placeholder="e.g. 123456"
                  maxLength={8}
                  required
                  autoFocus
                  className="w-full px-4 py-2.5 text-center tracking-widest text-lg font-mono bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#018752]/20 focus:border-[#018752] transition-colors"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  {twoFactorMethod === 'EMAIL'
                    ? 'Check your email inbox for the single-use verification code.'
                    : 'Open Google Authenticator or your 2FA app to view your current 6-digit code.'}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTwoFactor(false)}
                  className="flex-1 py-3 rounded-full text-sm font-medium text-foreground/90 bg-card border border-border hover:bg-muted/30 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loggingIn || !twoFactorCode.trim()}
                  className="flex-1 py-3 rounded-full text-sm font-medium text-white bg-[#018752] hover:bg-[#018752]/90 transition-colors disabled:opacity-50 shadow-sm"
                >
                  {loggingIn ? 'Verifying...' : 'Verify & Continue'}
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-md mx-4 animate-in fade-in zoom-in-95 duration-200 shadow-xl">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-950/40 mb-4">
              <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Session Expiring Soon</h3>
            <p className="text-sm text-muted-foreground mb-6">
              You will be signed out in <span className="font-bold text-amber-600">{countdown} seconds</span> due to inactivity.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleFullLogout}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-foreground/90 bg-muted/50 hover:bg-muted transition-colors"
              >
                Logout Now
              </button>
              <button
                onClick={handleKeepLoggedIn}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
              >
                Keep Working
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
