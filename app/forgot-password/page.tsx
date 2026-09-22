"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthInput from '@/app/components/Auth/Input';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/check-email');
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-[400px] w-full">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
          {/* Logo placeholder */}
          <div className="mx-auto rounded-lg flex items-center justify-center mb-6">
            <img src="/logo.png" className="h-8 w-auto" alt="Logo" />
          </div>
          
          <h2 className="text-2xl font-semibold text-slate-900 text-left">Forgot password</h2>
          <p className="mt-2 text-sm text-slate-500 text-left mb-6">Enter your email address and we&apos;ll send you a link to reset your password.</p>

          <form className="space-y-4 text-left" onSubmit={handleReset}>
            <AuthInput
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              label="Enter your email"
              type="email"
              placeholder="example@mmfb.com"
              required
            />
            
            <button type="submit" className="w-full mt-2 py-3 px-4 rounded-xl text-white font-medium bg-emerald-500 hover:bg-emerald-600 transition-colors">
              Reset password
            </button>
          </form>

          <div className="mt-6 text-sm text-slate-600">
            <Link href="/login" className="text-emerald-600 hover:underline font-medium">Back to sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
