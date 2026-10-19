"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/app/composables/useToast';

function InviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();

  const tokenParam = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';

  const [token, setToken] = useState(tokenParam);
  const [email, setEmail] = useState(emailParam);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (tokenParam) {
      setToken(tokenParam);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('public_sector_invite_token', tokenParam);
      }
    }
    if (emailParam) {
      setEmail(emailParam);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('public_sector_invite_email', emailParam);
      }
    }
  }, [tokenParam, emailParam]);

  const handleAccept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      addToast('Invalid or missing invitation token. Please check your invitation email.', 'error');
      return;
    }
    setIsSubmitting(true);
    const query = new URLSearchParams();
    query.set('token', token);
    if (email) query.set('email', email);
    router.push(`/setup-account?${query.toString()}`);
  };

  const handleDecline = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('public_sector_invite_token');
      sessionStorage.removeItem('public_sector_invite_email');
    }
    router.push('/login');
  };

  return (
    <div className="bg-card p-8 rounded-2xl border border-border/50 text-center shadow-sm">
      <div className="flex justify-start items-start flex-col">
        <div className="rounded-lg flex items-center justify-center mb-6">
          <img src="/auth-logo.png" className="h-8 w-auto" alt="Logo" />
        </div>
        <h2 className="text-xl font-semibold text-foreground text-left">
          You&apos;ve been invited.
        </h2>
        <p className="mt-2 text-sm text-muted-foreground text-left mb-6">
          You have been invited to join Moneyfield Public Sector Admin Portal.
        </p>
      </div>

      {!token && (
        <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs text-left">
          Notice: No invitation token was detected in the URL. Please verify you clicked the complete link from your invitation email.
        </div>
      )}

      <form className="space-y-4 text-left" onSubmit={handleAccept}>
        {email ? (
          <div className="bg-muted/30 border border-border rounded-xl px-4 py-3 text-[15px] font-medium text-foreground/90">
            {email}
          </div>
        ) : (
          <div className="bg-muted/30 border border-border rounded-xl px-4 py-3 text-xs font-mono text-muted-foreground truncate">
            {token ? `Token: ${token.slice(0, 12)}...` : 'Invitation link verified'}
          </div>
        )}

        <button
          type="submit"
          disabled={!token || isSubmitting}
          className="w-full mt-2 py-3 px-4 rounded-xl text-white font-medium bg-[#018752] hover:bg-[#018752]/90 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Continuing...' : 'Accept Invitation'}
        </button>
      </form>

      <div className="mt-6 text-sm text-muted-foreground">
        Not interested in joining?{' '}
        <button
          type="button"
          onClick={handleDecline}
          className="text-red-500 hover:underline font-medium cursor-pointer"
        >
          Decline invitation
        </button>
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-[400px] w-full">
        <Suspense fallback={<div className="text-center p-8 text-sm text-muted-foreground">Loading...</div>}>
          <InviteForm />
        </Suspense>
      </div>
    </div>
  );
}
