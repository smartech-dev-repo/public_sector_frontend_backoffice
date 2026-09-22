"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/composables/core/useAuth';
import AuthInput from '@/app/components/Auth/Input';

export default function LoginPage() {
  const router = useRouter();
  const { adminLogin, loading, error } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminLogin({ email, password });
      router.push('/dashboard/broadsheet');
    } catch (err) {
      // Error is handled in composable, can also show a toast here
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-[400px] w-full">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
          {/* Logo placeholder */}
          <div className="mx-auto rounded-lg flex items-center justify-center mb-6">
            <img src="/logo.png" className="h-6 w-auto" alt="Logo" />
          </div>
          
          <h2 className="text-2xl font-semibold text-slate-900">Welcome back</h2>
          <p className="mt-2 text-sm text-slate-500 mb-8">Enter your Login details to access your dashboard</p>

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

          <div className="mt-6 text-sm text-slate-600">
            Forgot password? <Link href="/forgot-password" className="text-emerald-600 hover:underline font-medium">Reset password</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
