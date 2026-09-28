"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/app/composables/core/useAuth';
import { createPortal } from 'react-dom';

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const WARNING_BEFORE_LOGOUT = 60 * 1000; // 1 minute warning

export default function SessionManager() {
  const router = useRouter();
  const pathname = usePathname();
  const { refreshSession, logout } = useAuth();
  
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  
  // Track last activity for fallback if JWT doesn't exist
  const [lastActivity, setLastActivity] = useState(Date.now());

  const getTokenExpiry = () => {
    try {
      const match = document.cookie.match(new RegExp('(^| )public_sector_token=([^;]+)'));
      const token = match ? decodeURIComponent(match[2]) : localStorage.getItem('token');
      if (!token) return null;
      
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload && payload.exp) {
        return payload.exp * 1000;
      }
    } catch (e) {
      return null;
    }
    return null;
  };

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
      const expiry = getTokenExpiry();
      const now = Date.now();
      
      let timeRemaining = 0;
      
      if (expiry) {
        timeRemaining = expiry - now;
      } else {
        // Fallback to inactivity timer
        const activeTimeRemaining = (lastActivity + INACTIVITY_TIMEOUT) - now;
        timeRemaining = activeTimeRemaining;
      }

      if (timeRemaining <= 0) {
        // Log out immediately
        clearInterval(checkSession);
        logout();
        router.push('/login');
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
  }, [pathname, lastActivity, handleActivity, logout, router]);

  const handleKeepLoggedIn = async () => {
    setRefreshing(true);
    try {
      await refreshSession();
      setLastActivity(Date.now()); // Reset inactivity
      setShowWarning(false);
    } catch (e) {
      console.error(e);
      // If refresh fails, force logout
      logout();
      router.push('/login');
    } finally {
      setRefreshing(false);
    }
  };

  if (!showWarning || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"></div>
      <div className="relative bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 mb-4">
            <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Session Expiring Soon</h3>
          <p className="text-sm text-slate-600 mb-6">
            You will be logged out in <span className="font-bold text-amber-600">{countdown} seconds</span> due to inactivity or token expiration.
          </p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={() => {
                logout();
                router.push('/login');
              }}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Logout Now
            </button>
            <button 
              onClick={handleKeepLoggedIn}
              disabled={refreshing}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {refreshing ? 'Refreshing...' : "Don't log out"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
