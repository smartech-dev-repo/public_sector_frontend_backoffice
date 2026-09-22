"use client";

import Link from 'next/link';
import { useToast } from '@/app/composables/useToast';
import Toast from '@/app/components/ui/Toast'; // Just in case it's not wrapped in a layout

export default function CheckEmailPage() {
  const { addToast } = useToast();

  const handleResend = () => {
    // Mock resend action
    addToast("Password reset link has been resent.", 'success');
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <Toast />
      <div className="max-w-[400px] w-full">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
          {/* Logo placeholder */}
          <div className="mx-auto rounded-lg flex items-center justify-center mb-6">
            <img src="/logo.png" className="h-8 w-auto" alt="Logo" />
          </div>
          
          <h2 className="text-xl font-semibold text-slate-900 text-left">Check your email</h2>
          <p className="mt-2 text-[13px] text-slate-500 text-left">
            You&apos;ve been sent a password reset link to <Link href="/reset-password" className="text-emerald-600 font-medium">name@moneyfieldmfb.com</Link>.
          </p>
          <p className="mt-1 text-[13px] text-slate-500 text-left mb-6">
            Follow the link in the email to reset your password.
          </p>

          <Link href="/login" className="w-full mt-2 py-3 px-4 rounded-xl text-white font-medium bg-emerald-500 hover:bg-emerald-600 transition-colors block text-center">
            Back to sign in
          </Link>

          <div className="mt-6 text-[13px] text-slate-600">
            Didn&apos;t get the email? <button onClick={handleResend} className="text-emerald-600 hover:underline font-medium">Resend link</button>
          </div>
        </div>
      </div>
    </div>
  );
}
