"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/app/composables/useToast';
import AuthInput from '@/app/components/Auth/Input';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { addToast } = useToast();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const hasMinLength = useMemo(() => password.length >= 8, [password]);
  const hasUpper = useMemo(() => /[A-Z]/.test(password), [password]);
  const hasLower = useMemo(() => /[a-z]/.test(password), [password]);
  const hasNumber = useMemo(() => /[0-9]/.test(password), [password]);
  const hasSymbol = useMemo(() => /[^A-Za-z0-9]/.test(password), [password]);

  const getPillClass = (isValid: boolean) => {
    if (isValid) {
      return 'px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-medium rounded-full transition-colors';
    }
    return 'px-2.5 py-1 bg-slate-50 text-slate-500 text-[11px] font-medium rounded-full transition-colors';
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      addToast("Passwords do not match", 'error');
      return;
    }
    router.push('/password-reset-success');
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-[420px] w-full">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
          {/* Logo placeholder */}
          <div className="mx-auto rounded-lg flex items-center justify-center mb-6">
            <img src="/logo.png" className="h-8 w-auto" alt="Logo" />
          </div>
          
          <h2 className="text-2xl font-semibold text-slate-900 text-left">Create a new password</h2>
          <p className="mt-2 text-sm text-slate-500 text-left mb-6">Choose a new password for name@moneyfieldmfb.com</p>

          <form className="space-y-4 text-left" onSubmit={handleReset}>
            <AuthInput
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              label="New password"
              type="password"
              placeholder="!@#$%^&*(password)"
              required
            />
            <AuthInput
              value={confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
              label="Confirm new password"
              type="password"
              placeholder="!@#$%^&*(password)"
              required
            />
            
            <div className="flex flex-wrap gap-2 mt-4">
              <span className={getPillClass(hasMinLength)}>At least 8 characters</span>
              <span className={getPillClass(hasUpper)}>One uppercase letter</span>
              <span className={getPillClass(hasLower)}>One lowercase letter</span>
              <span className={getPillClass(hasNumber)}>One number</span>
              <span className={getPillClass(hasSymbol)}>One symbol</span>
            </div>
            
            <button type="submit" className="w-full mt-6 py-3 px-4 rounded-xl text-white font-medium bg-emerald-500 hover:bg-emerald-600 transition-colors">
              Reset password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
