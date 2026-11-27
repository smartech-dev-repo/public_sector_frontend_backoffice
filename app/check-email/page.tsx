"use client";

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/app/composables/useToast';
import Toast from '@/app/components/ui/Toast';
import { auth_api } from '@/app/api_factory/modules/auth';

function CheckEmailContent() {
  const { addToast } = useToast();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || 'your email';
  const [isResending, setIsResending] = useState(false);

  const handleResend = async () => {
    if (email === 'your email') {
      addToast("Password reset link has been resent.", 'success');
      return;
    }
    setIsResending(true);
    try {
      await auth_api.forgotPassword({ email });
      addToast("Password reset link has been resent.", 'success');
    } catch {
      addToast("Failed to resend reset link. Please try again.", 'error');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="bg-card p-8 rounded-2xl border border-border/50 text-center">
      <div className="mx-auto rounded-lg flex items-center justify-center mb-6">
        <img src="/logo.png" className="h-8 w-auto" alt="Logo" />
      </div>
      
      <h2 className="text-xl font-semibold text-foreground text-left">Check your email</h2>
      <p className="mt-2 text-[13px] text-muted-foreground text-left">
        You&apos;ve been sent a password reset link to <span className="text-[#018752] font-medium">{email}</span>.
      </p>
      <p className="mt-1 text-[13px] text-muted-foreground text-left mb-6">
        Follow the link in the email to reset your password.
      </p>

      <Link href="/login" className="w-full mt-2 py-3 px-4 rounded-xl text-white font-medium bg-[#018752] hover:bg-[#016f43] transition-colors block text-center">
        Back to sign in
      </Link>

      <div className="mt-6 text-[13px] text-muted-foreground">
        Didn&apos;t get the email?{' '}
        <button 
          onClick={handleResend} 
          disabled={isResending} 
          className="text-[#018752] hover:underline font-medium disabled:opacity-50"
        >
          {isResending ? 'Resending...' : 'Resend link'}
        </button>
      </div>
    </div>
  );
}

export default function CheckEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <Toast />
      <div className="max-w-[400px] w-full">
        <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Loading...</div>}>
          <CheckEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
